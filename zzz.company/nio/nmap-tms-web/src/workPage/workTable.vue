<template>
  <!-- 主表格信息组件 -->
  <div id="workTable" class="table">
    <div id="workTableContainer"
         class="table-container"
         v-loading="loading"
         element-loading-text="拼命加载中..."
         :element-loading-spinner="svg"
         element-loading-svg-view-box="-10, -10, 50, 50"
    >
      <el-table
          id="w_column"
          :data="tableData"
          border
          :max-height="table_height"
          @sort-change='sortChange'
          @selection-change="handleSelectionChange">
        <el-table-column fixed="left" align="center" key="workNum" prop="workNum" label="序号" min-width="60"
                         :sortable="false"></el-table-column>
        <el-table-column fixed="left" align="center" key="taskId" prop="taskId" label="任务号" min-width="100"
                         sortable="custom"></el-table-column>
        <el-table-column fixed="left" align="center" key="taskName" prop="taskName" label="任务名称" min-width="230"
                         sortable="custom" show-overflow-tooltip></el-table-column>
        <el-table-column align="center" key="lineName" prop="lineName" label="任务类型" min-width="140"
                         sortable="custom"></el-table-column>
        <el-table-column align="center" key="workName" prop="workName" label="作业名称" min-width="120"
                         sortable="custom"></el-table-column>
        <el-table-column align="center" key="statusText" prop="statusText" label="作业状态" min-width="120"
                         sortable="custom">
          <template #default="{row}">
            <el-tag :type="asTag(row.statusText)">{{ row.statusText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" key="assignee" prop="assignee" label="作业员id" min-width="145"
                         sortable="custom"></el-table-column>
        <el-table-column align="center" key="tagList" prop="tagList" label="作业标签" min-width="110"
                         sortable="custom"></el-table-column>
        <el-table-column align="center" key="workCreateTime" prop="workCreateTime" label="创建时间" min-width="175"
                         sortable="custom"></el-table-column>
        <el-table-column align="center" key="workStartTime" prop="workStartTime" label="开始时间" min-width="175"
                         sortable="custom"></el-table-column>
        <el-table-column align="center" key="workCompleteTime" prop="workCompleteTime" label="完成时间" min-width="175"
                         sortable="custom"></el-table-column>
        <el-table-column fixed="right" align="center" label="操作" width="80">
          <template #default="{row}">
            <el-button size="small" v-if="row.statusCode === 1" link type="success" @click="distributeHandler(row)">
              分配
            </el-button>
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

const nioTaskURL = window.api.nioTaskURL;
if (nioTaskURL === null || nioTaskURL === undefined) {
  console.log("获取nioTaskURL失败" + nioTaskURL)
}

export default {
  name: "workTable",
  // 接收父组件传来的参数
  props: {
    loading: Boolean,
    tableData: Array,
    total: Number,
    workTableColumn: Array,
  },
  data() {
    return {
      table_height: 0,
      // 表格当前页码
      currentPage: 1,
      // 每次表格展示多少条信息
      pageSize: 20,
      svg: svg,
    }
  },
  methods: {
    asTag(statusText) {
      switch (statusText) {
        case '未分配':
          return 'info';
        case '已分配':
          return '';
        case '作业中':
          return 'warning';
        case '已完成':
          return 'success';
        default:
          return 'danger';
      }
    },
    distributeHandler(row) {
      this.$emit('handleAssign', row);
    },
    // 表格排序方法
    sortChange({column, prop, order}) {
      this.$emit('sortChange', {column, prop, order})
    },
    // 多选方法
    handleSelectionChange(val) {
      this.$emit('handleSelectionChange', val)
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
      this.table_height = document.getElementById('workTableContainer') === null ? 0 : document.getElementById('workTableContainer').offsetHeight
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.adaptiveTableHeight()
    })
    window.addEventListener('resize', this.adaptiveTableHeight, false)
  }
}
</script>
