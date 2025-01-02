<template>
  <!-- 资源详情表单组件 -->
  <div>
    <!-- 对话框 -->
    <el-dialog
      :title="header"
      v-model="showDialog"
      show-close
      @close="closeAddUpdate"
      width="600px">
      <div style="margin: 0 30px 0 10px">
        <el-form :model="form" label-position="right" label-width="200px" id="formId">
          <el-form-item label="类型编码：">
            <el-input v-model.trim="form.code" placeholder="请填写类型编码" style="width: 300px" clearable v-if="is_add"></el-input>
            <div style="width: 260px" v-else>{{ form.code }}</div>
          </el-form-item>
          <el-form-item label="类型名称：">
            <el-input v-model.trim="form.name" placeholder="请填写类型名称" style="width: 300px" clearable></el-input>
          </el-form-item>
          <el-form-item label="关联表单：">
            <el-select v-model.trim="form.formCode" placeholder="请选择关联表单" style="width: 300px" clearable>
              <el-option
                  v-for="item in relateForm"
                  :label="item.name"
                  :key="item.code"
                  :value="item.code"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="关联流程：">
            <el-select v-model="form.procDefKey" filterable placeholder="请输入流程名称" style="width: 300px">
              <el-option
                  v-for="item in processList"
                  :key="item.key"
                  :label="item.name"
                  :value="item.key">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="是否支持手动创建任务：">
            <el-radio-group v-model="form.manualCreate">
              <el-radio :label="0">否</el-radio>
              <el-radio :label="1">是</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="是否删除：" v-if="!is_add">
            <el-radio-group v-model="form.deleted">
              <el-radio :label="0">否</el-radio>
              <el-radio :label="1">是</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="是否开启消息订阅：" v-if="!is_add">
            <el-radio-group v-model="form.notifyMessage">
              <el-radio :label="0">否</el-radio>
              <el-radio :label="1">是</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
      <template #footer class="dialog-footer">
        <el-button @click="closeAddUpdate">取消</el-button>
        <el-button type="primary" v-if="is_add" @click="addFun">保存</el-button>
        <el-button type="primary" v-else @click="updateFun">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
// 引入js数据
import {deletedOptions} from "../js/taskType_data.js";
export default {
  name: "TaskTypeForm",
  // 接收父组件传来的参数
  props: {
    form: Object,
    header: String,
    addUpdateVisible: Boolean,
    is_add: Boolean,
    processList: Array,
    relateForm: Object,
  },
  computed: {
    showDialog: {
      get() {
        return this.addUpdateVisible;
      },
      set(value) {
      }
    }
  },
  data() {
    return {
      deletedOptions: deletedOptions,
      processOptions: []
    };
  },
  methods: {
    closeAddUpdate() {
      if (this.addUpdateVisible === false) {
        return;
      }
      this.$emit("closeAddUpdate");
    },
    addFun() {
      this.$emit("addFun");
    },
    updateFun() {
      this.$emit("updateFun");
    },
  },
};
</script>

<style scoped>
:deep(.el-form-item__label) {
  font-weight: 700;
}
</style>
