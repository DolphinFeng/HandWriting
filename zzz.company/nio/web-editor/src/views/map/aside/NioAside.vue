<template>
  <transition name="el-zoom-in-top">
    <aside v-if="oddPanelData.panelOpenType !== PanelOpenType.CLOSE || qualityData.propertyModel.qualityTag" class="nio-aside">
      <!-- element plus的奇葩bug，不信把下面这行删掉了试试... -->
      <div class="hidden-bg"></div>
      <odd-event-data-panel v-if="oddPanelData.panelOpenType !== PanelOpenType.CLOSE"></odd-event-data-panel>
      <quality-property v-else-if="qualityData.propertyModel.qualityTag"></quality-property>
    </aside>
  </transition>
</template>

<script setup>
import {oddPanelData, PanelOpenType} from "../../../system/odd/eventPanel/oddPanelData.js";
import {qualityData} from "../../../system/task/quality/quality.js";
import OddEventDataPanel from "../odd/ODDEventDataPanel.vue";
import QualityProperty from "../header/toolGroup/quality/QualityProperty.vue";
</script>

<style scoped>
:deep(.el-textarea__inner) {
  --el-input-bg-color: #292a2e;
  --el-input-text-color: #fff;
  box-shadow: none;
  font-size: 13px;
}

:deep(.el-radio) {
  margin-right: 20px;
}

:deep(.el-slider__bar) {
  background-color: #375ddf;
}

:deep(.el-slider__runway) {
  background-color: #375ddf;
}

:deep(.el-slider__button) {
  border: none;
  background-color: #375ddf;
}
.nio-aside {
  position: absolute;
  left: 0;
  top: var(--header-height);
  width: 330px;
  height: calc(100vh - var(--header-height));
  background-color: #2e2f33;
  z-index: 10;
  box-shadow: var(--el-box-shadow);
}

.hidden-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 4px;
  background-color: #2e2f33;
  z-index: 100;
}
</style>
