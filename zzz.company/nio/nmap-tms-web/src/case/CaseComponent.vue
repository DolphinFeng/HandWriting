<!-- case--case页面 -->
<template>
  <div class="component">
    <!-- 面包屑 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">Case管理</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <div class="breadcrumbItem" @click="handleBreadcrumb"
          :class="{ 'active-breadcrumb-item': $store.state.activeBreadcrumbIndex == 1 }">
          Case页面
        </div>
      </el-breadcrumb-item>
      <el-breadcrumb-item v-if="breadcrumbResourceShow == 1">
        <div @click="changeBreadcrumb(2)" class="breadcrumbItem"
          :class="{ 'active-breadcrumb-item': $store.state.activeBreadcrumbIndex == 2 }">
          Case历史页面
        </div>
      </el-breadcrumb-item>
      <el-breadcrumb-item v-if="breadcrumbResourceShow == 2">
        <div class="breadcrumbItem" :class="{ 'active-breadcrumb-item': $store.state.activeBreadcrumbIndex == 3 }">
          采集建图
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索工具栏 -->
    <div v-if="breadcrumbResourceShow == 0" class="psTool">
      <el-form inline :model="caseSearch" label-position="right" ref="form" id="formDiv">
        <el-form-item label="issue：">
          <el-input v-model.trim="caseSearch.uuid" style="width: 160px" clearable></el-input>
        </el-form-item>
        <el-form-item label="内容：">
          <el-input v-model.trim="caseSearch.content" style="width: 160px" clearable></el-input>
        </el-form-item>
        <el-form-item label="case状态：">
          <el-select v-model="caseSearch.caseStatus" placeholder="请选择" style="width: 120px">
            <el-option v-for="item in caseStatusOption" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item prop="startTime" label="开始时间：" name="startTime">
          <el-date-picker v-model="caseSearch.startTime" type="datetime" format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss" style="width: 200px" placeholder="请选择">
          </el-date-picker>
        </el-form-item>
        <el-form-item prop="endTime" label="结束时间：" name="endTime">
          <el-date-picker v-model="caseSearch.endTime" type="datetime" format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss" style="width: 200px" placeholder="请选择">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="项目：" prop="project">
          <el-select v-model="caseSearch.project" placeholder="请选择" multiple style="width: 160px">
            <el-option v-for="item in projectOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="批次：" prop="batch">
          <el-select v-model="caseSearch.batch" style="width: 160px" placeholder="请选择" multiple>
            <el-option v-for="item in batchOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="核实任务号：">
          <el-input v-model.trim="caseSearch.checkTaskId" style="width: 160px" clearable></el-input>
        </el-form-item>
        <el-form-item label="核实任务时间：">
          <el-input v-model.trim="caseSearch.checkEndTime" style="width: 160px" clearable></el-input>
        </el-form-item>
        <el-form-item label="修改任务号：">
          <el-input v-model.trim="caseSearch.modifyTaskId" style="width: 160px" clearable></el-input>
        </el-form-item>
        <el-form-item label="修改任务时间：">
          <el-input v-model.trim="caseSearch.modifyEndTime" style="width: 160px" clearable></el-input>
        </el-form-item>
      </el-form>
      <div style="height: 36px">
        <el-button :icon="Search" type="primary" @click.stop="search">查询</el-button>
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
        <!-- <el-button type="warning" @click="uploadCase">上传</el-button> -->
        <el-button type="success" @click="createCase">新增</el-button>
        <el-button type="success" @click="modifyCase">修改</el-button>
        <!-- <el-button type="success" @click="downloadCase">下载</el-button> -->
        <el-button type="primary" @click.stop="createCheckTask">创建核实任务</el-button>
        <el-button type="primary" @click.stop="createModifyTask">创建修改任务</el-button>
        <el-button type="primary" @click.stop="closeTask">关闭</el-button>
        <el-button type="primary" @click.stop="reOpenTask">重新打开</el-button>
        <el-button type="success" @click="downloadCase">下载</el-button>
      </div>
    </div>
    <!-- 主表格 -->
    <div v-if="breadcrumbResourceShow == 0" class="table">
      <!-- 表格 -->
      <div id="StationTableContainer" class="table-container" v-loading="loading" element-loading-text="拼命加载中..."
        :element-loading-spinner="svg" element-loading-svg-view-box="-10, -10, 50, 50">
        <el-table :data="tableData" :border="true" :max-height="tableHeight" @selection-change="handleSelectionChange">
          <el-table-column fixed="left" align="center" type="selection" width="55"></el-table-column>
          <el-table-column fixed prop="id" label="id" min-width="80" align="center" show-overflow-tooltip>
            <template #default="scope">
              <el-button @click="handleDetail(scope.row)" link type="primary">{{ scope.row.id }}</el-button>
            </template>
          </el-table-column>
          <el-table-column fixed="left" align="center" prop="uuid" label="issue" key="uuid" min-width="100">
          </el-table-column>
          <el-table-column align="center" prop="content" label="内容" key="content" min-width="700">
          </el-table-column>
          <el-table-column align="center" prop="coordinate" label="坐标" key="coordinate" min-width="200">
          </el-table-column>
          <el-table-column align="center" prop="caseStatus" label="case状态" key="caseStatus" min-width="100">
          </el-table-column>
          <el-table-column align="center" prop="createTime" label="创建时间" key="createTime" min-width="120">
          </el-table-column>
          <el-table-column align="center" prop="startTime" label="开始时间" key="startTime" min-width="120">
          </el-table-column>
          <el-table-column align="center" prop="endTime" label="结束时间" key="endTime" min-width="120">
          </el-table-column>
          <el-table-column align="center" prop="project" label="项目" key="project" min-width="120">
          </el-table-column>
          <el-table-column align="center" prop="batch" label="批次" key="batch" min-width="120">
          </el-table-column>
          <el-table-column align="center" prop="checkTaskId" label="核实任务号" key="checkTaskId" min-width="120">
            <template #default="scope">
              <el-button @click="handleCheckTaskDetail(scope.row)" @contextmenu.prevent="handleCopy(scope.row)" link type="primary">{{ scope.row.checkTaskId
                }}</el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="checkStartTime" label="开始时间" key="checkStartTime" min-width="120">
          </el-table-column>
          <el-table-column align="center" prop="checkEndTime" label="结束时间" key="checkEndTime" min-width="120">
          </el-table-column>
          <el-table-column align="center" prop="checkOperator" label="作业人员" key="checkOperator" min-width="120">
          </el-table-column>
          <el-table-column align="center" prop="modifyTaskId" label="修改任务号" key="modifyTaskId" min-width="120">
          </el-table-column>
          <el-table-column align="center" prop="modifyStartTime" label="开始时间" key="modifyStartTime" min-width="120">
          </el-table-column>
          <el-table-column align="center" prop="modifyEndTime" label="结束时间" key="modifyEndTime" min-width="120">
          </el-table-column>
          <el-table-column align="center" prop="modifyOperator" label="作业人员" key="modifyOperator" min-width="120">
          </el-table-column>
        </el-table>
      </div>
      <!-- 分页 -->
      <div style="padding-top: 10px" class="tPaginationContainer">
        <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
          v-model="currentPage" :page-sizes="[20, 50, 100, 1000, 9999]" :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
      </div>
    </div>
    <CaseHistoryTable :caseId="caseId" :uuid="uuid" :content="content" :batch="batch" :coordinate="coordinate"
      v-if="breadcrumbResourceShow == 1">
    </CaseHistoryTable>
    <CollectMapTable :caseId="caseId" :uuid="uuid" :batch="batch" :project="project" :checkTaskId="checkTaskId"
      v-if="breadcrumbResourceShow == 2">
    </CollectMapTable>
    <!-- 任务对话框 -->
    <el-dialog :title="'上传'" v-model="showUploadDlg" show-close @close="closeUploadCase" width="600px">
      <el-form ref="uploadForm" :model="uploadDlgData" :rules="rulesUpload" label-position="right" label-width="160px"
        style="margin: 0 30px 0 10px">
        <el-form-item label="上传：" prop="fileName">
          <el-input v-model.trim="uploadDlgData.fileName" placeholder="" style="width: 90%" disabled></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeUploadCase">取消</el-button>
        <el-button type="primary" @click="doUploadCase">确定</el-button>
      </template>
    </el-dialog>

    <!-- {
    "businessKey":"",  uuid
    "platform":"", //SYSTEM
    "city":"", 
    "description":"",  //内容
    "coordinate":"",  //坐标
    "mapVersion":""  //版本
    "createBy":"",
    "batchId":0  //批次
    } -->

    <el-dialog :title="'创建'" v-model="showCreateDlg" show-close @close="closeCreateCase" width="600px">
      <el-form ref="createForm" :model="createDlgData" :rules="rulesCreate" label-position="right" label-width="160px"
        style="margin: 0 30px 0 10px">
        <el-form-item label="issue：" prop="businessKey">
          <el-input v-model.trim="createDlgData.businessKey" placeholder="" style="width: 90%"></el-input>
        </el-form-item>
        <el-form-item label="城市：">
          <el-select v-model="createDlgData.city" placeholder="请输入或选择" filterable clearable>
            <el-option v-for="item in cityOptions" :key="item.name" :label="item.name" :value="item.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容：" prop="description">
          <el-input v-model.trim="createDlgData.description" placeholder="" style="width: 90%"></el-input>
        </el-form-item>
        <el-form-item label="坐标：" prop="coordinate">
          <el-input v-model.trim="createDlgData.coordinate" placeholder="" style="width: 90%"></el-input>
        </el-form-item>
        <el-form-item label="版本：" prop="mapVersion">
          <el-input v-model.trim="createDlgData.mapVersion" placeholder="" style="width: 90%"></el-input>
        </el-form-item>
        <el-form-item label="批次：" prop="batchId">
          <el-select v-model="createDlgData.batchId" placeholder="请选择">
            <el-option v-for="item in batchOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeCreateCase">取消</el-button>
        <el-button type="primary" @click="doCreateCase">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog :title="'修改'" v-model="showModifyDlg" show-close @close="closeModifyCase" width="600px">
      <el-form ref="modifyForm" :model="modifyDlgData" :rules="rulesModify" label-position="right" label-width="160px"
        style="margin: 0 30px 0 10px">
        <el-form-item label="项目：" prop="project">
          <el-select v-model="modifyDlgData.project" placeholder="请选择">
            <el-option v-for="item in projectOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容：">
          <el-input v-model="modifyDlgData.content" placeholder="" style="width: 100%"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeModifyCase">取消</el-button>
        <el-button type="primary" @click="doModifyCase">确定</el-button>
      </template>
    </el-dialog>

    <!-- 关闭任务对话框 -->
    <el-dialog :title="'关闭case'" v-model="showCloseDlg" show-close @close="closeCloseCase" width="600px">
      <el-form ref="closeForm" :model="closeDlgData" label-position="right" label-width="160px" style="margin: 0 30px 0 10px">
        <el-form-item label="关闭原因：">
          <el-select v-model="closeDlgData.closeReason" placeholder="请选择或输入" filterable clearable allow-create style="width: 90%">
            <el-option v-for="item in closeReasonOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="已修复版本：">
          <el-input v-model.trim="closeDlgData.fixedVersion" placeholder="请输入版本信息" style="width: 90%"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeCloseCase">取消</el-button>
        <el-button type="primary" @click="doCloseCase">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { Search, Refresh, FolderOpened, FolderAdd, ArrowRight } from '@element-plus/icons-vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { svg } from '@/js/loading_data.js';
import CaseHistoryTable from './CaseHistoryComponent.vue';
import CollectMapTable from './CollectMapComponent.vue';
import store from '../store/index.js';
import { caseStatusMap } from './case-data.js';
import { Cities } from './case-data.js';
import { downloadFileByContent } from "@/utils";
const nioCaseService = window.api.nioCaseService;
// const nioPowerSwapURL = 'http://nmap-power-swap-station.tencent-dev.nioint.com'

export default {
  name: 'casePage',

  components: {
    CaseHistoryTable,
    CollectMapTable
  },

  data() {
    return {
      loading: false,
      caseId: '',
      project: '',
      breadcrumbResourceShow: 0,
      // 搜索内容
      caseSearch: {
        uuid: '',
        content: '',
        caseStatus: '',
        startTime: '',
        endTime: '',
        project: '',
        batch: '',
        checkTaskId: '',
        checkEndTime: '',
        modifyTaskId: '',
        modifyEndTime: ''
      },

      batchOptions: [],
      cityOptions: Cities,
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
        businessKey: "",
        platform: "SYSTEM", //SYSTEM
        city: "",
        description: "",  //内容
        coordinate: "",  //坐标
        mapVersion: "",  //版本
        createBy: "",
        batchId: '',   //批次
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
      showCloseDlg: false,
      closeDlgData: {
        closeReason: '',
        fixedVersion: ''
      },
      closeReasonOptions: [
        '新版本已修复',
        '数据正确',
        '施工',
        '车道数变化长度大于500m'
      ],
    };
  },
  methods: {
    handleBreadcrumb() {
      this.breadcrumbResourceShow = 0;
      store.commit('breadChange', 1);
    },

    // 进入任务详情
    handleDetail(row) {
      this.caseId = row.id + '';
      this.content = row.content + '';
      this.coordinate = row.coordinate + '';
      this.batch = row.batch + '';
      this.uuid = row.uuid + '';

      this.breadcrumbResourceShow = 1;
      store.commit('breadChange', 2);
    },

    handleCheckTaskDetail(row) {
      this.caseId = row.id + '';
      this.batch = row.batch + '';
      this.uuid = row.uuid + '';
      this.project = row.project + '';
      this.checkTaskId = row.checkTaskId + '';

      this.breadcrumbResourceShow = 2;
      store.commit('breadChange', 3);
    },

    handleCopy(row) {
      const input = document.createElement('input');
      input.value = row.checkTaskId; // 设置要复制的文本
      document.body.appendChild(input);
      input.select(); // 选中文本
      document.execCommand('copy'); // 执行复制操作
      document.body.removeChild(input); // 移除临时的输入框
      this.$message.success('复制成功');
    },

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
        batch: '',
        checkTaskId: '',
        checkEndTime: '',
        modifyTaskId: '',
        modifyEndTime: ''
      };
    },

    uploadCase() { this.showUploadDlg = true; },
    createCase() { this.showCreateDlg = true; },
    modifyCase() {
      if (this.multipleSelection.length == 0) {
        ElMessage.info({ message: '请选择要修改的用例', showClose: true, });
        return;
      }
      this.showModifyDlg = true;
    },
    //下载
    downloadCase() {
      axios({
        url: nioCaseService + '/case/query-by-page',
        method: 'post',
        data: {
          pageNum: 1,
          pageSize: 2000,
        },
        headers: {
          'content-type': 'application/json',
        },
      })
        .then((res) => {
          var textContent = 'id,issue,内容,坐标,case状态,创建时间,开始时间,结束时间,项目,批次,核实任务号,开始时间,结束时间,作业人员,修改任务号,开始时间,结束时间,作业人员\n';
          for(let line of res.data.data.result){
            let verifyId = line.verifyTask == null ? 'null' : line.verifyTask.taskId
            let verifyBeginTime = line.verifyTask == null ? 'null' : line.verifyTask.beginTime
            let verifyEndTime = line.verifyTask == null ? 'null' : line.verifyTask.endTime
            let verifyAssigner = line.verifyTask == null ? 'null' : line.verifyTask.assigner
            let modifyId = line.modifyTask == null ? 'null' : line.modifyTask.taskId
            let modifyBeginTime = line.modifyTask == null ? 'null' : line.modifyTask.beginTime
            let modifyEndTime = line.modifyTask == null ? 'null' : line.modifyTask.endTime
            let modifyAssigner = line.modifyTask == null ? 'null' : line.modifyTask.assigner
            let lineContent = line.id + ',' + line.businessKey + ','+ line.description + ',' + line.coordinate + ',' + line.status + ',' + line.createTime + ',' + line.startTime + ',' +
            line.closeTime + ',' + line.projectMapVersion + ',' + line.batch + ',' + verifyId + ',' + verifyBeginTime + ',' + verifyEndTime + ',' + verifyAssigner + ',' +
            modifyId + ',' + modifyBeginTime + ',' + modifyEndTime + ',' + modifyAssigner +
            '\n';
            textContent += lineContent;
          }     
          if (res.data.code === 200) {
            if (res.data.data.total == 0) {
              ElMessage.error({
                message: '暂无下载内容',
                showClose: true,
                grouping: true,
              });
              return;
            }
            if (textContent.length > 0) {
              downloadFileByContent('case信息.csv', textContent);
            } else {
              ElMessage.warning({
                message: '无下载内容',
                showClose: true,
                grouping: true,
              });
            }
          } else {
            ElMessage.warning({
              message: '请求失败',
              showClose: true,
              grouping: true,
            });
            return;
          }
        }).catch(() => {
          ElMessage.error({
            message: '下载失败',
            showClose: true,
            grouping: true,
          });
        })
    },

    closeUploadCase() { this.showUploadDlg = false; },
    closeCreateCase() { this.showCreateDlg = false; },
    closeModifyCase() { this.showModifyDlg = false; },

    //提交下发采集任务
    doUploadCase() {
      const form = this.$refs.uploadForm;
      form.validate((isValid) => {
        if (!isValid) { return; }
        this.loading = true;
        axios({
          url: nioPowerSwapURL + `/nio/collection/task/create`, method: 'post', data: this.distrData,
        }).then(res => {
          if (res.data.code === 0) {
            this.showUploadDlg = false;
            ElMessage.success({ message: "上传成功", showClose: true, });
            this.loadingPage();
          } else {
            ElMessage.error({ message: res.data.msg, showClose: true, });
          }
        }).catch((err) => {
          ElMessage.error({ message: err, showClose: true, });
        }).finally(() => {
          this.loading = false;
        })
      });
    },

    async createTask(eventType, params = {}) {
      if (this.multipleSelection.length == 0) {
        ElMessage.info({ message: '请选择要创建的用例', showClose: true });
        return;
      }

      let caseIdList = this.multipleSelection.map((sel) => {
        return sel.id;
      });

      try {
        let response = await axios.post(nioCaseService + '/case/event/execute', {
          caseIdList: caseIdList,
          eventType: eventType,
          userName: localStorage.getItem('realName'),
          params: params
        });

        if (response.data.code == 200) {
          ElMessage.success({ message: '操作成功', showClose: true });
          if (eventType === 'CLOSE') {
            this.showCloseDlg = false;
          }
          this.loadingPage();
        } else {
          throw response.data.msg;
        }
      } catch (error) {
        ElMessage.error({ message: error, showClose: true });
      }

      this.loadingPage();
    },

    async createCheckTask() {
      await this.createTask('START_VERIFY');
    },

    async createModifyTask() {
      await this.createTask('START_MODIFY');
    },

    closeTask() {
      if (this.multipleSelection.length == 0) {
        ElMessage.info({ message: '请选择要关闭的用例', showClose: true });
        return;
      }
      // 重置关闭对话框的数据
      this.closeDlgData = {
        closeReason: '',
        fixedVersion: ''
      };
      this.showCloseDlg = true;
    },

    closeCloseCase() {
      this.showCloseDlg = false;
    },

    async doCloseCase() {
      await this.createTask('CLOSE', {
        resolveMapVersion: this.closeDlgData.fixedVersion,
        closeReason: this.closeDlgData.closeReason
      });
    },

    async reOpenTask() {
      await this.createTask('REOPEN');
    },

    async doCreateCase() {
      this.loading = true;
      try {
        let res = await axios.post(nioCaseService + '/case/create', {
          businessKey: this.createDlgData.businessKey,  //uuid
          platform: 'SYSTEM',
          city: this.createDlgData.city,
          description: this.createDlgData.description,  //内容
          coordinate: this.createDlgData.coordinate,  //坐标
          mapVersion: this.createDlgData.mapVersion,  //版本
          createBy: localStorage.getItem('realName'),
          batchId: parseInt(this.createDlgData.batchId),  //批次
        });

        if (res.data.code != 200) {
          throw res.data.msg;
        }

        ElMessage.success("创建成功");
        this.showCreateDlg = false;
        this.createDlgData = {
          businessKey: "",
          platform: "SYSTEM", //SYSTEM
          city: "",
          description: "",  //内容
          coordinate: "",  //坐标
          mapVersion: "",  //版本
          createBy: "",
          batchId: '',   //批次
        };
      }
      catch (error) {
        ElMessage.error({ message: error, showClose: true, });
      }
      finally {
        this.loading = false;
      }
    },
    async doModifyCase() {
      try {
        this.loading = true;

        let caseIdList = this.multipleSelection.map((sel) => {
          return sel.id;
        })

        let res = await axios.post(nioCaseService + '/case/project/bind', {
          projectId: this.modifyDlgData.project,
          caseIdList: caseIdList,
          userName: localStorage.getItem('realName'),
        });

        if (res.data.code != 200) {
          throw res.data.msg;
        }

        this.showModifyDlg = false;
      } catch (error) {
        ElMessage.error({ message: error, showClose: true, });
      }
      finally {
        this.loading = false;
      }
      location.reload(); 
    },

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
        url: nioCaseService + '/case/query-by-page',
        method: 'post',
        data: {
          businessKey: this.caseSearch.uuid == '' ? undefined : this.caseSearch.uuid,
          status: this.caseSearch.caseStatus == '' ? undefined : this.caseSearch.caseStatus,
          description: this.caseSearch.content == '' ? undefined : this.caseSearch.content,
          fromCreateTime: this.caseSearch.startTime == '' ? undefined : this.caseSearch.startTime,
          toCreateTime: this.caseSearch.endTime == '' ? undefined : this.caseSearch.endTime,
          batchIdList: this.caseSearch.batch == '' ? undefined : this.caseSearch.batch,
          projectIdList: this.caseSearch.project == '' ? undefined : this.caseSearch.project,
          taskId: this.caseSearch.checkTaskId || this.caseSearch.modifyTaskId || undefined,
          pageNo: this.currentPage,
          pageSize: this.pageSize
        },
        headers: {
          'content-type': 'application/json'
        }
      }).then(res => {
        if (res.data.code === 200) {
          this.total = res.data.data.total;
          if (this.total == 0) {
            this.tableData = [];
            return;
          }

          this.tableData = res.data.data.result.map(item => {
            return {
              id: item.id,
              uuid: item.businessKey,
              caseStatus: caseStatusMap[item.status],
              content: item.description,
              batch: item.batch,
              project: item.projectMapVersion,
              createTime: item.createTime,
              startTime: item.startTime,
              endTime: item.closeTime,
              coordinate: item.coordinate,
              checkTaskId: item.verifyTask ? item.verifyTask.taskId : '',
              checkStartTime: item.verifyTask ? item.verifyTask.beginTime : '',
              checkEndTime: item.verifyTask ? item.verifyTask.endTime : '',
              checkOperator: item.verifyTask ? item.verifyTask.assigner : '',
              modifyTaskId: item.modifyTask ? item.modifyTask.taskId : '',
              modifyStartTime: item.modifyTask ? item.modifyTask.beginTime : '',
              modifyEndTime: item.modifyTask ? item.modifyTask.endTime : '',
              modifyOperator: item.modifyTask ? item.modifyTask.assigner : '',
            }
          });
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
      this.tableHeight = document.getElementById('StationTableContainer') === null ? 0 : (document.getElementsByClassName("table")[0].offsetHeight - 42);
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
