<template>
  <!-- 搜索工具栏组件 -->
  <div id="ProcessTool">
    <el-form
      inline
      :data="publishForm"
      label-width="100px"
      style="font-weight: 700"
      ref="form"
      @submit.prevent="onSearch"
    >
      <el-form-item label="版本编号：">
        <el-input v-model.trim="publishForm.releaseVersion" placeholder="请输入版本编号" clearable></el-input>
      </el-form-item>
      <el-form-item label="前继版本编号：" label-width="120px">
        <el-input v-model.trim="publishForm.parentReleaseVersion" placeholder="请输入前继版本编号" clearable></el-input>
      </el-form-item>
      <el-form-item label="大版发布版本编号：" label-width="140px">
        <el-input v-model.trim="publishForm.baseLineVersion" placeholder="请输入大版发布版本编号" clearable></el-input>
      </el-form-item>
      <el-form-item label="编译版本号：">
        <el-input v-model.trim="publishForm.ndsVersion" placeholder="请输入编译版本号" clearable></el-input>
      </el-form-item>
      <el-form-item label="版本名称：">
        <el-input v-model.trim="publishForm.descName" placeholder="请输入版本名称" clearable></el-input>
      </el-form-item>
      <el-form-item label="版本类型：">
          <el-select v-model="publishForm.releaseTemplate" placeholder="请选择版本类型" style="width: 160px">
            <el-option v-for="item in releaseTemplateOptions" :key="item.code" :label="item.name" :value="item.code" />
          </el-select>
      </el-form-item>
      <el-form-item label="版本状态：">
          <el-select v-model="publishForm.releaseStatus" placeholder="请选择版本状态" style="width: 160px">
            <el-option v-for="item in releaseStatusOptions" :key="item.code" :label="item.name" :value="item.code" />
          </el-select>
      </el-form-item>
      <el-form-item label="创建人：" label-width="140px">
        <el-input v-model.trim="publishForm.owner" placeholder="请输入创建人" clearable></el-input>
      </el-form-item>
      <el-form-item label="创建时间：">
        <el-date-picker
          v-model="createTime"
          type="datetimerange"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 380px"
          range-separator="至"
          start-placeholder="任务创建时间区间开始"
          end-placeholder="任务创建时间区间结束"
        >
        </el-date-picker>
      </el-form-item>
  
      <el-form-item label="完成时间：">
        <el-date-picker
          v-model="completeTime"
          type="datetimerange"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 380px"
          range-separator="至"
          start-placeholder="任务完成时间区间开始"
          end-placeholder="任务完成时间区间结束"
        >
        </el-date-picker>
      </el-form-item>
      <div class="operation">
        <el-button :icon="Search" type="primary" native-type="submit">查询</el-button>
        <el-button :icon="Refresh" @click="reSet">重置</el-button>
        <el-button :icon="FolderAdd" type="success" @click="createButton">创建版本</el-button>
        <el-button :icon="Delete" type="danger" @click="cancelBtn">取消版本</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus';
import { Search, Refresh, FolderAdd, Delete, RefreshRight } from '@element-plus/icons-vue';

//   const nioTaskURL = window.api.nioTaskURL;

//   if (nioTaskURL === null || nioTaskURL === undefined) {
//     console.log("获取nioTaskURL失败" + nioTaskURL)
//   }

export default {
  name: 'PublishPageTool',
  // 接收父组件传来的参数
  props: {
    publishForm: Object,
    releaseTemplateOptions: Array,
    releaseStatusOptions: Array,
  },
  data() {
    return {
      createTime: [],
      startUpTime: [],
      completeTime: [],
    };
  },
  setup() {
    return {
      //icon
      Search,
      Refresh,
      FolderAdd,
      Delete,
    };
  },
  methods: {
    createButton() {
      this.$emit('createButton');
    },
    cancelBtn() {
      this.$emit('cancelBtn');
    },
    // 筛选查询功能
    onSearch() {
      if (this.createTime !== null && this.createTime.length !== 0) {
        this.publishForm.createStartTs = this.changeTime(this.createTime[0]);
        this.publishForm.createEndTs = this.changeTime(this.createTime[1]);
      } else {
        this.publishForm.createStartTs = '';
        this.publishForm.createEndTs = '';
      }
     
      if (this.completeTime !== null && this.completeTime.length !== 0) {
        this.publishForm.completeStartTs = this.changeTime(this.completeTime[0]);
        this.publishForm.completeEndTs = this.changeTime(this.completeTime[1]);
      } else {
        this.publishForm.completeStartTs = '';
        this.publishForm.completeEndTs = '';
      }
      this.$emit('onSearch');
    },

    //YYYY-MM-DD hh:mm:ss格式转换为时间戳
    changeTime(time) {
      var timesTamp = Date.parse(new Date(time));
      return timesTamp
    },

    // 重置功能
    reSet() {
      (this.createTime = []), (this.startUpTime = []), (this.completeTime = []), this.$emit('reSet');
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
