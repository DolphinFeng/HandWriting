<template>
  <div id="AutoQAApprove" class="component">
    <!-- 面包屑：展示资料平台的任务管理 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">PN/PSP管理</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <div class="breadcrumbItem" @click="handleBreadcrumb"
          :class="{ 'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 1 }">autoQA准出
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索工具栏组件 -->
    <ApproveTool key="ApproveTool"
      :isLoading="isLoading"
      :approveStatusOptions="approveStatusOptions"
      :selectionRows="selectionRows"
      @onSearch="onSearch"></ApproveTool>
    <!-- 批次情况 -->
    <ApproveTable key="ApproveTable" 
      :tableData="tableData" 
      :total="total"
      @selectionRows="handleSelectionRows"
      @handleSizeChange="handleSizeChange"
      @handleCurrentChange="handleCurrentChange"></ApproveTable>
  </div>
</template>
  
<script>
const nioPowerSwapURL = window.api.nioPowerSwapURL;
// 引入需要的组件
import ApproveTool from "./ApproveTool.vue";
import ApproveTable from "./ApproveTable.vue";
import { omit} from 'lodash';

// 引入js数据
import axios from "axios";
import { ElMessage } from "element-plus";
import { ArrowRight } from "@element-plus/icons-vue";

export default {
  name: "AutoQAApprove",
  components: {
    ApproveTool,
    ApproveTable
  },
  data() {
    return {
      breadcrumbResourceShow: false,
      isLoading: false,
      tableData: [],
      total: 0,
      currentPage: 1,
      pageSize: 20,
      selectionRows: [],
      approveStatusOptions: [
        {
          lable: '通过',
          value: true
        },
        {
          lable: '未通过',
          value: false
        }
      ],
      approveForm: {
        businessType: null,
        businessId: null,
        mapId: null,
        autoqaConfigId: null,
        materialId: null,
        permit: null,
        configTimeBegin: null,
        configTimeEnd: null,
        createTimeRange: []
      }
    }
  },
  setup() {
    return {
      ArrowRight,
    }
  },
  methods: {
    // 筛选查询功能
    onSearch(approveForm) {
      this.approveForm = approveForm;
      this.currentPage = 1;
      this.loadingPage();
    },
    // 获取表格信息功能
    loadingPage() {
      axios({
        url: nioPowerSwapURL + '/nio/autoqa/info/list',
        method: 'post',
        data: {
          ...this.approveForm,
          pageSize: this.pageSize,
          pageNum: this.currentPage,
        }
      }).then(response => {
        if (response.data.code === 0) {
          this.total = response.data.totalCount;
          if (this.total === 0) {
            ElMessage.warning({
              message: '没有符合查询条件的数据',
              showClose: true,
            });
          }
          this.tableData = response.data.data
        } else {
          ElMessage.error({
            message: response.data.msg,
            showClose: true,
          });
        }
      }).catch((err) => {
        ElMessage.error({
          message: err,
        });
      });
    },
    // 表格size改变时触发函数
    handleSizeChange(page_size) {
      this.pageSize = page_size;
      this.loadingPage()
    },
    // 表格当前页码改变时触发函数
    handleCurrentChange(page) {
      this.currentPage = page;
      this.loadingPage();
    },
    handleSelectionRows(rows) {
      this.selectionRows = rows;
    },
    modifyPackage() {
      this.packageEditData = null;
      this.isPackageEditShow = true;
    },
    closePackageEdit() {
      if (this.isPackageEditShow === false) {
        return;
      }
      this.isPackageEditShow = false;
    }
  },
  mounted() {
    this.loadingPage();
  }
}
</script>
  
<style scoped>
</style>
  