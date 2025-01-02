<template>
  <!-- 主表格信息组件 -->
  <div id="ProjectTable" class="table">
    <div
      id="ProjectTableContainer"
      class="table-container"
      element-loading-text="拼命加载中..."
      :element-loading-spinner="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
    >
      <el-table id="p_column" :data="projectTableData" border :max-height="table_height" @selection-change="handleSelectionChange">
        <el-table-column align="center" type="selection" width="55" fixed="left"></el-table-column>
        <el-table-column
          fixed
          align="center"
          prop="id"
          label="项目编号"
          key="id"
          :sortable="false"
          min-width="80"
        ></el-table-column>
        <el-table-column fixed align="center" prop="name" label="项目名称" key="name" min-width="150"></el-table-column>
        <el-table-column
          align="center"
          prop="productLineName"
          label="项目类型"
          key="productLineName"
          min-width="120"
        ></el-table-column>
        <el-table-column
          align="center"
          prop="current"
          label="当前阶段"
          key="current"
          min-width="120"
        ></el-table-column>
        <el-table-column align="center" prop="status" label="项目状态" key="status" min-width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="createBy" label="创建人" key="createBy" min-width="120"></el-table-column>
        <el-table-column
          align="center"
          prop="createTime"
          label="创建时间"
          key="createTime"
          min-width="150"
        ></el-table-column>
        <el-table-column align="center" prop="startTime" label="开始时间" key="startTime" min-width="150"></el-table-column>
        <el-table-column align="center" prop="endTime" label="结束时间" key="endTime" min-width="150"></el-table-column>
        <el-table-column fixed="right" label="项目操作" min-width="80">
          <template #default="scope">
            <el-button type="primary" link size="small" @click="handleDetail(scope.row)"> 详情 </el-button>
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
        :current-page="currentPage"
        :page-sizes="[20, 50, 100, 500, 1000]"
        :default-page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
// 引入需要的组件
import store from '../../store/index.js';
import { svg } from '@/js/loading_data.js';
import axios from 'axios';
import { ElMessage } from 'element-plus';

export default {
  name: 'ProjectPageTable',
  // 组件注册
  components: {
    //   TaskDetail
  },
  // 接收父组件传来的参数
  props: {
    // loading: Boolean,
    projectTableData: Array,

    total: Number,
    // taskTableColumn: Array,
  },
  data() {
    return {
      startVisible: false,
      taskId: 0,
      table_height: 0,

      // 每次表格展示多少条信息
      pageSize: 20,
      // 表格当前页码
      currentPage: 1,

      svg: svg,
    };
  },
  methods: {
     // 选中的方法
     handleSelectionChange(val) {
      this.$emit('handleSelectionChange', val);
    },

    // 详情按钮
    handleDetail(row) {
      this.$emit('handleDetail', row);
      store.commit('breadChange', 2);
    },

    
    // 表格当前页码改变时触发函数
    handleCurrentChange(page) {
      this.currentPage = page;
      this.$emit('handleCurrentChange', page, this.pageSize);
    },
    //   // 表格size改变时触发函数
    handleSizeChange(page_size) {
      this.pageSize = page_size;
      this.$emit('handleSizeChange', page_size);
    },
    // 设置表格的最大高度
    adaptiveTableHeight() {
      this.table_height =
        document.getElementById('ProjectTableContainer') === null
          ? 0
          : document.getElementById('ProjectTableContainer').offsetHeight;
    },
    getStatusType(status){
      if(status === '已取消'){
        return 'info'
      }else if(status === '编排失败' || status === '执行失败' || status === '失败'){
        return 'danger'
      }else if(status === '编排中' || status === '执行中' || status === '运行中' || status === '已结束'){
        return 'warning'
      }else if(status === '已完成'){
        return 'success'
      }else{
        return ''
      }
    }
  },
  computed: {},
  mounted() {
    this.$nextTick(() => {
      this.adaptiveTableHeight();
    });
    window.addEventListener('resize', this.adaptiveTableHeight, false);
  },
  unmounted() {
    window.removeEventListener('resize', this.adaptiveTableHeight);
  },
};
</script>

<style scoped></style>
