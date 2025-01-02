<template>
  <tool-item v-if="taskData.taskStage === TaskStage.QUALITY_CHECK"
             icon="icon-_position-o"
             title="任务质检"
             color="#f07c09"
             right
             :width="340"
             @click="qualityHandler"
  >
    <template #icon>
      <div class="icon-center">
        <img src="/img/quality.png" alt="">
      </div>
    </template>
  </tool-item>
</template>

<script setup>
import {useStore} from "vuex";
import TaskStage from "../../../../../system/task/taskList/enum/TaskStage.js";
import ToolItem from "../../headerPanel/ToolItem.vue";
import {qualityData, changeAllowPutTag} from "../../../../../system/task/quality/quality.js";
import {checkTaskVersionMatch, taskData} from "../../../../../system/task/taskList/taskList.js";
import {NioMessage} from "../../../../../utils/utils.js";

const store = useStore();
function qualityHandler() {
  if (!checkTaskVersionMatch()) {
    NioMessage('warning', '当前选择的版本与任务版本不符，请切换后重试');
  } else {
    changeAllowPutTag(!qualityData.billboardModel.allowPutTag);
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
