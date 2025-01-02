<template>
  <!-- 主表格信息组件 -->
  <div id="ProcessTable" class="table">
    <div id="tableContainer" class="table-container">
      <el-table :data="tableData" border :max-height="table_height">
        <el-table-column
            align="center"
            v-for="item in processColumn"
            :key="item.prop"
            :prop="item.prop"
            :label="item.label"
            :min-width="item.width"
            show-overflow-tooltip
        >
        </el-table-column>
        <el-table-column align="center" fixed="right" label="操作" width="120">
          <template #default="scope">
            <el-button @click="handlePreview(scope.row)" link type="primary" size="small">流程图预览</el-button>
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
import {processColumn} from "../js/process_data";

const nioTaskURL = window.api.nioTaskURL;

export default {
  name: "ProcessTable",
  // 接收父组件传来的参数
  props: {
    tableData: Array,
    total: Number,
  },
  data() {
    return {
      table_height: 0,
      processColumn: processColumn,
      downloadVisible: false,
      suspendVisible: false,
      activeVisible: false,
      procDefId: '',
      href: '',
      procDefKey: '',
      procDefName: '',
      pageSize: 20,
      currentPage: 1,
    }
  },
  methods: {
    // 表格当前页码改变时触发函数
    handleCurrentChange(page) {
      this.$emit('handlePaginationChange', page, this.pageSize);
      this.currentPage = page;
    },
    // 表格size改变时触发函数
    handleSizeChange(page_size) {
      this.pageSize = page_size;
      this.$emit('handlePaginationChange', this.currentPage, page_size)
    },
    handlePreview(row) {
      this.$emit('handlePreview', row)
    },
    // 获取表格信息功能
    loadingPage() {
      this.$emit('loadingPage')
    },
    // 设置表格的最大高度
    adaptiveTableHeight() {
      this.table_height = document.getElementById('tableContainer') === null ? 0 : document.getElementById('tableContainer').offsetHeight;
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.adaptiveTableHeight()
    })
    window.addEventListener('resize', this.adaptiveTableHeight, false);
  }
}
</script>

<style scoped>
.highlight:not(.djs-connection) .djs-visual > :nth-child(1) {
  fill: green !important; /* color elements as green */
}

#top_dialog :deep(.t-dialog--top) {
  top: 10%;
}
</style>
