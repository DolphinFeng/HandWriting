<template>
  <div id="ExceptionComponent" class="component">
    <div style="display: inline-block">
      <!-- 面包屑：展示检查服务的例外管理 -->
      <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
        <el-breadcrumb-item>
          <div class="breadcrumbItem">检查服务</div>
        </el-breadcrumb-item>
        <el-breadcrumb-item>
          <div class="breadcrumbItem active-breadcrumb-item">例外管理</div>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <!-- 搜索工具栏组件 -->
    <ExceptionTool
        :key="ExceptionToolKey"
        :ExceptionForm="ExceptionForm"
        @onSearch="onSearch"
        @reSet="reSet"
    ></ExceptionTool>
    <!-- 主表格信息组件 -->
    <ExceptionTable
        :loading="loading"
        :key="ExceptionTableKey"
        :tableData="tableData"
        :total="total"
        @handleSizeChange="handleSizeChange"
        @handleCurrentChange="handleCurrentChange"
    ></ExceptionTable>
  </div>
</template>

<script>
// 引入需要的组件
import ExceptionTool from "./ExceptionTool.vue";
import ExceptionTable from "./ExceptionTable.vue";
import {ArrowRight} from "@element-plus/icons-vue";
import axios from "axios";
import {ElMessage} from "element-plus";

const nioCheckURL = window.api.nioCheckURL;

export default {
  name: "ExceptionComponent",
  // 组件注册
  components: {
    ExceptionTool,
    ExceptionTable,
  },
  data() {
    return {
      loading: false,
      ExceptionToolKey: 0,
      ExceptionTableKey: 10,
      // 搜索栏数据存储的form
      ExceptionForm: {
        ruleCodes: '',
        featureIds: '',
        meshes: '',
        productName: '',
        branchName: '',
      },
      // 表格数据
      tableData: [],
      // 表格总条数
      total: 0,
      // 表格当前页码
      currentPage: 1,
      // 每次表格展示多少条信息
      pageSize: 20,
    }
  },
  setup() {
    return {
      ArrowRight,
    }
  },
  methods: {
    // 筛选查询功能
    onSearch() {
      this.currentPage = 1;
      this.loadingPage();
    },
    // 重置功能
    reSet() {
      this.ExceptionForm = {
        taskId: '',
        checkId: '',
      }
    },
    // 获取表格信息功能
    loadingPage() {
      this.loading = true;
      axios({
        url: nioCheckURL + '/check-man/except/list',
        method: 'post',
        data: {
          ...this.ExceptionForm,
          pageSize: this.pageSize,
          pageNo: this.currentPage,
        }
      }).then(response => {
        if (response.data.code === 200) {
          this.total = response.data.data.total;
          this.tableData = response.data.data.result;
          for (let i in this.tableData) {
            // 整理表格数据中的序号
            this.tableData[i].exceptionNum = parseInt(i) + 1;
          }
        } else {
          ElMessage.error({
            message: response.data.msg,
            showClose: true,
          });
        }
      }).catch(() => {
        ElMessage.error({
          message: '没有获取到数据',
          showClose: true,
        });
      }).finally(() => {
        this.loading = false;
      });
    },
    // 表格size改变时触发函数
    handleSizeChange(page_size) {
      this.pageSize = page_size;
      this.loadingPage();
    },
    // 表格当前页码改变时触发函数
    handleCurrentChange(page) {
      this.currentPage = page;
      this.loadingPage();
    },
  },
}
</script>

<style scoped>
#breadcrumb {
  padding: 6px 0 2px 20px;
  font-size: 15px;
  font-weight: bold;
}

</style>
