<template>
  <!-- 资源详情表单组件 -->
  <div>
    <!-- 对话框 -->
    <el-dialog
        title="执行信息"
        v-model="showDialog"
        show-close
        @close="closeTaskInstance"
        width="900px"
        destroy-on-close>
      <div style="margin: 0 30px 0 10px;">
        <el-table :data="taskInstanceTableData" border style="width:100%">
          <el-table-column fixed prop="name" key="name" label="名称" show-overflow-tooltip width="300"
                           align="center"></el-table-column>
          <el-table-column prop="stage" key="stage" label="执行阶段" width="120"
                           align="center"></el-table-column>
          <el-table-column prop="completions" key="completions" label="目标完成数" width="100"
                           align="center"></el-table-column>
          <el-table-column prop="succeeded" key="succeeded" label="成功执行数" width="100"
                           align="center"></el-table-column>
          <el-table-column prop="statusText" key="statusText" label="状态" width="100"
                           align="center">
          </el-table-column>
          <el-table-column prop="message" key="message" label="执行说明" show-overflow-tooltip width="300"
                           align="center"></el-table-column>
        </el-table>
      </div>
      <template #footer class="dialog-footer">
        <el-button type="primary" @click="closeTaskInstance" style="margin-left: 30px;width: 120px">关闭
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>

export default {
  name: "JobForm",
  // 接收父组件传来的参数
  props: {
    taskInstanceTableData: Array,
    taskInstanceVisible: Boolean
  },
  computed: {
    showDialog: {
      get() {
        return this.taskInstanceVisible;
      },
      set(value) {
      }
    }
  },
  methods: {
    closeTaskInstance() {
      if (this.taskInstanceVisible === false) {
        return;
      }
      this.$emit('closeTaskInstance')
    },
  },
}
</script>

<style scoped>

#formId :deep(.t-form__label) {
  padding-right: 4px !important;
  width: 170px !important;
}

#itemForm :deep(.t-form__label) {
  padding-right: 4px !important;
  width: 85px !important;
  margin: 5px 0;
  font-size: 17px;
  color: rgb(22, 106, 190);
}

</style>
