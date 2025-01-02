<template>
  <!-- 搜索工具栏组件 -->
  <div id="FunctionTool" class="tool">
    <el-form inline :data="functionForm" ref="form" @submit.prevent="onSearch">
      <el-form-item label="接口编码：">
        <el-input v-model.trim="functionForm.code" placeholder="请输入接口编码" clearable></el-input>
      </el-form-item>
      <el-form-item label="接口名称：">
        <el-input v-model.trim="functionForm.name" placeholder="请输入接口名称" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button :icon="Search" type="primary" native-type="submit">查询</el-button>
        <el-button :icon="Refresh" @click="reSet">重置</el-button>
        <el-button :icon="FolderAdd" type="success" @click="handleAdd">添加接口</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {Search, Refresh, FolderAdd} from "@element-plus/icons-vue";

export default {
  name: "FunctionTool",
  // 接收父组件传来的参数
  props: {
    functionForm: Object
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
    reSet() {
      this.$emit('reSet')
    }
  }
}
</script>

<style scoped>
.el-form-item {
  margin-bottom: 0;
}
</style>
