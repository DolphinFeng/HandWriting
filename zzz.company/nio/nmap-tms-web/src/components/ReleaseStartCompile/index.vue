<template>
  <!-- 任务管理发起任务：问题列表 -->
  <div id="ReleaseStartCompile">
    <div class="dialog-content">
      <div id="contentTool">
        <div id="title" style="height: 25px">
          <div style="text-align: left;display: inline-block">
            <span style="font-weight: 700;font-size: 18px">问题列表</span>
          </div>
          <div style="float: right;margin:1px 25px 0 0">
            <span>已选择</span>
            <span style="color: #0052D9">+{{selectNumber}}</span>
          </div>
        </div>
        <div class="lineStyle">
          <span style="margin-left: 14px">问题分类</span>
          <el-select v-model="tag_auto" multiple clearable filterable placeholder="请选择问题分类"
                     style="width: 365px" collapse-tags>
            <el-option
              v-for="item in tag_auto_options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="lineStyle">
          <span>问题严重度</span>
          <el-select v-model="severity" clearable placeholder="请选择问题严重度" style="width: 365px">
            <el-option
              v-for="item in severity_options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="lineStyle">
          <span>问题优先级</span>
          <el-select v-model="priority" clearable placeholder="请选择问题优先级" style="width: 365px">
            <el-option
              v-for="item in priority_options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="lineStyle">
          <span style="margin-left: 14px">创建时间</span>
          <el-date-picker
            v-model="dateValue"
            type="daterange"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 365px"
            range-separator="至"
            start-placeholder="创建时间区间开始"
            end-placeholder="创建时间区间结束">
          </el-date-picker>
        </div>
        <el-button class="lineStyle" type="primary" @click="getListForQuickFix">确定</el-button>
        <el-button class="lineStyle" @click="reSet">重置</el-button>
      </div>
      <!-- 问题列表：表格组件 -->
      <div id="dTableContainer" :style="dTableContainerHeight">
        <t-table
          :columns="classify_table"
          :data="tableData"
          :selected-row-keys="selectedRowKeys"
          :rowKey="rowKey"
          @select-change="rehandleSelectChange"
          :height="table_height"
          :hover="true"
          :bordered="true"
          :stripe="false"
          id="dTable"
        >
        </t-table>
        <!-- 问题列表：分页组件 -->
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
      </div>
    </div>
    <div class="dialog-footer" style="border-top: 1px solid #999; height: 80px">
      <el-button @click="lastStep">上一步</el-button>
      <el-button type="primary" @click="nextStep">下一步</el-button>
    </div>
  </div>
</template>

<script>
  // 引入js数据
  import {classify_table, tag_auto_options, severity_options, priority_options} from "../../js/map_data";

  const nioquickFixURL = window.api.apiquickFixURL;
  if (nioquickFixURL === null || nioquickFixURL === undefined) {
    console.log("获取nioquickFixURL失败" + nioquickFixURL)
  }

  const fixURL = window.api.apiFixURL;
  if (fixURL === null || fixURL === undefined) {
    console.log("获取fixURL失败" + fixURL)
  }

  export default {
    name: 'ReleaseStartCompile',
    // 接收父组件传来的参数
    props: {
      startRelaseParams: Object,
      belongOptions: Array
    },
    data() {
      return {
        tag_auto: [],
        tag_auto_options: tag_auto_options,
        severity: '',
        severity_options: severity_options,
        priority: '',
        priority_options: priority_options,
        dTableContainerHeight: {
          height: '100%'
        },
        classify_table: classify_table,
        // 表格数据
        tableData: [],
        // 表格筛选的id、表格筛选的完整数据
        selectedRowKeys: [],
        selectedRowData: [],
        // 已选择问题数据的个数
        selectNumber: 0,
        rowKey: 'id',
        table_height: 0,
        // 表格当前页码
        currentPage: 1,
        // 每次表格展示多少条信息
        pageSize: 10,
        // 表格总条数
        total: 0,
        // 时间选择器绑定的数据
        dateValue: '',
        insertTimeBegin: '',
        insertTimeEnd: '',
      };
    },
    computed: {},
    mounted() {
      // 整个table组件和分页组件的高度
      this.dTableContainerHeight.height = `calc(100% - ${document.getElementById('contentTool').offsetHeight + 20}px)`
      this.adaptiveTableHeight()
      this.$nextTick(() => {
        this.adaptiveTableHeight()
      })
      window.addEventListener('resize', this.adaptiveTableHeight, false)
      this.getListForQuickFix()
    },
    methods: {
      //表格多选
      rehandleSelectChange(selectedRowKeys, {selectedRowData}) {
        this.selectedRowKeys = selectedRowKeys;
        this.selectedRowData = selectedRowData;
        this.selectNumber = selectedRowKeys.length
      },
      // 设置表格的最大高度
      adaptiveTableHeight() {
        // 表格内容的流体高度
        this.table_height = document.getElementById('dTable') === null ? 0 : document.getElementById('dTable').offsetHeight - 35
      },
      // 表格size改变时触发函数
      handleSizeChange(page_size) {
        this.pageSize = page_size;
        this.getListForQuickFix()
      },
      // 表格当前页码改变时触发函数
      handleCurrentChange(page) {
        this.currentPage = page.current;
        this.getListForQuickFix()
      },
      // 下一步按钮方法
      nextStep() {
        const options = {
          ...this.startRelaseParams,
          selectedRowKeys: this.selectedRowKeys,
          selectedRowData: this.selectedRowData,
        };
        this.$emit('nextStep', options);
      },
      // 上一步按钮方法
      lastStep() {
        this.$emit('lastStep');
      },
      // 获取问题列表数据
      getListForQuickFix() {
        this.dateValue = this.dateValue === null ? '' : this.dateValue;
        if (this.dateValue.length !== 0) {
          this.insertTimeBegin = this.dateValue[0]
          this.insertTimeEnd = this.dateValue[1]
        } else {
          this.insertTimeBegin = ''
          this.insertTimeEnd = ''
        }
        this.$axios({
          url: fixURL + '/quickfix/query/by/condition',
          method: 'post',
          data: {
            page: this.currentPage,
            rows: this.pageSize,
            tagAuto: this.tag_auto.join(','),
            severity: this.severity,
            priority: this.priority,
            productName: this.startRelaseParams.product_name,
            productVersion: this.startRelaseParams.product_version,
            insertTimeBegin: this.insertTimeBegin,
            insertTimeEnd: this.insertTimeEnd
          }
        }).then(response => {
          if (response.data.code === 0) {
            this.total = response.data.data.total
            this.tableData = response.data.data.list
            if (this.total === 0) {
              this.$message({
                type: 'warning',
                message: '没有符合查询条件的数据',
                showClose: true,
              });
            }
            // 字段的值整理成文字显示
            for (let i in this.tableData) {
              for (let j in this.belongOptions) {
                if (this.tableData[i].source === this.belongOptions[j].code) {
                  this.tableData[i].source_name = this.belongOptions[j].name
                }
              }
              for (let j in this.tag_auto_options) {
                if (this.tableData[i].tag_auto === this.tag_auto_options[j].value) {
                  this.tableData[i].tag_auto_name = this.tag_auto_options[j].label
                }
              }
            }
          }
        }).catch(() => {
          this.$message({
            type: 'error',
            message: '获取问题数据失败',
            showClose: true,
          });
        });
      },
      // 重置功能
      reSet() {
        this.tag_auto = []
        this.severity = ''
        this.priority = ''
        this.dateValue = ''
      }
    },
  };
</script>

<style scoped>
  #ReleaseStartCompile {
    height: 100%;
  }

  .dialog-content {
    height: calc(100% - 101px);
    overflow: hidden;
    position: absolute;
    text-align: center;
    background-color: white;
    color: black;
    width: calc(100% - 40px);
    margin: 10px 20px 10px 20px;
  }

  .dialog-footer {
    border-top: 1px solid rgb(153, 153, 153);
    height: 60px;
    position: absolute;
    width: 100%;
    bottom: 0;
    background: #fff;
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #contentTool {
    padding: 10px 0 1px 20px;
    text-align: left;
    color: black;
    font-size: 15px;
  }

  #dTableContainer {
    position: relative;
    margin: 10px 20px 10px 20px;
    text-align: center;
  }

  /*单表格的格式*/
  #dTable {
    position: absolute;
    top: 0;
    width: 100%;
    /*总高度减去分页器高度*/
    height: calc(100% - 50px) !important;
  }

  #dTable :deep(.t-table-pagination) {
    display: none;
  }

  .tPaginationContainer {
    position: absolute;
    width: 80%;
    bottom: 5px;
    padding-top: 1px;
    height: 42px;
    text-align: center;
  }

  .lineStyle {
    display: inline-block;
    margin-top: 3px;
  }

</style>
