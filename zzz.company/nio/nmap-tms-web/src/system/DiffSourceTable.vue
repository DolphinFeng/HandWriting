<template>
  <!-- 主表格信息组件 -->
  <div id="DiffSourceTable" class="table">
    <div id="DiffSourceTableContainer" class="table-container">
      <el-table :max-height="tableHeight" v-loading="loading" :data="tableData" border>
        <el-table-column v-for="item in tableColumns" :key="item.prop" v-bind="item">
          <template #default="{row}">
            <div v-if="item.prop === 'meshList'">
              {{ row.meshList && row.meshList.join(',')}}
            </div>
            <span v-else-if="item.prop === 'businessType'">
              {{ getBusinessTypeLabel(row[item.prop]) }}
            </span>
            <span v-else-if="item.prop === 'checkStatus'">
              {{ getCheckStatusLabel(row[item.prop]) }}
            </span>
            <span v-else-if="item.prop === 'mergeStatus'">
              {{ getMergeStatusLabel(row[item.prop]) }}
            </span>
            <span v-else>
              {{ row[item.prop] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="260" align="center">
          <template #default="scope">
            <el-button :loading="isLoadDownUrl" link type="primary" size="small" @click="doDownload(scope.row)">
              下载
            </el-button>
            <el-button :disabled="!scope.row.pathList || scope.row.pathList.length == 0" link type="primary" size="small" @click="showPathList(scope.row)">
              数据路径记录
            </el-button>
            <el-button :disabled="!scope.row.tmsResult || scope.row.tmsResult.length == 0" link type="primary" size="small" @click="showTmsResult(scope.row)">
              执行任务记录
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 分页组件 -->
    <div id="ApprovePagination" style="padding-top: 10px" class="pagination-container">
      <el-pagination background :total="total" :page-size="pageSize" v-model="currentPage" :page-sizes="[20, 50, 100, 500]"
        @current-change="handleCurrentChange" @size-change="handleSizeChange"
        layout="total, sizes, prev, pager, next, jumper"></el-pagination>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch, defineEmits, onMounted, onUnmounted } from "vue";
import { diffSourceTableColumns, getBusinessTypeLabel, checkStatusOptions, getCheckStatusLabel, mergeStatusOptions, getMergeStatusLabel } from "@/js/diffsource_data.js";
import axios from "axios";
import { ElMessage } from "element-plus";

const nioDiffSourceURL = window.api.nioDiffSourceURL;

const emit = defineEmits();

interface Props {
  loading: boolean;
  tableData: Array<any>[];
  total: Number;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  tableData: () => [],
  total: () => 0
});

let tableColumns = ref([ ... diffSourceTableColumns ]);
let pageSize = ref(20);
let currentPage = ref(0);
let tableHeight = ref(0);
let isLoadDownUrl = ref(false);

const doDownload = (row) => {
  if (isLoadDownUrl.value) {
    return;
  }
  axios({
    url: nioDiffSourceURL + '/diff-source/download/url',
    method: 'post',
    data: {
      id: row.id,
    }
  }).then(response => {
    if (response.data.code === 0 || response.data.code === 200) {
      if (response.data.data.length > 0 && response.data.data[0] != '') {
        window.open(response.data.data[0])
      } else {
        ElMessage.error({
          message: "未找到下载地址",
        });
      }
    } else {
      ElMessage.error({
        message: response.data.msg,
        showClose: true,
      });
    }
    isLoadDownUrl.value = false;
  }).catch((err) => {
    isLoadDownUrl.value = false;
    ElMessage.error({
      message: err,
    });
  });
}

const handleCurrentChange = (page) => {
  currentPage.value = page;
  emit('handleCurrentChange', page);
}
const handleSizeChange = (page_size) => {
  pageSize.value = page_size;
  emit('handleSizeChange', page_size);
}
const showPathList = (row) => {
  emit('showPathList', row);
}
const showTmsResult = (row) => {
  emit('showTmsResult', row);
}
const adaptiveTableHeight = () => {
  tableHeight.value = document.getElementById('DiffSourceTable') === null ? 0 : (document.getElementById('DiffSourceTable').offsetHeight - 42);
}
watch(props.tableData, (newVal, ) => {
  nextTick(() => {
    adaptiveTableHeight();
  });
});

onMounted(() => {
  nextTick(() => {
    adaptiveTableHeight();
  });
  window.addEventListener('resize', adaptiveTableHeight);
});

onUnmounted(() => {
  window.removeEventListener('resize', adaptiveTableHeight);
});
</script>

<style scoped>
.table{
  overflow: hidden;
}
</style>