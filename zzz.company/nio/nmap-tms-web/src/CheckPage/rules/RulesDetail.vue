<template>
  <!-- 规则详情组件 -->
  <div id="RulesDetail" >
    <el-descriptions :column="4" border title="规则详情">
      <template #extra>
        <el-button type="primary" @click="openModifyDialog">修改</el-button>
      </template>
      <el-descriptions-item label-align="center" label="规则编号">{{ detailForm.ruleCode }}</el-descriptions-item>
      <el-descriptions-item label-align="center" label="规则名称">{{ detailForm.ruleName }}</el-descriptions-item>
      <el-descriptions-item label-align="center" label="目标要素">{{ detailForm.targetTable }}</el-descriptions-item>
      <el-descriptions-item label-align="center" label="目标字段">{{ detailForm.targetField }}</el-descriptions-item>
      <el-descriptions-item label-align="center" label="错误编码">{{ detailForm.errCode }}</el-descriptions-item>
      <el-descriptions-item label-align="center" label="错误描述">{{ detailForm.errDesc }}</el-descriptions-item>
      <el-descriptions-item label-align="center" label="参考字段">{{ detailForm.refField }}</el-descriptions-item>
      <el-descriptions-item label-align="center" label="参考要素">{{ detailForm.refTable }}</el-descriptions-item>
      <el-descriptions-item label-align="center" label="重要等级">{{ detailForm.impLevel }}</el-descriptions-item>
      <el-descriptions-item label-align="center" label="规则参数">
        <template #default>
          <el-link v-if="detailForm.params" @click="showJson(detailForm.params)" type="primary"
            style="font-size: 13px;font-weight: normal" :underline="false">显示参数</el-link>
          <el-tag v-else type="warning">null</el-tag>
        </template>
      </el-descriptions-item>
      <el-descriptions-item label-align="center" label="存在误报">
        <template #default>
          <el-tag :type="detailForm.misInfo === 'N' ? '' : 'danger'">{{ detailForm.misInfoName }}</el-tag>
        </template>
      </el-descriptions-item>
      <el-descriptions-item label-align="center" label="执行状态">
        <template #default>
          <el-tag :type="detailForm.runStatus.toLowerCase() === 'open' ? '' : 'warning'">{{ detailForm.runStatus
          }}</el-tag>
        </template>
      </el-descriptions-item>
      <el-descriptions-item label-align="center" label="套餐编号">
        <template #default>
          <a @click="handleSuiteDetail(suite.suiteId, suite.suiteCode)" v-for="(suite) in detailForm.suite"
            style="padding:5px;color: #409EFF;">{{ suite.suiteCode }}</a>
        </template>
      </el-descriptions-item>
    </el-descriptions>
    <div class="table" v-if="setTime">
      <div ref="historyContainer" id="historyContainer" style="flex: 1;">
        <el-table :data="dataHistoryChildren.list" border :max-height="tableHeightHistory">
          <el-table-column prop="opUserName" key="opUserName" label="操作人" min-width="100"
            align="center"></el-table-column>
          <el-table-column prop="opContent" key="opContent" label="变更内容" min-width="80" align="center">
            <template #default="{ row }">
              <el-link @click="showJson(row['opContent'])" type="primary" style="font-size: 13px;font-weight: normal"
                :underline="false">显示内容</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="objType" key="objType" label="操作备注" min-width="160" align="center"></el-table-column>
          <el-table-column prop="opTime" key="opTime" label="操作时间" min-width="180" align="center"></el-table-column>
        </el-table>
      </div>
      <div style="padding-top: 10px" class="pagination-container">
        <el-pagination background hide-on-single-page :total="totalHistory" :page-size="pageSizeHistory"
          v-model="currentPageHistory" :page-sizes="[5, 10, 20, 50]" @current-change="handleCurrentHistory"
          @size-change="handleSizeHistory" layout="total,sizes,prev,pager,next,jumper"></el-pagination>
      </div>
    </div>
    <JsonView title="规则参数" v-model:visible="jsonVisible" :data="jsonData" ></JsonView>
    <el-dialog title="修改" v-model="modifyDialog" width="600px" show-close @close="closeDialog">
      <el-form :model="modifyForm" :rules="detailRules" label-width="180px" label-position="right" ref="modifyRef">
        <el-form-item prop="params" label="规则参数：">
          <el-input clearable style="width: 300px;" v-model="modifyForm.params" placeholder="请输入规则参数"></el-input>
        </el-form-item>
        <el-form-item prop="runStatus" label="执行状态：">
          <el-select clearable style="width: 300px;" v-model="modifyForm.runStatus" placeholder="请填写执行状态">
            <el-option label="正常" value="OPEN"></el-option>
            <el-option label="关闭" value="CLOSE"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="opMsg" label="备注：">
          <el-input clearable style="width: 300px;" v-model="modifyForm.opMsg" placeholder="请填写备注"></el-input>
        </el-form-item>
        <el-form-item prop="opUserName" label="执行人：">
          <el-input clearable style="width: 300px;" disabled v-model="modifyForm.opUserName"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="handleSave">保存</el-button>
        <el-button @click="closeDialog">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
// 引入js数据
import axios from "axios";
import { ElMessage } from "element-plus";
import JsonView from "../../jsonView/JsonView.vue";
import { nextTick, onMounted, reactive, ref } from "vue";
import store from "../../store/index.js";
const nioCheckURL = window.api.nioCheckURL;
// const nioCheckURL = 'http://10.115.25.243:8001';

export default {
  name: "RulesDetail",
  components: { JsonView },
  // 接收父组件传来的参数
  props: {
    detailForm: {
      type: Object,
      required: true,
    },
    ruleId: {
      type: Number,
      required: true,
    }
  },
  data() {
    return {
      activeTab: "detail",
      activeName: 'detail',
      detailButton: 'primary',
      historyButton: '',
      // 执行状态数据集
      setTime: true,
    }
  },
  setup(props) {
    const jsonVisible = ref(false);
    const jsonData = ref('{}');
    const showJson = (params) => {
      jsonData.value = params;
      jsonVisible.value = true;
    };
    const linkRule = function (Code) {
      router.push({ path: '/CheckPage', query: { Code } });
    };
    // 变更历史表格的最大高度
    const tableHeightHistory = ref(0);
    // 变更历史表格数据
    let dataHistoryChildren = reactive({
      list: [],
    });
    const totalHistory = ref(0);
    const pageSizeHistory = ref(20);
    const currentPageHistory = ref(1);
    // 变更历史--表格数据获取方法
    const childrenHistoryLoading = () => {
      axios({
        url: nioCheckURL + '/check-man/oplog/list',
        method: 'post',
        data: {
          objType: 'RULE',
          objId: props.ruleId,
          pageNo: currentPageHistory.value,
          pageSize: pageSizeHistory.value,
        },
      }).then(response => {
        if (response.data.code === 200) {
          totalHistory.value = response.data.data.total;

          dataHistoryChildren.list = response.data.data.result;
          for (let i in dataHistoryChildren.list) {
            // 整理表格数据中的序号
            dataHistoryChildren.list[i].historyNum = parseInt(i) + 1;
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
      })
    };
    // 获取历史
    const handelHistory = () => {
      nextTick(() => {
        adaptiveTableHistoryHeight();
      });
      childrenHistoryLoading();
    };
    // 变更历史表格高度设置
    const adaptiveTableHistoryHeight = () => {
      tableHeightHistory.value = document.getElementById('historyContainer') === null ? 0 : document.getElementById('historyContainer').offsetHeight;
    };

    const modifyDialog = ref(false);
    const modifyRef = ref(null);
    const modifyForm = reactive({
      ruleId: props.ruleId,
      runStatus: '',
      params: '',
      opMsg: '',
      opUserName: localStorage.getItem('realName'),
    });
    const detailRules = {
      runStatus: [
        { required: true, message: '执行状态必填', trigger: 'change' },
      ],
      params: [
        { required: true, message: '规则参数必填', trigger: 'change' },
      ],
      opMsg: [
        { required: true, message: '备注必填', trigger: 'change' },
      ],
      opUserName: [
        { required: true, message: '执行人必填', trigger: 'blur' },
      ]
    };
    const openModifyDialog = () => {
      modifyForm.runStatus = props.detailForm.runStatus;
      modifyForm.params = props.detailForm.params;
      modifyForm.opMsg = '';
      modifyDialog.value = true;
    }
    const closeDialog = () => {
      modifyDialog.value = false;
    };
    const handleSave = async () => {
      let valid = await modifyRef.value.validate((valid, fields) => {
        return valid;
      });
      if (valid) {
        axios({
          url: nioCheckURL + '/check-man/rule/update/',
          method: 'post',
          data: {
            ...modifyForm,
          }
        }).then(response => {
          if (response.data.data === 1) {
            ElMessage.success({
              message: '修改成功',
              showClose: true,
            });
            props.ruleId = modifyForm.ruleId;
            props.detailForm.runStatus = modifyForm.runStatus;
            props.detailForm.params = modifyForm.params;
            handelHistory();
          } else {
            ElMessage.error({
              message: response.data.msg,
              showClose: true,
            });
          }
        }).catch(() => {
          ElMessage.error({
            message: '保存失败',
            showClose: true,
          });
        }).finally(() => {
          closeDialog();
        });
      }
    };

    onMounted(() => {
      handelHistory();
      window.addEventListener('resize', adaptiveTableHistoryHeight, false);
    });

    return {
      jsonVisible, jsonData, modifyDialog, modifyForm, detailRules, modifyRef, totalHistory, pageSizeHistory, currentPageHistory, tableHeightHistory, dataHistoryChildren,
      showJson, closeDialog, handleSave, openModifyDialog, linkRule
    }
  },
  methods: {
    changeTab(tabName) {
      switch (tabName) {
        case "detail":
          break;
        case "history":
          this.handelHistory();
          break;
      }
    },
    handleSuiteDetail(id,code){
      this.$emit("handleSuiteDetail",id,code);
      store.commit('breadChange', 3);
    },
    // 保存更新功能
    // handelSave() {
    //   axios({
    //     url: nioCheckURL + '/check-man/rule/update/',
    //     method: 'post',
    //     data: {
    //       id: this.detailForm.id,
    //       operator: localStorage.getItem('realName'),
    //       params: this.detailForm.params,
    //       runStatus: this.detailForm.runStatus,
    //     }
    //   }).then(response => {
    //     if (response.data.code === 200) {
    //       ElMessage.success({
    //         message: '保存成功',
    //         showClose: true,
    //       });
    //     } else {
    //       ElMessage.error({
    //         message: response.data.msg,
    //         showClose: true,
    //       });
    //     }
    //   }).catch(() => {
    //     ElMessage.error({
    //       message: '保存失败',
    //       showClose: true,
    //     });
    //   })
    // },
    // 变更历史--分页组件方法
    handleSizeHistory(page_size) {
      this.pageSizeHistory = page_size;
      this.childrenHistoryLoading();
    },
    handleCurrentHistory(page) {
      this.currentPageHistory = page;
      this.childrenHistoryLoading();
    },
  },
  unmounted() {
    window.removeEventListener('resize', this.adaptiveTableHistoryHeight);
  }
}
</script>

<style scoped>
:deep(.el-descriptions__label) {
  width: 90px !important;
}
#RulesDetail {
  display: flex;
  flex-flow: column nowrap;
  margin: 5px 20px 10px 20px;
  flex: 1;
  font-size: 14px;
}

.table {
  margin: 15px 0 0;
}

.el-form-item {
  /*margin-bottom: 10px;*/
}

:deep(.el-tabs__content) {
  flex: 1;
}
</style>
