<template>
  <!-- 主表格信息组件 -->
  <div id="MaterialTable" class="table">
    <div id="MaterialTableContainer" class="table-container">
      <el-table :data="tableData" border :max-height="tableHeight" @selection-change="selectionChange">
        <el-table-column fixed prop="id" label="记录id" min-width="100" align="center"></el-table-column>
        <el-table-column prop="businessType" label="资料类型" min-width="140" align="center"></el-table-column>
        <el-table-column prop="businessId" label="业务编号" min-width="150" align="center"></el-table-column>
        <el-table-column prop="businessName" label="业务名称" min-width="150" align="center"></el-table-column>
        <el-table-column prop="sessionId" label="会话编号" min-width="150" align="center"></el-table-column>
        <el-table-column prop="collectionTaskId" label="采集任务编号" min-width="150" align="center"></el-table-column>
        <el-table-column prop="geofenceName" label="地理围栏名称" min-width="150" align="center"></el-table-column>
        <el-table-column prop="vid" label="车辆编号" min-width="150" align="center"></el-table-column>
        <el-table-column prop="firstTime" label="第一个资料包的时间戳(秒值)" min-width="150" align="center"></el-table-column>
        <el-table-column prop="endTime" label="最后一个资料包的时间戳(秒值)" min-width="150" align="center"></el-table-column>
        <el-table-column prop="fileNum" label="实际文件数量" min-width="150" align="center"></el-table-column>
        <el-table-column prop="totalFileNum" label="总计文件数" min-width="150" align="center"></el-table-column>
        <el-table-column prop="keyPrefix" label="cos地址前缀" min-width="150" align="center"></el-table-column>
        <el-table-column prop="createTime" label="记录创建时间" min-width="150" align="center"></el-table-column>
      </el-table>
    </div>
    <!-- 分页组件 -->
    <div style="padding-top: 10px" class="pagination-container">
      <el-pagination
        background
        :total="total"
        :page-size="pageSize"
        v-model="currentPage"
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
  import {tableColumn} from "@/js/material_data";

  export default {
    name: "MaterialTable",
    // 接收父组件传来的参数
    props: {
      tableData: Array,
      total: Number,
      currentCopyPage: Number,
      pageCopySize: Number,
	  selectionRows: Object,
    },
    data() {
      return {
         //表格的最大高度
        tableHeight: 0,
        tableColumn: [
          ...tableColumn
        ],
        // 每次表格展示多少条信息
        pageSize: 20,
        // 表格当前页码
        currentPage: 0,
        jsonVisible: false,
        jsonData: '',
      }
    },
    methods: {
		selectionChange(rows) {
		  this.selectionRows.list = rows;
		},
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
        this.tableHeight = document.getElementById('MaterialTableContainer') === null ? 0 : document.getElementById('MaterialTableContainer').offsetHeight;
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.adaptiveTableHeight();
      })
      window.addEventListener('resize', this.adaptiveTableHeight, false);
    },
    created() {
      if (this.pageCopySize.length !== 0) {
        this.pageSize = this.pageCopySize;
      } else {
        this.pageSize = 20;
      }
      if (this.currentCopyPage.length !== 0) {
        this.currentPage = this.currentCopyPage
      } else {
        this.currentPage = 0
      }
    }
  }
</script>
