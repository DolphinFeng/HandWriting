<template>
  <div id="workComponents" class="component">
    <!-- 面包屑：展示任务管理 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">量产任务中心</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <div class="breadcrumbItem active-breadcrumb-item">作业管理</div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索工具栏组件 -->
    <workTool
        :work_search="work_search"
        :taskTypeOptions="taskTypeOptions"
        :workStatusOptions="workStatusOptions"
        :workNameOptions="workNameOptions"
        :workTagOptions="workTagOptions"
        :workShow="workShow"
        @changeStep="changeStep"
        @changeNum="changeNum"
        @onSearch="onSearch"
        @resetForm="resetForm"
        @handleAssign="handleAssign"
        @clearOrders="clearOrders"
    ></workTool>
    <!-- 主表格信息组件 -->
    <workTable
        :loading="loading"
        :tableData="tableData"
        :total="total"
        :workTableColumn="workTableColumn"
        @sortChange="sortChange"
        @handleSelectionChange="handleSelectionChange"
        @handlePaginationChange="handlePaginationChange"
        @handleAssign="handleAssign"
    ></workTable>
    <!-- 分配任务对话框 -->
    <el-dialog
        title="分配任务"
        v-model="assignVisible"
        :show-close="true"
        @close="()=>{this.assignVisible=false}"
        width="500px">
      <div>
        <el-form :data="assignForm" label-position="right" label-width="100px" ref="form">
          <el-form-item label="作业人员：" name="assignee">
            <el-select
                v-model="assignForm.assignee"
                placeholder="请选择作业人员"
                remote
                :remote-method="getAssignee"
                filterable
                style="width: 300px;">
              <el-option
                  v-for="item in assignee_options"
                  :key="item.userName"
                  :label="item.keyWord"
                  :value="item.userName">
                <div style="display: inline-block">
                  <span>{{ item.realName }}（{{ item.userName }}）</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer class="dialog-footer">
        <el-button @click="assignVisible = false" center>取 消</el-button>
        <el-button type="primary" @click="assignFun">提 交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
// 引入需要的组件
import workTool from "./workTool.vue";
import workTable from "./workTable.vue";
// 引入js数据
import {work_search, workStatusOptions, workTagOptions, workTableColumn, workShow} from "../js/work_data";
import axios from "axios";
import {ArrowRight} from "@element-plus/icons-vue";
import {ElMessage} from "element-plus";

const nioUrl = window.api.apiNioURL;
const nioTaskURL = window.api.nioTaskURL;
if (nioTaskURL === null || nioTaskURL === undefined) {
  console.log("获取nioTaskURL失败" + nioTaskURL)
}

export default {
  name: "workComponents",
  // 组件注册
  components: {
    workTool,
    workTable
  },
  data() {
    return {
      loading: false,
      token: '',
      work_search: {
        ...work_search
      },
      workTableColumn: [
        ...workTableColumn
      ],
      ordersList: [],
      orderBy: [],
      workStatusOptions: workStatusOptions,
      workTagOptions: workTagOptions,
      taskTypeOptions: [],
      workNameOptions: [],
      multipleSelection: [],
      workShow: {
        ...workShow
      },
      // 表格数据
      tableData: [],
      // 表格总条数
      total: 0,
      // 表格当前页码
      currentPage: 1,
      // 每次表格展示多少条信息
      pageSize: 20,
      assignVisible: false,
      assignForm: {
        assignee: '',
      },
      workIdList: [],
      assignee_options: []
    }
  },
  setup() {
    return {ArrowRight}
  },
  methods: {
    // 数字检查函数
    changeNum(val) {
      switch (val) {
        case 1:
          // 数字
          this.work_search.taskId = this.work_search.taskId.replace(/[^\d]/g, '');
          break;
        case 3:
          // 中文、英文、数字、点
          this.work_search.taskOwner = this.work_search.taskOwner.replace(/[^\a-zA-Z0-9.\u4E00-\u9FA5]/g, '');
          break;
        case 4:
          this.work_search.assignee = this.work_search.assignee.replace(/[^\a-zA-Z0-9\u4E00-\u9FA5]/g, '');
      }
    },
    // 筛选查询功能
    onSearch() {
      this.currentPage = 1
      this.loadingPage()
    },
    // 重置tool
    resetForm() {
      this.work_search = {
        ...work_search
      }
    },
    changeStep(value) {
      this.work_search.workKey = ''
      this.workNameOptions = []
      if (value !== '') {
        // 人工作业环节
        axios({
          url: nioTaskURL + '/process/form/' + value,
          method: 'get',
        }).then(response => {
          if (response.data.code === 200) {
            this.workNameOptions = response.data.data
          }
        }).catch(() => {
          ElMessage.error({
            message: '获取作业名称数据集失败',
            showClose: true,
          });
        });
      }
    },
    getAssignee(value) {
      // 获取数据的接口
      this.assignee_options = []
      axios({
        url: nioUrl + '/user/v1/search',
        method: 'post',
        data: {keyword: value},
        headers: {'Authorization': this.token},
      }).then(response => {
        if (response.data.code === 0) {
          for (let i in response.data.data) {
            this.assignee_options.push(
                // 组合userName和realName，以供filter使用
                {...response.data.data[i], keyWord: response.data.data[i].userName + response.data.data[i].realName}
            )
          }
        }
      }).catch(() => {
        ElMessage.error({
          message: '获取作业员数据集失败',
          showClose: true,
        });
      });
    },
    handleAssign(row) {
      this.assignVisible = true;
      this.assignForm.assignee = ''
      this.workIdList = [row.workId];
    },
    // 批量分配作业员
    assignFun() {
      if (this.assignForm.assignee !== '') {
        this.assignVisible = false;
        axios({
          url: nioTaskURL + '/work/dispatch',
          method: 'post',
          data: {
            assignee: this.assignForm.assignee,
            workId: this.workIdList[0],
          }
        }).then(response => {
          if (response.data.code === 200) {
            ElMessage.success({
              message: '作业指派成功',
              showClose: true,
            });
            this.loadingPage();
          }
        }).catch(() => {
          ElMessage.error({
            message: '作业指派失败',
            showClose: true,
          });
        });
      } else {
        ElMessage.warning({
          message: '作业人员的值为空',
          showClose: true,
        });
      }
    },
    // 表格多选函数
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handlePaginationChange(currentPage, pageSize) {
      this.currentPage = currentPage;
      this.pageSize = pageSize;
      this.loadingPage();
    },
    // 获取表格信息功能
    loadingPage() {
      this.loading = true;
      axios({
        url: nioTaskURL + '/work/list',
        method: 'post',
        data: {
          ...this.work_search,
          pageNo: this.currentPage,
          pageSize: this.pageSize,
          orderBy: this.orderBy[0],
        },
      }).then(response => {
        if (response.data.code === 200) {
          this.total = response.data.data.total;
          if (this.total === 0) {
            ElMessage.warning({
              message: '没有符合查询条件的数据',
              showClose: true,
            });
          }
          this.tableData = response.data.data.result;
          for (let i in this.tableData) {
            if (this.tableData.hasOwnProperty(i)) {
              // 整理表格数据中的序号
              this.tableData[i].workNum = parseInt(i) + 1
            }
          }
        } else {
          ElMessage.error({
            message: response.data.msg,
            showClose: true,
          });
        }
      }).catch(() => {
        ElMessage.error({
          message: '没有获取到数据',
          showClose: true,
        });
      }).finally(() => {
        this.loading = false;
      });
    },
    // 表格排序方法
    sortChange: function ({column, prop, order}) {
      // 获取表格中的thead
      let theadList = document.getElementById('w_column').children[0].children[1].children[0].children[1].children[0].children;
      this.orderBy = [];

      // 还原排序原来的样式
      for (let j in theadList) {
        if (0 < j && j < 10) {
          let upDiv = theadList[j].children[0].children[0].children[0];
          let downDiv = theadList[j].children[0].children[0].children[1];
          downDiv.style.borderTopColor = '#C0C4CC';
          upDiv.style.borderBottomColor = '#C0C4CC';
        }
      }

      this.ordersList = [{
        value: prop,
        order: order,
        label: column.label,
      }];
      let row = this.ordersList[0];

      // 设置样式
      for (let j in theadList) {
        if (0 < j && j < 10) {
          if (row.label === theadList[j].children[0].innerText) {
            let upDiv = theadList[j].children[0].children[0].children[0]
            let downDiv = theadList[j].children[0].children[0].children[1];
            if (row.order === 'ascending') {
              // 上箭头
              upDiv.style.borderBottomColor = '#409EFF'
              downDiv.style.borderTopColor = '#C0C4CC'
            } else if (row.order === 'descending') {
              // 下箭头
              downDiv.style.borderTopColor = '#409EFF'
              upDiv.style.borderBottomColor = '#C0C4CC'
            } else {
              this.ordersList = [];
            }
          }
        }
      }
      // 整理orderBy
      if (this.ordersList.length === 0) {
      } else if (row.order === "descending") {
        this.orderBy.push({
          "property": row.value,
          "direction": 0
        });
      } else {
        this.orderBy.push({
          "property": row.value,
          "direction": 1
        });
      }

      this.loadingPage();
    },
    // 清空已有排序表格字段显示
    clearOrders() {
      // 排序列表清空
      this.ordersList = [];
      this.orderBy = [];
      // 还原排序原来的样式
      let theadList = document.getElementById('w_column').children[0].children[1].children[0].children[1].children[0].children;
      for (let j in theadList) {
        if (1 < j && j < 13) {
          let upDiv = theadList[j].children[0].children[0].children[0];
          let downDiv = theadList[j].children[0].children[0].children[1];
          downDiv.style.borderTopColor = '#C0C4CC';
          upDiv.style.borderBottomColor = '#C0C4CC';
        }
      }
      this.loadingPage();
    },
    reShow() {
      this.promission = localStorage.getItem('promission');
      setTimeout(() => {
        this.isShow()
      }, 5)
    },
    isShow() {
      this.workShow = {
        ...workShow
      }
      // 判断是否显示按钮
      if (this.promission && this.promission.length !== 0) {
        if (this.promission.indexOf(73) !== -1) {
          this.workShow.workSearchShow = true
        }
        if (this.promission.indexOf(74) !== -1) {
          this.workShow.workMultipleAssignShow = true
        }
      }
    },
    // 获取所需select选项的数据源
    getData() {
      // 获取流程名称
      axios({
        url: nioTaskURL + '/task-type/list',
        method: 'get',
      }).then(response => {
        if (response.data.code === 200) {
          this.taskTypeOptions = response.data.data
        }
      }).catch(() => {
        ElMessage.error({
          message: '获取任务类型数据集失败',
          showClose: true,
        });
      });
    }
  },
  mounted() {
    // 页面加载时调用函数
    this.token = localStorage.getItem('token'); // 从 localStorage 获取 token
    if (this.token && this.token.length !== 0) {
      this.getData();
      this.loadingPage();
      this.reShow();
    } else {
      console.error('Token is missing or invalid');
      // 可以选择重定向到登录页面或显示错误信息
    }
  }
}
</script>
