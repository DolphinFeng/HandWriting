<template>
  <article class="quality-wrapper">
    <div class="aside-form-item">
      <div class="aside-form-label">质检标类型</div>
      <el-radio-group :disabled="taskData.taskStage !== TaskStage.QUALITY_CHECK || taskData.runningTask?.mapVersion.toString() !== store.state.version.curVersion.toString()"
                      v-model="qualityData.propertyModel.type" @change="changeTypeHandler">
        <el-radio v-for="item in tagTypeList" size="small" :label="item.value">{{item.name}}</el-radio>
      </el-radio-group>
    </div>
    <div class="aside-form-item">
      <div class="aside-form-label">质检标描述</div>
      <el-input type="textarea"
                :disabled="taskData.taskStage !== TaskStage.QUALITY_CHECK || taskData.runningTask?.mapVersion.toString() !== store.state.version.curVersion.toString()"
                :rows="5"
                placeholder="请填写质检标描述"
                style=""
                v-model="qualityData.propertyModel.desc"
                @change="changeDescHandler"
      ></el-input>
    </div>
    <div class="aside-form-item">
      <div class="aside-form-label">质检标结果</div>
      <el-radio-group :disabled="taskData.runningTask?.mapVersion.toString() !== store.state.version.curVersion.toString()"
                      v-model="qualityData.propertyModel.tagResult" @change="changeResultHandler">
        <el-radio v-for="item in tagResultList" size="small" :label="item.value">{{item.name}}</el-radio>
      </el-radio-group>
    </div>
  </article>
</template>

<script setup>
import {qualityData, saveQualityProperty, tagTypeList, tagResultList} from "../../../../../system/task/quality/quality.js";
import {taskData, TaskStage} from "../../../../../system/task/taskList/taskList.js";
import {useStore} from "vuex";

const store = useStore();

function changeTypeHandler(newType) {
  saveQualityProperty();
}
function changeDescHandler() {
  saveQualityProperty();
}
function changeResultHandler() {
  saveQualityProperty();
}
</script>

<style scoped>
.quality-wrapper {
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  padding: 8px 14px 14px;
}
</style>
