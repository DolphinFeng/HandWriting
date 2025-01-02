import {markRaw, reactive} from 'vue';
import {createViewer} from '../../cesium/initMap.js';
import {
  dynamicEventLayer,
  dynamicListPriorEventLayer,
  laneBoundaryLayer,
  laneLayer,
  roadLayer,
  dynamicLayerSourceType,
  allowRoadLayer,
  nadLayer,
  hdSpecLayer,
  hdSpecLayerOption,
  dynamicLinkLayerSourceType,
  dynamicSDLinkLayerSourceType,
  dynamicPriorLayerSourceType,
  dynamicListPriorLayerSourceType,
  dynamicRoadListPriorLayerSourceType,
  sdLinkLayer,
} from './tileLayer/tileLayerController.js';
import {oddLayer} from '../odd/oddLayer.js';

export const layerSpecType = {
  none: 'none',
  dynamic: 'dynamic',
  linkDynamic: 'linkDynamic',
  sdLinkDynamic: 'sdLinkDynamic',
  priorDynamic: 'priorDynamic',
  dynamicListPriorEvent: 'dynamicListPriorEvent',
  dynamicEvent: 'dynamicEvent',
  specHd: 'specHd',
  sdLink: 'sdLink',
};

class LayerController {
  /**
   * 图层列表
   * @type{[Layer]}
   */
  layers = [];

  /**
   * 根据id查询layer的map
   * @type{Map<number,Layer>}
   */
  map = markRaw(new Map());

  viewer = createViewer();

  constructor() {}

  //加载custom和wkt图层会调用
  unshift(layer) {
    this.layers.unshift(markRaw(layer));
    this.map.set(layer.id, layer);
    this.#addDataSource(layer.dataSource);

    customLayerListItems.push({
      name: layer.name,
      item_id: getNewItemId(),
      layer_id: layer.id,
      type: layerSpecType.none,
      show: true,
    });
  }

  //初始化加载固定的几个图层
  init_push(layer) {
    this.layers.push(markRaw(layer));
    this.map.set(layer.id, layer);

    this.#addDataSource(layer.dataSource);
  }

  /**
   * 根据图层标识符查询图层
   * @param id{number|string}
   * @return {Layer}
   */
  getLayerById(id) {
    return this.map.get(parseInt(id));
  }

  #addDataSource(dataSource) {
    this.viewer.scene.primitives.add(dataSource);
  }

  /**
   * 移除图层
   * @param id{number|string} 图层标识符
   */
  removeLayer(id) {
    let item = layerListItems.getItemById(parseInt(id));
    if (item === undefined) {
      item = customLayerListItems.getItemById(parseInt(id));
    }

    let layer_id = parseInt(item.layer_id);
    for (let i = 0; i < this.layers.length; i++) {
      if (this.layers[i].id === layer_id) {
        this.layers[i].destroy();
        this.layers.splice(i, 1);
        this.map.delete(layer_id);
        break;
      }
    }

    let index = customLayerListItems.items.indexOf(item);
    if (index !== -1) {
      customLayerListItems.items.splice(index, 1);
    } else {
      let index = layerListItems.items.indexOf(item);
      if (index !== -1) {
        layerListItems.items.splice(index, 1);
      }
    }
  }

  /**
   * 定位图层
   * @param id{number}
   */
  location(id) {
    let item = layerListItems.getItemById(parseInt(id));
    if (item === undefined) {
      item = customLayerListItems.getItemById(parseInt(id));
    }
    this.getLayerById(item.layer_id).location();
  }
}

/** @type{LayerController} */ //实际图层模型数据的容器
export const layerController = new LayerController();

layerController.init_push(laneBoundaryLayer); //车道线
layerController.init_push(laneLayer); //车道
layerController.init_push(roadLayer); //道路
layerController.init_push(sdLinkLayer); //sdLink
layerController.init_push(hdSpecLayer);
layerController.init_push(dynamicEventLayer); //动态图层
layerController.init_push(oddLayer); //事件
layerController.init_push(allowRoadLayer); //放行道路
layerController.init_push(dynamicListPriorEventLayer); // 动态列表先验事件动态图层

//放到此处。scene.primitives.add添加的顺序会影响到图层渲染的压盖顺序。
createViewer().scene.primitives.add(nadLayer.dataSource);

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

export const hdSpecOption = {
  交通灯: ['trafficLight'],
  停止线: ['stopLine'],
  路面标识: ['clearZone', 'crossWalk', 'arrow'],
  ZONE: ['waitingZone'],
  停车位: ['parkingArea'],
};

export function getHdSpecKeyByValue(value) {
  for (const key in hdSpecOption) {
    if (hdSpecOption[key].includes(value)) {
      return key;
    }
  }
  return null;
}

//界面列表展示的数据项，item与layerController里的layer是一对多(动态图层)或者一对一的关系
class LayerListItems {
  items = reactive([]);

  push(item) {
    this.items.push(item);
  }

  unshift(item) {
    this.items.unshift(item);
  }

  getItemById(id) {
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (item.item_id === id) {
        return item;
      }
    }

    return undefined;
  }

  getHDSpecOption() {
    let results = [];
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (item.type == layerSpecType.specHd && item.show) {
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

  getSourceFilterExpr() {
    debugger;
    let results = [];
    let linkResults = [];
    let sdLinkResults = [];
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (
        (item.type == layerSpecType.dynamic ||
          item.type == layerSpecType.linkDynamic ||
          item.type == layerSpecType.sdLinkDynamic) &&
        item.show
      ) {
        if (item.type == layerSpecType.dynamic) {
          results.push(item.name);
          //tencent和tc按同类处理
          if (item.name === 'tc') {
            results.push('tencent');
            results.push('Tencent');
          } else if (item.name === 'nmap') {
            results.push('NMap');
          } else if (item.name === 'nmap-1') {
            results.push('NMap-1');
            results.push('nmap-event-1');
          } else if (item.name === 'nmap-2') {
            results.push('NMap-2');
            results.push('nmap-event-2');
          } else if (item.name === 'nmap-3') {
            results.push('NMap-3');
            results.push('nmap-event-3');
          } else if (item.name === 'nmap-4') {
            results.push('NMap-4');
            results.push('nmap-event-4');
          } else if (item.name === 'nmap-5') {
            results.push('NMap-5');
            results.push('nmap-event-5');
          } else if (item.name === 'nmap-6') {
            results.push('NMap-6');
            results.push('nmap-event-6');
          } else if (item.name === 'nmap-7') {
            results.push('NMap-7');
            results.push('nmap-event-7');
          } else if (item.name === 'nmap-9') {
            results.push('NMap-9');
            results.push('nmap-event-9');
          } else if (item.name === 'nmap-10') {
            results.push('NMap-10');
            results.push('nmap-event-10');
          } else if (item.name === 'nmap-11') {
            results.push('NMap-11');
            results.push('nmap-event-11');
          } else if (item.name === 'cxh_mock_odd') {
            results.push('CXH_MOCK_ODD');
          } else if (item.name === 'ns_mock') {
            results.push('NS_MOCK');
          }
        } else if (item.type == layerSpecType.linkDynamic) {
          linkResults.push(item.name);
          //tencent和tc按同类处理
          if (item.name === 'tc') {
            linkResults.push('tencent');
            linkResults.push('Tencent');
          } else if (item.name === 'nmap') {
            linkResults.push('NMap');
          } else if (item.name === 'nmap-1') {
            linkResults.push('NMap-1');
            linkResults.push('nmap-event-1');
          } else if (item.name === 'nmap-2') {
            linkResults.push('NMap-2');
            linkResults.push('nmap-event-2');
          } else if (item.name === 'nmap-3') {
            linkResults.push('NMap-3');
            linkResults.push('nmap-event-3');
          } else if (item.name === 'nmap-4') {
            linkResults.push('NMap-4');
            linkResults.push('nmap-event-4');
          } else if (item.name === 'nmap-5') {
            linkResults.push('NMap-5');
            linkResults.push('nmap-event-5');
          } else if (item.name === 'nmap-6') {
            linkResults.push('NMap-6');
            linkResults.push('nmap-event-6');
          } else if (item.name === 'nmap-7') {
            linkResults.push('NMap-7');
            linkResults.push('nmap-event-7');
          } else if (item.name === 'nmap-9') {
            linkResults.push('NMap-9');
            linkResults.push('nmap-event-9');
          } else if (item.name === 'nmap-10') {
            linkResults.push('NMap-10');
            linkResults.push('nmap-event-10');
          } else if (item.name === 'nmap-11') {
            linkResults.push('NMap-11');
            linkResults.push('nmap-event-11');
          } else if (item.name === 'cxh_mock_odd') {
            linkResults.push('CXH_MOCK_ODD');
          } else if (item.name === 'ns_mock') {
            linkResults.push('NS_MOCK');
          }
        } else if (item.type == layerSpecType.sdLinkDynamic) {
          sdLinkResults.push(item.name);
          //tencent和tc按同类处理
          if (item.name === 'nmap-1') {
            sdLinkResults.push('NMap-1');
            sdLinkResults.push('nmap-event-1');
          } else if (item.name === 'nmap-2') {
            sdLinkResults.push('NMap-2');
            sdLinkResults.push('nmap-event-2');
          } else if (item.name === 'nmap-3') {
            sdLinkResults.push('NMap-3');
            sdLinkResults.push('nmap-event-3');
          }
        }
      }
    }

    if (results.length == 0 && linkResults.length == 0 && sdLinkResults.length == 0) {
      return false;
    }

    let expr = '';
    if (results.length !== 0) {
      for (let i = 0; i < results.length; i++) {
        expr += "${feature['source']} === '" + results[i] + "'";
        expr += "||${feature['source']} === '" + results[i].toUpperCase() + "'";

        if (i !== results.length - 1) {
          expr += '||';
        }
      }
    }

    if (expr !== '') {
      expr = "${feature['is_link']} === 0&&(" + expr + ')';
    }

    let linkExpr = '';
    if (linkResults.length !== 0) {
      for (let i = 0; i < linkResults.length; i++) {
        linkExpr += "${feature['source']} === '" + linkResults[i] + "'";
        linkExpr += "||${feature['source']} === '" + linkResults[i].toUpperCase() + "'";

        if (i !== linkResults.length - 1) {
          linkExpr += '||';
        }
      }
    }

    if (linkExpr !== '') {
      linkExpr = "${feature['is_link']} === 1&&(" + linkExpr + ')';
    }

    let sdLinkExpr = '';
    if (linkResults.length !== 0) {
      for (let i = 0; i < linkResults.length; i++) {
        sdLinkExpr += "${feature['source']} === '" + linkResults[i] + "'";
        sdLinkExpr += "||${feature['source']} === '" + linkResults[i].toUpperCase() + "'";

        if (i !== linkResults.length - 1) {
          sdLinkExpr += '||';
        }
      }
    }

    if (sdLinkExpr !== '') {
      sdLinkExpr = "${feature['is_link']} === 1&&(" + sdLinkExpr + ')';
    }

    if (expr.length == 0) {
      if (linkExpr.length == 0 && sdLinkExpr.length !== 0) {
        return sdLinkExpr;
      } else if (linkExpr.length !== 0 && sdLinkExpr.length == 0) {
        return linkExpr;
      } else if (linkExpr.length !== 0 && sdLinkExpr.length !== 0) {
        return linkExpr + '||' + sdLinkExpr;
      }
    } else if (linkExpr.length == 0) {
      if (expr.length == 0 && sdLinkExpr.length !== 0) {
        return sdLinkExpr;
      } else if (expr.length !== 0 && sdLinkExpr.length == 0) {
        return expr;
      } else if (expr.length !== 0 && sdLinkExpr.length !== 0) {
        return expr + '||' + sdLinkExpr;
      }
    } else if (sdLinkExpr.length == 0) {
      if (expr.length == 0 && linkExpr.length !== 0) {
        return linkExpr;
      } else if (expr.length !== 0 && linkExpr.length == 0) {
        return expr;
      } else if (expr.length !== 0 && linkExpr.length !== 0) {
        return expr + '||' + linkExpr;
      }
    }

    return expr + '||' + linkExpr + '||' + sdLinkExpr;
  }

  getPriorSourceFilterExpr() {
    let priorResults = [];
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (item.type == layerSpecType.priorDynamic && item.show) {
        priorResults.push(item.name);

        if (item.name === 'nmap-1') {
          priorResults.push('NMap-1');
          priorResults.push('nmap-event-1');
        } else if (item.name === 'nmap-2') {
          priorResults.push('NMap-2');
          priorResults.push('nmap-event-2');
        } else if (item.name === 'nmap-3') {
          priorResults.push('NMap-3');
          priorResults.push('nmap-event-3');
        } else if (item.name === 'nmap-4') {
          priorResults.push('NMap-4');
          priorResults.push('nmap-event-4');
        }
      }
    }

    if (priorResults.length == 0) {
      return false;
    }

    let priorExpr = '';
    if (priorResults.length !== 0) {
      for (let i = 0; i < priorResults.length; i++) {
        priorExpr += "${feature['source']} === '" + priorResults[i] + "'";
        priorExpr += "||${feature['source']} === '" + priorResults[i].toUpperCase() + "'";

        if (i !== priorResults.length - 1) {
          priorExpr += '||';
        }
      }
    }

    if (priorExpr !== '') {
      priorExpr = "${feature['is_link']} === 2&&(" + priorExpr + ')';
    }

    return priorExpr;
  }

  getPriorSourceFilterExprByEts() {
    debugger;
    let priorResults = [];
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (item.type == layerSpecType.dynamicListPriorEvent && layerSpecType.dynamicEvent && item.show) {
        priorResults.push(item.name);
      }
    }
    if (priorResults.length == 0) {
      return false;
    }
    let priorExpr = '';
    let hasLink = false;
    let hasSdLink = false;

    for (let i = 0; i < priorResults.length; i++) {
      if (priorResults[i].endsWith('-road')) {
        hasLink = true;
      } else if (priorResults[i].endsWith('-sdlink')) {
        hasSdLink = true;
      }
    }

    if (hasLink && !hasSdLink) {
      priorExpr = "${feature['id_type']} === 'link'";
    } else if (!hasLink && hasSdLink) {
      priorExpr = "${feature['id_type']} === 'sdlink'";
    } else if (hasLink && hasSdLink) {
      priorExpr = "${feature['id_type']} === 'link' || ${feature['id_type']} === 'sdlink'";
    }

    return priorExpr;
  }
}

let item_id = 0;
function getNewItemId() {
  return item_id++;
}

export const layerListItems = new LayerListItems();
layerListItems.push({
  name: laneBoundaryLayer.name,
  item_id: getNewItemId(),
  layer_id: laneBoundaryLayer.id,
  type: layerSpecType.none,
  show: laneBoundaryLayer.show,
});
layerListItems.push({
  name: laneLayer.name,
  item_id: getNewItemId(),
  layer_id: laneLayer.id,
  type: layerSpecType.none,
  show: laneLayer.show,
});
layerListItems.push({
  name: roadLayer.name,
  item_id: getNewItemId(),
  layer_id: roadLayer.id,
  type: layerSpecType.none,
  show: roadLayer.show,
});
layerListItems.push({
  name: sdLinkLayer.name,
  item_id: getNewItemId(),
  layer_id: sdLinkLayer.id,
  type: layerSpecType.sdLink,
  show: sdLinkLayer.show,
});
for (let option of hdSpecLayerOption) {
  layerListItems.push({
    name: option,
    item_id: getNewItemId(),
    layer_id: hdSpecLayer.id,
    type: layerSpecType.specHd,
    show: localStorage.getItem(option) === 'true',
  });
}
for (let i = 0; i < dynamicLayerSourceType.length; i++) {
  layerListItems.push({
    name: dynamicLayerSourceType[i],
    item_id: getNewItemId(),
    layer_id: dynamicEventLayer.id,
    type: layerSpecType.dynamic,
    show: localStorage.getItem(dynamicLayerSourceType[i]) === 'true',
  });
}

for (let i = 0; i < dynamicLinkLayerSourceType.length; i++) {
  layerListItems.push({
    name: dynamicLinkLayerSourceType[i],
    item_id: getNewItemId(),
    layer_id: dynamicEventLayer.id,
    type: layerSpecType.linkDynamic,
    show: localStorage.getItem(dynamicLinkLayerSourceType[i]) === 'true',
  });
}

layerListItems.push({
  name: allowRoadLayer.name,
  item_id: getNewItemId(),
  layer_id: allowRoadLayer.id,
  type: layerSpecType.none,
  show: localStorage.getItem(allowRoadLayer.name) === 'true',
});

for (let i = 0; i < dynamicPriorLayerSourceType.length; i++) {
  layerListItems.push({
    name: dynamicPriorLayerSourceType[i],
    item_id: getNewItemId(),
    layer_id: dynamicEventLayer.id,
    type: layerSpecType.priorDynamic,
    show: localStorage.getItem(dynamicPriorLayerSourceType[i]) === 'true',
  });
}

for (let i = 0; i < dynamicSDLinkLayerSourceType.length; i++) {
  layerListItems.push({
    name: dynamicSDLinkLayerSourceType[i],
    item_id: getNewItemId(),
    layer_id: dynamicEventLayer.id,
    type: layerSpecType.sdLinkDynamic,
    show: localStorage.getItem(dynamicSDLinkLayerSourceType[i]) === 'true',
  });
}

for (let i = 0; i < dynamicListPriorLayerSourceType.length; i++) {
  layerListItems.push({
    name: dynamicListPriorLayerSourceType[i],
    item_id: getNewItemId(),
    layer_id: dynamicListPriorEventLayer.id,
    type: layerSpecType.dynamicListPriorEvent,
    show: localStorage.getItem(dynamicListPriorLayerSourceType[i]) === 'true',
  });
}

for (let i = 0; i < dynamicRoadListPriorLayerSourceType.length; i++) {
  layerListItems.push({
    name: dynamicRoadListPriorLayerSourceType[i],
    item_id: getNewItemId(),
    layer_id: dynamicListPriorEventLayer.id,
    type: layerSpecType.dynamicEvent,
    show: localStorage.getItem(dynamicRoadListPriorLayerSourceType[i]) === 'true',
  });
}

export const customLayerListItems = new LayerListItems();
