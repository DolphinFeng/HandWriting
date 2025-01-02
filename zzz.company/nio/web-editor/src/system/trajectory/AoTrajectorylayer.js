import {
  Cartesian2,
  Cartesian3,
  Cartographic,
  PrimitiveCollection,
  Math as CMath,
  Color,
  NearFarScalar,
  PointPrimitiveCollection,
  PointPrimitive,
  defined,
  Primitive,
  GeometryInstance,
  PolylineGeometry,
  PolylineMaterialAppearance,
  Material,
  EllipsoidGeodesic,
} from 'cesium';
import {LayerEvent} from '../../event/index.js';
import {createViewer} from '../../cesium/initMap.js';
import {getMonthBefore, nioCamera, NioMessage, parseLineWKT, parseTime} from '../../utils/utils.js';
import {markRaw, reactive, ref, watch} from 'vue';
import axios from 'axios';
import preCache from '../../js/preCache.js';
import {DefineColor} from '../../cesium/materail.js';
import {isNullObject, throttle} from '../../utils/compute.js';
import {LayerStyle} from '../layer/style/layerStyle.js';
import {Layer} from '../layer/Layer.js';

const apiDynamicURL = api.apiDynamicURL;
const apiAoCheckTrajectoryURL = api.apiAOCheckTrajectoryURL;

/**
 * 轨迹列表
 */
const aoDataPanel = reactive({
  loading: false, //是否正在加载
});

/**
 *轨迹点列表
 */
const aoTrajPointData = reactive({
  curIdx: 0,
  imgPath: '',
  position: [],
  time: '',
  total: 0,
});

const aoVideoData = reactive({
  curIdx: 0,
  video: [],
  total: 0,
});

/**
 * 清除轨迹点相关信息
 */
const clearPointData = function () {
  aoCheckTrajectoryLayer.trajPointList = [];
  Object.assign(aoTrajPointData, {
    curIdx: 0,
    imgPath: '',
    position: [],
    time: '',
    total: 0,
  });
};

const clearVideoData = function () {
  Object.assign(aoVideoData, {
    curIdx: 0,
    video: [],
    total: 0,
  });
};

/**
 * 面板开关
 */
let aoPanelVisible = ref(false);

/**
 * 视频面板开关
 */
let aoVideoPanelVisible = ref(false);

/**
 * 将图片置为空状态，显示空面板
 */
const imgNull = ref(false);

//面板关闭后重置数据状态
watch(aoPanelVisible, (newVal, oldVal) => {
  if (!newVal) {
    aoCheckTrajectoryLayer.clearTraj();
    clearPointData();
  }
});

//面板关闭后重置数据状态
watch(aoVideoPanelVisible, (newVal, oldVal) => {
  if (!newVal) {
    clearVideoData();
  }
});

/**
 * 轨迹资料层样式
 */
class AoCheckTrajectoryLayerStyle extends LayerStyle {
  constructor() {
    super();
  }
}

/**
 * 轨迹图层
 */
class AoCheckTrajectoryLayer extends Layer {
  viewer = createViewer();
  trajPointList = []; //点集合
  /**
   * 拉框中点
   * 只在每次查询轨迹列表时刷新，被搜索使用后置零
   * @type{Cartesian2}
   */
  cPos;
  primitive = {
    pointCollection: null,
    lastP: null,
    hoverP: null,
    handler: null,
  }; //渲染列表
  innerColor = Color.fromCssColorString('#1f4ff4');
  outerColor = Color.fromCssColorString('#04138f');
  innerActiveColor = Color.fromCssColorString('#e935db');
  outerActiveColor = Color.fromCssColorString('#f2bf4e');
  arrowPolyline = new PolylineMaterialAppearance({
    material: Material.fromType('PolylineArrow', {
      color: Color.fromCssColorString('#75fbed'),
    }),
  });

  constructor() {
    super(true, 'AO轨迹资料', [], new PrimitiveCollection(), true, true);
    this.viewer.scene.primitives.add(this.dataSource);
    this.initHandler();
  }

  /**
   * 初始化事件
   */
  initHandler() {
    const handler = new LayerEvent();
    handler.add('LEFT_CLICK', (ev) => {
      let pick = this.viewer.scene.pick(ev.position, 10, 10);
      if (
        defined(pick) &&
        typeof pick.id === 'string' &&
        pick.id.includes('trajP') &&
        aoTrajPointData.curIdx !== pick.primitive._index
      ) {
        //将lastP置为null，这样在更新点位置的时候就能通过fly的方式移动
        this.setInActiveStyle(this.primitive.lastP);
        this.primitive.lastP = null;
        aoTrajPointData.curIdx = pick.primitive._index;
      }
    });
    handler.add(
      'MOUSE_MOVE',
      throttle((ev) => {
        let pick = this.viewer.scene.pick(ev.endPosition, 10, 10);
        this.viewer.container.style.cursor =
          defined(pick) && typeof pick.id === 'string' && pick.id.includes('trajP') ? 'pointer' : 'default';
      }, 35),
    );
    this.primitive.handler = handler;
  }

  /**
   *
   * @param {*} task
   * @returns
   */
  loadMaterial(task) {
    //先查询状态
    aoDataPanel.loading = true;
    let quality_type = 0;
    axios
      .post(apiDynamicURL + '/dynamic-map/event/branch/list', {
        branchName: task.oddBranchName,
        mapVersion: task.mapVersion,
        pageNo: 1,
        pageSize: 1,
      })
      .then((res) => {
        if (res.data.code === 200) {
          let data = res.data.data;
          quality_type = data.result[0].status;

          //失效枚举不一致，改一下
          if (quality_type === 2) {
            quality_type = 0;
          }

          axios
            .post(
              apiAoCheckTrajectoryURL,
              //axios.post('https://adops-gateway-dev.nioint.com/adops-event/event-platform/v1/third_api/quality/get_quality_info',
              {
                app_code: 'hdmap-platform',
                event_id: task.event_id,
                //event_id:"2_1_tencent-22072903_2_202208091704080916",
                event_type: 'DATA_QUALITY',
                quality_type: quality_type,
                user_name: 'sss',
              },
            )
            .then((res) => {
              if (res.data.data === null || res.data.code !== '0') {
                NioMessage('warning', 'AO资料查询错误：' + res.data.message, 2000);
              } else {
                let quality_info_list = res.data.data.quality_info_list;
                let event_video_url = res.data.data.event_video_url;
                if (quality_info_list !== null && quality_info_list.length !== 0) {
                  let pointList = [];
                  for (let i = 0; i < quality_info_list.length; i++) {
                    let quality_info = quality_info_list[i];

                    pointList.push({
                      //id: tmp[0],
                      position: quality_info.image_gps.coordinates,
                      time: quality_info.upload_time,
                      img_url: quality_info.image_url,
                    });
                  }

                  //按时间排序
                  pointList.sort(function (a, b) {
                    return new Date(a.time) - new Date(b.time);
                  });

                  //获取距离当前旧轨迹点最近的新轨迹点索引
                  const latestIdx = this.searchLatestPoint(pointList) ?? 0;
                  this.trajPointList = pointList;

                  Object.assign(aoTrajPointData, {
                    curIdx: latestIdx,
                    imgPath: pointList[latestIdx].img_url,
                    position: pointList[latestIdx].position,
                    time: pointList[latestIdx].time,
                    total: pointList.length,
                  });
                  aoCacheImg(0);
                  this.createTrajectory(pointList); //初始化点、线
                  this.setPointActive(latestIdx); //初始化设置活跃点

                  aoPanelVisible.value = true;
                }

                if (event_video_url !== undefined && event_video_url !== null && event_video_url.length !== 0) {
                  aoVideoPanelVisible.value = true;
                  Object.assign(aoVideoData, {
                    curIdx: 0,
                    video: event_video_url,
                    total: event_video_url.length,
                  });
                }

                if (aoVideoData.total === 0 && quality_info_list.length === 0) {
                  throw new Error('loadMaterial错误');
                }
              }
            })
            .catch((err) => {
              NioMessage('warning', '没有轨迹数据', 1000);
              this.clearTraj();
              clearPointData();
              clearVideoData();
            });
        } else {
          throw new Error('loadMaterial错误2: ' + res.data.msg);
        }
      })
      .catch((err) => {
        NioMessage('warning', '未查询到资料状态', 1000);
        return;
      })
      .finally(() => {
        //setLoadingFrame(false);
        aoDataPanel.loading = false;
      });
  }

  /**
   * 搜索离搜索中心或旧轨迹点距离最近的点
   * @param pointList
   */
  searchLatestPoint(pointList) {
    let targetP = new Cartographic();
    if (this.cPos) {
      targetP = Cartographic.fromCartesian(this.viewer.camera.pickEllipsoid(this.cPos));
      targetP.height = 0;
      this.cPos = null;
    } else if (this.trajPointList.length > 0) {
      targetP = new Cartographic(
        CMath.toRadians(this.trajPointList[aoTrajPointData.curIdx].position[0]),
        CMath.toRadians(this.trajPointList[aoTrajPointData.curIdx].position[1]),
        0,
      );
    } else {
      return null;
    }
    let minL = Number.POSITIVE_INFINITY,
      minIdx = 0,
      endP = new Cartographic();
    let geodesic = new EllipsoidGeodesic();
    for (let i = 0; i < pointList.length; i++) {
      endP.longitude = CMath.toRadians(pointList[i].position[0]);
      endP.latitude = CMath.toRadians(pointList[i].position[1]);
      geodesic.setEndPoints(targetP, endP);
      if (geodesic.surfaceDistance < minL) {
        minL = geodesic.surfaceDistance;
        minIdx = i;
      }
    }
    return minIdx;
  }

  /**
   * 创建轨迹点、线
   * @param pointList
   */
  createTrajectory(pointList) {
    //清除上一次的点线
    this.clearTraj();
    this.primitive.handler.startAll();
    //渲染点:耗时<0.001s
    let positions = [];
    const _nearFarScalar = new NearFarScalar(1.5e2, 1, 1.5e3, 0.3);
    let pointCollection = new PointPrimitiveCollection();
    this.primitive.pointCollection = this.dataSource.add(pointCollection);
    for (let i = 0; i < pointList.length; i++) {
      positions[i] = pointList[i].position;
      positions[i] = Cartesian3.fromDegrees(positions[i][0], positions[i][1], 0);
      pointCollection.add(
        new PointPrimitive({
          id: `trajP${i}`,
          pixelSize: 6,
          color: this.innerColor,
          position: positions[i],
          outlineColor: this.outerColor,
          outlineWidth: 2,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scaleByDistance: _nearFarScalar,
        }),
      );
    }
    //渲染线:第一次耗时3ms，之后耗时<0.1ms
    let geometryInstances = [];
    for (let i = 0; i < positions.length - 1; i++) {
      geometryInstances.push(
        new GeometryInstance({
          geometry: new PolylineGeometry({
            positions: [positions[i], positions[i + 1]],
            width: 8,
            vertexFormat: PolylineMaterialAppearance.VERTEX_FORMAT,
          }),
          attributes: {
            color: DefineColor.WHITE_ATTRIBUTE,
          },
        }),
      );
    }
    this.dataSource.add(
      new Primitive({
        geometryInstances: geometryInstances,
        appearance: this.arrowPolyline,
        asynchronous: true, //交给webWorker创建
        allowPicking: false,
      }),
    );
    this.viewer.scene.requestRender();
  }

  /**
   * 清除轨迹点、线
   */
  clearTraj() {
    this.dataSource.removeAll();
    this.primitive.handler.stopAll();
    Object.assign(this.primitive, {
      pointCollection: null,
      polyline: null,
      lastP: null,
      hoverP: null,
    });
    this.viewer.scene.requestRender();
  }

  /**
   * 设置活跃点
   * @param idx
   */
  setPointActive(idx) {
    if (!this.primitive.pointCollection) {
      return;
    }
    if (!!this.primitive.lastP) {
      this.setInActiveStyle(this.primitive.lastP);
    }
    let curP = this.primitive.pointCollection._pointPrimitives[idx];
    this.setActiveStyle(curP);
    let cartographic = Cartographic.fromCartesian(curP.position);
    this.primitive.handler.stop('MOUSE_MOVE');
    //提升镜头移动的时候性能
    setTimeout(() => {
      this.primitive.handler.start('MOUSE_MOVE');
    }, 1000);
    if (this.primitive.lastP) {
      cartographic.height = this.viewer.camera.positionCartographic.height;
      this.viewer.camera.setView({
        destination: Cartographic.toCartesian(cartographic),
      });
    } else {
      cartographic.height = 180;
      nioCamera.locatePosition({
        position: Cartographic.toCartesian(cartographic),
        duration: 1,
      });
    }
    this.primitive.lastP = curP;
  }

  /**
   * 更新轨迹点索引
   * @param increment 变更大小
   */
  addIdxHandler(increment) {
    let curIdx = aoTrajPointData.curIdx,
      newIdx = curIdx + increment,
      total = aoCheckTrajectoryLayer.trajPointList.length;
    if (curIdx === total - 1 && increment > 0) {
      newIdx = increment - 1;
    } else if (curIdx === 0 && increment < 0) {
      newIdx = total + increment;
    } else {
      if (newIdx > total - 1) {
        newIdx = total - 1;
      } else if (newIdx < 0) {
        newIdx = 0;
      }
    }
    aoTrajPointData.curIdx = newIdx;
  }

  /**
   * 设置活跃点样式
   * @param point
   */
  setActiveStyle(point) {
    if (point) {
      point.pixelSize = 12;
      point.color = this.innerActiveColor;
      point.outlineWidth = 3;
      point.outlineColor = this.outerActiveColor;
    }
  }

  /**
   * 设置不活跃点样式
   * @param point
   */
  setInActiveStyle(point) {
    if (point) {
      point.pixelSize = 6;
      point.outlineWidth = 2;
      point.color = this.innerColor;
      point.outlineColor = this.outerColor;
    }
  }

  /**
   * 修改搜索条件时，根据当前索引点指定范围搜索
   */
  searchWithFrame() {
    let pos;
    if (this.trajPointList.length === 0) {
      pos = Cartographic.fromCartesian(
        this.viewer.camera.pickEllipsoid(new Cartesian2(document.body.clientWidth / 2, document.body.clientHeight / 2)),
      );
      pos = [CMath.toDegrees(pos.longitude), CMath.toDegrees(pos.latitude), 0];
    } else {
      pos = this.trajPointList[aoTrajPointData.curIdx].position;
    }
    //搜索点周围100m
    let lp = this.viewer.scene.cartesianToCanvasCoordinates(
      Cartographic.toCartesian(Cartographic.fromDegrees(pos[0] - 0.001141 / 2, pos[1] - 0.000899 / 2, 0)),
    );
    let rp = this.viewer.scene.cartesianToCanvasCoordinates(
      Cartographic.toCartesian(Cartographic.fromDegrees(pos[0] + 0.001141 / 2, pos[1] + 0.000899 / 2, 0)),
    );
    this.request(lp, rp);
  }

  destroy() {}

  set show(value) {}
}

const aoCheckTrajectoryLayer = markRaw(new AoCheckTrajectoryLayer());

/**
 * 浏览器图片预缓存工厂
 */
const aoCacheImg = function (newIdx) {
  let list = aoCheckTrajectoryLayer.trajPointList;
  let sIdx = newIdx >= 10 ? newIdx - 10 : newIdx,
    eIdx = newIdx < list.length - 10 ? newIdx + 10 : list.length - 1;
  for (let i = sIdx; i < eIdx; i++) {
    preCache.download(list[i].img_url);
  }
};

export {
  aoCheckTrajectoryLayer,
  aoPanelVisible,
  aoVideoPanelVisible,
  aoVideoData,
  aoDataPanel,
  aoTrajPointData,
  aoCacheImg,
  imgNull,
};
