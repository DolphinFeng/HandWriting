<template>
  <div v-if="loadingFrame.show" class="loading-frame"
       style="position: fixed;border-color: #409eff"
       v-loading="loadingFrame.show"
       :element-loading-text="loadingFrame.width > 95 && loadingFrame.height > 90? '搜索中...' : ''"
       :element-loading-spinner="svg"
       element-loading-svg-view-box="-10, -10, 50, 50"
       element-loading-background="rgba(232, 232, 232, 0.8)"
       :style="{left: loadingFrame.left + 'px', top: loadingFrame.top + 'px', width: loadingFrame.width + 'px', height: loadingFrame.height + 'px'}">
  </div>
</template>

<script setup>
import {loadingFrame} from "../../../system/trajectory/loadingFrame.js";
import {svg} from "../../../js/svg.js";

</script>

<style scoped>
.loading-frame {
  position: fixed;
  border: 2px dashed;
  z-index: 1;
}
</style>
