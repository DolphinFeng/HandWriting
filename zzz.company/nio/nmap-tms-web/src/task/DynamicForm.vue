<template>
  <!-- 任务详情表单 -->
  <!--  <NioDynamicForm></NioDynamicForm>-->
  <div>
    <el-form inline :data="createForm" label-position="right" label-width="160px" ref="form">
      <el-form-item label="任 务 ID：" v-if="!LineShow.value">
        <el-input v-model.trim="createForm.id" style="width: 260px" disabled></el-input>
      </el-form-item>
      <el-form-item label="任务名称：">
        <el-input v-model.trim="createForm.name" placeholder="任务名称(必填)" style="width: 260px" clearable
                  v-if="editShow.value"></el-input>
        <el-input v-model.trim="createForm.name" style="width: 260px" disabled v-else></el-input>
      </el-form-item>
      <el-form-item label="任务备注：">
        <el-input v-model.trim="createForm.remark" placeholder="任务备注" style="width: 582px;" clearable
                  v-if="editShow.value"></el-input>
        <el-input v-model.trim="createForm.remark" style="width: 582px;" disabled v-else></el-input>
      </el-form-item>
      <el-form-item label="优 先 级：">
        <template v-if="editShow.value">
          <el-select v-model="createForm.priority" style="width: 260px" placeholder="任务优先级(必填)" filterable>
            <el-option
                v-for="item in priorityOptions"
                :key="item.code"
                :label="item.name"
                :value="item.code">
            </el-option>
          </el-select>
        </template>
        <!--仅显示不可更改即可-->
        <el-select v-model="createForm.priority" style="width: 260px" disabled v-else>
          <el-option
              v-for="item in priorityOptions"
              :key="item.code"
              :label="item.name"
              :value="item.code">
          </el-option>
        </el-select>
        <!--        <el-input v-model="createForm.priority" style="width: 260px" disabled v-else></el-input>-->
      </el-form-item>
      <el-form-item label="任务类型：">
        <el-select v-model="createForm.type" style="width: 260px;" placeholder="任务类型(必填)" clearable
                   @change="dynamicForm(createForm.type)" v-if="LineShow.value">
          <el-option
              v-for="item in taskTypeForCreateOptions"
              :key="item.code"
              :label="item.name"
              :value="item.code">
          </el-option>
        </el-select>
        <el-select v-model="createForm.type" style="width: 260px" disabled v-else>
          <el-option
              v-for="item in taskTypeOptions"
              :key="item.code"
              :label="item.name"
              :value="item.code">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-for="item in formProperty" :key="item.id" :label="item.name+'：'">
        <el-input :disabled="!editShow.value" v-model.trim="item.formValue" :placeholder="item.name+'（必填）'"
                  style="width: 260px" clearable v-if="item.required && item.type === 'string'"></el-input>
        <el-input :disabled="!editShow.value" v-model.trim="item.formValue" :placeholder="item.name"
                  style="width: 260px" clearable v-if="!item.required && item.type === 'string'"></el-input>
        <el-input :disabled="!editShow.value" v-model.trim="item.formValue" :placeholder="item.name+'（必填）'"
                  style="width: 260px" clearable @change="getNum(item)"
                  v-if="item.required && item.type === 'long'"></el-input>
        <el-input :disabled="!editShow.value" v-model.trim="item.formValue" :placeholder="item.name"
                  style="width: 260px" clearable @change="getNum(item)"
                  v-if="!item.required && item.type === 'long'"></el-input>
        <el-select :disabled="!editShow.value" v-model="item.formValue"
                   :placeholder="item.required ? item.name +'（必填）' : item.name" style="width: 260px" clearable
                   v-if="item.type === 'enum'">
          <el-option
              v-for="i in item.enumValues"
              :key="i.id"
              :label="i.name"
              :value="i.id">
          </el-option>
        </el-select>
        <el-select :disabled="!editShow.value" v-model="item.formValue"
                   :placeholder="item.required ? item.name +'（必填）' : item.name" style="width: 260px"
                   v-if="item.type === 'boolean'">
          <el-option
              v-for="i in tf_option"
              :key="i.id"
              :label="i.name"
              :value="i.id">
          </el-option>
        </el-select>
        <el-date-picker
            v-model="item.formValue"
            :disabled="!editShow.value"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            :placeholder="item.name + item.required ? '（必填）' : ''"
            size="small"
            style="width: 320px"
            v-if="item.type === 'date'">
        </el-date-picker>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
// 引入js数据
import {priorityOptions} from "../js/task_data";
import NioDynamicForm from "@/components/DynamicForm/NioDynamicForm.vue";

const nioTaskURL = window.api.nioTaskURL;
if (nioTaskURL === null || nioTaskURL === undefined) {
  console.log("获取nioTaskURL失败" + nioTaskURL)
}

export default {
  name: "DynamicForm",
  components: {NioDynamicForm},
  // 接收父组件传来的参数
  props: {
    createForm: Object,
    taskTypeOptions: Array,
    taskTypeForCreateOptions: Array,
    formProperty: Array,
    editShow: Object,
    LineShow: Object
  },
  data() {
    return {
      // 是否选项数据源
      tf_option: [
        {id: 1, name: '是'},
        {id: 0, name: '否'},
      ],
      // 优先级数据集
      priorityOptions: priorityOptions,
    }
  },
  methods: {
    // 动态form表单数据获取
    dynamicForm(value) {
      this.$emit('dynamicForm', value)
    },
    getNum(item) {
      // 只能输入数字
      item.formValue = item.formValue.replace(/[^\d]/g, '');
    },
  },
  mounted() {
    for (let i = 0; i < this.formProperty.length; i++) {

    }
  }
}
</script>

<style scoped>

</style>
