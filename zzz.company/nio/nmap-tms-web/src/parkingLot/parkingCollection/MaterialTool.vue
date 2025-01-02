<template>
  <!-- 搜索工具栏组件 -->
  <div id="MaterialTool">
    <el-form inline :data="materialForm" ref="form" @submit.prevent="onSearch">
      <el-form-item label="业务类型:" name="businessType">
        <el-select v-model.trim="materialForm.businessType" placeholder="请选择业务类型（必填）" @change="chageSearchBusinessType"
          style="width: 200px" clearable>
          <el-option v-for="item in businessTypeOptions" :key="item.name" :label="item.desc" :value="item.name">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="会话编号：" name="sessionId">
        <el-input v-model="materialForm.sessionId" placeholder="请输入会话id" style="width: 160px;" clearable></el-input>
      </el-form-item>
      <el-form-item prop="businessId2" label="业务场景id：">
        <el-input v-model="materialForm.businessId2" placeholder="请输入业务场景Id" style="width: 160px;"  @input="clearSelect"  
          clearable></el-input>
      </el-form-item>
      <el-form-item prop="businessId" label="业务场景名称：">
        <el-select v-model="materialForm.businessId" placeholder="请输入场景名称" remote filterable clearable  @change="clearInput" 
          :remote-method="remoteQuery" loading-text="查询中" no-match-text="没有匹配的停车场" no-data-text="没有匹配的停车场"
          :loading="parkingLoading" style="width: 220px">
          <el-option v-for="item in parkingOptions" :key="item.value" :label="item.name" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="采集任务编号：" name="collectionTaskId">
        <el-input v-model="materialForm.collectionTaskId" placeholder="请输入采集任务编号" style="width: 160px;"
          clearable></el-input>
      </el-form-item>
      <el-form-item label="地理围栏名称：" name="geofenceName">
        <el-input v-model="materialForm.geofenceName" placeholder="请输入地理围栏名称" style="width: 160px;" clearable></el-input>
      </el-form-item>
      <el-form-item label="车辆编号：" name="vid">
        <el-input v-model="materialForm.vid" placeholder="请输入车辆编号" style="width: 160px;" clearable></el-input>
      </el-form-item>
      <el-form-item label="资料是否采集完成:" name="integrity">
        <el-select v-model.trim="materialForm.integrity" placeholder="请选择采集任务完成状态" style="width: 100px" clearable>
          <el-option v-for="item in integrityOptions" :key="item.name" :label="item.desc" :value="item.name">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="资料状态:" name="materialStatus">
        <el-select v-model.trim="materialForm.materialStatus" placeholder="请选择资料状态" style="width: 150px" clearable>
          <el-option v-for="item in materialStatusOptions" :key="item.name" :label="item.desc" :value="item.name">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="采集数据来源:" name="source">
        <el-select v-model.trim="materialForm.source" placeholder="请选择采集数据来源" style="width: 150px" clearable>
          <el-option v-for="item in sourceOptions" :key="item.name" :label="item.desc" :value="item.name">
          </el-option>
        </el-select>
      </el-form-item>
      <div>
        <el-button :icon="Search" type="primary" native-type="submit" class="button_style">查询</el-button>
        <el-button :icon="Refresh" @click="reSet" class="button_style">重置</el-button>
        <el-button :icon="UploadFilled" type="success" @click="startPipline" class="button_style">云端建图</el-button>
        <el-button type="success" @click="exportDetail">下载</el-button>
      </div>
    </el-form>
    <div>

    </div>
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
    materialTypeOptions: Array,
    businessTypeOptions: Array,
    parkingOptions: Array,
    parkingLoading: Boolean,
    integrityOptions: Array,
    materialStatusOptions: Array,
    sourceOptions: Array
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
    clearSelect(){
      this.$emit('clearSelect')
    },
    clearInput() {  
     this.$emit('clearInput')
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
    exportDetail(){
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
