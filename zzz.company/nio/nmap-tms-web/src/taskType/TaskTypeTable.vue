<template>
  <!-- 主表格信息组件 -->
  <div id="TaskTypeTable" class="table">
    <div id="TaskTypeTableContainer"
         class="table-container"
         v-loading="loading"
         element-loading-text="拼命加载中..."
         :element-loading-spinner="svg"
         element-loading-svg-view-box="-10, -10, 50, 50"
    >
      <el-table :data="tableData" border :max-height="table_height">
        <el-table-column prop="code" key="code" label="类型编码" min-width="200" align="center"></el-table-column>
        <el-table-column prop="name" key="name" label="类型名称" min-width="200" align="center"></el-table-column>
        <el-table-column prop="formCode" key="formCode" label="关联表单" min-width="160" align="center"></el-table-column>
        <el-table-column prop="procDefKey" key="procDefKey" label="流程定义key" min-width="200" align="center"></el-table-column>
        <el-table-column prop="manualCreateText" key="manualCreateText" label="是否支持手动创建任务" min-width="150" align="center">
          <template #default="scope">
            <el-tag :type="scope.row['manualCreateText'] === '是' ? 'success' : 'warning'">{{scope.row['manualCreateText']}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deletedText" key="deletedText" label="是否删除" min-width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row['deletedText'] === '是' ? 'success' : 'warning'">{{scope.row['deletedText']}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="notifyMessageText" key="notifyMessageText" label="是否开启消息订阅" min-width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row['notifyMessageText'] === '是' ? 'success' : 'warning'">{{scope.row['notifyMessageText']}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" label="操作" width="170">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleUpdate(scope.row)">编辑</el-button>
            <el-button type="success" link size="small" @click="handleEnv(scope.row)">环境变量</el-button>
            <el-button type="warning" link size="small" @click="exportJson(scope.row)">导出</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 分页组件 -->
    <div style="padding-top: 10px" class="pagination-container">
      <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="currentPage"
          :page-sizes="[5, 10, 20, 50, 200]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import {svg} from "@/js/loading_data.js";
import {taskTypeTableColumn} from "../js/taskType_data.js";
import axios from "axios";
import {ElMessage} from "element-plus";

const nioTaskURL = window.api.nioTaskURL;
if (nioTaskURL === null || nioTaskURL === undefined) {
  console.log("获取nioTaskURL失败" + nioTaskURL);
}

export default {
  name: "TaskTypeTable",
  // 接收父组件传来的参数
  props: {
    loading: Boolean,
    tableData: Array,
    total: Number,
  },
  data() {
    return {
      table_height: 0,
      taskTypeTableColumn: [
        ...taskTypeTableColumn
      ],
      currentPage: 1,
      pageSize: 20,
      svg: svg,
    };
  },
  methods: {
    // 编辑任务按钮
    handleUpdate(row) {
      this.$emit("handleUpdate", row);
    },
    handleEnv(row) {
      this.$emit('handleEnv', row)
    },
    exportJson(row) {
      window.open(nioTaskURL + "/task-type/export/" + row.code, '_blank')
    },
    // 表格当前页码改变时触发函数
    handleCurrentChange(page) {
      this.currentPage = page;
      this.$emit('handlePaginationChange', page, this.pageSize)
    },
    // 表格size改变时触发函数
    handleSizeChange(page_size) {
      this.pageSize = page_size;
      this.$emit('handlePaginationChange', this.currentPage, page_size)
    },
    // 设置表格的最大高度
    adaptiveTableHeight() {
      this.table_height = document.getElementById("TaskTypeTableContainer") === null ? 0 : document.getElementById("TaskTypeTableContainer").offsetHeight;
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.adaptiveTableHeight();
    });
    window.addEventListener("resize", this.adaptiveTableHeight, false);
  },
};
</script>

<style scoped>
#TaskTypeTableContainer :deep(.t-table-pagination) {
  display: none;
}
</style>
