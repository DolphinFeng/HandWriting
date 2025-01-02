<template>
  <!-- 搜索工具栏组件 -->
  <div id="MaterialTool">
    <el-form inline :data="materialForm" ref="form" @submit.prevent="onSearch">
      <el-form-item label="业务类型:" name="businessType">
        <el-select v-model.trim="materialForm.businessType" placeholder="请选择业务类型（必填）" @change="chageSearchBusinessType"
          style="width: 360px" clearable>
          <el-option v-for="item in businessTypeOptions" :key="item.name" :label="item.desc" :value="item.name">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="任务名称：" name="taskName">
        <el-input v-model="materialForm.taskName" placeholder="请输入pipline任务名称" style="width: 160px;" clearable></el-input>
      </el-form-item>
      <el-form-item label="任务id：" name="taskId">
        <el-input v-model="materialForm.taskId" placeholder="请输入pipline任务id" style="width: 160px;" clearable></el-input>
      </el-form-item>
      <el-form-item prop="businessId" label="业务场景名称：">
        <el-select v-model="materialForm.businessId" placeholder="请选择一个业务场景" remote filterable clearable  @blur="onTypeBlur($event)" 
          :remote-method="remoteQuery" loading-text="查询中" no-match-text="没有匹配的业务场景" no-data-text="没有匹配的业务场景"
          :loading="parkingLoading" style="width: 300px"  >
          <el-option v-for="item in parkingOptions" :key="item.value" :label="item.name" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="任务状态:" name="taskStatus">
        <el-select v-model="materialForm.taskStatus" placeholder="请选择任务状态（必填）" style="width: 360px" clearable
          @change="dynamicForm(form.taskType)">
          <el-option v-for="item in taskStatusOptions" :key="item.name" :label="item.desc" :value="item.name">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="记录Id：" name="id">
        <el-input v-model="materialForm.id" placeholder="请输入记录Id" style="width: 160px;" clearable></el-input>
      </el-form-item>
      <el-form-item label="业务场景ID：" name="businessId">
        <el-input v-model="materialForm.businessId" placeholder="请输入业务场景ID" style="width: 160px;" clearable></el-input>
      </el-form-item>
      <div>
        <el-button :icon="Search" type="primary" native-type="submit" class="button_style">查询</el-button>
        <el-button :icon="Refresh" @click="reSet" class="button_style">重置</el-button>
        <el-button type="success" @click="exportDetail">下载</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
// 引入js数据
import { Search, Refresh, FolderAdd, UploadFilled } from "@element-plus/icons-vue";

export default {
  name: "MaterialTool",
  // 接收父组件传来的参数
  props: {
    materialForm: Object,
    businessTypeOptions: Array,
    taskStatusOptions: Array,
    parkingOptions: Array,
    parkingLoading: Boolean,
  },
  data() {
    return {
    }
  },
  setup() {
    return { 
      Search, Refresh, FolderAdd, UploadFilled, 
    }
  },
  methods: {
    onTypeBlur(e) {
      if (e.target.value.trim()!== '') {
        let label = e.target.value;
        let value=''
        for (let i = 0; i < this.parkingOptions.length; i++) {  
          let obj = this.parkingOptions[i];  
          if (obj.name == label) {  
            value=obj.value;  
          }  
        }

        if(value==''){
              ElMessage.error({
                message: "无该业务场景id",
                showClose: true,
              });
          }

        this.materialForm.businessId = value;
  
      }
    },

    // 筛选查询功能
    onSearch() {
      this.$emit('onSearch')
    },
    // 重置功能
    reSet() {
      this.$emit('reSet')
    },
    // 触发云端建图
    startPipline() {
      this.$emit('startPipline')
    },
    remoteQuery(query) {
      this.$emit('remoteQuery', query)
    },
    chageSearchBusinessType(query) {
      this.$emit('chageSearchBusinessType', query)
    },
    exportDetail() {
      this.$emit('exportDetail')
    }
  }
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
