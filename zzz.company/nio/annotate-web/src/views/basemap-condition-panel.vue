<template>
  <transition name="el-zoom-in-top">
    <Panel
      v-model:visible="baseMapConPaneldata.visible"
      :width="420"
      :min-width="300"
      :max-width="600"
      :height="180"
      :min-height="100"
      :max-height="600"
      :top="316"
      :left="1153"
      scale-able
    >
      <template #header>
        <div>HD地图数据查询条件</div>
        <div style="flex: 1"></div>
        <div class="title-close" @click="() => closePanel()">
          <i class="iconfont icon-guanbi1"></i>
        </div>
      </template>
      <template #default>
        <el-scrollbar height="100%">
          <p class="layer-describe">数据类型</p>
          <div class="layer-box">
            <div
              @click.stop="clickSource($event)"
              v-for="item in BASE_MAP_SOURCE_LIST"
              :key="item"
              class="layer-item"
              :class="{
                'active-layer': baseMapConPaneldata[item] == true,
              }"
              :data-id="item"
            >
              {{ item }}
            </div>
            <div class="task-data-border"></div>
            <div
              class="layer-item"
              :class="{
                'active-layer': baseMapConPaneldata['全部'] == true,
              }"
              @click.stop="clickAll()"
            >
              全部
            </div>
          </div>
        </el-scrollbar>
      </template>
    </Panel>
  </transition>
</template>

<script lang="ts" setup>
import Panel from '../components/panel.vue';
import {baseMapConPaneldata, BASE_MAP_SOURCE_LIST, BASE_MAP_SOURCE, setHdOptionExp} from './basemap-condition-panel.ts';

import {ndsBaseLayerItems, ndsDesc} from '../system/tileset-manager.js';

async function clickSource(ev) {
  let id = ev.target.dataset.id;
  baseMapConPaneldata[id] = !baseMapConPaneldata[id];
  baseMapConPaneldata['全部'] = false;

  if (ndsBaseLayerItems[2].visible) {
    await setHdOptionExp(ndsDesc.road);
  }

  if (ndsBaseLayerItems[1].visible) {
    await setHdOptionExp(ndsDesc.lane);
  }

  if (ndsBaseLayerItems[0].visible) {
    await setHdOptionExp(ndsDesc.laneBoundary);
  }
}

async function clickAll() {
  for (let source of Object.keys(BASE_MAP_SOURCE)) {
    baseMapConPaneldata[source] = false;
  }

  baseMapConPaneldata['全部'] = !baseMapConPaneldata['全部'];

  if (ndsBaseLayerItems[2].visible) {
    await setHdOptionExp(ndsDesc.road);
  }

  if (ndsBaseLayerItems[1].visible) {
    await setHdOptionExp(ndsDesc.lane);
  }

  if (ndsBaseLayerItems[0].visible) {
    await setHdOptionExp(ndsDesc.laneBoundary);
  }
}

function closePanel() {
  baseMapConPaneldata.visible = false;
}
</script>

<style scoped>
:deep(.el-checkbox) {
  color: #fff;
}

:deep(.el-checkbox__input),
:deep(.el-checkbox__label) {
  pointer-events: none;
}

.task-data-border {
  border-left: 2px solid #b7b8ba;
  height: 30px;
}

.layer-box {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  align-content: center;
  padding-left: 3%;
  padding-right: 3%;
}

.layer-item {
  padding: 1px 11px;
  border-radius: 8px;
  margin: 10px;
  background-color: #121525;
  font-size: 12px;
  line-height: 21px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.25s ease;
}

.active-layer {
  background-color: #5486eb;
}

.layer-describe {
  padding-left: 5%;
  padding-right: 5%;
  margin-bottom: 0;
  color: rgb(197, 197, 197);
  text-align: left;
}
</style>

<style>
.el-input__wrapper,
.el-input__wrapper:hover {
  background-color: #252526 !important;
  box-shadow: 0 0 0 1px #252526 inset;
}

.picker-date,
.el-popper__arrow::before,
.el-time-panel {
  background-color: #333546 !important;
  border: 0 !important;
}

.el-date-range-picker,
.el-picker-panel__footer {
  background-color: #333546 !important;
}

.disabled .el-date-table-cell,
.disabled .cell {
  background-color: #606266 !important;
}

.is-focus {
  box-shadow: 0 0 0 1px #333546 inset !important;
}

.el-date-range-picker__time-header {
  border-bottom: none !important;
}

.el-date-range-picker__content.is-left {
  border-right: none !important;
}

.el-picker-panel__footer {
  border-top: none !important;
}

.el-picker-panel__body,
.el-date-picker__header > span,
.el-date-picker__header button,
.el-time-panel .el-time-spinner__item {
  color: #ffffff !important;
}

.picker-date tbody tr th,
.picker-date tbody tr td,
.picker-date tbody tr .cell {
  color: #ffffff !important;
}

.el-date-table td.in-range .el-date-table-cell,
.el-time-panel .el-time-spinner__item:hover {
  background-color: rgba(64, 158, 255, 0.2) !important;
}

.el-picker-panel__footer .is-text,
.el-time-panel__btn.cancel {
  color: var(--el-color-primary) !important;
}

.el-picker-panel__footer .is-text:hover,
.el-time-panel__btn.cancel {
  background: none !important;
}

.el-picker-panel__footer .is-plain,
.el-time-panel__btn.confirm {
  background: none !important;
  color: #ffffff;
}

.el-picker-panel__footer .is-plain:hover,
.el-time-panel__btn.confirm {
  color: var(--el-color-primary);
}

.el-picker-panel__icon-btn {
  color: #fff;
}
</style>
