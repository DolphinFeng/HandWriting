<template>
  <transition name="el-zoom-in-top">
    <Panel v-model:visible="aoVideoPanelVisible"
           :right="60" :top="60" :center="true"
           :min-width="400" :max-width="820"
           :min-height="200" :max-height="480"
           :width="500" :height="400"
           scale-able
           :header-style="{fontSize: '13px'}"
    >
      <template #header>
        <div class="margin-right">视频</div>
        <div class="margin-right">{{ aoVideoData.curIdx + 1 + '/' + aoVideoData.video.length }}</div>
        <div class="ps-video-next" @click.native="aoVideoNext">></div>
        <div style="flex: 1"></div>
        
        <div class="title-close" @click="closePanel">
          <i class="iconfont icon-guanbi1"></i>
        </div>
      </template>
      <template #default>
        <!-- 图片 -->
        <video id = "aoCheckVideo" style="height: 100%; width: 100%;"  :src="aoVideoData.video[aoVideoData.curIdx].url" controls controlsList="nodownload" autoplay preload>
          您的浏览器不支持 HTML5 video 标签。
        </video>
      </template>
    </Panel>
  </transition>
</template>

<script setup>
import {
  aoVideoPanelVisible, aoVideoData
} from "../../../system/trajectory/AoTrajectorylayer.js";
import Panel from "../../../components/panel/Panel.vue";

const closePanel = function () {
  aoVideoPanelVisible.value = false;
};

const aoVideoNext = function (){
  aoVideoData.curIdx ++;
  if(aoVideoData.curIdx >= aoVideoData.video.length){
    aoVideoData.curIdx = 0;
  }

  document.getElementById('aoCheckVideo').pause();
}

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
