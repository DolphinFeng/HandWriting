<template>
  <tool-item
    icon="icon-_position-o"
    left
    title="测量距离"
    color="#f07c09"
    :width="340"
    :highlight="currentToolName == MeatureTool2.name"
    @click="clickMeasure"
  >
    <template #icon>
      <div class="icon-center">
        <img src="/img/measure.png" alt="" />
      </div>
    </template>
  </tool-item>
</template>

<script setup>
import { ref } from "vue";
import ToolItem from "./tool-item.vue";
import { toolManager, currentToolName } from "../system/tool.ts";
import { MeatureTool2 } from "../system/meature-tool.ts";

function clickMeasure() {
  if (currentToolName.value == MeatureTool2.name) {
    toolManager.setDefaultTool();
  } else {
    toolManager.setTool(new MeatureTool2());
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
