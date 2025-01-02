<template>
  <div id="home-page">
    <!-- 顶部区域 -->
    <Header></Header>
    <!-- 左侧事件属性弹窗 -->
    <NioAside></NioAside>
    <!-- 右键弹窗 -->
    <Popup></Popup>
    <!-- 拉框 -->
    <PullFrame></PullFrame>
    <!-- 轨迹面板 -->
    <TrajectoryPanel></TrajectoryPanel>
    <!-- AO质检资料面板 -->
    <AOCheck></AOCheck>
    <!-- AO质检视频资料面板 -->
    <AOCheckVideo></AOCheckVideo>
    <!-- 轨迹搜搜框 -->
    <LoadingFrame></LoadingFrame>
    <!-- 图层管理面板 -->
    <LayerPanel></LayerPanel>
    <!-- Issue 条件面板 -->
    <IssueConditionPanel></IssueConditionPanel>
    <!-- 事件列表面板 -->
    <EventList></EventList>
    <!-- 车道弹窗 -->
    <InfoBox></InfoBox>
    <!-- 提交Odd弹窗 -->
    <SaveOdd></SaveOdd>
    <!-- 添加图层 -->
    <AddLayerPanel></AddLayerPanel>
    <!-- 质检结果 -->
    <QualityResult></QualityResult>
    <!-- 高级搜索 -->
    <SearchSenior></SearchSenior>
    <!-- 质检标列表 -->
    <QualityTagList></QualityTagList>
    <!-- 事件类型批量修改对话框 -->
    <EventBatchEdit></EventBatchEdit>
    <!-- 测距工具 -->
    <MesureTool></MesureTool>
    <!-- 工具栏 -->
    <ToolBar></ToolBar>
    <DynamicEventCondition></DynamicEventCondition>
    <PriorCondition></PriorCondition>
    <EventCondition></EventCondition>
    <BaseMapConditionPanel></BaseMapConditionPanel>
    <NadPermissionCondition></NadPermissionCondition>
  </div>
</template>

<script setup>
import {onActivated, onDeactivated, onMounted, onUnmounted, reactive, ref, watch} from 'vue';
import {Math as CMath, Rectangle} from 'cesium';
import {createViewer} from '../../cesium/initMap.js';
import Header from './header/Header.vue';
import Popup from './popup/Popup.vue';
import PullFrame from './odd/PullFrame.vue';
import TrajectoryPanel from './trajectory/TrajectoryPanel.vue';
import AOCheck from './trajectory/AOCheck.vue';
import AOCheckVideo from './trajectory/AOCheckVideo.vue';
import axios from 'axios';
import {nioCamera, NioMessage, NioNotification} from '../../utils/utils.js';
import {pullFrameEvent} from '../../event/pullFrame.js';
import LayerPanel from './layer/LayerPanel.vue';
import ToolBar from './ToolBar.vue';
import IssueConditionPanel from './Issue/IssueConditionPanel.vue';
import {useStore} from 'vuex';
import {PopupData} from '../../event/popup.js';
import LoadingFrame from './trajectory/LoadingFrame.vue';
import InfoBox from './InfoBox/InfoBox.vue';
import SaveOdd from './odd/SaveOdd.vue';
import AddLayerPanel from './layer/AddLayerPanel.vue';
import SearchSenior from './header/SearchSenior.vue';
import {getUserPos, saveUserPos} from '../../utils/compute.js';
import {PanelOpenType, setPanelMode} from '../../system/odd/eventPanel/oddPanelData.js';
import {clearOddData} from '../../system/odd/saveOdd/saveOdd.js';
import QualityResult from './header/toolGroup/quality/QualityResult.vue';
import {eventController} from '../../event/eventController.js';
import NioAside from './aside/NioAside.vue';
import {destroyQuality, initQuality} from '../../system/task/quality/quality.js';
import {resetTask} from '../../system/task/taskList/taskList.js';
import EventList from './odd/batch/EventList.vue';
import {setLayerPanelVisible} from '../../system/layer/panel/layerPanel.js';
import {closeEventListPanel} from '../../system/odd/batch/eventList.js';
import QualityTagList from '../../views/map/odd/QualityTagList.vue';
import EventBatchEdit from '../map/EventBatchEdit.vue';
import MesureTool from './MesureTool.vue';
import DynamicEventCondition from './layer/DynamicEventConditionPanel.vue';
import PriorCondition from './layer/PriorConditionPanel.vue';
import BaseMapConditionPanel from './layer/BaseMapConditionPanel.vue';
import NadPermissionCondition from './layer/NadPermissionCondition.vue';
import EventCondition from './layer/EventConditionPanel.vue';
import ToolPanel from '../../components/panel/ToolPanel.vue';

const store = useStore();

function requestVersion() {
  //版本列表统一使用生产环境
  axios
    .post('http://nmap-dynamic-map-service.idc-prod.nioint.com/dynamic-map/vc/map-version/fetch-available')
    // .post(api.apiDynamicMasterViewURL + '/dynamic-map/meta/map-version/fetch-available')
    .then((res) => {
      if (res.data.code === 200) {
        store.commit('version/initVersionList', res.data.data);
      } else {
        throw new Error('错误:' + res.data.msg);
      }
    })
    .catch((err) => {
      NioNotification('error', '数据版本异常，请稍后再试', err.message);
    });
}

onMounted(() => {
  const viewer = createViewer();
  viewer.scene.screenSpaceCameraController.enableTilt = false;
  viewer.scene.screenSpaceCameraController.enableLook = false;
  viewer.camera.setView({
    destination: getUserPos(),
    orientation: {
      heading: CMath.toRadians(0),
      pitch: CMath.toRadians(-90),
      roll: 0,
    },
  });

  eventController.startAll();
  document.onmousedown = function () {
    store.commit('setPopup', new PopupData(false));
  };

  pullFrameEvent.start();
});

onUnmounted(() => {});
onActivated(() => {
  requestVersion();
  initQuality();
});
onDeactivated(() => {
  store.commit('version/resetVersionList');
  nioCamera.stopLocatePosition();
  resetTask();
  destroyQuality();
  setPanelMode(PanelOpenType.CLOSE);
  clearOddData();
  setLayerPanelVisible(false);
  closeEventListPanel();
});
</script>
<style scoped>
#home-page {
  width: 100vw;
  height: 100vh;
  position: absolute;
  text-align: left;
  --header-height: 40px;
  --icon-radius: 4px;
}
</style>
