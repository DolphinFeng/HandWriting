<template>
  <!-- 搜索工具栏组件 -->
  <div id="ResultsTool" class="tool">
    <el-form inline :model="ResultsForm" ref="form" @submit.prevent="onSearch">
      <el-form-item label="valId：" prop="valId">
        <el-input v-model="ResultsForm.valId" placeholder="请输入valId" style="width: 200px" clearable></el-input>
      </el-form-item>
      <el-form-item label="任务号：" prop="taskId">
        <el-input v-model="ResultsForm.taskId" placeholder="请输入任务号" style="width: 200px" clearable></el-input>
      </el-form-item>
      <el-form-item label="检查规则号：" prop="ruleCode">
        <el-input v-model="ResultsForm.ruleCode" placeholder="请输入step" style="width: 200px" clearable></el-input>
      </el-form-item>
      <el-form-item label="目标要素：" prop="targetTable">
        <el-input v-model="ResultsForm.targetTable" placeholder="请输入targetTable" style="width: 200px"
          clearable></el-input>
      </el-form-item>
      <el-form-item label="重要等级：" prop="impLevel">
        <el-select v-model="ResultsForm.impLevel" placeholder="请选择重要等级" multiple>
          <el-option v-for="item in impLevel" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="误报标识：" prop="misInfo">
        <el-select v-model="ResultsForm.misInfo" placeholder="请选择误报标识">
          <el-option v-for="item in misInfo" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <div>
        <el-button :icon="Search" type="primary" native-type="submit" class="button_style">查询</el-button>
        <el-button :icon="Refresh" @click="reSet" class="button_style">重置</el-button>
        <el-button :icon="Download" type="success" @click="exportDetail" class="button_style"
          style="float: right;margin-right: 20px">导出结果明细</el-button>
        <el-button :icon="Download" type="success" @click="exportStat" class="button_style"
          style="float: right;margin-right: 20px">导出结果统计</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { Search, Refresh, Download } from "@element-plus/icons-vue";

export default {
  name: "ResultsTool",
  // 接收父组件传来的参数
  props: {
    ResultsForm: Object
  },
  setup() {
    const impLevel=[
      {label:'S',value:'S'},
      {label:'A',value:'A'},
      {label:'B',value:'B'},
      {label:'C',value:'C'},
    ];
   const misInfo=[{label:'否',value:'0'},{label:'是',value:'1'}]
    return {
      Search, Refresh, Download,impLevel,misInfo
    }
  },
  methods: {
    // 筛选查询功能
    onSearch() {
      this.$emit('onSearch');
    },
    // 重置功能
    reSet() {
      this.$emit('reSet');
    },
    // 导出检查结果功能
    exportDetail() {
      this.$emit('exportDetail');
    },
    exportStat(){
      this.$emit('exportStat')
    }
  },
}
</script>

<style scoped>
.button_style {
  margin: 5px 10px 0 0;
}

.el-form-item {
  margin-bottom: 10px;
}
</style>
