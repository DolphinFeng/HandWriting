<template>
  <!-- 主表格信息组件 -->
  <div id="PackagesTable" class="table">
    <div id="TableContainer" class="table-container">
      <el-table :max-height="tableHeight" :data="tableData" border>
        <!-- <el-table-column type="selection" width="60" align="center"></el-table-column> -->
        <el-table-column fixed prop="id" label="套餐id" min-width="100" align="center"></el-table-column>
        <el-table-column fixed prop="configName" label="套餐名称" min-width="120" align="center"></el-table-column>
        <el-table-column fixed prop="configDesc" label="套餐配置描述" min-width="200" align="center"></el-table-column>
        <el-table-column prop="configText" label="套餐配置详情" min-width="150" align="center">
          <template #default="{row}">
            <el-button type="success" @click="handleConfigTextDownload(row)">下载</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="150" align="center"></el-table-column>
      </el-table>
    </div>
    <!-- 分页组件 -->
    <div style="padding-top: 10px" class="pagination-container">
      <el-pagination background :total="total" :page-size="pageSize" v-model="currentPage" :page-sizes="[10, 20, 50, 100]"
        @current-change="handleCurrentChange" @size-change="handleSizeChange"
        layout="total, sizes, prev, pager, next, jumper"></el-pagination>
    </div>
  </div>
</template>

<script>
import { nextTick } from "vue";
import { downloadFileByContent } from '@/utils';

export default {
  name: "PackagesTable",
  // 接收父组件传来的参数
  props: {
    tableData: Array,
    total: Number,
    selectionRows: Object,
  },
  data() {
    return {
      pageSize: 20,
      // 表格当前页码
      currentPage: 0,
      jsonVisible: false,
      jsonData: '',
      tableHeight: 0
    }
  },
  methods: {
    // 表格当前页码改变时触发函数
    handleCurrentChange(page) {
      this.currentPage = page;
      this.$emit('handleCurrentChange', page);
    },
    // 表格size改变时触发函数
    handleSizeChange(page_size) {
      this.pageSize = page_size;
      this.$emit('handleSizeChange', page_size);
    },
    handleConfigTextDownload(row) {
      downloadFileByContent(row.configName + '.json', row.configText);
    },
    adaptiveTableHeight() {
      this.tableHeight = document.getElementById('TableContainer') === null ? 0 : document.getElementById('TableContainer').offsetHeight;
    }
  },
  mounted() {
    nextTick(() => {
      this.adaptiveTableHeight();
    });
    window.addEventListener('resize', this.adaptiveTableHeight);
  },
  unmounted() {
    window.removeEventListener('resize', this.adaptiveTableHeight);
  },
  created() {
  }
}
</script>
