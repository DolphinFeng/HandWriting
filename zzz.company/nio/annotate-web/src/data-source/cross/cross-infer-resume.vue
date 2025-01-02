<template>
  <transition name="el-zoom-in-top">
    <Panel
      v-model:left="crossInferResumePanel.left"
      v-model:top="crossInferResumePanel.top"
      v-model:visible="crossInferResumeVisible"
      :width="800"
      :max-width="800"
      :height="420"
      :max-height="600"
      scale-able
      @changePos="changePos"
    >
      <template #header>
        <div>推理履历</div>
        <div style="flex: 1"></div>
        <div class="title-close" @click="closePanel">
          <i class="iconfont icon-guanbi1"></i>
        </div>
      </template>
      <template #default>
        <el-scrollbar height="100%" v-loading="crossInferResumePanel.loading">
          <li v-for="(item, idx) in crossInferResumePanel.list" class="route-info">
            <div>{{ crossInferResumePanel.list.length - idx }}</div>
            <div class="line-center">
              {{ item.createTime }}
            </div>
            <div style="margin-left: 20px">
              <div class="algvsn-info">
                {{ item.algVsn }}
              </div>
              <div class="middle-block">
                {{ item.text }}
              </div>
              <div style="display: flex; margin-bottom: 6px">
                <div
                  class="event-check-item"
                  :class="{
                    'active-have-event': item.showOrigin,
                  }"
                  @click="showOriginPic(item.id)"
                >
                  原始图
                </div>
                <div
                  class="event-check-item"
                  :class="{
                    'active-have-event': item.showTraj,
                  }"
                  @click="showTrajPic(item.id)"
                >
                  轨迹图
                </div>
                <div
                  class="event-check-item"
                  :class="{
                    'active-have-event': item.showResult,
                  }"
                  @click="showResultPic(item.id)"
                >
                  结果图
                </div>
                <div
                  v-loading="item.productLoading"
                  class="event-check-item"
                  :class="{
                    'active-have-event': item.showProduct,
                  }"
                  @click="showInferProductData(item.id)"
                >
                  产品库数据
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
import Panel from '../../components/panel.vue';
import {renderPrimitiveManager} from '../../model/render-primitive';

import {
  crossInferResumeVisible,
  crossInferResumePanel,
  closeInferResumePanel,
  showOriginPic,
  showTrajPic,
  showResultPic,
  showInferProductData,
} from './cross-infer-resume-panel.ts';

function closePanel() {
  closeInferResumePanel();
}

function changePos(left, top) {
  crossInferResumePanel.left = left;
  crossInferResumePanel.top = top;
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

.algvsn-info {
  margin-top: 10px;
  color: white;
  border-radius: 4px;
  transition: background-color 0.25s ease;
  background-color: #375ddf;
  display: inline-block;
  padding: 2px;
}

.route-info {
  border-top: 1px dashed #565861;
  display: flex;
  align-items: center;
  border-bottom: 1px dashed #565861;
  margin: 0 6px;
}

.line-center {
  margin-left: 20px;
  min-width: 90px;
  /* position: relative;
  transform: translateY(40%); */
}

.middle-block {
  margin-top: 10px;
  margin-bottom: 6px;
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
