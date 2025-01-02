<template>
  <div>
    <!-- 新建任务对话框 -->
    <el-dialog
      title="新建任务"
      v-model="showDialog"
      @close="closeAddUpdate"
      width="700px">
      <div style="margin: 0 auto">
        <el-form :model="form" ref="form" label-position="right" label-width="200px" id="formId">
          <el-form-item label="任务类型:" name="taskType">
            <el-select v-model="form.taskType" placeholder="请选择任务类型（必填）" style="width: 360px" clearable @change="dynamicForm(form.taskType)">
              <el-option
                v-for="item in typeOptions"
                :key="item.name"
                :label="item.desc"
                :value="item.name">
              </el-option>
            </el-select>
          </el-form-item>
          <!--任务参数标题-->
          <el-form-item label="任务参数" name="dataType1" v-show="stringListShow"></el-form-item>
          <!--文本输入框-->
          <div v-for="item in stringList" v-if="stringListShow">
            <el-form-item :label="item.desc+':'">
              <el-input v-if="item.type === 'STRING'" v-model.trim="item.formValue" :placeholder="getPlaceholder(item.tips, item.required)" style="width: 360px" clearable :maxlength="256"></el-input>
              <el-input v-else-if="item.type === 'TEXTAREA'" type="textarea" v-model.trim="item.formValue" :placeholder="getPlaceholder(item.tips, item.required)" style="width: 360px" clearable :max="3"></el-input>
              <el-input-number v-else-if="item.type === 'NUMBER'" v-model="item.formValue" :placeholder="getPlaceholder(item.tips, item.required)" :step="1"></el-input-number>
              <el-switch v-else-if="item.type === 'BOOLEAN'" v-model="item.formValue" active-text="是" inactive-text="否"></el-switch>
            </el-form-item>
          </div>
        </el-form>
      </div>
      <template #footer class="dialog-footer" style="text-align: center">
        <el-button @click="closeAddUpdate">取消</el-button>
        <el-button type="primary" @click="addFun">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
  // 引入js数据
  import {statusOptions} from "@/js/resource_data";

  export default {
    name: "MaterialForm",
    // 接收父组件传来的参数
    props: {
      form: Object,
      addVisible: Boolean,
      typeOptions: Array,
      stringList: Array,
      stringListShow: Boolean,
    },
    computed: {
      showDialog: {
        get() {
          return this.addVisible;
        },
        set(value) {
        }
      }
    },
    data() {
      return {
        // 资源状态
        statusOptions: statusOptions
      }
    },
    methods: {
      // 动态form表单数据获取
      dynamicForm(value) {
        this.$emit('dynamicForm', value)
      },
      // 关闭对话框
      closeAddUpdate() {
        if (this.addVisible === false) {
          return;
        }
        this.$emit('closeAddUpdate')
      },
      // 新建任务功能
      addFun() {
        this.$emit('addFun')
      },
      getPlaceholder(desc, required) {
        return `${desc}${required ? '(必填)' : '(非必填)'}`;
      }
    },
    mounted() {
      console.log(this.stringList);
    }
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

  .el-form-item {
    margin-bottom: 10px;
  }
</style>
