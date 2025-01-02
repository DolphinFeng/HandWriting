<template>
  <!-- 主表格信息组件 -->
  <div id="CheckTable" :style="tableContainerHeight">
    <div id="checkTableContainer">
      <el-table
        id="c_column"
        :data="tableData"
        border
        :height="table_height"
        @sort-change='sortChange'>
        <el-table-column
          v-for="item in tableColumn"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
          :sortable="item.sortable"
          :min-width="item.width"
          align="center">
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="90">
          <template slot-scope="scope">
            <el-button @click="handleRestart(scope.row)" type="text" size="small"
                       v-if="infoShow.infoResetShow">重试
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
     <!-- 分页组件 -->
    <div style="padding-top: 10px" class="tPaginationContainer">
      <t-pagination
        :total="total"
        :page-size.sync="pageSize"
        v-model="currentPage"
        :pageSizeOption=[5,10,20,50]
        @change="handleCurrentChange"
        @pageSizeChange="handleSizeChange"
        show-jumper
      />
    </div>
    <!-- 重启任务对话框 -->
    <t-dialog
      header="重启任务"
      :visible="restartVisible"
      :closeBtn="true"
      :onCloseBtnClick="()=>{this.restartVisible=false}"
      width="500px">
      <div slot="body" style="word-break: break-all;margin:0 30px 0 40px">
        是否确认重启该情报任务？
      </div>
      <span slot="footer" class="dialog-footer">
        <t-button @click="restartVisible = false" variant="outline">取 消</t-button>
        <t-button @click="restartFun" theme="primary">确 认</t-button>
      </span>
    </t-dialog>
  </div>
</template>

<script>
  // 引入js数据
  import {tableColumn} from "../js/information_data";

  export default {
    name: "CheckTable",
    // 接收父组件传来的参数
    props: {
      tableData: Array,
      total: Number,
      infoShow: Object,
    },
    data() {
      return {
        tableColumn: [
          ...tableColumn
        ],
        tableContainerHeight: {
          height: '100%'
        },
        table_height: 0,
        restartVisible: false,
        rowData: {},
        // 表格当前页码
        currentPage: 1,
        // 每次表格展示多少条信息
        pageSize: 20,
      }
    },
    methods: {
      // 表格排序方法
      sortChange({column, prop, order}) {
        this.$emit('sortChange', {column, prop, order})
      },
      // 表格size改变时触发函数
      handleSizeChange(page_size) {
        this.$emit('handleSizeChange', page_size)
      },
      // 表格当前页码改变时触发函数
      handleCurrentChange(page) {
        this.$emit('handleCurrentChange', page)
      },
      // 重启情报任务按钮
      handleRestart(row) {
        this.rowData = row
        this.restartVisible = true
      },
      // 重启情报任务
      restartFun() {
        this.$emit('restartFun', this.rowData)
        this.restartVisible = false
      },
      // 设置表格的最大高度
      adaptiveTableHeight() {
        this.table_height = document.getElementById('checkTableContainer') === null ? 0 : document.getElementById('checkTableContainer').offsetHeight - 40
      },
    },
    mounted() {
      this.tableContainerHeight.height = `calc(100% - ${document.getElementById('checkTool').offsetHeight - 12}px)`
      this.$nextTick(() => {
        this.adaptiveTableHeight()
      })
      window.addEventListener('resize', this.adaptiveTableHeight, false)
    }
  }
</script>

<style scoped>
  #CheckTable {
    position: relative;
    margin: 5px 20px 10px 20px;
    text-align: left;
  }

  #checkTableContainer {
    position: absolute;
    top: 0;
    bottom: 57px;
    width: 100%;
    height: calc(100% - 57px);
  }

  #checkTableContainer :deep(.t-table-pagination) {
    display: none;
  }

  .tPaginationContainer {
    position: absolute;
    width: 100%;
    bottom: 48px;
    padding-top: 10px;
    height: 42px;
  }

</style>

