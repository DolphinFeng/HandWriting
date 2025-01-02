<template>
  <div id="version-cs">
    <div class="service-style">
      <el-form
        :model="crowdsourcingForm"
        ref="crowdsourcingForm"
        label-position="right"
        label-width="150px"
        id="formId"
        :rules="rules"
      >
        <el-form-item prop="productIdentity" label="产品名称">
          <el-input v-model="crowdsourcingForm.productIdentity" placeholder="请输入产品名称" clearable class="lineClass"></el-input>
        </el-form-item>
        <el-form-item prop="descName" label="版本说明">
          <el-input v-model="crowdsourcingForm.descName" placeholder="请输入版本说明" clearable class="lineClass"></el-input>
        </el-form-item>
        <el-form-item prop="branch" label="分支名称">
          <el-input v-model="crowdsourcingForm.branch" placeholder="请输入分支名称" clearable class="lineClass"></el-input>
        </el-form-item>
        <el-form-item prop="owner" label="作者">
          <el-input v-model="crowdsourcingForm.owner" placeholder="请输入作者名称" clearable class="lineClass"></el-input>
        </el-form-item>
        <el-form-item prop="compileMeta" label="编译参数信息">
          <el-input v-model="crowdsourcingForm.compileMeta" placeholder="请输入编译参数信息" clearable class="lineClass"></el-input>
        </el-form-item>
        <el-form-item prop="baseNdsReleaseVersion" label="基础地图版本">
          <el-input v-model="crowdsourcingForm.baseNdsReleaseVersion" placeholder="请输入基础地图版本" clearable class="lineClass"></el-input>
        </el-form-item>
        <el-form-item prop="rampProductName" label="匝道产品库">
          <el-input v-model="crowdsourcingForm.rampProductName" placeholder="请输入匝道产品库" clearable class="lineClass"></el-input>
        </el-form-item>
        <el-form-item prop="rampProductBranch" label="匝道产品库分支">
          <el-input v-model="crowdsourcingForm.rampProductBranch" placeholder="请输入匝道产品库分支" clearable class="lineClass"></el-input>
        </el-form-item>
        <el-form-item prop="isCompile" label="是否到编译：">
          <el-switch active-text="是" inactive-text="否" inline-prompt v-model="crowdsourcingForm.isCompile" placeholder="是否到编译阶段" class="lineClass"></el-switch>
        </el-form-item>
        <el-form-item prop="isRampMerge" label="是否融合匝道：">
          <el-switch active-text="是" inactive-text="否" inline-prompt v-model="crowdsourcingForm.isRampMerge" placeholder="是否融合匝道" class="lineClass"></el-switch>
        </el-form-item>
        <el-form-item prop="isMergeSd" label="是否SD内化：">
          <el-switch active-text="是" inactive-text="否" inline-prompt v-model="crowdsourcingForm.isMergeSd" placeholder="是否SD内化" class="lineClass"></el-switch>
        </el-form-item>
        <el-form-item prop="specification" label="数据规格：" style="margin-left: 10px" name="numberStatus">
          <el-select v-model="crowdsourcingForm.specification" placeholder="请选择数据规格" clearable style="width: 200px">
            <el-option
                v-for="item in specificationCsOptions"
                :key="item.code"
                :label="item.name"
                :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>
        <div style="text-align: center;">
          <el-button type="primary" @click="handelCS" style="width: 100px;" :loading="btnLoading">提交</el-button>
          <el-button @click="$parent.$data.breadcrumbCSVersionShow=false" style="width: 100px;">取消</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "VersionCS",
  props: {
    crowdsourcingForm: Object,
    specificationCsOptions: Array,
  },
  data() {
    return {
      // 设置表单的填写规则
      rules: {
        productIdentity: [
          {required: true, message: '产品名称必填', trigger: 'change'},
        ],
        branch: [
          {required: true, message: '分支必填', trigger: 'change'},
        ]
      },
      btnLoading : false
    }
  },
  methods: {
    handelCS() {
      this.btnLoading = true;
      this.$emit("handelCS");
      this.btnLoading = false;
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
