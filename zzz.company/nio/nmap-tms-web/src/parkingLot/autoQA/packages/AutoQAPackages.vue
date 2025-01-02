<template>
  <div id="AutoQAPackages" class="component">
    <!-- 面包屑：展示资料平台的任务管理 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">PN/PSP管理</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <div class="breadcrumbItem" @click="handleBreadcrumb"
          :class="{ 'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 1 }">autoQA套餐管理
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索工具栏组件 -->
    <PackagesTool key="PackagesTool"
      :isLoading="isLoading"
      @onSearch="onSearch"
      @create="createPackage"
      @modify="modifyPackage"></PackagesTool>
    <!-- 主表格信息组件 -->
    <PackagesTable key="PackagesTable" 
      :tableData="tableData" 
      :total="total"
      @handleSizeChange="handleSizeChange"
      @handleCurrentChange="handleCurrentChange"></PackagesTable>
    <AddPackageDialog
      :showDialog="isPackageEditShow"
      :packageEditData="packageEditData"
      @store="storePackage"
      @close="closePackageEdit"></AddPackageDialog>
  </div>
</template>
  
<script>
const nioPowerSwapURL = window.api.nioPowerSwapURL;
// 引入需要的组件
import PackagesTool from "./PackagesTool.vue";
import PackagesTable from "./PackagesTable.vue";
import AddPackageDialog from "./AddPackageDialog.vue";

// 引入js数据
import axios from "axios";
import { ElMessage } from "element-plus";
import { ArrowRight } from "@element-plus/icons-vue";

export default {
  name: "AutoQAPackages",
  components: {
    PackagesTool,
    PackagesTable,
    AddPackageDialog
  },
  data() {
    return {
      breadcrumbResourceShow: false,
      isLoading: false,
      tableData: [],
      total: 0,
      currentPage: 1,
      pageSize: 20,
      isPackageEditShow: false,
      packageEditData: null,
      packageForm: {
        configName: null,
        configDesc: null,
        algVsn: null,
        operator: null
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
    onSearch(packageForm) {
      if (packageForm.configName === '') {
        packageForm.configName = null; // test
      }
      this.packageForm = packageForm;
      this.currentPage = 0;
      this.loadingPage();
    },
    // 获取表格信息功能
    loadingPage() {
      axios({
        url: nioPowerSwapURL + '/nio/autoqa/config/list',
        method: 'post',
        data: {
          ...this.packageForm,
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
    createPackage() {
      this.packageEditData = null;
      this.isPackageEditShow = true;
    },
    modifyPackage() {
      this.packageEditData = null;
      this.isPackageEditShow = true;
    },
    storePackage(packageEditData) {
      if (packageEditData.configName === null || packageEditData.configName.trim() === '') {
        ElMessage.error({
          message: '套餐配置名称格式错误',
        });
        return
      }
      if (packageEditData.configFile === null) {
        ElMessage.error({
          message: '未上传配置文件',
        });
        return
      }
      let commitData = new FormData();
      commitData.append('configName', packageEditData.configName);
      commitData.append('configDesc', packageEditData.configDesc ?? '');
      commitData.append('algVsn', packageEditData.algVsn);
      commitData.append('configFile', packageEditData.configFile);
      commitData.append('operator', localStorage.getItem('realName'));
      axios({
        url: nioPowerSwapURL + '/nio/autoqa/config/add',
        method: 'post',
        data: commitData
      }).then(res => {
        if (res.data.code === 0) {
          ElMessage.success({
            message: '新增业务场景成功'
          });
          this.isPackageEditShow = false;
          this.currentPage = 1;
          this.loadingPage();
        } else {
          ElMessage.error({
            message: res.data.msg,
          });
        }
      }).catch((err) => {
        ElMessage.error({
          message: err,
        });
      });
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
  