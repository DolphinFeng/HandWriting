<template>
  <!-- 搜索工具栏组件 -->
  <div>
    <div id="taskTypeSearch">
      <el-form inline :model="taskTypeSearch" id="formDiv" @submit.prevent="onSearch">
        <el-form-item label="类型编码：">
          <el-input v-model.trim="taskTypeSearch.code" placeholder="请输入类型编码" clearable></el-input>
        </el-form-item>
        <el-form-item label="类型名称：">
          <el-input v-model.trim="taskTypeSearch.name" placeholder="请输入类型名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="查看已删除类型：">
          <el-switch v-model="taskTypeSearch.deleted" active-value="1" inactive-value="0"></el-switch>
        </el-form-item>
        <el-form-item>
          <el-button :icon="Search" type="primary" native-type="submit">查询</el-button>
          <el-button :icon="Refresh" @click="resetForm">重置</el-button>
          <el-button :icon="FolderAdd" type="success" @click="createButton">创建类型</el-button>
          <el-button :icon="FolderAdd" type="warning" @click="handleImportBtn">导入配置文件</el-button>
        </el-form-item>
      </el-form>
      <!-- 流程部署对话框 -->
      <el-dialog
          title="导入配置文件"
          v-model="importDialogVisible"
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
          <div slot="tip" class="el-upload__tip">请上传⽂件后缀是 .json 的文件</div>
        </el-upload>
        <template #footer class="dialog-footer">
          <el-button @click="cancelImportBtn">取消</el-button>
          <el-button type="primary" @click="submitImport">导入</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import {Search, Refresh, FolderAdd} from "@element-plus/icons-vue";
import {ElMessage} from "element-plus";

const nioTaskURL = window.api.nioTaskURL;
if (nioTaskURL === null || nioTaskURL === undefined) {
  console.log("获取nioTaskURL失败" + nioTaskURL);
}

export default {
  name: "TaskTypeSearch",
  // 接收父组件传来的参数
  props: {
    taskTypeSearch: Object,
  },
  data() {
    return {
      action: nioTaskURL + "/task-type/deploy",
      tips: '请上传⽂件后缀是  .json  的文件',
      files: [],
      importDialogVisible: false,
      fileList: []
    }
  },
  setup() {
    return {
      Search, Refresh, FolderAdd,
    }
  },
  methods: {
    // 筛选查询功能
    onSearch() {
      this.$emit("onSearch");
    },
    // 重置功能
    resetForm() {
      this.$emit("resetForm");
    },
    // 创建任务按钮
    createButton() {
      this.$emit("createButton");
    },
    // 导入按钮
    submitImport() {
      this.$refs.upload.submit();
    },
    handleImportBtn() {
      this.importDialogVisible = true
    },
    cancelImportBtn() {
      this.importDialogVisible = false
    },
    handleSuccess(response, file, fileList) {
      if (response.code === 200) {
        this.importDialogVisible = false;
        ElMessage.success({
          message: '文件' + file.name + '导入成功',
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
        message: '文件' + file.name + '导入失败',
        showClose: true,
      });
    }
  },
};
</script>

<style scoped>
#taskTypeSearch {
  padding: 5px 0 5px 20px;
  text-align: left;
  color: black;
  font-size: 15px;
}

.el-form-item {
  margin-bottom: 0;
}
</style>
