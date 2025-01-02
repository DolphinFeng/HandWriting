<template>
  <!-- 创建套餐对话框 -->
  <el-dialog
    title="创建版本"
    v-model="dialogVisible"
    show-close
    @close="closeForm"
    width="500px">
    <el-form :model="dataForm" ref="formRef" label-position="right" label-width="120px" :rules="rules">
      <el-form-item label="版本名称：" prop="name">
        <el-input v-model="dataForm.name" placeholder="请输入版本名称" clearable></el-input>
      </el-form-item>
      <el-form-item label="版本描述：" prop="description">
        <el-input v-model="dataForm.description" type="textarea" placeholder="请输入版本描述" clearable></el-input>
      </el-form-item>
    </el-form>
    <template #footer class="dialog-footer">
      <el-button type="success" @click="handleStoreForm">保存</el-button>
      <el-button @click="closeForm">取消</el-button>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: "EditVersionDialog",
  // 接收父组件传来的参数
  props: {
    showDialog: Boolean,
    editData: Object | null
  },
  watch: {
    editData: {
      immediate: true,
      handler(value) {
        if (this.$refs.formRef) {
          this.$refs.formRef.resetFields();
        }
        if (!value) {
          this.reSet();
        } else {
          this.dataForm = value;
        }
      }
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.showDialog;
      },
      set(value) {
      }
    }
  },
  data() {
    return {
      dataForm: {
        version: null,
        name: null,
        description: null,
      },
      rules: {
        name: [
          {required: true, message: '版本名称必填', trigger: 'blur'},
        ]
      }
    }
  },
  setup() {
    return {
    }
  },
  methods: {
    reSet() {
      this.dataForm = {
        version: null,
        name: null,
        description: null,
      };
    },
    handleStoreForm() {
      this.$emit('store', this.dataForm)
    },
    closeForm(){
      if (this.showDialog === false) {
        return;
      }
			this.$emit('close', this.dataForm)
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
