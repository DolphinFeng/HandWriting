<template>
  <!-- 创建套餐对话框 -->
  <el-dialog
      title="创建套餐"
      v-model="showDialog"
      show-close
      @close="closeForm"
      width="500px">
    <el-form :model="createForm" ref="formRef" label-position="right" label-width="100px" :rules="rules">
      <el-form-item label="套餐编号：" prop="suiteCode">
        <el-input v-model="createForm['suiteCode']" placeholder="请输入套餐编号" clearable></el-input>
      </el-form-item>
      <el-form-item label="套餐名称：" prop="suiteName">
        <el-input v-model="createForm['suiteName']" placeholder="请输入套餐名称" clearable></el-input>
      </el-form-item>
      <el-form-item label="套餐描述：" prop="suiteDesc">
        <el-input v-model="createForm['suiteDesc']" placeholder="请输入套餐描述" clearable></el-input>
      </el-form-item>
      <el-form-item label="备注：" prop="opMsg">
        <el-input v-model="createForm['opMsg']" placeholder="请输入备注" clearable></el-input>
      </el-form-item>
    </el-form>
    <template #footer class="dialog-footer">
      <el-button @click="closeForm">取 消</el-button>
      <el-button @click="handleCreateForm" type="primary">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script>
import {nextTick, reactive, ref} from "vue";

export default {
  name: "CheckAddForm",
  props: {
    createForm: Object,
    createFormVisible: Boolean,
  },
  computed: {
    showDialog: {
      get() {
        return this.createFormVisible;
      },
      set(value) {
      }
    }
  },
  emits: {
    'handleCreateForm': null,
    'closeForm': null,
  },
  setup(props, {emit}) {
    const rules = reactive({
      suiteCode: [
        {required: true, message: '套餐号必填', trigger: 'blur'},
      ],
      suiteName: [
        {required: true, message: '套餐名称必填', trigger: 'blur'},
      ],
    });
    const formRef = ref(null);
    async function handleCreateForm() {
      await formRef.value.validate((valid, field) => {
        if (valid) {
          emit('handleCreateForm');
        }
      });
    }
    function closeForm() {
      if (props.createFormVisible === false) {
        return;
      }
      emit('closeForm');
      formRef.value.clearValidate();
    }
    return {
      rules, formRef,
      handleCreateForm, closeForm,
    }
  }
}
</script>

<style scoped>

</style>
