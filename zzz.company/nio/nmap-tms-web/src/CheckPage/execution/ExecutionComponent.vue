<template>
  <div id="ExecutionComponent" class="component">
    <div style="display: inline-block">
      <!-- 面包屑：展示检查服务的执行记录 -->
      <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
        <el-breadcrumb-item>
          <div class="breadcrumbItem">检查服务</div>
        </el-breadcrumb-item>
        <el-breadcrumb-item>
          <div class="breadcrumbItem" @click="executionFun" :class="{'active-breadcrumb-item':$store.state.activeBreadcrumbIndex === 1}">执行记录</div>
        </el-breadcrumb-item>
        <el-breadcrumb-item v-if="breadcrumbExecutionShow">
          <div class="breadcrumbItem" :class="{'active-breadcrumb-item':$store.state.activeBreadcrumbIndex === 2}">执行检查</div>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <!-- 搜索工具栏组件 -->
    <ExecutionTool
      :key="ExecutionToolKey"
      v-if="!breadcrumbExecutionShow"
      :ExecutionForm="ExecutionForm"
      @executionCheck="executionCheck"
      @onSearch="onSearch"
      @reSet="reSet"
    ></ExecutionTool>
    <!-- 主表格信息组件 -->
    <ExecutionTable
      :key="ExecutionTableKey"
      v-if="!breadcrumbExecutionShow"
      :tableData="tableData"
      :total="total"
      :loading="loading"
      @handleSizeChange="handleSizeChange"
      @handleCurrentChange="handleCurrentChange"
    ></ExecutionTable>
    <!-- 执行检查组件 -->
    <ExecutionDetail
      v-if="breadcrumbExecutionShow"
      :detailForm="detailForm"
      :ExecutionId="ExecutionId"
      @loadingPage="loadingPage"
    ></ExecutionDetail>
  </div>
</template>

<script>
  // 引入需要的组件
  import ExecutionTool from "./ExecutionTool.vue";
  import ExecutionTable from "./ExecutionTable.vue";
  import ExecutionDetail from "./ExecutionDetail.vue";
  import {ArrowRight} from "@element-plus/icons-vue";
  import store from "../../store/index.js";
  import axios from "axios";
  import {ElMessage} from "element-plus";

  const nioCheckURL = window.api.nioCheckURL;

  export default {
    name: "ExecutionComponent",
    // 组件注册
    components: {
      ExecutionTool,
      ExecutionTable,
      ExecutionDetail
    },
    data() {
      return {
        loading: false,
        ExecutionToolKey: 0,
        ExecutionTableKey: 10,
        breadcrumbExecutionShow: false,
        // 搜索栏数据存储的form
        ExecutionForm: {
          valId: '', //valId
          uniqueId: '', //唯一Id
          runEngine: '', //执行引擎
          valType: '', //检查类型
          runStatus: '', //执行状态，0：创建 | 1：执行中 | 11：执行失败 | 100：执行成功
          rangeTime: [],
          bizId: '', //任务号
          bizDesc: '', //业务描述
        },
        // 表格数据
        tableData: [],
        // 表格总条数
        total: 0,
        // 表格当前页码
        currentPage: 1,
        // 每次表格展示多少条信息
        pageSize: 20,
        ExecutionId: 0,
        // 执行检查form表单
        detailForm: {
          suiteCode: '', //检查套餐号
          runEngine: '', //执行引擎
          targetProductName: '', //目标产品名称
          targetBranchName: '', //目标产品分支
          edgeProductName: '', //接边产品名称
          edgeTagName: '', //接边产品标签
          uniqueId: '', //uuid
        },
      }
    },
    setup() {
      return {
        ArrowRight,
      }
    },
    methods: {
      // 页面跳转至执行检查
      executionCheck() {
        this.detailForm = {
          suiteCode: '',
          runEngine: '',
          targetProductName: '',
          targetBranchName: '',
          edgeProductName: '',
          edgeTagName: '',
          uniqueId: '',
        };
        this.breadcrumbExecutionShow = true;
      },
      // 筛选查询功能
      onSearch() {
        this.currentPage = 1
        this.loadingPage()
      },
      // 重置功能
      reSet() {
        Object.assign(this.ExecutionForm, {
          valId: '',
          uniqueId: '',
          runEngine: '',
          valType: '',
          runStatus: '',
          rangeTime: [],
        });
      },
      // 面包屑按钮跳转到执行记录
      executionFun() {
        this.breadcrumbExecutionShow = false;
        this.loadingPage();
        store.commit('breadChange', 1);
      },
      // 获取表格信息功能
      loadingPage() {
        this.ExecutionForm.runEngine === '' && (this.ExecutionForm.runEngine = null);
        this.ExecutionForm.valType === '' && (this.ExecutionForm.valType = null);
        this.ExecutionForm.runStatus === '' && (this.ExecutionForm.runStatus = undefined);
        this.ExecutionForm.reqStartTime === '' && (this.ExecutionForm.reqStartTime = null);
        this.ExecutionForm.reqEndTime === '' && (this.ExecutionForm.reqEndTime = null);
        this.loading = true;
        axios({
          url: nioCheckURL + '/check-man/run/list',
          method: 'post',
          data: {
            ...this.ExecutionForm,
            reqStartTime: this.ExecutionForm.rangeTime.length === 0 ? '' : (this.ExecutionForm.rangeTime[0] + ' 00:00:00'),
            reqEndTime: this.ExecutionForm.rangeTime.length === 0 ? '' : (this.ExecutionForm.rangeTime[1] + ' 23:59:59'),
            pageSize: this.pageSize,
            pageNo: this.currentPage,
          }
        }).then(async response => {
          if (response.data.code === 200) {
            this.total = response.data.data.total
            if (this.total === 0) {
              ElMessage.warning({
                message: '没有符合查询条件的数据',
                showClose: true,
              });
            }  
            for(let item of response.data.data.result) {
              item.valType = item.valType == 1 ? '图幅检查' : '全库检查'

              let statusRes = await axios.post(nioCheckURL + '/check-man/run/restore-from-cos-status?valId=' + `${item.valId}`)

              item.valResultRepoMode = statusRes.data.data == "" ? item.valResultRepoMode : item.valResultRepoMode + '(' + statusRes.data.data + ')' 

              if(item.runStatus == 100 && item.valResultRepoMode == 'cos(未恢复)') {
                item.isCosRestore = true
              }

              if(item.runStatus == 100) {
                item.isWatchDiff = true
              }
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
      // 表格size改变时触发函数
      handleSizeChange(page_size) {
        this.pageSize = page_size;
        this.loadingPage()
      },
      // 表格当前页码改变时触发函数
      handleCurrentChange(page) {
        this.currentPage = page;
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
  #breadcrumb {
    padding: 6px 0 2px 20px;
    font-size: 15px;
    font-weight: bold;
  }

</style>
