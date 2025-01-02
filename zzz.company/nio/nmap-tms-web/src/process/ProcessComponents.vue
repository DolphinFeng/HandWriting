<template>
  <div id="ProcessComponents" class="component">
    <!-- 面包屑：展示流程列表的环境变量列表 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">流程图预览</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <div class="breadcrumbItem" @click="breadcrumbButton" :class="{'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 1}">流程管理</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item v-if="previewShow">
        <div class="breadcrumbItem" :class="{'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 2}">流程图预览</div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索工具栏组件 -->
    <ProcessTool
      v-if="mainShow"
      :searchForm="searchForm"
      @changeNum="changeNum"
      @onSearch="onSearch"
      @resetForm="resetForm"
    ></ProcessTool>
    <!-- 主表格信息组件 -->
    <ProcessTable
      v-if="mainShow"
      :tableData="tableData"
      :total="total"
      @loadingPage="loadingPage"
      @handlePreview="handlePreview"
      @handlePaginationChange="handlePaginationChange"
    ></ProcessTable>
    <!-- 流程图预览 -->
    <ProcessPreview
      v-if="previewShow"
      :procDefKey="procDefKey"
      :procDefForm="procDefForm"
    ></ProcessPreview>
  </div>
</template>

<script>
// 引入需要的组件
import ProcessTool from "./ProcessTool.vue";
import ProcessTable from "./ProcessTable.vue";
import ProcessPreview from "./ProcessPreview.vue";
import store from "../store/index.js";
import {ElMessage} from "element-plus";
import axios from "axios";
import {ArrowRight} from "@element-plus/icons-vue";

const nioTaskURL = window.api.nioTaskURL;

export default {
  name: "ProcessComponents",
  // 组件注册
  components: {
    ProcessTool,
    ProcessTable,
    ProcessPreview,
  },
  data() {
    return {
      searchForm: {
        key: "",
        name: "",
      },
      // 表格数据
      tableData: [],
      // 表格总条数
      total: 0,
      // 表格当前页码
      currentPage: 1,
      // 每次表格展示多少条信息
      pageSize: 20,
      mainShow: true,
      previewShow: false,
      formData: {},
      procDefKey: "",
      pageName: null,
      procDefForm: {
        procDefId: "",
      }
    };
  },
  setup() {
    return {
      ArrowRight,
    }
  },
  methods: {
    breadcrumbButton() {
      this.mainShow = true;
      this.previewShow = false;
      store.commit('breadChange', 1);
    },
    handlePreview(row) {
      this.previewShow = true;
      this.mainShow = false;
      this.pageName = "流程图预览";
      this.procDefKey = row.key;
      this.procDefForm.procDefId = row.id;
      store.commit('breadChange', 2);
    },
    // 数字检查函数
    changeNum(val) {
      switch (val) {
        case 1:
          this.searchForm.key = this.searchForm.key.replace(
            /[^\a-zA-Z0-9.-_\u4E00-\u9FA5]/g,
            ""
          );
          break;
        case 2:
          // 中文、英文、数字、点
          this.searchForm.name = this.searchForm.name.replace(
            /[^\a-zA-Z0-9.-_\u4E00-\u9FA5]/g,
            ""
          );
      }
    },
    handlePaginationChange(currentPage, pageSize) {
      this.currentPage = currentPage;
      this.pageSize = pageSize;
      this.loadingPage();
    },
    // 筛选查询功能
    onSearch() {
      this.currentPage = 1;
      this.loadingPage();
    },
    // 重置功能
    resetForm() {
      this.searchForm.key = "";
      this.searchForm.name = "";
    },
    // 获取表格信息功能
    loadingPage() {
      axios({
        url: nioTaskURL + "/process/query",
        method: "get",
        params: {
          ...this.searchForm,
          pageSize: this.pageSize,
          pageNo: this.currentPage,
        },
      }).then((response) => {
        if (response.data.code === 200) {
          this.tableData = response.data.data.result;
          this.total = response.data.data.total;
          if (this.total === 0) {
            ElMessage.warning({
              message: "没有符合查询条件的流程数据",
              showClose: true,
            });
          }
        }
      }).catch(() => {
        ElMessage.error({
          message: "获取流程列表失败",
          showClose: true,
        });
      });
    },
  },
  created() {
    this.loadingPage();
  },
};
</script>

<style scoped>
#breadcrumb {
  padding: 6px 0 2px 20px;
  font-size: 15px;
  font-weight: bold;
}
</style>
