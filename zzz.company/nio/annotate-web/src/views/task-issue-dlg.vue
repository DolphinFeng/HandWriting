<template>
  <Panel center title-center :width="360" :height="400" :visible="taskIssueDlgPanelData.visible">
    <template #header>
      <div class="quality-result-title">
        <div>{{ taskIssueDlgPanelData.title }}</div>
      </div>
    </template>
    <template #default>
      <div class="quality-box" v-loading="taskIssueDlgPanelData.loading">
        <el-form :rules="rules" :model="taskIssueDlgPanelData" ref="formRef">
          <div v-if="taskIssueDlgPanelData.type == TaskIssueDlgType.PASS">
            <el-form-item prop="issueClass" name="issueClass" style="margin-top: 10px">
              <div>问题分类</div>
              <el-select
                filterable
                v-model="taskIssueDlgPanelData.issueClass"
                placeholder="请选择"
                style="width: 200px; position: absolute; right: 0%"
                @blur="blurInput($event)"
              >
                <el-option
                  v-for="item in taskIssueDlgPanelData.issueClassOption"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item prop="issueEdition" name="issueEdition" style="margin-top: 10px">
              <div>预计解决版本</div>
              <el-input
                v-model="taskIssueDlgPanelData.issueEdition"
                clearable
                style="width: 200px; position: absolute; right: 0%"
              >
              </el-input>
            </el-form-item>
            <el-form-item prop="time" name="time" style="margin-top: 10px">
              <div>预计解决时间</div>
              <el-date-picker
                type="date"
                v-model="taskIssueDlgPanelData.time"
                format="YYYY-MM-DD"
                :clearable="false"
                value-format="YYYYMMDD"
                popper-class="picker-date"
                placeholder="请选择截止时间"
                size="default"
                style="width: 200px; position: absolute; right: 0%"
              />
            </el-form-item>
            <el-form-item prop="detail" name="detail" style="margin-top: 10px; height: 120px">
              <div>评论</div>
              <el-input
                v-model="taskIssueDlgPanelData.detail"
                clearable
                type="textarea"
                :rows="5"
                style="width: 200px; position: absolute; right: 0%"
              >
              </el-input>
            </el-form-item>
          </div>
          <div v-else-if="taskIssueDlgPanelData.type == TaskIssueDlgType.TRANSFER">
            <el-form-item prop="transferTo" name="transferTo" style="margin-top: 10px">
              <el-radio-group v-model="taskIssueDlgPanelData.transferTo">
                <el-radio
                  v-for="item in taskIssueDlgPanelData.taskTransferOption"
                  :label="item.code"
                  :disabled="disableTransferTo(item.code)"
                  style="width: 75px"
                >
                  {{ item.name }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item prop="detail" name="detail" style="margin-top: 10px; height: 130px">
              <div>评论</div>
              <el-input
                v-model="taskIssueDlgPanelData.detail"
                clearable
                type="textarea"
                :rows="6"
                style="width: 200px; position: absolute; right: 0%"
              >
              </el-input>
            </el-form-item>
          </div>
        </el-form>

        <div class="footer-btn-group">
          <button class="footer-btn cancel" title="取消" @click="cancelHandler">取消</button>
          <button style="margin-left: 40px" class="footer-btn confirm" title="保存事件" @click="confirmHandler">
            确定
          </button>
        </div>
      </div>
    </template>
  </Panel>
</template>

<script setup>
import Panel from '../components/panel.vue';
import {tasks} from '../system/task-list.ts';
import {taskIssueDlgPanelData, TaskIssueDlgType} from './task-issue-dlg-panel.ts';
import {ref} from 'vue';

const formRef = ref(null);

const rules = ref({
  issueEdition: [{required: true, message: '请输入', trigger: 'blur'}],
  issueClass: [{required: true, message: '请输入', trigger: 'blur'}],
});

function blurInput(e) {
  if (e.target.value.trim() !== '') {
    taskIssueDlgPanelData.issueClass = e.target.value;
  }
}

function disableTransferTo(stepCode) {
  if (tasks.currentTask && tasks.currentTask.taskParams.stepCode == stepCode) {
    return true;
  }

  return false;
}

function confirmHandler() {
  formRef.value.validate((valid) => {
    if (valid) {
      // 表单验证通过，可以进行提交操作
      taskIssueDlgPanelData.onOk();
    } else {
      // 表单验证不通过，可以进行相应处理
    }
  });
}

function cancelHandler() {
  taskIssueDlgPanelData.onCancel();
}
</script>

<style scoped>
.quality-result-title {
  font-size: 15px;
}
.title {
  color: #ccc;
}
.quality-box {
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  height: 100%;
  padding: 14px 12px;
  user-select: none;
}
.black-background-item {
  width: 300px;
  height: 100px;
  padding: 5px;
  border-radius: 3px;
  margin: 10px 0;
  background-color: #242425;
  line-height: 21px;
  transition: background-color 0.25s ease;
}
.save-info-box {
  margin: 25px 20px 0;
  font-size: 14px;
}
</style>
