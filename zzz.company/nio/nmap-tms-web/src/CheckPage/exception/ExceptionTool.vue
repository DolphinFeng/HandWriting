<template>
  <!-- 搜索工具栏组件 -->
  <div id="ExceptionTool" class="tool">
    <el-form inline :model="ExceptionForm" label-width="100px" :rules="rules" ref="searchFormRef" @submit.prevent="onSearch">
      <el-form-item label="产品名称：" prop="productName">
        <el-input v-model="ExceptionForm.productName" placeholder="请输入产品名称" style="width: 200px" clearable></el-input>
      </el-form-item>
      <el-form-item label="分支名称：" prop="branchName">
        <el-input v-model="ExceptionForm.branchName" placeholder="请输入分支名称" style="width: 200px" clearable></el-input>
      </el-form-item>
      <el-form-item label="检查规则号：" prop="ruleCodes">
        <el-input v-model="ExceptionForm.ruleCodes" placeholder="请输入检查规则号" style="width: 200px" clearable></el-input>
      </el-form-item>
      <el-form-item label="目标要素：" prop="featureIds">
        <el-input v-model="ExceptionForm.featureIds" placeholder="请输入目标要素" style="width: 200px" clearable></el-input>
      </el-form-item>
      <el-form-item label="图幅号：" prop="meshes">
        <el-input v-model="ExceptionForm.meshes" placeholder="请输入图幅号" style="width: 200px" clearable></el-input>
      </el-form-item>
      <div></div>
      <el-form-item style="margin-bottom: 0;">
        <el-button :icon="Search" type="primary" native-type="submit" class="button_style">查询</el-button>
        <el-button :icon="Refresh" @click="reSet" class="button_style">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {Search, Refresh} from "@element-plus/icons-vue";
import {ref} from "vue";

export default {
  name: "ExceptionTool",
  // 接收父组件传来的参数
  props: {
    ExceptionForm: Object
  },
  emits: ['onSearch', 'reSet'],
  setup(props, {emit}) {
    const searchFormRef = ref(null);
    const rules = {
      productName: [
        {required: true, message: '产品名称必填', trigger: 'blur'},
      ],
      branchName: [
        {required: true, message: '分支名称必填', trigger: 'blur'},
      ]
    };
    // 筛选查询功能
    const onSearch = function () {
      searchFormRef.value.validate((isValid) => {
        if (isValid) {
          emit('onSearch');
        }
      });
    }
    // 重置功能
    const reSet = function () {
      searchFormRef.value.clearValidate();
      emit('reSet');
    }
    return {
      Search, Refresh,
      rules, searchFormRef, onSearch, reSet,
    }
  },
}
</script>

<style scoped>
:deep(.el-form-item) {
  margin-right: 10px!important;
}
</style>
