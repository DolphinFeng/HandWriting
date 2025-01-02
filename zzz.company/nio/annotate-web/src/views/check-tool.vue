<template>
  <tool-item
    v-if="
      tasks.currentTask &&
      tasks.currentTask.taskType == TaskType.CLOUD_MAPPING_CHECK &&
      tasks.currentTask.taskStep == 'step_tag_adjusting'
    "
    icon="icon-_position-o"
    title="任务质检"
    color="#f07c09"
    right
    :width="340"
    :highlight="currentToolName == 'billboard'"
    @click="clickCheck"
  >
    <template #icon>
      <div class="icon-center">
        <img src="/img/quality.png" alt="" />
      </div>
    </template>
  </tool-item>
</template>

<script setup>
import {tasks, TaskType} from '../system/task-list.ts';
import ToolItem from './tool-item.vue';
import {toolManager, MoveBillboardTool, GroupTool, currentToolName} from '../system/tool.ts';
import {AddBillboardTool} from '../data-source/cross/cross-check-tool.ts';

function clickCheck() {
  if (currentToolName.value == 'billboard') {
    toolManager.setDefaultTool();
  } else {
    toolManager.setTool(new GroupTool([new AddBillboardTool(), new MoveBillboardTool()], 'billboard'));
  }
}
</script>

<style scoped>
.icon-center {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 1.5px 0;
}
.icon-center img {
  width: 16px;
  height: 16px;
  object-fit: cover;
}
</style>
