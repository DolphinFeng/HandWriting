<template>
  <div id="TaskComponent" class="component">
    <!-- 面包屑：展示任务管理 -->
    <el-breadcrumb class="breadcrumb" :separator-icon="ArrowRight">
      <el-breadcrumb-item>
        <div class="breadcrumbItem">量产任务中心</div>
      </el-breadcrumb-item>
      <el-breadcrumb-item @click="backTaskPage">
        <div
          @click="changeBreadcrumb(1)"
          :class="{ 'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 1 }"
          class="breadcrumbItem"
        >
          任务管理
        </div>
      </el-breadcrumb-item>
      <el-breadcrumb-item v-if="breadcrumbTasksShow">
        <div
          @click="changeBreadcrumb(2)"
          :class="{ 'active-breadcrumb-item': $store.state.activeBreadcrumbIndex === 2 }"
          class="breadcrumbItem"
        >
          任务详情
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索工具栏组件 -->
    <TaskSearch
      v-if="!breadcrumbTasksShow"
      :task_search="task_search"
      :taskTypeOptions="taskTypeOptions"
      :priorityOptions="priorityOptions"
      :statusOptions="statusOptions"
      :pmsShow="pmsShow"
      @changeNum="changeNum"
      @createButton="createButton"
      @cancelButton="cancelButton"
      @onSearch="onSearch"
      @resetForm="resetForm"
      @clearOrders="clearOrders"
    ></TaskSearch>
    <!-- 主表格信息组件 -->
    <TaskTable
      v-if="!breadcrumbTasksShow"
      :tableData="tableData"
      :total="total"
      :loading="loading"
      :taskTableColumn="taskTableColumn"
      :pmsShow="pmsShow"
      :taskTypeOptions="taskTypeOptions"
      :formProperty="formProperty"
      :editShow="editShow"
      :LineShow="LineShow"
      @createButton="createButton"
      @handleDetail="handleDetail"
      @sortChange="sortChange"
      @handleSelectionChange="handleSelectionChange"
      @handleUpdate="handleUpdate"
      @handleAssign="handleAssign"
      @handlePaginationChange="handlePaginationChange"
      @loadingPage="loadingPage"
      @dynamicForm="dynamicForm"
    ></TaskTable>
    <!-- 任务详情页面 -->
    <TaskDetail
      v-if="breadcrumbTasksShow"
      :taskId="taskId"
      :procDefKey="procDefKey"
      :procInstId="procInstId"
      :createForm="createForm"
      :taskTypeOptions="taskTypeOptions"
      :formProperty="formProperty"
      :variablesTable="variablesTable"
      :activeName="activeName"
      :editShow="editShow"
      :LineShow="LineShow"
      :routeProjectId="routeProjectId"
      @dynamicForm="dynamicForm"
      @backTaskPage="backTaskPage"
      @loadingPage="loadingPage"
    ></TaskDetail>
    <!-- 创建任务对话框 -->
    <el-dialog title="创建任务" v-model="createVisible" show-close width="1000px" @close="closeCreate">
      <el-scrollbar
        max-height="calc(85vh - 230px)"
        v-loading="uploadLoading"
        element-loading-text="拼命加载中..."
        :element-loading-spinner="svg"
        element-loading-svg-view-box="-10, -10, 50, 50"
      >
        <nio-dynamic-form ref="dynamicFormRef" :init-form="initForm">
          <template #field>
            <el-form-item label="任 务 ID：" v-if="!LineShow.value">
              <el-input v-model.trim="createForm.id" style="width: 200px" disabled></el-input>
            </el-form-item>
            <el-form-item label="任务名称：">
              <el-input
                v-model.trim="createForm.name"
                placeholder="任务名称(必填)"
                style="width: 582px"
                clearable
                v-if="editShow.value"
              ></el-input>
            </el-form-item>
            <el-form-item label="任务备注：">
              <el-input
                v-model.trim="createForm.remark"
                placeholder="任务备注"
                style="width: 582px"
                clearable
                v-if="editShow.value"
              ></el-input>
            </el-form-item>
            <el-form-item label="任务类型：">
              <el-select
                v-model="createForm.type"
                style="width: 200px"
                placeholder="任务类型(必填)"
                clearable
                @change="changeDynamicForm(createForm.type)"
              >
                <el-option
                  v-for="item in taskTypeForCreateOptions"
                  :key="item.code"
                  :label="item.name"
                  :value="item.code"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="优 先 级：">
              <el-select v-model="createForm.priority" style="width: 200px" placeholder="任务优先级(必填)" filterable>
                <el-option v-for="item in priorityOptions" :key="item.code" :label="item.name" :value="item.code">
                </el-option>
              </el-select>
            </el-form-item>
          </template>
        </nio-dynamic-form>
      </el-scrollbar>
      <template #footer>
        <el-button :disabled="uploadLoading" @click="closeCreate" center>取 消</el-button>
        <el-button :disabled="uploadLoading" type="primary" @click="createFun('create', '创建')">创建</el-button>
        <el-button :disabled="uploadLoading" type="success" @click="createFun('create-and-start', '创建并启动')">
          创建并启动
        </el-button>
      </template>
    </el-dialog>
    <!-- 取消任务对话框 -->
    <el-dialog
      title="取消任务"
      v-model="cancelVisible"
      show-close
      @close="
        () => {
          this.cancelVisible = false;
        }
      "
      width="480px"
    >
      <div style="word-break: break-all; margin-bottom: 15px">
        <div>确认取消任务吗?</div>
        <div>已选择任务号：{{ this.idStr }}</div>
      </div>
      <template #footer class="dialog-footer">
        <el-button @click="cancelVisible = false">取 消</el-button>
        <el-button type="primary" @click="cancelFun">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
// 引入需要的组件
import TaskSearch from './TaskSearch.vue';
import TaskTable from './TaskTable.vue';
import DynamicForm from './DynamicForm.vue';
import TaskDetail from './TaskDetail.vue';
import {
  createForm,
  priorityOptions,
  statusOptions,
  task_search,
  taskShow,
  taskTableColumn,
  updateForm,
} from '../js/task_data';
import axios from 'axios';
import { ArrowRight } from '@element-plus/icons-vue';
import { reactive, watch } from 'vue';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';
import NioDynamicForm from '@/components/DynamicForm/NioDynamicForm.vue';
import { svg } from '@/js/loading_data.js';
import store from '../store/index.js';

const nioTaskURL = window.api.nioTaskURL;
const nioStorageServiceURL = window.api.nioStorageServiceURL;
if (nioTaskURL === null || nioTaskURL === undefined) {
  console.log('获取nioTaskURL失败' + nioTaskURL);
}

export default {
  name: 'TaskComponent',
  // 组件注册
  components: {
    NioDynamicForm,
    TaskSearch,
    TaskTable,
    DynamicForm,
    TaskDetail,
  },
  data() {
    return {
      initForm: {},
      //动态表单拼接地址
      // 任务详情用到的参数
      breadcrumbTasksShow: false,
      taskId: 0,
      procDefKey: '',
      procInstId: '',
      variablesTable: [],
      activeName: {
        value: 'first',
      },
      // 任务管理查询表单
      task_search: {
        ...task_search,
      },
      // 任务信息查询表格
      taskTableColumn: [...taskTableColumn],
      // 排序列表
      ordersList: [],
      orderBy: [],
      // 优先级数据集
      priorityOptions: priorityOptions,
      // 任务状态数据集
      statusOptions: statusOptions,
      // 任务类型数据集
      taskTypeOptions: [],
      taskTypeForCreateOptions: [],
      multipleSelection: [],
      idStr: '',
      idList: [],
      createVisible: false,
      cancelVisible: false,
      updateVisible: false,
      assignVisible: false,
      uploadLoading: false,
      // 权限控制
      pmsShow: {
        ...taskShow,
      },
      // 创建任务表单
      createForm: {
        ...createForm,
      },
      cList: [],
      // 编辑表单
      updateForm: {
        ...updateForm,
      },
      // 分配表单
      assignForm: {
        assignee: '',
      },
      workId: '',
      // 表格数据
      tableData: [],
      loading: false,
      // 表格总条数
      total: 0,
      // 表格当前页码
      currentPage: 1,
      // 每次表格展示多少条信息
      pageSize: 20,
      // 存储动态显示表单数据
      formProperty: [],
      editShow: {
        value: true,
      },
      LineShow: {
        value: true,
      },
      svg: svg,
      //路由转跳参数
      routeTaskId: '',
      routeProjectId:'',
      cancel: null
    };
  },

  setup() {
    const store = useStore();
    const breadcrumbActive = reactive({
      manage: true,
      detail: false,
    });
    //切换面包屑
    const changeBreadcrumb = (index) => {
      store.commit('breadChange', index);
    };

    return {
      ArrowRight,
      breadcrumbActive,
      changeBreadcrumb,
    };
  },
  watch: {
    $route: {
      handler: 'handleQuery',
    },
  },
  methods: {
    //返回任务管理
    backTaskPage() {
      this.breadcrumbTasksShow = false;
      this.formProperty = [];
    },
    // 详情按钮
    handleDetail(row) {
      this.taskId = row.id;
      this.loadDetail();
    },
    handleQuery(route) {
      if (route.query.taskId && !isNaN(route.query.taskId)) {
        this.taskId = parseInt(route.query.taskId);
        this.loadDetail();
        store.commit('breadChange', 2);
        return true;
      }
      return false;
    },
    loadDetail() {
      if (this.taskId <= 0) {
        return;
      }
      axios({
        url: nioTaskURL + '/task/detail/' + this.taskId,
        method: 'get',
      })
        .then((response) => {
          if (response.data.code === 200) {
            const data = response.data.data;
            this.createForm['id'] = data.id;
            this.createForm['name'] = data.name;
            this.createForm['type'] = data.type;
            this.createForm['priority'] = data.priority;
            this.createForm['owner'] = data.owner;
            this.createForm['input'] = data.input;
            this.createForm['status'] = data.status;
            this.createForm['remark'] = data.remark;
            this.variablesTable = data.variables;
            this.procDefKey = data.procDefKey;
            this.procInstId = data.procInstId;
            const formData = new Map();
            for (let i in data.input) {
              formData.set(data.input[i].name, data.input[i].value);
            }
            this.openDetail(formData);
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: false,
              grouping: true,
            });
          }
        })
        .catch(() => {
          ElMessage.error({
            message: '获取详情失败',
            showClose: false,
            grouping: true,
          });
        });
    },
    openDetail(formData) {
      this.breadcrumbTasksShow = true;
      if (this.routeTaskId !== undefined) {
        this.activeName.value = 'second';
      } else {
        // 初始化默认显示第一个标签
        this.activeName.value = 'first';
      }

      // form是否可编辑
      this.editShow.value = this.createForm.status === 1;
      // 产线不可编辑
      this.LineShow.value = false;
    },
    changeDynamicForm(value, initForm = {}) {
      this.initForm = initForm;
      this.$refs.dynamicFormRef?.changeURL(`${nioTaskURL}/task/form?code=${value}`);
    },
    // 动态form表单数据获取
    dynamicForm(value, formData) {
      this.formProperty = [];
      // 有数据时触发
      if (value !== '' && value !== undefined) {
        axios({
          url: nioTaskURL + '/task-type/form-property/fetch/' + value,
          method: 'get',
        })
          .then((response) => {
            if (response.data.code === 200) {
              // 数据整理分配
              for (let i in response.data.data) {
                let formValue = response.data.data[i].value;
                if (formData) {
                  formValue = formData.get(response.data.data[i].id);
                }
                if (response.data.data[i].type === 'boolean') {
                  formValue = parseInt(formValue);
                }
                this.formProperty.push({
                  ...response.data.data[i],
                  formValue: formValue,
                });
              }
            }
          })
          .catch(() => {
            ElMessage.error({
              message: '产线对应的创建字段获取失败',
              showClose: false,
              grouping: true,
            });
          });
      }
    },
    // 数字检查函数
    changeNum(val) {
      switch (val) {
        case 1:
          //中文、英文、数字
          this.task_search.id = this.task_search.id.replace(/[^\d]/g, '');
          break;
        case 2:
          // 数字
          this.task_search.name = this.task_search.name.replace(/[^\a-zA-Z0-9\u4E00-\u9FA5]/g, '');
          break;
        case 3:
          this.task_search.owner = this.task_search.owner.replace(/[^\a-zA-Z0-9\u4E00-\u9FA5]/g, '');
          break;
        case 4:
          this.task_search.parentId = this.task_search.parentId.replace(/[^\d-]/g, '');
      }
    },
    // 筛选查询功能
    onSearch() {
      this.currentPage = 1;
      this.loadingPage();
    },
    // 重置tool
    resetForm() {
      this.task_search = {
        ...task_search,
      };
    },
    // 创建任务按钮
    createButton(taskId) {
      if (taskId) {
        axios({
          url: nioTaskURL + '/task/detail/' + taskId,
          method: 'get',
        })
          .then((response) => {
            if (response.data.code === 200) {
              const data = response.data.data;
              this.createForm['name'] = data.name + '-copy-' + taskId;
              this.createForm['priority'] = data.priority;
              this.createForm['type'] = data.type;
              this.createForm['remark'] = data.remark;
              const formData = {};
              for (let i in data.input) {
                formData[data.input[i].name] = data.input[i].value;
              }
              this.changeDynamicForm(data.type, formData);
            }
          })
          .catch(() => {
            ElMessage.error({
              message: '获取详情失败',
              showClose: false,
              grouping: true,
            });
          });
      } else {
        this.createForm = {
          ...createForm,
        };
        this.createForm.priority = 3;
      }
      this.createVisible = true;
      // 表单可编辑
      this.editShow.value = true;
      // 产线可选
      this.LineShow.value = true;
    },
    // 关闭创建任务dialog
    closeCreate() {
      // 重置
      this.formProperty = [];
      this.createVisible = false;
      this.$refs.dynamicFormRef.clearForm();
    },
    // 创建任务并启动函数
    createFun(urlKey, value) {
      if (!this.$refs.dynamicFormRef) {
        return;
      }
      let dynamicForm = this.$refs.dynamicFormRef;
      if (this.createForm.priority === '' || this.createForm.type === '' || this.createForm.name === '') {
        ElMessage.warning({
          message: '有必填项未填',
          showClose: false,
          grouping: true,
        });
        return;
      }
      dynamicForm.validate((isValid) => {
        if (isValid) {
          this.uploadLoading = true;
          dynamicForm
            .uploadFiles()
            .then((res) => {
              this.createForm.input = dynamicForm.form;
              //将数组类型的值改为用逗号分割
              for (let key in this.createForm.input) {
                let val = this.createForm.input[key];
                if (Array.isArray(val)) {
                  this.createForm.input[key] = val.join(',');
                }
              }
              // 从 localStorage 获取 realName
              this.createForm.owner = localStorage.getItem('realName');
              return axios({
                url: nioTaskURL + '/task/' + urlKey,
                method: 'post',
                data: this.createForm,
              }).then((response) => {
                if (response.data.code === 200) {
                  this.createVisible = false;
                  this.formProperty = [];
                  ElMessage.success({
                    message: '任务id：' + response.data.data + value + '成功',
                    showClose: false,
                    grouping: true,
                  });
                  this.loadingPage();
                  dynamicForm.clearForm();
                } else {
                  throw new Error(response.data.msg);
                }
              });
            })
            .catch((err) => {
              ElMessage.error({
                message: '创建失败：' + err.message,
                showClose: false,
                grouping: true,
              });
            })
            .finally(() => {
              this.uploadLoading = false;
            });
        }
      });
    },
    // 取消任务按钮
    cancelButton() {
      if (this.multipleSelection.length === 0) {
        ElMessage.warning({
          message: '没有选择数据',
          showClose: false,
          grouping: true,
        });
      } else {
        this.idStr = '';
        this.idList = [];
        for (let i in this.multipleSelection) {
          this.idList.push(this.multipleSelection[i].id);
        }
        this.idStr = this.idList.join(',');
        this.cancelVisible = true;
      }
    },
    // 取消任务函数
    cancelFun() {
      this.cancelVisible = false;
      axios({
        url: nioTaskURL + '/task/cancel',
        method: 'post',
        data: {
          idList: this.idList,
        },
      })
        .then((response) => {
          if (response.data.code === 200) {
            ElMessage.success({
              message: '取消成功',
              showClose: false,
              grouping: true,
            });
            this.loadingPage();
          }
        })
        .catch(() => {
          ElMessage.success({
            message: '取消失败',
            showClose: false,
            grouping: true,
          });
        });
    },
    // 编辑任务按钮
    handleUpdate(row) {
      this.updateVisible = false;
      this.updateForm = {
        ...updateForm,
      };
      if (row.statusCode === 1) {
        this.updateVisible = true;
        for (let i in row) {
          if (row.hasOwnProperty(i)) {
            for (let j in this.updateForm) {
              if (i === j) {
                this.updateForm[j] = row[i];
              }
            }
          }
        }
      } else {
        ElMessage.warning({
          message: '该状态的任务不可编辑',
          showClose: false,
          grouping: true,
        });
      }
    },
    // 编辑任务函数
    updateFun() {
      this.updateVisible = false;
      axios({
        url: nioTaskURL + '/task/update',
        method: 'post',
        data: this.updateForm,
      })
        .then((response) => {
          if (response.data.code === 200) {
            ElMessage.success({
              message: '编辑成功',
              showClose: false,
              grouping: true,
            });
            this.loadingPage();
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: false,
              grouping: true,
            });
          }
        })
        .catch(() => {
          ElMessage.error({
            message: '编辑失败',
            showClose: false,
            grouping: true,
          });
        });
    },
    // 分配操作员按钮
    handleAssign(row) {
      this.assignForm.assignee = '';
      this.workId = '';
      if (row.unassignedWorkId === null) {
        ElMessage.warning({
          message: '任务' + row.id + '当前不可以分配操作员',
          showClose: false,
          grouping: true,
        });
      } else {
        this.workId = row.unassignedWorkId;
        this.assignVisible = true;
      }
    },
    // 分配操作员函数
    assignFun() {
      if (this.assignForm.assignee !== '') {
        this.assignVisible = false;
        axios({
          url: nioTaskURL + '/work/dispatch/' + this.workId,
          method: 'post',
          data: {
            assignee: this.assignForm.assignee,
          },
        })
          .then((response) => {
            if (response.data.code === 200) {
              ElMessage.success({
                message: '作业指派成功',
                showClose: false,
                grouping: true,
              });
              this.loadingPage();
            }
          })
          .catch(() => {
            ElMessage.error({
              message: '作业指派失败',
              showClose: false,
              grouping: true,
            });
          });
      } else {
        ElMessage.warning({
          message: '操作员id为空',
          showClose: false,
          grouping: true,
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
      if (this.cancel) {  
        this.cancel('Operation canceled by the user.'); // 如果有之前的取消函数，则调用它
        this.cancel = null
      }
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      this.cancel = source.cancel;

      this.loading = true;
      axios({
        url: nioTaskURL + '/task/query',
        method: 'post',
        data: {
          ...this.task_search,
          pageNo: this.currentPage,
          pageSize: this.pageSize,
          orderBy: this.orderBy[0],
        },
        cancelToken: source.token,
      })
        .then((response) => {
          if (response.data.code === 200) {
            this.total = response.data.data.total;
            if (this.total === 0) {
              ElMessage.warning({
                message: '没有符合查询条件的数据',
                showClose: false,
                grouping: true,
              });
            }
            this.tableData = response.data.data.result;
            for (let i in this.tableData) {
              if (this.tableData.hasOwnProperty(i)) {
                // 整理表格数据中的序号
                this.tableData[i].pmsNum = parseInt(i) + 1;
              }
            }
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: false,
              grouping: true,
            });
          }
        })
        .catch((error) => {
          if (axios.isCancel(error)) {
            console.log('Request canceled', error.message);
          } else {
            ElMessage.error({
              message: '没有获取到数据',
              showClose: false,
              grouping: true,
            });
          }        
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 表格排序方法
    sortChange: function ({ column, prop, order }) {
      // 获取表格中的thead
      let theadList =
        document.getElementById('p_column').children[0].children[1].children[0].children[1].children[0].children;
      this.orderBy = [];

      // 还原排序原来的样式
      for (let j in theadList) {
        if (1 < j && j < 12) {
          let upDiv = theadList[j].children[0].children[0].children[0];
          let downDiv = theadList[j].children[0].children[0].children[1];
          downDiv.style.borderTopColor = '#C0C4CC';
          upDiv.style.borderBottomColor = '#C0C4CC';
        }
      }

      this.ordersList = [
        {
          value: prop,
          order: order,
          label: column.label,
        },
      ];
      let row = this.ordersList[0];

      // 设置样式
      for (let j in theadList) {
        if (1 < j && j < 12) {
          if (row.label === theadList[j].children[0].innerText) {
            let upDiv = theadList[j].children[0].children[0].children[0];
            let downDiv = theadList[j].children[0].children[0].children[1];
            if (row.order === 'ascending') {
              // 上箭头
              upDiv.style.borderBottomColor = '#409EFF';
              downDiv.style.borderTopColor = '#C0C4CC';
            } else if (row.order === 'descending') {
              // 下箭头
              downDiv.style.borderTopColor = '#409EFF';
              upDiv.style.borderBottomColor = '#C0C4CC';
            } else {
              this.ordersList = [];
            }
          }
        }
      }
      // 整理orderBy
      if (this.ordersList.length === 0) {
      } else if (row.order === 'descending') {
        this.orderBy.push({
          property: row.value,
          direction: 0,
        });
      } else {
        this.orderBy.push({
          property: row.value,
          direction: 1,
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
      let theadList =
        document.getElementById('p_column').children[0].children[1].children[0].children[1].children[0].children;
      for (let j in theadList) {
        if (1 < j && j < 12) {
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
        this.isShow();
      }, 5);
    },
    isShow() {
      this.pmsShow = {
        ...taskShow,
      };
      // 确保 promission 被正确初始化
      if (!this.promission) {
        this.promission = [];
      }
      // 判断是否显示按钮
      if (this.promission.length !== 0) {
        if (this.promission.indexOf(57) !== -1) {
          this.pmsShow.pmsSearchShow = true;
        }
        if (this.promission.indexOf(58) !== -1) {
          this.pmsShow.pmsCreateShow = true;
        }
        if (this.promission.indexOf(59) !== -1) {
          this.pmsShow.pmsCancelShow = true;
        }
        if (this.promission.indexOf(60) !== -1) {
          this.pmsShow.pmsMultipleEditShow = true;
        }
        if (this.promission.indexOf(61) !== -1) {
          this.pmsShow.pmsMultipleAssignShow = true;
        }
        if (this.promission.indexOf(62) !== -1) {
          this.pmsShow.pmsHistoryShow = true;
        }
        if (this.promission.indexOf(63) !== -1) {
          this.pmsShow.pmsSingleEditShow = true;
        }
        if (this.promission.indexOf(64) !== -1) {
          this.pmsShow.pmsSingleAssignShow = true;
        }
        if (this.promission.indexOf(75) !== -1) {
          this.pmsShow.pmsStartShow = true;
        }
      }
    },
    // 获取所需select选项的数据源
    getData() {
      // 获取流程名称
      axios({
        url: nioTaskURL + '/task-type/list',
        method: 'get',
      })
        .then((response) => {
          if (response.data.code === 200) {
            this.taskTypeOptions = response.data.data;
            for (const idx in this.taskTypeOptions) {
              if (this.taskTypeOptions[idx].manualCreate === 1) {
                this.taskTypeForCreateOptions.push(this.taskTypeOptions[idx]);
              }
            }
          }
        })
        .catch(() => {
          ElMessage.error({
            message: '获取任务类型数据集失败',
            showClose: false,
            grouping: true,
          });
        });
    },
  },

  mounted() {
    this.handleQuery(this.$route);

    // 页面加载时调用函数
    this.getData();
    this.loadingPage();
    this.reShow();

    this.routeTaskId = this.$route['query'].taskId;
    this.routeProjectId = this.$route['query'].projectId;
  },
};
</script>
<style scoped>
:deep(.el-button.is-link) {
  padding: 0;
}
</style>
