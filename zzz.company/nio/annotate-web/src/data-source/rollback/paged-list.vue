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
    v-model:visible="pagedListData.visible"
    @created="created"
    @changeSize="changeSize"
    :loading="pagedListData.loading"
    loading-text="努力加载中..."
  >
    <template #header>
      <div class="batch-title">列表</div>
      <button class="batch-title batch-title2" @click.native="loadFirstPage">第一页</button>
      <button class="batch-title batch-title2" @click.native="loadNextPage">下一页</button>
      <div style="flex: 1"></div>
      <div class="batch-panel-close" @click="closeEventListPane">
        <i class="iconfont icon-guanbi1"></i>
      </div>
    </template>
    <template #default>
      <div class="batch-body-box">
        <div style="height: 1px; background-color: #849fb9; margin: 0 4px"></div>
        <div class="batch-body-table" ref="tableBody">
          <el-table
            :data="pagedListData.list"
            :height="maxHeight"
            @cell-click="tableHandler"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" align="center" width="40" fixed="left"></el-table-column>
            <el-table-column label="名称" prop="name" key="name" align="center" min-width="180">
              <template #default="{row}">
                <div class="copy-text" :title="row.name">{{ row.name }}</div>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="name" label="定位" key="name" width="60">
              <template #default="scope">
                <el-button @click="handleLocate(scope.row)" link type="primary">定位</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="batch-body-page">
          <el-pagination
            background
            small
            :total="pagedListData.total"
            :page-size="pagedListData.pageSize"
            v-model="pagedListData.pageNo"
            :page-sizes="[50]"
            layout="total,pager"
          ></el-pagination>
        </div>
      </div>
    </template>
  </Panel>
</template>

<script setup>
import Panel from '../../components/panel.vue';
import {NioMessage, nioCamera} from '../../utils/utils.js';
import {Cartesian3} from 'cesium';
import {nextTick, onMounted, reactive, ref} from 'vue';
import {debounce} from 'lodash-es';
import {pagedListData, laodingOneItem, clearRollbackAllPrimitive, loadingListHandler} from './paged-list-panel.ts';

const tableBody = ref(null);

const initialWidth = parseInt(localStorage.getItem('eventPanelWidth') ?? 1000);
const initialHeight = parseInt(localStorage.getItem('eventPanelHeight') ?? 400);

const maxHeight = ref(0);

let visibleSet = new Set();

function closeEventListPane() {
  pagedListData.visible = false;

  clearRollbackAllPrimitive(true);
}

const loadFirstPage = async function () {
  pagedListData.loading = true;
  clearRollbackAllPrimitive(true);
  pagedListData.marker = '';
  pagedListData.pageNo = 1;
  await loadingListHandler();
  pagedListData.loading = false;
};

const loadNextPage = async function () {
  if (pagedListData.marker == null) {
    NioMessage('warning', '已经是最后一页');
    return;
  }

  pagedListData.loading = true;
  pagedListData.pageNo++;
  clearRollbackAllPrimitive(false);
  await loadingListHandler();
  pagedListData.loading = false;
};

function adaptiveTableHeight() {
  maxHeight.value = tableBody.value === null ? 0 : tableBody.value.offsetHeight;
}

const tableHandler = function (row, column, cell, event) {};

const handleLocate = (row) => {
  if (!pagedListData.posMap.has(row.cos_prefix)) {
    NioMessage('warning', '请先点击加载数据');
    return;
  }

  let pos = pagedListData.posMap.get(row.cos_prefix);
  nioCamera.locatePosition({
    position: Cartesian3.fromDegrees(pos[0], pos[1], 500),
    duration: 1,
    animate: true,
    before() {},
    completed() {},
  });
};

const handleSelectionChange = (selection) => {
  let currentVisibleSet = new Set();
  for (let item of selection) {
    currentVisibleSet.add(item.cos_prefix);
    if (!visibleSet.has(item.cos_prefix)) {
      laodingOneItem(item.cos_prefix, true);
    }
  }

  for (let item of visibleSet) {
    if (!currentVisibleSet.has(item)) {
      laodingOneItem(item, false);
    }
  }

  visibleSet = currentVisibleSet;
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
