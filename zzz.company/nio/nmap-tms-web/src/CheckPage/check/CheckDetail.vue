<template>
  <!-- 套餐详情组件 -->
  <div id="CheckDetail">
    <el-tabs type="border-card" v-model="activeTab" class="detail-panel" @tab-change="handleTab">
      <!-- 套餐详情 -->
      <el-tab-pane label="套餐详情" name="detail" class="detail-tab">
        <div id="detailStyle">
          <el-form :model="detailForm" inline ref="detailForm" labelAlign="right" id="formId" @submit.prevent="handleSearch">
            <el-form-item label="套餐编号：" name="taskId">
              <el-input disabled v-model="detailForm.suiteId" placeholder="请输入套餐编号" style="width: 240px"
                clearable></el-input>
            </el-form-item>
            <el-form-item label="套餐名称：" name="dataTypeName">
              <el-input disabled v-model="detailForm.suiteName" placeholder="请输入套餐名称" style="width: 240px"
                clearable></el-input>
            </el-form-item>
            <div></div>
            <el-form-item label="规则编号：">
              <el-input v-model="detailForm.ruleCode" placeholder="请输入规则编号" style="width: 240px" clearable></el-input>
            </el-form-item>
            <el-form-item>
              <el-button :icon="Search" type="primary" native-type="submit" class="button_style">查询</el-button>
              <el-button :icon="Refresh" @click="handleRefresh" class="button_style">重置</el-button>
              <el-button :icon="FolderAdd" type="success" @click="handleAdd" class="button_style">添加</el-button>
              <el-button :icon="Delete" type="danger" @click="handleDelete" class="button_style">移除</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div id="ChildrenContainer" style="flex: 1;margin-top: 10px;">
          <el-table :data="dataChildren" border :max-height="tableHeight" @selection-change="handleSelectionChange"
            ref="multipleTable">
            <el-table-column type="selection" align="center" width="55"></el-table-column>
            <el-table-column prop="ruleCode" key="ruleCode" label="规则编号" min-width="110" align="center">
              <template #default="{ row }">
                <a :id="[rulesComponent === true ? '' : 'active']" @click="!rulesComponent && linkRule(row.ruleCode) ">
                  {{ row.ruleCode }}
                </a>
              </template>
            </el-table-column>
            <el-table-column prop="ruleName" key="ruleName" label="规则名称" min-width="150" align="center"></el-table-column>
            <el-table-column prop="errCode" key="errCode" label="错误编码" min-width="100" align="center"></el-table-column>
            <el-table-column prop="errDesc" key="errDesc" label="错误描述" min-width="150" align="center"></el-table-column>
            <el-table-column prop="targetTable" key="targetTable" label="套餐详情" min-width="150"
              align="center"></el-table-column>
          </el-table>
        </div>
        <div style="padding-top: 10px" class="pagination-container">
          <el-pagination background :total="total" :page-size="detailForm.pageSize" v-model="detailForm.pageNo"
            :page-sizes="[5, 10, 20, 50]" @current-change="handleCurrentChild" @size-change="handleSizeChild"
            layout="total,sizes,prev,pager,next,jumper"></el-pagination>
        </div>
      </el-tab-pane>
      <!-- 变更历史 -->
      <el-tab-pane label="变更历史" name="history" class="detail-tab">
        <div id="historyContainer" style="flex: 1;">
          <el-table :data="dataHistoryChildren" border :max-height="tableHeightHistory">
            <el-table-column prop="opContent" key="opContent" label="变更内容" min-width="" align="center">
              <template #default="{ row }">
                <el-link type="primary" :underline="false" style="font-weight: normal;font-size: 13px;"
                  @click="showJson(row['opContent'])">查看变更内容</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="opUserName" key="opUserName" label="操作人" min-width="" align="center"></el-table-column>
            <el-table-column prop="opMsg" key="opMsg" label="操作备注" min-width="180" align="center"></el-table-column>
            <el-table-column prop="opTime" key="opTime" label="操作时间" min-width="180" align="center"></el-table-column>
          </el-table>
        </div>
        <div style="padding-top: 10px" class="pagination-container">
          <el-pagination background :total="totalHistory" :page-size="pageSizeHistory" v-model="currentPageHistory"
            :page-sizes="[5, 10, 20, 50]" @current-change="handleCurrentHistory" @size-change="handleSizeHistory"
            layout="total,sizes,prev,pager,next,jumper"></el-pagination>
        </div>
      </el-tab-pane>
    </el-tabs>
    <!-- 针对套餐中规则的对话框：可进行增删改操作 -->
    <el-dialog title="添加" :header="header" v-model="addVisible" @close="() => { this.addVisible = false }" width="600px">
      <div style="word-break: break-all;margin-bottom: 15px">
        <el-form :model="addForm" label-width="100px" label-position="right" ref="addForm" :colon="true" :rules="rules">
          <el-form-item label="套餐id">
            <el-input v-model="detailForm.suiteId" placeholder="套餐id" disabled></el-input>
          </el-form-item>
          <el-form-item label="检查项编号" prop="ruleCodes">
            <el-input v-model="addForm.ruleCodes" v-if="is_add" type="textarea" :rows="5"
              placeholder="请输入检查项编号"></el-input>
            <el-input disabled v-model="ruleCodeString" v-else type="textarea" :rows="5"
              placeholder="请输入检查项编号"></el-input>
          </el-form-item>
          <el-form-item label="备注" prop="opMsg">
            <el-input v-model="addForm.opMsg" placeholder="请输入备注内容">
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <!-- 添加规则确认按钮 -->
        <el-button @click="addFun" v-if="is_add" type="primary">确 定</el-button>
        <!-- 移除规则确认按钮 -->
        <el-button @click="deleteFun" v-else type="primary">移 除</el-button>
      </template>
    </el-dialog>
    <!-- JSON查看 -->
    <JsonView title="变更内容" v-model:visible="jsonVisible" :data="jsonData"></JsonView>
  </div>
</template>

<script>
// 引入js数据
import { columnsChildren, columnsHistoryChildren } from "../../js/check_data";
import axios from "axios";
import { ElMessage } from "element-plus";
import { Search, Refresh, FolderAdd, Delete, Edit, Aim } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import JsonView from "../../jsonView/JsonView.vue";

const nioCheckURL = window.api.nioCheckURL;

export default {
  name: "CheckDetail",
  components: { JsonView },
  // 接收父组件传来的参数
  props: {
    detailForm: Object,
    dataChildren: Array,
    is_create: Boolean,
    total: Number,
    rulesComponent: Boolean
  },
  data() {
    return {
      activeTab: "detail",
      activeName: 'detail',
      // 规则列表表格的最大高度
      tableHeight: 0,
      // 规则列表表格表头信息
      columnsChildren: [
        ...columnsChildren
      ],
      // 每次表格展示多少条信息
      pageSize: 20,
      // 表格当前页码
      currentPage: 1,
      // 变更历史表格的最大高度
      tableHeightHistory: 0,
      // 变更历史表格表头信息
      columnsHistoryChildren: [
        ...columnsHistoryChildren
      ],
      // 变更历史表格数据
      dataHistoryChildren: [],
      totalHistory: 0,
      pageSizeHistory: 20,
      currentPageHistory: 1,
      // 控制对话框弹出或隐藏
      addVisible: false,
      // 对话框的标题
      header: '添加检查规则',
      // 对话框按钮控制。true：添加规则；false：移除规则
      is_add: false,
      // 对话框form表单
      addForm: {
        ruleCodes: '',
        opMsg: '',
      },
      // 表格多选操作的数据列表
      multipleSelection: [],
      // 规则编号数据
      ruleCodeString: '',
      // 设置表单的填写规则
      rules: {
        ruleCodes: [
          { required: true, message: '规则编号必填', trigger: 'blur' },
        ],
        opMsg: [
          { required: true, message: '备注内容必填', trigger: 'blur' },
        ],
      },
      //搜索用的规则编号
      ruleCode: '',
      jsonVisible: false,
      jsonData: "{}",
    }
  },
  setup() {
    const router = useRouter();
    const linkRule = function (ruleCode) {
      router.push({ path: '/RulesPage', query: { ruleCode } })
    };
    return {
      Search, FolderAdd, Delete, Edit, Aim, Refresh,
      linkRule,
    }
  },
  methods: {
    showJson(data) {
      this.jsonData = data;
      this.jsonVisible = true;
    },
    handleTab(tabName) {
      switch (tabName) {
        case "detail":
          this.handelSuit();
          break;
        case "history":
          this.handelHistory();
          break;
      }
    },
    // 套餐详情按钮功能
    handelSuit() {
      this.$nextTick(() => {
        this.adaptiveTableHeight();
      })
    },
    // 变更历史按钮功能
    handelHistory() {
      this.$nextTick(() => {
        this.adaptiveTableHistoryHeight();
      })
      this.childrenHistoryLoading();
    },
    // 套餐详情--分页组件方法
    handleSizeChild(page_size) {
      this.detailForm.pageSize = page_size;
      this.childrenLoading();
    },
    handleCurrentChild(page) {
      this.detailForm.pageNo = page;
      this.childrenLoading();
    },
    // 套餐详情--表格数据获取方法
    childrenLoading() {
      this.$emit('childrenLoading');
    },
    // 变更历史--分页组件方法
    handleSizeHistory(page_size) {
      this.pageSizeHistory = page_size;
      this.childrenHistoryLoading();
    },
    handleCurrentHistory(page) {
      this.currentPageHistory = page;
      this.childrenHistoryLoading();
    },
    // 变更历史--表格数据获取方法
    childrenHistoryLoading() {
      axios({
        url: nioCheckURL + '/check-man/oplog/list',
        method: 'post',
        data: {
          objType: 'SUITE',
          objId: this.detailForm.suiteId,
          pageSize: this.pageSizeHistory,
          pageNo: this.currentPageHistory,
        }
      }).then(response => {
        if (response.data.code === 200) {
          this.totalHistory = response.data.data.total;
          if (this.total === 0) {
            ElMessage.warning({
              message: '没有符合查询条件的数据',
              showClose: true,
            });
          }
          this.dataHistoryChildren = response.data.data.result;
          for (let i in this.dataHistoryChildren) {
            // 整理表格数据中的序号
            this.dataHistoryChildren[i].historyNum = parseInt(i) + 1;
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
      });
    },
    // 保存方法
    handleSave() {
      this.$emit('handleSave');
    },
    // 更新方法
    handleUpdate() {
      this.$emit('handleUpdate');
    },
    //查询按钮
    handleSearch() {
      this.$emit('childrenLoading');
    },
    handleRefresh() {
      this.detailForm.ruleCode = "";
    },
    // 添加按钮
    handleAdd() {
      if (this.detailForm.suiteId !== 0) {
        this.header = '添加检查规则';
        this.addVisible = true;
        this.is_add = true;
        Object.assign(this.addForm, {
          ruleCodes: '',
          opMsg: '',
        });
      } else {
        ElMessage.warning({
          message: '套餐信息为空，不可添加检查规则',
          showClose: true,
        });
      }
    },
    // 添加前校验
    preAdd() {
      if (this.addForm.ruleCodes === '' || this.addForm.opMsg === '') {
        ElMessage.warning({
          message: '规则编号、备注均为必填项',
          showClose: true,
        });
      } else {
        return true;
      }
    },
    // 新增检查规则
    addFun() {
      if (this.preAdd() === true) {
        this.addVisible = false
        axios({
          url: nioCheckURL + '/check-man/suite/addRules',
          method: 'post',
          data: {
            suiteId: this.detailForm.suiteId,
            ruleCodes: this.addForm.ruleCodes,
            opMsg: this.addForm.opMsg,
            opUserName: localStorage.getItem('realName')
          }
        }).then(response => {
          if (response.data.code === 200) {
            ElMessage.success({
              message: '添加成功',
              showClose: true,
            });
            // 添加成功后，重新调用规则表格信息接口
            this.$emit('handleDetail', this.detailForm.suiteId);
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: true,
            });
          }
        }).catch(() => {
          ElMessage.error({
            message: '添加失败',
            showClose: true,
          });
        })
      }
    },
    // 多选方法
    handleSelectionChange(val) {
      this.multipleSelection = [];
      for (let i in val) {
        this.multipleSelection.push(val[i].ruleCode)
      }
      this.ruleCodeString = ''
      if (this.multipleSelection.length > 0) {
        this.ruleCodeString = this.multipleSelection.join(',')
      }
    },
    // 移除按钮
    handleDelete() {
      Object.assign(this.addForm, {
        ruleCodes: this.ruleCodeString,
        opMsg: '',
      });
      if (this.ruleCodeString.length !== 0) {
        this.header = '移除检查规则';
        this.is_add = false;
        this.addVisible = true;
      } else {
        ElMessage.warning({
          message: '未选择表格数据',
          showClose: true,
        });
      }
    },
    // 移除前校验
    preDelete() {
      if (this.addForm.comment === '') {
        ElMessage.warning({
          message: '规则编号、备注均为必填项',
          showClose: true,
        });
      } else {
        return true
      }
    },
    // 移除检查规则
    deleteFun() {
      if (this.preDelete() === true) {
        axios({
          url: nioCheckURL + '/check-man/suite/removeRules',
          method: 'post',
          data: {
            suiteId: this.detailForm.suiteId,
            ruleCodes: this.addForm.ruleCodes,
            opMsg: this.addForm.opMsg,
            opUserName: localStorage.getItem('realName'),
          }
        }).then(response => {
          if (response.data.code === 200) {
            ElMessage.success({
              message: '移除成功',
              showClose: true,
            });
            this.addVisible = false;
            // 移除成功后，重新调用规则表格信息接口
            this.$emit('handleDetail', this.detailForm.suiteId);
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: true,
            });
          }
        }).catch(() => {
          ElMessage.error({
            message: '移除失败',
            showClose: true,
          });
        })
      }
    },
    // 套餐详情表格高度设置
    adaptiveTableHeight() {
      this.tableHeight = document.getElementById('ChildrenContainer') === null ? 0 : document.getElementById('ChildrenContainer').offsetHeight;
    },
    // 变更历史表格高度设置
    adaptiveTableHistoryHeight() {
      this.tableHeightHistory = document.getElementById('historyContainer') === null ? 0 : document.getElementById('historyContainer').offsetHeight;
    }
  },
  mounted() {
    // 初始化设置
    this.$nextTick(() => {
      this.adaptiveTableHeight();
    })
    window.addEventListener('resize', this.adaptiveTableHeight, false);
  },
}
</script>

<style scoped>
#CheckDetail {
  margin: 10px 20px 10px 20px;
  height: calc(100% - 40px);
  font-size: 14px;
}

#formId :deep(.t-form__label) {
  padding-right: 4px !important;
  width: 100px !important;
}

.el-form-item {
  margin-bottom: 10px;
}

:deep(.el-tabs__content) {
  flex: 1;
}


#active {
  color: #409EFF;
}
</style>
