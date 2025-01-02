<template>
  <!-- 主表格信息组件 -->
  <div id="FunctionTable" class="table">
    <div id="FunctionTableContainer" class="table-container">
      <el-table :data="tableData" border :max-height="tableHeight" @cell-click="copyURL">
        <el-table-column prop="code" key="code" label="接口编码" min-width="50" align="center" show-overflow-tooltip></el-table-column>
        <el-table-column prop="name" key="name" label="接口名称" min-width="50" align="center"></el-table-column>
        <el-table-column prop="url" key="url" label="接口地址" min-width="200" align="center" show-overflow-tooltip>
          <template #default="scope">
            <el-link :underline="false" type="success">
              <span class="url-copy copy-link">{{scope.row.url}}</span>
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="method" key="method" label="请求方法" min-width="50" align="center"></el-table-column>
        <el-table-column prop="contentType" key="contentType" label="请求内容类型" min-width="50" align="center"></el-table-column>
        <el-table-column prop="timeout" key="timeout" label="超时时间" min-width="50" align="center"></el-table-column>
        <el-table-column fixed="right" label="操作" width="80">
          <template #default="scope">
            <el-button @click="handleUpdate(scope.row)" link type="primary" size="small">编辑</el-button>
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
// 引入js数据
import {tableColumn} from "../js/function_data";
import {copyTextToClipboard} from "../utils/index.js";

export default {
  name: "FunctionTable",
  // 接收父组件传来的参数
  props: {
    tableData: Array,
    total: Number,
  },
  data() {
    return {
      // 表格的最大高度
      tableHeight: 0,
      tableColumn: [
        ...tableColumn
      ],
      // 每次表格展示多少条信息
      pageSize: 20,
      // 表格当前页码
      currentPage: 1,
    }
  },
  methods: {
    //复制接口地址
    copyURL(row, column, cell, event) {
      if (event.target.classList.contains('url-copy')) {
        copyTextToClipboard(event.target.innerText);
      }
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
    handleUpdate(row) {
      this.$emit('handleUpdate', row)
    },
    closeAddUpdate() {
      this.$emit('closeAddUpdate')
    },
    // 设置表格的最大高度
    adaptiveTableHeight() {
      this.tableHeight = document.getElementById('FunctionTableContainer') === null ? 0 : document.getElementById('FunctionTableContainer').offsetHeight;
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
#FunctionTableContainer :deep(.t-table-pagination) {
  display: none;
}
</style>
