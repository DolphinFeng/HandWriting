<template>
  <!-- path list对话框 -->
  <el-dialog
    title="数据路径记录"
    v-model="listDialogVisible"
    show-close
    @close="closeForm"
    width="700px">
    <el-table :data="tableList" border>
      <el-table-column prop="storageType" label="存储类型" min-width="80" align="center"></el-table-column>
      <el-table-column prop="extension" label="文件类型" min-width="80" align="center"></el-table-column>
      <el-table-column prop="diffPath" label="数据存储路径" min-width="420" align="center"></el-table-column>
    </el-table>
    <template #footer class="dialog-footer">
      <el-button @click="closeForm">取消</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { ElMessage } from "element-plus";

export default {
  name: "PathListDialog",
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
    }
  },
  methods: {
    closeForm(){
      if (this.showDialog === false) {
        return;
      }
			this.$emit('close')
		},
  }
}
</script>

<style scoped>
.el-upload__tip{
  margin-left: 10px;
  margin-top: 0;
}
</style>
