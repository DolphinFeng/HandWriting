<!-- 停车场管理 -> 停车场详情页面 -->
<template>
  <div class="component">
    <!-- 主表格 -->
    <div class="table">
      <!-- 表格 -->
      <div id="StationTableContainer" class="table-container" v-loading="loading" element-loading-text="拼命加载中..."
        :element-loading-spinner="svg" element-loading-svg-view-box="-10, -10, 50, 50">
        <el-table :data="tableData" :border="true" :max-height="tableHeight" @selection-change="handleSelectionChange">
          <el-table-column fixed="left" align="center" type="selection" width="55"></el-table-column>
          <el-table-column fixed="left" align="center" prop="caseId" label="caseId" key="caseId"
            min-width="100"></el-table-column>
          <el-table-column align="center" prop="taskId" label="核实任务Id" key="taskId" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="requestTicketNo" label="采集工单号" key="requestTicketNo" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="uuid" label="uuid" key="uuid" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="project" label="项目名称" key="project" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="batch" label="批次" key="batch" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="taskId_recordId" label="业务id" key="taskId_recordId" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="status" label="采集批次状态" key="status" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="createTime" label="采集任务创建时间" key="createTime" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="updateTime" label="采集任务下发时间" key="updateTime" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="recordId" label="点位记录ID" key="recordId" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="status2" label="点位采集状态" key="status2" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="mappingTaskId" label="建图任务id" key="mappingTaskId" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="status3" label="建图任务状态" key="status3" min-width="150">
          </el-table-column>
          <el-table-column align="center" prop="createTime2" label="建图任务创建时间" key="createTime2" min-width="150">
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { Search, Refresh, FolderOpened, FolderAdd, ArrowRight } from '@element-plus/icons-vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { svg } from '@/js/loading_data.js';


const nioCollectionAdaptor = window.api.nioCollectionAdaptor;

export default {
  name: 'collectPage',

  props: {
    checkTaskId: String,
    caseId: String,
    project: String,
    batch: String,
    uuid: String,
  },

  data() {
    return {
      loading: false,

      collectStatus: {
        0: "初始状态",
        1: "启动中",
        2: "已启动",
        3: "已关闭",
      },

      statusOption2: {
        CREATED: "新创建",
        STARTED: "采集中",
        DELIVERY_CLOSED: "交付关闭",
        TIMEOUT_CLOSED: "超时关闭",
        ACTIVE_CLOSED: "主动关闭",
      },

      statusOption3: {
        0: '成功',
        1: '失败',
      },

      tableData: [],
      multipleSelection: [], //当前表格选中行
      tableHeight: 0,
      currentPage: 1,
      pageSize: 20,
      total: 0,
      svg: svg,
    };
  },
  methods: {
    //选择项发生变化时触发
    handleSelectionChange(selection) {
      this.multipleSelection = selection;
    },

    //更换表格单页显示条数
    handleSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.currentPage = 1;
      this.loadingPage();
    },
    //切换页码
    handleCurrentChange(page) {
      this.currentPage = page;
      this.loadingPage();
    },
    // 加载表格内容
    async loadingPage() {

      this.loading = true;
      try {
        let res = await axios.get(nioCollectionAdaptor + '/collection-adaptor/batch/list?taskId=' + this.checkTaskId);
        if (res.data.code != 200) {
          throw res.msg;
        }

        this.tableData = [];

        if (res.data.data.length != 0) {
          for (let i = 0; i < res.data.data.length; i++) {
            let tableData = res.data.data[i].recordList.map((item) => {
              return {
                taskId: res.data.data[i].taskId,
                requestTicketNo: res.data.data[i].requestTicketNo,
                status: this.collectStatus[res.data.data[i].status],
                caseId: this.caseId,
                uuid: this.uuid,
                batch: this.batch,
                project: this.project,
                taskId_recordId: res.data.data[i].taskId + '_' + item.recordId,
                createTime: res.data.data[i].createTime,
                updateTime: res.data.data[i].updateTime,
                recordId: item.recordId,
                status2: this.statusOption2[item.status],
                mappingTaskId: item.mappingRecordList.length != 0 ? item.mappingRecordList[0].mappingTaskId : '',
                status3: item.mappingRecordList.length != 0 ? this.statusOption3[item.mappingRecordList[0].status] : '',
                createTime2: item.mappingRecordList.length != 0 ? item.mappingRecordList[0].createTime : '',
              }
            })

            this.tableData = this.tableData.concat(tableData);
          }
        }

      } catch (error) {
        ElMessage.error({ message: error + '', showClose: true, });
      } finally {
        this.loading = false;
      }
    },

    // 设置表格的最大高度
    adaptiveTableHeight() {
      this.tableHeight = 650;
      //this.tableHeight = document.getElementById('StationTableContainer') === null ? 0 : (document.getElementsByClassName("table")[0].offsetHeight - 42);
    },
  },
  setup() {
    return {
      Search, Refresh, FolderOpened, FolderAdd, ArrowRight,
    }
  },
  mounted() {
    this.loadingPage();
    this.$nextTick(() => {
      this.adaptiveTableHeight();
    });
    window.addEventListener('resize', this.adaptiveTableHeight);
  },
  unmounted() {
    window.removeEventListener('resize', this.adaptiveTableHeight)
  }
}
</script>

<style scoped>
.table {
  overflow: hidden;
}

.psTool {
  padding: 5px 0 5px 20px;
  text-align: left;
  color: black;
  font-size: 15px;
}

.psTool .el-form-item {
  margin-bottom: 10px;
  margin-right: 20px;
}
</style>
