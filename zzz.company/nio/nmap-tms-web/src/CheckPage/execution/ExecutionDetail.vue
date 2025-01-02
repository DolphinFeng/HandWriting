<template>
  <!-- 执行检查组件 -->
  <div id="ExecutionTool">
    <div id="detailStyle">
      <el-form
          ref="executionFormRef"
          :model="detailForm"
          label-position="right"
          label-width="130px"
          id="formId"
          :rules="rules"
      >
        <el-form-item prop="suiteCode" label="检查套餐：">
          <el-input v-model="detailForm.suiteCode" placeholder="请输入检查套餐" clearable class="lineClass"></el-input>
        </el-form-item>
        <el-form-item prop="runEngine" label="执行引擎：" class="detailHelp">
          <el-select
              v-model="detailForm.runEngine"
              placeholder="请选择执行引擎"
              clearable
              class="lineClass"
          >
            <el-option
                v-for="item in runEngine"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="targetProductName" label="目标产品名称：">
          <el-input v-model="detailForm.targetProductName" placeholder="请输入目标产品名称" clearable class="lineClass"></el-input>
        </el-form-item>
        <el-form-item prop="targetBranchName" label="目标产品分支：" class="detailHelp">
          <el-input v-model="detailForm.targetBranchName" placeholder="请输入目标产品分支" clearable class="lineClass"></el-input>
        </el-form-item>
        <el-form-item prop="edgeProductName" label="接边产品名称：" name="target_product_tag">
          <el-input v-model="detailForm.edgeProductName" placeholder="请输入接边产品名称" clearable class="lineClass"></el-input>
        </el-form-item>
        <el-form-item prop="edgeTagName" label="接边产品标签：" class="detailHelp">
          <el-input v-model="detailForm.edgeTagName" placeholder="请输入接边产品标签" clearable @change="changeNum" class="lineClass"></el-input>
        </el-form-item>
      </el-form>
      <div style="margin: 8px 0 20px 0;text-align: center ">
        <el-button :loading="subLoading" type="primary" @click="handelExecution" class="button_style" style="width: 100px">开始执行</el-button>
        <el-button @click="cancel" class="button_style" style="width: 100px;margin-left: 20px">取 消</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import {ElMessage} from "element-plus";

const nioCheckURL = window.api.nioCheckURL;

export default {
  name: "ExecutionTool",
  // 接收父组件传来的参数
  props: {
    detailForm: Object,
    ExecutionId: Number
  },
  data() {
    return {
      subLoading: false,
      meshes: '',
      // 设置表单的填写规则
      rules: {
        suiteCode: [
          {required: true, message: '检查套餐必填', trigger: 'blur'},
        ],
        runEngine: [
          {required: true, message: '执行引擎必填', trigger: 'blur'},
        ],
        targetProductName: [
          {required: true, message: '目标产品名称必填', trigger: 'blur'},
        ],
        targetBranchName: [
          {required: true, message: '目标产品分支必填', trigger: 'blur'},
        ],
      }
    }
  },
  setup() {
    const runEngine = [
      {label: 'JAVA', value: 'JAVA'},
      {label: 'CPP', value: 'CPP'},
    ];
    return {
      runEngine,
    }
  },
  methods: {
    cancel() {
      this.$parent.$data.breadcrumbExecutionShow = false;
      this.$store.commit('breadChange', 1);
    },
    // 产生一个uuid
    getUuid() {
      let d = Date.now();
      if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now(); //use high-precision timer if available
      }
      return 'xxxxxxxxxxxxyxxx'.replace(/[xy]/g, function (c) {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    },
    // 执行检查功能
    handelExecution() {
      let form = this.$refs.executionFormRef;
      form.validate((isValid) => {
        if (isValid) {
          this.detailForm.uniqueId = this.getUuid();
          this.subLoading = true;
          axios({
            url: nioCheckURL + '/check-man/run/mesh-val',
            method: 'post',
            data: this.detailForm
          }).then(response => {
            if (response.data.msg === 'successful') {
              ElMessage.success({
                message: '执行检查成功',
                showClose: true,
              });
              // 页面跳转至执行记录
              this.$parent.breadcrumbExecutionShow = false;
              this.$store.commit('breadChange', 1);
              this.$emit('loadingPage');
            } else {
              ElMessage.error({
                message: response.data.msg,
                showClose: true,
              });
            }
          }).catch(() => {
            ElMessage.error({
              message: '执行检查失败',
              showClose: true,
            });
          }).finally(() => {
            this.subLoading = false;
          })
        }
      });
    },
    //数字检查函数
    changeNum() {
      this.meshes = this.meshes.replace(/，/ig, ',').replace(/[\s]*[,][\s]*[,]{1,}([\s]+|[,]+)*/, ',').replace(/[^\d,]/g, '');
      this.detailForm.task_id = this.detailForm.task_id.replace(/[^\d]/g, '');
      this.detailForm.step = this.detailForm.step.replace(/[^\d]/g, '');
    },
  },
}
</script>

<style scoped>
#ExecutionTool {
  margin: 5px 20px 10px 20px;
  height: calc(100% - 40px);
  font-size: 14px;
}

#detailStyle {
  width: 600px !important;
  height: auto;
  margin: 10px auto;
  padding: 10px 20px 0 80px;
}

#formId :deep(.t-form__label) {
  padding-right: 4px !important;
  width: 180px !important;
}

.lineClass {
  width: 350px;
  word-break: break-all;
  padding: 2px 0 0 0;
  line-height: 25px
}

/*提示字体颜色为蓝色*/
.detailHelp :deep(.t-form__help) {
  color: #0052D9;
}

.el-form-item {
  margin-bottom: 15px;
}

</style>
