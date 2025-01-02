<template>
  <!-- 主表格信息组件 -->
  <div id="CollectTaskTable" class="table">
    <div id="CollectTaskContainer" class="table-container">
      <el-table :data="tableData" border :max-height="tableHeight" @selection-change="selectionChange">
        <el-table-column fixed prop="id" label="记录id" min-width="100" align="center"></el-table-column>
        <el-table-column fixed="left" align="center" prop="businessType" label="业务场景类型" key="businessType" min-width="120">
          <template #default="{ row }">
            <el-tag v-if="row.businessType == 'PN'">停车场</el-tag>
            <el-tag v-else-if="row.businessType == 'PSP'">换电站</el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="left" prop="businessId" label="业务编号" min-width="150" align="center"></el-table-column>
        <el-table-column fixed="left" prop="collectTaskType" label="采集任务类型" min-width="120" align="center"></el-table-column>
        <el-table-column prop="collectTaskId" label="采集平台编号" min-width="150" align="center"></el-table-column>
        <el-table-column prop="mapVsn" label="地图版本" min-width="150" align="center">
          <template #default="{row}">
            {{ row.mapVsn === '' ? '000000' : row.mapVsn }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="采集任务状态" key="status" min-width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getCollectTaskStatus(row.status, true)">{{ getCollectTaskStatus(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="materialNum" label="回流资料数" min-width="100" align="center"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" align="center"></el-table-column>
        <el-table-column prop="updateTime" label="更新时间" min-width="160" align="center"></el-table-column>
        <el-table-column prop="operator" label="操作员" min-width="150" align="center"></el-table-column>
      </el-table>
    </div>
    <!-- 分页组件 -->
    <div style="padding-top: 10px" class="pagination-container">
      <el-pagination background :total="total" :page-size="pageSize" v-model="currentPage" :page-sizes="[5, 10, 20, 50]"
        @current-change="handleCurrentChange" @size-change="handleSizeChange"
        layout="total, sizes, prev, pager, next, jumper"></el-pagination>
    </div>
  </div>
</template>

<script>
// 引入js数据
import { tableColumn } from "@/js/material_data";

export default {
  name: "CollectTaskTable",
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
    getCollectTaskStatus(status, isTag) {
      switch (status) {
        case 'CREATED':
          return isTag ? 'info' : '新建';
        case 'COLLECTING':
          return isTag ? 'info' : '进行中';
        case 'FINISHED':
          return isTag ? 'success' : '已结束';
        default:
          return isTag ? 'info' : '未知状态';
      }
    },
    getCollectTaskType(type, row) {
      switch (type) {
        case 'NEW':
          return '众包拓场';
        case 'UPDATE':
          return '众包更新';
        default:
          return '';
      }
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
      this.tableHeight = document.getElementById('CollectTaskTable') === null ? 0 : (document.getElementById('CollectTaskTable').offsetHeight - 42);
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.adaptiveTableHeight();
    })
    window.addEventListener('resize', this.adaptiveTableHeight, false);
  },
  unmounted() {
    window.removeEventListener('resize', this.adaptiveTableHeight);
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

<style scoped>
.table{
  overflow: hidden;
}
</style>