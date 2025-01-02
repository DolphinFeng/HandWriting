<template>
  <div id="RulesComponent" class="component">
    <!-- 面包屑：展示检查服务的规则管理 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">检查服务</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <div class="breadcrumbItem" @click="showDetail"
          :class="{ 'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 1 }">规则管理</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item v-if="breadcrumbRulesShow">
        <div class="breadcrumbItem" @click="showRules"
          :class="{ 'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 2 }">规则详情
        </div>
      </el-breadcrumb-item>
      <el-breadcrumb-item v-if="breadcrumbDetailShow">
        <div class="breadcrumbItem" :class="{ 'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 3 }">套餐详情
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索工具栏组件 -->
    <RulesTool v-if="breadcrumbRuManager" :RulesForm="RulesForm" @onSearch="onSearch" @reSet="reSet"></RulesTool>
    <!-- 主表格信息组件 -->
    <RulesTable v-if="breadcrumbRuManager" :loading="loading" :tableData="tableData" :total="total"
      @handleDetail="handleDetail" @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange">
    </RulesTable>
    <!-- 规则详情组件 -->
    <RulesDetail v-if="breadcrumbRulesPage" :detailForm="detailForm" :ruleId="ruleId" @handleSuiteDetail="handleSuiteDetail"></RulesDetail>

    <div v-if="breadcrumbDetailShow" style="height: 100%;">
      <!-- 套餐详情组件 -->
      <CheckDetail :detailForm="detailFormSuit" :dataChildren="dataChildren" :dataHistoryChildren="dataHistoryChildren" :rulesComponent="rulesComponent"
        :is_create="is_create" :checkId="checkId" :total="detailTotal" @handleDetail="handleSuiteDetail"
        @childrenLoading="childrenLoading" @handleSave="handleSave" @handleUpdate="handleUpdate"></CheckDetail>
    </div>
  </div>
</template>

<script>
// 引入需要的组件
import RulesTool from "./RulesTool.vue";
import RulesTable from "./RulesTable.vue";
import RulesDetail from "./RulesDetail.vue";
import CheckDetail from '../check/CheckDetail.vue'
// 引入js数据
import { detailForm } from "@/js/check_data.js";
import { ArrowRight } from "@element-plus/icons-vue";
import store from "../../store/index.js";
import { ElMessage } from "element-plus";
import axios from "axios";

const nioCheckURL = window.api.nioCheckURL;
// const nioCheckURL = 'http://10.115.25.243:8001';

export default {
  name: "RulesComponent",
  // 组件注册
  components: {
    RulesTool,
    RulesTable,
    RulesDetail,
    CheckDetail
  },
  data() {
    return {
      loading: false,
      breadcrumbRuManager:true, // 规则管理-面包屑 显示与否
      breadcrumbRulesShow: false, //规则详情-面包屑 显示与否
      breadcrumbRulesPage: false, //规则详情-页面 显示与否
      breadcrumbDetailShow: false, //套餐详情-面包屑 显示与否
      // 搜索栏数据存储的form
      RulesForm: {
        tables: [],
        impLevels: [],
        ruleCode: '',
        errDesc: '',
      },
      // 表格数据
      tableData: [],
      // 表格总条数
      total: 0,
      // 表格当前页码
      currentPage: 1,
      // 每次表格展示多少条信息
      pageSize: 20,
      ruleId: '',
      // 规则详情form
      detailForm: {
        ...detailForm
      },
      // 套餐详情form
      detailFormSuit: {
        suiteId: '',
        suiteName: '',
        ruleCode: '',
        pageNo: 1,
        pageSize: 20,
      },
      //是否是规则详情转跳的套餐详情
      rulesComponent:true,
      // 套餐详情表格数据
      dataChildren: [],
      // 套餐历史数据
      dataHistoryChildren: [],
      is_create: false,
      // 保存checkId数据
      checkId: 0,
      // 套餐详情表格数据总数
      detailTotal: 0,
    }
  },
  setup() {
    return {
      ArrowRight,
    }
  },
  methods: {
    //显隐规则详情
    showDetail() {
      this.breadcrumbRulesShow = false;
      this.breadcrumbRuManager = true ;
      this.breadcrumbDetailShow =false;
      this.breadcrumbRulesPage =false;
      store.commit('breadChange', 1);
    },
    showRules() {
      this.breadcrumbDetailShow = false;
      this.breadcrumbRuManager = false;
      this.breadcrumbRulesShow = true
      this.breadcrumbRulesPage =true;
      store.commit('breadChange', 2);
    },
    // 调用套餐详情接口
    childrenLoading() {
      axios({
        url: nioCheckURL + '/check-man/suite/listRuleDetails',
        method: 'post',
        data: {
          suiteId: this.detailFormSuit.suiteId,
          ruleCode: this.detailFormSuit.ruleCode,
          pageSize: this.detailFormSuit.pageSize,
          pageNo: this.detailFormSuit.pageNo,
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
          suiteName: this.detailFormSuit.suiteName
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


    // 获取规则详情
    handleDetail(row) {
      this.ruleId = row.ruleId;
      for (let i in this.detailForm) {
        this.detailForm[i] = '';
      }
      this.detailLoading(this.ruleId);
      this.breadcrumbRulesShow = true;
      this.breadcrumbRulesPage = true;
      this.breadcrumbRuManager=false; // 规则管理页面
      this.breadcrumbDetailShow= false; //套餐详情页面
    },

    // 获取套餐详情
    handleSuiteDetail(id, suiteName) {
      this.detailFormSuit.suiteId = id;
      this.detailFormSuit.suiteName = suiteName;
      this.dataChildren = [];
      this.childrenLoading();
      this.breadcrumbDetailShow = true;
      this.breadcrumbRulesShow = true;
      this.breadcrumbRulesPage = false;
      this.breadcrumbRuManager=false; // 规则管理页面
      this.is_create = false;
    },


    // 调用规则详情接口 和 套餐名称接口
    detailLoading(ruleId) {
      axios({
        url: nioCheckURL + '/check-man/rule/detail',
        method: 'get',
        params: {
          ruleId: ruleId,
        }
      }).then(response => {
        if (response.data.code === 200) {
          for (let i in response.data.data) {
            for (let j in this.detailForm) {
              if (i === j) {
                this.detailForm[j] = response.data.data[i];
              }
            }
          }
          // 字段的值整理成文字显示
          this.detailForm.misInfoName = this.detailForm.misInfo === 'Y' ? '是' : '否'
        } else {
          ElMessage.error({
            message: response.data.msg,
            showClose: true,
            grouping: true,
          });
        }
      }).catch(() => {
        ElMessage.error({
          message: '没有获取到详情的数据',
          showClose: true,
          grouping: true,
        });
      })

      axios({
        url: nioCheckURL + '/check-man/rule/suite',
        method: 'get',
        params: {
          ruleId: ruleId,
        }
      }).then(response => {
        if (response.data.code === 200) {
          var arr = eval( response.data.data);
          this.detailForm.suite = arr;
        } else {
          ElMessage.error({
            message: response.data.msg,
            showClose: true,
            grouping: true,
          });
        }
      }).catch(() => {
        ElMessage.error({
          message: '没有获取到套餐名称',
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
      this.RulesForm = {
        tables: [],
        impLevels: [],
        ruleCode: '',
        errDesc: '',
      };
    },
    // 获取表格信息功能
    loadingPage() {
      this.loading = true;
      axios({
        url: nioCheckURL + '/check-man/rule/list',
        method: 'post',
        data: {
          ...this.RulesForm,
          pageSize: this.pageSize,
          pageNo: this.currentPage,
        }
      }).then(response => {
        if (response.data.code === 200) {
          this.total = response.data.data.total;
          if (this.total === 0) {
            ElMessage.warning({
              message: '没有符合查询条件的数据',
              showClose: true,
              grouping: true,
            });
          }
          this.tableData = response.data.data.result;
          for (let i in this.tableData) {
            // 字段的值整理成文字显示
            this.tableData[i].runStatusName = this.tableData[i].runStatus === 'open' ? '正常' : '关闭'
            // 整理表格数据中的序号
            this.tableData[i].ruleNum = parseInt(i) + 1
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
          message: '没有获取到数据',
          showClose: true,
          grouping: true,
        });
      }).finally(() => {
        this.loading = false;
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
    // 页面加载时调用函数
    this.RulesForm.ruleCode = this.$route['query'].ruleCode;
    this.loadingPage();
  }
}
</script>
