<template>
  <!-- 搜索工具栏组件 -->
  <div id="ResourceTool">
    <el-form :inline="true" :data="resourceForm" ref="form">
      <el-form-item label="资源编码：">
        <el-input size="small" v-model.trim="resourceForm.code" placeholder="请输入资源编码" clearable></el-input>
      </el-form-item>
      <el-form-item label="资源名称：">
        <el-input size="small" v-model.trim="resourceForm.name" placeholder="请输入资源名称" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button size="medium" type="primary" @click="onSearch">查询</el-button>
        <el-button size="medium" @click="reSet">重置</el-button>
        <el-button size="medium" type="primary" @click="handleAdd">添加资源</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "ResourceTool",
  // 接收父组件传来的参数
  props: {
    resourceForm: Object
  },
  data() {
    return {}
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
#ResourceTool {
  padding: 20px 0 5px 20px;
  text-align: left;
  color: black;
  font-size: 15px;
}

.el-form-item {
  margin-bottom: 10px;
}
</style>
