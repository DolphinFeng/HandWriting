<template>
  <el-scrollbar class="create-wrapper">
    <!-- 聚类周期 -->
    <el-card class="card-header" shadow="never" :body-style="{padding: '5px 0'}">
      <template #header>
        <div class="hd-create-form-title">聚类周期</div>
      </template>
      <el-form ref="periodRef" inline :model="period.form" label-position="left" label-width="140px" :rules="period.rules">
        <el-form-item prop="date" label="选择时间：" class="hd-create-form-item">
          <el-date-picker
              v-model="period.form.date"
              type="datetime"
              format="YYYY-MM-DD"
              value-format="YYYYMMDD"
              style="width: 400px;"
          ></el-date-picker>
        </el-form-item>
      </el-form>
    </el-card>
    <!-- 新增ODD -->
    <el-card class="card-header" shadow="never" :body-style="{padding: '5px 0'}">
      <template #header>
        <div class="hd-create-form-title">新增ODD</div>
      </template>
      <el-form :model="oddIncreased.form" label-position="left" label-width="140px" :rules="oddIncreased.rules">
        <el-form-item prop="clusterType" label="聚类模式：" class="hd-create-form-item">
          <el-radio-group v-model="oddIncreased.form.clusterType">
            <el-radio v-for="item in clusterOption" :label="item.value">{{item.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="addCarCnt" label="最小车辆数：" class="hd-create-form-item">
          <el-input-number
              v-model="oddIncreased.form.addCarCnt"
              placeholder="请输入最小车辆数"
              :step="1"
              :min="0"
              :style="{width: inputWidth}"
              controls-position="right"
          ></el-input-number>
        </el-form-item>
        <el-form-item prop="addIssueCnt" label="最小趟数：" class="hd-create-form-item">
          <el-input-number
              v-model="oddIncreased.form.addIssueCnt"
              placeholder="请输入最小趟数"
              :step="1"
              :min="0"
              :style="{width: inputWidth}"
              controls-position="right"
          ></el-input-number>
        </el-form-item>
      </el-form>
    </el-card>
    <!-- 消散ODD -->
    <el-card class="card-header" shadow="never" :body-style="{padding: '5px 0'}">
      <template #header>
        <div class="hd-create-form-title">消散ODD</div>
      </template>
      <el-form :model="oddDisappear.form" label-position="left" label-width="140px" :rules="oddDisappear.rules">
        <el-form-item prop="delCarCnt" label="最小车辆数：" class="hd-create-form-item">
          <el-input-number
              v-model="oddDisappear.form.delCarCnt"
              placeholder="请输入最小车辆数"
              :step="1"
              :min="0"
              :style="{width: inputWidth}"
              controls-position="right"
          ></el-input-number>
        </el-form-item>
        <el-form-item prop="delIssueCnt" label="最小趟数：" class="hd-create-form-item">
          <el-input-number
              v-model="oddDisappear.form.delIssueCnt"
              placeholder="请输入最小趟数"
              :step="1"
              :min="0"
              :style="{width: inputWidth}"
              controls-position="right"
          ></el-input-number>
        </el-form-item>
        <el-form-item prop="delIssueRate" label="最小消散占比%：" class="hd-create-form-item">
          <el-input-number
              v-model="oddDisappear.form.delIssueRate"
              placeholder="请输入最小消散占比："
              :step="0.01"
              :min="0"
              :style="{width: inputWidth}"
              controls-position="right"
          ></el-input-number>
        </el-form-item>
      </el-form>
    </el-card>
    <!-- 选项组 -->
    <div class="hd-create-btn-group">
      <el-button class="hd-create-btn" type="primary" @click="submitHandler">提交聚类</el-button>
      <el-button class="hd-create-btn" @click="cancelCreateHandler" style="margin-left: 110px;">取消</el-button>
    </div>
  </el-scrollbar>
</template>

<script setup>
import {reactive, ref} from "vue";
import {ElMessage} from "element-plus";
import axios from "axios";

const oddClusterURL = window.api.oddClusterURL;

const props = defineProps({

});
const emit = defineEmits(['cancelCreateHandler']);
const periodRef = ref(null);

const period = reactive({
  form: {
    date: '',
  },
  rules: {
    date: [
      {required: true, message: '请选择日期', trigger: 'blur'},
    ]
  }
});
const oddIncreased = reactive({
  form: {
    clusterType: '1',
    addIssueCnt: 0,
    addCarCnt: 0,
  },
  rules: {
    clusterType: [
      {required: true, message: '请选择聚类模式', trigger: 'blur'},
    ],
    addIssueCnt: [
      {required: true, message: '请输入最小趟数', trigger: 'blur'},
    ],
    addCarCnt: [
      {required: true, message: '请输入最小车辆', trigger: 'blur'},
    ],
  }
});
const oddDisappear = reactive({
  form: {
    delIssueCnt: 0,
    delCarCnt: 0,
    delIssueRate: 0,
  },
  rules: {
    delIssueCnt: [
      {required: true, message: '请输入最小趟数', trigger: 'blur'},
    ],
    delCarCnt: [
      {required: true, message: '请输入最小车辆', trigger: 'blur'},
    ],
    delIssueRate: [
      {required: true, message: '请输入定位severity', trigger: 'blur'},
    ],
  }
});
const clusterOption = [
  {label: '混合聚类', value: '1'},
  {label: '单独聚类', value: '2'},
  {label: '仅定位', value: '3'},
  {label: '仅建图', value: '4'},
];
const inputWidth = '180px';

function uploadCluster() {
  const formData = new FormData();
  formData.append('date', period.form.date);
  formData.append('clusterType', oddIncreased.form.clusterType);
  formData.append('addIssueCnt', oddIncreased.form.addIssueCnt);
  formData.append('addCarCnt', oddIncreased.form.addCarCnt);
  formData.append('delIssueCnt', oddDisappear.form.delIssueCnt);
  formData.append('delCarCnt', oddDisappear.form.delCarCnt);
  formData.append('delIssueRate', oddDisappear.form.delIssueRate);
  axios.post(oddClusterURL + '/nio/material/issue/trigger', {
    date: period.form.date,
    clusterType: oddIncreased.form.clusterType,
    addIssueCnt: oddIncreased.form.addIssueCnt,
    addCarCnt: oddIncreased.form.addCarCnt,
    delIssueCnt: oddDisappear.form.delIssueCnt,
    delCarCnt: oddDisappear.form.delCarCnt,
    delIssueRate: oddDisappear.form.delIssueRate,
  }).then(res => {
    if (res.data.code === 0) {
      ElMessage.success({
        message: '聚类提交成功',
        showClose: false,
        grouping: true,
      });
      cancelCreateHandler();
    } else {
      throw new Error(res.data.msg);
    }
    console.log(res.data);
  }).catch(err => {
    ElMessage.error({
      message: err.message,
      grouping: true,
      showClose: false,
    });
  })
}

//事件
function submitHandler() {
  periodRef.value.validate((isValid) => {
    console.log(isValid);
    if (isValid) {
      uploadCluster();
    }
  });
}
function cancelCreateHandler() {
  emit('cancelCreateHandler');
}
</script>

<style scoped>
:deep(.el-form-item__label) {
  font-weight: 700;
}
:deep(.el-card__header) {
  padding: 14px 20px;
}
.create-wrapper {
  flex: 1;
  margin: 5px 20px 10px 20px;
  padding-top: 20px;
}
.hd-create-form-title {
  font-size: 18px;
}
.hd-create-form-item {
  margin: 15px 0 15px 100px;
  font-size: 13px;
}
.hd-create-btn-group {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 35px;
}
.hd-create-btn {
  width: 90px;
}
.card-header {
  margin-bottom: 20px;
  user-select: none;
}
</style>
