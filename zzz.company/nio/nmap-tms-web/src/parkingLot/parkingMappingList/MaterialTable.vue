<template>
  <!-- 主表格信息组件 -->
  <div id="MaterialTable" class="table">
    <div id="MaterialTableContainer" class="table-container">
      <el-table :data="tableData" border :max-height="tableHeight" @selection-change="selectionChange">
        <el-table-column fixed prop="id" label="记录id" min-width="100" align="center"></el-table-column>
        <el-table-column fixed="left" align="center" prop="businessType" label="业务场景类型" key="businessType"
          min-width="120">
          <template #default="{ row }">
            <el-tag v-if="row.businessType == 'PN'">停车场</el-tag>
            <el-tag v-else-if="row.businessType == 'PSP'">换电站</el-tag>
            <el-tag v-else-if="row.businessType == 'KX'">快修</el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="left" prop="businessId" label="业务场景ID" min-width="100" align="center"></el-table-column>
        <el-table-column fixed="left" prop="businessName" label="业务场景名称" min-width="280" align="center">
          <template #default="scope">
            <el-tag type="success">{{ scope.row.businessName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="mappingTaskId" label="任务编号(pipline平台)" min-width="150" align="center"></el-table-column>
        <el-table-column prop="mappingTaskName" label="任务名称(pipline平台)" min-width="150" align="center"></el-table-column>
        <el-table-column align="center" prop="taskStatus" label="任务状态" key="taskStatus" min-width="120">
          <template #default="{ row }">
            <el-tag :type="getMaterialStatus(row.taskStatus, true)">{{ getMaterialStatus(row.taskStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="重新建图" min-width="120">
          <template #default="{ row }">
            <el-button v-if="row.taskStatus == 'FAILED' && row.mappingTaskId != 'null'" type="primary"
            @click="retry(row)">重新建图</el-button>
          </template>
        </el-table-column>
        <el-table-column label="采集任务id列表" min-width="150" align="center">
          <template #default="{ row }">
            <el-button v-if="row.collectionMaterialList && row.collectionMaterialList.join(',').length > 10" type="success" @click="showMaterialList(row.collectionMaterialList)">查看</el-button>
            <span v-else>{{ row.collectionMaterialList && row.collectionMaterialList.join(',') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="mappingMaterialId" label="建图资料id" min-width="150" align="center"></el-table-column>
        <el-table-column prop="createTime" label="记录创建时间" min-width="170" align="center"></el-table-column>
        <el-table-column prop="updateTime" label="记录修改时间" min-width="170" align="center"></el-table-column>
      </el-table>
    </div>
    <!-- 分页组件 -->
    <div style="padding-top: 10px" class="pagination-container">
      <el-pagination background :total="total" :page-size="pageSize" v-model="currentPage" :page-sizes="[20, 50,200,1000]"
        @current-change="handleCurrentChange" @size-change="handleSizeChange"
        layout="total, sizes, prev, pager, next, jumper"></el-pagination>
    </div>
    <el-dialog
      title="采集任务id列表"
      v-model="isShowMaterialList">
      <el-input type="textarea" :rows="3" v-model="strMaterialList"></el-input>
    </el-dialog>
  </div>
</template>

<script>
// 引入js数据
import { tableColumn } from "@/js/material_data";

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
      isShowMaterialList: false,
      strMaterialList: ''
    }
  },
  methods: {
    selectionChange(rows) {
      this.selectionRows.list = rows;
    },
    getMaterialStatus(status, isTag) {
      switch (status) {
        case 'CREATED':
          return isTag ? 'info' : '创建中';
        case 'RUNNING':
          return isTag ? 'warning' : '执行中';
        case 'SUCCESS':
          return isTag ? 'success' : '执行成功';
        case 'FAILED':
          return isTag ? 'danger' : '执行失败';
        default:
          return isTag ? 'danger' : '未知状态';
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
    retry(row) {
      this.$emit('retry', row);
    },
    // 设置表格的最大高度
    adaptiveTableHeight() {
      this.tableHeight = document.getElementById('MaterialTableContainer') === null ? 0 : document.getElementById('MaterialTableContainer').offsetHeight;
    },
    showMaterialList(materialList) {
      this.strMaterialList = materialList.join(',');
      this.isShowMaterialList = true;
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
