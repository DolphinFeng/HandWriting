<template>
  <div id="ResultsComponent" class="component">
    <div style="display: inline-block">
      <!-- 面包屑：展示检查服务的检查结果 -->
      <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
        <el-breadcrumb-item>
          <div class="breadcrumbItem">检查服务</div>
        </el-breadcrumb-item>
        <el-breadcrumb-item>
          <div class="breadcrumbItem active-breadcrumb-item">检查结果</div>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <!-- 搜索工具栏组件 -->
    <ResultsTool :key="ResultsToolKey" :ResultsForm="ResultsForm" @onSearch="onSearch" @reSet="reSet"
      @exportDetail="exportDetail" @exportStat="exportStat"></ResultsTool>
    <!-- 主表格信息组件 -->
    <ResultsTable :key="ResultsTableKey" :tableData="tableData" :total="total" :loading="loading"
      @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></ResultsTable>
  </div>
</template>

<script>
// 引入需要的组件
import ResultsTool from "./ResultsTool.vue";
import ResultsTable from "./ResultsTable.vue";
import { ArrowRight } from "@element-plus/icons-vue";
// 引入js数据
import { statusName } from "../../js/check_data";
import axios from "axios";
import { ElMessage } from "element-plus";

const nioCheckURL = window.api.nioCheckURL;

export default {
  name: "ResultsComponent",
  // 组件注册
  components: {
    ResultsTool,
    ResultsTable,
  },
  data() {
    return {
      loading: false,
      ResultsToolKey: 0,
      ResultsTableKey: 10,
      // 搜索栏数据存储的form
      ResultsForm: {
        valId: '', //valId
        taskId: '', //任务号
        ruleCode: '', //检查规则号
        targetTable: '',//目标要素
        impLevel: null, //重要等级
        misInfo: [] //误报标识 
      },
      // status状态数据集
      statusName: statusName,
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
  setup() {
    return {
      ArrowRight,
    }
  },
  methods: {
    //下载文件
    downloadFile(fileName, data) { // 保存 string 到 文本文件
      //创建一个a链接，用于触发下载事件的载体
      let aLink = document.createElement('a')
      //将实参字符串转二进制对象，如果不是文本可以通过添加第二个参数指定编码
      let blob = new Blob([data]);
      //指定要下载的文件名(浏览器下载时，会根据文件后缀名指定解码)
      aLink.download = fileName
      //给a链接配置href指向刚才的二进制对象
      aLink.href = URL.createObjectURL(blob)
      //触发事件
      aLink.click()
    },
    // 筛选查询功能
    onSearch() {
      this.currentPage = 1;
      this.loadingPage();
    },
    // 重置功能
    reSet() {
      Object.assign(this.ResultsForm, {
        valId: '',
        taskId: '',
        ruleCode: '',
        targetTable: '',
        impLevel: null,
        misInfo: [],
      });
    },
    // 导出结果明细
    exportDetail() {
      if (!this.ResultsForm.valId) {
        return ElMessage.error({
          message: '请输入valId',
          showClose: true,
          grouping: true,
        });
      }

      var misInfo = this.ResultsForm.misInfo.length ==0?0:this.ResultsForm.misInfo[0];
      axios({
        url: nioCheckURL + '/check-man/inquire/result',
        method: 'post',
        data: {
          valId: this.ResultsForm.valId,
          bizId: 0,
          impLevel: this.ResultsForm.impLevel,
          misInfo: misInfo,
          ruleCodes: this.ResultsForm.ruleCode,
          uniqueId: this.ResultsForm.valId,

        }
      }).then(response => {
        if (response.data.code === 200) {
          let downloadId = response.data.data.downloadId;
          console.log(downloadId)
          axios({
            url: nioCheckURL + '/check-man/inquire/download',
            method: 'post',
            data: {
              downloadId,
            }
          }).then(res => {
            this.downloadFile("结果明细.csv", res.data)
          })

        } else {
          ElMessage.error({
            message: response.data.msg,
            showClose: true,
            grouping: true,
          });
        }
      }).catch(() => {
        ElMessage.error({
          message: '下载失败',
          showClose: true,
          grouping: true,
        });
      })
    },
    //  导出结果统计
    exportStat() {/*  */
      if (!this.ResultsForm.valId) {
        return ElMessage.error({
          message: '请输入valId',
          showClose: true,
          grouping: true,
        });
      }
      this.loading = true;
      var misInfo = this.ResultsForm.misInfo.length ==0?0:this.ResultsForm.misInfo[0];
      axios({
        url: nioCheckURL + '/check-man/inquire/statistics',
        method: 'post',
        data: {
          valId: this.ResultsForm.valId,
          bizId: 0,
          impLevel: this.ResultsForm.impLevel,
          misInfo: misInfo,
          ruleCodes: this.ResultsForm.ruleCode,
          uniqueId: this.ResultsForm.valId,
        }
      }).then(response => {
        if (response.data.code === 200) {
          let downloadId = response.data.data.downloadId;
          console.log(downloadId)
          axios({
            url: nioCheckURL + '/check-man/inquire/download',
            method: 'post',
            data: {
              downloadId,
            }
          }).then(res => {
            this.downloadFile("结果统计.csv", res.data)
          })

        } else {
          ElMessage.error({
            message: response.data.msg,
            showClose: true,
            grouping: true,
          });
        }
      }).catch(() => {
        ElMessage.error({
          message: '下载失败',
          showClose: true,
          grouping: true,
        });
      }).finally(() => {
        this.loading = false;
      });
    },
    // 获取表格信息功能
    loadingPage() {
      console.log(this.ResultsForm);
      this.loading = true;
      var misInfo = this.ResultsForm.misInfo.length ==0?null:this.ResultsForm.misInfo[0];
      axios({
        url: nioCheckURL + '/check-man/result/list',
        method: 'post',
        data: {
         // ...this.ResultsForm,
          valId: this.ResultsForm.valId, //valId
          taskId: this.ResultsForm.taskId, //任务号
          ruleCode: this.ResultsForm.ruleCode, //检查规则号
          targetTable: this.ResultsForm.targetTable,//目标要素
          impLevel: this.ResultsForm.impLevel, //重要等级
          misInfo:misInfo, //误报标识 
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
            // 整理表格数据中的序号
            this.tableData[i].resultsNum = parseInt(i) + 1;
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
      this.loadingPage();
    },
  },
  mounted() {
    this.ResultsForm.valId = this.$route['query'].valId ?? '';
    this.ResultsForm.taskId = this.$route['query'].taskId ?? null;
    this.onSearch();
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
