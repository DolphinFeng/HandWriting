<template>
  <!-- 搜索工具栏组件 -->
  <div id="ExecutionEngineTool" class="tool">
    <el-form inline :data="searchForm" ref="form" @submit.prevent="onSearch">
      <el-form-item label="引擎编码：">
        <el-input v-model.trim="searchForm.code" placeholder="请输入引擎编码" clearable></el-input>
      </el-form-item>
      <el-form-item label="引擎名称：">
        <el-input v-model.trim="searchForm.name" placeholder="请输入引擎名称" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button :icon="Search" type="primary" native-type="submit">查询</el-button>
        <el-button :icon="Refresh" @click="reset">重置</el-button>
        <el-button :icon="FolderAdd" type="success" @click="handleAdd">添加引擎</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {Search, Refresh, FolderAdd} from "@element-plus/icons-vue";

export default {
  name: "ExecutionEngineTool",
  // 接收父组件传来的参数
  props: {
    searchForm: Object
  },
  data() {
    return {}
  },
  setup() {
    return {
      Search, Refresh, FolderAdd,
    }
  },
  methods: {
    handleAdd() {
      this.$emit('handleAdd')
    },
    // 筛选查询功能
    onSearch() {
      this.$emit('onSearch')
    },
    // 重置功能
    reset() {
      this.$emit('reset')
    }
  }
}
</script>

<style scoped>
.el-form-item {
  margin-bottom: 0;
}
</style>
