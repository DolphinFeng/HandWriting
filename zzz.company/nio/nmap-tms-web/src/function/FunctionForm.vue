<template>
  <!-- 资源详情表单组件 -->
  <div>
    <!-- 对话框 -->
    <el-dialog
      :title="header"
      v-model="showDialog"
      show-close
      @close="closeAddUpdate"
      width="850px">
      <div style="margin: 0 30px 0 10px">
        <el-form :model="form" ref="form" label-position="right" label-width="120px" id="formId">
          <el-form-item label="接口编码：">
            <el-input v-model="form.code" placeholder="请填写接口编码" style="width:240px" clearable v-if="is_add"></el-input>
            <div style="width:260px" v-else>{{ form.code }}</div>
          </el-form-item>
          <el-form-item label="接口名称：">
            <el-input v-model="form.name" placeholder="请填写接口名称" style="width:240px" clearable></el-input>
          </el-form-item>
          <el-form-item label="请求地址：">
            <el-input v-model="form.url" placeholder="请填写请求地址" style="width:600px" clearable></el-input>
          </el-form-item>
          <el-form-item label="请求方法：">
            <el-radio-group v-model="form.method">
              <el-radio-button size="small" label="POST">POST</el-radio-button>
              <el-radio-button size="small" label="GET">GET</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="请求内容类型：">
            <el-radio-group v-model="form.contentType">
              <el-radio-button size="small" label="JSON">JSON</el-radio-button>
              <el-radio-button size="small" label="FORM">FORM</el-radio-button>
              <el-radio-button size="small" label="NONE">无</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="请求内容：">
            <el-input type="textarea" :rows="5" placeholder="请填写请求内容" v-model="form.body" style="width:600px" clearable>
            </el-input>
          </el-form-item>
          <el-form-item label="超时时间：">
            <el-input v-model.trim="form.timeout" placeholder="请填写超时时间" style="width:200px" clearable @change="changeNum(1)"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer class="dialog-footer">
        <el-button @click="closeAddUpdate" style="width: 120px">取消</el-button>
        <el-button type="primary" v-if="is_add" @click="addFun" style="margin-left: 30px;width: 120px">保存</el-button>
        <el-button type="primary" v-else @click="updateFun" style="margin-left: 30px;width: 120px">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
// 引入js数据
import {methodOptions, contentTypeOptions} from "../js/function_data";

export default {
  name: "ResourceForm",
  // 接收父组件传来的参数
  props: {
    form: Object,
    header: String,
    addUpdateVisible: Boolean,
    is_add: Boolean,
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
      methodOptions: methodOptions,
      contentTypeOptions: contentTypeOptions
    }
  },
  methods: {
    closeAddUpdate() {
      if (this.addUpdateVisible === false) {
        return;
      }
      this.$emit('closeAddUpdate')
    },
    addFun() {
      this.$emit('addFun')
    },
    updateFun() {
      this.$emit('updateFun')
    },
    // 数字检查函数
    changeNum(val) {
      switch (val) {
        case 1:
          this.form.timeout = this.form.timeout.replace(/[^\d]/g, '');
          break;
      }
    }
  },
}
</script>

<style scoped>

#formId :deep(.t-form__label) {
  padding-right: 4px !important;
  width: 170px !important;
}

#itemForm :deep(.t-form__label) {
  padding-right: 4px !important;
  width: 85px !important;
  margin: 5px 0;
  font-size: 17px;
  color: rgb(22, 106, 190);
}
</style>
