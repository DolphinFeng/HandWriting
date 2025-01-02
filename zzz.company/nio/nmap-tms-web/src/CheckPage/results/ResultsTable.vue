<template>
  <!-- 主表格信息组件 -->
  <div id="ResultsTable" class="table">
    <div id="ResultsTableContainer" class="table-container">
      <el-table
        v-loading="loading"
        element-loading-text="拼命加载中..."
        :element-loading-spinner="svg"
        element-loading-svg-view-box="-10, -10, 50, 50"
        :data="tableData"
        border
        :max-height="tableHeight"
      >
        <el-table-column prop="resultsNum" key="resultsNum" label="序号" min-width="60" align="center"></el-table-column>
        <el-table-column prop="valId" key="valId" label="valId" min-width="150" align="center"></el-table-column>
        <el-table-column prop="ruleCode" key="ruleCode" label="规则号" min-width="150" align="center"></el-table-column>
        <el-table-column prop="targetTable" key="targetTable" label="目标要素" min-width="90" align="center"></el-table-column>
        <el-table-column prop="targetField" key="targetField" label="目标字段" min-width="90" align="center"></el-table-column>
        <el-table-column prop="errCode" key="errCode" label="错误编码" min-width="90" align="center"></el-table-column>
        <el-table-column prop="errDesc" key="errDesc" label="错误描述" min-width="180" align="center"></el-table-column>
        <el-table-column prop="featureId" key="featureId" label="要素Id" min-width="150" align="center"></el-table-column>
        <el-table-column prop="featureMesh" key="featureMesh" label="要素图幅" min-width="120" align="center"></el-table-column>
        <el-table-column prop="createTime" key="createTime" label="创建时间" min-width="180" align="center"></el-table-column>
      </el-table>
    </div>
    <!-- 检查结果：分页组件 -->
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
  import {svg} from "../../js/loading_data.js";

  const nioCheckURL = window.api.nioCheckURL;

  export default {
    name: "ResultsTable",
    // 接收父组件传来的参数
    props: {
      tableData: Array,
      total: Number,
      loading: Boolean,
    },
    data() {
      return {
        // 表格的最大高度
        tableHeight: 0,
        // 每次表格展示多少条信息
        pageSize: 20,
        // 表格当前页码
        currentPage: 1,
        // 表格表头信息
        svg: svg
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
      // 设置表格的最大高度
      adaptiveTableHeight() {
        this.tableHeight = document.getElementById('ResultsTableContainer') === null ? 0 : document.getElementById('ResultsTableContainer').offsetHeight;
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
