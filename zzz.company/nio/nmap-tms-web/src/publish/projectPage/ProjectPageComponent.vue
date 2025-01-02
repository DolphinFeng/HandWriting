<template>
  <div id="ProjectPageComponent" class="component">
    <!-- 面包屑：展示任务管理 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">发布管理</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item @click="backProjectPage" v-if="this.projectBreadcrumb === undefined">
        <div
          @click="changeBreadcrumb(1)"
          :class="{ 'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 1 }"
          class="breadcrumbItem"
        >
          发布项目管理
        </div>
      </el-breadcrumb-item>

      <el-breadcrumb-item @click="backPublishPage" v-if="this.projectBreadcrumb !== undefined">
        <div class="breadcrumbItem">发布版本管理</div>
      </el-breadcrumb-item>

      <el-breadcrumb-item v-if="breadcrumbProjectShow">
        <div
          @click="changeBreadcrumb(2)"
          :class="{ 'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 2 }"
          class="breadcrumbItem"
        >
          项目详情
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索工具栏组件 -->
    <ProjectPageTool
      v-if="!breadcrumbProjectShow"
      :projectForm="projectForm"
      :projectType="projectType"
      :projectStatus="projectStatus"
      @onSearch="onSearch"
      @resetForm="resetForm"
      @cancelBtn="cancelBtn"
    ></ProjectPageTool>
    <!-- 主表格信息组件 -->
    <ProjectPageTable
      :total="total"
      :projectTableData="projectTableData"
      @handleDetail="handleDetail"
      v-if="!breadcrumbProjectShow"
      @handleCurrentChange="handleCurrentChange"
      @handleSizeChange="handleSizeChange"
      @handleSelectionChange="handleSelectionChange"
    ></ProjectPageTable>

    <!-- 详情表单组件 -->
    <ProjectPageDetail
      :stageStartTime="stageStartTime"
      :stageEndTime="stageEndTime"
      :projectId="projectId"
      :vertexesData="vertexesData"
      :rowDetail="rowDetail"
      :drafterId="drafterId"
      :detailLoading="detailLoading"
      :detailTableData="detailTableData"
      v-if="breadcrumbProjectShow"
      @clickStage="clickStage"
      @reworkStage="reworkStage"
      @repeatEndStage="repeatEndStage"
      @refresh="refresh"
    ></ProjectPageDetail>
  </div>
</template>

<script>
// 引入需要的组件
import ProjectPageTool from './ProjectPageTool.vue';
import ProjectPageTable from './ProjectPageTable.vue';
import ProjectPageDetail from './ProjectPageDetail.vue';
// 引入js数据
// import {formData, detailForm} from "../js/function_data";
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { ArrowRight } from '@element-plus/icons-vue';
import store from '../../store/index.js';
import { useRouter } from 'vue-router';
import { projectForm, stateForm } from '../../js/project_data';

const nioProjectService = window.api.nioProjectService;
const apiNioDrafterURL = window.api.apiNioDrafterURL;
export default {
  name: 'ProjectPageComponent',
  // 组件注册
  components: {
    ProjectPageTool,
    ProjectPageTable,
    ProjectPageDetail,
  },
  data() {
    return {
      //面包屑
      breadcrumbProjectShow: false,
      projectForm: {
        ...projectForm,
      },
      projectTableData: [],
      projectId: '',
      total: 0,
      currentPage: 1,
      pageSize: 20,
      drafterId: '',
      vertexesData: {},
      detailLoading: false,
      //当前阶段
      currentState: [],
      //是否要查询历史任务
      includeHistory: false,
      //是否从版本管理的项目转跳
      projectBreadcrumb: '',
      detailTableData: [],

      //行
      rowDetail: {},
      selection: [],

      projectType: [],
      projectStatus: [],

      stageEndTime:'',
      stageStartTime:''
    };
  },
  setup() {
    const changeBreadcrumb = (index) => {
      store.commit('breadChange', index);
    };

    //跳转到项目历史页面
    const router = useRouter();
    const backPublishPage = function () {
      router.push({ path: '/PublishPage' });
    };

    return {
      ArrowRight,
      changeBreadcrumb,
      backPublishPage,
    };
  },
  methods: {
    //获取项目类型
    getProjectType() {
      axios({
        url: nioProjectService + '/config/product/query',
        method: 'get',
      })
        .then((response) => {
          if (response.data.code === 200) {
            let data = response.data.data;
            let type = [];
            Object.keys(data).forEach((key) => {
              type.push({ label: data[key], value: key });
            });

            this.projectType = type;
          }
        })
        .catch(() => {
          ElMessage.error({
            message: '项目类型查询失败',
            showClose: false,
            grouping: true,
          });
        });
    },

    getProjectStatus() {
      axios({
        url: nioProjectService + '/dict/query?code=PROJECT_STATUS',
        method: 'get',
      })
        .then((response) => {
          if (response.data.code === 200) {
            let data = response.data.data;
            let type = [];
            Object.keys(data).forEach((key) => {
              type.push({ label: data[key], value: key });
            });
            this.projectStatus = type;
          }
        })
        .catch(() => {
          ElMessage.error({
            message: '项目类型查询失败',
            showClose: false,
            grouping: true,
          });
        });
    },
    //选中的方法
    handleSelectionChange(val) {
      this.selection = val;
    },
    //刷新
    refresh() {
      this.openDetail();
    },
    //取消项目
    cancelBtn() {
      if (this.selection.length > 1 || this.selection.length == 0) {
        ElMessage.warning({
          message: '请选择一条数据',
          showClose: false,
          grouping: true,
        });
      } else {
        console.log(this.selection[0]);
        axios({
          url: nioProjectService + '/project/' + this.selection[0].id + '/cancel',
          method: 'post',
        })
          .then((response) => {
            if (response.data.code === 200) {
              ElMessage.success({
                message: '取消成功',
                showClose: false,
                grouping: true,
              });
              this.loadingProjectPage();
            }
          })
          .catch(() => {
            ElMessage.error({
              message: '取消失败',
              showClose: false,
              grouping: true,
            });
          });
      }
    },

    resetForm() {
      this.projectForm = { ...projectForm };
      this.loadingProjectPage();
    },
    //查询按钮
    onSearch() {
      this.loadingProjectPage();
    },
    // 表格size改变时触发函数
    handleSizeChange(page_size) {
      this.pageSize = page_size;
      this.loadingProjectPage();
    },

    // 表格当前页码改变时触发函数
    handleCurrentChange(page) {
      this.currentPage = page;
      this.loadingProjectPage();
    },
    // 详情按钮
    handleDetail(row) {
      this.rowDetail = row;
      this.drafterId = row.drafterId;
      this.projectId = row.id + '';
      this.openDetail();
    },
    openDetail() {
      this.breadcrumbProjectShow = true;
      axios({
        url: apiNioDrafterURL + '/drafter/dag/' + this.drafterId + '/detail',
        method: 'get',
      })
        .then((response) => {
          if (response.data.code === 200) {
            this.vertexesData = response.data.data;
            this.currentState = response.data.data.current;
            this.openDetailTable();
            this.stageTime();
          }
        })
        .catch((err) => {
          console.log(err);
          ElMessage.error({
            message: '阶段顺序请求失败',
            showClose: true,
          });
        });
    },

    //结束成功之后重新获取节点信息
    repeatEndStage() {
      this.openDetail();
      setTimeout(() => {
        this.openDetail();
      }, 5000);
    },

    //点击阶段切换详情表格
    clickStage(stageCode) {
      this.currentState = [];
      this.currentState.push(stageCode);
      this.openDetailTable();
      this.stageTime();
    },

    //阶段元信息查询
    stageTime() {
      console.log(this.rowDetail)
      axios({
        url: nioProjectService + `/config/stage/time?stageCode=${this.currentState}&projectId=${this.projectId}`,
        method: 'get',
      })
        .then((response) => {
          if(response.data.data){
            this.stageEndTime = response.data.data.stageEndTime
            this.stageStartTime =response.data.data.stageStartTime
          }

          if(response.data.code!==200){
            this.stageEndTime =''
            this.stageStartTime =''
          }
        })
        .catch((err) => {
          console.log(err);
          ElMessage.error({
            message: err,
            showClose: true,
          });
        });
    },

    //获取详情表格数据
    openDetailTable() {
      axios({
        url: nioProjectService + '/project/task/query',
        method: 'post',
        data: {
          projectId: this.projectId,
          stageCodeList: this.currentState,
          includeHistory: this.includeHistory,
        },
      })
        .then((response) => {
          if (response.data.code === 200) {
            this.detailTableData = response.data.data;
            this.detailTableData.forEach((item) => {
              if (item.status) {
                let statusResult = stateForm.find((state) => {
                  return state.value == item.status;
                });
                item.status = statusResult.label;
              }
            });
          }
        })
        .catch((err) => {
          console.log(err);
          ElMessage.error({
            message: err,
            showClose: true,
          });
        });
    },

    reworkStage() {
      axios({
        url: nioProjectService + '/project/stage/rework',
        method: 'post',
        data: {
          projectId: this.projectId,
          stageCode: this.currentState[0],
        },
      })
        .then((response) => {
          if (response.data.code === 200) {
            ElMessage.success({
              message: '重启阶段成功',
              showClose: true,
            });
            this.openDetail();
            setTimeout(()=>{
              this.openDetail();
            },5000)
          }
        })
        .catch((err) => {
          console.log(err);
          ElMessage.error({
            message: '重启阶段失败',
            showClose: true,
          });
        });
    },

    //返回项目管理
    backProjectPage() {
      this.breadcrumbProjectShow = false;
      // this.formProperty = [];
    },

    //根据项目编号获取信息
    loadingProjectPage() {
      axios({
        url: nioProjectService + '/project/query',
        method: 'post',
        data: {
          ...this.projectForm,
          pageNo: this.currentPage,
          pageSize: this.pageSize,
        },
      })
        .then((response) => {
          if (response.data.code === 200) {
            this.total = response.data.data.total;
            this.projectTableData = response.data.data.result;

            if (this.projectBreadcrumb !== undefined) {
              this.drafterId = response.data.data.result[0].drafterId;
              this.openDetail();
            }
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: false,
              grouping: true,
            });
          }
        })
        .catch(() => {
          ElMessage.error({
            message: '获取信息失败',
            showClose: false,
            grouping: true,
          });
        });
    },
  },
  mounted() {
    this.projectForm.id = this.$route['query'].projectId;
    this.projectBreadcrumb = this.$route['query'].projectId;
    this.projectId = this.$route['query'].projectId;
    if (this.projectBreadcrumb !== undefined) {
      store.commit('breadChange', 2);
    }
    this.loadingProjectPage();
    this.getProjectType();
    this.getProjectStatus();
  },
};
</script>
