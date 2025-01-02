<template>
  <div class="component">
    <!-- 面包屑：展示任务管理 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">量产任务中心</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item @click="backPageHandler">
        <div @click="changeBreadcrumb(1)" :class="{'active-breadcrumb-item': store.state.activeBreadcrumbIndex === 1}" class="breadcrumbItem">HdMap Issue</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item v-if="createPageShow">
        <div :class="{'active-breadcrumb-item': store.state.activeBreadcrumbIndex === 2}" class="breadcrumbItem">新建任务</div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 查询页面 -->
    <HDQuery
        v-if="!createPageShow"
        :search-form="searchForm"
        :table-data="tableData"
        @handleSizeChange="handleSizeChange"
        @handleCurrentChange="handleCurrentChange"
        @searchHandler="searchHandler"
        @resetHandler="resetHandler"
        @loadingPage="loadingPage"
        @createHandler="createHandler"
    ></HDQuery>
    <!-- 新建任务页面 -->
    <HDCreate
        v-else
        @cancelCreateHandler="cancelCreateHandler"
    ></HDCreate>
  </div>
</template>

<script setup>
import axios from "axios";
import {ElMessage} from "element-plus";
import {nextTick, onMounted, onUnmounted, reactive, ref} from "vue";
import {useStore} from "vuex";
import HDQuery from "@/HDMap/HDQuery.vue";
import {ArrowRight} from "@element-plus/icons-vue";
import HDCreate from "@/HDMap/HDCreate.vue";

const store = useStore();
const nioOfflineTaskURL = window.api.nioOfflineTaskURL;
//搜索内容
const searchForm = reactive({
  requestTime: '',
});
const createPageShow = ref(false);
const tableData = reactive({
  loading: false,
  tableHeight: 0,
  list: [],
  total: 0,
  page: 1,
  size: 20,
});

/**
 * 事件处理
 */
function searchHandler() {
  loadingPage();
}
function resetHandler() {
  reset();
}
function backPageHandler() {
  backPage();
}
function createHandler() {
  createTask();
}
function cancelCreateHandler() {
  cancelCreate();
}

/**
 * 逻辑处理
 */
//取消新建任务
function cancelCreate() {
  createPageShow.value = false;
  changeBreadcrumb(1);
}
//新建任务
function createTask() {
  createPageShow.value = true;
  changeBreadcrumb(2);
}
//切换面包屑
function changeBreadcrumb(index) {
  store.commit('breadChange', index);
}
function backPage() {
  createPageShow.value = false;
}
//重置表单
function reset() {
  Object.assign(searchForm, {

  })
}
//单页尺寸变化
function handleSizeChange(size) {
  tableData.size = size;
  tableData.page = 1;
  loadingPage();
}
//翻页
function handleCurrentChange(page) {
  tableData.page = page;
  loadingPage();
}

//搜索
function loadingPage() {
  tableData.loading = true;
  axios.get(nioOfflineTaskURL + '/task/list-by-template', {
    params: {
      templateIdentity: 'odd_cluster',
      offset: (tableData.page - 1) * tableData.size,
      limit: tableData.size,
      sortDirection: 'desc'
    }
  }).then(res => {
    if (res.data.code === 200) {
      let data = res.data.data, taskList = data.taskList;
      tableData.list = taskList.map(item => ({
        taskName: item.taskName,
        taskDesc: item.taskDesc,
        taskStatus: item.taskStatus,
        templateIdentity: item.templateIdentity,
        taskParams: item.taskParams,
        createdTime: item.createdTime,
        updatedTime: item.updatedTime,
        output: item.output,
        producerImage: item.producerImage,
        consumerImage: item.consumerImage,
      }));
      tableData.total = data['totalCount'];
    } else {
      throw new Error(res.data.msg);
    }
  }).catch(err => {
    ElMessage.warning({
      message: err.message,
      grouping: true,
      showClose: false,
    });
  }).finally(() => {
    tableData.loading = false;
  });
}

</script>

<style scoped>

</style>
