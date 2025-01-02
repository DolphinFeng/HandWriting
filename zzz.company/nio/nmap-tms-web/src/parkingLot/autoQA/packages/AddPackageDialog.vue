<template>
  <!-- 创建套餐对话框 -->
  <el-dialog
    title="新增autoQA套餐"
    v-model="packageDialogVisible"
    show-close
    @close="closeForm"
    width="500px">
    <el-form :model="packageForm" ref="formRef" label-position="right" label-width="120px" :rules="rules">
      <el-form-item label="套餐配置名：" prop="configName">
        <el-input v-model="packageForm.configName" placeholder="请输入配置名" clearable></el-input>
      </el-form-item>
      <el-form-item label="套餐配置描述：" prop="configDesc">
        <el-input v-model="packageForm.configDesc" placeholder="请输入配置描述" clearable></el-input>
      </el-form-item>
      <el-form-item prop="jsonFile">
        <el-upload
          class="upload-jsonFile"
          ref="upload"
          v-model:file-list="uploadFileList"
          :on-success="handleSuccess"
          :on-error="handleError"
          accept="text/json"
          :auto-upload="false">
          <el-button size="small" type="primary">选取文件</el-button>
          <div slot="tip" class="el-upload__tip">请上传⽂件后缀是 .json 的套餐配置文件</div>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer class="dialog-footer">
      <el-button type="success" @click="handleStoreForm">保存</el-button>
      <el-button @click="closeForm">取消</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { ElMessage } from "element-plus";

export default {
  name: "AddPackageDialog",
  // 接收父组件传来的参数
  props: {
    showDialog: Boolean,
    packageEditData: Object | null
  },
  watch: {
    packageEditData: (newVal, ) => {
      if (newVal === null) {
        this.packageForm = {
          configName: null,
          configDesc: null,
          algVsn: null,
          configFile: null
        };
      } else {
        this.packageForm = newVal;
      }
    }
  },
  computed: {
    packageDialogVisible: {
      get() {
        return this.showDialog;
      },
      set(value) {
      }
    }
  },
  data() {
    return {
      packageForm: {
        configName: null,
        configDesc: null,
        algVsn: null,
        configFile: null
      },
      rules: {
        configName: [
          {required: true, message: '套餐名称必填', trigger: 'blur'},
        ]
      },
      uploadFileList: []
    }
  },
  setup() {
    return {
    }
  },
  methods: {
    reSet() {
      this.packageForm = {
        configName: null,
        configDesc: null,
        algVsn: null,
        configFile: null
      };
    },
    handleStoreForm() {
      if (this.uploadFileList.length === 0) {
        ElMessage.error({
          message: '未上传配置文件',
        });
        return;
      }
      this.packageForm.configFile = this.uploadFileList[0].raw
      this.$emit('store', this.packageForm)
    },
    closeForm(){
      if (this.showDialog === false) {
        return;
      }
			this.$emit('close')
		},
    handleSuccess(response, file, ) {
      if (response.code === 200) {
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
    handleError(err, file, ) {
      ElMessage.error({
        message: '文件' + file.name + '上传失败',
        showClose: true,
      });
    }
  }
}
</script>

<style scoped>
.el-upload__tip{
  margin-left: 10px;
  margin-top: 0;
}
</style>
