<template>
  <div id="VersionTool">
    <div id="detailStyle">
      <el-form
        :model="detailForm"
        ref="detailForm"
        label-position="right"
        label-width="135px"
        id="formId"
        :rules="rules"
      >
        <el-form-item prop="productIdentity" label="产品名称：" name="productIdentity">
          <el-input v-model="detailForm.productIdentity" placeholder="请输入产品名称" clearable class="lineClass"></el-input>
        </el-form-item>
        <el-form-item label="版本说明：" name="descName">
          <el-input v-model="detailForm.descName" placeholder="请输入版本说明" clearable class="lineClass"></el-input>
        </el-form-item>
        <el-form-item label="分支名称：" name="branch">
          <el-input v-model="detailForm.branch" placeholder="请输入分支名称" clearable class="lineClass"></el-input>
        </el-form-item>
        <el-form-item prop="rampProductName" label="匝道产品库名称：" name="rampProductName">
          <el-input v-model="detailForm.rampProductName" placeholder="请输入匝道产品名称" clearable class="lineClass"></el-input>
        </el-form-item>
        <el-form-item prop="rampProductBranch" label="匝道产品库分支名称：" name="rampProductBranch">
          <el-input v-model="detailForm.rampProductBranch" placeholder="请输入匝道产品库分支名称" clearable class="lineClass"></el-input>
        </el-form-item>
        <el-form-item prop="isCompile" label="是否到编译：">
          <el-switch active-text="是" inactive-text="否" inline-prompt v-model="detailForm.isCompile" class="lineClass"></el-switch>
        </el-form-item>
        <el-form-item prop="isOddRefresh" label="是否刷ODD：">
          <el-switch active-text="是" inactive-text="否" inline-prompt v-model="detailForm.isOddRefresh" class="lineClass"></el-switch>
        </el-form-item>
        <el-form-item prop="isSpdRefresh" label="是否刷经验限速：">
          <el-switch active-text="是" inactive-text="否" inline-prompt v-model="detailForm.isSpdRefresh" class="lineClass"></el-switch>
        </el-form-item>
        <el-form-item prop="isFullCheck" label="是否全库检查：">
          <el-switch active-text="是" inactive-text="否" inline-prompt v-model="detailForm.isFullCheck" class="lineClass"></el-switch>
        </el-form-item>
        <el-form-item prop="isRunBatchProcess" label="是否批处理：">
          <el-switch active-text="是" inactive-text="否" inline-prompt v-model="detailForm.isRunBatchProcess" class="lineClass"></el-switch>
        </el-form-item>
        <el-form-item prop="isRampMerge" label="是否融合匝道：">
          <el-switch active-text="是" inactive-text="否" inline-prompt v-model="detailForm.isRampMerge" class="lineClass"></el-switch>
        </el-form-item>
      </el-form>
      <div style="margin: 8px 0 20px 0;text-align: center ">
        <el-button type="primary" @click="handelVersion" style="width: 100px">开始执行</el-button>
        <el-button @click="$parent.$data.breadcrumbVersionShow=false" style="width: 100px;margin-left: 20px">取 消</el-button>
      </div>
    </div>
  </div>
</template>

<script>

  export default {
    name: "VersionTool",
    // 接收父组件传来的参数
    props: {
      detailForm: Object,
      VersionId: Number
    },
    data() {
      return {
        // 设置表单的填写规则
        rules: {
          productIdentity: [
            {required: true, message: '产品名称必填', trigger: 'change'},
          ],
        }
      }
    },
    methods: {
      // 开始执行
      handelVersion() {
        this.$emit('handelVersion')
      },
    }
  }
</script>

<style scoped>
  #VersionTool {
    margin: 5px 20px 10px 20px;
    height: calc(100% - 40px);
    font-size: 14px;
  }

  #detailStyle {
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
