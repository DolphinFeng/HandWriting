<template>
  <!-- 搜索工具栏组件 -->
  <div id="VersionTool" class="tool">
    <el-form inline :model="VersionForm" ref="form" @submit.prevent="onSearch">
      <el-form-item label="产品名称：" name="productIdentity">
        <el-input v-model="VersionForm.productIdentity" placeholder="请输入产品名称" style="width: 200px" clearable></el-input>
      </el-form-item>
      <el-form-item label="产线版本号：" name="releaseVersion">
        <el-input v-model="VersionForm.releaseVersion" placeholder="请输入产线版本号" style="width: 200px" clearable></el-input>
      </el-form-item>
      <el-form-item label="检查状态" style="margin-left: 22px" name="checkStatus">
        <el-select
          v-model="VersionForm.checkStatus"
          placeholder="请选择检查状态"
          multiple
          style="width: 170px"
          clearable
          collapse-tags
        >
          <el-option
            v-for="item in checkStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="编译状态" style="margin-left: 22px" name="compileStatus">
        <el-select
          v-model="VersionForm.compileStatus"
          placeholder="请选择编译状态"
          style="width: 170px"
          clearable
          multiple
          collapse-tags
        >
          <el-option
            v-for="item in compileStatusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="日期" name="sortDirection" style="margin-left: 60px;">
        <el-switch
          v-model="VersionForm.sortDirection"
          active-text='倒序'
          inactive-text='正序'
        style="transform: translateY(-1px);">
        </el-switch>
      </el-form-item>
      <div class="btn-group">
        <el-button :icon="Search" type="primary" native-type="submit" class="button_style">查询</el-button>
        <el-button :icon="Refresh" @click="reSet" class="button_style">重置</el-button>
        <div style="flex: 1"></div>
        <el-button :icon="FolderAdd" type="success" @click="createPointCloud" class="button_style" style="margin-right: 6px">点云发版</el-button>
  <!--      <el-button :icon="FolderAdd" type="success" @click="createServiceArea" class="button_style" style="margin-right: 6px">新建服务区</el-button>-->
        <el-button :icon="FolderAdd" type="success" @click="createCSVersion" class="button_style" style="margin-right: 6px">众包底图发版</el-button>
        <el-button :icon="FolderOpened" type="success" @click="versionCheck" class="button_style" style="margin-right: 20px">新建底图</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
  // 引入js数据
  import {checkStatusOptions, compileStatusOptions} from "../js/version_data";
  import {Search, Refresh, FolderAdd, FolderOpened} from "@element-plus/icons-vue";

  export default {
    name: "VersionTool",
    // 接收父组件传来的参数
    props: {
      VersionForm: Object,
    },
    data() {
      return {
        checkStatusOptions: checkStatusOptions,
        compileStatusOptions: compileStatusOptions,
      }
    },
    setup() {
      return {
        Search, Refresh, FolderAdd, FolderOpened
      }
    },
    methods: {
      versionCheck() {
        this.$emit('versionCheck');
      },
      createCSVersion(){
        this.$emit('createCSVersion');
      },
      createPointCloud() {
        this.$emit('createPointCloud');
      },
      // createServiceArea() {
      //   this.$emit('createServiceArea');
      // },
      // 筛选查询功能
      onSearch() {
        this.$emit('onSearch')
      },
      // 重置功能
      reSet() {
        this.VersionForm.sortDirection = true
        this.$emit('reSet')
      },
    },
  }
</script>

<style scoped>
  .button_style {
    margin: 5px 6px 0 0;
  }

  .el-form-item{
    margin-bottom: 0;
  }

  .btn-group{
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    align-items: center;
  }
</style>
