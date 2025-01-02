<template>
  <!-- 搜索工具栏组件 -->
  <div id="MaterialTool">
    <el-form inline :data="materialForm" ref="form" @submit.prevent="onSearch">
      <el-form-item label="任务类型：" name="taskType">
        <el-select v-model="materialForm.taskType" placeholder="请选择任务类型" style="width: 160px" clearable>
          <el-option
            v-for="item in typeOptions"
            :key="item.name"
            :label="item.desc"
            :value="item.name">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="运行状态：" name="taskValue">
        <el-select v-model="materialForm.taskValue" placeholder="请选择运行状态" style="width: 160px" clearable>
          <el-option
            v-for="item in runOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="提交时间：" name="unload_time_from">
        <el-date-picker
          v-model="dateValue"
          type="daterange"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 420px"
          :editable="false"
          range-separator="至"
          start-placeholder="提交时间区间开始"
          end-placeholder="提交时间区间结束">
        </el-date-picker>
      </el-form-item>
      <div>
        <el-button :icon="Search" type="primary" native-type="submit" class="button_style">查询</el-button>
        <el-button :icon="Refresh" @click="reSet" class="button_style">重置</el-button>
        <el-button :icon="FolderAdd" type="success" @click="handleAdd" class="button_style">新建任务</el-button>
      </div>
    </el-form>
    <div>

    </div>
  </div>
</template>

<script>
  // 引入js数据
  import {runOptions} from "@/js/material_data";
  import {Search, Refresh, FolderAdd} from "@element-plus/icons-vue";

  export default {
    name: "MaterialTool",
    // 接收父组件传来的参数
    props: {
      materialForm: Object,
      typeOptions: Array
    },
    data() {
      return {
        // 运行状态
        runOptions: runOptions,
        // 时间选择器绑定的数据
        dateValue: [],
      }
    },
    setup() {
      return {
        Search, Refresh, FolderAdd,
      }
    },
    methods: {
      // 新建任务
      handleAdd() {
        this.$emit('handleAdd')
      },
      // 筛选查询功能
      onSearch() {
        if (this.dateValue !== null && this.dateValue.length !== 0) {
          this.materialForm.createTimeBegin = this.dateValue[0] + ' 00:00:00'
          this.materialForm.createTimeEnd = this.dateValue[1] + ' 23:59:59'
        } else {
          this.materialForm.createTimeBegin = null
          this.materialForm.createTimeEnd = null
        }
        this.materialForm.taskType = this.materialForm.taskType === '' ? null : this.materialForm.taskType
        this.materialForm.taskStatus = this.materialForm.taskValue === '' || this.materialForm.taskValue === 'ALL' ? null : this.materialForm.taskValue
        this.$emit('onSearch')
      },
      // 重置功能
      reSet() {
        this.dateValue = null
        this.$emit('reSet')
      }
    },
    created() {
      if (this.materialForm.createTimeBegin !== null && this.materialForm.createTimeBegin.length !== 0) {
        this.dateValue[0] = this.materialForm.createTimeBegin;
      }
      if (this.materialForm.createTimeEnd !== null && this.materialForm.createTimeEnd.length !== 0) {
        this.dateValue[1] = this.materialForm.createTimeEnd;
      }
    },
  }
</script>

<style scoped>
  #MaterialTool {
    padding: 5px 0 5px 20px;
    text-align: left;
    color: black;
    font-size: 15px;
  }

  .el-form-item {
    margin-bottom: 10px;
  }
</style>
