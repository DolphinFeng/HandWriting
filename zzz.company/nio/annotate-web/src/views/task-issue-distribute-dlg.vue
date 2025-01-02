<template>
  <Panel center title-center :width="600" :height="400" :visible="taskIssueDisDlgPanelData.visible">
    <template #header>
      <div class="quality-result-title">
        <div>{{ taskIssueDisDlgPanelData.title }}</div>
      </div>
    </template>
    <template #default>
      <div class="quality-box" v-loading="taskIssueDisDlgPanelData.loading">
        <el-scrollbar height="100%">
          <el-form :rules="rules" :model="taskIssueDisDlgPanelData" ref="formRef">
            <el-form-item prop="crossId" name="crossId" style="margin-top: 10px; margin-left: 30px; margin-right: 45px">
              <div>路口ID</div>
              <el-input
                v-model="taskIssueDisDlgPanelData.crossId"
                clearable
                style="width: 410px; position: absolute; right: 0%"
              >
              </el-input>
            </el-form-item>
            <el-form-item
              prop="fusionTaskId"
              name="fusionTaskId"
              style="margin-top: 10px; margin-left: 30px; margin-right: 45px"
            >
              <div>融合批次名称</div>
              <el-input
                v-model="taskIssueDisDlgPanelData.fusionTaskId"
                clearable
                style="width: 410px; position: absolute; right: 0%"
              >
              </el-input>
            </el-form-item>
            <div v-for="(item, index) in taskIssueDisDlgPanelData.issuePairs" style="display: flex; margin-left: 20px">
              <el-form-item style="margin-left: 10px; margin-right: 10px">
                <div style="margin-right: 12px">父问题类型</div>
                <el-select
                  v-model="item.parentType"
                  placeholder="Select"
                  style="width: 154px; margin-left: 10px"
                  @change="changeParentIssueType(item.parentType, index)"
                >
                  <el-option
                    v-for="subItem1 in item.parentIssueTypeOption"
                    :key="subItem1.value"
                    :label="subItem1.label"
                    :value="subItem1.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item style="margin-left: 10px; margin-right: 10px">
                <div>子问题类型</div>
                <el-select v-model="item.childType" placeholder="Select" style="width: 154px; margin-left: 10px">
                  <el-option
                    v-for="subItem2 in item.childIssueTypeOption"
                    :key="subItem2.value"
                    :label="subItem2.label"
                    :value="subItem2.value"
                  />
                </el-select>
                <el-icon
                  color="#FF0000"
                  style="margin-top: 5px; margin-left: 5px; cursor: pointer"
                  size="20px"
                  @click.stop="removeIssuePair(item, index)"
                >
                  <Delete />
                </el-icon>
              </el-form-item>
            </div>
            <el-icon
              color="#4e83ee"
              style="margin-left: 30px; margin-bottom: 15px; cursor: pointer"
              size="30px"
              @click.stop="addIssuePair()"
            >
              <CirclePlusFilled />
            </el-icon>
          </el-form>
        </el-scrollbar>
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
import {taskIssueDisDlgPanelData, issueTypeOptions} from './task-issue-distribute-dlg-panel.ts';
import {NioMessage} from '../utils/utils.js';
import {ref} from 'vue';

const formRef = ref(null);

const rules = ref({
  crossId: [{required: true, message: '请输入', trigger: 'blur'}],
  fusionTaskId: [{required: true, message: '请输入', trigger: 'blur'}],
});

function confirmHandler() {
  formRef.value.validate((valid) => {
    if (valid) {
      //不能有重复项
      let repeatedSet = new Set();
      for (let item of taskIssueDisDlgPanelData.issuePairs) {
        let currString = item.parentType + item.childType;
        if (repeatedSet.has(currString)) {
          NioMessage('warning', '存在完全相同的问题选项，请核实删除后重试');
          return;
        } else {
          repeatedSet.add(currString);
        }
      }

      // 表单验证通过，可以进行提交操作
      taskIssueDisDlgPanelData.onOk();
    } else {
      // 表单验证不通过，可以进行相应处理
    }
  });
}

function cancelHandler() {
  taskIssueDisDlgPanelData.onCancel();
}

function addIssuePair() {
  let parentOptions = [];
  for (let item of issueTypeOptions) {
    parentOptions.push({label: item.parentName, value: item.parentCode});
  }

  taskIssueDisDlgPanelData.issuePairs.push({
    parentIssueTypeOption: parentOptions,
    childIssueTypeOption: issueTypeOptions[0].childOptions.map((item) => {
      return {
        label: item.name,
        value: item.code,
      };
    }),
    parentType: issueTypeOptions[0].parentCode,
    childType: issueTypeOptions[0].childOptions[0].code,
  });
}

function changeParentIssueType(value, index) {
  if (index >= taskIssueDisDlgPanelData.issuePairs.length) {
    return;
  }

  let parentOptions = [];
  for (let item of issueTypeOptions) {
    parentOptions.push({label: item.parentName, value: item.parentCode});
  }

  for (let item of issueTypeOptions) {
    if (item.parentCode == value) {
      taskIssueDisDlgPanelData.issuePairs[index] = {
        parentIssueTypeOption: parentOptions,
        childIssueTypeOption: item.childOptions.map((item) => {
          return {
            label: item.name,
            value: item.code,
          };
        }),
        parentType: value,
        childType: item.childOptions[0].code,
      };
      break;
    }
  }
}

function removeIssuePair(item, index) {
  if (taskIssueDisDlgPanelData.issuePairs.length <= 1) {
    NioMessage('warning', '至少添加一个问题类型');
    return;
  }

  taskIssueDisDlgPanelData.issuePairs.splice(index, 1);
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
