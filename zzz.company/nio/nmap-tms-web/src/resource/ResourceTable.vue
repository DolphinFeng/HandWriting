<template>
  <!-- 主表格信息组件 -->
  <div id="ResourceTable" :style="tableContainerHeight">
    <div id="ResourceTableContainer">
      <el-table :data="tableData" border :max-height="tableHeight">
        <el-table-column
          v-for="item in tableColumn"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
          :min-width="item.width"
        ></el-table-column>
        <el-table-column fixed="right" label="操作" width="130">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleUpdate(scope.row)">编辑</el-button>
            <el-button type="text" size="small" @click="handleSurveillance(scope.row)">监控</el-button>
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
import {tableColumn} from "../js/resource_data";

export default {
  name: "ResourceTable",
  // 接收父组件传来的参数
  props: {
    tableData: Array,
    total: Number,
  },
  data() {
    return {
      tableContainerHeight: {
        height: '100%',
      },
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
    // 表格当前页码改变时触发函数
    handleCurrentChange(page) {
      this.$emit('handlePaginationChange', page, this.pageSize)
    },
    // 表格size改变时触发函数
    handleSizeChange(page_size) {
      this.$emit('handlePaginationChange', this.currentPage, page_size)
    },
    handleUpdate(row) {
      this.$emit('handleUpdate', row)
    },
    closeAddUpdate() {
      this.$emit('closeAddUpdate')
    },
    handleSurveillance(row) {
      this.$emit('handleSurveillance', row.code, 5, 1, 5, 1)
    },
    // 设置表格的最大高度
    adaptiveTableHeight() {
      this.tableHeight = document.getElementById('ResourceTableContainer') === null ? 0 : document.getElementById('ResourceTableContainer').offsetHeight - 10
    }
  },
  mounted() {
    this.tableContainerHeight.height = `calc(100% - ${document.getElementById("ResourceTool").offsetHeight - 80}px)`
    this.$nextTick(() => {
      this.adaptiveTableHeight()
    })
    window.addEventListener('resize', this.adaptiveTableHeight, false)
  }
}
</script>

<style scoped>
#ResourceTable {
  position: relative;
  margin: 0px 20px 10px 20px;
  text-align: left;
}

#ResourceTableContainer {
  position: absolute;
  top: 0;
  width: 100%;
  height: calc(100% - 145px);
}

#ResourceTableContainer :deep(.t-table-pagination) {
  display: none;
}

.tPaginationContainer {
  position: absolute;
  width: 100%;
  bottom: 108px;
  height: 42px;
}
</style>
