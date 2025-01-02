<template>
  <!-- 搜索工具栏 -->
  <div class="psTool">
    <div class="search-btn-group">
      <el-button :icon="Search" type="primary" @click="searchHandler">查询</el-button>
      <el-button :icon="FolderAdd" type="success" @click="createHandler">新建任务</el-button>
    </div>
  </div>
  <!-- 主表格 -->
  <div class="table">
    <!-- 表格 -->
    <div class="table-container"
         ref="tableRef"
         v-loading="tableData.loading"
         element-loading-text="拼命加载中..."
         :element-loading-spinner="svg"
         element-loading-svg-view-box="-10, -10, 50, 50"
    >
      <el-table
          :data="tableData.list"
          border
          :max-height="tableData.tableHeight"
          @cell-click="cellClickHandler"
      >
        <el-table-column align="center" prop="taskName" label="任务名" key="taskName" min-width="160"></el-table-column>
        <el-table-column align="center" prop="taskDesc" label="任务说明" key="taskDesc" min-width="90"></el-table-column>
        <el-table-column align="center" prop="taskStatus" label="任务状态" key="taskStatus" min-width="90">
          <template #default="{row}">
            <el-tag :type="getStatus(row.taskStatus, 'tag')">{{getStatus(row.taskStatus, 'name')}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="templateIdentity" label="模板" key="templateIdentity" min-width="120"></el-table-column>
        <el-table-column align="center" prop="taskParams" label="任务参数" key="taskParams" min-width="100">
          <template #default="{row}">
            <el-link v-if="row.taskParams" type="primary" :underline="false">
              <span class="link-btn" data-type="taskParams">查看</span>
            </el-link>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="producerImage" label="生产者镜像" key="producerImage" min-width="120">
          <template #default="{row}">
            <el-link v-if="row.producerImage" type="primary" :underline="false">
              <span class="link-btn" data-type="producerImage">查看</span>
            </el-link>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="consumerImage" label="消费者镜像" key="consumerImage" min-width="120">
          <template #default="{row}">
            <el-link v-if="row.consumerImage" type="primary" :underline="false">
              <span class="link-btn" data-type="consumerImage">查看</span>
            </el-link>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="createdTime" label="创建时间" key="createdTime" min-width="190"></el-table-column>
        <el-table-column align="center" prop="updatedTime" label="更新时间" key="updatedTime" min-width="190"></el-table-column>
        <el-table-column align="center" prop="output" label="任务输出" key="output" min-width="120">
          <template #default="{row}">
            <el-link v-if="row.output" type="primary" :underline="false">
              <span class="link-btn" data-type="output">查看</span>
            </el-link>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 分页 -->
    <div style="padding-top: 10px" class="tPaginationContainer">
      <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="searchForm.page"
          :page-sizes="[5, 10, 20, 50, 200]"
          :page-size="searchForm.row"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableData.total"
      ></el-pagination>
    </div>
    <JsonView
        v-model:visible="jsonData.visible"
        :title="jsonData.title"
        :data="jsonData.data"
    ></JsonView>
  </div>
</template>

<script setup>
import {Search, Refresh, Download, FolderAdd} from "@element-plus/icons-vue";
import {svg} from "@/js/loading_data.js";
import {nextTick, onMounted, onUnmounted, reactive, ref} from "vue";
import JsonView from "@/jsonView/JsonView.vue";

const props = defineProps({
  searchForm: {
    type: Object,
    required: true,
  },
  tableData: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(['handleSizeChange', 'handleCurrentChange', 'searchHandler', 'resetHandler', 'loadingPage', 'createHandler', 'exportHandler']);

const taskStatusMap = {
  TASK_STATUS_RUNNING: {
    name: '进行中',
    tag: 'warning'
  },
  TASK_STATUS_SUCCESS: {
    name: '成功',
    tag: 'success',
  },
  TASK_STATUS_FAILED: {
    name: '失败',
    tag: 'danger',
  },
  TASK_STATUS_CREATED: {
    name: '创建',
    tag: 'primary'
  },
};
const tableRef = ref(null);
const jsonData = reactive({
  title: '',
  visible: false,
  data: '{}'
});

function searchHandler() {
  emit('searchHandler');
}
function resetHandler() {
  emit('resetHandler');
}
function createHandler() {
  emit('createHandler');
}
function handleSizeChange(size) {
  emit('handleSizeChange', size);
}
function handleCurrentChange(page) {
  emit('handleCurrentChange', page);
}
function adaptiveTableHeight() {
  props.tableData.tableHeight = tableRef.value === null ? 0 : tableRef.value.offsetHeight;
}

function showJson(title, data) {
  Object.assign(jsonData, {
    title: title,
    visible: true,
    data: data
  });
}

const tableEventStrategy = {
  taskParams: function (row) {
    showJson('任务参数', row.taskParams);
  },
  producerImage: function (row) {
    showJson('生产者镜像', row.producerImage);
  },
  consumerImage: function (row) {
    showJson('消费者镜像', row.consumerImage);
  },
  output: function (row) {
    showJson('输出参数', row.output);
  }
};
function cellClickHandler(row, column, cell, ev) {
  let type = ev.target?.dataset?.type;
  if (type) {
    tableEventStrategy[type](row);
  }
}

function getStatus(status, type) {
  if (status in taskStatusMap) {
    return taskStatusMap[status][type];
  } else {
    return '';
  }
}

onMounted(() => {
  nextTick(() => {
    adaptiveTableHeight();
  });
  emit('loadingPage');
  window.addEventListener('resize', adaptiveTableHeight, false);
});
onUnmounted(() => {
  window.removeEventListener('resize', adaptiveTableHeight);
});
</script>

<style scoped>
.psTool {
  padding: 5px 0 5px 20px;
  text-align: left;
  color: black;
  font-size: 15px;
}

.psTool .el-form-item {
  margin-right: 20px;
}
.search-btn-group {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  height: 36px;
  margin-right: 15px;
}
</style>
