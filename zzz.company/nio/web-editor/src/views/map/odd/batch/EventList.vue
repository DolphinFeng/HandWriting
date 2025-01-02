<template>
  <Panel
    center
    :top="100"
    scale-able
    :width="initialWidth"
    :max-width="1850"
    :min-width="400"
    :header-style="{boxShadow: 'none', backgroundColor: '#333745'}"
    :height="initialHeight"
    :max-height="600"
    :min-height="300"
    v-model:visible="eventListData.visible"
    @created="created"
    @changeSize="changeSize"
    :loading="eventListData.loading"
    loading-text="努力加载中..."
  >
    <template #header>
      <div class="batch-title">事件列表</div>
      <button
        v-if="
          taskData.runningTask !== null &&
          taskData.runningTask.workKey !== WorkKeys.step_user_check &&
          taskData.runningTask.workKey !== WorkKeys.step_user_ao_check
        "
        class="batch-title batch-title2"
        @click.native="batchEditWorkEventHandler"
      >
        批量编辑
      </button>
      <button
        v-if="
          taskData.runningTask !== null &&
          taskData.runningTask.workKey !== WorkKeys.step_user_check &&
          taskData.runningTask.workKey !== WorkKeys.step_user_ao_check
        "
        class="batch-title batch-title2"
        @click.native="batchDeleteWorkEventHandler"
      >
        批量删除
      </button>
      <div style="flex: 1"></div>
      <div class="batch-panel-close" @click="closeEventListPane">
        <i class="iconfont icon-guanbi1"></i>
      </div>
    </template>
    <template #default>
      <div class="batch-body-box">
        <div style="height: 1px; background-color: #849fb9; margin: 0 4px"></div>
        <div class="batch-body-table" ref="tableBody">
          <div v-if="eventListData.workKey === 'step_user_ao_check'">
            <el-table :data="eventListData.list" :height="maxHeight" @cell-click="tableHandler">
              <el-table-column type="selection" align="center" width="40" fixed="left"></el-table-column>
              <el-table-column label="事件id" prop="eventId" key="eventId" align="center" min-width="180">
                <template #default="{row}">
                  <div class="copy-text" :title="row.eventId">{{ row.eventId }}</div>
                </template>
              </el-table-column>
              <el-table-column label="事件类型" prop="type" key="type" align="center" min-width="120"></el-table-column>
              <el-table-column
                label="要素id"
                prop="featureId"
                key="featureId"
                align="center"
                min-width="170"
              ></el-table-column>
              <el-table-column
                label="起始位置"
                prop="startOffset"
                key="startOffset"
                align="center"
                min-width="90"
              ></el-table-column>
              <el-table-column
                label="结束位置"
                prop="endOffset"
                key="endOffset"
                align="center"
                min-width="90"
              ></el-table-column>
              <el-table-column
                label="当前地图版本"
                prop="mapVersion"
                key="mapVersion"
                align="center"
                min-width="120"
              ></el-table-column>
              <el-table-column
                label="事件状态"
                prop="status"
                key="status"
                align="center"
                min-width="100"
              ></el-table-column>
            </el-table>
          </div>
          <div v-else>
            <el-table
              :data="eventListData.list"
              :height="maxHeight"
              @cell-click="tableHandler"
              ref="workEventTableRef"
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" align="center" width="40" fixed="left"></el-table-column>
              <el-table-column label="事件id" prop="eventId" key="eventId" align="center" min-width="180">
                <template #default="{row}">
                  <div class="copy-text" :title="row.eventId">{{ row.eventId }}</div>
                </template>
              </el-table-column>
              <el-table-column label="事件类型" prop="type" key="type" align="center" min-width="120"></el-table-column>
              <el-table-column
                label="当前地图版本"
                prop="mapVersion"
                key="mapVersion"
                align="center"
                min-width="120"
              ></el-table-column>
              <el-table-column
                label="事件状态"
                prop="status"
                key="status"
                align="center"
                min-width="100"
              ></el-table-column>
              <el-table-column label="来源" prop="source" key="source" align="center" min-width="100"></el-table-column>
              <el-table-column
                label="infoValueList"
                prop="infoValueList"
                key="infoValueList"
                align="center"
                min-width="110"
              ></el-table-column>
              <el-table-column
                label="法规限速取值"
                prop="lawSpeed"
                key="lawSpeed"
                align="center"
                min-width="110"
              ></el-table-column>
              <el-table-column
                label="经验限速取值"
                prop="exSpeed"
                key="exSpeed"
                align="center"
                min-width="110"
              ></el-table-column>
              <el-table-column
                label="省份"
                prop="provinceName"
                key="provinceName"
                align="center"
                min-width="100"
              ></el-table-column>
              <el-table-column
                label="城市"
                prop="cityName"
                key="cityName"
                align="center"
                min-width="100"
              ></el-table-column>
              <el-table-column label="tile号" prop="tile" key="tile" align="center" min-width="100"></el-table-column>
              <el-table-column
                label="要素id"
                prop="featureId"
                key="featureId"
                align="center"
                min-width="170"
              ></el-table-column>
              <el-table-column
                label="起始位置"
                prop="startOffset"
                key="startOffset"
                align="center"
                min-width="90"
              ></el-table-column>
              <el-table-column
                label="结束位置"
                prop="endOffset"
                key="endOffset"
                align="center"
                min-width="90"
              ></el-table-column>
            </el-table>
          </div>
        </div>
        <div class="batch-body-page">
          <el-pagination
            background
            small
            :total="eventListData.total"
            :page-size="eventListData.pageSize"
            v-model="eventListData.pageNo"
            :page-sizes="[5, 10, 20, 50]"
            @current-change="handleChangePage"
            @size-change="handleChangeSize"
            layout="total,pager"
          ></el-pagination>
        </div>
      </div>
    </template>
  </Panel>
</template>

<script setup>
import Panel from '../../../../components/panel/Panel.vue';
import {nextTick, onMounted, reactive, ref} from 'vue';
import {copyTextToClipboard} from '../../../../utils/copy.js';
import {debounce} from '../../../../utils/compute.js';
import {eventListData, loadingEventListHandler} from '../../../../system/odd/batch/eventList.js';
import {opHistory} from '../../../../system/odd/history/history';
import {editTypePanelData, workEventTableRef} from '../../../../system/EventBatchEdit.js';
import {modifiedWorkEvents} from '../../../../system/EventBatchEdit.js';
import {oddLayer} from '../../../../system/odd/oddLayer.js';
import {OddOpRecord} from '../../../../system/odd/history/OddOpRecord.js';
import {OpType} from '../../../../system/odd/enum/OpType.js';
import {updateEventListPanel} from '../../../../system/odd/batch/eventList.js';
import {taskData, WorkKeys} from '../../../../system/task/taskList/taskList.js';
import {NioMessage} from '../../../../utils/utils';

const tableBody = ref(null);

const initialWidth = parseInt(localStorage.getItem('eventPanelWidth') ?? 1000);
const initialHeight = parseInt(localStorage.getItem('eventPanelHeight') ?? 400);

function handleChangePage(page) {
  eventListData.pageNo = page;
  loadingEventListHandler();
}

function handleChangeSize(size) {
  eventListData.pageNo = 1;
  eventListData.pageSize = size;
  loadingEventListHandler();
}

const maxHeight = ref(0);

function closeEventListPane() {
  eventListData.visible = false;
}

const handleSelectionChange = (val) => {
  editTypePanelData.count = workEventTableRef.value.getSelectionRows().length;
  editTypePanelData.selectedRows = workEventTableRef.value.getSelectionRows();
};

const batchEditWorkEventHandler = function () {
  if (taskData.runningTask === null || taskData.runningTask === undefined) {
    NioMessage('warning', '任务没有开始，不允许编辑');
    return;
  }

  if (taskData.runningTask.oddBranchName !== eventListData.branchName) {
    NioMessage('warning', '作业库不同，不允许编辑');
    return;
  }

  let selected_rows = workEventTableRef.value.getSelectionRows();
  if (selected_rows.length === 0) {
    NioMessage('warning', '当前未选中任何事件，请选择后重试');
    return;
  }

  editTypePanelData.visible = true;
};

const batchDeleteWorkEventHandler = function () {
  if (taskData.runningTask === null || taskData.runningTask === undefined) {
    NioMessage('warning', '任务没有开始，不允许删除');
    return;
  }

  if (taskData.runningTask.oddBranchName !== eventListData.branchName) {
    NioMessage('warning', '作业库不同，不允许删除');
    return;
  }

  //let event_ids = [];
  let changed_ids = new Set();
  let lane_odd_map = new Map();
  let selected_rows = workEventTableRef.value.getSelectionRows();

  if (selected_rows.length === 0) {
    NioMessage('warning', '当前未选中任何事件，请选择后重试');
    return;
  }

  for (let i = 0; i < selected_rows.length; i++) {
    let row = selected_rows[i];

    //只删除有效的
    let work_event = modifiedWorkEvents.get(row.eventId);
    if (work_event.status === 1) {
      if (!lane_odd_map.has(work_event.featureId)) {
        lane_odd_map.set(work_event.featureId, new Set());
      }

      work_event.status = 2;
      changed_ids.add(work_event.eventId);
      lane_odd_map.get(work_event.featureId).add(work_event.eventId);
    }
  }

  updateEventListPanel(changed_ids);

  let lanes = [];
  let oddDataLists = [];
  for (let [key, value] of lane_odd_map) {
    let lane = oddLayer.oddLanes.get(key);

    let lane_odds = [];
    for (let item of value.values()) {
      let oddDataList = oddLayer.removeLaneByEventId(key, item);
      lane_odds.push(oddDataList);
    }

    lanes.push(lane);
    oddDataLists.push(lane_odds);
  }

  if (lanes.size != 0 && oddDataLists.size != 0) {
    opHistory.push(new OddOpRecord(OpType.DELETE, lanes, oddDataLists));
    workEventTableRef.value.clearSelection();
  }
};

function adaptiveTableHeight() {
  maxHeight.value = tableBody.value === null ? 0 : tableBody.value.offsetHeight;
}

const tableHandler = function (row, column, cell, event) {
  let target = event.target;
  if (target && target.classList.contains('copy-text')) {
    copyTextToClipboard(target.innerText);
  }
};

function created() {
  nextTick(() => {
    adaptiveTableHeight();
  });
}

const setInitialWidth = debounce(function (width, height) {
  localStorage.setItem('eventPanelWidth', width);
  localStorage.setItem('eventPanelHeight', height);
}, 500);
function changeSize(width, height) {
  setInitialWidth(width, height);
  adaptiveTableHeight();
}
</script>
<style></style>
<style scoped>
:deep(.event-header) {
  box-shadow: none;
  background-color: #333745;
}
:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #4e83ed;
}
:deep(.el-pagination) {
  justify-content: center;
}
:deep(.el-table__body-wrapper tr td.el-table-fixed-column--left) {
  background-color: #343747;
}
:deep(.el-table) {
  color: #ebeef5;
  background-color: transparent;
  --el-bg-color: transparent;
  --el-table-row-hover-bg-color: #2e3344;
  --el-table-border-color: transparent;
  font-size: 13px;
}
:deep(.el-table td.el-table__cell .cell) {
  justify-content: center;
}
:deep(.el-table th.el-table__cell) {
  background-color: #333745;
}
:deep(.el-table tr) {
  background-color: transparent;
}
:deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) {
  background-color: rgba(23, 24, 29, 0.9);
}
:deep(.el-input__wrapper) {
  background-color: transparent;
  box-shadow: none !important;
}
:deep(.el-table td.el-table__cell, .el-table th.el-table__cell.is-leaf) {
  border-color: transparent;
}
:deep(.el-popper.is-dark) {
  color: white;
}
.batch-title {
  font-size: 14px;
}
.batch-title2 {
  margin-left: 20px;
  color: #7e8cf1;
  cursor: pointer;
  background-color: rgb(51, 55, 69);
  border-color: transparent;
}
.batch-panel-close {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #959696;
  border-radius: 50%;
  color: #959696;
  margin-right: 10px;
}
.batch-body-box {
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  padding: 0 6px;
}
.batch-body-table {
  flex: 1;
  overflow: hidden;
}
.copy-text {
  font-size: 13px;
  font-weight: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
}
.copy-text:hover {
  color: #409eff;
}
.batch-body-page {
  margin-top: 5px;
}
</style>
