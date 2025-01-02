import {defined, PrimitiveCollection} from 'cesium';
import {createViewer} from '../../cesium/initMap.js';
import {LayerEvent} from '../../event/index.js';
import {saveUserPos, searchDrillPicks, searchOnePick, throttle} from '../../utils/compute.js';
import {PanelOpenType, setPanelMode} from './eventPanel/oddPanelData.js';
import {getTileLevel, NioMessage} from '../../utils/utils.js';
import {opHistory} from './history/history.js';
import {OpType} from './enum/OpType.js';
import {OddOpRecord} from './history/OddOpRecord.js';
import {hoverOddLayer} from './hoverOddLayer.js';
import {OddLane} from './oddLane/OddLaneModel.js';
import {loadingSourceOddHandler} from './loading/loadingOddData.js';
import {Layer} from '../layer/Layer.js';
import {parseWKT} from '../../utils/wkt/parseWKT.js';
import {generateWKT} from '../../utils/wkt/generateWKT.js';
import {oddLayerSource, getOddLayerVisible} from '../odd/oddLayerVisible.js';
import {Cartesian3} from 'cesium';
import {DynamicInfo} from '../../system/odd/enum/EventType.js';
import {getRunningTaskSource} from '../task/taskList/taskList.js';
import {NioNotification} from '../../utils/utils.js';

//如果有任务在进行中,且与name对应的source相同，则不允许隐藏
//function canChangeODDLayerVisible(name) {
//  let source = getRunningTaskSource();
//  if (source === 1 || source === 3 || source === 4) {
//    for (let i = 0; i < oddLayerSource.length; i++) {
//      const item = oddLayerSource[i];
//      if (item.name === name) {
//        if (item.source === source && item.show) {
//          NioNotification('error', item.name + '是作业图层，不允许隐藏');
//          return false;
//        }
//      }
//    }
//  }
//
//  return true;
//}

class ODDLayer extends Layer {
  viewer = createViewer();
  loading = false;

  //geometry事件权柄
  handler = null;

  //全部的odd线(未生成事件、已生成事件):laneId -> OddLane
  oddLanes = new Map();

  //hoverEvent:laneId -> OddLane
  hoverEvent = new Map();

  //记录远程下载下来的事件，作业库的事件会覆盖母库事件。其他删除、创建等操作不会影响:eventId -> isWork
  eventMap = new Map();

  constructor() {
    //let show = localStorage.getItem('事件');
    super(true, '事件', [], new PrimitiveCollection(), false, false);
    this.initMoveHandler();
  }

  //初始化ODD事件模块
  initMoveHandler() {
    this.handler = new LayerEvent();
    //鼠标按下事件(拖动查询事件)
    this.handler.add('LEFT_DOWN', (ev) => {
      this.handler.start('LEFT_UP');
      this.handler.start('MOUSE_MOVE');
    });
    //鼠标拖动事件
    this.handler.add(
      'MOUSE_MOVE',
      throttle(() => this.mouseLoadingOdd(), 1000),
    );
    //鼠标抬起事件
    this.handler.add('LEFT_UP', (ev) => {
      saveUserPos();
      this.mouseLoadingOdd();
      this.handler.stop('MOUSE_MOVE');
      this.handler.stop('LEFT_UP');
    });
    this.startOddEvent();
  }

  startOddEvent() {
    this.handler.start('LEFT_DOWN');
  }

  stopOddEvent() {
    this.handler.stop('LEFT_DOWN');
  }

  /** 创建单条odd事件 */
  createOneEventLane() {
    let hoverLane = [...hoverOddLayer.hoverLanes.values()][0];
    //需要将这条线从hoverOddLayer图层转移到oddLayer图层中
    hoverOddLayer.clearOneHoverLane(hoverLane);
    let oddLane = this.laneToEvent(hoverLane);
    //直接转为编辑模式的odd
    this.addOneHoverEvent(oddLane);
    //将面板置为单条编辑模式，并设置编辑最新一项
    setPanelMode(PanelOpenType.MODIFY_ONE);
    //创建操作入栈
    opHistory.push(new OddOpRecord(OpType.CREATE, [hoverLane], [[hoverLane.oddDataList[0].copy()]]));
  }

  getLinkedIds(link, links) {
    let ids = new Set();

    let predecessorLinkIdsS2e = [];
    let predecessorLinkIdsE2s = [];

    let successorLinkIdsS2e = [];
    let successorLinkIdsE2s = [];

    for (let item of link.predecessorLinkIdsS2e) {
      if (links.has(item)) {
        predecessorLinkIdsS2e.push(item);
        ids.add(item);
      }
    }

    for (let item of link.successorLinkIdsS2e) {
      if (links.has(item)) {
        successorLinkIdsS2e.push(item);
        ids.add(item);
      }
    }

    for (let item of link.predecessorLinkIdsE2s) {
      if (links.has(item)) {
        predecessorLinkIdsE2s.push(item);
        ids.add(item);
      }
    }

    for (let item of link.successorLinkIdsE2s) {
      if (links.has(item)) {
        successorLinkIdsE2s.push(item);
        ids.add(item);
      }
    }

    return {predecessorLinkIdsS2e, predecessorLinkIdsE2s, successorLinkIdsS2e, successorLinkIdsE2s, ids};
  }

  getNextLinkId(linkId, s2e, links, orderedIds) {
    let link = links.get(linkId);
    let {predecessorLinkIdsS2e, predecessorLinkIdsE2s, successorLinkIdsS2e, successorLinkIdsE2s, ids} =
      this.getLinkedIds(link, links);

    if (s2e) {
      //只找successorS2e
      if (successorLinkIdsS2e.length == 1 && !orderedIds.has(successorLinkIdsS2e[0])) {
        let nextLinkId = successorLinkIdsS2e[0];
        let nextLink = links.get(nextLinkId);

        let nextS2e = false;
        for (let predecessor of nextLink.predecessorLinkIdsS2e) {
          if (predecessor == linkId) {
            nextS2e = true;
            break;
          }
        }

        return {
          id: successorLinkIdsS2e[0],
          s2e: nextS2e,
        };
      }
    } else {
      //只找successorE2s
      if (successorLinkIdsE2s.length == 1 && !orderedIds.has(successorLinkIdsE2s[0])) {
        let nextLinkId = successorLinkIdsE2s[0];
        let nextLink = links.get(nextLinkId);

        let nextS2e = false;
        for (let predecessor of nextLink.predecessorLinkIdsS2e) {
          if (predecessor == linkId) {
            nextS2e = true;
            break;
          }
        }

        return {
          id: successorLinkIdsE2s[0],
          s2e: nextS2e,
        };
      }
    }
    return null;
  }

  sortSdlink(links) {
    let orderedIds = [];
    let orderedIdsMap = new Set();
    let linkMap = new Map();
    for (let link of links) {
      linkMap.set(link.id, link);
    }

    //找到第一个后继为1的节点
    let firstLinkId = null;
    let s2e = true; //记录方向
    for (let link of links) {
      let {predecessorLinkIdsS2e, predecessorLinkIdsE2s, successorLinkIdsS2e, successorLinkIdsE2s, ids} =
        this.getLinkedIds(link, linkMap);

      let successorLength = successorLinkIdsS2e.length + successorLinkIdsE2s.length;
      let predecessorLength = predecessorLinkIdsS2e.length + predecessorLinkIdsE2s.length;

      //后继个数为1，且前继个数为0或者前继的id与后继id相同(双向路),则为起始点
      if (
        (successorLength == 1 && predecessorLength == 0) ||
        (successorLength == 1 && predecessorLength == 1 && ids.size == 1)
      ) {
        //双向路，前后继相同且各只有一个
        firstLinkId = link.id;
        s2e = successorLinkIdsS2e.length == 1 ? true : false;
        break;
      }
    }

    if (firstLinkId == null) {
      NioMessage('warning', 'link不连续或有环, 请重新选择');
      return;
    }

    let currentId = {id: firstLinkId, s2e: s2e};
    orderedIds.push(currentId);
    orderedIdsMap.add(firstLinkId);

    while (true) {
      currentId = this.getNextLinkId(currentId.id, currentId.s2e, linkMap, orderedIdsMap);
      if (currentId != null) {
        orderedIds.push(currentId);
        orderedIdsMap.add(currentId.id);
      } else {
        break;
      }
    }

    if (orderedIds.length != links.length) {
      NioMessage('warning', 'link不连续，请重新选择');
      return;
    }

    let line = [];
    for (let orderedId of orderedIds) {
      let coordinates = parseWKT.read(linkMap.get(orderedId.id).geometry);
      if (orderedId.s2e) {
        for (let coordinate of coordinates) {
          if (line.length == 0) {
            line.push(coordinate);
          } else {
            let last = line[line.length - 1];
            if (last[0] != coordinate[0] || last[1] != coordinate[1]) {
              line.push(coordinate);
            }
          }
        }
      } else {
        for (let i = coordinates.length - 1; i >= 0; i--) {
          let coordinate = coordinates[i];
          if (line.length == 0) {
            line.push(coordinate);
          } else {
            let last = line[line.length - 1];
            if (last[0] != coordinate[0] || last[1] != coordinate[1]) {
              line.push(coordinate);
            }
          }
        }
      }
    }

    let line1 = [];
    let line2 = [];
    for (let coordinate of line) {
      let pt = Cartesian3.fromDegrees(coordinate[0], coordinate[1], 0);
      line1.push(pt);

      //加高一点，否则压盖
      let pt2 = Cartesian3.fromDegrees(coordinate[0], coordinate[1], 0.1);
      line2.push(pt2);
    }

    let geometry = generateWKT.write('linestring', line1);

    let length = 0.0;
    if (line1.length > 1) {
      for (let i = 1; i < line1.length; i++) {
        length += Cartesian3.distance(line1[i], line1[i - 1]);
      }
    }

    let path = '';
    let paths2e = '';
    for (let orderedId of orderedIds) {
      path += orderedId.id + ';';
      paths2e += (orderedId.s2e ? '1' : '-1') + ';'; //1表示正向，-1表示逆向
    }

    return {firstLinkId, path, geometry, line2, paths2e, length};
  }

  //sdlink与其他event创建不同，需要把多条合为一条，首id赋值给id，其余id赋值给path
  createOneEventSdLink() {
    //判断是否连续
    let hoverLanes = [...hoverOddLayer.hoverLanes.values()];
    let links = [];
    for (let sdLink of hoverLanes) {
      let properties = sdLink.oddDataList[0].properties;
      let link = {};
      link.id = properties.id;
      link.predecessorLinkIdsS2e = properties.predecessorLinkIdsS2e == '' ? [] : properties.predecessorLinkIdsS2e;
      link.successorLinkIdsS2e = properties.successorLinkIdsS2e == '' ? [] : properties.successorLinkIdsS2e;
      link.predecessorLinkIdsE2s = properties.predecessorLinkIdsE2s == '' ? [] : properties.predecessorLinkIdsE2s;
      link.successorLinkIdsE2s = properties.successorLinkIdsE2s == '' ? [] : properties.successorLinkIdsE2s;
      link.geometry = sdLink.oddDataList[0].geometry;
      links.push(link);
    }

    if (links.length > 1) {
      let ret = this.sortSdlink(links);
      if (!ret) {
        return;
      }

      //需要将这条线从hoverOddLayer图层转移到oddLayer图层中
      for (let hoverLane of hoverLanes) {
        hoverOddLayer.clearOneHoverLane(hoverLane);
      }

      //复用第一条lane
      let newLane = hoverLanes[0];
      newLane.laneId = ret.firstLinkId;
      newLane.oddDataList[0].geometry = ret.geometry;
      newLane.oddDataList[0].laneId = ret.firstLinkId;
      newLane.oddDataList[0].positions = ret.line2;
      newLane.oddDataList[0].path = ret.path;
      newLane.oddDataList[0].paths2e = ret.paths2e;
      newLane.oddDataList[0].edOffset = ret.length;
      newLane.oddDataList[0].type = DynamicInfo[200];

      let oddLane = this.laneToEvent(newLane);
      //直接转为编辑模式的odd
      this.addOneHoverEvent(oddLane);
      //将面板置为单条编辑模式，并设置编辑最新一项
      setPanelMode(PanelOpenType.MODIFY_ONE);
      //创建操作入栈
      opHistory.push(new OddOpRecord(OpType.CREATE, [newLane], [[newLane.oddDataList[0].copy()]]));
    } else {
      this.createOneEventLane();
    }
  }

  /** 创建多条事件 */
  createEventLanes(type, lawSpeed, exSpeed, infoValueList) {
    let hoverLanes = [...hoverOddLayer.hoverLanes.values()],
      oddData,
      oddDataLists = [];
    //为即将创建的事件更新数据
    for (let i = 0; i < hoverLanes.length; i++) {
      oddData = hoverLanes[i].oddDataList[0];
      oddData.type = type;
      oddData.lawSpeed = lawSpeed;
      oddData.exSpeed = exSpeed;
      oddData.infoValueList = infoValueList;
      //需要将这条线从hoverOddLayer图层转移到oddLayer图层中
      hoverOddLayer.clearOneHoverLane(hoverLanes[i]);
      this.laneToEvent(hoverLanes[i]);
      oddDataLists[i] = [oddData.copy()];
    }
    //创建操作入栈
    opHistory.push(new OddOpRecord(OpType.CREATE, hoverLanes, oddDataLists));
    this.viewer.scene.requestRender();
  }

  laneToEvent(outerLane) {
    let lane = this.oddLanes.get(outerLane.laneId);
    if (lane === undefined) {
      this.oddLanes.set(outerLane.laneId, outerLane);
      this.dataSource.add(outerLane);
      outerLane.setStyle('ARROW_EVENT');
      lane = this.oddLanes.get(outerLane.laneId);
    } else {
      let oddData = outerLane.oddDataList[0];
      //暂时加个3类型。此处为什么要加类型判断？
      if (oddData.source === 1 || oddData.source === 3 || oddData.source === 4 || oddData.source === 6) {
        lane.addOddData(outerLane.oddDataList[0]);
        //lane.positionsArray = outerLane.oddDataList[0];
        //lane.positions = outerLane.positions;
      }
      //此处作业库数据有可能需要覆盖母库数据
      //lane.addOddData(outerLane.oddDataList[0]);
    }
    return lane;
  }

  /** 多条编辑模式下更新odd数据 */
  modifyEventLanes = (() => {
    let lanes, oddDataLists;
    //需要判断是否真的有变化，可能用户就随便点点确定，但实际上并没有值的变化
    function isListChange(type, lawSpeed, exSpeed, infoValueList) {
      for (let i = 0; i < lanes.length; i++) {
        for (let j = 0; j < lanes[i].oddDataList.length; j++) {
          if (isOddChange(lanes[i].oddDataList[j], type, lawSpeed, exSpeed, infoValueList)) {
            return true;
          }
        }
      }
      return false;
    }
    function isOddChange(oddData, type, lawSpeed, exSpeed, infoValueList) {
      if (oddData.type !== type) {
        return true;
      }
      switch (type) {
        case '法规限速':
          if (oddData.lawSpeed !== lawSpeed) {
            return true;
          }
          break;
        case '经验限速':
          if (oddData.exSpeed !== exSpeed) {
            return true;
          }
          break;
        case 'lane_types_cs替换':
          if (oddData.infoValueList !== infoValueList) {
            return true;
          }
          break;
      }
    }
    return (type, lawSpeed, exSpeed, infoValueList) => {
      lanes = [...this.hoverEvent.values()];
      oddDataLists = [];

      if (!isListChange(type, lawSpeed, exSpeed, infoValueList)) {
        return;
      }

      for (let i = 0; i < lanes.length; i++) {
        oddDataLists[i] = [];
        for (let j = 0; j < lanes[i].oddDataList.length; j++) {
          let oddData = lanes[i].oddDataList[j];
          //保存一份旧数据入操作栈
          oddDataLists[i][j] = oddData.copy();
          oddData.type = type;
          oddData.lawSpeed = lawSpeed;
          oddData.exSpeed = exSpeed;
          oddData.infoValueList = infoValueList;
        }
        lanes[i].setStyle('ARROW_EVENT');
      }
      this.hoverEvent.clear();
      this.viewer.scene.requestRender();
      if (this.show === false) {
        this.show = true;
      }
      //修改操作入栈,记录一份旧的oddData数据
      opHistory.push(new OddOpRecord(OpType.MODIFY, lanes, oddDataLists));
    };
  })();

  ctrlEvent(stPos, edPos, way) {
    let picks = searchDrillPicks(stPos, edPos);
    if (picks === null || picks.length === 0) {
      return;
    }
    let hoverSize = this.hoverEvent.size,
      pick;
    for (let i = 0; i < picks.length; i++) {
      pick = picks[i];
      if (defined(pick) && pick.id instanceof OddLane) {
        if (way === 'LEFT' && pick.id.getState(pick.primitive.eventId).type === 'ARROW_EVENT') {
          this.addOneHoverEvent(pick.id, pick.primitive.eventId);
        } else if (way === 'RIGHT' && pick.id.state.type === 'ARROW_HOVER_EVENT') {
          this.clearOneHoverEvent(pick.id);
        }
      }
    }
    if (hoverSize === this.hoverEvent.size) {
      return;
    }
    this.changePanel();
  }

  ctrlOneEvent(pos) {
    const target = searchOnePick(pos);
    if (target.id instanceof OddLane) {
      if (target.id.getState(target.primitive.eventId).type === 'ARROW_EVENT') {
        this.addOneHoverEvent(target.id, target.primitive.eventId);
      } else if (target.id.getState(target.primitive.eventId).type === 'ARROW_HOVER_EVENT') {
        this.clearOneHoverEvent(target.id);
      } else {
        return;
      }
      this.changePanel();
    }
    this.viewer.scene.requestRender();
  }

  changePanel() {
    if (hoverOddLayer.hoverLanes.size > 0) {
      hoverOddLayer.clearHoverLanes();
    }
    if (this.hoverEvent.size === 0) {
      setPanelMode(PanelOpenType.CLOSE);
    } else if (this.hoverEvent.size === 1) {
      setPanelMode(PanelOpenType.MODIFY_ONE);
    } else {
      setPanelMode(PanelOpenType.MODIFY_MULTI);
    }
  }

  addOneHoverEvent(oddLane, eventId, eventIds) {
    if (eventId === undefined) {
      eventId = oddLane.oddDataList[oddLane.oddDataList.length - 1].eventId;
    }

    oddLane.setStyle('ARROW_HOVER_EVENT', eventId);
    oddLane.activeEventId = eventId;
    oddLane.selectedEventIds = [];

    if (eventIds != undefined) {
      oddLane.selectedEventIds = eventIds;
    }

    this.hoverEvent.set(oddLane.laneId, oddLane);
  }

  clearHoverEvent() {
    for (let lane of this.hoverEvent.values()) {
      this.clearOneHoverEvent(lane);
    }
    this.viewer.scene.requestRender();
  }

  clearOneHoverEvent(oddEvent) {
    oddEvent.setStyle('ARROW_EVENT');
    this.hoverEvent.delete(oddEvent.laneId);
  }

  deleteEvent() {
    let lanes = [...this.hoverEvent.values()],
      oddDataLists = [];
    if (lanes.length === 1) {
      let tag = undefined;
      for (let i = 0; i < lanes[0].oddDataList.length; i++) {
        if (lanes[0].activeEventId === lanes[0].oddDataList[i].eventId) {
          tag = lanes[0].oddDataList[i].tag;
          break;
        }
      }

      let deleteOddData = this.removeOneOddData(lanes[0], tag);
      oddDataLists[0] = [deleteOddData];
    } else if (lanes.length > 1) {
      //let oddDataIds = new Set();
      //for(let i = 0; i < lanes.length; i ++){
      //    for(let j = 0; j < lanes[i].selectedEventIds.length; j ++){
      //      oddDataIds.add(lanes[i].selectedEventIds[j]);
      //    }
      //}

      //let oddDataDeleteList = [];
      //for(let i = 0; i < lanes.length; i ++){
      //  for(let j = 0; j < lanes[i].oddDataList.length; j ++){
      //    if(oddDataIds.has(lanes[i].oddDataList[j].eventId)){
      //      oddDataDeleteList.push(lanes[i].oddDataList[j]);
      //    }
      //  }
      //}
      //oddDataLists = this.removeAllOddData(lanes, oddDataDeleteList);

      oddDataLists = this.removeAllOddData(lanes);
    }

    //无论剩不剩，都关闭
    setPanelMode(PanelOpenType.CLOSE);

    this.viewer.scene.requestRender();
    //删除操作入栈
    opHistory.push(new OddOpRecord(OpType.DELETE, lanes, oddDataLists));
  }

  removeOneOddData(lane, tag) {
    let deleteOddData = lane.remove(tag);
    if (lane.oddDataList.length === 0) {
      setPanelMode(PanelOpenType.CLOSE);
      this.deleteOneEvent(lane);
    } else if (deleteOddData !== null) {
      this.deleteOneDataEvent(lane, deleteOddData.eventId);
      if (lane.selectedEventIds.length == 0) {
        setPanelMode(PanelOpenType.CLOSE);
      } else {
        setPanelMode(PanelOpenType.MODIFY_ONE);
      }
    }
    return deleteOddData;
  }

  removeLaneByEventId(laneId, eventId) {
    let lane = this.oddLanes.get(laneId);
    if (lane !== undefined) {
      let deleteOddData = lane.removeOddDataByEventId(eventId);
      if (lane.oddDataList.length === 0) {
        setPanelMode(PanelOpenType.CLOSE);
        this.deleteOneEvent(lane);
      } else if (deleteOddData !== null) {
        this.deleteOneDataEvent(lane, deleteOddData.eventId);
      }

      return deleteOddData;
    }

    return null;
  }

  removeAllOddData(lanes, oddDataLists) {
    oddDataLists = oddDataLists instanceof Array ? oddDataLists : [];
    let deleteList = [];
    for (let i = 0; i < lanes.length; i++) {
      deleteList[i] = lanes[i].removeAll(oddDataLists);

      if (lanes[i].oddDataList.length === 0) {
        this.deleteOneEvent(lanes[i]);
      }
    }
    this.changePanel();
    return deleteList;
  }

  deleteOneEvent(oddLane) {
    this.oddLanes.delete(oddLane.laneId);
    oddLane.setStyle('ARROW_HOVER_EVENT');
    this.dataSource.remove(oddLane);
    this.hoverEvent.delete(oddLane.laneId);
  }

  deleteOneDataEvent(oddLane, eventId) {
    //this.oddLanes.delete(oddLane.laneId);
    //oddLane.setStyle('ARROW_HOVER_EVENT');
    //this.dataSource.remove(oddLane);
    //this.hoverEvent.delete(oddLane.laneId);

    for (let i = 0; i < oddLane._primitiveArray.length; i++) {
      if (oddLane._primitiveArray[i].eventId === eventId) {
        oddLane._primitiveArray[i].destroy();
        oddLane._primitiveArray.splice(i, 1);
      }
    }
  }

  //加载远程odd数据
  mouseLoadingOdd() {
    let tile = getTileLevel();
    if (tile <= 10) {
      return;
    }
    loadingSourceOddHandler(false);
  }

  //清除所有数据
  clearAll() {
    this.viewer.scene.primitives.remove(this.dataSource);
    this.viewer.scene.primitives.add((this.dataSource = new PrimitiveCollection()));
    this.oddLanes.clear();
    this.hoverEvent.clear();
    this.eventMap.clear();
  }

  /**重写 */
  get show() {
    return getOddLayerVisible();
  }

  set show(value) {
    super.show = true /*value*/;
    if (getOddLayerVisible()) {
      this.startOddEvent();
    } else {
      setPanelMode(PanelOpenType.CLOSE);
      this.clearHoverEvent();
      hoverOddLayer.clearHoverLanes();
      this.stopOddEvent();
    }
  }

  destroy() {
    this.dataSource.removeAll();
    oddLayer = null;
  }
}

export let oddLayer = new ODDLayer();
//export {canChangeODDLayerVisible};
