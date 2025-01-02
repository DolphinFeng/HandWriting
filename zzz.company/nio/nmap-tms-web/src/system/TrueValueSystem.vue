<template>
  <div id="AutoQAApprove" class="component">
    <!-- 面包屑：展示资料平台的任务管理 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">真值评测系统</div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索工具栏组件 -->
    <DiffSourceTool key="DiffSourceTool"
      ref="toolRef"
      :loading="loading"
      :curVersionId="curVersionId"
      @createVersion="showEditVersion"
      @showVersionList="showVersionList"
      @onSearch="onSearch"></DiffSourceTool>
    <!-- 批次情况 -->
    <DiffSourceTable key="DiffSourceTable" 
      :loading="loading"
      :tableData="tableData" 
      :total="total"
      @showPathList="showPathList"
      @showTmsResult="showTmsResult"
      @handleSizeChange="handleSizeChange"
      @handleCurrentChange="handleCurrentChange"></DiffSourceTable>
    <PathListDialog key="PathListDialog"
      :showDialog="isPathListShow"
      :tableList="curPathList"
      @close="closePathList"></PathListDialog>
    <TmsResultDialog key="TmsResultDialog"
      :showDialog="isTmsResultShow"
      :tableList="curTmsResult"
      @close="closeTmsResult"></TmsResultDialog>
    <EditVersionDialog key="EditVersionDialog"
      :showDialog="isEditVersionShow"
      :editData="curEditVersion"
      @store="storeVersion"
      @close="closeEditVersion"></EditVersionDialog>
    <VersionListDialog key="VersionListDialog"
      :showDialog="isVersionListShow"
      :tableList="curVersionList"
      @onSearchVersion="doSearchVerion"
      @close="closeVersionList"></VersionListDialog>
  </div>
</template>
  
<script>
const nioDiffSourceURL = window.api.nioDiffSourceURL;
// 引入需要的组件
import DiffSourceTool from "./DiffSourceTool.vue";
import DiffSourceTable from "./DiffSourceTable.vue";
import PathListDialog from "./PathListDialog.vue";
import TmsResultDialog from "./TmsResultDialog.vue";
import EditVersionDialog from "./EditVersionDialog.vue";
import VersionListDialog from "./VersionListDialog.vue";

// 引入js数据
import axios from "axios";
import { ElMessage } from "element-plus";
import { ArrowRight } from "@element-plus/icons-vue";

export default {
  name: "TrueValueSystem",
  components: {
    DiffSourceTool,
    DiffSourceTable,
    PathListDialog,
    TmsResultDialog,
    EditVersionDialog,
    VersionListDialog
  },
  data() {
    return {
      breadcrumbResourceShow: false,
      loading: false,
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
      diffSourceForm: {
        id: null,
        version: null,
        isLatest: true,
        meshList: null,
        batchIdList: null,
        checkStatus: null,
        mergeStatus: null,
        source: null,
        businessType: null,
        businessKey: null,
        engineVersionList: null,
        createTimeFrom: null,
        createTimeTo: null,
        updateTimeFrom: null,
        updateTimeTo: null,
        includeDiffSourceResult: true
      },
      curPathList: [],
      isPathListShow: false,
      curTmsResult: [],
      isTmsResultShow: false,
      curEditVersion: null,
      isEditVersionShow: false,
      curVersionList: [],
      isVersionListShow: false,
      curVersionId: 0
    }
  },
  setup() {
    return {
      ArrowRight,
    }
  },
  methods: {
    // 筛选查询功能
    onSearch(diffSourceForm) {
      this.diffSourceForm = diffSourceForm;
      this.currentPage = 1;
      this.loadingPage();
    },
    // 获取表格信息功能
    loadingPage() {
      if (this.loading) {
        return;
      }
      this.loading = true;
      axios({
        url: nioDiffSourceURL + '/diff-source/query-by-page',
        method: 'post',
        data: {
          ...this.diffSourceForm,
          pageSize: this.pageSize,
          pageNo: this.currentPage,
        }
      }).then(response => {
        this.loading = false;
        if (response.data.code === 0 || response.data.code === 200) {
          this.total = response.data.data.total;
          if (this.total === 0) {
            ElMessage.warning({
              message: '没有符合查询条件的数据',
              showClose: true,
            });
          }
          this.tableData = response.data.data.result;
        } else {
          ElMessage.error({
            message: response.data.msg,
            showClose: true,
          });
        }
      }).catch((err) => {
        this.loading = false;
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
    showPathList(row) {
      this.curPathList = row.pathList;
      this.isPathListShow = true;
    },
    closePathList() {
      if (this.isPathListShow === false) {
        return;
      }
      this.curPathList = null;
      this.isPathListShow = false;
    },
    showTmsResult(row) {
      this.curTmsResult = row.tmsResult;
      this.isTmsResultShow = true;
    },
    closeTmsResult() {
      if (this.isTmsResultShow === false) {
        return;
      }
      this.curTmsResult = null;
      this.isTmsResultShow = false;
    },
    showEditVersion() {
      this.curEditVersion = null;
      this.isEditVersionShow = true;
    },
    closeEditVersion(dataForm) {
      if (this.isEditVersionShow === false) {
        return;
      }
      this.curEditVersion = dataForm;
      this.isEditVersionShow = false;
    },
    storeVersion(dataForm) {
      if (!dataForm.name) {
        return;
      }
      axios({
        url: nioDiffSourceURL + '/diff-source/version-tag/create',
        method: 'post',
        data: {
          ...dataForm
        }
      }).then(response => {
        if (response.data.code === 0 || response.data.code === 200) {
          ElMessage.success({
            message: '创建版本成功',
            showClose: true,
          });
          this.$refs.toolRef.remoteQuery('');
          this.curEditVersion = response.data.data;
          this.isEditVersionShow = false;
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
    closeVersionList() {
      if (this.isVersionListShow === false) {
        return;
      }
      this.curVersionList = null;
      this.isVersionListShow = false;
    },
    showVersionList() {
      if (this.loading) {
        return;
      }
      this.loading = true;
      axios({
        url: nioDiffSourceURL + '/diff-source/version-tag/list'
      }).then(response => {
        this.loading = false;
        if (response.data.code === 0 || response.data.code === 200) {
          this.curVersionList = response.data.data;
          this.isVersionListShow = true;
        } else {
          ElMessage.error({
            message: response.data.msg,
            showClose: true,
          });
        }
      }).catch((err) => {
        this.loading = false;
        ElMessage.error({
          message: err,
        });
      });
    },
    doSearchVerion(version) {
      this.curVersionId = version;
      this.diffSourceForm.version = version;
      this.isVersionListShow = false;
      this.$nextTick(() => {
        this.loadingPage();
      });
    }
  },
  mounted() {
    this.loadingPage();
  }
}
</script>
  
<style scoped>
</style>
  