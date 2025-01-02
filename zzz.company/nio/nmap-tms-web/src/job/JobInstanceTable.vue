<template>
  <!-- 主表格信息组件 -->
  <div id="JobInstanceTable" class="table">
    <div style="margin: 0 10px 5px 0">
      <el-button :icon="Back" type="primary" @click="backTaskDetail()" v-if="this.routeTaskId !== undefined">返回任务详情</el-button>
    </div>
    <div id="JobInstanceTableContainer" class="table-container">
      <el-table :data="instanceTableData" border :max-height="tableHeight" style="width:100%">
        <el-table-column fixed prop="id" key="id" label="id" width="100" align="center"></el-table-column>
        <el-table-column fixed prop="uniqueId" key="uniqueId" label="唯一id" show-overflow-tooltip width="320" align="center"></el-table-column>
        <el-table-column prop="name" key="name" label="Job名称" show-overflow-tooltip width="320" align="center"></el-table-column>
        <el-table-column prop="priorityText" key="priorityText" label="优先级" width="100" align="center"></el-table-column>
        <el-table-column prop="currentStage" key="currentStage" label="执行阶段" width="100" align="center"></el-table-column>
        <el-table-column prop="statusText" key="statusText" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.statusText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" key="createTime" label="创建时间" width="200" align="center"></el-table-column>
        <el-table-column prop="startTime" key="startTime" label="开始时间" width="200" align="center"></el-table-column>
        <el-table-column prop="finishTime" key="finishTime" label="结束时间" width="200" align="center"></el-table-column>
        <el-table-column fixed="right" label="操作" width="330" align="center">
          <template #default="scope">
            <el-button @click="handleShowResult(scope.row)" link type="primary" size="small">执行结果
            </el-button>
            <el-button @click="handleInstanceDetail(scope.row)" link type="primary" size="small">详情
            </el-button>
            <el-button @click="handleTaskInstance(scope.row)" link type="primary" size="small">执行信息
            </el-button>
            <el-button v-if="scope.row.status !== 'QUEUING' && scope.row.currentStage === 'run'" @click="handleTaskLog(scope.row,'run')" link type="primary" size="small">日志
            </el-button>
            <el-button v-if="scope.row.status !== 'QUEUING' && scope.row.currentStage !== 'run'" @click="handleTaskLog(scope.row,'dispatch')" link type="primary" size="small">dispatch日志
            </el-button>
            <el-button v-if="scope.row.status !== 'QUEUING' && scope.row.currentStage !== 'run'" @click="handleTaskLog(scope.row,'fork')" link type="primary" size="small">fork日志
            </el-button>
            <el-button v-if="scope.row.status !== 'QUEUING' && scope.row.currentStage !== 'run'" @click="handleTaskLog(scope.row,'join')" link type="primary" size="small">join日志
            </el-button>
            <el-button @click="handleCopyToCreate(scope.row)" link type="primary" size="small">复制
            </el-button>
            <el-button v-if="scope.row.status === 'QUEUING' || scope.row.status === 'RUNNING'" @click="jobCancel(scope.row)"
              link type="danger" size="small">取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 分页组件 -->
    <div style="padding-top: 10px" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page.sync="currentPage" :page-sizes="[5, 10, 20, 50, 200]" :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper" :total="instanceTotal">
      </el-pagination>
    </div>
    <el-dialog title="取消作业" v-model="cancelVisible" show-close @close="() => { this.cancelVisible = false }" width="500px">
      <div style="word-break: break-all;margin-bottom: 15px">
        <span>确认取消作业 <b>{{ jobName }}</b> 吗？</span>
      </div>
      <template #footer class="dialog-footer">
        <el-button @click="cancelVisible = false">取 消</el-button>
        <el-button @click="handleInstanceCancel" type="primary">确 定</el-button>
      </template>
    </el-dialog>
    <JsonView title="执行结果" v-model:visible="resultVisible" :data="curResult"> </JsonView>
  </div>
</template>

<script>
import JsonView from "@/jsonView/JsonView.vue";

export default {
  name: "JobInstanceTable",
  // 接收父组件传来的参数
  props: {
    instanceTableData: Array,
    instanceTotal: Number,
    routeTaskId: String
  },
  components: {
    JsonView
  },
  data() {
    return {
      // 表格的最大高度
      tableHeight: 0,
      // 每次表格展示多少条信息
      pageSize: 20,
      // 表格当前页码
      currentPage: 1,
      cancelVisible: false,
      jobName: '',
      jobInstanceId: '',
      resultVisible: false,
      curResult: null
    }
  },
  methods: {
    getStatusType(status) {
      switch (status) {
        case 'COMPLETED':
          return 'success';
        case 'FAILED':
          return 'danger';
        case 'CANCELED':
          return 'warning';
        case 'QUEUING':
          return 'info';
        default:
          return '';
      }
    },
    jobCancel(row) {
      this.jobInstanceId = row.id;
      this.jobName = row.name;
      this.cancelVisible = true;
    },
    // 表格当前页码改变时触发函数
    handleCurrentChange(page) {
      this.currentPage = page;
      this.$emit('handleInstancePaginationChange', page, this.pageSize)
    },
    // 表格size改变时触发函数
    handleSizeChange(page_size) {
      this.pageSize = page_size;
      this.$emit('handleInstancePaginationChange', this.currentPage, page_size)
    },
    handleShowResult(row) {
      this.curResult = row.result;
      this.resultVisible = true;
    },
    handleInstanceDetail(row) {
      this.$emit('handleInstanceDetail', row)
    },
    handleTaskInstance(row) {
      this.$emit('handleTaskInstance', row.id)
    },
    handleTaskLog(row, stage) {
      this.$emit('handleTaskLog', row, stage)
    },
    handleCopyToCreate(row) {
      this.$emit('handleCopyToCreate', row)
    },
    handleInstanceCancel() {
      this.cancelVisible = false
      this.$emit('handleInstanceCancel', this.jobInstanceId)
    },
    // 设置表格的最大高度
    adaptiveTableHeight() {
      this.tableHeight = document.getElementById('JobInstanceTableContainer') === null ? 0 : document.getElementById('JobInstanceTableContainer').offsetHeight;
    },
    backTaskDetail(){
      this.$emit('backTaskDetail', this.routeTaskId)
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.adaptiveTableHeight()
    })
    window.addEventListener('resize', this.adaptiveTableHeight, false)
  }
}
</script>

<style scoped>
#JobInstanceTableContainer :deep(.t-table-pagination) {
  display: none;
}
</style>
