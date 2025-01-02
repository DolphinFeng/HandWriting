<template>
  <div id="MeshOccupation" class="component">
    <!-- 面包屑：展示流程列表的环境变量列表 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem active-breadcrumb-item">占图服务</div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索栏 -->
    <div class="mesh-search">
      <el-form inline :model="searchForm" @submit.prevent="onSearch">
        <el-form-item label="产品名称：">
          <el-input v-model.trim="searchForm.productName" placeholder="请输入产品名称" style="width: 160px;"
                    clearable></el-input>
        </el-form-item>
        <el-form-item label="产品分支：">
          <el-input v-model.trim="searchForm.branchName" placeholder="请输入分支" style="width: 160px;"
                    clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button :icon="Search" type="primary" native-type="submit">查询</el-button>
          <el-button :icon="Refresh" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 主表格信息组件 -->
    <div id="meshListContainer" class="table-container">
      <!-- 正在占用图幅任务 -->
      <transition name="">
        <el-card v-show="transitionFlag[0]" class="card-item" shadow="never"
                 :body-style="{flex: '1', padding: '10px 20px'}">
          <template #header>
            <div class="card-header">
              <span>正在占用图幅任务</span>
              <span class="dots-animate">.</span>
              <span style="flex: 1"></span>
              <span class="badge badge-occupy"></span>
            </div>
          </template>
          <el-table :max-height="heightList[0]" :data="taskList.doingMeshTask" @click="copyTxt($event)">
            <el-table-column prop="mesh" align="center" key="mesh" label="图幅号">
              <template #default="{row}">
                <span class="copy-txt mesh-item-txt">{{ row.mesh }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="task" align="center" key="task" label="任务号">
              <template #default="{row}">
                <span class="copy-txt task-item-txt">{{ row.task }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </transition>
      <!-- 等待图幅任务 -->
      <transition name="">
        <el-card v-show="transitionFlag[1]" class="card-item" shadow="never"
                 :body-style="{flex: '1', padding: '10px 20px'}">
          <template #header>
            <div class="card-header">
              <span>等待图幅任务</span>
              <span class="dots-animate">.</span>
              <span style="flex: 1"></span>
              <span class="badge badge-wait"></span>
            </div>
          </template>
          <el-table row-key="mesh" :max-height="heightList[1]" :data="taskList.waitMeshTaskQue"
                    @click="copyTxt($event)">
            <el-table-column width="40px" type="expand" align="center">
              <template #default="{row}">
                <el-timeline style="margin-left: 20px;">
                  <el-timeline-item
                      v-for="(item, idx) in row.taskList"
                      size="normal"
                      :key="item"
                      :icon="idx === 0 ? MoreFilled : undefined"
                      :type="idx === 0 ? 'primary' : undefined"
                      :timestamp="idx === 0 ? '即将开始' : undefined"
                      :hollow="idx !== 0"
                  >
                    <span class="copy-txt task-item-txt">{{ item }}</span>
                  </el-timeline-item>
                </el-timeline>
              </template>
            </el-table-column>
            <el-table-column prop="mesh" key="" align="center" label="图幅号">
              <template #default="{row}">
                <span class="copy-txt mesh-item-txt">{{ row.mesh }}</span>
              </template>
            </el-table-column>
            <el-table-column key="mesh" align="center" label="等待任务">
              <template #default="{row}">
                <span class="wait-task">{{ row.taskList.length }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </transition>
    </div>
  </div>
</template>

<script setup>
import {ArrowRight} from "@element-plus/icons-vue";
import {Search, Refresh, MoreFilled} from "@element-plus/icons-vue";
import {nextTick, onMounted, onUnmounted, reactive, ref} from "vue";
import axios from "axios";
import {ElMessage} from "element-plus";
import {copyTextToClipboard} from "@/utils/index.js";

const apiNioMeshURL = window.api.apiNioMeshURL;
const searchForm = reactive({
  productName: 'nio_base_hd',
  branchName: 'master',
});
const taskList = reactive({
  doingMeshTask: [],
  waitMeshTaskQue: [],
});
const heightList = reactive([0, 0]);
const transitionFlag = reactive([false, false]);

let animateHandlers = [];

const onSearch = function () {
  loadingPage();
}
const resetForm = function () {
  Object.assign(searchForm, {
    product_type: 1,
    productName: 'NIO_BASE_HD',
    branchName: 'master',
  });
}
const loadingPage = function () {
  axios({
    method: 'GET',
    url: apiNioMeshURL + '/reconcile/mesh-lock/info?productName=' + searchForm.productName + '&branchName=' + searchForm.branchName
  }).then(res => {
    if (res.data.code === 200) {
      let data = res.data.data;
      taskList.doingMeshTask = Object.entries(data['doingMap']).map(item => {
        return {mesh: item[0], task: item[1]};
      });
      taskList.waitMeshTaskQue = Object.entries(data['waitingMap']).map(item => {
        return {mesh: item[0], taskList: item[1]};
      });
    } else {
      throw new Error('服务端异常');
    }
  }).catch(err => {
    Object.assign(taskList, {
      doingMeshTask: [],
      waitMeshTaskQue: [],
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
  animateHandlers.push(setInterval(loadingPage, 1000));
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

onMounted(() => {
  for (let i = 0; i < transitionFlag.length; i++) {
    transitionFlag[i] = true;
  }
  nextTick(() => {
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

#meshListContainer {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  align-content: center;
  justify-content: space-around;
  margin: 5px 20px 10px 20px;
  flex: 1;
}

.card-item {
  display: flex;
  flex-flow: column nowrap;
  flex: 1;
  max-width: 400px;
  height: 100%;
  margin: 0 40px;
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

.badge-wait {
  background-color: #67C23A;
}

.mesh-item-txt, .task-item-txt {
  cursor: pointer;
}

.wait-task {
  font-weight: bold;
  color: #67C23A;
  cursor: pointer;
}

.wait-task-list {
  margin-left: 40px;
}

.wait-task-item {
  display: flex;
  align-items: center;
}

.wait-item-txt {
  width: calc(50% - 20px);
  cursor: pointer;
  text-align: center;
}
</style>
