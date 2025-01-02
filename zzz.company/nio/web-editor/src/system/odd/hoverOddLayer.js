import {Cartesian3, Cesium3DTileFeature, defined, PrimitiveCollection, ScreenSpaceEventHandler} from 'cesium';
import {ODdLineStyle} from '../layer/style/layerStyle.js';
import {createViewer} from '../../cesium/initMap.js';
import axios from 'axios';
import store from '../../store/index.js';
import {NioMessage} from '../../utils/utils.js';
import {OddData} from './oddData/OddDataModel.js';
import {oddLayer} from './oddLayer.js';
import {OddLane} from './oddLane/OddLaneModel.js';
import {parseWKT} from '../../utils/wkt/parseWKT.js';
import {isPaneModeEqual, PanelOpenType, setPanelMode, oddPanelData} from './eventPanel/oddPanelData.js';
import {searchDrillPicks, searchOnePick} from '../../utils/compute.js';
import {generateWKT} from '../../utils/wkt/generateWKT.js';
import {Layer} from '../layer/Layer.js';
import {taskData} from '../task/taskList/taskList.js';
import {getCurrentOddLayerSource} from '../../system/odd/oddLayerVisible.js';
import {DynamicInfo} from '../../system/odd/enum/EventType.js';
import {KEY_FLAGs} from '../../event/keyboard.js';
import {getBaseMapJsonUrl, getBaseMapUrl} from '../layer/tileLayer/tileLayerController.js';
import {isPspVersion} from '../../store/index.js';

//数据源里的字段类型
export const sourceMap = {
  lane: 'l',
  laneBoundary: 'lb',
  road: 'r',
  sdlink: 'sdl',
};

export const invertSourceMap = {
  l: 'lane',
  lb: 'laneBoundary',
  r: 'road',
  sdl: 'sdlink',
};

//提交到作业库的图层类型
export const oddDatalayerName = {
  Road: 'ROAD',
  Lane: 'LANE',
  SDLink: 'SDLINK',
};

export function isLayerNameRoad(layerName) {
  if (layerName == 'Road' || layerName == 'ROAD') {
    return true;
  }
  return false;
}

export function isLayerNameLane(layerName) {
  if (layerName == 'Lane' || layerName == 'LANE') {
    return true;
  }

  return false;
}

export function isLayerNameSDLink(layerName) {
  if (layerName == 'SDLink' || layerName == 'SDLINK') {
    return true;
  }

  return false;
}

export function isLinkType(layerName) {
  if (isLayerNameRoad(layerName)) {
    return true;
  }

  return false;
}

//未正式生成odd的选中lane
class HoverOddLayer extends Layer {
  viewer = createViewer();
  laneSources = new Map([
    ['车道线', new PrimitiveCollection()],
    ['车道', new PrimitiveCollection()],
    ['道路', new PrimitiveCollection()],
  ]);
  shiftData = new Map();

  linkIdGeolineId = new Map();
  linkIdLength = new Map(); //记录link的length

  hoverLanes = new Map();
  hoverLaneGroup = new Map();

  constructor() {
    super(false, '待生成的odd', [], new PrimitiveCollection(), false, false);
    for (let primitiveCollection of this.laneSources.values()) {
      this.viewer.scene.primitives.add(primitiveCollection);
    }
  }

  clearHoverLanes() {
    for (let lane of this.hoverLanes.values()) {
      this.clearOneHoverLane(lane);
    }
    this.viewer.scene.requestRender();
  }

  async laneClickHandler(lane) {
    this.clearHoverLanes();

    let roadPriorityClass = await getRoadPriorityClass(lane);
    await this.addOneHoverLane(lane, roadPriorityClass).then(() => {
      this.viewer.scene.requestRender();
    });
    if (oddLayer.hoverEvent.size > 0) {
      oddLayer.clearHoverEvent();
      setPanelMode(PanelOpenType.CLOSE);
    } else if (isPaneModeEqual(PanelOpenType.CREATE_MULTI)) {
      setPanelMode(PanelOpenType.CREATE_MULTI);
    }
  }

  clearOneHoverLane(oddLane) {
    let laneSource = this.laneSources.get(oddLane.laneSource);
    if (laneSource === undefined) {
      throw new Error('异常：hoverOddLayer没有这条lane');
    }
    laneSource.remove(oddLane);
    let laneId = oddLane.laneId,
      laneGroupId = oddLane.laneGroupId;
    this.hoverLanes.delete(laneId);
    //修改laneGroup
    this.hoverLaneGroup.set(laneGroupId, this.hoverLaneGroup.get(laneGroupId) - 1);
    if (this.hoverLaneGroup.get(laneGroupId) === 0) {
      this.hoverLaneGroup.delete(laneGroupId);
    }
  }

  closeOneLaneSource(laneSource) {
    let dataSource = this.laneSources.get(laneSource);
    if (dataSource === undefined) {
      return;
    }
    let len = dataSource.length;
    for (let i = 0; i < len; i++) {
      let primitive = dataSource.get(0);
      this.clearOneHoverLane(primitive);
    }
    this.viewer.scene.requestRender();
  }

  async shiftEvent(stPos, edPos, way) {
    let picks = searchDrillPicks(stPos, edPos),
      pick;
    if (picks === null || picks.length === 0) {
      return;
    }
    let hoverSize = this.hoverLanes.size;
    //如果是右键拉框操作,取消选中的hoverLane
    if (way === 'RIGHT') {
      for (let i = 0; i < picks.length; i++) {
        pick = picks[i];
        if (pick.id instanceof OddLane && pick.id.state.type === 'ARROW_HOVER_LANE') {
          this.clearOneHoverLane(pick.id);
        }
      }
    } else if (way === 'LEFT') {
      let roadPriorityClass = null;
      for (let i = 0; i < picks.length; i++) {
        if (typeof picks[i].getProperty === 'function' && picks[i].getProperty('type') === 'l') {
          roadPriorityClass = await getRoadPriorityClass(picks[i]);
          break;
        }
      }

      //左键拉框操作。只允许同时选lane或者同时选road
      let hasRoad = 0;
      let hasLane = 0;
      let hasSdLink = 0;
      for (let i = 0; i < picks.length; i++) {
        pick = picks[i];
        //根据lane生成hoverODD
        if (pick instanceof Cesium3DTileFeature && typeof pick.getProperty === 'function') {
          if (pick.getProperty('type') === sourceMap.lane) {
            hasLane = 1;
          }
          if (pick.getProperty('type') === sourceMap.road) {
            hasRoad = 1;
          }
          if (pick.getProperty('type') === sourceMap.sdlink) {
            hasSdLink = 1;
          }
        }
      }

      if (hasRoad + hasLane + hasSdLink > 1) {
        NioMessage('warning', '当前同时选中Lane,Link或者SdLink，批量仅可生成某一图层的事件，请重新选择', 2000);
        return;
      }

      for (let i = 0; i < picks.length; i++) {
        pick = picks[i];
        //根据lane生成hoverODD
        if (
          pick instanceof Cesium3DTileFeature &&
          typeof pick.getProperty === 'function' &&
          (pick.getProperty('type') === sourceMap.lane ||
            pick.getProperty('type') === sourceMap.road ||
            pick.getProperty('type') === sourceMap.sdlink)
        ) {
          let res = await this.addOneHoverLane(pick, roadPriorityClass);
          //由于版本更新数据丢失导致获取图幅失败，需要停止
          if (res === false) {
            return;
          }
        }
      }
    }
    this.viewer.scene.requestRender();
    if (this.hoverLanes.size === hoverSize) {
      return;
    }
    //shift拉框时，认为用户放弃了编辑odd
    if (oddLayer.hoverEvent.size > 0) {
      oddLayer.clearHoverEvent();
      setPanelMode(PanelOpenType.CLOSE);
    }
    if (isPaneModeEqual(PanelOpenType.CREATE_MULTI)) {
      setPanelMode(this.hoverLanes.size === 0 ? PanelOpenType.CLOSE : PanelOpenType.CREATE_MULTI);
    }
  }

  async shiftOneEvent(pos) {
    const target = searchOnePick(pos);
    if (target.id instanceof OddLane && target.id.getState(target.primitive.eventId).type === 'ARROW_HOVER_LANE') {
      //选中了hover态的lane
      this.clearOneHoverLane(target.id);
    } else if (target instanceof Cesium3DTileFeature) {
      let roadPriorityClass = await getRoadPriorityClass(target);
      await this.addOneHoverLane(target, roadPriorityClass);
    } else {
      return;
    }
    this.changePanel();
    this.viewer.scene.requestRender();
  }

  //按a键时的响应函数
  async keyAShiftOneEvent(pos) {
    let picks = this.viewer.scene.drillPick(pos, 10, 10),
      target = null;
    for (let i = 0; i < picks.length; i++) {
      if (
        picks[i].id instanceof OddLane &&
        picks[i].id.getState(picks[i].primitive.eventId).type === 'ARROW_HOVER_LANE'
      ) {
        this.clearOneHoverLane(picks[i].id);
        return;
      }
      if (
        picks[i] instanceof Cesium3DTileFeature &&
        typeof picks[i].getProperty === 'function' &&
        (picks[i].getProperty('type') === 'l' || picks[i].getProperty('type') === 'r') //也支持link事件制作
      ) {
        target = picks[i];
      }
    }

    if (target !== null) {
      let roadPriorityClass = await getRoadPriorityClass(target);
      await this.addOneHoverLane(target, roadPriorityClass);
    }

    this.changePanel();
    this.viewer.scene.requestRender();
  }

  changePanel() {
    //shift拉框时，认为用户放弃了编辑odd
    if (oddLayer.hoverEvent.size > 0) {
      oddLayer.clearHoverEvent();
      setPanelMode(PanelOpenType.CLOSE);
    }
    if (isPaneModeEqual(PanelOpenType.CREATE_MULTI)) {
      setPanelMode(this.hoverLanes.size === 0 ? PanelOpenType.CLOSE : PanelOpenType.CREATE_MULTI);
    }
  }

  async refreshLinkIdMap(linkId) {
    try {
      let link_num = BigInt(linkId);
      let mesh_num = link_num >> BigInt(32);

      let linkIdKey = linkId + '' + store.state.version.curVersion;
      if (!this.linkIdGeolineId.has(linkIdKey)) {
        this.linkIdGeolineId.set(linkIdKey, []);
        const baseMapJsonURL = getBaseMapJsonUrl(store.state.version.curVersion);
        let linkMesh = await axios.get(`${baseMapJsonURL}/tile_${mesh_num}.json`);

        let linkList = linkMesh.data.linkList;
        if (linkList) {
          for (let link of linkList) {
            let linkIdKeyTmp = link.id + '' + store.state.version.curVersion;
            this.linkIdLength.set(linkIdKeyTmp, link.length);

            if (!this.linkIdGeolineId.has(linkIdKeyTmp)) {
              this.linkIdGeolineId.set(linkIdKeyTmp, []);
            }

            for (let geoId of link.roadGeoLineIds) {
              this.linkIdGeolineId.get(linkIdKeyTmp).push(geoId);
            }
          }
        }
      }
    } catch (error) {
      this.linkIdGeolineId.clear();
      this.linkIdLength.clear();
      NioMessage('error', '获取图幅数据失败', 1500);
      throw error;
    }
  }

  async refreshCoordinateMap(currentKey, source, mesh) {
    if (!this.shiftData.has(currentKey)) {
      this.shiftData.set(currentKey, {});
      const baseMapURL = getBaseMapUrl(store.state.version.curVersion);

      try {
        let res = await axios.get(
          `${baseMapURL}/hd_map/china_json_${store.state.version.curVersion}_new/${source}/${mesh}.geojson`,
        );

        let features = res.data.features;
        for (let j = 0; j < features.length; j++) {
          this.shiftData.get(currentKey)[features[j].properties.id] = features[j].geometry.coordinates;
        }
      } catch (error) {
        this.shiftData.delete(currentKey);
        NioMessage('error', '获取图幅数据失败', 1500);
        throw error;
      }
    }
  }

  async refreshSdLinkCoordinateMap(currentKey, source, mesh) {
    if (!this.shiftData.has(currentKey)) {
      this.shiftData.set(currentKey, {});
      const sdLinkURL = window.api.sdLinkURL + '?map_version=' + store.state.version.curVersion + '&tile_id=' + mesh;

      try {
        let res = await axios.get(sdLinkURL);

        for (let tileData of res.data.data.tiles_data) {
          for (let link of tileData.sdLinks) {
            let id = link.id;
            let coordinates = [];
            for (let pt of link.geometry) {
              coordinates.push([pt.lon, pt.lat]);
            }
            this.shiftData.get(currentKey)[id] = coordinates;
          }
        }
      } catch (error) {
        this.shiftData.delete(currentKey);
        NioMessage('error', '获取图幅数据失败', 1500);
        throw error;
      }
    }
  }

  async addOneHoverLane(feature, roadPriorityClass) {
    let property = this.getProperty(feature);

    if (isPspVersion()) {
      //psp允许选中lane和road
      if (property.source !== sourceMap.lane && property.source !== sourceMap.road) {
        return;
      }
    } else {
      if (
        property.source !== sourceMap.lane &&
        property.source != sourceMap.road &&
        property.source != sourceMap.sdlink
      ) {
        return;
      }
    }

    //按下'a'键时，可以选中
    if (!KEY_FLAGs['a']) {
      //如果这个source已经被选中了，不再选
      if (oddLayer.oddLanes.has(property.id)) {
        let sources = getCurrentOddLayerSource();
        let oddLane = oddLayer.oddLanes.get(property.id);
        for (let i = 0; i < oddLane.oddDataList.length; i++) {
          if (sources.has(oddLane.oddDataList[i].source)) {
            return;
          }
        }
      }
    }

    //如果odd图层是打开的，并且已经有了oddLane，理论上不允许用户穿过oddLane去选择背后的lane
    if (this.hoverLanes.has(property.id)) {
      return;
    }

    let geolineIds = [];
    if (property.source == sourceMap.road) {
      //选road的时候，要取link_id。link可能被截断，要取多个合起来
      await this.refreshLinkIdMap(property.linkId);

      let linkIdKey = property.linkId + '' + store.state.version.curVersion;
      geolineIds = this.linkIdGeolineId.get(linkIdKey);
      oddPanelData.selectType = oddDatalayerName.Road;
    } else if (property.source == sourceMap.sdlink) {
      //其他情况直接取
      geolineIds.push(property.id);
      oddPanelData.selectType = oddDatalayerName.SDLink;
    } else {
      //其他情况直接取
      geolineIds.push(property.id);
      oddPanelData.selectType = oddDatalayerName.Lane;
    }

    let line = [];
    for (let geolindId of geolineIds) {
      let mesh_num = BigInt(geolindId) >> BigInt(32);
      let currentKey = mesh_num + '' + property.source + store.state.version.curVersion;
      if (invertSourceMap[property.source] == invertSourceMap.sdl) {
        await this.refreshSdLinkCoordinateMap(currentKey, invertSourceMap.sdl, mesh_num);
      } else {
        await this.refreshCoordinateMap(currentKey, invertSourceMap[property.source], mesh_num);
      }

      let coordinates = this.shiftData.get(currentKey)[geolindId];
      for (let coordinate of coordinates) {
        let pt = Cartesian3.fromDegrees(coordinate[0], coordinate[1], 0);

        //去重复
        if (line.length == 0 || line[line.length - 1] !== pt) {
          line.push(pt);
        }
      }
    }

    if (line.length === 0) {
      NioMessage('error', '获取底图点串为空', 2000);
      return;
    }

    //开始生成hoverOddLane
    let geometry = generateWKT.write('linestring', line);

    let source = 1;
    let memo = undefined;
    let siteMapId = undefined;

    if (
      taskData.runningTask !== null &&
      taskData.runningTask.typeCode !== undefined &&
      taskData.runningTask.typeCode !== null
    ) {
      if (taskData.runningTask.typeCode === 'issue_odd_event_making') {
        source = 3;
        memo = taskData.runningTask.verifyIssue;
        siteMapId = taskData.runningTask.siteId;
      } else if (taskData.runningTask.typeCode === 'ao_event_making') {
        source = 4;
      } else if (taskData.runningTask.typeCode === 'odd_mining_making') {
        source = 6;
      } else if (taskData.runningTask.typeCode === 'nio_map_permit_ramp') {
        source = 7;
      }
    }

    let type = DynamicInfo[512];
    if (roadPriorityClass !== '高速' && roadPriorityClass !== '城市快速路' && roadPriorityClass !== '都市高速') {
      //type = DynamicInfo[712];
    } else if (taskData.runningTask !== null && taskData.runningTask.typeCode === 'ao_speed_limit_making') {
      type = DynamicInfo[2];
    }

    if (property.source == sourceMap.sdlink) {
      type = DynamicInfo[200];
    }

    //如果是AO任务，类型为AO
    if (source === 4) {
      type = DynamicInfo[1];
    }

    //odd制作任务，创建新事件时，设置siteMapId为任务号
    if (source === 1 && taskData.runningTask !== null) {
      siteMapId = taskData.runningTask.taskId;
    }

    let id = property.id;
    let length = property.length ? property.length : 0;

    let layerName = '';
    if (property.source == sourceMap.road) {
      layerName = oddDatalayerName.Road;
      type = DynamicInfo[2];
      id = property.linkId; //选中road，使用linkId
      let linkIdKey = id + '' + store.state.version.curVersion;
      length = this.linkIdLength.get(linkIdKey);
    } else if (property.source == sourceMap.lane) {
      layerName = oddDatalayerName.Lane;
    } else if (property.source == sourceMap.sdlink) {
      layerName = oddDatalayerName.SDLink;
      //sdlink需要自己计算length
      if (line.length > 1) {
        for (let i = 1; i < line.length; i++) {
          length += Cartesian3.distance(line[i], line[i - 1]);
        }
      }
    }

    let lane = new OddLane(
      'ARROW_HOVER_LANE',
      id,
      property.laneGroupId,
      '车道',
      new OddData(
        type,
        0,
        0,
        id,
        0,
        length,
        store.state.version.curVersion,
        0,
        source,
        '',
        geometry,
        line,
        true,
        null,
        null,
        roadPriorityClass,
        memo,
        siteMapId,
        layerName,
        property,
      ),
    );

    if (property.source == sourceMap.sdlink) {
      lane.oddDataList[0].path = id + '';
      lane.oddDataList[0].paths2e = 1 + ''; //1正向，-1逆向
    }

    //将初始化的lane加入到环境中
    this.#newHoverLane(lane);
  }

  #newHoverLane(oddLane) {
    if (this.hoverLanes.has(oddLane.laneId)) {
      return;
    }
    let dataSource = this.laneSources.get(oddLane.laneSource);
    dataSource.add(oddLane);
    this.hoverLanes.set(oddLane.laneId, oddLane);
    //添加组
    let group = this.hoverLaneGroup.get(oddLane.laneGroupId);
    if (group === undefined) {
      this.hoverLaneGroup.set(oddLane.laneGroupId, 1);
    } else {
      this.hoverLaneGroup.set(oddLane.laneGroupId, group + 1);
    }
  }

  addHoverLane(oddLane) {
    this.#newHoverLane(oddLane);
  }

  getProperty(feature) {
    let property = {id: '', mesh: '', length: '', laneGroupId: '', source: ''};

    let propertyNames = feature.getPropertyIds();
    for (let i = 0; i < propertyNames.length; i++) {
      property[propertyNames[i]] = feature.getProperty(propertyNames[i]);
    }

    property.id = feature.getProperty('id');
    property.mesh = feature.getProperty('mesh');
    property.length = parseFloat(feature.getProperty('length'));
    property.laneGroupId = feature.getProperty('laneGroupId');
    property.source = feature.getProperty('type');
    property.linkId = feature.getProperty('linkId');

    return property;
  }

  destroy() {}
}

//获取lane对应的road的priorityRoadClass
async function getRoadPriorityClass(feature) {
  //只查lane
  if (feature.getProperty('type') !== 'l') {
    return '';
  }

  let mesh = '';
  let linkId = feature.getProperty('linkId');
  if (linkId === undefined) {
    return '高速';
  }

  let priorityRoadClass = '';

  //左移32位是图幅号
  mesh = (BigInt(linkId) >> BigInt(32)).toString();
  const baseMapURL = getBaseMapUrl(store.state.version.curVersion);

  let flag = await axios
    .get(`${baseMapURL}/hd_map/china_json_${store.state.version.curVersion}_new/road/${mesh}.geojson`)
    .then((res) => {
      let find = false;
      let features = res.data.features;
      if (features === undefined) {
        NioMessage('warning', '未找到该linkId结果，请核实id或版本号', 1500);
        return;
      }

      for (let i = 0; i < features.length; i++) {
        if (features[i].properties.linkId === linkId) {
          priorityRoadClass = features[i].properties.priorityRoadClass;
          find = true;
          break;
        }
      }

      if (find === false) {
        NioMessage('warning', '未找到该lane id结果，请核实id或版本号', 1500);
      }
    })
    .catch((err) => {
      NioMessage('error', '查询底图数据失败' + err.message, 1500);
    });

  //造一个
  //如果没有，默认高速
  if (priorityRoadClass === undefined) {
    priorityRoadClass = '高速';
    //priorityRoadClass = "城市快速路";
    //priorityRoadClass = "不是高速或者快速路";
  }

  return priorityRoadClass;
}

const hoverOddLayer = new HoverOddLayer();

export {hoverOddLayer};
