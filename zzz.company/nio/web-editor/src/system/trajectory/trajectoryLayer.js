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
import request from '../../request/index.js';
import {createViewer} from '../../cesium/initMap.js';
import {getMonthBefore, nioCamera, NioMessage, parseLineWKT, parseTime} from '../../utils/utils.js';
import {markRaw, reactive, ref, watch} from 'vue';
import axios from 'axios';
import preCache from '../../js/preCache.js';
import {DefineColor} from '../../cesium/materail.js';
import {isNullObject, throttle} from '../../utils/compute.js';
import {LayerStyle} from '../layer/style/layerStyle.js';
import {setLoadingFrame} from './loadingFrame.js';
import {Layer} from '../layer/Layer.js';

const apiTrajectoryURL = api.apiTrajectoryURL;

/**
 * 时间范围
 */
const timeDuration = reactive({
  curDuration: 12,
  list: [
    {label: '近一年', value: 12},
    {label: '近半年', value: 6},
    {label: '近三个月', value: 3},
    {label: '近一个月', value: 1},
  ],
});

/**
 * 资料类型
 * @type {{SA_INGEST_OFFLINE: string, MW_INGEST_NOP: string, MW_INGEST_COLLECTION: string}}
 */
const TypeList = {
  MW_INGEST_NOP: '路测资料',
  MW_INGEST_COLLECTION: '采集资料',
  SA_INGEST_OFFLINE: '服务区资料',
};
const dataType = reactive({
  curType: undefined,
  list: [
    {label: '全部', value: undefined},
    {label: TypeList['MW_INGEST_NOP'], value: 'MW_INGEST_NOP'},
    {label: TypeList['MW_INGEST_COLLECTION'], value: 'MW_INGEST_COLLECTION'},
    {label: TypeList['SA_INGEST_OFFLINE'], value: 'SA_INGEST_OFFLINE'},
  ],
});

/**
 * 轨迹列表
 */
const dataPanel = reactive({
  loading: false, //是否正在加载
  cur: undefined, //当前轨迹
  list: [
    // {type: '路测资料', time: '2022-09-27', id: ''},
  ],
});

/**
 *轨迹点列表
 */
const trajPointData = reactive({
  curIdx: 0,
  imgPath: '',
  position: [],
  time: '',
  total: 0,
});

/**
 * 清除轨迹点相关信息
 */
const clearPointData = function () {
  trajectoryLayer.imagesPath = {};
  trajectoryLayer.trajPointList = [];
  Object.assign(trajPointData, {
    curIdx: 0,
    imgPath: '',
    position: [],
    time: '',
    total: 0,
  });
};

/**
 * 面板开关
 */
let panelVisible = ref(false);

/**
 * 将图片置为空状态，显示空面板
 */
const imgNull = ref(false);

//面板关闭后重置数据状态
watch(panelVisible, (newVal, oldVal) => {
  if (!newVal) {
    dataType.curType = undefined;
    timeDuration.curDuration = 12;
    trajectoryLayer.clearTraj();
    clearPointData();
  }
});

/**
 * 轨迹资料层样式
 */
class TrajectoryLayerStyle extends LayerStyle {
  constructor() {
    super();
  }
}

/**
 * 轨迹图层
 */
class TrajectoryLayer extends Layer {
  viewer = createViewer();
  imagesPath = {}; //图片名称：url映射
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
    super(true, '轨迹资料', [], new PrimitiveCollection(), true, true);
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
        trajPointData.curIdx !== pick.primitive._index
      ) {
        //将lastP置为null，这样在更新点位置的时候就能通过fly的方式移动
        this.setInActiveStyle(this.primitive.lastP);
        this.primitive.lastP = null;
        trajPointData.curIdx = pick.primitive._index;
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
   * 请求矩形范围内的轨迹列表
   * @param stPos{Cartesian2}
   * @param edPos{Cartesian2}
   */
  request(stPos, edPos) {
    this.cPos = setLoadingFrame(true, stPos, edPos);
    request
      .post(apiTrajectoryURL + '/nio/material/trajectory/List', {
        taskType: dataType.curType ? dataType.curType : undefined,
        geofence: this.getPolygon([stPos, edPos]),
        startTime: parseTime(getMonthBefore(timeDuration.curDuration)),
        endTime: parseTime(new Date()),
      })
      .then((res) => {
        let data = res.data.data;
        dataPanel.list = [];
        if (res.data.code === 0 && data !== null) {
          const sortList = [];
          for (let i = 0; i < data.length; i++) {
            //剔除部分只有轨迹没有照片的轨迹
            if (data[i].imagesPath) {
              sortList.push({
                id: data[i].id,
                type: TypeList[data[i].taskType],
                time: data[i].createTime ? data[i].createTime.slice(0, 10) : null,
              });
            }
          }
          //有的地方一片路测全都只有轨迹没有照片
          if (sortList.length === 0) {
            throw new Error();
          }
          sortList.sort((a, b) => {
            let aTime = new Date(a.time),
              bTime = new Date(b.time);
            return bTime - aTime;
          });
          dataPanel.list = sortList;
          //初始化默认请求第一条轨迹数据
          dataPanel.cur = dataPanel.list[0].id;
          this.requestTrajectory(dataPanel.cur);
          panelVisible.value = true;
        } else {
          throw new Error();
        }
      })
      .catch((err) => {
        NioMessage('warning', '没有轨迹数据', 1000);
        this.clearTraj();
        dataPanel.cur = undefined;
        clearPointData();
      })
      .finally(() => {
        setLoadingFrame(false);
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
        CMath.toRadians(this.trajPointList[trajPointData.curIdx].position[0]),
        CMath.toRadians(this.trajPointList[trajPointData.curIdx].position[1]),
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
   * 请求轨迹详细数据
   * @param id 轨迹id
   */
  requestTrajectory(id) {
    dataPanel.loading = true;
    //请求轨迹点列表约耗时0.8s
    request
      .post(apiTrajectoryURL + '/nio/material/trajectory/file/' + id)
      .then((res) => {
        if (res.data.code === 0) {
          let data = res.data.data;
          //部分区域没有资料图片数据,imagesPath返回null或者空对象
          if (
            data['imagesPath'] === null ||
            (data['imagesPath'] instanceof Object && isNullObject(data['imagesPath']))
          ) {
            throw new TypeError('图片数据丢失');
          }
          //请求轨迹点详细数据
          axios.get(data['trajPath']).then((res) => {
            if (!!res.data) {
              this.imagesPath = data['imagesPath'];
              let arr = res.data.split('\n'),
                tmp = [],
                pointList = [];
              for (let i = 1; i < arr.length; i++) {
                tmp = arr[i].split(',');
                if (tmp[0] === '') {
                  continue;
                }
                //坑：部分图片丢失了，丢失图片的点不做渲染
                if (tmp[5] in data['imagesPath']) {
                  pointList.push({
                    id: tmp[0],
                    position: [parseFloat(tmp[1]), parseFloat(tmp[2]), parseFloat(tmp[3])],
                    time: new Date(parseInt(tmp[4])),
                    name: tmp[5],
                    cloud: tmp[6],
                  });
                }
              }
              //获取距离当前旧轨迹点最近的新轨迹点索引
              const latestIdx = this.searchLatestPoint(pointList) ?? 0;
              this.trajPointList = pointList;

              Object.assign(trajPointData, {
                curIdx: latestIdx,
                imgPath: this.imagesPath[pointList[0].name],
                position: pointList[0].position,
                time: pointList[0].time,
                total: pointList.length,
              });
              cacheImg(0);
              this.createTrajectory(pointList); //初始化点、线
              this.setPointActive(latestIdx); //初始化设置活跃点
            }
          });
        } else {
          throw new Error();
        }
      })
      .catch((err) => {
        NioMessage('warning', '轨迹点查询失败', 2000);
        this.clearTraj();
        clearPointData();
      })
      .finally(() => {
        dataPanel.loading = false;
      });
  }

  /**
   * 根据屏幕上两点生成cesium世界的矩形WKT
   * @param winPosArray 左上、右下点坐标
   * @returns {string} WKT字符串
   */
  getPolygon(winPosArray) {
    let st = winPosArray[0],
      ed = winPosArray[1];
    let ellipsoid = this.viewer.scene.globe.ellipsoid;

    let tlPos = this.viewer.camera.pickEllipsoid(st, ellipsoid),
      brPos = this.viewer.camera.pickEllipsoid(ed, ellipsoid);
    let trPos = this.viewer.camera.pickEllipsoid(new Cartesian2(ed.x, st.y), ellipsoid),
      blPos = this.viewer.camera.pickEllipsoid(new Cartesian2(st.x, ed.y), ellipsoid);
    let arr = [tlPos, trPos, brPos, blPos, tlPos];
    let carArr = [];
    let res = 'POLYGON ((';
    let cartographic = new Cartographic();
    for (let i = 0; i < arr.length; i++) {
      Cartographic.fromCartesian(arr[i], ellipsoid, cartographic);
      carArr[i] = `${CMath.toDegrees(cartographic.longitude)} ${CMath.toDegrees(cartographic.latitude)}`;
    }
    res += carArr.join(',') + '))';
    return res;
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
    let curIdx = trajPointData.curIdx,
      newIdx = curIdx + increment,
      total = trajectoryLayer.trajPointList.length;
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
    trajPointData.curIdx = newIdx;
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
      pos = this.trajPointList[trajPointData.curIdx].position;
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

const trajectoryLayer = markRaw(new TrajectoryLayer());

/**
 * 浏览器图片预缓存工厂
 */
const cacheImg = function (newIdx) {
  let map = trajectoryLayer.imagesPath,
    list = trajectoryLayer.trajPointList;
  let sIdx = newIdx >= 10 ? newIdx - 10 : newIdx,
    eIdx = newIdx < list.length - 10 ? newIdx + 10 : list.length - 1;
  for (let i = sIdx; i < eIdx; i++) {
    preCache.download(map[list[i].name]);
  }
};

export {trajectoryLayer, panelVisible, timeDuration, dataType, dataPanel, trajPointData, cacheImg, imgNull};
