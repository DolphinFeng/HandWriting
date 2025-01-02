<template>
  <Panel
      position="absolute"
      v-model:visible="captureData.visible"
      :width="350" :min-width="350" :max-width="400"
      :height="275" :min-height="275" :max-height="275"
      :top="-4" :left="460"
      :panel-style="{borderRadius: '4px'}"
      :header-style="{padding: '6px 8px'}"
      scale-able
  >
    <template #header>
      <div>图片</div>
      <div class="space"></div>
      <div class="title-close" @click="closePanel">
        <i class="iconfont icon-guanbi1"></i>
      </div>
    </template>
    <template #default>
      <div class="main-wrapper">
        <!-- 图片区域 -->
        <div class="main-img">
          <div v-if="!imgNull" style="height: 100%;">
            <img :src="captureData.list[captureData.curImgIdx]" alt="" @error="imgErrorHandler" @click="captureData.showViewer = true">
            <el-image-viewer
                v-if="captureData.showViewer"
                :url-list="[captureData.list[captureData.curImgIdx]]"
                @close="captureData.showViewer = false"
                hide-on-click-modal
                teleported
            ></el-image-viewer>
          </div>
          <div v-else class="main-img-null">
            <el-empty :image-size="80" description="图片加载中..."></el-empty>
          </div>
        </div>
        <!-- 前后播放切换 -->
        <div class="main-progress-box">
          <div @mousedown="addCaptureIdxHandler(-1)">
            <i class="iconfont icon-shangyishoushangyige main-play"></i>
          </div>
          <div class="progress-count">{{ captureData.list.length === 0 ? 0 : captureData.curImgIdx + 1 }}个</div>
          <div class="space">
            <el-slider
                id="captureSlider"
                v-model="captureData.curImgIdx"
                :max="captureData.list.length > 0 ? captureData.list.length - 1 : 0"
                :step="1"
                height="4px"
                @change="sliderHandler"
            ></el-slider>
          </div>
          <div class="progress-count">{{ captureData.list.length }}个</div>
          <div style="transform: rotateZ(180deg);" @mousedown="addCaptureIdxHandler(1)">
            <i class="iconfont icon-shangyishoushangyige main-play"></i>
          </div>
        </div>
      </div>
    </template>
  </Panel>
</template>

<script setup>
import Panel from "../../../components/panel/Panel.vue";
import {captureData} from "../../../system/task/taskList/taskList.js";
import {ref} from "vue";

const imgNull = ref(false);

function addCaptureIdxHandler(increment) {
  let curImgIdx = captureData.curImgIdx, newCaptureIdx = curImgIdx + increment, total = captureData.list.length;
  if (curImgIdx === total - 1 && increment > 0) {
    newCaptureIdx = increment - 1;
  } else if (curImgIdx === 0 && increment < 0) {
    newCaptureIdx = total + increment;
  } else {
    if (newCaptureIdx > total - 1) {
      newCaptureIdx = total - 1;
    } else if (newCaptureIdx < 0) {
      newCaptureIdx = 0;
    }
  }
  captureData.curImgIdx = newCaptureIdx;
}

function closePanel() {
  Object.assign(captureData, {
    curImgIdx: 0,
    visible: false,
    list: [],
  });
}
function imgErrorHandler() {
  imgNull.value = true;
}
const sliderHandler = function () {
  document.querySelector('#captureSlider').blur();
};
</script>

<style scoped>
:deep(.el-radio-button__inner) {
  background-color: #101423;
  color: #fff;
  border: none;
  width: 80px;
  text-align: center;
  padding: 8px 0;
  font-size: 13px;
}
:deep(.el-radio-button) {
  margin: 0 1px 0 0;
}
:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-left: none;
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
</style>
