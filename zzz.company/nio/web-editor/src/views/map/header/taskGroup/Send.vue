<template>
  <tool-item id="save" v-if="taskData.taskStage === TaskStage.WORKING" right title="提交" icon="icon-fasong-tijiao" color="#4069e8" @click="send"></tool-item>
</template>

<script setup>
import ToolItem from "../headerPanel/ToolItem.vue";
import {useStore} from "vuex";
import {handleSaveOdd} from "../../../../system/odd/saveOdd/saveOdd.js";
import {TaskStage, taskData} from "../../../../system/task/taskList/taskList.js";

const store = useStore();
const send = function () {
  handleSaveOdd();
};
</script>

<style scoped>

</style>
