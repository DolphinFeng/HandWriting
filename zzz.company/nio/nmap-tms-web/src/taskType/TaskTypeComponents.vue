<template>
  <div id="TaskTypeComponent" class="component">
    <!-- 面包屑：展示流程列表的环境变量列表 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">量产任务中心</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <div class="breadcrumbItem" @click="breadcrumbButton"
             :class="{'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 1}">任务类型管理
        </div>
      </el-breadcrumb-item>
      <el-breadcrumb-item v-if="envShow">
        <div class="breadcrumbItem" @click="$store.commit('breadChange', 2)"
             :class="{'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 2}">环境变量
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索工具栏组件 -->
    <TaskTypeSearch v-if="mainShow"
                    :taskTypeSearch="taskTypeSearch"
                    @createButton="createButton"
                    @onSearch="onSearch"
                    @resetForm="resetForm"></TaskTypeSearch>
    <!-- 主表格信息组件 -->
    <TaskTypeTable v-if="mainShow"
                   :tableData="tableData"
                   :total="total"
                   :loading="loading"
                   @createButton="createButton"
                   @handleUpdate="handleUpdate"
                   @handleEnv="handleEnv"
                   @handlePaginationChange="handlePaginationChange"
                   @loadingPage="loadingPage"></TaskTypeTable>
    <!-- 资源详情表单组件 -->
    <TaskTypeForm :form="formData"
                  :relateForm="relateForm"
                  :header="header"
                  :addUpdateVisible="addUpdateVisible"
                  :is_add="is_add"
                  :processList="processList"
                  @closeAddUpdate="closeAddUpdate"
                  @addFun="addFun"
                  @updateFun="updateFun"></TaskTypeForm>
    <TaskTypeEnv v-if="envShow"
                 :formData="formData"
                 :envDate="envDate"
                 @loadingEnv="loadingEnv"></TaskTypeEnv>
  </div>
</template>

<script>
// 引入需要的组件
import TaskTypeSearch from "./TaskTypeSearch.vue";
import TaskTypeTable from "./TaskTypeTable.vue";
import TaskTypeForm from "./TaskTypeForm.vue";
import TaskTypeEnv from "./TaskTypeEnv.vue";
// 引入js数据
import {taskTypeSearch, formData,} from "../js/taskType_data.js";
import {ArrowRight} from "@element-plus/icons-vue";
import {ElMessage} from "element-plus";
import axios from "axios";
import store from "../store/index.js";

const nioTaskURL = window.api.nioTaskURL;
if (nioTaskURL === null || nioTaskURL === undefined) {
  console.log("获取nioTaskURL失败" + nioTaskURL);
}

export default {
  name: "TaskTypeComponents",
  // 组件注册
  components: {
    TaskTypeSearch,
    TaskTypeTable,
    TaskTypeForm,
    TaskTypeEnv,
  },
  data() {
    return {
      loading: false,
      // 任务类型管理查询表单
      taskTypeSearch: {
        ...taskTypeSearch,
      },
      //关联表单
      relateForm: {},
      // 类型表单
      formData: {
        ...formData,
      },
      // 类型表格数据
      tableData: [],
      // 表格总条数
      total: 0,
      // 表格当前页码
      currentPage: 1,
      // 每次表格展示多少条信息
      pageSize: 20,
      addUpdateVisible: false,
      is_add: true,
      header: "添加类型",
      mainShow: true,
      envShow: false,
      envDate: [],
      processList: [],
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
      this.envShow = false;
      this.previewShow = false;
      store.commit('breadChange', 1);
    },
    // 关闭任务详情对话框
    closeDetail() {
      alert("closeDetail");
    },
    // 筛选查询功能
    onSearch() {
      this.currentPage = 1;
      this.loadingPage();
    },
    // 重置tool
    resetForm() {
      this.taskTypeSearch = {
        ...taskTypeSearch,
      };
    },
    closeAddUpdate() {
      this.addUpdateVisible = false;
    },
    // 创建任务按钮
    createButton() {
      for (let i in this.formData) {
        this.formData[i] = "";
      }
      this.addUpdateVisible = true;
      this.header = "添加类型";
      this.is_add = true;
    },
    // 关闭创建任务dialog
    closeCreate() {
      this.createVisible = false;
    },
    handleEnv(row) {
      this.envShow = true;
      this.mainShow = false;
      this.formData = row;
      this.pageName = "环境变量列表";
      this.loadingEnv();
      store.commit('breadChange', 2);
    },
    loadingEnv() {
      axios({
        url: nioTaskURL + "/env-variable/list/" + this.formData.code,
        method: "get",
      }).then((response) => {
        if (response.data.code === 200) {
          this.envDate = response.data.data;
        }
      }).catch(() => {
        ElMessage.error({
          message: '获取环境变量列表失败',
          showClose: true,
        });
      });
    },
    addFun() {
      if (
          this.formData.code !== "" &&
          this.formData.name !== "" &&
          this.formData.procDefKey !== ""
      ) {
        axios({
          url: nioTaskURL + "/task-type/create",
          method: "post",
          data: this.formData,
        }).then((response) => {
          if (response.data.code === 200) {
            ElMessage.success({
              message: '添加类型成功',
              showClose: false,
              grouping: true,
            });
            this.addUpdateVisible = false;
            this.loadingPage();
          } else {
            throw new Error(response.data.msg);
          }
        }).catch(() => {
          ElMessage.error({
            message: '添加类型失败',
            showClose: true,
            grouping: true,
          });
        });
      } else {
        ElMessage.warning({
          message: '有必填字段未填写',
          showClose: false,
          grouping: true,
        });
      }
    },
    updateFun() {
      if (
          this.formData.code !== "" &&
          this.formData.name !== "" &&
          this.formData.procDefKey !== "" &&
          this.formData.deleted !== ""
      ) {
        axios({
          url: nioTaskURL + "/task-type/update",
          method: "post",
          data: this.formData,
        }).then((response) => {
          if (response.data.code === 200) {
            ElMessage.success({
              message: '编辑类型成功',
              showClose: true,
            });
            this.addUpdateVisible = false;
            this.loadingPage();
          }
        }).catch(() => {
          ElMessage.error({
            message: '编辑类型失败',
            showClose: true,
          });
        });
      } else {
        ElMessage.warning({
          message: '有必填字段未填写',
          showClose: false,
          grouping: true,
        });
      }
    },
    // 编辑任务按钮
    handleUpdate(row) {
      for (let i in this.formData) {
        for (let j in row) {
          if (i === j) {
            this.formData[i] = row[j];
          }
        }
      }
      this.addUpdateVisible = true;
      this.header = "编辑类型";
      this.is_add = false;
    },
    handlePaginationChange(currentPage, pageSize) {
      this.currentPage = currentPage;
      this.pageSize = pageSize;
      this.loadingPage()
    },
    // 获取表格信息功能
    loadingPage() {
      this.loading = true;
      axios({
        url: nioTaskURL + "/task-type/query",
        method: "post",
        data: {
          ...this.taskTypeSearch,
          pageNo: this.currentPage,
          pageSize: this.pageSize,
        },
      }).then((response) => {
        if (response.data.code === 200) {
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
      }).catch(() => {
        ElMessage.error({
          message: '没有获取到数据',
          showClose: true,
        });
      }).finally(() => {
        this.loading = false;
      });
    },
    loadingProcess() {
      axios({
        url: nioTaskURL + "/process/query",
        method: "get",
        params: {
          pageNo: 1,
          pageSize: 10000,
        },
      }).then((response) => {
        if (response.data.code === 200) {
          this.processList = response.data.data.result;
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
      });
    },
    loadingRelateForm() {
      axios.get(nioTaskURL + '/form/list').then(res => {
        if (res.data.code === 200) {
          this.relateForm = res.data.data;
        } else {
          throw new Error(res.data.msg);
        }
      }).catch(err => {
        ElMessage.error({
          message: '关联表单列表获取失败：' + err.message,
          showClose: false,
          grouping: true
        });
      });
    }
  },
  mounted() {
    // 页面加载时调用函数
    this.loadingPage();
    this.loadingProcess();
    this.loadingRelateForm();
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
