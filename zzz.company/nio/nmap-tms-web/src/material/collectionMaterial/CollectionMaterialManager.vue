<template>
  <div id="MaterialComponent" class="component">
    <!-- 面包屑：展示资料平台的任务管理 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">资料平台</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <div class="breadcrumbItem" @click="handleBreadcrumb" :class="{'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 1}">采集资料管理
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索工具栏组件 -->
    <MaterialTool
        :key="MaterialToolKey"
        v-if="!breadcrumbResourceShow"
        :materialForm="materialForm"
        :materialTypeOptions="materialTypeOptions"
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
		:selectionRows="selectionRows"
        @handleDetail="handleDetail"
        @handleSizeChange="handleSizeChange"
        @handleCurrentChange="handleCurrentChange"
    ></MaterialTable>
  </div>
</template>

<script>
const nioPowerSwapURL = window.api.nioPowerSwapURL;
// 引入需要的组件
import MaterialTool from "./MaterialTool.vue";
import MaterialTable from "./MaterialTable.vue";
// 引入js数据
import store from "@/store/index.js";
import axios from "axios";
import {ElMessage} from "element-plus";

export default {
  name: "MaterialComponent",
  components: {
    MaterialTool,
    MaterialTable,
  },
  data() {
    return {
      MaterialToolKey: 0,
      MaterialTableKey: 10,
	  selectionRows: {
	    list: [],
	  },
      materialForm: {
        materialType: null,
		businessId:null,
        sessionId: null,
        collectionTaskId: null,
        geofenceName: null,
        vid: null,
      },
      materialTypeOptions: [
		  {"name":"DC","desc":"暂无法区分的PN/PSP"},
		  {"name":"PN","desc":"DC采集停车场"},
		  {"name":"PSP","desc":"DC采集换电站"},
		  {"name":"RAMP","desc":"匝道产线"},
		  {"name":"SS","desc":"众包采集服务区"},
		  {"name":"KX","desc":"快修数据"},
		  {"name":"OTHER","desc":"其他"},
	  ],
      // 表格数据
      tableData: [],
      // 表格总条数
      total: 0,
      // 表格当前页码
      currentPage: 1,
      // 每次表格展示多少条信息
      pageSize: 20,
    }
  },
  methods: {
    
    // 筛选查询功能
    onSearch() {
      this.currentPage = 0;
      this.loadingPage();
    },
    // 重置功能
    reSet() {
      this.materialForm.businessType = null;
	    this.materialForm.businessId = null;
      this.materialForm.sessionId = null;
      this.materialForm.geofenceName = null;
      this.materialForm.collectionTaskId = null;
      this.materialForm.vid = null;
    },
    // 获取表格信息功能
    loadingPage() {
      axios({
        url: nioPowerSwapURL + '/nio/collection/material/list',
        method: 'post',
        data: {
          ...this.materialForm,
          pageSize: this.pageSize,
          pageNum: this.currentPage - 1,
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
          // for (let i in this.tableData) {
          //   for (let j in this.runOptions) {
          //     if (this.tableData[i].taskStatus === this.runOptions[j].value) {
          //       this.tableData[i].taskStatusName = this.runOptions[j].label;
          //     }
          //   }
          //   for (let j in this.typeOptions) {
          //     if (this.tableData[i].taskType === this.typeOptions[j].name) {
          //       this.tableData[i].taskTypeName = this.typeOptions[j].desc;
          //     }
          //   }
          // }
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
    this.loadingPage();
  }
}
</script>

<style scoped>

</style>
