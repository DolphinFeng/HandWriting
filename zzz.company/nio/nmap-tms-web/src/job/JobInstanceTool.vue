<template>
  <!-- 搜索工具栏组件 -->
  <div id="JobInstanceTool" class="tool">
    <el-form inline :data="instanceForm" ref="form" @submit.prevent="onInstanceSearch">
      <el-form-item label="Job编码：">
        <el-input v-model.trim="instanceForm.jobCode" placeholder="请输入Job编码" disabled></el-input>
      </el-form-item>
      <el-form-item label="Job ID：">
        <el-input v-model.trim="instanceForm.id" placeholder="请输入Job的ID" clearable style="width: 120px"></el-input>
      </el-form-item>
      <el-form-item label="Job名称：">
        <el-input v-model.trim="instanceForm.name" placeholder="请输入Job名称" clearable></el-input>
      </el-form-item>
      <el-form-item label="状态：">
        <el-select style="width: 200px;" v-model="instanceForm.status" placeholder="请选择状态" clearable>
          <el-option
              v-for="item in instanceStatusOptions"
              :key="item.code"
              :label="item.name"
              :value="item.code">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间：">
        <el-date-picker
            v-model="dateCreateValue"
            type="daterange"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 320px"
            range-separator="至"
            start-placeholder="创建时间区间开始"
            end-placeholder="创建时间区间结束">
        </el-date-picker>
      </el-form-item>
      <div style="height: 40px;padding-top: 10px;">
        <el-button :icon="Search" :loading="loading" type="primary" native-type="submit">查询</el-button>
        <el-button :icon="Refresh" @click="instanceReset">重置</el-button>
        <el-button :icon="FolderAdd" type="success" @click="handleRun">调试</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import {FolderAdd, Refresh, Search} from "@element-plus/icons-vue";

export default {
  name: "JobTool",
  // 接收父组件传来的参数
  props: {
    loading: Boolean,
    instanceForm: Object,
    instanceStatusOptions: Array,
  },
  data() {
    return {
      dateCreateValue: '',
    }
  },
  setup() {
    return {
      Search, Refresh, FolderAdd,
    }
  },
  methods: {
    handleRun() {
      this.$emit('handleRun')
    },
    // 筛选查询功能
    onInstanceSearch() {
      if (this.dateCreateValue !== null && this.dateCreateValue.length !== 0) {
        this.instanceForm.createTimeFrom = this.dateCreateValue[0] + ' 00:00:00'
        this.instanceForm.createTimeTo = this.dateCreateValue[1] + ' 23:59:59'
      } else {
        this.instanceForm.createTimeFrom = ''
        this.instanceForm.createTimeTo = ''
      }
      this.$emit('onInstanceSearch')
    },
    // 重置功能
    instanceReset() {
      this.dateCreateValue = ''
      this.$emit('instanceReset')
    }
  }
}
</script>

<style scoped>
#JobInstanceTool {
  padding: 5px 0 5px 20px;
  text-align: left;
  color: black;
  font-size: 15px;
}

.el-form-item {
}
</style>
