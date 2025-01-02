<template>
  <tool-item
    id="save"
    v-if="
      tasks.currentTask &&
      tasks.currentTask.taskStep != 'step_tag_adjusting' &&
      tasks.currentTask.taskType != TaskType.ISSUE_ANALYSIS &&
      tasks.currentTask.taskType != TaskType.ISSUE_DISTRIBUTE
    "
    right
    title="提交"
    icon="icon-fasong-tijiao"
    color="#4069e8"
    @click="send"
  >
  </tool-item>
</template>

<script setup>
import ToolItem from './tool-item.vue';
import {useStore} from 'vuex';
import {tasks, TaskType} from '../system/task-list.ts';
import {openAnnoResultPanel} from '../data-source/cross/cross-annotation-result-panel.ts';

const store = useStore();
const send = function () {
  //质检任务时被隐藏了，不会到这
  if (tasks.currentTask && tasks.currentTask.taskType == TaskType.CLOUD_MAPPING_CHECK) {
    openAnnoResultPanel();
  }
};
</script>

<style scoped></style>
