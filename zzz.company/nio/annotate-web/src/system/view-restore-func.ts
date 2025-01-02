import {actionParamMap, actionFuncMap, panelNames} from './view-restore.ts';
import {
  createActionParamCrossFusionResume,
  crossFusionResumePanel,
} from '../data-source/cross/cross-fusion-resume-panel.js';
import {
  createActionParamCrossInferResume,
  crossInferResumePanel,
} from '../data-source/cross/cross-infer-resume-panel.js';
import {
  createActionParamCrossModelResume,
  crossModelResumePanel,
} from '../data-source/cross/cross-model-resume-panel.js';
import {createActionParamCrossResume, crossResumePanel} from '../data-source/cross/cross-resume-panel.js';
import {createViewer} from '../cesium/create-viewer.js';
import store from '../store/store.js';
import {NioMessage} from '../utils/utils.js';
import {crossLayerItems, setCrossLayerItems} from '../data-source/cross/cross-material.js';
import {copyTextToClipboard} from '../utils/copy.js';
import {
  fusionLayerItems,
  inferLayerItems,
  ndsBaseLayerItems,
  setFusionLayerItems,
  setInferLayerItems,
  setNdsBaseLayerItems,
} from './tileset-manager.js';
import {crossInfoPanel} from '../data-source/cross/cross-info-panel.ts';

export function createPanelString() {
  //除了s前缀的，全部清空
  actionParamMap.set(panelNames.cCrossInfo, []);
  actionParamMap.set(panelNames.cCrossResume, []);
  actionParamMap.set(panelNames.cCrossModelResume, []);
  actionParamMap.set(panelNames.cCrossInferResume, []);
  actionParamMap.set(panelNames.cCrossFusionResume, []);

  //cross-info.vue 总面板状态不用记录。因为已经在点击函数内部记录了点击动作

  //cross-resume.vue 路口履历面板
  createActionParamCrossResume();

  //cross-model-resume.vue
  createActionParamCrossModelResume();

  //cross-infer-resume.vue
  createActionParamCrossInferResume();

  //cross-fusion-resume.vue
  createActionParamCrossFusionResume();

  let actionParamObject = Object.fromEntries(actionParamMap);
  let uri = encodeURIComponent(JSON.stringify(actionParamObject));
  return uri;
}

function createPanelPositionString() {
  let pos: any = [];
  pos.push([crossInfoPanel.left, crossInfoPanel.top]);
  pos.push([crossResumePanel.left, crossResumePanel.top]);
  pos.push([crossModelResumePanel.left, crossModelResumePanel.top]);
  pos.push([crossInferResumePanel.left, crossInferResumePanel.top]);
  pos.push([crossFusionResumePanel.left, crossFusionResumePanel.top]);

  return encodeURIComponent(JSON.stringify(pos));
}

function createLayerString() {
  let layersVisible: any = {};
  layersVisible.cross = [];
  layersVisible.infer = [];
  layersVisible.fusion = [];
  layersVisible.base = [];

  for (let item of crossLayerItems) {
    if (item.visible) {
      layersVisible.cross.push(item.name);
    }
  }

  for (let item of inferLayerItems) {
    if (item.visible) {
      layersVisible.infer.push(item.name);
    }
  }

  for (let item of fusionLayerItems) {
    if (item.visible) {
      layersVisible.fusion.push(item.name);
    }
  }

  for (let item of ndsBaseLayerItems) {
    if (item.visible) {
      layersVisible.base.push(item.name);
    }
  }
  return encodeURIComponent(JSON.stringify(layersVisible));
}

export async function restoreVeiw(query) {
  try {
    let panel = query.panel;
    let mapVersion = query.version;
    let show = query.show;
    let panelPos = query.panelPos;

    if (!panel) {
      return;
    }

    if (mapVersion) {
      store.state.version.curVersion = parseInt(mapVersion);
    }

    if (show) {
      let layersVisible: any = JSON.parse(decodeURIComponent(show));
      setCrossLayerItems(layersVisible.cross);
      setFusionLayerItems(layersVisible.fusion);
      setInferLayerItems(layersVisible.infer);
      setNdsBaseLayerItems(layersVisible.base);
    }

    let panelString = decodeURIComponent(panel);
    let actionParamObject = JSON.parse(panelString);
    if (panelPos) {
      let panelPosString = decodeURIComponent(panelPos);
      let pos = JSON.parse(panelPosString);

      crossInfoPanel.left = pos[0][0];
      crossInfoPanel.top = pos[0][1];

      crossResumePanel.left = pos[1][0];
      crossResumePanel.top = pos[1][1];

      crossModelResumePanel.left = pos[2][0];
      crossModelResumePanel.top = pos[2][1];

      crossInferResumePanel.left = pos[3][0];
      crossInferResumePanel.top = pos[3][1];

      crossFusionResumePanel.left = pos[4][0];
      crossFusionResumePanel.top = pos[4][1];
    }

    for (let [key, value] of Object.entries(actionParamObject)) {
      actionParamMap.set(key, value);
    }

    //按依赖顺序执行
    let crossInfoAction = actionParamMap.get(panelNames.sCrossInfo);
    for (let [key, value] of crossInfoAction) {
      var func = actionFuncMap.get(key);
      await func(...value);
    }

    let childActions = actionParamMap.get(panelNames.cCrossInfo);
    for (let [key, value] of childActions) {
      var func = actionFuncMap.get(key);
      await func(...value);
    }

    let promises: Promise<void>[] = [];

    childActions = actionParamMap.get(panelNames.sCrossResume);
    for (let [key, value] of childActions) {
      var func = actionFuncMap.get(key);
      let promise: Promise<void> = func(...value);
      promises.push(promise);
    }

    childActions = actionParamMap.get(panelNames.sCrossModelResume);
    for (let [key, value] of childActions) {
      var func = actionFuncMap.get(key);
      let promise: Promise<void> = func(...value);
      promises.push(promise);
    }

    childActions = actionParamMap.get(panelNames.sCrossInferResume);
    for (let [key, value] of childActions) {
      var func = actionFuncMap.get(key);
      let promise: Promise<void> = func(...value);
      promises.push(promise);
    }

    childActions = actionParamMap.get(panelNames.sCrossFusionResume);
    for (let [key, value] of childActions) {
      var func = actionFuncMap.get(key);
      let promise: Promise<void> = func(...value);
      promises.push(promise);
    }

    //s开头的先执行
    await Promise.all(promises);

    childActions = actionParamMap.get(panelNames.cCrossResume);
    for (let [key, value] of childActions) {
      var func = actionFuncMap.get(key);
      func(...value);
    }

    childActions = actionParamMap.get(panelNames.cCrossModelResume);
    for (let [key, value] of childActions) {
      var func = actionFuncMap.get(key);
      func(...value);
    }

    childActions = actionParamMap.get(panelNames.cCrossInferResume);
    for (let [key, value] of childActions) {
      var func = actionFuncMap.get(key);
      func(...value);
    }

    childActions = actionParamMap.get(panelNames.cCrossFusionResume);
    for (let [key, value] of childActions) {
      var func = actionFuncMap.get(key);
      func(...value);
    }
  } catch (error) {
    console.log(error + '');
    NioMessage('error', error + '');
  }
}

export async function createShareUrl() {
  let port = '';
  if (window.location.hostname == 'localhost') {
    port = ':5173';
  }

  //记录底图版本
  let mapVersion = store.state.version.curVersion;

  //记录相机位置和高度
  let viewer = createViewer();
  let position = viewer.camera.position;
  let posStr = `${position.x},${position.y},${position.z}`;
  posStr = encodeURIComponent(posStr);

  //记录图层显示/隐藏
  let layersVisibleStr = createLayerString();

  //记录数据面板状态
  let uri = createPanelString();

  //记录面板位置
  let panelPos = createPanelPositionString();

  let url =
    'http://' +
    window.location.hostname +
    port +
    '/#/params?panel=' +
    uri +
    '&version=' +
    mapVersion +
    '&pos=' +
    posStr +
    '&show=' +
    layersVisibleStr +
    '&panelPos=' +
    panelPos;

  url = '我在标注平台 ' + url + ' 分享 id = ' + crossInfoPanel.crossId.id + '内容给你，可直接点击链接加载对应视图数据';
  try {
    await copyTextToClipboard(url, '已将当前路口的相关信息复制，可粘贴分享，用户可打开链接定位当前视图及数据');
    //await navigator.clipboard.writeText(url);
    //NioMessage('success', '已将当前路口的相关信息复制，可粘贴分享，用户可打开链接定位当前视图及数据');
    console.log('Text copied to clipboard');
  } catch (err) {
    NioMessage('error', err + '');
  }
}
