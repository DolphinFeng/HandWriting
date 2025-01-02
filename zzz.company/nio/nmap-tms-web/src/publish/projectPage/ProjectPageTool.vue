<template>
  <div id="ProcessTool">
    <el-form inline :data="projectForm" label-width="100px" style="font-weight: 700" @submit.prevent="onSearch">
      <el-form-item label="项目编号：">
        <el-input v-model.trim="projectForm.id" placeholder="" clearable></el-input>
      </el-form-item>
      <el-form-item label="项目名称：" label-width="120px">
        <el-input v-model.trim="projectForm.name" placeholder="" clearable></el-input>
      </el-form-item>
      <el-form-item label="项目类型：" label-width="140px">
        <el-select v-model.trim="projectForm.productLine"  style="width: 170px">
          <el-option v-for="item in projectType" :key="item.value" :label="item.label" :value="item.value"
        /></el-select>
      </el-form-item>
      <el-form-item label="项目状态：">
        <el-select v-model.trim="projectForm.status"  style="width: 170px">
          <el-option v-for="item in projectStatus" :key="item.value" :label="item.label" :value="item.value"
        /></el-select>
      </el-form-item>
      <el-form-item label="创建人：">
        <el-input v-model.trim="projectForm.createBy" placeholder="" clearable></el-input>
      </el-form-item>

      <el-form-item label="创建时间：">
        <el-date-picker
          v-model="createTime"
          type="datetimerange"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 385px"
          range-separator="至"
          start-placeholder="任务创建时间区间开始"
          end-placeholder="任务创建时间区间结束"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="启动时间：">
        <el-date-picker
          v-model="startTime"
          type="datetimerange"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 385px"
          range-separator="至"
          start-placeholder="任务启动时间区间开始"
          end-placeholder="任务启动时间区间结束"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="完成时间：">
        <el-date-picker
          v-model="endTime"
          type="datetimerange"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 390px"
          range-separator="至"
          start-placeholder="任务完成时间区间开始"
          end-placeholder="任务完成时间区间结束"
        >
        </el-date-picker>
      </el-form-item>
      <div class="operation">
        <el-button :icon="Search" type="primary" native-type="submit">查询</el-button>
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
        <el-button :icon="Delete" type="danger" @click="cancelBtn">取消项目</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus';
import { Search, Refresh, FolderAdd, Delete, RefreshRight } from '@element-plus/icons-vue';

export default {
  name: 'ProjectPageTool',
  components: {},
  props: {
    projectForm: Object,
    projectType: Array,
    projectStatus: Array
  },
  data() {
    return {
      createTime: [],
      startTime: [],
      endTime: [],
    };
  },
  setup() {
    return {
      Search,
      Refresh,
      FolderAdd,
      Delete,
    };
  },
  methods: {
    cancelBtn() {
      this.$emit('cancelBtn');
    },
    resetForm() {
      this.createTime = [];
      this.$emit('resetForm');
    },
    onSearch() {
      if (this.createTime !== null && this.createTime.length !== 0) {
        this.projectForm.createTimeFrom = this.createTime[0];
        this.projectForm.createTimeTo = this.createTime[1];
      } else {
        this.projectForm.createTimeFrom = '';
        this.projectForm.createTimeTo = '';
      }

      if (this.startTime !== null && this.startTime.length !== 0) {
        this.projectForm.startTimeFrom = this.startTime[0];
        this.projectForm.startTimeTo = this.startTime[1];
      } else {
        this.projectForm.startTimeFrom = '';
        this.projectForm.startTimeTo = '';
      }

      if (this.endTime !== null && this.endTime.length !== 0) {
        this.projectForm.endTimeFrom = this.endTime[0];
        this.projectForm.endTimeTo = this.endTime[1];
      } else {
        this.projectForm.endTimeFrom = '';
        this.projectForm.endTimeTo = '';
      }
      this.$emit('onSearch');
    },
  },
};
</script>

<style scoped>
#ProcessTool {
  padding: 5px 0;
  text-align: left;
  color: black;
  font-size: 15px;
}

.el-form-item {
  margin-bottom: 10px;
}

.el-input {
  width: 160px;
}

.operation {
  padding-left: 15px;
}
</style>
