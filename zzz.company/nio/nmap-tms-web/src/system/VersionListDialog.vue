<template>
  <!-- VersionListDialog对话框 -->
  <el-dialog
    title="版本列表"
    v-model="dialogVisible"
    show-close
    @close="closeForm"
    width="700px">
    <el-table :data="tableList" border>
      <el-table-column fixed prop="version" label="版本号" min-width="100" align="center">
        <template #default="{row}">
          <el-button type="primary" link @click="handleSearchVersion(row.version)">{{ row.version }}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="版本名称" min-width="150" align="center"></el-table-column>
      <el-table-column prop="description" label="版本说明" show-overflow-tooltip min-width="200" align="center"></el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="160" align="center"></el-table-column>
    </el-table>
    <template #footer class="dialog-footer">
      <el-button @click="closeForm">取消</el-button>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: "VersionListDialog",
  // 接收父组件传来的参数
  props: {
    showDialog: Boolean,
    tableList: Array | null
  },
  computed: {
    dialogVisible: {
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
    handleSearchVersion(version) {
      this.$emit('onSearchVersion', version);
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
