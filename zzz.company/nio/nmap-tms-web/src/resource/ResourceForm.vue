<template>
  <!-- 资源详情表单组件 -->
  <div>
    <!-- 对话框 -->
    <el-dialog
      :title="header"
      :visible="addUpdateVisible"
      :show-close="true"
      @close="closeAddUpdate"
      width="850px">
      <div solt="body" style="margin: 0 30px 0 10px">
        <el-form :model="form" ref="form" label-position="right" label-width="120px" id="formId">
          <el-form-item label="资源编码：">
            <el-input v-model.trim="form.code" placeholder="请填写资源编码" clearable v-if="is_add"></el-input>
            <div v-else>{{ form.code }}</div>
          </el-form-item>
          <el-form-item label="资源名称：">
            <el-input v-model.trim="form.name" placeholder="请填写资源名称" clearable></el-input>
          </el-form-item>
          <el-form-item label="容量阈值：">
            <el-input v-model.trim="form.threshold" placeholder="请填写容量阈值" clearable @change="changeNum(1)"></el-input>
          </el-form-item>
          <el-form-item label="资源状态：" v-if="!is_add">
            <template>
              <el-radio v-model="form.status" :label=0>正常</el-radio>
              <el-radio v-model="form.status" :label=1>熔断</el-radio>
            </template>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer" style="text-align: center">
        <el-button variant="outline" @click="closeAddUpdate">取消</el-button>
        <el-button type="primary" v-if="is_add" @click="addFun">保存</el-button>
        <el-button type="primary" v-else @click="updateFun">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// 引入js数据
import {statusOptions} from "../js/resource_data";

export default {
  name: "ResourceForm",
  // 接收父组件传来的参数
  props: {
    form: Object,
    header: String,
    addUpdateVisible: Boolean,
    is_add: Boolean,
  },
  data() {
    return {
      statusOptions: statusOptions
    }
  },
  methods: {
    closeAddUpdate() {
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
          this.form.threshold = this.form.threshold.replace(/[^\d]/g, '');
          break;
        case 2:
          this.form.observeWindow = this.form.observeWindow.replace(/[^\d]/g, '');
          break;
        case 3:
          this.form.failedLimit = this.form.failedLimit.replace(/[^\d]/g, '');
          break;
        case 4:
          this.form.continuousFailedLimit = this.form.continuousFailedLimit.replace(/[^\d]/g, '');
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
