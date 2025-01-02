import {reactive, ref} from 'vue';
import {Cesium3DTileStyle} from 'cesium';
import {refreshLineWidth} from '../system/tool.js';
import {getOrCreateNdsContainer, getOrCreateNdsTileSet, ndsColor, ndsDesc} from '../system/tileset-manager.js';

export enum BASE_MAP_SOURCE {
  腾讯高速城快 = '腾讯高速城快',
  腾讯普通路 = '腾讯普通路',
  NIO众包 = 'NIO众包',
  NIO快修 = 'NIO快修',
  sd内化 = 'sd内化',
  众包腾讯融合 = '众包腾讯融合',
}

export const BASE_MAP_SOURCE_LIST = [
  BASE_MAP_SOURCE.腾讯高速城快,
  BASE_MAP_SOURCE.腾讯普通路,
  BASE_MAP_SOURCE.NIO众包,
  BASE_MAP_SOURCE.NIO快修,
  BASE_MAP_SOURCE.sd内化,
  BASE_MAP_SOURCE.众包腾讯融合,
];

export const baseMapConPaneldata = reactive<{
  visible: boolean;
  腾讯高速城快: boolean;
  腾讯普通路: boolean;
  NIO众包: boolean;
  NIO快修: boolean;
  sd内化: boolean;
  众包腾讯融合: boolean;
  全部: boolean;
}>({
  visible: false,
  腾讯高速城快: false,
  腾讯普通路: false,
  NIO众包: false,
  NIO快修: false,
  sd内化: false,
  众包腾讯融合: false,
  全部: true,
});

export function getHdOptionExpr() {
  if (baseMapConPaneldata['全部']) {
    return 'all';
  }

  let exp1 = '';
  if (baseMapConPaneldata[BASE_MAP_SOURCE.腾讯普通路] && baseMapConPaneldata[BASE_MAP_SOURCE.腾讯高速城快]) {
    exp1 += "${feature['source']} === 2";
  } else if (baseMapConPaneldata[BASE_MAP_SOURCE.腾讯普通路]) {
    exp1 +=
      "${feature['source']} === 2 && ${feature['priorityRoadClass']} !== '高速' && ${feature['priorityRoadClass']} !== '城市快速路'";
  } else if (baseMapConPaneldata[BASE_MAP_SOURCE.腾讯高速城快]) {
    exp1 +=
      "${feature['source']} === 2 && (${feature['priorityRoadClass']} === '高速'||${feature['priorityRoadClass']} === '城市快速路')";
  }

  let exp2 = '';
  if (baseMapConPaneldata[BASE_MAP_SOURCE.NIO众包] && baseMapConPaneldata[BASE_MAP_SOURCE.NIO快修]) {
    exp2 += "${feature['source']} === 1 && (${feature['autoType']} === 0 || ${feature['autoType']} === 1)";
  } else if (baseMapConPaneldata[BASE_MAP_SOURCE.NIO众包]) {
    exp2 += "${feature['source']} === 1 && ${feature['autoType']} === 0";
  } else if (baseMapConPaneldata[BASE_MAP_SOURCE.NIO快修]) {
    exp2 += "${feature['source']} === 1 && ${feature['autoType']} === 1";
  }

  let exp3 = '';
  if (baseMapConPaneldata[BASE_MAP_SOURCE.sd内化]) {
    exp3 = "${feature['source']} === 4";
  }

  let exp4 = '';
  if (baseMapConPaneldata[BASE_MAP_SOURCE.众包腾讯融合]) {
    exp4 = "${feature['source']} === 12";
  }

  let allUnselected = true;
  for (let source of Object.keys(BASE_MAP_SOURCE)) {
    if (baseMapConPaneldata[source]) {
      allUnselected = false;
    }
  }

  let exp = '';
  if (exp1.length != 0 && exp2.length != 0) {
    exp = exp1 + '||' + exp2;
  } else {
    exp = exp1 + exp2;
  }

  if (exp.length != 0 && exp3.length != 0) {
    exp += '||' + exp3;
  } else {
    exp = exp + exp3;
  }

  if (exp.length != 0 && exp4.length != 0) {
    exp += '||' + exp4;
  } else {
    exp = exp + exp4;
  }

  //全部不显示
  if (allUnselected && !baseMapConPaneldata['全部']) {
    return false;
  }

  return exp;
}

export async function setHdOptionExp(name: string) {
  if (name == ndsDesc.sdLink) {
    return;
  }

  let expr = getHdOptionExpr();
  const container = getOrCreateNdsContainer(name);
  const tileset = await getOrCreateNdsTileSet(name);

  //要对dataSource的show进行处理。否则都不显示时也会请求数据
  if (expr === false) {
    container.show = false;
  } else {
    container.show = true;
  }

  if (expr == 'all') {
    container.show = true;
    tileset.style = new Cesium3DTileStyle({
      color: `color("${ndsColor[name]}")`,
    });
  } else {
    tileset.style = new Cesium3DTileStyle({
      show: expr,
      color: `color("${ndsColor[name]}")`,
    });
  }

  //强制调用一下，用来刷新线宽
  refreshLineWidth();
}
