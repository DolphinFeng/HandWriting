<template>
  <!-- 套餐管理主表格信息组件 -->
  <div id="CheckTable" class="table">
    <div id="CheckTableContainer"
         class="table-container"
         v-loading="loading"
         element-loading-text="拼命加载中..."
         :element-loading-spinner="svg"
         element-loading-svg-view-box="-10, -10, 50, 50"
    >
      <el-table :data="tableData" border :max-height="tableHeight">
        <el-table-column fixed prop="suiteNum" label="序号" min-width="60" align="center"></el-table-column>
        <el-table-column fixed prop="suiteCode" label="套餐编号" min-width="160" align="center">
          <template #default="scope">
            <!-- 点击进入套餐详情页面 -->
            <a @click="handleDetail(scope.row)" >
              {{scope.row.suiteCode}}
            </a>
          </template>
        </el-table-column>
        <el-table-column fixed prop="suiteName" label="套餐名称" min-width="140" align="center"></el-table-column>
        <el-table-column prop="descp" label="套餐描述" width="180" align="center">
          <template #default="{row}">
            <span v-if="row.descp">{{row.descp}}</span>
            <el-tag v-else type="warning">null</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ruleCount" key="ruleCount" label="规则总数" :min-width="110" align="center">
          <template #default="{row, $index}">
            <!-- 点击会有包含规则的弹出框 -->
            <el-link v-if="row.ruleCount" :underline="false" type="primary">
              <span @click="getRuleCodes(row.id)" class="copy-link">{{row.ruleCount}}</span>
            </el-link>
            <el-tag v-else type="warning" style="user-select: none">null</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" key="createTime" label="创建时间" :min-width="180" align="center"></el-table-column>
        <el-table-column prop="updateTime" key="updateTime" label="更新时间" :min-width="180" align="center"></el-table-column>
        <!-- 操作按钮栏 -->
        <el-table-column fixed="right" label="操作" width="100" align="center">
          <template #default="scope">
            <el-button link type="success" size="small" @click="handleModify(scope.row)">修改</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 套餐管理：分页组件 -->
    <div style="padding-top: 10px" class="pagination-container">
      <el-pagination
        background
        :total="total"
        :page-size="pageSize"
        v-model="currentPage"
        :page-sizes="[5,10,20,50]"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
        layout="total,sizes,prev,pager,next,jumper"
      ></el-pagination>
    </div>
    <!-- 修改套餐对话框 -->
    <el-dialog
        title="修改"
        width="500px"
        v-model="modifyVisible"
        show-close
        @close="closeModifyForm"
    >
      <el-form
          :model="modifyForm"
          :rules="modifyRules"
          label-position="right"
          label-width="100px"
          ref="modifyRef"
      >
        <el-form-item label="套餐编号" prop="id">
          <el-input disabled v-model="modifyForm.id" placeholder="请输入套餐名称"></el-input>
        </el-form-item>
        <el-form-item label="套餐名称" prop="suiteName">
          <el-input v-model="modifyForm.suiteName" placeholder="请输入套餐名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="套餐描述" prop="descp">
          <el-input v-model="modifyForm.descp" placeholder="请输入套餐描述" clearable></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="comments">
          <el-input v-model="modifyForm.comments" placeholder="请输入修改备注" clearable></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="modifyFun">保存</el-button>
        <el-button @click="modifyVisible = false">取消</el-button>
      </template>
    </el-dialog>
    <!-- 删除套餐对话框 -->
    <el-dialog
      title="删除套餐"
      v-model="deleteVisible"
      show-close
      @close="()=>{this.deleteVisible = false}"
      width="500px">
      <div style="word-break: break-all;margin-bottom: 15px">
        <span>确认删除套餐 <b>{{suiteCode}}</b> 吗？</span>
      </div>
      <template #footer class="dialog-footer">
        <el-button @click="deleteVisible = false" >取 消</el-button>
        <el-button @click="deleteFun" type="primary">确 定</el-button>
      </template>
    </el-dialog>
    <!-- 规则列表对话框 -->
    <el-dialog
        top="25vh"
        title="规则详情"
        v-model="ruleVisible"
        show-close
        @close="this.ruleVisible = false"
        width="40vw"
        style="max-width: 1000px"
    >
      <el-scrollbar max-height="200px">
        {{ruleCodes}}
      </el-scrollbar>
      <template #footer>
        <el-button type="success" @click="copyText(ruleCodes)">复制</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  import {copyTextToClipboard} from "../../utils";
  import axios from "axios";
  import {ElMessage} from "element-plus";
  import store from "../../store/index.js";
  import {svg} from "@/js/loading_data.js";

  const nioCheckURL = window.api.nioCheckURL;

  export default {
    name: "CheckTable",
    // 接收父组件传来的参数
    props: {
      loading: Boolean,
      tableData: Array,
      total: Number,
      checkId: Number,
    },
    data() {
      return {
        svg: svg,
        // 套餐管理表格的最大高度
        tableHeight: 0,
        // 套餐管理表格表头信息
        tableColumn: [
          {prop: 'ruleCount', label: '规则总数', width: '110'},
          {prop: 'insertTime', label: '创建时间', width: '180'},
          {prop: 'updateTime', label: '更新时间', width: '180'},
        ],
        // 每次表格展示多少条信息
        pageSize: 20,
        // 表格当前页码
        currentPage: 1,
        id: '',
        suiteCode: '',
        copyForm: {
          suiteCode: '',
        },
        modifyForm: {
          id: '',
          suiteName: '',
          descp: '',
          comments: '',
        },
        // 设置表单的填写规则
        rules: {
          suiteCode: [
            {required: true, message: '套餐编号必填', trigger: 'blur'},
          ],
        },
        modifyRules: {
          suiteName: [
            {required: true, message: '套餐名称必填', trigger: 'blur'}
          ],
          descp: [
            {required: true, message: '套餐描述必填', trigger: 'blur'},
          ],
          comments: [
            {required: true, message: '备注必填', trigger: 'blur'}
          ]
        },
        copyVisible: false,
        modifyVisible: false,
        deleteVisible: false,
        ruleCodes: '', //当前规则
        ruleVisible: false,
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.adaptiveTableHeight()
      })
      window.addEventListener('resize', this.adaptiveTableHeight, false)
    },
    methods: {
      //请求规则
      getRuleCodes(suiteId) {
        axios({
          url: nioCheckURL + '/check-man/suite/listRuleCodes',
          method: 'get',
          params: {
            suiteId: suiteId,
          }
        }).then(res => {
          if (res.data.code === 200) {
            this.ruleCodes = res.data.data;
            this.ruleVisible = true;
          } else {
            throw new Error(res.data.msg);
          }
        }).catch(err => {
          ElMessage.error({
            message: err.message,
          });
        });
      },
      // 表格当前页码改变时触发函数
      handleCurrentChange(page) {
        this.currentPage = page;
        this.$emit('handleCurrentChange', page)
      },
      // 表格size改变时触发函数
      handleSizeChange(page_size) {
        this.pageSize = page_size;
        this.$emit('handleSizeChange', page_size);
      },
      // 触发复制以创建新套餐对话框
      handleCopy(row) {
        this.id = row.id;
        // 给suiteCode字段加'_copy'字符串
        this.copyForm.suiteCode = row.suiteCode + '_copy';
        this.copyVisible = true;
      },
      handleModify(row) {
        Object.assign(this.modifyForm, {
          id: row.id,
          suiteName: row.suiteName,
          descp: row.descp,
          comments: '',
        });
        this.modifyVisible = true;
      },
      //关闭修改套餐对话框
      closeModifyForm() {
        this.$refs.modifyRef.clearValidate();
        this.modifyVisible = false;
      },
      // 触发删除套餐对话框
      handleDelete(row) {
        this.id = row.id;
        this.suiteCode = row.suiteCode;
        this.deleteVisible = true;
      },
      handleCreateForm() {
        this.$emit('handleCreate');
      },
      //修改套餐功能
      modifyFun() {
        this.$refs.modifyRef.validate((isValid, invalidFields) => {
          if (isValid) {
            axios({
              url: nioCheckURL + '/check-man/suite/update',
              method: 'post',
              data: {
                suiteId: this.modifyForm.id,
                suiteName: this.modifyForm.suiteName,
                suiteDesc: this.modifyForm.descp,
                opUserName: localStorage.getItem('realName'),
                opMsg: this.modifyForm.comments,
              }
            }).then(res => {
              if (res.data.code === 200) {
                ElMessage.success({
                  message: '修改成功',
                });
                this.$emit('loadingPage');
              } else {
                throw new Error(res.data.msg);
              }
            }).catch(err => {
              ElMessage.error({
                message: err.message,
              });
            }).finally(() => {
              this.modifyVisible = false;
            });
          }
        });
      },
      // 删除套餐功能
      deleteFun() {
        //  删除接口
        axios({
          url: nioCheckURL + '/check-man/suite/delete',
          method: 'post',
          data: {
            suiteId: this.id,
            opUserName: localStorage.getItem('realName'),
            opMsg: localStorage.getItem('realName'),
          }
        }).then(response => {
          if (response.data.code === 200) {
            this.deleteVisible = false;
            // 删除成功后重新调用loadingPage方法
            this.$emit('loadingPage');
            ElMessage.success({
              message: '删除套餐成功',
              showClose: true,
              grouping: true,
            });
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: true,
            });
          }
        }).catch(() => {
          ElMessage.error({
            message: '删除套餐失败',
            showClose: true,
            grouping: true,
          });
        })
      },
      // 进入套餐详情
      handleDetail(row) {
        this.$emit('handleDetail', row.id, row.suiteName);
        store.commit('breadChange', 2);
      },
      // 设置表格的最大高度
      adaptiveTableHeight() {
        this.tableHeight = document.getElementById('CheckTableContainer') === null ? 0 : document.getElementById('CheckTableContainer').offsetHeight;
      },
      copyText(text) {
        copyTextToClipboard(text);
      }
    },
  }
</script>

<style scoped>
.el-button+.el-button {
  margin-left: 6px;
}
a{
  color: #409EFF;
}
</style>
