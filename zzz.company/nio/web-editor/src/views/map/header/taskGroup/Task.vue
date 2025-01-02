<template>
  <tool-item icon="icon-renwu" :width="440" left title="任务" @click="taskListHandler" @after-leave="afterLeaveHandler">
  </tool-item>
  <TaskList></TaskList>
</template>

<script setup>
import ToolItem from '../headerPanel/ToolItem.vue';
import TaskList from '../../task/TaskList.vue';
import {resetCaptureData, taskPanelVisible} from '../../../../system/task/taskList/taskList.js';

function afterLeaveHandler() {
  resetCaptureData();
}

function taskListHandler(visible) {
  taskPanelVisible.value = visible ?? !taskPanelVisible.value;
}
</script>
<style scoped></style>
