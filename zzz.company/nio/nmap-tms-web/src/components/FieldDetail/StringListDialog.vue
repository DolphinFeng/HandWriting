<template>
  <!-- 字符串数组对话框 -->
  <el-dialog
    :title="title"
    v-model="dialogVisible"
    show-close
    @close="closeForm"
    width="500px">
    <el-table :data="tableData" max-height="55vh">
      <el-table-column prop="value" label=""></el-table-column>
    </el-table>
    <template #footer class="dialog-footer">
      <el-button type="success" @click="copyList">复制</el-button>
      <el-button @click="closeForm">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script>
import {copyTextToClipboard} from "../../utils";
export default {
  name: "StringListDialog",
  // 接收父组件传来的参数
  props: {
    showDialog: Boolean,
    listData: Object | null,
    title: String
  },
  computed: {
    dialogVisible: {
      get() {
        return this.showDialog;
      },
      set(value) {
      }
    },
    tableData: {
      get() {
        return this.listData.map(item => ({ value: item }));
      },
      set(value) {
      }
    }
  },
  data() {
    return {
      
    }
  },
  methods: {
    closeForm() {
      if (this.showDialog === false) {
        return;
      }
			this.$emit('close')
    },
    copyList() {
      copyTextToClipboard(this.listData.join(";"));
    }
  }
}
</script>

<style scoped>
</style>
