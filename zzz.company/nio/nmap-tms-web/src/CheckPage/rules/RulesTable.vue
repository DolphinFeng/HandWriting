<template>
  <!-- 主表格信息组件 -->
  <div id="RulesTable" class="table">
    <div id="RulesTableContainer"
         class="table-container"
         v-loading="loading"
         element-loading-text="拼命加载中..."
         :element-loading-spinner="svg"
         element-loading-svg-view-box="-10, -10, 50, 50"
    >
      <el-table :data="tableData" border :max-height="tableHeight">
        <el-table-column fixed prop="ruleNum" label="序号" min-width="60" align="center"></el-table-column>
        <el-table-column fixed prop="ruleCode" label="规则编号" min-width="160" align="center">
          <template #default="scope">
            <!-- 点击进入规则详情页面 -->
            <el-button @click="handleDetail(scope.row)" link type="primary" size="small">
              {{scope.row.ruleCode}}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="ruleName" label="规则名称" key="ruleName" align="center" min-width="260" fixed></el-table-column>
        <el-table-column
          v-for="item in tableRuleColumn"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
          :min-width="item.width"
          align="center">
        </el-table-column>
      </el-table>
    </div>
    <!-- 规则详情：分页组件 -->
    <div style="padding-top: 10px" class="pagination-container">
      <el-pagination
        background
        :total="total"
        :page-size="pageSize"
        v-model="currentPage"
        :page-sizes="[5,10,20,50]"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
        layout="total,sizes,prev,pager,next,jumper"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
  // 引入js数据
  import {tableRuleColumn} from "@/js/check_data.js";
  import store from "../../store/index.js";
  import {svg} from "@/js/loading_data.js";

  export default {
    name: "RulesTable",
    // 接收父组件传来的参数
    props: {
      loading: Boolean,
      tableData: {
        type: Array,
        required: true,
      },
      total: {
        type: Number,
        required: true,
      },
    },
    data() {
      return {
        // 表格的最大高度
        tableHeight: 0,
        // 表格表头信息
        tableRuleColumn: tableRuleColumn,
        // 每次表格展示多少条信息
        pageSize: 20,
        // 表格当前页码
        currentPage: 1,
        svg: svg,
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
      // 获取规则详情
      handleDetail(row) {
        this.$emit('handleDetail', row);
        store.commit('breadChange', 2);
      },
      // 设置表格的最大高度
      adaptiveTableHeight() {
        this.tableHeight = document.getElementById('RulesTableContainer') === null ? 0 : document.getElementById('RulesTableContainer').offsetHeight;
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.adaptiveTableHeight();
      })
      window.addEventListener('resize', this.adaptiveTableHeight, false);
    },
  }
</script>
