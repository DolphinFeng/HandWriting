<template>
  <transition name="el-zoom-in-top">
    <Panel
      v-model:left="crossResumePanel.left"
      v-model:top="crossResumePanel.top"
      v-model:visible="crossResumeVisible"
      :width="475"
      :max-width="800"
      :height="420"
      :max-height="600"
      scale-able
      @changePos="changePos"
    >
      <template #header>
        <div>路径履历</div>
        <div style="flex: 1"></div>
        <div class="title-close" @click="closePanel">
          <i class="iconfont icon-guanbi1"></i>
        </div>
      </template>
      <template #default>
        <el-scrollbar height="100%" v-loading="crossResumePanel.loading">
          <li v-for="(item, idx) in crossResumePanel.list" class="route-info">
            <div>{{ crossResumePanel.list.length - idx }}</div>
            <div class="line-center">
              {{ item.time }}
            </div>
            <div style="margin-left: 20px; width: 400px">
              <div class="middle-block">
                {{ item.text }}
              </div>
              <div v-if="item.type == CROSS_RESUME_TYPE.MAPPING" style="display: flex; margin-bottom: 10px">
                <!-- <div
                  class="event-check-item"
                  :class="{
                    'active-have-event': isTrajChecked && idx == trajIndex,
                  }"
                  @click="showTrajectory(item.id, idx)"
                >
                  轨迹图片
                </div> -->
                <div
                  class="event-check-item"
                  :class="{
                    'active-have-event': isPcGrayPicChecked && idx == pcGrayPicIndex,
                  }"
                  @click="showPointCloudGrayPic(item.id, idx)"
                >
                  点云瓦片
                </div>
                <div
                  class="event-check-item"
                  :class="{
                    'active-have-event': isPcRgbPicChecked && idx == pcRgbPicIndex,
                  }"
                  @click="showPointCloudRGBPic(item.id, idx)"
                >
                  视觉瓦片
                </div>
              </div>
              <div class="event-check-item2" v-else-if="item.type == CROSS_RESUME_TYPE.ANNOTATE && item.desc != ''">
                {{ item.desc }}
              </div>
              <div v-else-if="item.type == CROSS_RESUME_TYPE.MATERIAL && item.uuidList">
                <div style="margin-bottom: 5px" v-for="(subItem, idx) in item.uuidList">
                  <div style="margin-bottom: 5px">{{ idx + 1 + ': uuid=' + subItem.id }}</div>
                  <div style="display: flex">
                    <div
                      v-loading="subItem.loading"
                      class="event-check-item"
                      :class="{
                        'active-have-event': subItem.show,
                      }"
                      @click.stop="showMaterialTrajectory(item.id, subItem.id, idx)"
                    >
                      轨迹
                    </div>
                    <div class="video-button" @click.stop="showMaterialVideo(subItem.id, idx)">视频</div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </el-scrollbar>
      </template>
    </Panel>
  </transition>
</template>

<script setup>
import {ref} from 'vue';
import axios from 'axios';
import Panel from '../../components/panel.vue';

import {CROSS_RESUME_TYPE} from './cross-material.ts';
import {
  crossResumeVisible,
  crossResumePanel,
  clearMaterialTraj,
  currentInfoIndex,
  isTrajChecked,
  isPcGrayPicChecked,
  isPcRgbPicChecked,
  showPointCloudGrayPic,
  showPointCloudRGBPic,
  showTrajectory,
  showMaterialTrajectory,
  showMaterialVideo,
  pcGrayPicIndex,
  pcRgbPicIndex,
  trajIndex,
} from './cross-resume-panel.ts';
import {refreshPointCloudPicture} from './cross-point-cloud-pic.ts';
import {refreshTrajectoryLines} from './cross-traj-line.ts';
import {videoPanelVisible} from '../../views/video-panel.ts';
import {renderPrimitiveManager} from '../../model/render-primitive.ts';

function changePos(left, top) {
  crossResumePanel.left = left;
  crossResumePanel.top = top;
}

function closePanel() {
  refreshPointCloudPicture(null, false);
  refreshTrajectoryLines(null, false);
  currentInfoIndex.value = -1;
  isTrajChecked.value = false;
  isPcGrayPicChecked.value = false;
  isPcRgbPicChecked.value = false;
  crossResumeVisible.value = false;
  clearMaterialTraj();
  videoPanelVisible.value = false;
  renderPrimitiveManager.clearAnimatedLinePrimitive();
}
</script>

<style scoped>
:deep(.el-checkbox) {
  color: #fff;
}

:deep(.el-checkbox__input),
:deep(.el-checkbox__label) {
  pointer-events: none;
}

.route-info {
  border-top: 1px dashed #565861;
  display: flex;
  align-items: center;
  border-bottom: 1px dashed #565861;
  margin: 0 6px;
}

.video-button {
  margin-top: 6px;
  margin-left: 20px;
  position: relative;
  color: #3e8cf6;
  cursor: pointer;
}

.line-center {
  margin-left: 20px;
  min-width: 110px;
  /* position: relative;
  transform: translateY(40%); */
}

.middle-block {
  margin-top: 10px;
  margin-bottom: 10px;
}

.event-check-item {
  padding: 0px 11px;
  border-radius: 8px;
  margin: 5px;
  background-color: #121525;
  line-height: 21px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.25s ease;
}

.event-check-item2 {
  padding: 5px;
  border-radius: 3px;
  margin: 10px 0;
  background-color: #242425;
  line-height: 21px;
  transition: background-color 0.25s ease;
}

.active-have-event {
  background-color: #209cef;
}
</style>
