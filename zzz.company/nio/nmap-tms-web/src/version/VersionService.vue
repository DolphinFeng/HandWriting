<template>
  <div id="version-service">
    <div class="service-style">
      <el-form
        :model="serviceForm"
        ref="serviceForm"
        label-position="right"
        label-width="100px"
        id="formId"
        :rules="rules"
      >
        <el-form-item prop="productIdentity" label="产品名称">
          <el-input v-model="serviceForm.productIdentity" placeholder="请输入产品名称" clearable class="lineClass"></el-input>
        </el-form-item>
        <el-form-item prop="descName" label="版本说明">
          <el-input v-model="serviceForm.descName" placeholder="请输入版本说明" clearable class="lineClass"></el-input>
        </el-form-item>
        <el-form-item prop="branch" label="分支名称">
          <el-input v-model="serviceForm.branch" placeholder="请输入分支名称" clearable class="lineClass"></el-input>
        </el-form-item>
        <el-form-item prop="referenceProduct" label="底图依赖">
          <el-input v-model="serviceForm.referenceProduct" placeholder="请输入底图依赖" clearable class="lineClass"></el-input>
        </el-form-item>
        <el-form-item prop="owner" label="作者">
          <el-input v-model="serviceForm.owner" placeholder="请输入作者名称" clearable class="lineClass"></el-input>
        </el-form-item>
        <el-form-item prop="isCompile" label="是否到编译：">
          <el-switch active-text="是" inactive-text="否" inline-prompt v-model="serviceForm.isCompile" placeholder="是否到编译阶段" class="lineClass"></el-switch>
        </el-form-item>
        <div style="text-align: center;">
          <el-button type="primary" @click="handelService" style="width: 100px;">提交</el-button>
          <el-button @click="$parent.$data.breadcrumbServiceShow=false" style="width: 100px;">取消</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "VersionService",
  props: {
    serviceForm: Object,
  },
  data() {
    return {
      // 设置表单的填写规则
      rules: {
        productIdentity: [
          {required: true, message: '产品名称必填', trigger: 'change'},
        ],
        referenceProduct: [
          {required: true, message: '底图依赖必填', trigger: 'change'},
        ]
      }
    }
  },
  methods: {
    handelService() {
      this.$emit("handelService");
    }
  }
}
</script>

<style scoped>
#version-service{
  margin: 5px 20px 10px 20px;
  height: calc(100% - 40px);
  font-size: 14px;
}

.service-style{
  width: calc(100% - 40px) !important;
  height: auto;
  margin: 10px 30px 0 0;
  padding: 10px 20px 0 80px;
}

.lineClass {
  width: 500px;
  word-break: break-all;
  padding: 2px 0 0 0;
  line-height: 25px
}
</style>
