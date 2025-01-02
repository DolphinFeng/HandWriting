<template>
  <tool-item v-if="taskData.taskStage === TaskStage.WORKING" title="创建起终点" right :width="340">
    <template #icon>
      <div style="display: flex; align-items: center">
        <i class="iconfont icon-dingwei" style="padding-right: 2px"></i>
        <div class="start-final-text">起终</div>
      </div>
    </template>
    <template #default>
      <div
        class="tool-item"
        style="padding-bottom: 10px"
        @click="clickHandler"
        v-loading="trajectoryData.loading"
        :element-loading-text="'路径计算中'"
        :element-loading-spinner="svg"
        element-loading-svg-view-box="-10, -10, 50, 50"
        element-loading-background="rgba(232, 232, 232, 0.8)"
      >
        <div class="tool-item-header">
          <span>起终点</span>
          <span class="space"></span>
        </div>
        <div class="tool-item-body">
          <el-form :model="trajectoryData" label-width="45px" label-position="left" class="traj-form">
            <el-form-item label="起点：" prop="stPos">
              <el-input v-model="trajectoryData.stPos" placeholder="请输入起点" clearable></el-input>
            </el-form-item>
            <el-form-item label="终点：" prop="edPos">
              <el-input v-model="trajectoryData.edPos" placeholder="请输入终点" clearable></el-input>
            </el-form-item>
            <div class="calculate">
              <button class="traj-btn calculate-btn" data-type="calculateTraj">计算</button>
            </div>
          </el-form>
          <MultiPanel v-if="trajectoryData.visible" class="multi-panel" @tab-change="tabChangeHandler">
            <template #panel>
              <el-tab-pane v-for="(item, idx) in trajectoryData.list" :label="'路径' + (idx + 1)">
                <div class="panel-box">
                  <div>本起终点区间共计：</div>
                  <div>
                    <span class="event-number">{{ item.pathLen }}</span
                    >km
                  </div>
                  <div>
                    <span class="event-number">{{ item.groupLen }}</span
                    >条lane组
                  </div>
                  <div>
                    <span class="event-number">{{ item.oddLaneList.length }}</span
                    >条lane
                  </div>
                  <div>您可以在地图预览后，选择：</div>
                  <div class="traj-btn-group">
                    <button class="traj-btn" data-type="createTraj">生成odd</button>
                    <button class="traj-btn" style="margin-left: 12px" data-type="resetTraj">重置</button>
                  </div>
                </div>
              </el-tab-pane>
            </template>
          </MultiPanel>
        </div>
      </div>
    </template>
  </tool-item>
</template>

<script setup>
import {svg} from '../../../../js/svg.js';
import ToolItem from '../headerPanel/ToolItem.vue';
import MultiPanel from '../../../../components/multiPanel/MultiPanel.vue';
import {useStore} from 'vuex';
import {TaskStage, taskData} from '../../../../system/task/taskList/taskList.js';
import {
  changeTrajectoryIdxHandler,
  generateTrajOddHandler,
  loadingTrajHandler,
  resetTrajForm,
  trajectoryData,
} from '../../../../system/odd/trajectory/trajectory.js';
import {onDeactivated} from 'vue';

const store = useStore();

const eventStrategy = {
  calculateTraj() {
    loadingTrajHandler();
  },
  createTraj() {
    generateTrajOddHandler();
  },
  resetTraj() {
    resetTrajForm();
  },
};

function clickHandler(ev) {
  let type = ev.target?.dataset?.type;
  if (type) {
    eventStrategy[type]();
  }
}

function tabChangeHandler(nameIdx) {
  changeTrajectoryIdxHandler(nameIdx);
}

onDeactivated(() => {
  resetTrajForm();
});
</script>

<style scoped>
:deep(.el-form-item) {
  margin-bottom: 4px;
}
:deep(.el-input__inner) {
  --el-input-inner-height: 26px;
  color: #3b81e1 !important;
  font-size: 12px;
}
:deep(.el-input__wrapper) {
  background-color: #292a2e;
  box-shadow: none;
  padding: 1px 8px;
}
:deep(.el-form-item__label) {
  padding-right: 0;
  font-size: 13px;
  color: #fff;
}
.start-final-text {
  position: absolute;
  right: 0;
  bottom: 0;
  font-size: 8px;
  transform: scale(0.5) translate(10px, 6px);
  user-select: none;
}
.calculate {
  padding: 2px 0 10px;
}
.traj-form {
  margin: 0 8px;
}
.traj-btn {
  width: 60px;
  padding: 3px 0;
  border: none;
  background-color: var(--btn-bg-color);
  border-radius: 1px;
  color: #fff;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  user-select: none;
}
.traj-btn:hover {
  background-color: var(--btn-hover-bg-color);
}
.traj-btn:active {
  background-color: var(--btn-active-bg-color);
}
.calculate-btn {
  width: auto;
  padding: 3px 11px;
}
.traj-btn-group {
  display: flex;
  align-items: center;
  margin: 8px 0;
}
.multi-panel {
  margin: 0 8px;
}
.panel-box {
  padding: 0 2px;
  margin: 10px 0 0;
  font-size: 13px;
  color: #bec1cb;
}
</style>
