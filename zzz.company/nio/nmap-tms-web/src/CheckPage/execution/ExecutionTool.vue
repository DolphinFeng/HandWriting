<template>
  <!-- 搜索工具栏组件 -->
  <div id="ExecutionTool" class="tool">
    <el-form inline label-width="100px" :model="ExecutionForm" ref="form" @submit.prevent="onSearch">
      <el-form-item label="valId：">
        <el-input v-model="ExecutionForm.valId" placeholder="请输入valId" style="width: 200px" clearable></el-input>
      </el-form-item>
      <el-form-item label="任务Id：">
        <el-input v-model="ExecutionForm.bizId" placeholder="请输入任务Id" style="width: 200px" clearable></el-input>
      </el-form-item>
      <el-form-item label="执行引擎：">
        <el-select
            v-model="ExecutionForm.runEngine"
            clearable
            placeholder="请选择执行引擎"
            style="width: 150px"
        >
          <el-option
              v-for="item in runEngine"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="检查类型：">
        <el-select
            v-model="ExecutionForm.valType"
            clearable
            placeholder="请选择检查类型"
            style="width: 150px;"
        >
          <el-option
              v-for="item in valType"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="执行状态：">
        <el-select
            v-model="ExecutionForm.runStatus"
            clearable
            placeholder="请选择执行状态"
            style="width: 150px;"
        >
          <el-option
              v-for="item in runStatus"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="请求时间：" style="font-weight: bold">
        <el-date-picker
            v-model="ExecutionForm.rangeTime"
            type="daterange"
            unlink-panels
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 320px"
            range-separator="至"
            :shortcuts="shortcuts"
            start-placeholder="选择起始时间"
            end-placeholder="选择结束时间"
            :editable="false"
            >
        </el-date-picker>
      </el-form-item>
      <div></div>
      <el-form-item style="width: 100%;display: flex;">
        <el-button :icon="Search" type="primary" native-type="submit" class="button_style">查询</el-button>
        <el-button :icon="Refresh" @click="reSet" class="button_style">重置</el-button>
        <div style="flex: 1"></div>
        <el-button :icon="FolderAdd" type="success" @click="executionCheck" class="button_style" style="margin-right: 20px;">执行检查</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {Search, Refresh, FolderAdd} from "@element-plus/icons-vue";

export default {
  name: "ExecutionTool",
  // 接收父组件传来的参数
  props: {
    ExecutionForm: Object,
  },
  data() {
    return {
      // 时间选择器绑定的数据
      dateValue: []
    }
  },
  setup() {
    const runEngine = [
      {label: 'JAVA', value: 'JAVA'},
      {label: 'CPP', value: 'CPP'},
    ];
    const valType = [
      {label: '图幅检查', value: 1},
      {label: '全库检查', value: 2},
    ];
    const runStatus = [
      {label: '创建', value: 0},
      {label: '执行中', value: 1},
      {label: '失败', value: 11},
      {label: '取消', value: 12},
      {label: '成功', value: 100},
    ];
    const shortcuts = [
      {
        text: '本月',
        value: [new Date(), new Date()],
      },
      {
        text: '近六个月',
        value: () => {
          const start = new Date(new Date().getFullYear(), 0);
          const end = new Date();
          return [start, end];
        },
      },
      {
        text: '今年',
        value: () => {
          const start = new Date();
          const end = new Date();
          start.setMonth(start.getMonth() - 6);
          return [start, end];
        },
      }
    ];
    return {
      Search, Refresh, FolderAdd,
      runEngine, valType, runStatus, shortcuts,
    }
  },
  methods: {
    // 页面跳转至执行检查
    executionCheck() {
      this.$emit('executionCheck');
      this.$store.commit("breadChange", 2);
    },
    // 筛选查询功能
    onSearch() {
      // 整理时间字段数据
      if (this.dateValue !== null && this.dateValue.length !== 0) {
        // this.ExecutionForm.fromDate = this.dateValue[0] + ' 00:00:00'
        // this.ExecutionForm.toDate = this.dateValue[1] + ' 23:59:59'
      } else {
        // this.ExecutionForm.fromDate = null
        // this.ExecutionForm.toDate = null
      }
      this.$emit('onSearch')
    },
    // 重置功能
    reSet() {
      this.dateValue = null
      this.$emit('reSet')
    }
  },
}
</script>

<style scoped>
.el-form-item {
  margin-bottom: 10px;
}
</style>
