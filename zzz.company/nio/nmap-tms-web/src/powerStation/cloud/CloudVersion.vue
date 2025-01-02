<template>
  <div id="cloudVersion" class="component">
    <!-- 面包屑：展示任务管理 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">换电站管理</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <div class="breadcrumbItem active-breadcrumb-item">点云发版管理</div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索栏 -->
    <div class="search-tool">
      <el-form :model="searchForm" inline label-position="right" label-width="140px" @submit.prevent="searchHandler">
        <el-form-item prop="hdVersion" label="服务区HD版本号：">
          <el-input v-model="searchForm.hdVersion" placeholder="请输入服务区HD版本号" clearable style="width: 180px"></el-input>
        </el-form-item>
        <el-form-item prop="cloudVersion" label="点云版本号：">
          <el-input v-model="searchForm.cloudVersion" placeholder="请输入点云版本号" clearable style="width: 180px"></el-input>
        </el-form-item>
        <div class="search-btn">
          <el-button type="primary" native-type="submit" :icon="Search">查询</el-button>
          <el-button @click="resetHandler" :icon="Refresh">重置</el-button>
        </div>
      </el-form>
    </div>
    <!-- 表格区 -->
    <div class="table">
      <div id="cloud-version-container"
           class="table-container"
           v-loading="tableData.loading"
           element-loading-text="拼命加载中..."
           :element-loading-spinner="svg"
           element-loading-svg-view-box="-10, -10, 50, 50"
      >
        <el-table :data="tableData.list" border :max-height="tableData.tableHeight">
          <el-table-column prop="id" key="id" align="center" min-width="80" label="记录ID"></el-table-column>
          <el-table-column prop="hdReleaseVersion" key="hdReleaseVersion" align="center" min-width="160" label="服务区HD版本号"></el-table-column>
          <el-table-column prop="pcReleaseVersion" key="pcReleaseVersion" align="center" min-width="100" label="点云版本号"></el-table-column>
          <el-table-column prop="releaseDetail" key="releaseDetailFile" align="center" min-width="130" label="发版明细文件">
            <template #default="{row}">
              <el-popover :width="350" placement="left" trigger="hover" :show-after="300">
                <div>{{row.releaseDetail}}</div>
                <template #reference>
                  <el-link type="primary" :href="row.releaseDetail" :underline="false">
                    <span class="link-btn">下载发版明细文件</span>
                  </el-link>
                </template>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column prop="releaseStatus" key="releaseStatus" align="center" min-width="120" label="发版状态">
            <template #default="{row}">
              <el-tag :type="handleReleaseStatus.formatType(row.releaseStatus)">{{handleReleaseStatus.formatStatus(row.releaseStatus)}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" key="createTime" align="center" min-width="180" label="创建时间"></el-table-column>
          <el-table-column prop="updateTime" key="updateTime" align="center" min-width="180" label="更新时间"></el-table-column>
        </el-table>
      </div>
      <!-- 分页组件 -->
      <div style="padding-top: 10px" class="tPaginationContainer">
        <el-pagination
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="tableData.curPage"
            :page-sizes="[5, 10, 20, 50, 200]"
            :page-size="tableData.curSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="tableData.total">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ArrowRight, Search, Refresh} from "@element-plus/icons-vue";
import {onMounted, reactive} from "vue";
import axios from "axios";
import {ElMessage} from "element-plus";
import {svg} from "@/js/loading_data.js";

const nioPowerSwapURL = window.api.nioPowerSwapURL;
const searchForm = reactive({
  hdVersion: '',
  cloudVersion: '',
});
const tableData = reactive({
  loading: false,
  tableHeight: 0,
  list: [],
  total: 0,
  curPage: 1,
  curSize: 20,
});
const handleReleaseStatus = {
  formatType(releaseStatus) {
    switch (releaseStatus) {
      case 'CREATE':
        return 'info';
      case 'RELEASING':
        return 'warning';
      case 'FAILED':
        return 'danger';
      case 'SUCCESSFUL':
        return 'success';
      case 'DEFAULT':
        return 'danger';
    }
  },
  formatStatus(releaseStatus) {
    switch (releaseStatus) {
      case 'CREATE':
        return '已创建';
      case 'RELEASING':
        return '发版中';
      case 'FAILED':
        return '发版失败';
      case 'SUCCESSFUL':
        return '发版成功';
      case 'DEFAULT':
        return '未知状态';
    }
  }
};

const searchHandler = function () {
  loadingPage();
};
const resetHandler = function () {
  Object.assign(searchForm, {
    hdVersion: '',
    cloudVersion: '',
  });
};

const handleSizeChange = function (size) {
  tableData.curSize = size;
};
const handleCurrentChange = function (page) {
  tableData.curPage = page;
};

const loadingPage = function () {
  tableData.loading = true;
  axios.post(nioPowerSwapURL + '/nio/power-swap-station/release/list', {
    hdReleaseVersion: searchForm.hdVersion,
    pcReleaseVersion: searchForm.cloudVersion,
    pageNum: tableData.curPage - 1,
    pageSize: tableData.curSize,
  }).then(res => {
    if (res.data.code === 0) {
      tableData.total = res.data['totalCount'];
      tableData.list = res.data.data;
    } else {
      throw new Error(res.data.msg);
    }
  }).catch(err => {
    ElMessage.error({
      message: '获取列表失败' + err.message,
      duration: 3000,
      grouping: true,
    });
  }).finally(() => {
    tableData.loading = false;
  })
};

const adaptiveTableHeight = function () {
  tableData.tableHeight = document.getElementById('cloud-version-container') === null ? 0 : document.getElementById('cloud-version-container').offsetHeight;
};
onMounted(() => {
  adaptiveTableHeight();
  loadingPage();
});

</script>

<style scoped>
.search-btn {
  height: 36px;
}
</style>
