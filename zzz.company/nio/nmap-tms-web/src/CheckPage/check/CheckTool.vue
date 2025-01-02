<template>
  <!-- 搜索工具栏组件 -->
  <div id="CheckTool" class="tool">
    <el-form inline :data="CheckForm" ref="form" @submit.prevent="onSearch">
      <el-form-item label="套餐编号：" name="dataType">
        <el-input v-model="CheckForm.suiteCode" placeholder="请输入套餐编码" style="width: 200px" clearable></el-input>
      </el-form-item>
      <el-form-item label="套餐名称：" name="taskValue">
        <el-input v-model="CheckForm.suiteName" placeholder="请输入套餐名称" style="width: 200px" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button :icon="Search" type="primary" native-type="submit">查询</el-button>
        <el-button :icon="Refresh" @click="reSet">重置</el-button>
        <el-button :icon="FolderAdd" type="success" @click="handleAdd">创建</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {Search, Refresh, FolderAdd} from "@element-plus/icons-vue";
import store from "../../store/index.js";

export default {
  name: "CheckTool",
  // 接收父组件传来的参数
  props: {
    CheckForm: Object,
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
    // 创建套餐
    handleAdd() {
      this.$emit('handleAdd');
    },
    // 筛选查询功能
    onSearch() {
      this.$emit('onSearch')
    },
    // 重置功能
    reSet() {
      this.$emit('reSet')
    }
  },
}
</script>

<style scoped>
.el-form-item {
  margin-bottom: 0;
}
</style>
