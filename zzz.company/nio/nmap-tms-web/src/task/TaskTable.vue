<template>
  <!-- 主表格信息组件 -->
  <div id="TaskTable" class="table">
    <div id="TaskTableContainer"
         class="table-container"
         v-loading="loading"
         element-loading-text="拼命加载中..."
         :element-loading-spinner="svg"
         element-loading-svg-view-box="-10, -10, 50, 50"
    >
      <el-table
          id="p_column"
          :data="tableData"
          border
          :max-height="table_height"
          @sort-change='sortChange'
          @selection-change="handleSelectionChange"
          @cell-click="eventHandler"
      >
        <el-table-column align="center" type="selection" width="55" fixed="left"></el-table-column>
        <el-table-column fixed align="center" prop="pmsNum" label="序号" key="pmsNum" :sortable="false" min-width="80"></el-table-column>
        <el-table-column fixed align="center" prop="id" label="任务号" key="id" sortable="custom" min-width="100"></el-table-column>
        <el-table-column align="center" prop="parentId" label="父任务号" key="parentId" sortable="custom" min-width="120"></el-table-column>
        <el-table-column align="center" prop="name" label="任务名称" key="name" sortable="custom" min-width="260" show-overflow-tooltip></el-table-column>
        <el-table-column align="center" prop="typeName" label="任务类型" key="typeName" sortable="custom" min-width="160"></el-table-column>
        <el-table-column align="center" prop="statusText" label="任务状态" key="statusText" sortable="custom" min-width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.statusText !== ''" :type="getStatusType(scope.row.statusText)">{{scope.row.statusText}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="priorityText" label="优先级" key="priorityText" sortable="custom" min-width="100"></el-table-column>
        <el-table-column align="center" prop="owner" label="创建人" key="owner" sortable="custom" min-width="120"></el-table-column>
        <el-table-column align="center" prop="createTime" label="创建时间" key="createTime" sortable="custom" min-width="180"></el-table-column>
        <el-table-column align="center" prop="startTime" label="启动时间" key="startTime" sortable="custom" min-width="180"></el-table-column>
        <el-table-column align="center" prop="finishTime" label="结束时间" key="finishTime" sortable="custom" min-width="180"></el-table-column>
        <el-table-column fixed="right" label="任务操作" min-width="120">
          <template #default="scope">
            <el-button type="primary" link size="small" v-if="pmsShow.pmsHistoryShow">
              <span class="handle-detail">详情</span>
            </el-button>
            <el-button type="success" link size="small" v-if="pmsShow.pmsStartShow && scope.row.statusCode === 1">
              <span class="handle-start">启动</span>
            </el-button>
            <el-button type="success" link size="small" v-if="scope.row.statusCode !== 1">
              <span class="handle-copy">复制</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 分页组件 -->
    <div style="padding-top: 10px" class="tPaginationContainer">
      <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          v-bind="currentPage"
          :page-sizes="[5, 10, 20, 50, 200, 500, 1000]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </div>
    <!-- 启动任务对话框 -->
    <el-dialog title="启动任务"
               v-model="startVisible"
               show-close
               @close="() => this.startVisible = false"
               width="480px">
      <div style="word-break: break-all;;margin-bottom: 15px">
        <div>确认启动任务 <b>{{ taskId }}</b> 吗?</div>
      </div>
      <template #footer class="dialog-footer">
        <el-button @click="() => this.startVisible = false">取 消</el-button>
        <el-button type="primary" @click="startFun">启 动</el-button>
      </template>
    </el-dialog>
  </div>

</template>

<script>
// 引入需要的组件
import TaskDetail from "./TaskDetail.vue";
import store from "../store/index.js";
import {svg} from "@/js/loading_data.js";
import axios from "axios";
import {ElMessage} from "element-plus";

const nioTaskURL = window.api.nioTaskURL;
if (nioTaskURL === null || nioTaskURL === undefined) {
  console.log("获取nioTaskURL失败" + nioTaskURL)
}

export default {
  name: "TaskTable",
  // 组件注册
  components: {
    TaskDetail
  },
  // 接收父组件传来的参数
  props: {
    loading: Boolean,
    tableData: Array,
    total: Number,
    taskTableColumn: Array,
    pmsShow: Object,
  },
  data() {
    return {
      startVisible: false,
      taskId: 0,
      table_height: 0,
      // 每次表格展示多少条信息
      pageSize: 20,
      // 表格当前页码
      currentPage: 1,
      svg: svg,
    }
  },
  methods: {
    startFun() {
      axios({
        url: nioTaskURL + '/task/start/' + this.taskId,
        method: 'post',
      }).then(response => {
        if (response.data.code === 200) {
          ElMessage.success({
            message: '任务id：' + this.taskId + '启动成功',
            showClose: false,
            grouping: true,
          });
          this.loadingPage();
          this.startVisible = false;
        } else {
          throw new Error(response.data.msg);
        }
      }).catch((err) => {
        ElMessage.error({
          message: '启动失败：' + err.message,
          showClose: false,
          grouping: true,
        });
      });
    },
    //事件代理
    eventHandler(row, column, cell, ev) {
      let classList = ev.target.classList;
      if (classList.contains('handle-detail')) {
        this.handleDetail(row);
      } else if (classList.contains('handle-start')) {
        this.handleStart(row);
      } else if (classList.contains('handle-copy')) {
        this.handleCopy(row);
      }
    },
    // 获取表格信息功能
    loadingPage() {
      this.$emit('loadingPage');
    },
    // 表格排序方法
    sortChange({column, prop, order}) {
      this.$emit('sortChange', {column, prop, order})
    },
    // 详情按钮
    handleDetail(row) {
      this.$emit('handleDetail', row);
      store.commit('breadChange', 2);
    },
    // 启动任务
    handleStart(row) {
      this.taskId = row.id
      this.startVisible = true;
    },
    // 复制任务
    handleCopy(row) {
      this.$emit('createButton', row.id);
    },
    // 多选方法
    handleSelectionChange(val) {
      this.$emit('handleSelectionChange', val)
    },
    // 编辑任务按钮
    handleUpdate(row) {
      this.$emit('handleUpdate', row);
    },
    // 分配操作员按钮
    handleAssign(row) {
      this.$emit('handleAssign', row)
    },
    // 表格当前页码改变时触发函数
    handleCurrentChange(page) {
      this.currentPage = page
      this.$emit('handlePaginationChange', page, this.pageSize)
    },
    // 表格size改变时触发函数
    handleSizeChange(page_size) {
      this.pageSize = page_size
      this.$emit('handlePaginationChange', this.currentPage, page_size)
    },
    // 设置表格的最大高度
    adaptiveTableHeight() {
      this.table_height = document.getElementById('TaskTableContainer') === null ? 0 : document.getElementById('TaskTableContainer').offsetHeight;
    },
  },
  computed: {
    getStatusType() {
      return function (statusText) {
        if (statusText.search("失败") !== -1) {
          return "danger";
        } else if (statusText.search("取消") !== -1) {
          return "info";
        } else if (statusText.search("结束") !== -1) {
          return "success";
        } else if (statusText.search("执行中") !== -1) {
          return "warning";
        }
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.adaptiveTableHeight();
    })
    window.addEventListener('resize', this.adaptiveTableHeight, false);
  }
}
</script>

<style scoped>


</style>
