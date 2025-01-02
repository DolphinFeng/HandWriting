<template>
  <div id="FunctionComponent" class="component">
    <!-- 面包屑：展示任务管理 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">工作流引擎</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <div class="breadcrumbItem active-breadcrumb-item">接口管理</div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索工具栏组件 -->
    <FunctionTool
      :functionForm="functionForm"
      @onSearch="onSearch"
      @reSet="reSet"
      @handleAdd="handleAdd"
    ></FunctionTool>
    <!-- 主表格信息组件 -->
    <FunctionTable
      :tableData="tableData"
      :total="total"
      @handleUpdate="handleUpdate"
      @handlePaginationChange="handlePaginationChange"
    ></FunctionTable>
    <!-- 资源详情表单组件 -->
    <FunctionForm
      :form="formData"
      :header="header"
      :addUpdateVisible="addUpdateVisible"
      :is_add="is_add"
      @closeAddUpdate="closeAddUpdate"
      @addFun="addFun"
      @updateFun="updateFun"
    ></FunctionForm>
  </div>
</template>

<script>
// 引入需要的组件
import FunctionTool from "./FunctionTool.vue";
import FunctionTable from "./FunctionTable.vue";
import FunctionForm from "./FunctionForm.vue";
// 引入js数据
import {formData, detailForm} from "../js/function_data";
import axios from "axios";
import {ElMessage} from "element-plus";
import {ArrowRight} from "@element-plus/icons-vue";

const nioTaskURL = window.api.nioTaskURL;

export default {
  name: "FunctionComponent",
  // 组件注册
  components: {
    FunctionTool,
    FunctionTable,
    FunctionForm
  },
  data() {
    return {
      functionForm: {
        code: '',
        name: '',
      },
      // 表格数据
      tableData: [],
      // 表格总条数
      total: 0,
      // 表格当前页码
      currentPage: 1,
      // 每次表格展示多少条信息
      pageSize: 20,
      formData: {
        ...formData
      },
      header: '编辑接口',
      addUpdateVisible: false,
      is_add: false,
      detailForm: {
        ...detailForm
      },
      dataId: [],
      totalId: 0,
      dataWait: [],
      totalWait: 0,
      code: ''
    }
  },
  setup() {
    return {
      ArrowRight,
    }
  },
  methods: {
    handleAdd() {
      for (let i in this.formData) {
        this.formData[i] = '';
      }
      this.formData.method = 'POST';
      this.formData.contentType = 'JSON';
      this.addUpdateVisible = true;
      this.header = '添加接口';
      this.is_add = true;
    },
    handleUpdate(row) {
      for (let i in this.formData) {
        for (let j in row) {
          if (i === j) {
            this.formData[i] = row[j]
          }
        }
      }
      this.addUpdateVisible = true
      this.header = '编辑接口'
      this.is_add = false
    },
    closeAddUpdate() {
      this.addUpdateVisible = false
    },
    addFun() {
      if (this.formData.code !== '' && this.formData.name !== '' && this.formData.url !== '' && this.formData.method !== '' && this.formData.body !== '' && this.formData.timeout !== '') {
        this.formData.timeout = parseInt(this.formData.timeout)
        axios({
          url: nioTaskURL + '/function/create',
          method: 'post',
          data: this.formData
        }).then(response => {
          if (response.data.code === 200) {
            ElMessage.success({
              message: "添加接口成功",
              showClose: true,
            });
            this.addUpdateVisible = false
            this.loadingPage()
          }
        }).catch(() => {
          ElMessage.error({
            message: "添加接口失败",
            showClose: true,
          });
        });
      }
    },
    updateFun() {
      if (this.formData.code !== '' && this.formData.name !== '' && this.formData.url !== '' && this.formData.method !== '' && this.formData.body !== '' && this.formData.timeout !== '') {
        this.formData.timeout = parseInt(this.formData.timeout)
        axios({
          url: nioTaskURL + '/function/update',
          method: 'post',
          data: this.formData
        }).then(response => {
          if (response.data.code === 200) {
            ElMessage.success({
              message: "编辑接口成功",
              showClose: true,
            });
            this.addUpdateVisible = false
            this.loadingPage()
          }
        }).catch(() => {
          ElMessage.error({
            message: "编辑接口失败",
            showClose: true,
          });
        });
      }
    },
    // 筛选查询功能
    onSearch() {
      this.currentPage = 1
      this.loadingPage()
    },
    // 重置功能
    reSet() {
      this.functionForm.code = ''
      this.functionForm.name = ''
    },
    // 获取表格信息功能
    loadingPage() {
      axios({
        url: nioTaskURL + '/function/query',
        method: 'post',
        data: {
          ...this.functionForm,
          pageSize: this.pageSize,
          pageNo: this.currentPage,
        }
      }).then(response => {
        if (response.data.code === 200) {
          this.total = response.data.data.total
          if (this.total === 0) {
            ElMessage.warning({
              message: "没有符合查询条件的数据",
              showClose: true,
            });
          }
          this.tableData = response.data.data.result
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
    handlePaginationChange(currentPage, pageSize) {
      this.currentPage = currentPage;
      this.pageSize = pageSize;
      this.loadingPage()
    },
  },
  mounted() {
    // 页面加载时调用函数
    this.loadingPage()
  }
}
</script>

