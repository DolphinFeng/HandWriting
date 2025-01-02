<template>
  <!-- 搜索工具栏组件 -->
  <div id="ProcessTool">
    <el-form inline :data="searchForm" @submit.prevent="onSearch">
      <el-form-item label="流程编码：">
        <el-input v-model.trim="searchForm.key" placeholder="请输入流程编码" @change="changeNum(1)" clearable></el-input>
      </el-form-item>
      <el-form-item label="流程名称：">
        <el-input v-model.trim="searchForm.name" placeholder="请输入流程名称" @change="changeNum(2)" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button :icon="Search" type="primary" native-type="submit">查询</el-button>
        <el-button :icon="Refresh" @click="resetForm">重置</el-button>
        <el-button :icon="FolderAdd" type="success" @click="handleBtn">流程部署</el-button>
      </el-form-item>
    </el-form>
    <!-- 流程部署对话框 -->
    <el-dialog
      title="流程部署"
      v-model="processVisible"
      width="600px">
      <el-upload
        class="upload-demo"
        ref="upload"
        :action="action"
        :on-success="handleSuccess"
        :on-error="handleError"
        :file-list="fileList"
        accept="text/bpmn"
        :auto-upload="false">
        <el-button size="small" type="primary">选取文件</el-button>
        <div slot="tip" class="el-upload__tip">请上传⽂件后缀是 .bpmn 的文件</div>
      </el-upload>
      <template #footer class="dialog-footer">
        <el-button @click="cancelBtn">取消</el-button>
        <el-button type="primary" @click="submitUpload">部署</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {Search, Refresh, FolderAdd} from "@element-plus/icons-vue";
import {ElMessage} from "element-plus";

const nioTaskURL = window.api.nioTaskURL;

if (nioTaskURL === null || nioTaskURL === undefined) {
  console.log("获取nioTaskURL失败" + nioTaskURL)
}

export default {
  name: "ProcessTool",
  // 接收父组件传来的参数
  props: {
    searchForm: Object,
  },
  data() {
    return {
      action: nioTaskURL + "/process/deploy",
      tips: '请上传⽂件后缀是  .bpmn  的文件',
      files: [],
      processVisible: false,
      fileList: []
    }
  },
  setup() {
    return {
      Search, Refresh, FolderAdd,
    }
  },
  methods: {
    handleBtn() {
      this.processVisible = true
    },
    cancelBtn() {
      this.processVisible = false
    },
    submitUpload() {
      this.$refs.upload.submit();
    },
    handleSuccess(response, file, fileList) {
      if (response.code === 200) {
        this.processVisible = false;
        ElMessage.success({
          message: '文件' + file.name + '上传成功',
          showClose: true,
        });
      } else {
        ElMessage.error({
          message: response.msg,
          showClose: true,
        });
      }
    },
    handleError(err, file, fileList) {
      ElMessage.error({
        message: '文件' + file.name + '上传失败',
        showClose: true,
      });
    },
    // 数字检查函数
    changeNum(val) {
      this.$emit('changeNum', val)
    },
    // 筛选查询功能
    onSearch() {
      this.$emit('onSearch')
    },
    // 重置功能
    resetForm() {
      this.$emit('resetForm')
    },
  },
}
</script>

<style scoped>
#ProcessTool {
  padding: 5px 0 5px 20px;
  text-align: left;
  color: black;
  font-size: 15px;
}

.el-form-item {
  margin-bottom: 0;
}
</style>
