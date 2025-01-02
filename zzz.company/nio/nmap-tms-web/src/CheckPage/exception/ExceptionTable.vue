<template>
  <!-- 主表格信息组件 -->
  <div id="ExceptionTable" class="table">
    <div id="ExceptionTableContainer"
         class="table-container"
         v-loading="loading"
         element-loading-text="拼命加载中..."
         :element-loading-spinner="svg"
         element-loading-svg-view-box="-10, -10, 50, 50"
    >
      <el-table
        :data="tableData"
        border
        :max-height="tableHeight"
      >
        <el-table-column prop="exceptionNum" key="exceptionNum" label="序号" width="80" align="center"></el-table-column>
        <el-table-column prop="ruleCode" key="ruleCode" label="检查规则号" min-width="160" align="center"></el-table-column>
        <el-table-column prop="errCode" key="errCode" label="错误代码" min-width="100" align="center"></el-table-column>
        <el-table-column prop="featureId" key="featureId" label="要素Id" min-width="160" align="center"></el-table-column>
        <el-table-column prop="featureMesh" key="featureMesh" label="要素图幅" min-width="160" align="center"></el-table-column>
        <el-table-column prop="createTime" key="createTime" label="创建时间" min-width="180" align="center"></el-table-column>
      </el-table>
    </div>
    <!-- 例外管理：分页组件 -->
    <div style="padding-top: 10px" class="pagination-container">
      <el-pagination
        background
        :total="total"
        v-model:page-size="pageSize"
        v-model:current-page="currentPage"
        :page-sizes="[5,10,20,50]"
        @current-change="handleCurrentChange"
        @size-changee="handleSizeChange"
        layout="total,sizes,prev,pager,next,jumper"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
  // 引入js数据
  import {columnsException} from "@/js/check_data.js";
  import {svg} from "@/js/loading_data.js";

  const nioCheckURL = window.api.nioCheckURL;

  export default {
    name: "ExceptionTable",
    // 接收父组件传来的参数
    props: {
      loading: Boolean,
      tableData: Array,
      total: Number,
    },
    data() {
      return {
        svg: svg,
        // 例外管理表格的最大高度
        tableHeight: 0,
        // 每次表格展示多少条信息
        pageSize: 20,
        // 表格当前页码
        currentPage: 1,
        // 例外管理表格表头信息
        columnsException: columnsException
      }
    },
    methods: {
      // 表格当前页码改变时触发函数
      handleCurrentChange(page) {
        this.currentPage = page;
        this.$emit('handleCurrentChange', page)
      },
      // 表格size改变时触发函数
      handleSizeChange(page_size) {
        this.pageSize = page_size;
        this.$emit('handleSizeChange', page_size)
      },
      // 设置表格的最大高度
      adaptiveTableHeight() {
        this.tableHeight = document.getElementById('ExceptionTableContainer') === null ? 0 : document.getElementById('ExceptionTableContainer').offsetHeight;
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.adaptiveTableHeight()
      })
      window.addEventListener('resize', this.adaptiveTableHeight, false)
    },
  }
</script>
