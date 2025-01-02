import {Observer} from '../../../js/observer.js';
import {wheelCallback} from '../../../event/mouse.js';
import {getParams, TileWidth} from './TileWidth.js';
import {HDMapTileLayer, HDMapTileLayer2} from './HDMapTileLayer.js';
import {DynamicTileLayer, DynamicPriorTileLayer, DynamicListPriorTileLayer} from './DynamicTileLayer.js';
import {NadPermissionLayer} from './nad-permission-layer.js';
import {SDLinkLayer} from './sdLink-layer.js';
import {markRaw} from 'vue';
import {LaneGroupTileLayer, ALLOW_ROAD} from './LaneGroupLayer.js';
import {allowTypeExpr} from '../laneGroupLayer/laneGroupLayer.js';
import {layerListItems, getHdSpecColor} from '../../../system/layer/layerController.js';
import {createViewer} from '../../../cesium/initMap.js';
import {setHdOptionExp} from '../../../views/map/layer/BaseMapConditionPanel.ts';
import {getNadPermissionTypeString, nadPermissionName} from '../../../views/map/layer/NadPermissionCondition.ts';
import store from '../../../store/index.js';

const baseMapURL = window.api.baseMap;

//nmap-1，nmap-3，nmap-5，AO，TC
//实际有五个图层，但是dynamicEventLayer在界面上被拆分为多个，是根据动态图层要素的source字段的值进行要素的显示/隐藏控制
export const dynamicLayerSourceType = [
  'nmap-1',
  'nmap-2',
  'nmap-3',
  'nmap-4',
  'nmap-5',
  'nmap-6',
  'nmap-7',
  'nmap-9',
  'nmap-10',
  'nmap-11',
  'ns_mock',
  'cxh_mock_odd',
  'ao',
  'tc',
  'nmap-12',
  'nmap-13',
];

export const dynamicLinkLayerSourceType = ['nmap-1', 'nmap-2'];

export const dynamicSDLinkLayerSourceType = ['nmap-1', 'nmap-2', 'nmap-3'];

export const dynamicRoadListPriorLayerSourceType = ['nmap-1-road', 'nmap-2-road']; // 动态图层-Road

export const dynamicListPriorLayerSourceType = ['nmap-1-sdlink', 'nmap-2-sdlink', 'nmap-3-sdlink']; // 动态图层-SDLink

export const dynamicPriorLayerSourceType = ['nmap-1', 'nmap-2', 'nmap-3', 'nmap-4'];

//hd的其他要素，用类型来控制相应要素的显示隐藏
export const hdSpecLayerOption = ['交通灯', '停止线', '路面标识', 'ZONE', '停车位'];

//dynamicLayerSourceType的别名，只用于界面展示
export const dynamicLayerSourceTypeAlias = {
  'nmap-1': 'ODD平台',
  'nmap-2': '腾讯',
  'nmap-3': 'nio_map_issue',
  'nmap-4': 'AO事件',
  'nmap-5': 'nio_map_permit',
  'nmap-6': '母库挖掘',
  'nmap-7': 'nio_map_permit_ramp',
  'nmap-9': '快修补匝道',
  'nmap-10': 'QA准出',
  'nmap-11': '伴生',
  cxh_mock_odd: 'cxh_mock_odd',
  ao: 'ao',
  tc: 'tc',
  // 'nmap-12': '挖掘经验轨迹',
  // 'nmap-13': '人工经验轨迹',
  ns_mock: '先验事件',
};

export const dynamicLinkLayerSourceTypeAlias = {
  'nmap-1-road': 'ODD平台',
  'nmap-2-road': '挖掘经验限速',
};

export const dynamicSDLinkLayerSourceTypeAlias = {
  'nmap-1-sdlink': 'ODD平台',
  'nmap-2-sdlink': '挖掘经验限速',
  'nmap-3-sdlink': '城区黑名单',
};

export const dynamicPriorLayerSourceTypeAlias = {
  'nmap-1': '城区白名单',
  'nmap-2': '城区黑名单',
  'nmap-3': '挖掘经验轨迹',
  'nmap-4': '挖掘经验限速',
};

function initHdMapLayer(name, color, memoryUsage, spaceError) {
  return new HDMapTileLayer(localStorage.getItem(name) === 'true', name, color, memoryUsage, spaceError);
}

function initSpecHdMapLayer(name, memoryUsage, spaceError) {
  let color = getHdSpecColor();
  return new HDMapTileLayer2(true, name, color, memoryUsage, spaceError);
}

//这里可以直接调用layerListItems的getSourceFilterExpr()。
//但是目前js代码写一起了，互相引用，有初始化顺序问题。先从本地存储获取，后面整理一下
function getInitSourceFilterExpr() {
  let results = [];
  for (let i = 0; i < dynamicLayerSourceType.length; i++) {
    if (localStorage.getItem(dynamicLayerSourceType[i]) === 'true') {
      results.push(dynamicLayerSourceType[i]);

      //tencent和tc按同类处理
      if (dynamicLayerSourceType[i] === 'tc') {
        results.push('tencent');
        results.push('Tencent');
      } else if (dynamicLayerSourceType[i] === 'nmap-1') {
        results.push('NMap-1');
      } else if (dynamicLayerSourceType[i] === 'nmap-2') {
        results.push('NMap-2');
      } else if (dynamicLayerSourceType[i] === 'nmap-3') {
        results.push('NMap-3');
      } else if (dynamicLayerSourceType[i] === 'nmap-4') {
        results.push('NMap-4');
      } else if (dynamicLayerSourceType[i] === 'nmap-5') {
        results.push('NMap-5');
      } else if (dynamicLayerSourceType[i] === 'nmap-6') {
        results.push('NMap-6');
      } else if (dynamicLayerSourceType[i] === 'nmap-7') {
        results.push('NMap-7');
      } else if (dynamicLayerSourceType[i] === 'nmap-9') {
        results.push('NMap-9');
      } else if (dynamicLayerSourceType[i] === 'nmap-10') {
        results.push('NMap-10');
      } else if (dynamicLayerSourceType[i] === 'nmap-11') {
        results.push('NMap-11');
      } else if (dynamicLayerSourceType[i] === 'cxh_mock_odd') {
        results.push('CXH_MOCK_ODD');
      } else if (dynamicLayerSourceType[i] === 'nmap-12') {
        results.push('NMap-12');
      } else if (dynamicLayerSourceType[i] === 'nmap-13') {
        results.push('NMap-13');
      } else if (dynamicLayerSourceType[i] === 'ns_mock') {
        results.push('NS_MOCK');
      }
    }
  }
  debugger;

  if (results.length !== 0) {
    let expr = '';
    for (let i = 0; i < results.length; i++) {
      expr += "${feature['source']} === '" + results[i] + "'";
      expr += "||${feature['source']} === '" + results[i].toUpperCase() + "'";
      if (i !== results.length - 1) {
        expr += '||';
      }
    }
    return expr;
  } else {
    return false;
  }
}

function getPriorInitSourceFilterExpr() {
  let results = [];
  for (let i = 0; i < dynamicPriorLayerSourceType.length; i++) {
    if (localStorage.getItem(dynamicPriorLayerSourceType[i]) === 'true') {
      results.push(dynamicPriorLayerSourceType[i]);

      //tencent和tc按同类处理
      if (dynamicPriorLayerSourceType[i] === 'nmap-1') {
        results.push('NMap-1');
      } else if (dynamicPriorLayerSourceType[i] === 'nmap-2') {
        results.push('NMap-2');
      } else if (dynamicPriorLayerSourceType[i] === 'nmap-3') {
        results.push('NMap-3');
      } else if (dynamicPriorLayerSourceType[i] === 'nmap-4') {
        results.push('NMap-4');
      }
    }
  }

  if (results.length !== 0) {
    let expr = '';
    for (let i = 0; i < results.length; i++) {
      expr += "${feature['source']} === '" + results[i] + "'";
      expr += "||${feature['source']} === '" + results[i].toUpperCase() + "'";
      if (i !== results.length - 1) {
        expr += '||';
      }
    }
    return expr;
  } else {
    return false;
  }
}

function initDynamicLayer(name, color, memoryUsage, spaceError) {
  return markRaw(new DynamicTileLayer(true, getInitSourceFilterExpr(), name, color, memoryUsage, spaceError));
}

function initPriorDynamicLayer(name, color, memoryUsage, spaceError) {
  return markRaw(new DynamicPriorTileLayer(true, getPriorInitSourceFilterExpr(), name, color, memoryUsage, spaceError));
}

function initDynamicListPriorEventLayer(name, color, memoryUsage, spaceError) {
  return markRaw(
    new DynamicListPriorTileLayer(true, getPriorInitSourceFilterExpr(), name, color, memoryUsage, spaceError),
  );
}

function initLaneGroupLayer(name, color, memoryUsage, spaceError) {
  return markRaw(
    new LaneGroupTileLayer(
      localStorage.getItem(name) === 'true',
      allowTypeExpr(),
      name,
      color,
      memoryUsage,
      spaceError,
    ),
  );
}

export const sdLinkLayerName = 'SDLink';

export const laneBoundaryLayer = initHdMapLayer('车道线', '#67C23A', 200, 4);
export const laneLayer = initHdMapLayer('车道', '#409EEF', 200, 4);
export const dynamicEventLayer = initDynamicLayer('动态图层', '#FF56BC', 200, 0.5);
export const priorDynamicEventLayer = initPriorDynamicLayer('先验事件动态图层', '#FF56BC', 200, 0.5);
export const dynamicListPriorEventLayer = initDynamicListPriorEventLayer(
  '动态列表先验事件动态图层',
  '#FF56BC',
  200,
  0.5,
);
export const roadLayer = initHdMapLayer('道路', '#E8332F', 200, 0.5);
export const sdLinkLayer = markRaw(
  new SDLinkLayer(localStorage.getItem(sdLinkLayerName) === 'true', sdLinkLayerName, '#FF7902', 200, 4),
);
export const hdSpecLayer = initSpecHdMapLayer('HD其他要素', 200, 0.5);
export const allowRoadLayer = initLaneGroupLayer(ALLOW_ROAD, '#000000', 200, 0.5);
export const nadLayer = markRaw(
  new NadPermissionLayer(localStorage.getItem(nadPermissionName) === 'true', nadPermissionName, '#000000', 200, 0.5),
);

const hdMapLayers = {
  车道线: laneBoundaryLayer,
  车道: laneLayer,
  道路: roadLayer,
  SDLink: sdLinkLayer,
  HD其他要素: hdSpecLayer,
  动态图层: dynamicEventLayer,
  动态列表先验事件动态图层: dynamicListPriorEventLayer,
  [ALLOW_ROAD]: allowRoadLayer,
  [nadPermissionName]: nadLayer,
};

/** 修改底图显示状态 */
export function setHdMapVisibleHandler(layerName, visible) {
  if (layerName in hdMapLayers) {
    const layer = hdMapLayers[layerName];
    layer.show = visible ? visible : !layer.show;
  }
}

/** 控制hd_map的线宽 */
Observer.register(
  'tileScale',
  (() => {
    const getLineWidth = getParams([
      new TileWidth(100, 0.15),
      new TileWidth(500, 0.8),
      new TileWidth(1000, 2),
      new TileWidth(5000, 4),
      new TileWidth(1e4, 10),
      new TileWidth(3e4, 24),
      new TileWidth(1e5, 100),
    ]);
    return function ({distance}) {
      for (let hdMapLayer of Object.values(hdMapLayers)) {
        let tileset = hdMapLayer.dataSource.get(0);
        if (tileset) {
          tileset.style.geometryWidth = getLineWidth(distance);
        }
      }
    };
  })(),
);

function isUseHuaiLai(version) {
  //全部使用怀来环境
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

//获取中间数据json
export function getBaseMapJsonUrl(version) {
  let isUseHuailai = isUseHuaiLai(version);

  //let isPsp = isPspVersion();
  let dir = /*isPsp ? 'service/' : */ 'nds/';

  //如果大于这个版本，使用怀来环境
  if (isUseHuailai) {
    return window.api.baseMapHL + '/prod/' + dir + version;
  } else {
    //去掉目录 'ln'
    let url = window.api.baseMap.substr(0, window.api.baseMap.length - 2);
    return url + 'nmap/prod/' + dir + version;
  }
}

export function switchHdMapVersion(version) {
  let baseMapURL = getBaseMapUrl(version);

  let loadingData = [
    laneBoundaryLayer.load3DTile(`${baseMapURL}/hd_map/china_json_${version}_new/laneboundary/tileset.json`),
    laneLayer.load3DTile(`${baseMapURL}/hd_map/china_json_${version}_new/lane/tileset.json`),
    roadLayer.load3DTile(`${baseMapURL}/hd_map/china_json_${version}_new/road/tileset.json`),
    sdLinkLayer.load3DTile(version),
    dynamicEventLayer.load3DTile(version, layerListItems.getSourceFilterExpr() /*getInitSourceFilterExpr()*/),
    priorDynamicEventLayer.load3DTile(
      version,
      layerListItems.getPriorSourceFilterExpr() /*getPriorInitSourceFilterExpr()*/,
    ),
    dynamicListPriorEventLayer.load3DTile(
      version,
      DynamicListPriorTileLayer.getInitialEts(),
      layerListItems.getPriorSourceFilterExprByEts(),
    ),
    allowRoadLayer.load3DTile(version, allowTypeExpr()),
  ];

  loadingData.push(nadLayer.load3DTile(store.state.version.curVersion, getNadPermissionTypeString()));

  //之前版本的数据，没有生成红绿灯等要素，直接清空即可
  if (isUseHuaiLai(version)) {
    loadingData.push(
      hdSpecLayer.load3DTile2(
        `${baseMapURL}/hd_map/china_json_${version}_new/other/tileset.json`,
        layerListItems.getHDSpecOption(),
      ),
    );
  } else {
    hdSpecLayer.dataSource.removeAll();
  }

  Promise.allSettled(loadingData).then(() => {
    if (layerListItems.items[3].show) {
      setHdOptionExp(sdLinkLayer);
    }

    if (layerListItems.items[2].show) {
      setHdOptionExp(roadLayer);
    }

    if (layerListItems.items[1].show) {
      setHdOptionExp(laneLayer);
    }

    if (layerListItems.items[0].show) {
      setHdOptionExp(laneBoundaryLayer);
    }
    wheelCallback();
  });
}

//wheel时间时会立即调用wheelCallback，调用时camera的位置是缩放前的。
//在相机移动结束后加个回调，此时的相机位置才是准确的
//此回调相应频率低，不会对性能造成明显影响
let viewer = createViewer();
viewer.scene.camera.moveEnd.addEventListener(() => {
  wheelCallback();
});
