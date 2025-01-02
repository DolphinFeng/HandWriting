<template>
  <!-- 搜索工具栏组件 -->
  <div id="MaterialTool">
    <el-form inline :data="materialForm" ref="form" @submit.prevent="onSearch">
      <el-form-item label="资料类型：" name="businessType">
        <el-select v-model="materialForm.businessType" placeholder="请选择资料类型" style="width: 160px" clearable>
          <el-option
            v-for="item in materialTypeOptions"
            :key="item.name"
            :label="item.desc"
            :value="item.name">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="会话编号：" name="sessionId">
        <el-input v-model="materialForm.sessionId" placeholder="请输入会话id" style="width: 160px;"
                  clearable></el-input>
      </el-form-item>
	  <el-form-item label="业务Id：" name="businessId">
	    <el-input v-model="materialForm.businessId" placeholder="请输入业务id" style="width: 160px;"
	              clearable></el-input>
	  </el-form-item>
	  <el-form-item label="采集任务编号：" name="collectionTaskId">
	    <el-input v-model="materialForm.collectionTaskId" placeholder="请输入采集任务编号" style="width: 160px;"
	              clearable></el-input>
	  </el-form-item>
	  <el-form-item label="地理围栏名称：" name="geofenceName">
	    <el-input v-model="materialForm.geofenceName" placeholder="请输入地理围栏名称" style="width: 160px;"
	              clearable></el-input>
	  </el-form-item>
	  <el-form-item label="车辆编号：" name="vid">
	    <el-input v-model="materialForm.vid" placeholder="请输入车辆编号" style="width: 160px;"
	              clearable></el-input>
	  </el-form-item>
      
      <div>
        <el-button :icon="Search" type="primary" native-type="submit" class="button_style">查询</el-button>
        <el-button :icon="Refresh" @click="reSet" class="button_style">重置</el-button>
      </div>
    </el-form>
    <div>

    </div>
  </div>
</template>

<script>
  // 引入js数据
  import {Search, Refresh, FolderAdd,UploadFilled} from "@element-plus/icons-vue";

  export default {
    name: "MaterialTool",
    // 接收父组件传来的参数
    props: {
      materialForm: Object,
      materialTypeOptions: Array
    },
    data() {
      return {
      }
    },
    setup() {
      return {
        Search, Refresh, FolderAdd,UploadFilled,
      }
    },
    methods: {
      
      // 筛选查询功能
      onSearch() {
        this.$emit('onSearch')
      },
      // 重置功能
      reSet() {
        this.$emit('reSet')
      },
	  // 触发云端建图
	  startPipline(){
		this.$emit('startPipline')
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
