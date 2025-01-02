<template>
  <transition name="el-zoom-in-top">
    <ToolPanel
      rightBottom
      :top="900"
      :left="1400"
      :width="390"
      :max-width="500"
      :height="35"
      :max-height="80"
      :visible="true"
      scale-able
    >
      <div class="checkbox-container">
        <div class="checkbox-container-item">
          <span :style="{'background-color': MARK_STATUS_COLOR[MARK_STATUS.NONE]}" class="cross-rect-item"></span>
          <div>
            {{ MARK_STATUS_DESC[MARK_STATUS.NONE] }}
          </div>
        </div>

        <!-- <div class="checkbox-container-item">
          <span :style="{ 'background-color': MARK_STATUS_COLOR[MARK_STATUS.NO_COLLECT] }" class="cross-rect-item"></span>
          <div class="cross-state-item">
            {{ MARK_STATUS_DESC[MARK_STATUS.NO_COLLECT] }}
          </div>
        </div> -->

        <div class="checkbox-container-item">
          <span :style="{'background-color': MARK_STATUS_COLOR[MARK_STATUS.COLLECTING]}" class="cross-rect-item"></span>
          <div>
            {{ MARK_STATUS_DESC[MARK_STATUS.COLLECTING] }}
          </div>
        </div>

        <!-- <div class="checkbox-container-item2">
          <span :style="{'background-color': MARK_STATUS_COLOR[MARK_STATUS.COLLECTED] }"
            class="cross-rect-item"></span>
          <div class="cross-state-item">
            {{ MARK_STATUS_DESC[MARK_STATUS.COLLECTED] }}
          </div>
        </div> -->

        <div class="checkbox-container-item">
          <span :style="{'background-color': MARK_STATUS_COLOR[MARK_STATUS.PASSED]}" class="cross-rect-item"></span>
          <div>
            {{ MARK_STATUS_DESC[MARK_STATUS.PASSED] }}
          </div>
        </div>

        <div class="checkbox-container-item">
          <span :style="{'background-color': MARK_STATUS_COLOR[MARK_STATUS.INVALID]}" class="cross-rect-item"></span>
          <div>
            {{ MARK_STATUS_DESC[MARK_STATUS.INVALID] }}
          </div>
        </div>
      </div>
    </ToolPanel>
  </transition>
</template>

<script lang="ts" setup>
import ToolPanel from '../components/tool-panel.vue';
import {MARK_STATUS_DESC, MARK_STATUS_COLOR, MARK_STATUS} from '../data-source/cross/cross-material.ts';
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

.cross-rect-item {
  width: 12px;
  height: 12px;
  margin-top: 4px;
  margin-right: 2px;
}

.checkbox-container-item {
  display: flex;
  margin: 8px 4px 0 12px;
}
.checkbox-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
</style>
