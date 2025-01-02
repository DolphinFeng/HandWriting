<template>
  <!-- 主表格信息组件 -->
  <div id="ProductTable" class="table">
    <div id="ProductTableContainer" class="table-container">
      <el-table :data="tableData.list" border :max-height="tableHeight">
        <el-table-column
          fixed
          prop="productIdentity"
          label="产品Id"
          min-width="160"
          align="center"
          show-overflow-tooltip
        >
          <template #default="scope">
            <el-button @click="handleDetail(scope.row)" link type="primary">{{scope.row.productIdentity}}</el-button>
          </template>
        </el-table-column>
        <el-table-column
          v-for="item in tableRuleColumn"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
          :min-width="item.width"
          align="center"
        >
        </el-table-column>
        <el-table-column fixed="right" label="操作" align="center" width="110">
          <template #default="scope">
            <el-button @click="handleDetail(scope.row)" link type="primary" size="small">进入分支</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
     <!-- 分页组件 -->
    <div style="padding-top: 10px" class="pagination-container">
      <el-pagination
        background
        :total="tableData.total"
        :page-size="tableData.pageSize"
        :current-page.sync="tableData.currentPage"
        :page-sizes="[5,10,20,50]"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
        layout="total, sizes, prev, pager, next, jumper"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
  // 引入js数据
  import {tableRuleColumn} from "../../js/product_data.js";

  export default {
    name: "ProductTable",
    // 接收父组件传来的参数
    props: {
      tableData: Object,
    },
    data() {
      return {
         //表格的最大高度
        tableHeight: 0,
        tableRuleColumn: tableRuleColumn,
      }
    },
    methods: {
      // 表格当前页码改变时触发函数
      handleCurrentChange(page) {
        this.$emit('handleCurrentChange', page);
      },
      // 表格size改变时触发函数
      handleSizeChange(pageSize) {
        this.$emit('handleSizeChange', pageSize);
      },
      handleDetail(row) {
        this.$emit('handleDetail', row)
      },
      // 设置表格的最大高度
      adaptiveTableHeight() {
        this.tableHeight = document.getElementById('ProductTableContainer') === null ? 0 : document.getElementById('ProductTableContainer').offsetHeight;
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.adaptiveTableHeight();
      });
      window.addEventListener('resize', this.adaptiveTableHeight, false);
    },
    created() {

    }
  }
</script>
