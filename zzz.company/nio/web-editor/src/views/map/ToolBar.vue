<template>
  <transition name="el-zoom-in-top">
    <ToolPanel
      rightBottom
      :top="900"
      :left="1400"
      :width="240"
      :max-width="400"
      :height="40"
      :max-height="40"
      :visible="true"
      scale-able
    >
      <div class="checkbox-container global-offset">
        <div style="margin-left: 10px"></div>
        <el-switch v-model="isNadChecked" @change="changeClickNadRange"></el-switch>
        <div style="margin-top: 6px; margin-left: 3px">ODD收敛</div>
        <div style="margin-left: 40px"></div>
        <el-switch v-model="tileGridLayerVisible" @change="changeTileGridVisible"></el-switch>
        <div style="margin-top: 6px; margin-left: 3px">图幅框</div>
        <!-- <div
          class="event-check-item"
          :class="{'active-have-event': isHaveEventChecked}"
          @click="checkHaveEvent($event)"
        >
          有事件
        </div>
        <div style="margin-left: 15px"></div>
        <div
          class="event-check-item"
          :class="{'active-have-no-event': isNoEventChecked}"
          @click="checkHaveNoEvent($event)"
        >
          无事件
        </div> -->
      </div>
    </ToolPanel>
  </transition>
</template>

<script lang="ts" setup>
import {nadTileLayer} from '../../system/nad/nadTileLayer';
import {ref} from 'vue';
import {createNadRangeHighlightLineEntity, clearAllRangeEntities} from '../../system/nad/nadRange.js';
import {tileGridLayerVisible, changeTileGridShow} from '../../cesium/imagery/tile-grid-provider.js';

const isNadChecked = ref(false);
const isHaveEventChecked = ref(false);
const isNoEventChecked = ref(false);

const fontColor = '#fff';

const changeClickNadRange = function (val: boolean) {
  clearAllRangeEntities();

  if (val) {
    createNadRangeHighlightLineEntity();
  }
};

const changeTileGridVisible = function (val) {
  changeTileGridShow(val);
};

function checkHaveEvent(ev) {
  isHaveEventChecked.value = !isHaveEventChecked.value;

  nadTileLayer.clearNadTiles();
  nadTileLayer.showHaveEvents = isHaveEventChecked.value;

  if (isHaveEventChecked.value || isNoEventChecked.value) {
    nadTileLayer.show = true;
    nadTileLayer.mouseLoadingNadTile();
  } else {
    nadTileLayer.show = false;
  }
}

function checkHaveNoEvent(ev) {
  isNoEventChecked.value = !isNoEventChecked.value;

  nadTileLayer.clearNadTiles();
  nadTileLayer.showNoHaveEvents = isNoEventChecked.value;

  if (isHaveEventChecked.value || isNoEventChecked.value) {
    nadTileLayer.show = true;
    nadTileLayer.mouseLoadingNadTile();
  } else {
    nadTileLayer.show = false;
  }
}
</script>

<style scoped>
:deep(.el-checkbox) {
  color: rgb(188, 14, 14);
  margin-left: 10px;
}

:deep(.el-checkbox__input),
:deep(.el-checkbox__label) {
  pointer-events: none;
}

.event-check-item {
  padding: 0px 11px;
  border-radius: 8px;
  margin: 5px;
  background-color: #121525;
  line-height: 21px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.25s ease;
}

.active-have-event {
  background-color: #ee2626;
}

.active-have-no-event {
  background-color: #75eb54;
}

.checkbox-container {
  display: flex;
  flex-wrap: wrap;
}

.global-offset {
  margin-top: 5px;
}

.layer-tool-item {
  cursor: pointer;
  font-size: 14px;
  padding-left: 5.5%;
  padding-top: 1%;
}

.layer-tool-item i {
  pointer-events: none;
  color: rgb(197, 197, 197);
}

.layer-box {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  align-content: center;
  padding-left: 3%;
}

.layer-box2 {
  display: inline-block;
  width: auto;
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
  margin-bottom: 0;
  color: rgb(197, 197, 197);
  text-align: left;
}

.layer-flex {
  display: flex;
  justify-content: space-between;
  padding-right: 17px;
}
</style>
<style>
.el-input__wrapper,
.el-input__wrapper:hover {
  background-color: #252526 !important;
  box-shadow: 0 0 0 1px #252526 inset;
}

.picker-date,
.el-popper__arrow::before {
  background-color: #333546 !important;
  border: 0 !important;
}

.el-date-picker {
  background-color: #333546 !important;
}

.disabled .el-date-table-cell,
.disabled .cell {
  background-color: #606266 !important;
}

.is-focus {
  box-shadow: 0 0 0 1px #333546 inset !important;
}

.el-picker-panel__body,
.el-date-picker__header > span,
.el-date-picker__header button {
  color: #ffffff !important;
}

.picker-date tbody tr th,
.picker-date tbody tr td,
.picker-date tbody tr .cell {
  color: #ffffff !important;
}
</style>
