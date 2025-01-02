<template>
  <!--任务详情-->
  <div id="MaterialDetail">
    <div id="detail" class="baseDiv">
      <el-descriptions title="父任务信息" border>
        <el-descriptions-item align="center" label="任务编号">{{fatherForm.taskId}}</el-descriptions-item>
        <el-descriptions-item align="center" label="任务类型">{{fatherForm.taskTypeName}}</el-descriptions-item>
        <el-descriptions-item align="center" label="执行状态">{{fatherForm.taskStatusName}}</el-descriptions-item>
        <el-descriptions-item align="center" label="创建时间">{{fatherForm.createTime}}</el-descriptions-item>
        <el-descriptions-item align="center" label="结束时间">{{fatherForm.finishTime}}</el-descriptions-item>
        <el-descriptions-item min-width="250px" align="center" label="任务参数">
          <el-link v-if="fatherForm.taskParams !== '{}'" :underline="false" type="primary" style="font-size: 13px;font-weight: normal" @click="showJson(fatherForm.taskParams)">显示参数</el-link>
          <el-tag v-else type="warning">null</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <div  class="child-list">
      <div style="font-size: 16px;font-weight: 700;margin-bottom: 20px;">子任务列表</div>
      <div id="children" class="info">
        <el-table
          :data="dataChildren"
          border
          :max-height="tableHeight"
          element-loading-text="Loading"
          element-loading-spinner="el-icon-loading"
        >
          <el-table-column fixed prop="subtaskId" label="子任务编号" min-width="140" align="center"></el-table-column>
          <el-table-column prop="subtaskNo" label="子任务序号" min-width="140" align="center"></el-table-column>
          <el-table-column label="执行参数" min-width="150" align="center">
            <template #default="{row}">
              <el-link :underline="false" type="primary" style="font-size: 13px;font-weight: normal" @click="showJson(row.subtaskParams)">
                显示执行参数
              </el-link>
            </template>
          </el-table-column>
          <el-table-column prop="subtaskStatusName" key="subtaskStatusName" label="执行状态" min-width="100px" align="center"></el-table-column>
          <el-table-column show-overflow-tooltip prop="subtaskMsg" key="subtaskMsg" label="异常信息" min-width="180px" align="center"></el-table-column>
          <el-table-column prop="subtaskResult" key="subtaskResult" label="结果信息" min-width="180px" align="center"></el-table-column>
          <el-table-column prop="createTime" key="createTime" label="创建时间" min-width="200px" align="center"></el-table-column>
          <el-table-column prop="executeTime" key="executeTime" label="执行时间" min-width="190px" align="center"></el-table-column>
          <el-table-column prop="finishTime" key="finishTime" label="结束时间" min-width="200px" align="center"></el-table-column>
          <el-table-column fixed="right" label="操作" width="100" align="center">
            <template #default="scope">
              <el-link :underline="false" style="font-weight: normal;font-size: 13px;" v-if="showOperator('reLoadTask', scope.row['subtaskStatus'])" @click="insertFun(scope.row)" type="primary">重新执行</el-link>
              <el-link :underline="false" style="font-weight: normal;font-size: 13px;" v-if="showOperator('stopTask', scope.row['subtaskStatus'])" @click="stopFun(scope.row)" type="danger">停止任务</el-link>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!-- json视图 -->
    <JsonView
        :data="jsonData"
        title="显示参数"
        v-model:visible="jsonVisible"
    ></JsonView>
    <el-dialog
        title="任务参数"
        v-model="subtaskFormVisible"
        show-close
        @close="closeSubForm"
        width="650px"
    >
      <el-form :model="subtaskForm" label-width="180px" label-position="right" style="margin: auto;">
        <el-form-item v-for="(index, key) in subtaskForm" :label="key + '：'">
          <el-input v-model="subtaskForm[key]" style="width: 350px;" clearable :placeholder="'请填写' + key"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reSubmit" type="primary">提交</el-button>
        <el-button @click="closeSubForm">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
// 引入js数据
import {columnsChildren} from "@/js/material_data";
import axios from "axios";
import {ElMessage} from "element-plus";
import JsonView from "@/jsonView/JsonView.vue";

const nioSourceURL = window.api.nioSourceURL;

export default {
  name: "MaterialDetail",
  components: {JsonView},
  // 接收父组件传来的参数
  props: {
    fatherForm: Object,
    dataChildren: Array,
  },
  data() {
    return {
      columnsChildren: [
        ...columnsChildren
      ],
      tableHeight: 0,
      jsonData: '',
      jsonVisible: false,
      //子任务重新执行参数列表
      subtaskForm: {

      },
      subtaskId: '',
      subtaskFormVisible: false,
      loadingTimer: null,
    }
  },
  methods: {
    showOperator(type, status) {
      if (type === 'reLoadTask') {
        return ['SUCCESS', 'FAILURE', 'STOPPED'].indexOf(status) !== -1;
      } else if (type === 'stopTask') {
        return ['RUNNING', 'SUBMITTED'].indexOf(status) !== -1;
      }
    },
    reSubmit() {
      axios({
        url: nioSourceURL + '/nio/material/task/rerunSubtask',
        method: 'post',
        data: {
          taskId: this.fatherForm.taskId,
          subtaskId: this.subtaskId,
          subtaskParams: this.subtaskForm,
        }
      }).then(response => {
        if (response.data.code === 0) {
          ElMessage.success({
            message: '重新执行成功',
            showClose: true,
          });
          this.childrenLoading();
        } else {
          ElMessage.error({
            message: response.data.msg,
            showClose: true,
          });
        }
      }).catch(() => {
        ElMessage.error({
          message: '重新执行失败',
          showClose: true,
        });
      }).finally(() => {
        this.closeSubForm();
      });
    },
    closeSubForm() {
      this.subtaskFormVisible = false;
      this.subtaskForm = {};
    },
    showJson(data) {
      this.jsonData = data;
      this.jsonVisible = true;
    },
    // 获取详情数据
    childrenLoading() {
      this.$emit('childrenLoading', this.fatherForm.taskId);
    },
    // 重新执行函数
    insertFun(row) {
      Object.assign(this.subtaskForm, {
        ...row['taskParamMap'],
      });
      this.subtaskId = row.subtaskId;
      this.subtaskFormVisible = true;
    },
    stopFun(row) {
      axios({
        url: nioSourceURL + '/nio/material/task/stopSubtask',
        method: 'post',
        data: {
          taskId: this.fatherForm.taskId,
          subtaskId: row.subtaskId,
        },
      }).then(res => {
        if (res.data.code === 0) {
          ElMessage.success({
            message: '已停止任务',
            showClose: false,
            grouping: true,
          });
          this.childrenLoading();
        } else {
          throw new Error(res.data.msg);
        }
      }).catch(err => {
        ElMessage.error({
          message: err.message,
          showClose: false,
          grouping: true,
        });
      });
    },
    // 设置表格的最大高度
    adaptiveTableHeight() {
      this.tableHeight = document.getElementById('children') === null ? 0 : document.getElementById('children').offsetHeight - 1;
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.adaptiveTableHeight();
    });
    window.addEventListener('resize', this.adaptiveTableHeight, false);
  },
}
</script>

<style scoped>
#MaterialDetail {
  position: relative;
  margin: 5px 20px 10px 20px;
  font-size: 14px;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-flow: column nowrap;
}

.baseDiv {
  margin-top: 8px;
}

.child-list{
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-flow: column nowrap;
  margin-top: 20px;
}

.info {
  flex: 1;
  overflow: hidden;
}
/*:deep(.el-descriptions__label:nth-child(2n-1)) {*/
/*  width: 150px!important;*/
/*}*/
/*:deep(.el-descriptions__content:nth-child(2)) {*/
/*  width: 190px!important;*/
/*}*/
/*:deep(.el-descriptions__content:nth-child(4)) {*/
/*  width: 190px!important;*/
/*}*/

</style>
