<template>
  <div id="MaterialComponent" class="component">
    <!-- 面包屑：展示资料平台的任务管理 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">PN/PSP管理</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <div class="breadcrumbItem" @click="handleBreadcrumb"
          :class="{ 'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 1 }">建图任务列表
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索工具栏组件 -->
    <MaterialTool :key="MaterialToolKey" v-if="!breadcrumbResourceShow" :materialForm="materialForm"
      :taskStatusOptions="taskStatusOptions" :parkingLoading="parkingLoading" :parkingOptions="parkingOptions"
      :businessTypeOptions="businessTypeOptions" @chageSearchBusinessType="chageSearchBusinessType"
      @remoteQuery="remoteQuery" @onSearch="onSearch" @reSet="reSet" @exportDetail='exportDetail'></MaterialTool>
    <!-- 主表格信息组件 -->
    <MaterialTable :key="MaterialTableKey" v-if="!breadcrumbResourceShow" :tableData="tableData" :total="total"
      :currentCopyPage="currentPage" :pageCopySize="pageSize" :selectionRows="selectionRows" @retry="retry"
      @handleSizeChange="handleSizeChange" @handleCurrentChange="handleCurrentChange"></MaterialTable>
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
import { ElMessage } from "element-plus";
import { ArrowRight } from "@element-plus/icons-vue";

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
      breadcrumbResourceShow: false,
      selectionRows: {
        list: [],
      },
      parkingOptions: [],
      taskStatusOptions: [
        {
          "desc": "创建中",
          "name": "CREATED"
        }, {
          "desc": "执行中",
          "name": "RUNNING"
        }, {
          "desc": "执行成功",
          "name": "SUCCESS"
        }, {
          "desc": "执行失败",
          "name": "FAILED"
        }
      ],
      businessTypeOptions: [
        {
          "desc": "停车场",
          "name": "PN"
        }, {
          "desc": "换电站",
          "name": "PSP"
        }, {
          "desc": "匝道",
          "name": "RAMP"
        }, {
          "desc": "快修",
          "name": "KX"
        }
      ],
      parkingLoading: false,
      materialForm: {
        businessType: 'PN',
        businessId: '',
        taskName: null,
        taskId: null,
        taskStatus: null
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
      this.materialForm.businessType = selection;
      this.loadingPage();
      this.materialForm.businessType = selection;
    },
    // 筛选查询功能
    onSearch() {
      this.currentPage = 0;
      this.loadingPage();
    },
    retry(row) {
      axios({
        url: nioPowerSwapURL + '/nio/collection/material/mapping/retry?taskId=' + row.mappingTaskId,
        method: 'post'
      }).then(response => {
        if (response.data.code === 0) {
          ElMessage.success({
            message: '重新建图触发成功',
            showClose: true,
          });
          this.loadingPage();
        } else {
          ElMessage.error({
            message: response.data.msg,
            showClose: true,
          });
          this.loadingPage();
        }
      });
    },
    // 重置功能
    reSet() {
      this.materialForm.taskId = null;
      this.materialForm.businessId = null;
      this.materialForm.taskName = null;
      this.materialForm.taskStatus = null;
    },
    // 动态名称列表 - 远程查询
    remoteQuery(query) {
      if (this.materialForm.businessType == null || this.materialForm.businessType == '') {
        ElMessage.warning({
          message: '请先选择业务类型',
          showClose: true,
        });
        this.parkingOptions = [];
        return;
      }
      this.parkingLoading = true;
      axios.get(nioPowerSwapURL + `/nio/business/form?businessType=${this.materialForm.businessType}&businessName=${query ? query : 'null'}`)
        .then(res => {
          if (res.data.code === 0) {
            this.parkingOptions = res.data.data ?? [];
          } else {
            throw new Error();
          }
        }).catch(err => {
          ElMessage.error({
            message: '远程查询停车场失败',
            showClose: false,
            grouping: true,
          });
        }).finally(() => {
          this.parkingLoading = false;
        });
    },
    // 获取表格信息功能
    loadingPage() {
      if (this.materialForm.businessType == null || this.materialForm.businessType == '') {
        ElMessage.warning({
          message: '请先选择业务类型',
          showClose: true,
        });
        return;
      }
      axios({
        url: nioPowerSwapURL + '/nio/collection/material/mapping/list',
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

    exportDetail() {
      if (this.materialForm.businessType == null || this.materialForm.businessType == '') {
        ElMessage.warning({
          message: '请先选择业务类型',
          showClose: true,
        });
        return;
      }
      axios({
        url: nioPowerSwapURL + '/nio/collection/material/mapping/list',
        method: 'post',
        data: {
          ...this.materialForm,
          pageSize: this.pageSize,
          pageNum: this.currentPage - 1,
        }
      }).then((res) => {
        if (res.data.code === 0) {

          if (res.data.totalCount == 0) {

            ElMessage.error({
              message: '暂无下载内容',
              showClose: true,
              grouping: true,
            });
            return;
          }

          const data = this.jsonToCsv(res.data.data);
          this.downloadFile('下载.csv', data);
        } else {

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

    //下载文件
    downloadFile(fileName, data) {
      // 保存 string 到 文本文件
      //创建一个a链接，用于触发下载事件的载体
      let aLink = document.createElement('a');
      //将实参字符串转二进制对象，如果不是文本可以通过添加第二个参数指定编码
      let blob = new Blob([data]);
      //指定要下载的文件名(浏览器下载时，会根据文件后缀名指定解码)
      aLink.download = fileName;
      //给a链接配置href指向刚才的二进制对象
      aLink.href = URL.createObjectURL(blob);
      //触发事件
      aLink.click();
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
