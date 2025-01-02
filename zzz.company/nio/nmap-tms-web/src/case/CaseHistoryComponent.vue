<!-- 停车场管理 -> 停车场详情页面 -->
<template>
  <div id="CaseHistoryComponent" class="component">
    <!-- 搜索工具栏 -->
    <div class="psTool">
      <el-form inline :model="caseSearch" label-position="right" ref="form" id="formDiv">
        <el-form-item label="issue：">
          <el-input v-model.trim="caseSearch.uuid" style="width: 160px" clearable></el-input>
        </el-form-item>
        <el-form-item label="内容：">
          <el-input v-model.trim="caseSearch.content" style="width: 160px" clearable></el-input>
        </el-form-item>
        <el-form-item label="case状态：">
          <el-select v-model="caseSearch.caseStatus" placeholder="请选择">
            <el-option v-for="item in caseStatusOption" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item prop="startTime" label="开始时间：" name="startTime">
          <el-date-picker v-model="caseSearch.startTime" type="datetime" format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss" style="width: 300px" placeholder="请选择">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="项目：" prop="project">
          <el-select v-model="caseSearch.project" placeholder="请选择" multiple>
            <el-option v-for="item in projectOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="批次：" prop="batch">
          <el-select v-model="caseSearch.batch" placeholder="请选择" multiple>
            <el-option v-for="item in batchOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="height: 36px">
        <el-button :icon="Search" type="primary" @click.stop="search">查询</el-button>
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
      </div>
    </div>
    <!-- 主表格 -->
    <div class="table">
      <div id="StationTableContainer" class="table-container" v-loading="loading" element-loading-text="拼命加载中..."
        :element-loading-spinner="svg" element-loading-svg-view-box="-10, -10, 50, 50">
        <el-table :data="tableData" :border="true" :max-height="tableHeight" @selection-change="handleSelectionChange">
          <el-table-column fixed="left" align="center" type="selection" width="55"></el-table-column>
          <el-table-column fixed="left" align="center" prop="id" label="id" key="id" min-width="100">
          </el-table-column>
          <el-table-column fixed="left" align="center" prop="uuid" label="issue" key="uuid" min-width="100">
          </el-table-column>
          <el-table-column align="center" prop="content" label="内容" key="content" min-width="500">
          </el-table-column>
          <el-table-column align="center" prop="operationEventCode" label="操作类型" key="operationEventCode"
            min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="coordinate" label="坐标" key="coordinate" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="caseStatus" label="case状态" key="caseStatus" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="startTime" label="开始时间" key="startTime" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="project" label="项目" key="project" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="batch" label="批次" key="batch" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="taskId" label="任务号" key="taskId" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="taskStartTime" label="任务开始时间" key="taskStartTime" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="taskEndTime" label="任务结束时间" key="taskEndTime" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="operator" label="作业人员" key="operator" min-width="150">
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { Search, Refresh, FolderOpened, FolderAdd, ArrowRight } from '@element-plus/icons-vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { svg } from '@/js/loading_data.js';
import { caseStatusMap } from './case-data.js';

const nioCaseService = window.api.nioCaseService;

export default {
  name: 'caseHistoryPage',

  props: {
    caseId: String,
    content: String,
    coordinate: String,
    batch: String,
    uuid: String,
  },

  data() {
    return {
      loading: false,
      breadcrumbResourceShow: false,
      // 搜索内容
      caseSearch: {
        uuid: '',
        content: '',
        caseStatus: '',
        startTime: '',
        endTime: '',
        project: '',
        batch: ''
      },

      batchOptions: [],
      projectOptions: [],

      caseStatusOption: [],

      showUploadDlg: false,
      uploadDlgData: {
        fileName: ''
      },
      rulesUpload: {
        fileName: [{ required: true, message: '请上传文件', trigger: 'change' }],
      },

      showCreateDlg: false,
      createDlgData: {
        uuid: '',
        batch: '',
        content: '',
        project: ''
      },
      rulesCreate: {
        uuid: [{ required: true, message: '请输入', trigger: 'change' }],
        batch: [{ required: true, message: '请输入', trigger: 'change' }],
        content: [{ required: true, message: '请输入', trigger: 'change' }],
      },

      showModifyDlg: false,
      modifyDlgData: {
        uuid: '',
        batch: '',
        content: '',
        project: ''
      },
      rulesModify: {
        uuid: [{ required: true, message: '请输入', trigger: 'change' }],
        batch: [{ required: true, message: '请输入', trigger: 'change' }],
        content: [{ required: true, message: '请输入', trigger: 'change' }],
      },

      tableData: [],
      multipleSelection: [], //当前表格选中行
      tableHeight: 0,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      svg: svg,
    };
  },
  methods: {
    //选择项发生变化时触发
    handleSelectionChange(selection) {
      this.multipleSelection = selection;
    },
    //带条件查询搜索
    search() {
      this.currentPage = 1;
      this.loadingPage();
    },
    //重置条件查询表单
    resetForm() {
      this.caseSearch = {
        uuid: '',
        content: '',
        caseStatus: '',
        startTime: '',
        endTime: '',
        project: '',
        batch: ''
      };
    },

    uploadCase() { this.showUploadDlg = true; },
    createCase() { this.showCreateDlg = true; },
    modifyCase() { this.showModifyDlg = true; },
    downloadCase() { },

    closeUploadCase() { this.showUploadDlg = false; },
    closeCreateCase() { this.showCreateDlg = false; },
    closeModifyCase() { this.showModifyDlg = false; },

    doCreateCase() { },
    doModifyCase() { },

    //更换表格单页显示条数
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.currentPage = 1;
      this.loadingPage();
    },
    //切换页码
    handleCurrentChange(page) {
      this.currentPage = page;
      this.loadingPage();
    },
    loadingBatchs() {
      axios({
        url: nioCaseService + '/case/batch/query-by-page',
        method: 'post',
        data: {
          pageNo: 1,
          pageSize: 1000
        },
        headers: {
          'content-type': 'application/json'
        }
      }).then(res => {
        this.batchOptions = res.data.data.result.map((item) => {
          return {
            label: item.name, value: item.id
          }
        })
      }).catch((err) => {
        ElMessage.error({ message: err, showClose: true, });
      })
    },
    loadingProjects() {
      axios({
        url: nioCaseService + '/case/project/query-by-page',
        method: 'post',
        data: {
          pageNo: 1,
          pageSize: 1000
        },
        headers: {
          'content-type': 'application/json'
        }
      }).then(res => {
        this.projectOptions = res.data.data.result.map((item) => {
          return {
            label: item.mapVersion, value: item.id
          }
        })
      }).catch((err) => {
        ElMessage.error({ message: err, showClose: true, });
      })
    },

    // 加载表格内容
    loadingPage() {

      this.caseStatusOption = [];
      Object.entries(caseStatusMap).forEach(([key, value]) => {
        this.caseStatusOption.push({ value: key, label: value })
      });

      this.loading = true;
      axios({
        url: nioCaseService + '/case/' + this.caseId + '/log',
        method: 'get',
      }).then(res => {

        if (res.data.code === 200) {
          this.tableData = res.data.data.map(item => {
            return {
              id: item.id,
              uuid: this.uuid,
              content: item.operationContent,
              operationEventCode: item.operationEventCode,
              coordinate: this.coordinate,
              caseStatus: item.caseTask ? caseStatusMap[item.caseTask.caseStatus] : '',
              startTime: item.timestamp,
              //endTime: item.closeTime,
              project: item.caseTask ? item.caseTask.projectMapVersion : '',
              batch: this.batch,
              taskId: item.caseTask ? item.caseTask.taskId : '',
              taskStartTime: item.caseTask ? item.caseTask.beginTime : '',
              taskEndTime: item.caseTask ? item.caseTask.endTime : '',
              operator: item.caseTask ? item.caseTask.assigner : '',
            }
          });

          console.log(this.tableData);
        } else {
          this.tableData = [];
          throw res.data.msg;
        }
      }).catch((err) => {
        ElMessage.error({ message: err, showClose: true, });
      }).finally(() => {
        this.loading = false;
      })
    },

    // 设置表格的最大高度
    adaptiveTableHeight() {
      this.tableHeight = 650;
      //this.tableHeight = document.getElementById('StationTableContainer') === null ? 0 : (document.getElementsByClassName("table")[0].offsetHeight - 42);
    },
  },
  setup() {
    return {
      Search, Refresh, FolderOpened, FolderAdd, ArrowRight,
    }
  },
  mounted() {
    this.loadingBatchs();
    this.loadingProjects();
    this.loadingPage();
    this.$nextTick(() => {
      this.adaptiveTableHeight();
    });
    window.addEventListener('resize', this.adaptiveTableHeight);
  },
  unmounted() {
    window.removeEventListener('resize', this.adaptiveTableHeight)
  }
}
</script>

<style scoped>
.table {
  overflow: hidden;
}

.psTool {
  padding: 5px 0 5px 20px;
  text-align: left;
  color: black;
  font-size: 15px;
}

.psTool .el-form-item {
  margin-bottom: 10px;
  margin-right: 20px;
}
</style>
