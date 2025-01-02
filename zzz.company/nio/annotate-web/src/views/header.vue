<template>
  <header class="nio-header">
    <!-- 标题区 -->
    <div class="header-scene-wrapper" @click="transformSceneMode">
      <span class="title">标注平台</span>
      <span class="scene-mode scene-3D-inactive" :class="{'scene-active': store.state.sceneMode === '3D'}"></span>
      <span class="scene-mode scene-2D-inactive" :class="{'scene-active': store.state.sceneMode === '2D'}"></span>
    </div>
    <div class="space"></div>
    <!-- 任务区 -->
    <tool-item-group class="task-wrapper">
      <TaskComponent></TaskComponent>
      <tool-item v-if="false" title="保存" icon="icon-baocun" @click="save"> </tool-item>
      <SendComponent></SendComponent>
      <!-- <tool-item title="test" icon="icon-baocun" @click="test"> </tool-item> -->
    </tool-item-group>
    <div class="space2"></div>
    <!-- 工具区 -->
    <tool-item-group class="tool-wrapper">
      <tool-item v-if="false" id="opBack" @click="back" left title="撤回" icon="icon-chexiao"> </tool-item>
      <tool-item v-if="false" id="opForward" @click="reform" title="重做" icon="icon-zhongzuo"> </tool-item>
      <MesureTool></MesureTool>
      <CheckTool></CheckTool>
    </tool-item-group>
    <div class="space2"></div>
    <!-- <el-icon color="#3e8cf6" class="tool-item" size="28px" @click="loadGeojson">
      <Files />
    </el-icon> -->
    <div class="space2"></div>
    <!-- 数据参考区 -->
    <tool-item-group class="data-wrapper">
      <VersionComponent></VersionComponent>
      <tool-item left title="地图版本" icon="icon-banben" :width="320" @click="mapVersionHandler"> </tool-item>
      <HDComponent></HDComponent>
      <tool-item right title="图层管理" icon="icon-tuceng" @click="layerManagerPanelHandler"> </tool-item>
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
import ToolItemGroup from './tool-item-group.vue';
import {useStore} from 'vuex';
import SearchLocation from './search-location.vue';
import ToolItem from './tool-item.vue';
import TaskComponent from './task.vue';
import SendComponent from './send.vue';
import HDComponent from './sd-manager.vue';
import VersionComponent from './version-manager.vue';
import UserComponent from './user.vue';
import MesureTool from './measure-tool.vue';
import CheckTool from './check-tool.vue';
import {setLayerPanelVisible, setMapVersionPanelVisible} from '../store/version.js';
import {loadGeojsonDlgData} from '../data-source/rollback/load-geojson-panel.ts';

const store = useStore();

const transformSceneMode = function () {
  store.commit('switchDimension');
};
//撤销操作
const back = function () {};
//重做操作
const reform = function () {};

const loadGeojson = function () {
  loadGeojsonDlgData.visible = true;
};

const layerManagerPanelHandler = function () {
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

.tool-item {
  position: relative;
  color: #3e8cf6;
  padding: 4px 4px;
  background-color: #101223;
  transition: background-color 0.3s ease;
  cursor: pointer;
  user-select: none;
}

.tool-item:hover {
  background-color: #285de7 !important;
}
</style>
