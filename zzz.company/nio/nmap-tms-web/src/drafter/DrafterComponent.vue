<template>
  <div id="DrafterComponent" class="component">
    <!-- 面包屑：展示流程列表的环境变量列表 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem active-breadcrumb-item">任务编排</div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索栏 -->
    <div class="mesh-search">
      <el-form inline :model="searchForm">
<!--        <el-form-item label="产品名称：">-->
<!--          <el-input v-model.trim="searchForm.product_name" placeholder="请输入产品名称" style="width: 160px;" clearable></el-input>-->
<!--        </el-form-item>-->
<!--        <el-form-item label="产品分支：">-->
<!--          <el-input v-model.trim="searchForm.product_version" placeholder="请输入分支" style="width: 160px;" clearable></el-input>-->
<!--        </el-form-item>-->
        <el-form-item label="任务池：">
          <el-select style="width: 320px" v-model="searchForm.poolId" placeholder="请选择任务池"
                     clearable @change="changePool">
            <el-option
                v-for="item in searchForm.pools"
                :key="item.id"
                :label="item.productName + ':' + item.productBranch"
                :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button :icon="Search"  type="primary" @click="onSearch">查询</el-button>
          <el-button :icon="FolderAdd" type="success" @click="onClaim">领取任务</el-button>
          <el-button :icon="FolderAdd" type="warning" @click="handleImportBtn">导入任务</el-button>
          <el-button :icon="Refresh" @click="resetForm">重置</el-button>
          <el-button :icon="FolderAdd" type="success" @click="createTaskPool">创建任务池</el-button>
        </el-form-item>
      </el-form>
      <!-- 流程部署对话框 -->
      <el-dialog
          title="导入任务文件"
          v-model="importDialog.visible"
          width="600px">
        <el-upload
            class="upload-demo"
            ref="upload"
            :action="importDialog.uploadAction"
            :on-success="handleSuccess"
            :on-error="handleError"
            :file-list="fileList"
            accept="text/csv"
            :auto-upload="true">
          <el-button size="small" type="primary">选取文件</el-button>
          <div slot="tip" class="el-upload__tip">请上传⽂件后缀是 .csv 的文件</div>
        </el-upload>
        <template #footer class="dialog-footer">
          <el-button @click="cancelImportBtn">取消</el-button>
        </template>
      </el-dialog>
    </div>
    <!-- 主表格信息组件 -->
    <div id="drafterContainer" class="table-container">
      <!-- 正在作业任务 -->
      <transition name="">
        <el-card v-show="transitionFlag[0]" class="card-item" shadow="never" :body-style="{flex: '1', padding: '10px 5px'}">
          <template #header>
            <div class="card-header">
              <span>正在作业任务</span>
              <span class="dots-animate">.</span>
              <span style="flex: 1"></span>
              <span class="badge badge-occupy"></span>
            </div>
          </template>
          <el-table :max-height="heightList[0]" :data="taskList.assigned" @click="copyTxt($event)">
            <el-table-column prop="businessKey" align="center" key="businessKey" label="业务标识">
              <template #default="{row}">
                <span class="copy-txt task-item-txt">{{row.businessKey}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="mesh" align="center" key="mesh" label="图幅号">
              <template #default="{row}">
                <span class="copy-txt mesh-item-txt">{{row.taskRange.range}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="task" align="center" key="type" label="任务类型">
              <template #default="{row}">
                <span class="copy-txt task-item-txt">{{row.type}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="batch" align="center" key="batch" label="批次">
              <template #default="{row}">
                <span class="copy-txt task-item-txt">{{row.batch}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="taskId" align="center" key="taskId" label="任务号">
              <template #default="{row}">
                <span class="copy-txt task-item-txt">{{row.assignRecord.taskId}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="worker" align="center" key="worker" label="作业员">
              <template #default="{row}">
                <span class="copy-txt task-item-txt">{{row.assignRecord.worker}}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </transition>
      <!-- 任务池任务 -->
      <transition name="">
        <el-card v-show="transitionFlag[1]" class="card-item" shadow="never" :body-style="{flex: '1', padding: '10px 5px'}">
          <template #header>
            <div class="card-header">
              <span>可作业</span>
              <span class="dots-animate">.</span>
              <span style="flex: 1"></span>
              <span class="badge badge-prepare"></span>
            </div>
          </template>
          <el-table :max-height="heightList[1]" :data="taskList.unassigned" @click="copyTxt($event)">
            <el-table-column prop="businessKey" align="center" key="businessKey" label="业务标识">
              <template #default="{row}">
                <span class="copy-txt task-item-txt">{{row.businessKey}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="mesh" align="center" key="mesh" label="图幅号">
              <template #default="{row}">
                <span class="copy-txt mesh-item-txt">{{row.taskRange.range}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="task" align="center" key="type" label="任务类型">
              <template #default="{row}">
                <span class="copy-txt task-item-txt">{{row.type}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="batch" align="center" key="batch" label="批次">
              <template #default="{row}">
                <span class="copy-txt task-item-txt">{{row.batch}}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </transition>
      <!-- 任务池任务 -->
      <transition name="">
        <el-card v-show="transitionFlag[2]" class="card-item" shadow="never" :body-style="{flex: '1', padding: '10px 5px'}">
          <template #header>
            <div class="card-header">
              <span>不可作业</span>
              <span class="dots-animate">.</span>
              <span style="flex: 1"></span>
              <span class="badge badge-prepare"></span>
            </div>
          </template>
          <el-table :max-height="heightList[2]" :data="taskList.unavailable" @click="copyTxt($event)">
            <el-table-column prop="businessKey" align="center" key="businessKey" label="业务标识">
              <template #default="{row}">
                <span class="copy-txt task-item-txt">{{row.businessKey}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="mesh" align="center" key="mesh" label="图幅号">
              <template #default="{row}">
                <span class="copy-txt mesh-item-txt">{{row.taskRange.range}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="type" align="center" key="type" label="任务类型">
              <template #default="{row}">
                <span class="copy-txt task-item-txt">{{row.type}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="batch" align="center" key="batch" label="批次">
              <template #default="{row}">
                <span class="copy-txt task-item-txt">{{row.batch}}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </transition>
    </div>
    <EditTaskPoolDialog 
      :showDialog="isShowEditTaskPool"
      :editData="curTaskPoolData"
      @store="storeTaskPool"
      @close="closeEditTaskPool"/>
  </div>
</template>

<script setup>
import {ArrowRight} from "@element-plus/icons-vue";
import {Search, Refresh, FolderAdd} from "@element-plus/icons-vue";
import {nextTick, onMounted, onUnmounted, reactive, ref} from "vue";
import axios from "axios";
import {ElMessage} from "element-plus";
import {copyTextToClipboard} from "@/utils/index.js";
import EditTaskPoolDialog from './EditTaskPoolDialog.vue';

const apiNioDrafterURL = window.api.apiNioDrafterURL;

let fileList = []
const searchForm = reactive({
  poolId: null,
  pools:[]
});
const taskList = reactive({
  assigned: [],
  unassigned: [],
  unavailable: []
});
const heightList = reactive([0, 0, 0]);
const transitionFlag = reactive([false, false, false]);

let animateHandlers = [];
let importDialog = reactive({
  uploadAction: apiNioDrafterURL + "/drafter/task/csv/import?poolId="+searchForm.poolId,
  visible: false
});

const onSearch = function () {
  loadingPage();
}

// 获取所需select选项的数据源
const getPoolData = function() {
  // 获取流程名称
  axios({
    url: apiNioDrafterURL + '/drafter/task/pool/query',
    method: 'post',
  }).then(response => {
    if (response.data.code === 200) {
      Object.assign(searchForm,{pools:response.data.data})
    }
  }).catch(() => {
    ElMessage.error({
      message: '获取任务池失败',
      showClose: true,
    });
  });
}
const changePool = function (poolId){
  Object.assign(searchForm, {
    poolId: poolId
  });
  importDialog.value = {
    uploadAction: apiNioDrafterURL + '/drafter/task/csv/import?poolId' + poolId,
    visible: importDialog.visible
  };
  // importDialog.uploadAction.value = apiNioDrafterURL + '/drafter/task/csv/import?poolId' + poolId;
  // Object.assign(uploadAction, apiNioDrafterURL + '/drafter/task/csv/import?poolId' + poolId);
}
const onClaim = function () {
  if(searchForm.poolId == null){
    ElMessage.warning({
      message: "未选择任务池",
      showClose: false,
      grouping: true
    });
    return;
  }
  axios({
    method: 'get',
    url: apiNioDrafterURL + '/drafter/task/claim',
    params: {
      poolId:searchForm.poolId,
      worker:localStorage.getItem('realName')
    }
  }).then(res => {
    if (res.data.code === 200) {
      ElMessage.success({
        message: "领取成功，任务已下发",
        showClose: false,
        grouping: true
      });
      loadingPage();
    } else {
      throw new Error('服务端异常');
    }
  }).catch(err => {
    ElMessage.error({
      message: err.message,
      showClose: false,
      grouping: true,
    });
  });
}
const resetForm = function () {
  Object.assign(searchForm, {
    poolId: null
  });
  importDialog.value = {
    uploadAction: apiNioDrafterURL + '/drafter/task/csv/import?poolId'+searchForm.poolId,
    visible: importDialog.visible
  };
}
const loadingPage = function () {
  if(searchForm.poolId == null){
    ElMessage.warning({
      message: "未选择任务池",
      showClose: false,
      grouping: true
    });
    return;
  }
  axios({
    method: 'post',
    url: apiNioDrafterURL + '/drafter/task/pool/detail',
    params: {
      poolId:searchForm.poolId
    }
  }).then(res => {
    if (res.data.code === 200) {
      let data = res.data.data;
      taskList.assigned = data['assigned'];
      taskList.unassigned = data['unassigned'];
      taskList.unavailable = data['unavailable'];
    } else {
      throw new Error(res.data.msg);
    }
  }).catch(err => {
    Object.assign(taskList, {
      assigned: [],
      unassigned: [],
      unavailable: []
    });
    ElMessage.error({
      message: err.message,
      showClose: false,
      grouping: true,
    });
  });
}
const requestDotAnimate = function () {
  let dots = document.querySelectorAll('.dots-animate');
  dots.forEach(item => {
    setTimeout(() => {
      let handler = setInterval(() => {
        if (item.textContent.length < 4) {
          item.textContent += '.';
        } else {
          item.textContent = '.';
        }
      }, 300);
      animateHandlers.push(handler);
    }, 600 * Math.random());
  });
  animateHandlers.push(setInterval(loadingPage, 10000));
}
const clearDotAnimate = function () {
  animateHandlers.forEach(item => {
    clearInterval(item);
  });
  animateHandlers = [];
}
const copyTxt = function (ev) {
  //事件代理
  if (ev.target.classList.contains('copy-txt')) {
    copyTextToClipboard(ev.target.textContent, 1000);
  }
}
const adaptiveTableHeight = function () {
  let cardBodyList = document.querySelectorAll('.el-card__body');
  cardBodyList.forEach((item, idx) => {
    heightList[idx] = item.offsetHeight - 10;
  });
}

const handleImportBtn = function handleImportBtn()  {
  if(searchForm.poolId == null){
    ElMessage.warning({
      message: "未选择任务池",
      showClose: false,
      grouping: true
    });
    return;
  }
  Object.assign(importDialog, {
        uploadAction: apiNioDrafterURL + '/drafter/task/csv/import?poolId=' + searchForm.poolId,
        visible:true
      })
}

const cancelImportBtn = function cancelImportBtn() {
  Object.assign(importDialog,{visible:false})
}

const handleSuccess  = function handleSuccess(response, file, fileList) {
  if (response.code === 200) {
    Object.assign(importDialog,{visible:false})
    ElMessage.success({
      message: '文件' + file.name + '导入成功',
      showClose: true,
    });
  } else {
    ElMessage.error({
      message: response.msg,
      showClose: true,
    });
  }
}
const handleError  =function handleError(err, file, fileList) {
  ElMessage.error({
    message: '文件' + file.name + '导入失败',
    showClose: true,
  });
}

const isShowEditTaskPool = ref(false);
const curTaskPoolData = ref(null);
const createTaskPool = () => {
  isShowEditTaskPool.value = true
  curTaskPoolData.value = null
}
const storeTaskPool = (dataForm) => {
  console.log(dataForm);
  isShowEditTaskPool.value = false;
  curTaskPoolData.value = dataForm
  axios({
    method: 'post',
    url: apiNioDrafterURL + '/drafter/task/pool/create',
    data: dataForm
  }).then(res => {
    if (res.data.code === 200) {
      curTaskPoolData.value = res.data.data;
      ElMessage.warning({
        message: "任务池创建成功",
        showClose: false,
        grouping: true
      });
    } else {
      throw new Error(res.data.msg);
    }
  }).catch(err => {
    ElMessage.error({
      message: err.message,
      showClose: false,
      grouping: true,
    });
  });
}
const closeEditTaskPool = (dataForm) => {
  curTaskPoolData.value = dataForm
  if (!isShowEditTaskPool.value) {
    return;
  }
  isShowEditTaskPool.value = false;
}
onMounted(() => {
  for (let i = 0; i < transitionFlag.length; i++) {
    transitionFlag[i] = true;
  }
  nextTick(() => {
    getPoolData();
    loadingPage();
    requestDotAnimate();
    adaptiveTableHeight();
  });
});

onUnmounted(() => {
  clearDotAnimate();
});
</script>

<style scoped>
.mesh-search {
  padding: 5px 0 5px 20px;
  text-align: left;
  color: black;
  font-size: 15px;
}
#drafterContainer {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  align-content: center;
  justify-content: space-around;
  margin: 5px 5px 5px 5px;
  flex: 1;
}
.card-item {
  display: flex;
  flex-flow: column nowrap;
  flex: 1;
  max-width: 500px;
  height: 100%;
  margin: 0 5px;
}

.card-header {
  position: relative;
  display: flex;
  align-items: center;
  user-select: none;
}
.dots-animate {
  margin-left: 2px;
}
.badge {
  position: absolute;
  top: 0;
  right: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.badge-occupy {
  background-color: #F56C6C;
}
.badge-prepare {
  background-color: #409EFF;
}
.mesh-item-txt, .task-item-txt {
  cursor: pointer;
}
</style>
