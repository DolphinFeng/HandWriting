import {PrimitiveCollection, Cesium3DTileStyle, Cesium3DTileset} from 'cesium';

import {reactive} from 'vue';
import {createViewer} from '../cesium/create-viewer.js';
import store from '../store/store.js';
import {Observer} from '../system/observer.js';
import {getParams, TileWidth} from '../system/tile-width.js';
import {NioMessage} from '../utils/utils.js';
import {renderPrimitiveManager} from '../model/render-primitive.ts';
import {omit} from 'lodash';
import {rollbackLineWidthCallback} from '../data-source/rollback/rollback-tilesets.ts';

let currentLineWidth = 1.0;

let roadTileSetContainer = null;
let roadTileSet = null;

let laneTileSetContainer = null;
let laneTileSet = null;

let lbTileSetContainer = null;
let lbTileSet = null;

let hdSpecTileSetContainer = null;
let hdSpecTileSet = null;

let sdLinkTileSetContainer = null;
let sdLinkTileSet = null;

export const ndsDesc = {
  laneBoundary: '车道线',
  lane: '车道',
  road: '道路',
  sdLink: 'sdLink',
};

export const ndsColor = {
  车道线: '#67C23A',
  车道: '#409EEF',
  道路: '#E8332F',
  sdLink: '#FF7902',
};

export const hdSpecDesc = {
  交通灯: '交通灯',
  停止线: '停止线',
  路面标识: '路面标识',
  ZONE: 'ZONE',
  停车位: '停车位',
};

export const inferSpecDesc = {
  车道线: '车道线',
  车道: '车道',
  道路: '道路',
  交通灯: '交通灯',
  停止线: '停止线',
  路面标识: '路面标识',
  ZONE: 'ZONE',
};

export const hdSpecOption = {
  交通灯: ['trafficLight'],
  停止线: ['stopLine'],
  路面标识: ['clearZone', 'crossWalk', 'arrow'],
  ZONE: ['waitingZone'],
  停车位: ['parkingArea'],
};

export function getHdSpec(spec) {
  for (const key in hdSpecOption) {
    if (hdSpecOption[key].includes(spec)) {
      return key;
    }
  }
  return '';
}

export function getHdSpecColor() {
  return {
    conditions: [
      ["${feature['type']} === 'trafficLight'", "color('red', 1.0)"],
      ["${feature['type']} === 'stopLine'", "color('#1ED0F7FF')"],
      ["${feature['type']} === 'clearZone'", "color('#01CF3FFF')"],
      ["${feature['type']} === 'crossWalk'", "color('#01CF3FFF')"],
      ["${feature['type']} === 'arrow'", "color('#AAAAAAFF')"],
      ["${feature['type']} === 'waitingZone'", "color('#FFA018FF')"],
      ["${feature['type']} === 'parkingArea'", "color('#FF56BCFF')"],
      ['true', "color('red', 1.0)"],
    ],
  };
}

export let ndsBaseLayerItems = reactive([
  {name: ndsDesc.laneBoundary, visible: localStorage.getItem(ndsDesc.laneBoundary) === 'false' ? false : true},
  {name: ndsDesc.lane, visible: localStorage.getItem(ndsDesc.lane) === 'true'},
  {name: ndsDesc.road, visible: localStorage.getItem(ndsDesc.road) === 'true'},
  {name: ndsDesc.sdLink, visible: localStorage.getItem(ndsDesc.sdLink) === 'true'},

  {name: hdSpecDesc.交通灯, visible: localStorage.getItem(hdSpecDesc.交通灯) === 'true'},
  {name: hdSpecDesc.停止线, visible: localStorage.getItem(hdSpecDesc.停止线) === 'true'},
  {name: hdSpecDesc.路面标识, visible: localStorage.getItem(hdSpecDesc.路面标识) === 'true'},
  {name: hdSpecDesc.ZONE, visible: localStorage.getItem(hdSpecDesc.ZONE) === 'true'},
  {name: hdSpecDesc.停车位, visible: localStorage.getItem(hdSpecDesc.停车位) === 'true'},
]);

export function setNdsBaseLayerItems(names) {
  for (let item of ndsBaseLayerItems) {
    item.visible = false;
  }

  for (let name of names) {
    for (let item of ndsBaseLayerItems) {
      if (item.name == name) {
        item.visible = true;
      }
    }
  }
}

const layerColor = {
  LaneBoundary: ndsColor.车道线,
  Lane: ndsColor.车道,
  Road: ndsColor.道路,
  TrafficLight: '#ff0000',
  StopLine: '#1ED0F7FF',
  RoadMark: '#AAAAAAFF',
  Zone: '#FFA018FF',
};

export const inferLayerColor = layerColor;
export let inferLayerItems = reactive([
  {
    name: inferSpecDesc.车道线,
    visible: localStorage.getItem(inferSpecDesc.车道线 + 'infer') !== 'false',
    value: 'LaneBoundary',
  },
  {name: inferSpecDesc.车道, visible: localStorage.getItem(inferSpecDesc.车道 + 'infer') !== 'false', value: 'Lane'},
  {name: inferSpecDesc.道路, visible: localStorage.getItem(inferSpecDesc.道路 + 'infer') !== 'false', value: 'Road'},
  {
    name: inferSpecDesc.交通灯,
    visible: localStorage.getItem(inferSpecDesc.交通灯 + 'infer') !== 'false',
    value: 'TrafficLight',
  },
  {
    name: inferSpecDesc.停止线,
    visible: localStorage.getItem(inferSpecDesc.停止线 + 'infer') !== 'false',
    value: 'StopLine',
  },
  {
    name: inferSpecDesc.路面标识,
    visible: localStorage.getItem(inferSpecDesc.路面标识 + 'infer') !== 'false',
    value: 'RoadMark',
  },
  {name: inferSpecDesc.ZONE, visible: localStorage.getItem(inferSpecDesc.ZONE + 'infer') !== 'false', value: 'Zone'},
]);

export function setInferLayerItems(names) {
  for (let item of inferLayerItems) {
    item.visible = false;
  }

  for (let name of names) {
    for (let item of inferLayerItems) {
      if (item.name == name) {
        item.visible = true;
      }
    }
  }
}

export const fusionLayerColor = layerColor;
export let fusionLayerItems = reactive([
  {
    name: inferSpecDesc.车道线,
    visible: localStorage.getItem(inferSpecDesc.车道线 + 'fusion') !== 'false',
    value: 'LaneBoundary',
  },
  {name: inferSpecDesc.车道, visible: localStorage.getItem(inferSpecDesc.车道 + 'fusion') !== 'false', value: 'Lane'},
  {name: inferSpecDesc.道路, visible: localStorage.getItem(inferSpecDesc.道路 + 'fusion') !== 'false', value: 'Road'},
  {
    name: inferSpecDesc.交通灯,
    visible: localStorage.getItem(inferSpecDesc.交通灯 + 'fusion') !== 'false',
    value: 'TrafficLight',
  },
  {
    name: inferSpecDesc.停止线,
    visible: localStorage.getItem(inferSpecDesc.停止线 + 'fusion') !== 'false',
    value: 'StopLine',
  },
  {
    name: inferSpecDesc.路面标识,
    visible: localStorage.getItem(inferSpecDesc.路面标识 + 'fusion') !== 'false',
    value: 'RoadMark',
  },
  {name: inferSpecDesc.ZONE, visible: localStorage.getItem(inferSpecDesc.ZONE + 'fusion') !== 'false', value: 'Zone'},
]);

export function setFusionLayerItems(names) {
  for (let item of fusionLayerItems) {
    item.visible = false;
  }

  for (let name of names) {
    for (let item of fusionLayerItems) {
      if (item.name == name) {
        item.visible = true;
      }
    }
  }
}

export function getInferLayerOption() {
  let res = [];
  for (let item of inferLayerItems) {
    if (item.visible) {
      res.push(item.value);
    }
  }

  return res;
}

export function getFusionLayerOption() {
  let res = [];
  for (let item of fusionLayerItems) {
    if (item.visible) {
      res.push(item.value);
    }
  }

  return res;
}

function getHDSpecOption() {
  let results = [];
  for (let item of ndsBaseLayerItems) {
    if (Object.keys(hdSpecDesc).includes(item.name) && item.visible) {
      const itemNames = Object.keys(hdSpecOption);
      for (let j = 0; j < itemNames.length; j++) {
        const itemName = itemNames[j];
        if (item.name == itemName) {
          results.push(...hdSpecOption[itemName]);
          break;
        }
      }
    }
  }

  if (results.length !== 0) {
    let expr = '';
    for (let i = 0; i < results.length; i++) {
      expr += "${feature['type']} === '" + results[i] + "'";
      expr += "||${feature['type']} === '" + results[i].toUpperCase() + "'";

      if (i !== results.length - 1) {
        expr += '||';
      }
    }
    return expr;
  } else {
    return false;
  }
}

export function getOrCreateNdsContainer(name) {
  let viewer = createViewer();
  if (name == ndsDesc.lane) {
    if (laneTileSetContainer == null) {
      laneTileSetContainer = new PrimitiveCollection();
      viewer.scene.primitives.add(laneTileSetContainer);
    }

    return laneTileSetContainer;
  } else if (name == ndsDesc.road) {
    if (roadTileSetContainer == null) {
      roadTileSetContainer = new PrimitiveCollection();
      viewer.scene.primitives.add(roadTileSetContainer);
    }

    return roadTileSetContainer;
  } else if (name == ndsDesc.laneBoundary) {
    if (lbTileSetContainer == null) {
      lbTileSetContainer = new PrimitiveCollection();
      viewer.scene.primitives.add(lbTileSetContainer);
    }

    return lbTileSetContainer;
  } else if (Object.keys(hdSpecDesc).includes(name)) {
    if (hdSpecTileSetContainer == null) {
      hdSpecTileSetContainer = new PrimitiveCollection();
      viewer.scene.primitives.add(hdSpecTileSetContainer);
    }

    return hdSpecTileSetContainer;
  } else if (name == ndsDesc.sdLink) {
    if (sdLinkTileSetContainer == null) {
      sdLinkTileSetContainer = new PrimitiveCollection();
      viewer.scene.primitives.add(sdLinkTileSetContainer);
    }

    return sdLinkTileSetContainer;
  }

  return undefined;
}

async function createNdsTileSet(url, color) {
  let tileStyle = new Cesium3DTileStyle({
    color: `color("${color}")`,
  });

  let spaceError = 4;
  let memoryUsage = 200;

  let tilesetOption = {
    url: url,
    shadows: false,
    maximumMemoryUsage: memoryUsage, //默认瓦片集最大内存512
    maximumScreenSpaceError: spaceError, //默认16，较高的值会导致视觉效果下降
  };

  try {
    let tileset = await new Cesium3DTileset(tilesetOption).readyPromise;
    tileset.style = tileStyle;
    tileset.style.geometryWidth = currentLineWidth;
    return tileset;
  } catch (error) {
    NioMessage('error', url + ', 加载失败: ' + error.message);
  }
}

async function createHdSpecTileSet(url, showExpr) {
  let color = getHdSpecColor();
  let tileStyle = new Cesium3DTileStyle({
    show: showExpr,
    color: color,
  });

  let spaceError = 4;
  let memoryUsage = 200;

  let tilesetOption = {
    url: url,
    shadows: false,
    maximumMemoryUsage: memoryUsage, //默认瓦片集最大内存512
    maximumScreenSpaceError: spaceError, //默认16，较高的值会导致视觉效果下降
  };

  try {
    let tileset = await new Cesium3DTileset(tilesetOption).readyPromise;
    tileset.style = tileStyle;
    tileset.style.geometryWidth = currentLineWidth;

    return tileset;
  } catch (error) {
    NioMessage('error', url + ', 加载失败: ' + error.message);
  }
}

const formWayMap = {
  0: 'unknown',
  1: '匝道',
  2: '服务区',
  3: '隧道',
  4: '桥',
  5: '交叉口内道路',
  6: '环岛',
  7: '掉头口',
  8: 'Built-up Area Road',
  9: 'Urban Road',
  10: '可移动桥',
  11: '其他',
  12: '收费站道路',
  13: '检查站道路',
  14: '停车场',
  15: '上下线分离',
  16: 'IC',
  17: 'JCT',
  18: '辅路',
  19: '主路',
  20: '主辅路出入口',
  21: '提前左转',
  22: '提前右转',
  23: '公交专用道',
};

const roadClassMap = {
  0: 'unknown',
  1: '高速',
  2: '城市快速路',
  3: '普通路',
  4: '服务区内部道路',
  11: '停车场内部道路',
};

function convertFormWay(formWayValue) {
  if (formWayValue == 0) {
    return '无属性';
  }

  let binaryStr = formWayValue.toString(2); // 转换为二进制字符串
  let result = [];
  for (let i = 0; i < binaryStr.length; i++) {
    if (binaryStr[i] === '1') {
      let index = binaryStr.length - 1 - i;
      if (formWayMap[index]) {
        result.push(formWayMap[index]);
      }
    }
  }

  return result.join(',');
}

//将sdLink返回的json转为geojson. cesium会回调本函数
function sdLinkJsonFormatFunc(payload) {
  try {
    if (!payload || !payload.tiles_data) {
      return {features: [], type: 'FeatureCollection'};
    }

    let features = [];

    for (let i = 0; i < payload.tiles_data.length; i++) {
      let sdLinks = payload.tiles_data[i].sdLinks;
      if (!sdLinks) continue;
      for (let sdLink of sdLinks) {
        let coordinates = sdLink.geometry.map((item) => {
          return [item.lon, item.lat];
        });
        let properties = omit(sdLink, ['geometry']);
        properties.formWay2 = convertFormWay(sdLink.formWay2) + ' (' + sdLink.formWay2 + ')';
        properties.roadClass2 = roadClassMap[properties.roadClass2] + ' (' + properties.roadClass2 + ')';
        let feature = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: coordinates,
          },
          properties: properties,
        };

        features.push(feature);
      }
    }

    return {
      type: 'FeatureCollection',
      features: features,
    };
  } catch (error) {
    console.log(error + '');
    return {features: [], type: 'FeatureCollection'};
  }
}

async function createSdLinkTileSet(url, mapVersion) {
  let tileStyle = new Cesium3DTileStyle({
    color: `color("${ndsColor.sdLink}")`,
  });

  let spaceError = 4;
  let memoryUsage = 200;

  let tilesetOption = {
    url: url,
    shadows: false,
    maximumMemoryUsage: memoryUsage,
    maximumScreenSpaceError: spaceError,
    customUri: window.api.sdLinkURL,
    queryParameters: {
      map_version: mapVersion + '',
      //map_version: '224030704',
    },
    jsonFormatFunc: sdLinkJsonFormatFunc,
  };

  try {
    let tileset = await new Cesium3DTileset(tilesetOption).readyPromise;
    tileset.style = tileStyle;
    tileset.style.geometryWidth = currentLineWidth;

    return tileset;
  } catch (error) {
    NioMessage('error', url + ', 加载失败: ' + error.message);
  }
}

export function setNdsTileSetVisible(name, visible) {
  let container = getOrCreateNdsContainer(name);
  container.show = visible;
}

export async function setHdSpecTileSetExpr(name) {
  let color = getHdSpecColor();
  let showExpr = getHDSpecOption();
  let container = getOrCreateNdsContainer(name);

  if (showExpr === false) {
    container.show = false;
  } else {
    container.show = true;
  }

  //const tileset = container.get(0);
  let tileset = await getOrCreateNdsTileSet(name);
  tileset.style = new Cesium3DTileStyle({
    show: showExpr,
    color: color,
  });

  tileset.style.geometryWidth = currentLineWidth;
}

export function isUseHuaiLai(version) {
  return true;
  // let versionStr = version + '';
  // //如果是9位，则最高位不参与排序
  // if (versionStr.length >= 9) {
  //   versionStr = versionStr.slice(1, 10);
  // }

  // let versionNum = parseInt(versionStr);
  // return versionNum > 23110401;
}

export function getBaseMapUrl(version) {
  let isUseHuailai = isUseHuaiLai(version);

  //如果大于这个版本，使用怀来环境
  if (isUseHuailai) {
    return window.api.baseMapHL;
  } else {
    return window.api.baseMap;
  }
}

export async function getOrCreateNdsTileSet(name) {
  let version = store.state.version.curVersion;
  let baseMapURL = getBaseMapUrl(version);

  if (name == ndsDesc.lane) {
    if (laneTileSet != null) {
      return laneTileSet;
    }

    let url = `${baseMapURL}/hd_map/china_json_${version}_new/lane/tileset.json`;
    laneTileSet = await createNdsTileSet(url, ndsColor.车道);
    let container = getOrCreateNdsContainer(name);
    container.add(laneTileSet);
    return laneTileSet;
  } else if (name == ndsDesc.road) {
    if (roadTileSet != null) {
      return roadTileSet;
    }

    let url = `${baseMapURL}/hd_map/china_json_${version}_new/road/tileset.json`;
    roadTileSet = await createNdsTileSet(url, ndsColor.道路);
    let container = getOrCreateNdsContainer(name);
    container.add(roadTileSet);
    return roadTileSet;
  } else if (name == ndsDesc.laneBoundary) {
    if (lbTileSet != null) {
      return lbTileSet;
    }

    let url = `${baseMapURL}/hd_map/china_json_${version}_new/laneboundary/tileset.json`;
    lbTileSet = await createNdsTileSet(url, ndsColor.车道线);
    let container = getOrCreateNdsContainer(name);
    container.add(lbTileSet);
    return lbTileSet;
  } else if (Object.keys(hdSpecDesc).includes(name)) {
    if (hdSpecTileSet != null) {
      return hdSpecTileSet;
    }

    let url = `${baseMapURL}/hd_map/china_json_${version}_new/other/tileset.json`;
    hdSpecTileSet = await createHdSpecTileSet(url, getHDSpecOption());
    let container = getOrCreateNdsContainer(name);
    container.add(hdSpecTileSet);
    return hdSpecTileSet;
  } else if (name == ndsDesc.sdLink) {
    if (sdLinkTileSet != null) {
      return sdLinkTileSet;
    }

    let url = `${baseMapURL}/dynamicMap/3dtile_uri_nds_bias/tileset.json`;
    sdLinkTileSet = await createSdLinkTileSet(url, version);
    let container = getOrCreateNdsContainer(name);
    container.add(sdLinkTileSet);
    return sdLinkTileSet;
  }

  return undefined;
}

export function clearNdsTileSet() {
  if (roadTileSetContainer) {
    roadTileSetContainer.removeAll();
  }

  roadTileSet = null;

  if (laneTileSetContainer) {
    laneTileSetContainer.removeAll();
  }

  laneTileSet = null;

  if (lbTileSetContainer) {
    lbTileSetContainer.removeAll();
  }

  lbTileSet = null;

  if (hdSpecTileSetContainer) {
    hdSpecTileSetContainer.removeAll();
  }

  hdSpecTileSet = null;

  if (sdLinkTileSetContainer) {
    sdLinkTileSetContainer.removeAll();
  }

  sdLinkTileSet = null;
}

//注册线宽调整函数
Observer.register(
  'tileScale',
  (() => {
    const getLineWidth = getParams([
      new TileWidth(100, 0.08),
      new TileWidth(500, 0.6),
      new TileWidth(1000, 1.5),
      new TileWidth(5000, 4),
      new TileWidth(1e4, 10),
      new TileWidth(3e4, 24),
      new TileWidth(1e5, 100),
    ]);
    return function ({distance}) {
      currentLineWidth = getLineWidth(distance);
      if (roadTileSet) {
        roadTileSet.style.geometryWidth = currentLineWidth;
      }

      if (laneTileSet) {
        laneTileSet.style.geometryWidth = currentLineWidth;
      }

      if (lbTileSet) {
        lbTileSet.style.geometryWidth = currentLineWidth;
      }

      if (hdSpecTileSet) {
        hdSpecTileSet.style.geometryWidth = currentLineWidth;
      }

      if (sdLinkTileSet) {
        sdLinkTileSet.style.geometryWidth = currentLineWidth;
      }

      renderPrimitiveManager.updateGeometryWidth(currentLineWidth);

      rollbackLineWidthCallback(currentLineWidth);
    };
  })(),
);
