<template>
  <!-- 搜索工具栏组件 -->
  <div id="PackagesTool" :loading="isLoading">
    <el-form inline :data="packageForm" ref="form" @submit.prevent="onSearch">
      <el-form-item label="业务类型:" name="configName">
        <el-input v-model="packageForm.configName" placeholder="请输入套餐名称" style="width: 160px;" clearable></el-input>
      </el-form-item>
      <div>
        <el-button :icon="Search" type="primary" native-type="submit" class="button_style">查询</el-button>
        <el-button :icon="Refresh" @click="reSet" class="button_style">重置</el-button>
        <!-- <el-button :icon="FolderOpened" type="warning" @click="modifyPackage">修改</el-button> -->
        <el-button :icon="FolderAdd" type="success" @click="createAutoQAPackage" class="button_style">新增autoQA套餐</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
// 引入js数据
import { Search, Refresh, FolderAdd, FolderOpened } from "@element-plus/icons-vue";

export default {
  name: "PackagesTool",
  // 接收父组件传来的参数
  props: {
    isLoading: Boolean
  },
  data() {
    return {
      packageForm: {
        configName: null,
        configDesc: null,
        algVsn: null,
        operator: null
      }
    }
  },
  setup() {
    return {
      Search, Refresh, FolderAdd, FolderOpened
    }
  },
  methods: {
    onSearch() {
      this.$emit('onSearch', this.packageForm)
    },
    reSet() {
      this.packageForm = {
        configName: null,
        configDesc: null,
        algVsn: null,
        operator: null
      };
    },
    modifyPackage() {
      this.$emit('modify')
    },
    createAutoQAPackage(){
			this.$emit('create')
		}
  }
}
</script>

<style scoped>
#PackagesTool {
  padding: 5px 0 5px 20px;
  text-align: left;
  color: black;
  font-size: 15px;
}

.el-form-item {
  margin-bottom: 10px;
}
</style>
