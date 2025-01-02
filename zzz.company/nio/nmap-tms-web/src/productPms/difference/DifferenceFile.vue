<template>
  <div id="PowerSettingComponent" class="component">
    <!-- 面包屑：展示产品的产品详情 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">数据管理平台</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <div class="breadcrumbItem active-breadcrumb-item">差分管理</div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索工具栏 -->
    <div class="psTool">
      <el-form inline :model="searchForm" label-position="right" ref="searchRef" :rules="rules" @submit.prevent="searchHandler">
        <el-form-item prop="uuid" label="uuid：">
          <el-input v-model="searchForm.uuid" placeholder="请输入uuid" style="width: 160px;" clearable></el-input>
        </el-form-item>
        <el-form-item prop="meshList" label="图幅号：">
          <el-input v-model="searchForm.meshList" placeholder="请输入图幅号" style="width: 160px;" clearable></el-input>
        </el-form-item>
        <el-form-item prop="tableName" label="差分表：">
          <el-input v-model="searchForm.tableName" placeholder="请输入差分表名" style="width: 160px;" clearable></el-input>
        </el-form-item>
        <el-form-item prop="modifyType" label="差分类型：">
          <el-select v-model="searchForm.modifyType" placeholder="请选择差分类型" style="width: 160px;" clearable>
            <el-option
                v-for="item in modifyTypeOption"
                :label="item.label"
                :key="item.value"
                :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="featureId" label="记录id：">
          <el-input v-model="searchForm.featureId" placeholder="请输入记录id" style="width: 160px;" clearable></el-input>
        </el-form-item>
        <div style="height: 36px;">
          <el-button :icon="Search" type="primary" native-type="submit">查询</el-button>
          <el-button :icon="Refresh" @click="resetHandler">重置</el-button>
        </div>
      </el-form>
    </div>
    <!-- 主表格 -->
    <div class="table">
      <!-- 表格 -->
      <div class="table-container"
           ref="tableRef"
           v-loading="loading"
           element-loading-text="拼命加载中..."
           :element-loading-spinner="svg"
           element-loading-svg-view-box="-10, -10, 50, 50"
      >
        <el-table
            :data="tableData.list"
            border
            :max-height="tableData.tableHeight"
            @cell-click="cellHandler"
        >
          <el-table-column align="center" prop="id" label="Id" key="id" min-width="100"></el-table-column>
          <el-table-column align="center" prop="mesh" label="图幅号" key="mesh" min-width="110"></el-table-column>
          <el-table-column align="center" prop="tableName" label="表名" key="tableName" min-width="100"></el-table-column>
          <el-table-column align="center" prop="modifyType" label="差分类型" key="modifyType" min-width="90">
            <template #default="{row}">
              <el-tag :type="getModifyTag(row.modifyType)">{{getModifyType(row.modifyType)}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="featureId" label="记录id" key="featureId" min-width="140"></el-table-column>
          <el-table-column align="center" label="变化字段" min-width="90">
            <template #default="{row}">
              <el-link v-if="!isNullObject(row.changeFiled)" type="primary" :underline="false">
                <span class="link-btn" data-type="changeFiled">查看</span>
              </el-link>
              <el-tag v-else type="warning">null</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" label="原值" min-width="70">
            <template #default="{row}">
              <el-link v-if="!isNullObject(row.oldValue)" type="primary" :underline="false">
                <span class="link-btn" data-type="oldValue">查看</span>
              </el-link>
              <el-tag v-else type="warning">null</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" label="新值" min-width="70">
            <template #default="{row}">
              <el-link v-if="!isNullObject(row.newValue)" type="primary" :underline="false">
                <span class="link-btn" data-type="newValue">查看</span>
              </el-link>
              <el-tag v-else type="warning">null</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="createdAt" label="创建时间" key="createdAt" min-width="190"></el-table-column>
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
            :total="tableData.total">
        </el-pagination>
      </div>
    </div>
    <!-- 显示json内容 -->
    <json-view
        :title="jsonData.title"
        v-model:visible="jsonData.visible"
        :data="jsonData.data"
    ></json-view>
  </div>
</template>

<script setup>
import {Search, Refresh, ArrowRight} from "@element-plus/icons-vue";
import axios from "axios";
import {ElMessage} from "element-plus";
import {svg} from "@/js/loading_data.js";
import {nextTick, onMounted, onUnmounted, reactive, ref} from "vue";
import JsonView from "@/jsonView/JsonView.vue";
import {isNullObject} from "@/utils/index.js";

const nioDifferenceURL = window.api.nioDifferenceURL;

//搜索内容
const searchForm = reactive({
  uuid: '',
  page: 1,
  row: 20,
  meshList: '',
  tableName: '',
  modifyType: '',
  featureId: '',
});
const modifyTypeOption = [
  {label: '新建', value: 1},
  {label: '删除', value: 2},
  {label: '修改', value: 3},
];
const tableRef = ref(null);
const searchRef = ref(null);
const tableData = reactive({
  tableHeight: 0,
  list: [],
  total: 0,
});
const jsonData = reactive({
  title: '',
  visible: false,
  data: '{}'
});

const loading = ref(false);
const rules = reactive({
  uuid: [
    {required: true, message: '请输入uuid', trigger: 'blur'},
  ],
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
//表格事件代理策略
const cellStrategy = {
  changeFiled: function (row) {
    jsonData.title = '变化字段';
    jsonData.data = JSON.stringify(row.changeFiled);
    jsonData.visible = true;
  },
  newValue: function (row) {
    jsonData.title = '新值';
    jsonData.data = JSON.stringify(row.newValue);
    jsonData.visible = true;
  },
  oldValue: function (row) {
    jsonData.title = '旧值';
    jsonData.data = JSON.stringify(row.oldValue);
    jsonData.visible = true;
  }
}
function cellHandler(row, column, cell, ev) {
  if (ev.target) {
    let type = ev.target.dataset.type
    if (type in cellStrategy) {
      cellStrategy[type](row);
    }
  }
}

/**
 * 逻辑处理
 */
//重置表单
function reset() {
  Object.assign(searchForm, {
    uuid: '',
    meshList: '',
    tableName: '',
    modifyType: '',
    featureId: '',
  })
}
//单页尺寸变化
function handleSizeChange(size) {
  searchForm.row = size;
  searchForm.page = 1;
  loadingPage();
}
//翻页
function handleCurrentChange(page) {
  searchForm.page = page;
  loadingPage();
}
//将差分类型字段转为汉文
function getModifyType(type) {
  switch (type) {
    case 'create':
      return '创建';
    case 'modify':
      return '修改';
    case 'delete':
      return '删除';
  }
}
//计算差分类型的tag-type
function getModifyTag(type) {
  switch (type) {
    case 'create':
      return 'success';
    case 'modify':
      return 'warning';
    case 'delete':
      return 'danger';
  }
}

//搜索
function loadingPage() {
  if (searchForm.uuid === '') {
    return;
  }
  loading.value = true;
  axios.get(nioDifferenceURL + '/difference/query_page', {
    params: {
      uuid: searchForm.uuid,
      page: searchForm.page,
      row: searchForm.row,
      meshList: searchForm.meshList || undefined,
      tableName: searchForm.tableName || undefined,
      modifyType: searchForm.modifyType || undefined,
      featureId: searchForm.featureId || undefined,
    }
  }).then(res => {
    if (parseInt(res.data.code) === 200) {
      let data = res.data.data;
      tableData.total = data.totalRecord;
      tableData.list = data.data.map(item => {
        return {
          id: item.id,
          mesh: item.mesh,
          tableName: item.tableName,
          modifyType: item.modifyType,
          featureId: item.featureId,
          changeFiled: item.result.changeFiled,
          oldValue: item.result.oldValue,
          newValue: item.result.newValue,
          createdAt: item.createdAt,
        }
      });
    } else {
      throw new Error(res.data.errMsg);
    }
  }).catch(err => {
    ElMessage.error({
      message: err.message,
      grouping: true,
      showClose: false,
    });
  }).finally(() => {
    loading.value = false;
  });
}
function adaptiveTableHeight() {
  tableData.tableHeight = tableRef.value === null ? 0 : tableRef.value.offsetHeight;
}

onMounted(() => {
  nextTick(() => {
    adaptiveTableHeight();
  });
  loadingPage();
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
</style>
