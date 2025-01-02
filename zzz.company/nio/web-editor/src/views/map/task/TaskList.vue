<template>
  <transition name="el-zoom-in-top">
    <Panel
      center
      v-model:visible="taskPanelVisible"
      :width="440"
      :max-width="600"
      :height="310"
      :max-height="600"
      @click.stop="clickHandler($event)"
      v-loading="taskData.loading"
      element-loading-text="加载中"
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      element-loading-background="rgba(232, 232, 232, 0.8)"
      scale-able
    >
      <template #header>
        <div>任务列表</div>
        <div>&nbsp;&nbsp;</div>
        <button class="receive-task gray-btn" data-type="collect">领取任务</button>
        <div style="flex: 1"></div>
        <div class="title-close" @click="closePanel">
          <i class="iconfont icon-guanbi1"></i>
        </div>
      </template>
      <template #default>
        <div class="tool-item">
          <el-scrollbar v-if="taskData.list.length > 0" max-height="220px">
            <ul v-infinite-scroll="lazyLoadHandler" :infinite-scroll-immediate="false">
              <li v-for="(item, idx) in taskData.list" class="task-item">
                <!-- 任务标识 -->
                <div class="task-item-info">
                  <div class="task-item-title">
                    <div class="title-txt" data-type="taskId" :data-idx="idx">{{ item.taskId }}</div>
                    <div
                      v-if="
                        item.statusCode === 3 &&
                        taskData.runningTask !== null &&
                        taskData.runningTask.qualityValidTagList !== null &&
                        taskData.runningTask.qualityValidTagList.length > 0
                      "
                      class="work-tag tag-list"
                      :data-idx="idx"
                      data-type="tagLength"
                    >
                      {{ taskData.runningTask.qualityValidTagList.length }}
                    </div>
                    <div v-if="item.statusCode === 3" class="second-txt">（进行中）</div>
                    <div
                      v-if="item.workKey === WorkKeys.step_user_ao_check"
                      class="work-tag task-ao-check"
                      :data-idx="idx"
                    >
                      AO质检
                    </div>
                    <div class="work-tag task-locate" :data-idx="idx" data-type="locate">定位</div>
                    <div
                      v-if="item.errCaptures.length > 0"
                      class="work-tag task-pic"
                      :data-idx="idx"
                      data-type="capture"
                    >
                      截图
                    </div>
                    <div
                      v-if="
                        item.workKey === WorkKeys.step_user_ao_check &&
                        item.statusCode === 3 &&
                        aoPanelVisible === false &&
                        aoVideoPanelVisible === false
                      "
                      class="work-tag task-pic"
                      :data-idx="idx"
                      data-type="showAOMaterial"
                    >
                      资料
                    </div>
                    <ul v-if="item.tagList instanceof Array">
                      <li v-for="tag in item.tagList" class="work-tag tag-list">{{ tag }}</li>
                    </ul>
                  </div>
                  <div class="space"></div>
                  <div>
                    <!-- 作业库查询失败也只能显示开始 -->
                    <button
                      v-if="item.statusCode === 2 || item.oddBranchName === ''"
                      class="task-item-btn gray-btn"
                      :data-idx="idx"
                      data-type="startWork"
                    >
                      开始
                    </button>
                    <div v-else-if="item.statusCode === 3">
                      <button
                        v-if="item.workKey === WorkKeys.step_user_edit"
                        class="task-item-btn task-item-btn-run"
                        data-type="submit"
                      >
                        提交
                      </button>
                      <div
                        v-else-if="
                          item.workKey === WorkKeys.step_user_check || item.workKey === WorkKeys.step_user_ao_check
                        "
                      >
                        <button
                          class="task-item-btn task-item-btn-run"
                          data-type="quality"
                          :data-idx="idx"
                          :data-value="true"
                        >
                          通过
                        </button>
                        <button class="task-item-btn gray-btn" data-type="quality" :data-idx="idx" :data-value="false">
                          不通过
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 任务详细信息 -->
                <div class="task-content-box">
                  <div class="task-content-des-main">
                    <div class="task-data">{{ item.lineName }}</div>
                    <div v-if="OddTaskType[item.errType] !== undefined" class="task-data-border task-data">
                      {{ OddTaskType[item.errType] }}
                    </div>
                    <div v-if="item.mapVersion" class="task-data-border task-data">{{ item.mapVersion }}</div>
                    <a
                      v-if="item.errUrl"
                      class="task-data task-link task-data-border"
                      target="_blank"
                      :href="item.errUrl"
                      >{{ item.errUrl }}</a
                    >
                  </div>
                  <div class="task-desc" v-if="item.errDesc">{{ item.errDesc }}</div>
                </div>
              </li>
            </ul>
          </el-scrollbar>
          <el-empty v-else :image-size="60" description="暂无任务"></el-empty>
        </div>
      </template>
    </Panel>
  </transition>
  <CaptureComponent></CaptureComponent>
</template>

<script setup>
import CaptureComponent from './TaskCapture.vue';
import {
  refreshTaskList,
  taskData,
  taskPanelVisible,
  WorkKeys,
  OddTaskType,
  lazyLoadTaskList,
  requestStartTaskHandler,
  claimTaskHandler,
} from '../../../system/task/taskList/taskList.js';
import {handleSaveOdd} from '../../../system/odd/saveOdd/saveOdd.js';
import {onActivated} from 'vue';
import {svg} from '../../../js/svg.js';
import {openEventListPanel} from '../../../system/odd/batch/eventList.js';
import {captureClickHandler} from '../../../system/task/taskList/capture/captureController.js';
import {setQualityResult} from '../../../system/task/quality/quality.js';
import {
  aoCheckTrajectoryLayer,
  aoPanelVisible,
  aoVideoPanelVisible,
} from '../../../system/trajectory/AoTrajectorylayer.js';
import {setQualityTagListVisible} from '../../../system/task/quality/tag/QualityTags.js';

function closePanel() {
  taskPanelVisible.value = false;
}

const eventStrategy = {
  taskId: function (idx) {
    openEventListPanel(taskData.list[idx]);
  },
  collect: function () {
    claimTaskHandler();
  },
  capture: function (idx) {
    captureClickHandler(idx);
  },
  locate(idx) {
    taskData.list[idx].locate();
  },
  startWork: function (idx) {
    requestStartTaskHandler(taskData.list[idx]);
  },
  submit: function () {
    handleSaveOdd();
  },
  quality: function (idx, value) {
    setQualityResult(value === 'true', taskData.list[idx]);
  },
  showAOMaterial: function (idx) {
    aoCheckTrajectoryLayer.loadMaterial(taskData.runningTask);
  },
  tagLength: function (idx) {
    setQualityTagListVisible(true);
  },
};

function clickHandler(ev) {
  let target = ev.target;
  if (target && target.dataset.type) {
    let dataset = target.dataset;
    eventStrategy[dataset.type](dataset.idx, dataset.value);
  }
}

function lazyLoadHandler() {
  lazyLoadTaskList();
}

onActivated(() => {
  refreshTaskList();
});
</script>

<style scoped>
.task-item {
  margin: 10px 8px;
  padding-bottom: 6px;
  border-bottom: 1px dashed #565861;
  overflow: hidden;
}

.task-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 0;
}

.receive-task {
  padding: 3px 8px;
  border: none;
  border-radius: 2px;
  font-size: 12px;
  cursor: pointer;
  color: #fff;
  outline: none;
}

.task-item-info {
  display: flex;
  align-items: flex-start;
}

.task-item-title {
  display: flex;
  align-items: center;
}

.work-tag {
  padding: 1px 6px;
  border-radius: 8px;
  margin-left: 3px;
  font-size: 12px;
  user-select: none;
  color: #fff;
}

.task-locate {
  background-color: #006dff;
  cursor: pointer;
}

.task-ao-check {
  background-color: #acb91a;
  cursor: pointer;
}

.tag-list {
  background-color: #eb493a;
  cursor: pointer;
}

.task-pic {
  background-color: #e5a854;
  cursor: pointer;
}

.task-content-box {
  font-size: 13px;
  color: #b7b8ba;
}

.task-content-des-main {
  display: flex;
}

.task-data {
  margin: 3px 3px 3px 0;
  box-sizing: content-box;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #cfd3dc;
}

.task-desc {
  line-height: 1.2;
  color: #a3a6ad;
}

.task-data-border {
  border-left: 1px solid #b7b8ba;
  padding-left: 3px;
}

.task-link {
  color: #4b90e2;
  cursor: pointer;
  flex: 1;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-link:hover {
  text-decoration: underline;
}

.task-link::before {
  content: '';
  margin-right: 6px;
}

.task-item-btn {
  padding: 3px 8px;
  border: none;
  margin-left: 6px;
  border-radius: 2px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
  text-align: center;
}

.gray-btn {
  background-color: #6d6c6c;
}

.gray-btn:hover {
  background-color: #919191;
}

.gray-btn:active {
  background-color: #505050;
}

.task-item-btn-run {
  background-color: var(--btn-bg-color);
}

.task-item-btn-run:hover {
  background-color: var(--btn-hover-bg-color);
}

.task-item-btn-run:active {
  background-color: var(--btn-active-bg-color);
}
</style>
