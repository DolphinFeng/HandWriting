<template>
  <div
    class="tool-item"
    style="padding-bottom: 12px"
    v-loading="tasks.loading"
    element-loading-text="加载中"
    :element-loading-spinner="svg"
    element-loading-svg-view-box="-10, -10, 50, 50"
    element-loading-background="rgba(232, 232, 232, 0.8)"
  >
    <div class="tool-item-header">
      <div>任务列表</div>
      <div class="space"></div>
      <button class="receive-task gray-btn" @click.stop="claimTaskHandler">领取任务</button>
    </div>
    <div>
      <el-scrollbar v-if="tasks.data.length > 0" max-height="220px">
        <ul v-infinite-scroll="lazyLoadHandler" :infinite-scroll-immediate="false">
          <li v-for="(item, idx) in tasks.data" class="task-item">
            <!-- 任务标识 -->
            <div class="task-item-info">
              <div class="task-item-title">
                <div class="title-txt" data-type="taskId" :data-idx="idx" @click.stop="showTaskDetail(item)">
                  {{ item.taskId }}
                </div>
                <div v-if="item.statusCode == StatusCode.STARTED" class="second-txt">（进行中）</div>
                <div class="work-tag task-locate" :data-idx="idx" @click.stop="locate(item)">定位</div>
                <div v-if="item.taskParams.isRepairJob" class="work-tag" style="background-color: red">返修</div>
                <ul v-if="item.tagList instanceof Array">
                  <li v-for="tag in item.tagList" class="work-tag tag-list">
                    {{ tag }}
                  </li>
                </ul>
              </div>
              <div class="space"></div>
              <div>
                <!-- 作业库查询失败也只能显示开始 -->
                <button
                  v-if="item.statusCode == StatusCode.NONE"
                  class="task-item-btn gray-btn"
                  :data-idx="idx"
                  @click.stop="clickStartTask(item)"
                >
                  开始
                </button>
                <div v-else-if="item.statusCode == StatusCode.STARTED">
                  <button
                    v-if="item.taskType === TaskType.CLOUD_MAPPING_CHECK && item.taskStep == 'step_tag'"
                    class="task-item-btn task-item-btn-run"
                    @click.stop="commitTask(item)"
                  >
                    提交
                  </button>
                  <button
                    v-else-if="item.taskType === TaskType.ISSUE_DISTRIBUTE"
                    class="task-item-btn task-item-btn-run"
                    data-type="quality"
                    :data-idx="idx"
                    :data-value="true"
                    @click.stop="issueDistribute(item)"
                  >
                    分发
                  </button>
                  <div
                    v-else-if="item.taskType === TaskType.CLOUD_MAPPING_CHECK && item.taskStep == 'step_tag_adjusting'"
                  >
                    <button
                      class="task-item-btn task-item-btn-run"
                      data-type="quality"
                      :data-idx="idx"
                      :data-value="true"
                      @click.stop="crossCheckAllow(item)"
                    >
                      通过
                    </button>
                    <button
                      class="task-item-btn gray-btn"
                      data-type="quality"
                      :data-idx="idx"
                      :data-value="false"
                      @click.stop="crossCheckNotAllow(item)"
                    >
                      不通过
                    </button>
                  </div>
                  <div v-else-if="item.taskType === TaskType.ISSUE_ANALYSIS">
                    <button
                      class="task-item-btn task-item-btn-run"
                      data-type="quality"
                      :data-idx="idx"
                      :data-value="true"
                      @click.stop="issueClose(item)"
                    >
                      关闭
                    </button>
                    <button
                      class="task-item-btn gray-btn"
                      data-type="quality"
                      :data-idx="idx"
                      :data-value="false"
                      @click.stop="issueTransfer(item)"
                    >
                      流转
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <!-- 任务详细信息 -->
            <div class="task-content-des-main">
              <div v-for="(item1, idx1) in item.detail" class="task-data" :style="getStyle(idx1)">
                {{ item1 }}
              </div>
            </div>
          </li>
        </ul>
      </el-scrollbar>
      <el-empty v-else :image-size="60" description="暂无任务"></el-empty>
    </div>
  </div>
</template>

<script setup>
import {onActivated} from 'vue';
import {svg} from '../system/svg.js';
import {
  tasks,
  StatusCode,
  claimTask,
  refreshTaskList,
  TaskType,
  locateTask,
  startTask,
  submitTask,
} from '../system/task-list.ts';
import {openAnnoResultPanel} from '../data-source/cross/cross-annotation-result-panel.ts';
import {dataManager, CommonLayerName} from '../model/feature.ts';
import {NioMessage} from '../utils/utils.js';
import {confirmDialogPanelData} from './confirm-dialog-panel';
import {refreshAnalysisDetailPanel, refreshDistrubiteDetailPanel} from './task-detail-panel.ts';
import {
  taskIssueDlgPanelData,
  TaskIssueDlgType,
  getIssueClassOption,
  getIssueStepOption,
} from './task-issue-dlg-panel.ts';
import {taskIssueDisDlgPanelData, loadIssueType} from './task-issue-distribute-dlg-panel.ts';

function claimTaskHandler() {
  claimTask();
}

function showTaskDetail(task) {
  if (task.taskType === TaskType.ISSUE_ANALYSIS) {
    refreshAnalysisDetailPanel(task);
  } else if (task.taskType === TaskType.ISSUE_DISTRIBUTE) {
    refreshDistrubiteDetailPanel(task);
  }
}

function locate(task) {
  locateTask(task);
}

function clickStartTask(task) {
  if (tasks.currentTask) {
    NioMessage('error', '当前有正在进行中的任务');
    return;
  }

  startTask(task);
}

function commitTask(task) {
  if (task.taskType == TaskType.CLOUD_MAPPING_CHECK) {
    openAnnoResultPanel();
  }
}

function crossCheckAllow(task) {
  let tagCount = dataManager.getLayerFeatureCount(CommonLayerName.CROSS_CHECK_TAG);
  if (tagCount == 0) {
    confirmDialogPanelData.visible = true;
    confirmDialogPanelData.title = '质检通过';
    confirmDialogPanelData.detail = '质检通过后,该作业任务对应的标注数据,将发送至管理平台,进行后续数据成图,是否确认';
    confirmDialogPanelData.onOk = async () => {
      confirmDialogPanelData.loading = true;
      await submitTask('allowed');
      confirmDialogPanelData.loading = false;
      confirmDialogPanelData.visible = false;
      NioMessage('success', '提交成功', 2000);
    };
  } else {
    NioMessage('error', '请先删除质检标', 2000);
    return false;
  }
}

function crossCheckNotAllow(task) {
  let tagCount = dataManager.getLayerFeatureCount(CommonLayerName.CROSS_CHECK_TAG);
  if (tagCount != 0) {
    confirmDialogPanelData.visible = true;
    confirmDialogPanelData.title = '质检不通过';
    confirmDialogPanelData.detail = '质检不通过,该作业任务会打回至原作业员进行修改,是否确认';
    confirmDialogPanelData.onOk = async () => {
      confirmDialogPanelData.loading = true;
      await submitTask('notAllowed');
      confirmDialogPanelData.loading = false;
      confirmDialogPanelData.visible = false;
      NioMessage('success', '提交成功', 2000);
    };
  } else {
    NioMessage('error', '请添加质检标', 2000);
    return false;
  }
}

function issueClose(task) {
  taskIssueDlgPanelData.visible = true;
  taskIssueDlgPanelData.title = '关闭问题';
  taskIssueDlgPanelData.type = TaskIssueDlgType.PASS;
  getIssueClassOption();
}

function issueTransfer(task) {
  taskIssueDlgPanelData.visible = true;
  taskIssueDlgPanelData.title = '流转问题';
  taskIssueDlgPanelData.type = TaskIssueDlgType.TRANSFER;
  getIssueStepOption();
}

function issueDistribute(task) {
  taskIssueDisDlgPanelData.visible = true;
  taskIssueDisDlgPanelData.tilte = '问题分发';
  loadIssueType();
}

function lazyLoadHandler() {
  //lazyLoadTaskList();
}

function getStyle(idx) {
  if (idx !== 0) {
    return {
      'border-left': '1px solid #b7b8ba',
      'padding-left': '6px',
      'padding-right': '6px',
    };
  }
  return {'padding-left': '6px', 'padding-right': '6px'};
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
.task-content-des-main {
  font-size: 13px;
  color: #b7b8ba;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  align-content: center;
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
