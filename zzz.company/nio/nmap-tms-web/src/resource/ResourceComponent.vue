<template>
  <div id="ResourceComponent">
    <!-- 面包屑：展示资源列表的资源详情 -->
    <t-breadcrumb v-if="breadcrumbResourceShow" id="breadcrumb">
      <t-breadcrumbItem @click="breadcrumbResourceButton">资源列表</t-breadcrumbItem>
      <t-breadcrumbItem>资源监控</t-breadcrumbItem>
    </t-breadcrumb>
    <!-- 搜索工具栏组件 -->
    <ResourceTool
      v-if="!breadcrumbResourceShow"
      :resourceForm="resourceForm"
      @onSearch="onSearch"
      @reSet="reSet"
      @handleAdd="handleAdd"
    ></ResourceTool>
    <!-- 主表格信息组件 -->
    <ResourceTable
      v-if="!breadcrumbResourceShow"
      :tableData="tableData"
      :total="total"
      @handleUpdate="handleUpdate"
      @handleSurveillance="handleSurveillance"
      @handlePaginationChange="handlePaginationChange"
    ></ResourceTable>
    <!-- 资源详情表单组件 -->
    <ResourceForm
      v-if="!breadcrumbResourceShow"
      :form="formData"
      :header="header"
      :addUpdateVisible="addUpdateVisible"
      :is_add="is_add"
      @closeAddUpdate="closeAddUpdate"
      @addFun="addFun"
      @updateFun="updateFun"
    ></ResourceForm>
    <!-- 资源详情组件 -->
    <SurveillanceDetail
      v-if="breadcrumbResourceShow"
      :detailForm="detailForm"
      :dataId="dataId"
      :totalId="totalId"
      :dataWait="dataWait"
      :totalWait="totalWait"
      :code="code"
      @handleSurveillance="handleSurveillance"
    ></SurveillanceDetail>

  </div>
</template>

<script>
// 引入需要的组件
import ResourceTool from "./ResourceTool";
import ResourceTable from "./ResourceTable";
import ResourceForm from "./ResourceForm";
import SurveillanceDetail from "./SurveillanceDetail";
// 引入js数据
import {formData, detailForm} from "../js/resource_data";

const nioTaskURL = window.api.nioTaskURL;

export default {
  name: "ResourceComponent",
  // 组件注册
  components: {
    ResourceTool,
    ResourceTable,
    ResourceForm,
    SurveillanceDetail
  },
  data() {
    return {
      breadcrumbResourceShow: false,
      resourceForm: {
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
      header: '编辑资源',
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
  methods: {
    breadcrumbResourceButton() {
      this.breadcrumbResourceShow = false
    },
    handleAdd() {
      for (let i in this.formData) {
        this.formData[i] = ''
      }
      this.addUpdateVisible = true
      this.header = '添加资源'
      this.is_add = true
    },
    handleUpdate(row) {
      this.formData = row
      this.addUpdateVisible = true
      this.header = '编辑资源'
      this.is_add = false
    },
    closeAddUpdate() {
      this.addUpdateVisible = false
    },
    addFun() {
      if (this.formData.code !== '' && this.formData.name !== '' && this.formData.threshold !== '') {
        this.formData.threshold = parseInt(this.formData.threshold)
        this.$axios({
          url: nioTaskURL + '/resource/create',
          method: 'post',
          data: this.formData
        }).then(response => {
          if (response.data.code === 200) {
            this.$message({
              type: 'success',
              message: '添加资源成功',
              showClose: true,
            });
            this.addUpdateVisible = false
            this.loadingPage()
          }
        }).catch(() => {
          this.$message({
            type: 'error',
            message: '添加资源失败',
            showClose: true,
          });
        });
      }
    },
    updateFun() {
      if (this.formData.code !== '' && this.formData.name !== '' && this.formData.threshold !== '' && this.formData.status !== '') {
        this.formData.threshold = parseInt(this.formData.threshold)
        this.$axios({
          url: nioTaskURL + '/resource/update',
          method: 'post',
          data: this.formData
        }).then(response => {
          if (response.data.code === 200) {
            this.$message({
              type: 'success',
              message: '编辑资源成功',
              showClose: true,
            });
            this.addUpdateVisible = false
            this.loadingPage()
          }
        }).catch(() => {
          this.$message({
            type: 'error',
            message: '编辑资源失败',
            showClose: true,
          });
        });
      }
    },
    handleSurveillance(code) {
      this.code = code
      // 调资源详情页面接口
      this.monitor(this.code)
      this.breadcrumbResourceShow = true
    },
    monitor(code) {
      this.$axios({
        url: nioTaskURL + '/resource/monitor/' + code,
        method: 'get',
      }).then(response => {
        if (response.data.code === 200) {
          for (let i in this.detailForm) {
            for (let j in response.data.data) {
              if (i === j) {
                this.detailForm[i] = response.data.data[j]
              }
            }
          }
        } else {
          this.$message({
            type: 'error',
            message: response.data.msg,
            showClose: true,
          });
        }
      }).catch(() => {
        this.$message({
          type: 'error',
          message: '没有获取到资源详情数据',
          showClose: true,
        });
      })
    },
    // 筛选查询功能
    onSearch() {
      this.currentPage = 1
      this.loadingPage()
    },
    // 重置功能
    reSet() {
      this.resourceForm.code = ''
      this.resourceForm.name = ''
    },
    // 获取表格信息功能
    loadingPage() {
      this.$axios({
        url: nioTaskURL + '/resource/query',
        method: 'post',
        data: {
          ...this.resourceForm,
          pageSize: this.pageSize,
          pageNo: this.currentPage,
        }
      }).then(response => {
        if (response.data.code === 200) {
          this.total = response.data.data.total
          if (this.total === 0) {
            this.$message({
              type: 'warning',
              message: '没有符合查询条件的数据',
              showClose: true,
            });
          }
          this.tableData = response.data.data.result
        } else {
          this.$message({
            type: 'error',
            message: response.data.msg,
            showClose: true,
          });
        }
      }).catch(() => {
        this.$message({
          type: 'error',
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

<style scoped>
#ResourceComponent {
  position: absolute;
  top: 68px;
  text-align: left;
  /*z-index: 10;*/
  background-color: white;
  color: black;
  width: calc(100% - 234px);
  height: calc(100% - 68px);
}

#breadcrumb {
  padding: 6px 0 2px 20px;
  font-size: 15px;
  font-weight: bold;
}

</style>
