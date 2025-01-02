<template>
  <!-- 主表格信息组件 -->
  <div id="ExecutionEngineTable" class="table">
    <div id="ExecutionEngineTableContainer" class="table-container">
      <el-table :data="tableData" border :max-height="tableHeight">
        <el-table-column fixed="left" prop="code" key="code" label="引擎编码" min-width="150" align="center"></el-table-column>
        <el-table-column fixed="left" prop="name" key="name" label="引擎名称" min-width="200" align="center"></el-table-column>
        <el-table-column prop="image" key="image" label="镜像地址" show-overflow-tooltip min-width="400" align="left"></el-table-column>
        <el-table-column prop="command" key="command" label="启动命令" show-overflow-tooltip min-width="300" align="left"></el-table-column>
        <el-table-column fixed="right" label="操作" width="150" align="center">
          <template #default="scope">
            <el-button @click="handleUpdate(scope.row)" link type="primary" size="small">编辑</el-button>
            <el-button type="success" link size="small" @click="handleEnv(scope.row)">环境变量</el-button>
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
import store from "@/store/index.js";

export default {
  name: "JobTable",
  // 接收父组件传来的参数
  props: {
    tableData: Array,
    total: Number,
  },
  data() {
    return {
      // 表格的最大高度
      tableHeight: 0,
      // 每次表格展示多少条信息
      pageSize: 20,
      // 表格当前页码
      currentPage: 1,
    }
  },
  methods: {
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
    handleEnv(row) {
      this.$emit('handleEnv', row)
    },
    closeAddUpdate() {
      this.$emit('closeAddUpdate')
    },
    // 设置表格的最大高度
    adaptiveTableHeight() {
      this.tableHeight = document.getElementById('ExecutionEngineTableContainer') === null ? 0 : document.getElementById('ExecutionEngineTableContainer').offsetHeight;
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
#ExecutionEngineTableContainer :deep(.t-table-pagination) {
  display: none;
}
</style>
