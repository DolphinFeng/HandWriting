<template>
  <transition name="el-zoom-in-top">
    <Panel
      v-model:visible="crossTrajPicPanelVisible"
      :right="60"
      :top="60"
      :center="false"
      :min-width="500"
      :max-width="500"
      :min-height="290"
      :max-height="290"
      scale-able
      :header-style="{fontSize: '13px'}"
    >
      <template #header>
        <div style="flex: 1"></div>
        <div class="title-close" @click="closePanel">
          <i class="iconfont icon-guanbi1"></i>
        </div>
      </template>
      <template #default>
        <!-- 图片 -->
        <div
          class="main-wrapper"
          v-loading="crossTrajPicPanel.loading"
          element-loading-text=""
          element-loading-background="rgba(122, 122, 122, .8)"
        >
          <div class="main-img">
            <div v-if="!imgNull" style="height: 100%">
              <img :src="trajPointData.imgPath" alt="" @error="imgErrorHandler" @click="showViewer = true" />
              <el-image-viewer
                v-if="showViewer"
                :url-list="[trajPointData.imgPath]"
                @close="showViewer = false"
                hide-on-click-modal
                teleported
              >
              </el-image-viewer>
              <div class="main-img-time"></div>
            </div>
            <div v-else class="main-img-null">
              <el-empty :image-size="80" description="没有该方向照片"></el-empty>
            </div>
          </div>
          <div class="main-id">
            {{ crossTrajPicPanel.cur ? 'id: ' + crossTrajPicPanel.cur : crossTrajPicPanel.cur }}
          </div>
          <div class="main-progress-box">
            <el-select
              v-model="cameraPos"
              placeholder="Select"
              style="width: 100px; margin-right: 10px"
              @change="changeCameraPos"
            >
              <el-option v-for="item in cameraPosOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <div @mousedown="addTrajPicIdxHandler(-1)">
              <i class="iconfont icon-shangyishoushangyige main-play"></i>
            </div>
            <div class="progress-count">{{ trajPointData.total === 0 ? 0 : trajPointData.curIdx + 1 }}个</div>
            <div style="flex: 1">
              <el-slider
                id="trajPointSlider"
                v-model="trajPointData.curIdx"
                :max="trajPointData.total > 0 ? trajPointData.total - 1 : 0"
                :step="1"
                height="4px"
                @change="sliderHandler"
              >
              </el-slider>
            </div>
            <div class="progress-count">{{ trajPointData.total }}个</div>
            <div style="transform: rotateZ(180deg)" @mousedown="addTrajPicIdxHandler(1)">
              <i class="iconfont icon-shangyishoushangyige main-play"></i>
            </div>
          </div>
        </div>
      </template>
    </Panel>
  </transition>
</template>

<script setup>
import {ref, watch, reactive} from 'vue';
import {
  crossTrajPicPanel,
  imgNull,
  crossTrajPicPanelVisible,
  trajPointData,
  addTrajPicIdxHandler,
  cameraPos,
  doActiveTrajPic,
} from './cross-resume-panel.ts';

import {useStore} from 'vuex';
import Panel from '../../components/panel.vue';

const cameraPosOptions = [
  {
    value: 0,
    label: '前',
  },
  {
    value: 1,
    label: '左',
  },
  {
    value: 2,
    label: '右',
  },
];

const store = useStore();
const showViewer = ref(false);

function changeCameraPos() {
  doActiveTrajPic();
}

const closePanel = function () {
  crossTrajPicPanelVisible.value = false;
};
const sliderHandler = function () {
  document.querySelector('#trajPointSlider').blur();
};

watch(
  () => trajPointData.imgPath,
  (newImgPath) => {
    imgNull.value = !newImgPath;
  },
);

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

.title-font {
  font-size: 13px;
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
.main-dash {
  border-top: 1px dashed #525560;
  margin: 10px 6px;
}
.select-group {
  margin: 0 8px;
}
.select-data-type {
  margin-top: 14px;
}
.data-panel-list {
  display: flex;
  flex-flow: row wrap;
  /*justify-content: space-between;*/
  align-items: center;
  align-content: center;
  padding: 0;
}
.data-panel-item {
  position: relative;
  width: 80px;
  padding: 2px 6px 3px;
  margin: 0 11px 12px;
  border-radius: 4px;
  background-color: #111424;
  font-size: 13px;
  color: #fff;
  /*overflow: hidden;*/
  transition: var(--el-transition-all);
  text-align: center;
  cursor: pointer;
  user-select: none;
}
.data-panel-item-active {
  background-color: #365dde;
}
.data-panel-item div {
  pointer-events: none;
}
.data-badge {
  position: absolute;
  right: 0;
  top: 0;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: #409eff;
  color: #fff;
  transform: translate(50%, -50%);
  font-size: 10px;
}
</style>
