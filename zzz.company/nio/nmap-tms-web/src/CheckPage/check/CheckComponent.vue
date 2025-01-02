<template>
  <div id="CheckComponent" class="component">
    <!-- 面包屑：展示检查服务的套餐管理 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">检查服务</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <div class="breadcrumbItem" @click="suiteFun" :class="{'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 1}">套餐管理</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item v-if="breadcrumbCheckShow">
        <div class="breadcrumbItem" :class="{'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 2}">套餐详情</div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索工具栏组件 -->
    <CheckTool
      :key="CheckToolKey" 
      v-if="!breadcrumbCheckShow"
      :CheckForm="CheckForm"
      @handleAdd="handleAdd"
      @onSearch="onSearch"
      @reSet="reSet"
    ></CheckTool>
    <!-- 主表格信息组件 -->
    <CheckTable
      :key="CheckTableKey"
      v-if="!breadcrumbCheckShow"
      :tableData="tableData"
      :createFormVisible="createFormVisible"
      :total="total"
      :loading="loading" 
      @handleDetail="handleDetail"
      @loadingPage="loadingPage"
      @handleSizeChange="handleSizeChange"
      @handleCurrentChange="handleCurrentChange"
    ></CheckTable>
    <!-- 套餐详情组件 -->
    <CheckDetail
      v-if="breadcrumbCheckShow"
      :detailForm="detailForm"
      :dataChildren="dataChildren"
      :dataHistoryChildren="dataHistoryChildren"
      :is_create="is_create"
      :checkId="checkId"
      :total="detailTotal"
      :rulesComponent="rulesComponent"
      @handleDetail="handleDetail"
      @childrenLoading="childrenLoading"
      @handleSave="handleSave"
      @handleUpdate="handleUpdate"
    ></CheckDetail>
    <!-- 新建套餐组件 -->
    <CheckAddForm
        :createForm="createForm"
        :createFormVisible="createFormVisible"
        @handleCreateForm="handleSave"
        @closeForm="closeAddForm"
    ></CheckAddForm>
  </div>
</template>

<script>
  // 引入需要的组件
  import CheckTool from "./CheckTool.vue";
  import CheckTable from "./CheckTable.vue";
  import CheckDetail from "./CheckDetail.vue";
  import {ArrowRight} from "@element-plus/icons-vue";
  import store from "../../store/index.js";
  import axios from "axios";
  import {ElMessage} from "element-plus";
  import CheckAddForm from "./CheckAddForm.vue";

  const nioCheckURL = window.api.nioCheckURL;
  // const nioCheckURL = 'http://10.115.25.243:8001';

  export default {
    name: "CheckComponent",
    // 组件注册
    components: {
      CheckAddForm,
      CheckTool,
      CheckTable,
      CheckDetail
    },
    data() {
      return {
        loading: false,
        CheckToolKey: 0,
        CheckTableKey: 10,
        breadcrumbCheckShow: false,
        // 搜索栏数据存储的form
        CheckForm: {
          suiteCode: '',
          suiteName: '',
          suiteDesc: '',
        },
        createFormVisible: false,
        // 表格数据
        tableData: [],
        // 表格总条数
        total: 0,
        // 表格当前页码
        currentPage: 1,
        // 每次表格展示多少条信息
        pageSize: 20,
        // 保存checkId数据
        checkId: 0,
        // 套餐详情表格数据
        dataChildren: [],
        // 套餐详情表格数据总数
        detailTotal: 0,
        // 套餐历史数据
        dataHistoryChildren: [],
        // 套餐详情form
        detailForm: {
          suiteId: '',
          suiteName: '',
          ruleCode: '',
          pageNo: 1,
          pageSize: 20,
        },
        createForm: {
          suiteCode: '',
          suiteName: '',
          suiteDesc: '',
          opUserName: localStorage.getItem('realName'),
          opMsg: '',
        },
        // 是否创建功能
        is_create: false,
        // 是否是规则详情转跳的套餐详情
        rulesComponent:false, 
      }
    },
    setup() {
      return {
        ArrowRight,
      }
    },
    methods: {
      // 创建套餐
      handleAdd() {
        this.createFormVisible = true;
      },
      //关闭新建套餐
      closeAddForm() {
        this.createForm.suiteName = '';
        this.createForm.suiteCode = '';
        this.createForm.suiteDesc = '';
        this.createForm.opMsg = '';
        this.createFormVisible = false;
      },
      // 保存
      handleSave() {
        if (this.createForm.suiteCode !== '' && this.createForm.suiteName !== '' && this.createForm.suiteDesc !== '' && this.createForm.opMsg !== '') {
          axios({
            url: nioCheckURL + '/check-man/suite/create',
            method: 'post',
            data: this.createForm
          }).then(response => {
            if (response.data.code === 200) {
              this.checkId = response.data.data;
              this.is_create = false;
              ElMessage.success({
                message: '创建成功',
                showClose: true,
                grouping: true,
              });
              this.currentPage = 1;
              this.loadingPage();
            } else {
              ElMessage.error({
                message: response.data.msg,
                showClose: true,
                grouping: true,
              });
            }
          }).catch(() => {
            ElMessage.error({
              message: '创建失败',
              showClose: true,
              grouping: true,
            });
          }).finally(() => {
            this.closeAddForm();
          });
        } else {
          ElMessage.warning({
            message: '套餐数据不全',
            showClose: true,
            grouping: true,
          });
        }
      },
      // 更新修改
      handleUpdate() {
        axios({
          url: nioCheckURL + '/check-man/suite/update',
          method: 'post',
          data: {
            id: this.checkId,
            suiteName: this.detailForm.suiteName
          }
        }).then(response => {
          if (response.data.code === 200) {
            ElMessage.success({
              message: '修改成功',
              showClose: true,
              grouping: true,
            });
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: true,
              grouping: true,
            });
          }
        }).catch(() => {
          ElMessage.error({
            message: '修改失败',
            showClose: true,
            grouping: true,
          });
        })
      },
      // 获取套餐详情
      handleDetail(id, suiteName) {
        this.detailForm.suiteId = id;
        this.detailForm.suiteName = suiteName;
        this.dataChildren = [];
        this.childrenLoading();
        this.breadcrumbCheckShow = true;
        this.is_create = false;
      },
      // 调用套餐详情接口
      childrenLoading() {
        axios({
          url: nioCheckURL + '/check-man/suite/listRuleDetails',
          method: 'post',
          data: {
            suiteId: this.detailForm.suiteId,
            ruleCode: this.detailForm.ruleCode,
            pageSize: this.detailForm.pageSize,
            pageNo: this.detailForm.pageNo,
          }
        }).then(response => {
          if (response.data.code === 200) {
            this.detailTotal = response.data.data.total;
            this.dataChildren = response.data.data.result;
            for (let i in this.dataChildren) {
              // 整理表格数据中的序号
              this.dataChildren[i].childNum = parseInt(i) + 1;
            }
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: true,
              grouping: true,
            });
          }
        }).catch(() => {
          ElMessage.error({
            message: '没有获取到子任务列表中的数据',
            showClose: true,
            grouping: true,
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
        this.CheckForm = {
          suiteCode: '',
          suiteName: ''
        }
      },
      // 点击套餐管理面包屑，跳转到主页面
      suiteFun() {
        this.breadcrumbCheckShow = false;
        this.loadingPage();
        store.commit('breadChange', 1);
      },
      // 获取表格信息功能
      loadingPage() {
        this.loading = true;
        axios({
          url: nioCheckURL + '/check-man/suite/list',
          method: 'post',
          data: {
            ...this.CheckForm,
            pageSize: this.pageSize,
            pageNo: this.currentPage,
          }
        }).then(response => {
          if (response.data.code === 200) {
            this.total = response.data.data.total
            this.tableData = response.data.data.result
            for (let i in this.tableData) {
              // 整理表格数据中的序号
              this.tableData[i].suiteNum = parseInt(i) + 1
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
