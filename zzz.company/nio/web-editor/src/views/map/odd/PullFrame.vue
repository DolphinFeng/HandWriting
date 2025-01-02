<template>
  <div class="pull-frame" v-show="pullFrame.show"
       :style="{'left': pullFrame.left + 'px', 'top': pullFrame.top + 'px',
        'width': pullFrame.width + 'px', 'height': pullFrame.height + 'px',
         'transform': `scale(${pullFrame.scaleX}, ${pullFrame.scaleY})`,
         'border-style': `${pullFrame.borderStyle}`,
          'border-color': pullFrame.borderColor}"
  >
  </div>
</template>

<script setup>
import {pullFrame} from "../../../event/pullFrame.js";

</script>

<style scoped>
.pull-frame {
  position: absolute;
  transform-origin: top left;
  border-radius: 2px;
  border-width: 2px;
  z-index: 10;
}
</style>
