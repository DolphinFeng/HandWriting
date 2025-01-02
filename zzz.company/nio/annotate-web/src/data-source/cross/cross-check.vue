<template>
  <transition name="el-zoom-in-top">
    <aside class="nio-aside" v-if="crossCheckPanelData.visible">
      <article class="quality-wrapper">
        <div class="hidden-bg"></div>
        <div class="aside-form-item">
          <div class="aside-form-label">质检标类型</div>
          <el-radio-group
            :disabled="tasks.currentTask && Boolean(tasks.currentTask.taskParams.isRepairJob)"
            v-model="crossCheckPanelData.checkProperty.qualityType"
          >
            <el-radio v-for="item in crossQualityType" :label="item.value" @change="changeCrossCheckType">{{
              item.name
            }}</el-radio>
          </el-radio-group>
        </div>
        <div class="aside-form-item">
          <div class="aside-form-label">质检标描述</div>
          <el-input
            :disabled="tasks.currentTask && Boolean(tasks.currentTask.taskParams.isRepairJob)"
            v-model="crossCheckPanelData.checkProperty.qualityDesc"
            type="textarea"
            :rows="5"
            placeholder="请填写质检标描述"
            @change="changeCrossCheckDesc"
          ></el-input>
        </div>
        <div class="aside-form-item">
          <div class="aside-form-label">质检标结果</div>
          <el-radio-group
            :disabled="!(tasks.currentTask && Boolean(tasks.currentTask.taskParams.isRepairJob))"
            v-model="crossCheckPanelData.checkProperty.qualityResult"
          >
            <el-radio
              v-for="item in crossQualityResult"
              size="small"
              :label="item.value"
              @change="changeCrossCheckResult"
              >{{ item.name }}</el-radio
            >
          </el-radio-group>
        </div>
      </article>
    </aside>
  </transition>
</template>

<script setup>
import {dataManager} from '../../model/feature.ts';
import {crossQualityType, crossQualityResult, crossCheckPanelData, saveCrossCheckRecord} from './cross-check-panel.ts';
import {tasks} from '../../system/task-list.ts';

function changeCrossCheckType() {
  saveCrossCheckRecord();
}

function changeCrossCheckResult() {
  saveCrossCheckRecord();
}

function changeCrossCheckDesc() {
  saveCrossCheckRecord();
}
</script>

<style scoped>
:deep(.el-textarea__inner) {
  --el-input-bg-color: #292a2e;
  --el-input-text-color: #fff;
  box-shadow: none;
  font-size: 13px;
}

:deep(.el-radio) {
  margin-right: 20px;
}

:deep(.el-slider__bar) {
  background-color: #375ddf;
}

:deep(.el-slider__runway) {
  background-color: #375ddf;
}

:deep(.el-slider__button) {
  border: none;
  background-color: #375ddf;
}
.nio-aside {
  position: absolute;
  left: 0;
  top: var(--header-height);
  width: 330px;
  height: calc(100vh - var(--header-height));
  background-color: #2e2f33;
  z-index: 10;
  box-shadow: var(--el-box-shadow);
}

.hidden-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 4px;
  background-color: #2e2f33;
  z-index: 100;
}

.quality-wrapper {
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  padding: 8px 14px 14px;
}

.aside-form-item {
  margin: 8px 0;
}
.aside-form-label {
  margin-bottom: 6px;
  color: #9b9c9e;
  font-size: 14px;
  user-select: none;
}
</style>
