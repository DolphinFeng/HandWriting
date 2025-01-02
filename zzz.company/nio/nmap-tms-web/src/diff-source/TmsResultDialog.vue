<template>
  <!-- TmsResult对话框 -->
  <el-dialog
    title="执行任务记录"
    v-model="listDialogVisible"
    show-close
    @close="closeForm"
    width="900px">
    <el-table :data="tableList" border>
      <el-table-column fixed prop="productTaskId" label="任务ID" min-width="180" align="center">
        <template #default="{row}">
          <el-button type="primary" link @click="handleTaskDetail(row.productTaskId)">{{ row.productTaskId }}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="productTaskStatus" label="任务状态" min-width="120" align="center">
        <template #default="{row}">
          {{ getTmsResultStatusLabel(row.productTaskStatus) }}
        </template>
      </el-table-column>
      <el-table-column prop="resultPayload" label="执行结果" min-width="350" align="center"></el-table-column>
      <el-table-column prop="finishTime" label="完成时间" min-width="180" align="center"></el-table-column>
    </el-table>
    <template #footer class="dialog-footer">
      <el-button @click="closeForm">取消</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { ElMessage } from "element-plus";
import { getTmsResultStatusLabel } from "@/js/diffsource_data.js";
import { openInNewTab } from "@/utils";

export default {
  name: "TmsResultDialog",
  // 接收父组件传来的参数
  props: {
    showDialog: Boolean,
    tableList: Array | null
  },
  computed: {
    listDialogVisible: {
      get() {
        return this.showDialog;
      },
      set(value) {
      }
    }
  },
  data() {
    return {
    }
  },
  setup() {
    return {
      getTmsResultStatusLabel
    }
  },
  methods: {
    closeForm(){
      if (this.showDialog === false) {
        return;
      }
			this.$emit('close')
		},
    handleTaskDetail(taskId) {
      openInNewTab('/#/TaskPage?taskId=' + taskId);
    }
  }
}
</script>

<style scoped>
.el-upload__tip{
  margin-left: 10px;
  margin-top: 0;
}
</style>
