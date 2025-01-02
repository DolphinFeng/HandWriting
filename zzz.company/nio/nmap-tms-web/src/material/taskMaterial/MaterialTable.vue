<template>
  <!-- 主表格信息组件 -->
  <div id="MaterialTable" class="table">
    <div id="MaterialTableContainer" class="table-container">
      <el-table :data="tableData" border :max-height="tableHeight">
        <el-table-column fixed prop="taskId" label="任务编号" min-width="100" align="center">
          <template #default="scope">
            <el-button @click="handleDetail(scope.row)" type="primary" link>{{scope.row.taskId}}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="taskTypeName" label="任务类型" min-width="140" align="center"></el-table-column>
        <el-table-column prop="taskParams" label="任务参数" min-width="150" align="center">
          <template #default="{row}">
            <el-tag v-if="row.taskParams === '{}'" type="warning">null</el-tag>
            <el-link v-else :underline="false" type="primary" style="font-size: 13px;font-weight: normal" @click="showJson(row.taskParams)">显示任务参数</el-link>
          </template>
        </el-table-column>
        <el-table-column v-for="item in tableColumn" :key="item.prop" :prop="item.prop" :label="item.label" :min-width="item.width" align="center"></el-table-column>
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
    <JsonView
        :data="jsonData"
        title="显示参数"
        v-model:visible="jsonVisible"
    ></JsonView>
  </div>
</template>

<script>
  // 引入js数据
  import {tableColumn} from "@/js/material_data";
  import store from "@/store/index.js";
  import JsonView from "@/jsonView/JsonView.vue";

  export default {
    name: "MaterialTable",
    components: {JsonView},
    // 接收父组件传来的参数
    props: {
      tableData: Array,
      total: Number,
      currentCopyPage: Number,
      pageCopySize: Number
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
        currentPage: 1,
        jsonVisible: false,
        jsonData: '',
      }
    },
    methods: {
      showJson(data) {
        this.jsonData = data;
        this.jsonVisible = true;
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
      // 进入任务详情
      handleDetail(row) {
        store.commit('breadChange', 2);
        this.$emit('handleDetail', row);
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
        this.currentPage = 1
      }
    }
  }
</script>
