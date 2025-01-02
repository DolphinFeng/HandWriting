<template>
  <!-- 搜索工具栏组件 -->
  <div id="JobMetaTool" class="tool">
    <el-form inline :data="jobMetaSearchForm" ref="form" @submit.prevent="onSearch">
      <el-form-item label="Job编码：">
        <el-input v-model.trim="jobMetaSearchForm.code" placeholder="请输入Job编码" clearable></el-input>
      </el-form-item>
      <el-form-item label="Job名称：">
        <el-input v-model.trim="jobMetaSearchForm.name" placeholder="请输入Job名称" clearable></el-input>
      </el-form-item>
      <el-form-item label="Job类型：">
        <el-select v-model="jobMetaSearchForm.type" placeholder="请选择Job类型" style="width: 220px" clearable>
          <el-option
              v-for="item in jobTypeOptions"
              :key="item.code"
              :label="item.name"
              :value="item.code">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button :icon="Search" type="primary" native-type="submit" :loading="loading">查询</el-button>
        <el-button :icon="Refresh" @click="reset">重置</el-button>
        <el-button :icon="FolderAdd" type="success" @click="handleAdd">添加Job</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {FolderAdd, Refresh, Search} from "@element-plus/icons-vue";

export default {
  name: "JobMetaTool",
  // 接收父组件传来的参数
  props: {
    loading: Boolean,
    jobMetaSearchForm: Object,
    jobTypeOptions: Array
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
