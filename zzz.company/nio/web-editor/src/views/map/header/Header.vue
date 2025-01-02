<template>
  <header class="nio-header">
    <!-- 标题区 -->
    <div class="header-scene-wrapper" @click="transformSceneMode">
      <span class="title">ODD平台</span>
      <span class="scene-mode scene-3D-inactive" :class="{'scene-active': store.state.sceneMode === '3D'}">3d</span>
      <span class="scene-mode scene-2D-inactive" :class="{'scene-active': store.state.sceneMode === '2D'}">2d</span>
    </div>
    <div class="space"></div>
    <!-- 任务区 -->
    <tool-item-group class="task-wrapper">
      <TaskComponent></TaskComponent>
      <tool-item v-if="false" title="保存" icon="icon-baocun" @click="save"></tool-item>
      <SendComponent></SendComponent>
    </tool-item-group>
    <div class="space2"></div>
    <!-- 工具区 -->
    <tool-item-group class="tool-wrapper">
      <tool-item
        v-if="taskData.runningTask !== null"
        id="opBack"
        @click="back"
        left
        title="撤回"
        icon="icon-chexiao"
      ></tool-item>
      <tool-item
        v-if="taskData.runningTask !== null"
        id="opForward"
        @click="reform"
        title="重做"
        icon="icon-zhongzuo"
      ></tool-item>
      <MesureTool></MesureTool>
      <!-- 路径规划，先关闭 -->
      <TrajComponent v-if="false"></TrajComponent>
      <QualityComponent></QualityComponent>
      <tool-item v-if="false" right title="odd概览" icon="icon-zonghegailan" :width="350">
        <template #default>
          <div class="tool-item">
            <div class="tool-item-header">
              <span>odd信息</span>
              <span style="flex: 1"></span>
            </div>
            <div class="tool-item-body odd-data-list">
              <div class="odd-item">
                <div class="odd-item-title">创建时间</div>
                <div class="odd-item-data">{{ oddPanelData.createTime.slice(0, 10) }}</div>
                <div class="odd-item-data">{{ oddPanelData.createTime.slice(10) }}</div>
              </div>
              <div class="odd-item">
                <div class="odd-item-title">odd类型</div>
                <div class="odd-item-data">{{ oddPanelData.oddType }}</div>
              </div>
              <div class="odd-item">
                <div class="odd-item-title">版本号</div>
                <div class="odd-item-data">{{ oddPanelData.version }}</div>
              </div>
              <div class="odd-item">
                <div class="odd-item-title">路径长度</div>
                <div class="odd-item-data">{{ oddPanelData.pathLength }}KM</div>
              </div>
              <div class="odd-item">
                <div class="odd-item-title">lane组个数</div>
                <div class="odd-item-data" style="color: #285de7; cursor: pointer">{{ oddPanelData.laneGroup }}</div>
              </div>
              <div class="odd-item">
                <div class="odd-item-title">lane总量</div>
                <div class="odd-item-data" style="color: #285de7; cursor: pointer">{{ oddPanelData.laneTotal }}</div>
              </div>
              <div class="odd-item" style="margin-top: 0">
                <div class="odd-item-title">作业完成时间</div>
                <div class="odd-item-data">{{ oddPanelData.finishTime.slice(0, 10) }}</div>
                <div class="odd-item-data">{{ oddPanelData.finishTime.slice(10) }}</div>
              </div>
              <div class="odd-item" style="margin-top: 0">
                <div class="odd-item-title">推送时间</div>
                <div class="odd-item-data">{{ oddPanelData.pushTime.slice(0, 10) }}</div>
                <div class="odd-item-data">{{ oddPanelData.pushTime.slice(10) }}</div>
              </div>
            </div>
          </div>
        </template>
      </tool-item>
    </tool-item-group>
    <div class="space2"></div>
    <!-- 数据参考区 -->
    <tool-item-group class="data-wrapper">
      <VersionComponent></VersionComponent>
      <tool-item left title="地图版本" icon="icon-banben" :width="320" @click="mapVersionHandler"></tool-item>
      <HDComponent></HDComponent>
      <tool-item right title="图层管理" icon="icon-tuceng" @click="invertHandler"></tool-item>
    </tool-item-group>
    <div class="space2"></div>
    <!-- 搜索区及个人账号区 -->
    <tool-item-group class="search-wrapper">
      <SearchLocation></SearchLocation>
      <UserComponent></UserComponent>
    </tool-item-group>
  </header>
</template>

<script setup>
import {reactive, ref} from 'vue';
import ToolItemGroup from './headerPanel/ToolItemGroup.vue';
import {createViewer} from '../../../cesium/initMap.js';
import {useStore} from 'vuex';
import {ElMessageBox, ElNotification} from 'element-plus';
import {handleOddOpBack, handleOddOpForward, opHistory} from '../../../system/odd/history/history.js';
import SearchLocation from './SearchLocation.vue';
import ToolItem from './headerPanel/ToolItem.vue';
import TaskComponent from './taskGroup/Task.vue';
import SendComponent from './taskGroup/Send.vue';
import HDComponent from './dataGroup/HDComponent.vue';
import VersionComponent from './dataGroup/VersionComponent.vue';
import UserComponent from './userGroup/UserComponent.vue';
import TrajComponent from './toolGroup/Traj.vue';
import QualityComponent from './toolGroup/quality/Quality.vue';
import {setLayerPanelVisible, setMapVersionPanelVisible} from '../../../system/layer/panel/layerPanel.js';
import taskData from '../../../system/task/taskList/taskData.js';
import MesureTool from '../../map/MesureTool.vue';

const viewer = createViewer();
const store = useStore();
const oddPanelData = reactive({
  createTime: '2022-08-24 21：00：53',
  oddType: '2-降级odd',
  version: 22072903,
  pathLength: 13.5,
  laneGroup: 8,
  laneTotal: 134,
  finishTime: '2022-08-25 10：30：32',
  pushTime: '2022-08-25 22：10：32',
});

const transformSceneMode = function () {
  store.commit('switchDimension');
};
//撤销操作
const back = function () {
  let record = opHistory.back();
  if (record) {
    handleOddOpBack(record);
  }
};
//重做操作
const reform = function () {
  let record = opHistory.forward();
  if (record) {
    handleOddOpForward(record);
  }
};
const save = function () {
  //已开启自动导入
  ElNotification.closeAll();
  ElNotification.success({
    title: '保存成功',
    position: 'top-right',
    showClose: false,
    offset: 50,
    duration: 2000,
  });
};

const invertHandler = function () {
  setLayerPanelVisible();
};

const mapVersionHandler = function () {
  setMapVersionPanelVisible();
};
</script>

<style>
.el-overlay {
  z-index: 99999999 !important;
}
</style>
<style scoped>
:deep(.el-scrollbar__bar.is-vertical) {
  width: 4px;
}

:deep(.el-popover.el-popper) {
  padding: 0 !important;
}

header {
  display: flex;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--header-height);
  background-color: #252b46;
  z-index: 10000000;
}

:deep(.el-radio:nth-of-type(3n)) {
  margin-right: 0;
}

.search-wrapper {
  display: flex;
  align-items: center;
}

.header-scene-wrapper {
  position: relative;
  width: 120px;
  height: 100%;
  background-image: linear-gradient(90deg, #285fe7, #3e8cf6);
  color: #fff;
  clip-path: ellipse(120px 70px at 0 50%);
  line-height: var(--header-height);
  text-align: center;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.scene-mode {
  position: absolute;
  right: 8px;
  top: 0;
  font-size: 12px;
  transition: transform 0.3s ease;
}

.header-scene-wrapper .scene-active {
  transform: translateY(-7px);
}

.scene-3D-inactive {
  transform: translateY(-42px);
}

.scene-2D-inactive {
  transform: translateY(28px);
}

.odd-data-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  grid-column-gap: 0;
  grid-row-gap: 0;
  padding: 0 14px;
}

.odd-item {
  margin-top: 14px;
  text-align: center;
}

.odd-item-title {
  color: #808184;
  font-size: 13px;
  margin-bottom: 4px;
}

.odd-item-data {
  font-size: 12px;
}
</style>
