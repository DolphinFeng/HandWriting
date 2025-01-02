<template>
  <div id="MaterialComponent" class="component">
    <!-- 面包屑：展示资料平台的任务管理 -->
    <el-breadcrumb class="breadcrumb">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">PN/PSP管理</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <div class="breadcrumbItem" @click="handleBreadcrumb"
          :class="{ 'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 1 }">采集资料管理
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索工具栏组件 -->
    <MaterialTool :key="MaterialToolKey" :materialForm="materialForm" :businessTypeOptions="businessTypeOptions"
      :parkingLoading="parkingLoading" :parkingOptions="parkingOptions" :integrityOptions="integrityOptions" :materialStatusOptions="materialStatusOptions" :sourceOptions="sourceOptions"
      @remoteQuery="remoteQuery" @chageSearchBusinessType="chageSearchBusinessType" @onSearch="onSearch" @reSet="reSet"
      @startPipline="startPipline" @exportDetail='exportDetail' @clearInput='clearInput' @clearSelect='clearSelect'></MaterialTool>
    <!-- 主表格信息组件 -->
    <MaterialTable :key="MaterialTableKey" :tableData="tableData" :total="total" :currentCopyPage="currentPage" :materialStatusOptions="materialStatusOptions" :sourceOptions="sourceOptions"
      :pageCopySize="pageSize" :selectionRows="selectionRows" @handleSizeChange="handleSizeChange"
      @handleCurrentChange="handleCurrentChange"></MaterialTable>

    <el-dialog title="云端建图" v-model="dialogVisible" show-close @close="closeCreate" width="1000px">
      <el-table :data="selectionRows.list">
        <el-table-column prop="businessType" label="业务类型" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.businessType == 'PN'">停车场</el-tag>
            <el-tag v-else-if="row.businessType == 'PSP'">换电站</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="businessId" label="业务编号" width="100"></el-table-column>
        <el-table-column prop="businessName" label="业务名称" width="200"></el-table-column>
        <el-table-column prop="sessionId" label="会话编号" width="100"></el-table-column>
        <el-table-column label="资料运营方式" width="150">
          <template #default="{ row }">
            {{ getSourcesType(row.collectionTaskId) }}
          </template>
        </el-table-column>
        <el-table-column prop="collectionTaskId" label="采集任务编号" width="150"></el-table-column>
        <el-table-column prop="geofenceName" label="地理围栏名称"></el-table-column>
        <el-table-column prop="vid" label="车辆编号"></el-table-column>
        <el-table-column prop="mapVsn" label="地图版本号" width="150">
          <template #default="{ row }">
            {{ getMapVsn(row.mapVsn) }}
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="closeCreate">取消</el-button>
        <el-button type="primary" @click="mapping">建图</el-button>
      </template>
    </el-dialog>
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
import { omit} from 'lodash';
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
      dialogVisible: false,
      tableHeight: 0,
      selectionRows: {
        list: [],
      },
      parkingOptions: [],
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
      integrityOptions: [
        {
          "desc": "已完成",
          "name": true
        }, {
          "desc": "未完成",
          "name": false
        }
      ],
      materialStatusOptions: [
        {
          "desc": "初始入库",
          "name": "CREATED"
        }, {
          "desc": "质检中",
          "name": "CHECKING"
        }, {
          "desc": "质检无效",
          "name": "INVALID"
        }, {
          "desc": "质检有效",
          "name": "VALID"
        }
      ],
      sourceOptions: [
        {
          "desc": "采集平台",
          "name": "COLLECTION"
        }, {
          "desc": "合规环境",
          "name": "COM_IN"
        }
      ],
      parkingLoading: false,
      materialForm: {
        businessType: 'PN',
        businessId: '',
        sessionId: null,
        collectionTaskId: null,
        geofenceName: null,
        vid: null,
        businessId2:null,
        source: null
      },
      // 表格数据
      tableData: [],
      dialogTableVisible: false,
      // 表格总条数
      total: 0,
      // 表格当前页码
      currentPage: 1,
      // 每次表格展示多少条信息
      pageSize: 20,
    }
  },
  methods: {
    //输入input时 select清空
    clearSelect() {  
      this.materialForm.businessId = ''; // 清空输入框  
    }, 
    //选择select时 input清空
    clearInput() {  
      this.materialForm.businessId2 = ''; // 清空 select 选项  
    }, 

    chageSearchBusinessType(selection) {
      this.materialForm.businessType = selection;
      this.loadingPage();
      this.materialForm.businessType = selection;
    },
    // 触发云端建图
    startPipline() {
      let list = this.selectionRows.list;
      if (list.length < 1) {
        ElMessage.warning({
          message: '请勾选采集资料进行云端建图',
          showClose: true,
        });
        return;
      }
      this.dialogVisible = true;
      this.$nextTick(() => {
      });
    },
    //从采集任务编号得到资料运营方式
    getSourcesType(collectId) {
      const prefixes = ['dc', 'zb', 'gx-pointcloud', 'gx-vector'];
      for (const prefix of prefixes) {
        if (collectId.startsWith(prefix)) {
          return prefix;
        }
      }
      return '';
    },
    getMapVsn(mapVsn) {
      return (mapVsn === '' || mapVsn === null) ? '000000' : mapVsn;
    },
    mapping() {
      // 提交代码
      let list = this.selectionRows.list;
      let idList = [];
      for (let i in list) {
        idList.push(list[i].id)
      }
      axios({
        url: nioPowerSwapURL + '/nio/collection/material/mapping',
        method: 'post',
        data: {
          'businessType': list[0].businessType,
          'businessId': list[0].businessId,
          'collectionMaterialIds': idList,
          'createBy': localStorage.getItem('realName'),
        }
      }).then(response => {
        if (response.data.code === 0) {
          ElMessage.success({
            message: '云端建图触发成功',
            showClose: true,
          });
        } else {
          ElMessage.error({
            message: response.data.msg,
            showClose: true,
          });
        }
      });
    },
    closeCreate() {
      this.dialogVisible = false;
      this.$nextTick(() => {
      });
    },
    // 筛选查询功能
    onSearch() {
      this.currentPage = 0;
      this.loadingPage();
    },
    // 重置功能
    reSet() {
      this.materialForm.sessionId = null;
      this.materialForm.businessId = null;
      this.materialForm.geofenceName = null;
      this.materialForm.collectionTaskId = null;
      this.materialForm.vid = null;
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
          console.log(res.data.data)
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
      let idValue='';
      if(this.materialForm.businessId2){
        idValue = this.materialForm.businessId2;
      }else if (this.materialForm.businessId){
        idValue= this.materialForm.businessId
      }
      axios({
        url: nioPowerSwapURL + '/nio/collection/material/list',
        method: 'post',
        data: {
          ...omit(this.materialForm, ['businessId2','businessId']),
          businessId:idValue,
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
    exportDetail(){    
      if (this.materialForm.businessType == null || this.materialForm.businessType == '') {
        ElMessage.warning({
          message: '请先选择业务类型',
          showClose: true,
        });
        return;
      }  
      let idValue='';
      if(this.materialForm.businessId2){
        idValue = this.materialForm.businessId2;
      }else if (this.materialForm.businessId){
        idValue= this.materialForm.businessId
      }
      axios({
        url: nioPowerSwapURL + '/nio/collection/material/list',
        method: 'post',
        data: {
          ...omit(this.materialForm, ['businessId2','businessId']),
          businessId:idValue,
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
          
            const data= this.jsonToCsv(res.data.data);
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
        .finally(() => {
          this.loading = false;
        });
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
