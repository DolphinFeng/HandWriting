<template>
  <tool-item icon="icon-renwu" :width="550" left title="任务" @after-leave="afterLeaveHandler">
    <template #default>
      <TaskList></TaskList>
    </template>
  </tool-item>
</template>

<script setup>
import ToolItem from './tool-item.vue';
import TaskList from './task-list.vue';

function afterLeaveHandler() {
  //resetCaptureData();
}
</script>
<style scoped></style>
