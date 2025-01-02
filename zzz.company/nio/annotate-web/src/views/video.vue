<template>
  <transition name="el-zoom-in-top">
    <Panel
      v-model:visible="videoPanelVisible"
      :right="60"
      :top="60"
      :center="true"
      :min-width="400"
      :max-width="820"
      :min-height="200"
      :max-height="480"
      :width="500"
      :height="400"
      scale-able
      :header-style="{fontSize: '13px'}"
      v-loading="videoData.loading"
    >
      <template #header>
        <div class="margin-right">视频</div>
        <div v-if="videoData.video.length > 1" class="margin-right">
          {{ videoData.curIdx + 1 + '/' + videoData.video.length }}
        </div>
        <div v-if="videoData.video.length > 1" class="ps-video-next" @click.native="aoVideoNext">></div>
        <div style="flex: 1"></div>

        <div class="title-close" @click="closePanel">
          <i class="iconfont icon-guanbi1"></i>
        </div>
      </template>
      <template #default>
        <!-- 图片 -->
        <video
          id="video-container"
          style="height: 100%; width: 100%"
          :src="videoData.video[videoData.curIdx].url"
          controls
          controlsList="nodownload"
          autoplay
          preload
        >
          您的浏览器不支持 HTML5 video 标签。
        </video>
      </template>
    </Panel>
  </transition>
</template>

<script setup>
import {renderPrimitiveManager} from '../model/render-primitive';
import {videoPanelVisible, videoData} from './video-panel.ts';

const closePanel = function () {
  videoPanelVisible.value = false;
  renderPrimitiveManager.clearAnimatedLinePrimitive();
};

const aoVideoNext = function () {
  videoData.curIdx++;
  if (videoData.curIdx >= videoData.video.length) {
    videoData.curIdx = 0;
  }

  document.getElementById('video-container').pause();
};
</script>

<style scoped>
.ps-video-next {
  font-size: 20px;
  color: #7e8cf1;
  cursor: pointer;
  border-color: transparent;
}
.margin-right {
  margin-right: 16px;
}
</style>
