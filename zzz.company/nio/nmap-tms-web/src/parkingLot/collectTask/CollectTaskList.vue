<template>
  <div id="CollectTaskComponent" class="component">
    <!-- 面包屑：展示资料平台的任务管理 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">PN/PSP管理</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <div class="breadcrumbItem" @click="handleBreadcrumb"
          :class="{ 'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 1 }">采集任务管理
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索工具栏组件 -->
    <CollectTaskTool :key="CollectTaskToolKey" v-if="!breadcrumbResourceShow" :collectTaskForm="collectTaskForm"
      :collectTypeOptions="collectTypeOptions"
      :taskStatusOptions="taskStatusOptions" :parkingLoading="parkingLoading" :parkingOptions="parkingOptions"
      :businessTypeOptions="businessTypeOptions" @chageSearchBusinessType="chageSearchBusinessType" @onSearch="onSearch" 
      @reSet="reSet" @exportDetail='exportDetail'></CollectTaskTool>
    <!-- 主表格信息组件 -->
    <CollectTaskTable :key="CollectTaskTableKey" :tableData="tableData" :total="total"
      :currentCopyPage="currentPage" :pageCopySize="pageSize" :selectionRows="selectionRows"
      @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></CollectTaskTable>
  </div>
</template>
  
<script>
const nioPowerSwapURL = window.api.nioPowerSwapURL;
// 引入需要的组件
import CollectTaskTool from "./CollectTaskTool.vue";
import CollectTaskTable from "./CollectTaskTable.vue";
// 引入js数据
import axios from "axios";
import { ElMessage } from "element-plus";
import { ArrowRight } from "@element-plus/icons-vue";
import { downloadFileByContent } from '@/utils';

export default {
  name: "CollectTaskListComponent",
  components: {
    CollectTaskTool,
    CollectTaskTable
  },
  data() {
    return {
      CollectTaskToolKey: 0,
      CollectTaskTableKey: 10,
      breadcrumbResourceShow: false,
      selectionRows: {
        list: [],
      },
      parkingOptions: [],
      collectTypeOptions: [
        {
          "desc": "pn",
          "name": "pn"
        }, {
          "desc": "pnu",
          "name": "pnu"
        }, {
          "desc": "psp",
          "name": "psp"
        }, {
          "desc": "rp",
          "name": "rp"
        }, {
          "desc": "kx",
          "name": "kx"
        }, {
          "desc": "dc",
          "name": "dc"
        }
      ],
      taskStatusOptions: [
        {
          "desc": "新建",
          "name": "CREATED"
        }, {
          "desc": "进行中",
          "name": "COLLECTING"
        }, {
          "desc": "已结束",
          "name": "FINISHED"
        }
      ],
      businessTypeOptions: [
        {
          "desc": "停车场",
          "name": "PN"
        }, {
          "desc": "换电站",
          "name": "PSP"
        }
      ],
      parkingLoading: false,
      collectTaskForm: {
        businessType: 'PN',
        businessId: '',
        collectTaskType: null,
        collectTaskId: null,
        collectTaskStatus: null,
        statusList: [],
        mapVsn: null
      },
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
    chageSearchBusinessType(selection) {
      this.collectTaskForm.businessType = selection;
      this.loadingPage();
      this.collectTaskForm.businessType = selection;
    },
    // 筛选查询功能
    onSearch() {
      this.currentPage = 0;
      this.loadingPage();
    },
    // 重置功能
    reSet() {
      this.collectTaskForm.businessType = null;
      this.collectTaskForm.businessId = null;
      this.collectTaskForm.collectTaskType = null;
      this.collectTaskForm.collectTaskId = null;
      this.collectTaskForm.collectTaskStatus = null;
      this.collectTaskForm.mapVsn = null;
    },
    trimCollectTaskForm() {
      if (this.collectTaskForm.collectTaskType === '') {
        this.collectTaskForm.collectTaskType = null;
      }
      if (this.collectTaskForm.collectTaskStatus === '' || this.collectTaskForm.collectTaskStatus === null) {
        this.collectTaskForm.collectTaskStatus = null;
        this.collectTaskForm.statusList = ["CREATED", "COLLECTING", "FINISHED"];
      } else {
        this.collectTaskForm.statusList = [this.collectTaskForm.collectTaskStatus];
      }
      if (this.collectTaskForm.businessId === '') {
        this.collectTaskForm.businessId = null;
      }
      if (this.collectTaskForm.collectTaskId === '') {
        this.collectTaskForm.collectTaskId = null;
      }
    },
    // 获取表格信息功能
    loadingPage() {
      if (this.collectTaskForm.businessType == null || this.collectTaskForm.businessType == '') {
        ElMessage.warning({
          message: '请先选择业务类型',
          showClose: true,
        });
        return;
      }
      this.trimCollectTaskForm();
      
      axios({
        url: nioPowerSwapURL + '/nio/collection/task/list',
        method: 'post',
        data: {
          ...this.collectTaskForm,
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

    exportDetail(){      
      if (this.collectTaskForm.businessType == null || this.collectTaskForm.businessType == '') {
        ElMessage.warning({
          message: '请先选择业务类型',
          showClose: true,
        });
        return;
      }
      this.trimCollectTaskForm();
      axios({
        url: nioPowerSwapURL + '/nio/collection/task/list',
        method: 'post',
        data: {
          ...this.collectTaskForm,
          pageSize: this.pageSize,
          pageNum: this.currentPage,
        },
      })
        .then((res) => {
          if (res.data.code === 0) {
            if (res.data.totalCoun == 0) {
              this.tableData = [];
              ElMessage.error({
                message: '暂无下载内容',
                showClose: true,
                grouping: true,
              });
              return;
            }
          
            const data= this.jsonToCsv(res.data.data);
            downloadFileByContent('下载.csv', data); 
          } else {
            this.tableData = [];
            ElMessage.warning({
                message: '请求失败',
                showClose: true,
                grouping: true,
              });
              return;
          }
        }).catch(() => {
          ElMessage.error({
            message: '下载失败',
            showClose: true,
            grouping: true,
          });
        })
       
    },

    jsonToCsv(jsonData) {
      const csvRows = [];
      const headers = Object.keys(jsonData[0]);
      csvRows.push(headers.join(','));

      for (const row of jsonData) {
        const values = headers.map((header, index) => {
          if (typeof row[header] === 'object') {
            let rowValue = JSON.stringify(row[header]).replace(/,/g, '，');
            return `"${rowValue}"`;
          } else if (Array.isArray(row[header])) {
            // 如果该字段是数组，我们将其转换为CSV格式的字符串
            let Value = row[header].map((value) => {
              return JSON.stringify(value).replace(/,/g, '，');
            });
            return `"${Value}"`;
          } else {
            // 对于非数组字段，我们只需将值转换为字符串
            return `${('' + row[header]).replace(/,/g, '，')}`;
          }
        });
        csvRows.push(values.join(','));
      }

      return csvRows.join('\n');
    },

  },
  mounted() {
    this.loadingPage();
  }
}
</script>
  
<style scoped></style>
  