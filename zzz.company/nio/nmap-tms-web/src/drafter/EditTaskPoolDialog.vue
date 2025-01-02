<template>
  <!-- 创建任务池对话框 -->
  <el-dialog
    title="创建任务池"
    v-model="dialogVisible"
    show-close
    @close="closeForm"
    width="500px">
    <el-form :model="dataForm" ref="formRef" label-position="right" label-width="180px" :rules="rules">
      <el-form-item label="产品库：" prop="productName">
        <el-input v-model="dataForm.productName" placeholder="请输入产品库" style="width: 200px" clearable></el-input>
      </el-form-item>
      <el-form-item label="产品分支：" prop="productBranch">
        <el-input v-model="dataForm.productBranch" placeholder="请输入产品分支" style="width: 200px" clearable></el-input>
      </el-form-item>
      <el-form-item label="数据规格：" prop="specification">
        <el-select v-model="dataForm.specification" placeholder="请选择数据规格" style="width: 200px" clearable>
          <el-option
            v-for="item in specificationCsOptions"
            :key="item.code"
            :label="item.name"
            :value="item.code">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="任务类型：" prop="taskType">
        <el-select v-model="dataForm.taskType" placeholder="请选择任务类型" style="width: 200px" clearable>
          <el-option
            v-for="item in taskTypeOptions"
            :key="item.code"
            :label="item.name"
            :value="item.code">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="是否需要人工：" prop="manual">
        <el-switch v-model="dataForm.manual"/>
      </el-form-item>
      <el-form-item label="任务范围外方式：" prop="bufferType">
        <el-select v-model="dataForm.bufferType" placeholder="请选择任务范围外方式" style="width: 200px" clearable>
          <el-option
            v-for="item in bufferTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="优先级比较方式：" prop="priorityComparator">
        <el-select v-model="dataForm.priorityComparator" placeholder="请选择优先级比较方式" style="width: 200px" clearable>
          <el-option
            v-for="item in priorityComparatorOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer class="dialog-footer">
      <el-button type="success" @click="handleStoreForm">保存</el-button>
      <el-button @click="closeForm">取消</el-button>
    </template>
  </el-dialog>
</template>

<script>
import axios from "axios";
import { specificationCsOptions } from '@/js/version_data';

const nioTaskURL = window.api.nioTaskURL;

export default {
  name: "EditTaskPoolDialog",
  // 接收父组件传来的参数
  props: {
    showDialog: Boolean,
    editData: Object | null
  },
  watch: {
    editData: {
      immediate: true,
      handler(value) {
        if (this.$refs.formRef) {
          this.$refs.formRef.resetFields();
        }
        if (!value) {
          this.reSet();
        } else {
          this.dataForm = value;
        }
      }
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.showDialog;
      },
      set(value) {
      }
    }
  },
  data() {
    return {
      dataForm: {
        productName: null,
        productBranch: null,
        specification: null,
        taskType: null,
        manual: true,
        bufferType: null,
        priorityComparator: null,
      },
      rules: {
        productName: [
          {required: true, message: '产品库必填', trigger: 'blur'},
        ],
        productBranch: [
          {required: true, message: '产品分支必填', trigger: 'blur'},
        ],
        specification: [
          {required: true, message: '数据规格必选', trigger: 'blur'},
        ],
        taskType: [
          {required: true, message: '任务类型必选', trigger: 'blur'},
        ],
        manual: [
          {required: true, message: '是否需要人工必选', trigger: 'blur'},
        ],
        bufferType: [
          {required: true, message: '任务范围外方式必选', trigger: 'blur'},
        ],
        priorityComparator: [
          {required: true, message: '优先级比较方式必选', trigger: 'blur'},
        ]
      },
      specificationCsOptions,
      taskTypeOptions: [],
      bufferTypeOptions: [
        {
          label: '不外扩',
          value: 'CUSTOM'
        },
        {
          label: '9宫格',
          value: 'DEFAULT'
        }
      ],
      priorityComparatorOptions: [
        {
          label: '任务优先级导入顺序',
          value: 'taskConflictPriorityComparator'
        },
        {
          label: '按任务优先级',
          value: 'taskPriorityComparator'
        }
      ]
    }
  },
  setup() {
    return {
    }
  },
  methods: {
    reSet() {
      this.dataForm = {
        productName: null,
        productBranch: null,
        specification: null,
        taskType: null,
        manual: true,
        bufferType: null,
        priorityComparator: null,
      };
    },
    handleStoreForm() {
      this.$refs.formRef.validate((valid, field) => {
        if (valid) {
          this.$emit('store', this.dataForm)
        }
      });
    },
    closeForm(){
      if (this.showDialog === false) {
        return;
      }
			this.$emit('close', this.dataForm)
		},
    loadTaskTypes() {
      axios({
        url: nioTaskURL + "/task-type/list",
        method: "get",
      }).then((response) => {
        if (response.data.code === 200) {
          this.taskTypeOptions = response.data.data.filter((item) => item.manualCreate === 1);
        }
      }).catch(() => {
        ElMessage.error({
          message: "获取任务类型数据集失败",
          showClose: false,
          grouping: true,
        });
      });
    },
  },
  mounted() {
    this.loadTaskTypes();
  },
}
</script>

<style scoped>
</style>
