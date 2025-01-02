<template>
  <transition name="el-zoom-in-top">
    <Panel v-model:visible="aoPanelVisible"
           :right="60" :top="60" :center="false"
           :min-width="415" :max-width="415"
           :min-height="280" :max-height="280"
           scale-able
           :header-style="{fontSize: '13px'}"
    >
      <template #header>
        <div>
          坐标：<span class="title-position" @click="copyPos">{{transformPos(aoTrajPointData.position)}}</span>
        </div>
        <div style="margin-left: 14px;font-size: 13px;">
          时间：<span>{{transformTime(aoTrajPointData.time)}}</span>
        </div>
        <div style="flex: 1"></div>
        <div class="title-close" @click="closePanel">
          <i class="iconfont icon-guanbi1"></i>
        </div>
      </template>
      <template #default>
        <!-- 图片 -->
        <div class="main-wrapper" v-loading="aoDataPanel.loading" element-loading-text="" element-loading-background="rgba(122, 122, 122, .8)">
          <div class="main-img">
            <div v-if="!imgNull" style="height: 100%;">
              <img :src="aoTrajPointData.imgPath" alt="" @error="imgErrorHandler" @click="showViewer = true">
              <el-image-viewer
                  v-if="showViewer"
                  :url-list="[aoTrajPointData.imgPath]"
                  @close="showViewer = false"
                  hide-on-click-modal
                  teleported
              ></el-image-viewer>
              <div class="main-img-time"></div>
            </div>
            <div v-else class="main-img-null">
              <el-empty :image-size="80" description="图片加载中..."></el-empty>
            </div>
          </div>
          <div class="main-progress-box">
            <div @mousedown="addIdxHandler(-1)">
              <i class="iconfont icon-shangyishoushangyige main-play"></i>
            </div>
            <div class="progress-count">{{aoTrajPointData.total === 0 ? 0 : aoTrajPointData.curIdx + 1}}个</div>
            <div style="flex: 1">
              <el-slider
                  id="trajPointSlider"
                  v-model="aoTrajPointData.curIdx"
                  :max="aoTrajPointData.total > 0 ? aoTrajPointData.total - 1 : 0"
                  :step="1"
                  height="4px"
                  @change="sliderHandler"
              ></el-slider>
            </div>
            <div class="progress-count">{{aoTrajPointData.total}}个</div>
            <div style="transform: rotateZ(180deg);" @mousedown="addIdxHandler(1)">
              <i class="iconfont icon-shangyishoushangyige main-play"></i>
            </div>
          </div>
        </div>
      </template>
    </Panel>
  </transition>
</template>

<script setup>
import {ref, watch} from "vue";
import {
  aoCacheImg,
  aoDataPanel,
  imgNull, 
  aoPanelVisible,
  aoCheckTrajectoryLayer,
  aoTrajPointData,
} from "../../../system/trajectory/AoTrajectorylayer.js";
import {copyTextToClipboard} from "../../../utils/copy.js";
import Panel from "../../../components/panel/Panel.vue";

const showViewer = ref(false);

//索引增加方法
const addIdxHandler = aoCheckTrajectoryLayer.addIdxHandler;

const closePanel = function () {
  aoPanelVisible.value = false;
};
const sliderHandler = function () {
  document.querySelector('#trajPointSlider').blur();
};
watch(() => aoTrajPointData.curIdx, (newIdx) => {
  if (aoCheckTrajectoryLayer.trajPointList.length !== 0) {
    aoCheckTrajectoryLayer.setPointActive(newIdx);
    aoCacheImg(newIdx);
    aoTrajPointData.imgPath = aoCheckTrajectoryLayer.trajPointList[newIdx].img_url;
    aoTrajPointData.position = aoCheckTrajectoryLayer.trajPointList[newIdx].position;
    aoTrajPointData.time = aoCheckTrajectoryLayer.trajPointList[newIdx].time;
  }
});
watch(() => aoTrajPointData.imgPath, (newImgPath) => {
  imgNull.value = !newImgPath;
});
const transformPos = function (position) {
  return position.length === 0 ? '' : position[0].toFixed(6) + ',' + position[1].toFixed(6);
};
const transformTime = function (time) {
  if (!time) {
    return '';
  }
  let date = new Date(time);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}` ;
};
const copyPos = function () {
  if (aoTrajPointData.position.length > 0) {
    copyTextToClipboard(aoTrajPointData.position.join(','), '已将坐标复制到粘贴板', 2000);
  }
};
const imgErrorHandler = function (e) {
  imgNull.value = true;
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
#trajectoryPanel {
  position: absolute;
  width: 410px;
}

.title-position:hover {
  text-decoration: underline;
  /*font-size: 13px;*/
}
.main-img-time {
  position: absolute;
  bottom: 4px;
  right: 8px;
  font-size: 11px;
}
.main-id {
  margin: 8px 0 6px 26px;
}

</style>
