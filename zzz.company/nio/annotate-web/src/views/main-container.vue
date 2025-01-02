<template>
  <div id="home-page">
    <!-- 顶部区域 -->
    <Header></Header>
    <!-- 高级搜索 -->
    <SearchSenior></SearchSenior>
    <!-- 测距工具 -->
    <MesureTool></MesureTool>
    <!-- 工具栏 -->
    <ToolBar></ToolBar>
    <!-- 右键菜单 -->
    <Popup></Popup>
    <LayerManager></LayerManager>
    <CrossInfo></CrossInfo>
    <CrossResume></CrossResume>
    <CrossTrajPic></CrossTrajPic>
    <InfoBox></InfoBox>
    <Annotation></Annotation>
    <AnnotationResult></AnnotationResult>
    <CrossCheck></CrossCheck>
    <ConfirmDialog></ConfirmDialog>
    <ConfirmModalDialog></ConfirmModalDialog>
    <!-- <LoadGeojsonDlg></LoadGeojsonDlg> -->
    <GeojsonList></GeojsonList>
    <PagedList></PagedList>
    <CrossModelResume></CrossModelResume>
    <CrossInferResume></CrossInferResume>
    <CrossFusionResume></CrossFusionResume>
    <Video></Video>
    <TaskDetail></TaskDetail>
    <TaskDetailDlg></TaskDetailDlg>
    <TaskIssueDistributeDlg></TaskIssueDistributeDlg>
  </div>
</template>

<script setup>
import {onActivated, onDeactivated, onMounted, onUnmounted} from 'vue';
import {Math as CMath} from 'cesium';
import {createViewer} from '../cesium/create-viewer.js';
import Header from './header.vue';
import axios from 'axios';
import {NioNotification, nioCamera} from '../utils/utils.js';
import ToolBar from './toolbar.vue';
import {useStore} from 'vuex';
import SearchSenior from './search-senior.vue';
import Popup from './popup.vue';
import {getUserPos} from '../utils/compute.js';
import MesureTool from './measure-tool.vue';
import LayerManager from './layer-manager.vue';
import CrossInfo from '../data-source/cross/cross-info.vue';
import CrossResume from '../data-source/cross/cross-resume.vue';
import CrossTrajPic from '../data-source/cross/cross-traj-pic.vue';
import InfoBox from './info-box.vue';
import Annotation from '../data-source/cross/cross-annotation.vue';
import AnnotationResult from '../data-source/cross/cross-annotation-result.vue';
import CrossCheck from '../data-source/cross/cross-check.vue';
import ConfirmDialog from './confirm-dialog.vue';
import ConfirmModalDialog from './confirm-modal-dialog.vue';
import LoadGeojsonDlg from '../data-source/rollback/load-geojson.vue';
import GeojsonList from '../data-source/rollback/geojson-list.vue';
import PagedList from '../data-source/rollback/paged-list.vue';
import CrossModelResume from '../data-source/cross/cross-model-resume.vue';
import CrossInferResume from '../data-source/cross/cross-infer-resume.vue';
import CrossFusionResume from '../data-source/cross/cross-fusion-resume.vue';
import Video from '../views/video.vue';
import TaskDetail from '../views/task-detail.vue';
import TaskDetailDlg from '../views/task-issue-dlg.vue';
import TaskIssueDistributeDlg from '../views/task-issue-distribute-dlg.vue';
import {useRoute} from 'vue-router';
import {restoreVeiw} from '../system/view-restore-func.ts';
import {Cartesian3} from 'cesium';

const store = useStore();

async function requestVersion() {
  try {
    //版本列表统一使用生产环境
    let res = await axios
      //.post('http://nmap-dynamic-map-service.idc-prod.nioint.com/dynamic-map/vc/map-version/fetch-available')
      .post('http://nmap-dms-viewer.idc-prod.nioint.com/dynamic-map/meta/map-version/fetch-available');

    if (res.data.code === 200) {
      store.commit('version/initVersionList', res.data.data);
    } else {
      throw new Error('错误:' + res.data.msg);
    }
  } catch (error) {
    NioNotification('error', '数据版本异常，请稍后再试', error + '');
  }
}

onMounted(async () => {
  const route = useRoute();
  let pos = getUserPos();
  if (route?.query?.pos) {
    let posStr = decodeURIComponent(route.query.pos);
    posStr = posStr.split(',');

    //如果是经纬度
    if (
      parseFloat(posStr[0]) > -180.0 &&
      parseFloat(posStr[0]) < 180.0 &&
      parseFloat(posStr[1]) > -90.0 &&
      parseFloat(posStr[1]) < 90.0
    ) {
      let h = 1000.0;
      if (posStr.length == 3) {
        h = parseFloat(posStr[2]);
      }
      pos = Cartesian3.fromDegrees(parseFloat(posStr[0]), parseFloat(posStr[1]), h);
    } else {
      pos = new Cartesian3(parseFloat(posStr[0]), parseFloat(posStr[1]), parseFloat(posStr[2]));
    }

    //locatePosition定位有位置标记
    nioCamera.locatePosition({
      position: pos,
      duration: 0,
      animate: true,
      before() {},
      completed() {},
    });
  } else {
    //setView定位无位置标记
    const viewer = createViewer();
    viewer.scene.screenSpaceCameraController.enableTilt = false;
    viewer.scene.screenSpaceCameraController.enableLook = false;
    viewer.camera.setView({
      destination: pos,
      orientation: {
        heading: CMath.toRadians(0),
        pitch: CMath.toRadians(-90),
        roll: 0,
      },
    });
  }

  doRestore(route);
});

async function doRestore(route) {
  await requestVersion();
  if (route?.query) {
    console.log(route.query);
    restoreVeiw(route.query);
  }
}

onUnmounted(() => {});
onActivated(() => {});
onDeactivated(() => {
  //store.commit('version/resetVersionList');
  //nioCamera.stopLocatePosition();
  //setLayerPanelVisible(false);
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
