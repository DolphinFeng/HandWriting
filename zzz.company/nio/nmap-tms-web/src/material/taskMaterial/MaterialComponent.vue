<template>
  <div id="MaterialComponent" class="component">
    <!-- 面包屑：展示资料平台的任务管理 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">资料平台</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <div class="breadcrumbItem" @click="handleBreadcrumb" :class="{'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 1}">任务管理
        </div>
      </el-breadcrumb-item>
      <el-breadcrumb-item v-if="breadcrumbResourceShow">
        <div class="breadcrumbItem" :class="{'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 2}">任务详情</div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索工具栏组件 -->
    <MaterialTool
        :key="MaterialToolKey"
        v-if="!breadcrumbResourceShow"
        :materialForm="materialForm"
        :typeOptions="typeOptions"
        @handleAdd="handleAdd"
        @onSearch="onSearch"
        @reSet="reSet"
    ></MaterialTool>
    <!-- 主表格信息组件 -->
    <MaterialTable
        :key="MaterialTableKey"
        v-if="!breadcrumbResourceShow"
        :tableData="tableData"
        :total="total"
        :currentCopyPage="currentPage"
        :pageCopySize="pageSize"
        @handleDetail="handleDetail"
        @handleSizeChange="handleSizeChange"
        @handleCurrentChange="handleCurrentChange"
    ></MaterialTable>
    <!--任务详情-->
    <MaterialDetail
        v-if="breadcrumbResourceShow"
        :fatherForm="fatherForm"
        :dataChildren="dataChildren"
        @childrenLoading="childrenLoading"
    ></MaterialDetail>
    <!-- 添加修改form -->
    <MaterialForm
        :form="formData"
        :addVisible="addVisible"
        :typeOptions="typeOptions"
        :stringList="stringList"
        :stringListShow="stringListShow"
        @dynamicForm="dynamicForm"
        @closeAddUpdate="closeAddUpdate"
        @addFun="addFun"
    ></MaterialForm>
  </div>
</template>

<script>
const nioSourceURL = window.api.nioSourceURL;
// 引入需要的组件
import MaterialTool from "./MaterialTool.vue";
import MaterialTable from "./MaterialTable.vue";
import MaterialForm from "./MaterialForm.vue";
import MaterialDetail from "./MaterialDetail.vue";
// 引入js数据
import {fatherForm, runOptions} from "@/js/material_data";
import {ArrowRight} from "@element-plus/icons-vue";
import store from "@/store/index.js";
import axios from "axios";
import {ElMessage} from "element-plus";

export default {
  name: "MaterialComponent",
  components: {
    MaterialTool,
    MaterialTable,
    MaterialForm,
    MaterialDetail
  },
  data() {
    return {
      MaterialToolKey: 0,
      MaterialTableKey: 10,
      breadcrumbResourceShow: false,
      materialForm: {
        taskType: null,
        taskStatus: null,
        taskValue: null,
        createTimeBegin: null,
        createTimeEnd: null,
      },
      typeOptions: [],
      // 表格数据
      tableData: [],
      // 表格总条数
      total: 0,
      // 表格当前页码
      currentPage: 1,
      // 每次表格展示多少条信息
      pageSize: 20,
      taskId: '',
      dataChildren: [],
      // 父任务信息
      fatherForm: {
        ...fatherForm
      },
      // 运行状态
      runOptions: runOptions,
      addVisible: false,
      formData: {
        taskType: "",
        taskParams: {}
      },
      stringList: [],
      stringListShow: false,
      cList: []
    }
  },
  setup() {
    return {
      ArrowRight,
    }
  },
  methods: {
    //显隐任务详情面包屑
    handleBreadcrumb() {
      this.breadcrumbResourceShow = false;
      store.commit('breadChange', 2);
    },
    // 动态form表单数据获取
    dynamicForm(value) {
      // 动态列表数据初始化
      this.stringList = [];
      this.stringListShow = false;
      const initFormValue = (type) => {
        switch (type) {
          case 'STRING':
          case 'TEXTAREA':
            return '';
          case 'NUMBER':
            return 0;
          case 'BOOLEAN':
            return false;
        }
      };
      // 有数据时触发
      if (value !== '' && value !== undefined) {
        // 数据整理分配
        for (let i in this.typeOptions) {
          if (this.typeOptions[i].name === value) {
            for (let j in this.typeOptions[i]['taskParamList']) {
              this.stringList.push({
                ...this.typeOptions[i]['taskParamList'][j],
                formValue: initFormValue(this.typeOptions[i].taskParamList[j].type),
              });
            }
          }
        }
        // 显示设置
        if (this.stringList.length !== 0) {
          this.stringListShow = true;
        }
      }
    },
    // 新建任务按钮
    handleAdd() {
      this.stringList = [];
      this.stringListShow = false;
      this.formData = {
        taskType: "",
        taskParams: {}
      };
      this.addVisible = true;
    },
    // 关闭对话框
    closeAddUpdate() {
      this.addVisible = false;
    },
    // 新建任务功能
    addFun() {
      let valid = {};
      for (let i in this.stringList) {
        this.formData.taskParams[this.stringList[i].name] = this.stringList[i].formValue;
        valid[this.stringList[i].name] = this.stringList[i].required;
      }
      this.cList = [];
      for (let j in this.formData.taskParams) {
        if (valid[j] === true && (this.formData.taskParams[j].length === 0 || this.formData.taskParams[j] === '')) {
          this.cList.push(j);
          break;
        }
      }
      if (this.cList.length === 0) {
        axios({
          url: nioSourceURL + '/nio/material/task/create',
          method: 'post',
          data: this.formData
        }).then(response => {
          if (response.data.code === 0) {
            this.addVisible = false;
            this.stringList = [];
            this.stringListShow = false;
            ElMessage.success({
              message: '任务创建成功',
              showClose: true,
            });
            // 初始化页面，清空缓存选项
            this.materialForm = {
              taskType: null,
              taskStatus: null,
              taskValue: null,
              createTimeBegin: null,
              createTimeEnd: null,
            };
            this.currentPage = 1;
            this.pageSize = 20;
            this.loadingPage();
            // key值变化，tool和table组件刷新
            this.MaterialToolKey += 1;
            this.MaterialTableKey += 1;
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: true,
            });
          }
        }).catch(() => {
          ElMessage.error({
            message: '创建失败',
            showClose: true,
          });
        });
      } else {
        ElMessage.warning({
          message: '有必填项未填',
          showClose: true,
        });
      }
    },
    // 进入任务详情
    handleDetail(row) {
      this.taskId = row.taskId
      for (let i in this.fatherForm) {
        for (let j in row) {
          if (i === j) {
            this.fatherForm[i] = row[j];
          }
        }
      }
      this.dataChildren = [];
      this.childrenLoading(this.taskId);
      this.breadcrumbResourceShow = true;
    },
    // 获取详情数据
    childrenLoading(taskId) {
      axios({
        url: nioSourceURL + '/nio/material/task/sublist',
        method: 'post',
        data: {
          taskId: taskId,
        }
      }).then(response => {
        if (response.data.code === 0) {
          this.dataChildren = response.data.data;
          // 字段的值整理成文字显示
          for (let i in this.dataChildren) {
            for (let j in this.runOptions) {
              if (this.dataChildren[i].subtaskStatus === this.runOptions[j].value) {
                this.dataChildren[i].subtaskStatusName = this.runOptions[j].label;
              }
            }
          }
        } else {
          ElMessage.error({
            message: response.data.msg,
            showClose: true,
          });
        }
      }).catch(() => {
        ElMessage.error({
          message: '没有获取到子任务列表中的数据',
          showClose: true,
        });
      });
    },
    // 获取所需select选项的数据源
    getData() {
      axios({
        url: nioSourceURL + '/nio/material/task/createConfig',
        method: 'post',
      }).then(response => {
        if (response.data.code === 0) {
          this.typeOptions = response.data.data.dataTypeList;
        } else {
          ElMessage.error({
            message: response.data.msg,
            showClose: true,
          });
        }
      }).catch(() => {
        ElMessage.error({
          message: '获取任务类没有获取到数据类型型数据集失败',
          showClose: true,
        });
      });
    },
    // 筛选查询功能
    onSearch() {
      this.currentPage = 1;
      this.loadingPage();
    },
    // 重置功能
    reSet() {
      this.materialForm.taskType = null;
      this.materialForm.taskStatus = null;
      this.materialForm.taskValue = '';
      this.materialForm.createTimeBegin = null;
      this.materialForm.createTimeEnd = null;
    },
    // 获取表格信息功能
    loadingPage() {
      axios({
        url: nioSourceURL + '/nio/material/task/list',
        method: 'post',
        data: {
          ...this.materialForm,
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
          // 字段的值整理成文字显示
          for (let i in this.tableData) {
            for (let j in this.runOptions) {
              if (this.tableData[i].taskStatus === this.runOptions[j].value) {
                this.tableData[i].taskStatusName = this.runOptions[j].label;
              }
            }
            for (let j in this.typeOptions) {
              if (this.tableData[i].taskType === this.typeOptions[j].name) {
                this.tableData[i].taskTypeName = this.typeOptions[j].desc;
              }
            }
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
      })
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
  },
  mounted() {
    this.getData();
    this.loadingPage();
  }
}
</script>

<style scoped>

</style>
