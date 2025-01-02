import {reactive} from 'vue';
import {poll} from '../../worker/core.js';
import {getTileLevel} from '../../utils/utils.js';
import {getScreenPoint} from '../../utils/compute.js';
import {NioMessage, encodeCesiumId} from '../../utils/utils.js';
import {
  Cartesian3,
  Color,
  ColorGeometryInstanceAttribute,
  GeometryInstance,
  Material,
  PolygonGeometry,
  EllipsoidSurfaceAppearance,
  PerInstanceColorAppearance,
  PolygonOutlineGeometry,
  PolygonHierarchy,
  Primitive,
  PrimitiveCollection,
} from 'cesium';

import {createViewer} from '../../cesium/create-viewer.js';
import {PollTaskResult} from '../../worker/task-result.js';
import {wheelCallbacks, leftDownCallbacks} from '../../system/event.js';
import {ENUToGeodetic} from '../../utils/coordinate-transform.js';
import {NioGeoPoint} from '../../model/point.js';

export const crossDesc = {
  crossPoint: '路口',
  rampPoint: '匝道',
  mainRoad: '主路',
  roundAbout: '环岛',
  crossRoute: '路口 | 主路 | 匝道 | 环岛路径',
};

/**
 * 标注状态
 */
export enum MARK_STATUS {
  NONE = '1',
  NO_COLLECT = '2',
  COLLECTING = '3',
  COLLECTED = '4',
  PASSED = '5',
  INVALID = '6',
}

export const MARK_STATUS_DESC: {[key in MARK_STATUS]: string} = {
  [MARK_STATUS.NONE]: '未标注',
  [MARK_STATUS.NO_COLLECT]: '标注未通过-未补采',
  [MARK_STATUS.COLLECTING]: '标注未通过-补采中',
  [MARK_STATUS.COLLECTED]: '标注未通过-补采完成',
  [MARK_STATUS.PASSED]: '标注已通过',
  [MARK_STATUS.INVALID]: '标注无效',
};

export const MARK_STATUS_COLOR: {[key in MARK_STATUS]: string} = {
  [MARK_STATUS.NONE]: '#6D7278',
  [MARK_STATUS.NO_COLLECT]: '#E02020',
  [MARK_STATUS.COLLECTING]: '#FA6400',
  [MARK_STATUS.COLLECTED]: '#D7C344',
  [MARK_STATUS.PASSED]: '#44D7B6',
  [MARK_STATUS.INVALID]: '#CF199B',
};

/**
 * 采集状态
 */
export enum COLLECT_STATUS {
  NO_COLLECT = '2',
  COLLECTING = '3',
  COLLECTED = '1',
}

export const COLLECT_STATUS_COLOR: {[key in COLLECT_STATUS]: string} = {
  [COLLECT_STATUS.COLLECTED]: '#CDE5AA',
  [COLLECT_STATUS.NO_COLLECT]: '#B6B8BB',
  [COLLECT_STATUS.COLLECTING]: '#F8D293',
};

export const COLLECT_STATUS_DESC: {[key in COLLECT_STATUS]: string} = {
  [COLLECT_STATUS.NO_COLLECT]: '未采集',
  [COLLECT_STATUS.COLLECTING]: '采集中',
  [COLLECT_STATUS.COLLECTED]: '已采集',
};

export interface CrossRouteInfo {
  routeId: number;
  collectStatus: COLLECT_STATUS;
  markStatus: MARK_STATUS;
  routeLine: string;
  snapShotNum: number;
  points: NioGeoPoint[];
  annotation: string;
  annotated: boolean;
  kind: number;
  crossId: number;
}

export enum CROSS_RESUME_TYPE {
  MATERIAL = '3',
  MAPPING = '2',
  ANNOTATE = '1',
  ADJUSTING = '4',
}

export const CROSS_RESUME_TYPE_DESC: {[key in CROSS_RESUME_TYPE]: string} = {
  [CROSS_RESUME_TYPE.MATERIAL]: '入库资料',
  [CROSS_RESUME_TYPE.MAPPING]: '感知建图',
  [CROSS_RESUME_TYPE.ANNOTATE]: '标注处理',
  [CROSS_RESUME_TYPE.ADJUSTING]: '质检',
};

export interface CrossResumeInfo {
  id: string;
  time: string;
  operatorName: string;
  desc: string;
  type: CROSS_RESUME_TYPE;
  trajectory: string;
  picture: string;
  piontCloud: string;
  mergedPointCloud: string;
  text: string; //上面信息组合起来的描述性字符串
}

export let crossLayerItems = reactive([
  {
    name: crossDesc.crossPoint,
    visible: localStorage.getItem(crossDesc.crossPoint) == 'false' ? false : true,
  },
  {
    name: crossDesc.rampPoint,
    visible: localStorage.getItem(crossDesc.rampPoint) == 'false' ? false : true,
  },
  {
    name: crossDesc.mainRoad,
    visible: localStorage.getItem(crossDesc.mainRoad) == 'false' ? false : true,
  },
  {
    name: crossDesc.roundAbout,
    visible: localStorage.getItem(crossDesc.roundAbout) == 'false' ? false : true,
  },
  {
    name: crossDesc.crossRoute,
    visible: localStorage.getItem(crossDesc.crossRoute) == 'false' ? false : true,
  },
]);

export function setCrossLayerItems(names: string[]) {
  for (let item of crossLayerItems) {
    item.visible = false;
  }

  for (let name of names) {
    for (let item of crossLayerItems) {
      if (item.name == name) {
        item.visible = true;
      }
    }
  }
}

const loadingTaskQueue: any = [];

export const crossTileLayer = {
  loading: false,
  crossIdMap: new Map(),
  polygonCollectionCross: new PrimitiveCollection(),
  polygonCollectionRamp: new PrimitiveCollection(),
  polygonCollectionMainRoad: new PrimitiveCollection(),
  polygonCollectionRoundAbout: new PrimitiveCollection(),
};

export function clearCrossTiles() {
  crossTileLayer.polygonCollectionCross.removeAll();
  crossTileLayer.polygonCollectionRamp.removeAll();
  crossTileLayer.polygonCollectionMainRoad.removeAll();
  crossTileLayer.polygonCollectionRoundAbout.removeAll();
  crossTileLayer.crossIdMap.clear();
}

export function setTileLayerVisible() {
  for (let item of crossLayerItems) {
    if (item.name == crossDesc.crossPoint) {
      crossTileLayer.polygonCollectionCross.show = item.visible;
    }
    if (item.name == crossDesc.rampPoint) {
      crossTileLayer.polygonCollectionRamp.show = item.visible;
    }
    if (item.name == crossDesc.mainRoad) {
      crossTileLayer.polygonCollectionMainRoad.show = item.visible;
    }
    if (item.name == crossDesc.roundAbout) {
      crossTileLayer.polygonCollectionRoundAbout.show = item.visible;
    }
  }
}
setTileLayerVisible();

function getCircleCoordinates(radius, seg) {
  let angle = 360.0 / seg;
  let coords: any = [];

  // 将角度转换为弧度
  angle = angle * (Math.PI / 180);

  for (let i = 0; i < seg; i++) {
    // 计算圆上点的坐标
    let x = radius * Math.cos(angle * i);
    let y = radius * Math.sin(angle * i);
    coords.push([x, y]);
  }

  return coords;
}

function getEquilateralTriangleCoordinates(sideLength: number): number[][] {
  const height = (Math.sqrt(3) / 2) * sideLength;
  const halfSide = sideLength / 2;

  // 计算三角形的中心点
  const centerX = sideLength / 2;
  const centerY = height / 3;

  const coords = [
    [-centerX, -centerY], // 第一个顶点
    [centerX, -centerY], // 第二个顶点
    [0, 2 * centerY], // 第三个顶点
  ];

  return coords;
}
async function loadingCrossTileFunc(payload, crossIdMap) {
  try {
    crossTileLayer.loading = true;

    const taskResult = await poll.start('loadingSourceCrossTile', {
      //@ts-ignore
      url: window.api.markPlatformUrl + '/pt/mark/getCrossByRange',
      payload: payload,
      crossIdMap: crossIdMap,
    });
    handleCrossTileData(taskResult);
  } catch (error: any) {
    console.error(error);
    NioMessage('error', 'NAD tile 获取失败：' + error.message, 2000);
  } finally {
    crossTileLayer.loading = false;
    if (loadingTaskQueue.length > 0) {
      loadingTaskQueue[0]();
      loadingTaskQueue.shift();
    }
  }
}

const crossPointHeight = 0.1;

let viewer = createViewer();
viewer.scene.primitives.add(crossTileLayer.polygonCollectionCross);
viewer.scene.primitives.add(crossTileLayer.polygonCollectionRamp);
viewer.scene.primitives.add(crossTileLayer.polygonCollectionMainRoad);
viewer.scene.primitives.add(crossTileLayer.polygonCollectionRoundAbout);

function loadCrossData(nadTiles) {
  //先简单加一个限制
  if (crossTileLayer.crossIdMap.size > 5000) {
    clearCrossTiles();
  }

  nadTiles.forEach((item) => {
    if (crossTileLayer.crossIdMap.get(item.projectId + '_' + item.crossId)) {
      return;
    }

    crossTileLayer.crossIdMap.set(item.projectId + '_' + item.crossId, true);
    let features = JSON.parse(item.locationWkt);
    let annoStatus = item.status as MARK_STATUS;

    let lon = features.coordinates[0];
    let lat = features.coordinates[1];

    let coordinates: any = [];
    let cesiumId = '';

    if (item.projectId && item.projectId == 10069) {
      // 匝道三角形
      let enuCoords = getEquilateralTriangleCoordinates(40);
      for (let coord of enuCoords) {
        let geoCoord = ENUToGeodetic(coord[0], coord[1], 0, lon, lat, 0);
        coordinates.push(Cartesian3.fromDegrees(geoCoord.lon, geoCoord.lat, 1));
      }
      cesiumId = encodeCesiumId('rampPoint', item.crossId, item.projectId);
    } else if (item.projectId && item.projectId == 10108) {
      // 环岛圆形
      let enuCoords = getCircleCoordinates(20, 30);
      for (let coord of enuCoords) {
        let geoCoord = ENUToGeodetic(coord[0], coord[1], 0, lon, lat, 0);
        coordinates.push(Cartesian3.fromDegrees(geoCoord.lon, geoCoord.lat, 1));
      }
      cesiumId = encodeCesiumId('rampPoint', item.crossId, item.projectId);
    } else if (item.projectId && item.projectId == 10068) {
      //先转为enu坐标，外扩为10米
      let leftTop = ENUToGeodetic(25, 25, 0, lon, lat, 0);
      let rightBottom = ENUToGeodetic(-25, -25, 0, lon, lat, 0);
      coordinates.push(Cartesian3.fromDegrees(leftTop.lon, leftTop.lat, 1));
      coordinates.push(Cartesian3.fromDegrees(leftTop.lon, rightBottom.lat, 1));
      coordinates.push(Cartesian3.fromDegrees(rightBottom.lon, rightBottom.lat, 1));
      coordinates.push(Cartesian3.fromDegrees(rightBottom.lon, leftTop.lat, 1));
      cesiumId = encodeCesiumId('crossPoint', item.crossId, item.projectId);
    } else if (item.projectId && item.projectId == 10106) {
      let leftTop = ENUToGeodetic(50, 25, 0, lon, lat, 0);
      let rightBottom = ENUToGeodetic(-50, -25, 0, lon, lat, 0);
      coordinates.push(Cartesian3.fromDegrees(leftTop.lon, leftTop.lat, 1));
      coordinates.push(Cartesian3.fromDegrees(leftTop.lon, rightBottom.lat, 1));
      coordinates.push(Cartesian3.fromDegrees(rightBottom.lon, rightBottom.lat, 1));
      coordinates.push(Cartesian3.fromDegrees(rightBottom.lon, leftTop.lat, 1));
      cesiumId = encodeCesiumId('crossPoint', item.crossId, item.projectId);
    }

    let polygonHierarchy = new PolygonHierarchy(coordinates);

    let polygonGeometry = new PolygonGeometry({
      polygonHierarchy: polygonHierarchy,
      height: crossPointHeight,
    });

    let colorString = MARK_STATUS_COLOR[annoStatus];
    let color = Color.fromCssColorString(colorString + '80'); //加上透明度

    let primitive = new Primitive({
      geometryInstances: new GeometryInstance({
        id: cesiumId,
        geometry: polygonGeometry,
      }),
      appearance: new EllipsoidSurfaceAppearance({
        aboveGround: false,
        material: Material.fromType('Color', {
          color: color, //匝道颜色
        }),
      }),
    });

    if (item.projectId && item.projectId == 10069) {
      crossTileLayer.polygonCollectionRamp.add(primitive);
    } else if (item.projectId && item.projectId == 10068) {
      crossTileLayer.polygonCollectionCross.add(primitive);
    } else if (item.projectId && item.projectId == 10108) {
      crossTileLayer.polygonCollectionRoundAbout.add(primitive);
    } /*if(item.projectId && item.projectId == 10106) */ else {
      crossTileLayer.polygonCollectionMainRoad.add(primitive);
    }

    let outlinePolygon = new PolygonOutlineGeometry({
      polygonHierarchy: polygonHierarchy,
      height: crossPointHeight,
    });
    let outlinePrimitive = new Primitive({
      geometryInstances: new GeometryInstance({
        geometry: outlinePolygon,
        attributes: {
          color: ColorGeometryInstanceAttribute.fromColor(Color.BLACK), //匝道边框颜色
        },
      }),
      appearance: new PerInstanceColorAppearance({
        flat: true,
        translucent: false,
      }),
    });

    if (item.projectId && item.projectId == 10069) {
      crossTileLayer.polygonCollectionRamp.add(outlinePrimitive);
    } else if (item.projectId && item.projectId == 10068) {
      crossTileLayer.polygonCollectionCross.add(outlinePrimitive);
    } else if (item.projectId && item.projectId == 10108) {
      crossTileLayer.polygonCollectionRoundAbout.add(outlinePrimitive);
    } else if (item.projectId && item.projectId == 10106) {
      crossTileLayer.polygonCollectionMainRoad.add(outlinePrimitive);
    }
  });
}

function handleCrossTileData(taskResult) {
  if (taskResult.code === PollTaskResult.SUCCESS) {
    loadCrossData(taskResult.data.data);
  } else {
    throw new Error('handleCrossTileData 错误:' + taskResult.data.toString());
  }
}

export const loadCrossTileHandler = async (forceLoad) => {
  let visible = false;
  for (let crossLayerItem of crossLayerItems) {
    if (crossLayerItem.name == crossDesc.crossPoint && crossLayerItem.visible == true) {
      visible = true;
    }
    if (crossLayerItem.name == crossDesc.rampPoint && crossLayerItem.visible == true) {
      visible = true;
    }
    if (crossLayerItem.name == crossDesc.roundAbout && crossLayerItem.visible == true) {
      visible = true;
    }
  }

  if (visible == false) {
    return;
  }

  if (getTileLevel() <= 13 || (crossTileLayer.loading === true && forceLoad !== true)) {
    return;
  }

  const width = document.body.clientWidth;
  const height = document.body.clientHeight;
  const crossIdMap = crossTileLayer.crossIdMap;
  let lb = getScreenPoint(0, height);
  let rt = getScreenPoint(width, 0);
  const leftBottomX = lb.longitude;
  const leftBottomY = lb.latitude;
  const rightTopX = rt.longitude;
  const rightTopY = rt.latitude;

  const payload = {
    leftBottomX,
    leftBottomY,
    rightTopX,
    rightTopY,
  };

  if (crossTileLayer.loading === false) {
    loadingCrossTileFunc(payload, crossIdMap);
  } else {
    new Promise((resolve) => {
      loadingTaskQueue.push(resolve);
    }).then(() => {
      loadingCrossTileFunc(payload, crossIdMap);
    });
  }
};
