<template>
  <transition name="el-zoom-in-top">
    <Panel
      v-model:left="crossInfoPanel.left"
      v-model:top="crossInfoPanel.top"
      v-model:visible="crossInfoPanel.visible"
      :width="540"
      :max-width="800"
      :height="500"
      :max-height="1000"
      scale-able
      @changePos="changePos"
    >
      <template #header>
        <div v-if="crossInfoPanel.crossId.projectId === '10068'">路口信息</div>
        <div v-else-if="crossInfoPanel.crossId.projectId === '10069'">匝道信息</div>
        <div v-else-if="crossInfoPanel.crossId.projectId === '10106'">主路信息</div>
        <el-icon color="#3e8cf6" style="margin-left: 5px; cursor: pointer" size="20px" @click.stop="createShareUrl()">
          <Share />
        </el-icon>
        <div style="flex: 1"></div>
        <div class="title-close" @click="closePanel">
          <i class="iconfont icon-guanbi1"></i>
        </div>
      </template>
      <template #default>
        <el-scrollbar height="100%" v-loading="infoLoading" ref="crossInfoScroll">
          <p class="layer-describe" v-if="crossInfoPanel.crossId.projectId === '10068'">路口id</p>
          <p class="layer-describe" v-if="crossInfoPanel.crossId.projectId === '10069'">匝道id</p>
          <p class="layer-describe" v-if="crossInfoPanel.crossId.projectId === '10106'">主路id</p>
          <p class="layer-describe" v-if="crossInfoPanel.crossId.projectId === '10108'">环岛id</p>
          <div style="padding-left: 17px; margin-top: 10px">
            {{ crossInfoPanel.crossId.id }}
          </div>

          <div class="summary-info-container">
            <el-steps :active="-1">
              <el-step description="&nbsp;模型">
                <template v-slot:icon>
                  <div style="width: 100%; height: 100%; background-color: #333745">
                    <div
                      :class="crossModelResumeVisible ? 'summary-info-color' : 'summary-info'"
                      @click="clickModelSnapshot(crossInfoPanel.crossId, crossInfoPanel.modelSnapshotNum)"
                    >
                      {{ crossInfoPanel.modelSnapshotNum }}
                    </div>
                  </div>
                </template>
              </el-step>
              <el-step description="&nbsp;推理" style="color: #ccc">
                <template v-slot:icon>
                  <div style="width: 100%; height: 100%; background-color: #333745">
                    <div
                      :class="crossInferResumeVisible ? 'summary-info-color' : 'summary-info'"
                      @click="clickInferSnapshot(crossInfoPanel.crossId, crossInfoPanel.inferenceSnapshotNum)"
                    >
                      {{ crossInfoPanel.inferenceSnapshotNum }}
                    </div>
                  </div>
                </template>
              </el-step>
              <el-step description="&nbsp;融合">
                <template v-slot:icon>
                  <div style="width: 100%; height: 100%; background-color: #333745">
                    <div
                      :class="crossFusionResumeVisible ? 'summary-info-color' : 'summary-info'"
                      @click="clickFusionSnapshot(crossInfoPanel.crossId, crossInfoPanel.fusionSnapshotNum)"
                    >
                      {{ crossInfoPanel.fusionSnapshotNum }}
                    </div>
                  </div>
                </template>
              </el-step>
            </el-steps>
          </div>

          <div>
            <div v-for="(item, idx) in routeInfosPanel">
              <div class="route-id" style="margin: 0 15px">
                <div v-if="idx === 0 || item.crossId !== routeInfosPanel[idx - 1].crossId">
                  <div style="display: flex; align-items: center; margin: 15px 0">
                    <template v-if="crossInfoPanel.crossId.projectId === '10108'">
                      <div class="reduce-number">
                        {{ routeNumbers[idx] }}
                      </div>
                      <div>{{ item.kind === 1 ? '关联路口id' : item.kind === 2 ? '关联匝道id' : '关联主路id' }}</div>
                    </template>
                  </div>
                  <div style="margin-top: 10px">
                    {{ item.crossId }}
                  </div>
                  <p style="margin-bottom: 5px; color: rgb(197, 197, 197); text-align: left">行驶路径</p>
                </div>
              </div>
              <li
                class="route-info"
                @click="clickRoute(item.routeId)"
                :class="{'active-current': item.routeId == currentInfoIndex}"
              >
                <div style="display: flex; align-items: stretch; width: 50%">
                  <div id="divCanvas" style="margin-top: 15px; flex: 1; min-width: 0">
                    <canvas :id="'crossThum' + idx" style="width: 100%; height: 100%">
                      Your browser does not support the HTML5 canvas tag.
                    </canvas>
                  </div>
                  <div class="route-info-details">
                    <div class="middle-block">
                      <div>采集状态：</div>
                      <div
                        class="collect-status"
                        :style="{
                          'background-color': COLLECT_STATUS_COLOR[item.collectStatus],
                          padding: '0 4px',
                        }"
                      >
                        {{ COLLECT_STATUS_DESC[item.collectStatus] }}
                      </div>
                    </div>
                    <div class="middle-block">
                      <div>标注状态：</div>
                      <div
                        class="collect-status"
                        :style="{
                          'background-color': MARK_STATUS_COLOR[item.markStatus],
                          padding: '0 4px',
                        }"
                      >
                        {{ MARK_STATUS_DESC[item.markStatus] }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="routeIdLine" style="flex-basis: 100%; margin: 4px 0">{{ item.routeId }}</div>
                <div style="margin-left: auto; margin-right: 1px; width: 200px">
                  <div
                    v-if="
                      tasks.currentTask &&
                      tasks.currentTask.taskType == TaskType.CLOUD_MAPPING_CHECK &&
                      annotationMap.crossId == crossInfoPanel.crossId.id
                    "
                    class="line-anno"
                  >
                    {{ item.annotation == '' ? '--' : '(' + item.annotation + ')' }}
                  </div>
                  <div v-else class="line-anno-placeholder"></div>
                  <div class="num-wrapper">
                    <div class="line-center" @click="clickSnapShot(item.routeId)">
                      {{ item.snapShotNum }}
                    </div>
                    <div
                      v-if="
                        tasks.currentTask &&
                        tasks.currentTask.taskType == TaskType.CLOUD_MAPPING_CHECK &&
                        annotationMap.crossId == crossInfoPanel.crossId.id
                      "
                      class="line-center"
                      @click.stop="clickAnnotate(item)"
                      :style="getColor(item)"
                    >
                      标注
                    </div>
                    <el-icon
                      color="#FF0000"
                      style="margin-right: 20px; cursor: pointer"
                      v-if="item.annotated"
                      size="20px"
                      @click.stop="removeAnnotate(item)"
                    >
                      <Delete />
                    </el-icon>
                  </div>
                </div>
              </li>
            </div>
          </div>
        </el-scrollbar>
      </template>
    </Panel>
  </transition>
</template>

<script setup>
import {tasks, TaskType} from '../../system/task-list.ts';
import Panel from '../../components/panel.vue';
import {
  crossInfoPanel,
  routeInfosPanel,
  infoLoading,
  loadRouteInfosPanel,
  loadCrossSummaryInfo,
} from './cross-info-panel.ts';
import {getCrossLabelTypeDesc} from './cross-annotation-panel.ts';
import {MARK_STATUS_COLOR, MARK_STATUS_DESC, COLLECT_STATUS_DESC, COLLECT_STATUS_COLOR} from './cross-material.ts';
import {refreshCrossRouteLines, clearCrossRouteLines} from './cross-route-line.ts';
import {
  refreshModelResumePanel,
  crossModelResumeVisible,
  crossModelBevModel,
  closeModelResumePanel,
} from './cross-model-resume-panel.ts';
import {
  refreshInferResumePanel,
  crossInferResumeVisible,
  crossInferBevModel,
  closeInferResumePanel,
} from './cross-infer-resume-panel.ts';
import {
  refreshFusionResumePanel,
  crossFusionResumeVisible,
  closeFusionResumePanel,
} from './cross-fusion-resume-panel.ts';
import {clickSnapShot, crossResumePanel} from './cross-resume-panel.ts';
import {createShareUrl} from '../../system/view-restore-func.ts';
import {nextTick, watch, ref, computed, onMounted} from 'vue';

import {
  isTrajChecked,
  isPcGrayPicChecked,
  isPcRgbPicChecked,
  currentInfoIndex,
  crossResumeVisible,
} from './cross-resume-panel.ts';
import {refreshPointCloudPicture} from './cross-point-cloud-pic.ts';
import {refreshTrajectoryLines} from './cross-traj-line.ts';
import {createCrossHighlightEntities, clearCrossHighlightEntities} from './cross-highlight-entity.js';
import {drawCrossThumbnail, crossPanelCallback} from './cross-info-panel.ts';
import {
  annotationPanelData,
  getCrossLabelType,
  validLabel,
  saveCrossAnnotationData,
  closeAnnotationPanel,
} from './cross-annotation-panel.ts';
import {annotationMap} from './cross-anno-data.ts';
import {NioMessage} from '../../utils/utils';
import {annoResultPanelData} from './cross-annotation-result-panel.ts';
import {renderPrimitiveManager} from '../../model/render-primitive.ts';

const crossInfoScroll = ref(null);

function changePos(left, top) {
  crossInfoPanel.left = left;
  crossInfoPanel.top = top;
}

const routeNumbers = computed(() => {
  let number = 1;
  return routeInfosPanel.map((item, idx) => {
    if (idx === 0 || item.crossId !== routeInfosPanel[idx - 1].crossId) {
      return number++;
    }
    return number;
  });
});

watch(currentInfoIndex, (newVal) => {
  nextTick(() => {
    const wrap = crossInfoScroll.value?.wrapRef;
    const active = wrap?.querySelector('.active-current');
    const inner = wrap?.children[0];

    if (!wrap || !active || !inner) return;

    const wrapRect = wrap.getBoundingClientRect();
    const innerRect = inner.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();

    const toPosition = getToPosition(wrapRect, innerRect, activeRect);
    if (toPosition.y != undefined) {
      toPosition.y += 20;
      animationFrame(toPosition, wrap);
    }
  });
});

/**
 * 取得目标坐标
 */
const getToPosition = (wrapRect, innerRect, activeRect, margin = 0) => {
  let x, y;
  if (activeRect.left - margin < wrapRect.left) {
    x = activeRect.left - innerRect.left - margin;
  } else if (activeRect.right + margin > wrapRect.right) {
    x = activeRect.right - wrapRect.right + wrapRect.left - innerRect.left + margin;
  }
  if (activeRect.top - margin < wrapRect.top) {
    y = activeRect.top - innerRect.top - margin;
  } else if (activeRect.bottom + margin > wrapRect.bottom) {
    y = activeRect.bottom - wrapRect.bottom + wrapRect.top - innerRect.top + margin;
  }
  return {x, y};
};

const cubic = (val) => Math.pow(val, 3);

const inOutCubic = (val) => (val < 0.5 ? cubic(val * 2) / 2 : 1 - cubic((1 - val) * 2) / 2);

/**
 * 滚动动画
 *
 * @param to 目标坐标
 * @param wrap 外层容器
 * @param cost 动画时长(毫秒)默认400毫秒
 */
const animationFrame = (to, wrap, cost = 400) => {
  if (!wrap) return;
  const wrapRect = wrap.getBoundingClientRect();
  const beginTime = Date.now();
  const loop = window.requestAnimationFrame || ((func) => setTimeout(func, 16));
  const frame = () => {
    const progress = (Date.now() - beginTime) / cost;
    if (progress < 1) {
      if (to.x != undefined) {
        if (to.x < wrapRect.left) {
          wrap.scrollLeft = wrap.scrollLeft - (wrap.scrollLeft - to.x) * inOutCubic(progress);
        } else {
          wrap.scrollLeft = wrap.scrollLeft + (to.x - wrap.scrollLeft) * inOutCubic(progress);
        }
      }
      if (to.y != undefined) {
        if (to.y < wrapRect.top) {
          wrap.scrollTop = wrap.scrollTop - (wrap.scrollTop - to.y) * inOutCubic(progress);
        } else {
          wrap.scrollTop = wrap.scrollTop + (to.y - wrap.scrollTop) * inOutCubic(progress);
        }
      }
      loop(frame);
    } else {
      if (to.x != undefined) wrap.scrollLeft = to.x;
      if (to.y != undefined) wrap.scrollTop = to.y;
    }
  };
  loop(frame);
};

//调用了nextTick，不能导出? 使用回调方式调用
crossPanelCallback.push(async (crossId) => {
  infoLoading.value = true;
  isPcGrayPicChecked.value = false;
  isPcRgbPicChecked.value = false;
  isTrajChecked.value = false;
  crossResumeVisible.value = false;

  crossInferBevModel.clear();
  crossModelBevModel.clear();
  renderPrimitiveManager.removeAll();
  crossModelResumeVisible.value = false;
  crossInferResumeVisible.value = false;
  crossFusionResumeVisible.value = false;

  crossInfoPanel.visible = true;
  crossInfoPanel.crossId = crossId; //对象

  refreshPointCloudPicture(null, false);
  refreshTrajectoryLines(null, false);
  clearCrossHighlightEntities();

  await loadRouteInfosPanel(crossId.id); // 确保第一次点击圆圈可以绘制出相连线

  const promise1 = createCrossHighlightEntities(crossId); //这个画高亮，需要带上projectId区分方形和圆形
  const promise2 = loadRouteInfosPanel(crossId.id);
  const promise3 = loadCrossSummaryInfo(crossId); //这个更新接口，需要带上projectId

  await Promise.all([promise1, promise2, promise3]);

  infoLoading.value = false;
  nextTick(() => {
    for (let i = 0; i < routeInfosPanel.length; i++) {
      let routeInfo = routeInfosPanel[i];
      drawCrossThumbnail(i, routeInfo, 'crossThum' + i, 120, 90, 12);
    }

    //更新面板标注状态
    for (let routeInfoPanel of routeInfosPanel) {
      if (annotationMap.annotation.has(routeInfoPanel.routeId)) {
        let anno = annotationMap.annotation.get(routeInfoPanel.routeId);
        routeInfoPanel.annotated = true;
        routeInfoPanel.annotation = getCrossLabelTypeDesc(anno);
      } else {
        routeInfoPanel.annotated = false;
        routeInfoPanel.annotation = '';
      }
    }
  });
});

function clickAnnotate(item) {
  //加载下一个
  annotationPanelData.visible = true;
  crossResumePanel.currentRouteId = item.routeId;
  if (annotationMap.annotation.has(crossResumePanel.currentRouteId)) {
    annotationPanelData.labelValue = annotationMap.annotation.get(crossResumePanel.currentRouteId);
    annotationPanelData.labelType = getCrossLabelType(annotationPanelData.labelValue);
  } else {
    annotationPanelData.labelType = 1;
    annotationPanelData.labelValue = validLabel.点云清楚有效;
  }

  if (
    tasks.currentTask &&
    tasks.currentTask.taskType == TaskType.CLOUD_MAPPING_CHECK &&
    tasks.currentTask.taskStep == 'step_tag'
  ) {
    saveCrossAnnotationData();
  }

  annoResultPanelData.visible = false;
}

function removeAnnotate(item) {
  if (
    !(
      tasks.currentTask &&
      tasks.currentTask.taskType == TaskType.CLOUD_MAPPING_CHECK &&
      tasks.currentTask.taskStep == 'step_tag'
    )
  ) {
    NioMessage('error', '质检环节不支持更改标注结果');
    return;
  }

  annotationMap.annotation.delete(item.routeId);

  //更新面板状态
  for (let routeInfoPanel of routeInfosPanel) {
    if (routeInfoPanel.routeId == item.routeId) {
      routeInfoPanel.annotated = false;
      routeInfoPanel.annotation = '';
    }
  }

  annoResultPanelData.visible = false;
  closeAnnotationPanel();
}

function closePanel() {
  crossInfoPanel.visible = false;
  clearCrossRouteLines();
  clearCrossHighlightEntities();

  closeModelResumePanel();
  closeInferResumePanel();
  closeFusionResumePanel();
}

function getColor(item) {
  if (item.routeId == crossResumePanel.currentRouteId) {
    return {
      color: '#ff0000',
    };
  }

  return {
    color: '#3e8cf6',
  };
}

function clickRoute(id) {
  currentInfoIndex.value = id;
  //高亮显示路径
  refreshCrossRouteLines(routeInfosPanel, id);
}

async function clickModelSnapshot(id, num) {
  if (num == 0) {
    NioMessage('warning', '无履历数据', 2000);
    return;
  }
  await refreshModelResumePanel(id);
}

async function clickInferSnapshot(id, num) {
  if (num == 0) {
    NioMessage('warning', '无履历数据', 2000);
    return;
  }
  await refreshInferResumePanel(id);
}

async function clickFusionSnapshot(id, num) {
  if (num == 0) {
    NioMessage('warning', '无履历数据', 2000);
    return;
  }
  await refreshFusionResumePanel(id);
}
</script>

<style scoped>
.summary-info-container {
  margin-left: 30px;
  margin-right: 50px;
  margin-top: 30px;
  /* margin-bottom: 30px; */
  /* display: flex; 设置为flex容器 */
}

.summary-info {
  color: white;
  border-radius: 4px;
  line-height: 21px;
  transition: background-color 0.25s ease;
  background-color: rgb(130, 176, 130);
  cursor: pointer;
  /* display: inline-block; */
  text-align: center;
  width: 50%;
  margin: 0 auto;
  user-select: none;
}

.summary-info-fusion {
  color: white;
  border-radius: 4px;
  line-height: 21px;
  transition: background-color 0.25s ease;
  background-color: gray;
  cursor: pointer;
  /* display: inline-block; */
  text-align: center;
  margin-left: 10px;
  width: 110%;
  user-select: none;
}

.summary-info-color {
  color: white;
  border-radius: 4px;
  line-height: 21px;
  transition: background-color 0.25s ease;
  background-color: rgb(62, 117, 255);
  cursor: pointer;
  /* display: inline-block; */
  text-align: center;
  width: 50%;
  margin: 0 auto;
}

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
  flex-wrap: wrap;
  padding: 0 10px;
  /* justify-content: space-between; */
}

.line-center {
  margin: 0 auto;
  margin-right: 20px;
  position: relative;
  color: #3e8cf6;
  cursor: pointer;
}

.line-anno {
  margin: 0 0 16px 10px;
  color: #60f63e;
  transform: translateY(-100px);
}

.line-anno-placeholder {
  height: 20px;
}

.num-wrapper {
  display: flex;
  align-items: center;
  margin-top: -70px;
  transform: translateY(-25px);
}

.middle-block {
  display: flex;
  width: 200px;
  margin-top: 10px;
  margin-bottom: 10px;
}

.layer-describe {
  margin-bottom: 0;
  color: rgb(197, 197, 197);
  text-align: left;
  margin-left: 17px;
}

.collect-status {
  color: white;
  border-radius: 4px;
  line-height: 21px;
  transition: background-color 0.25s ease;
}

.active-current {
  background-color: rgb(104, 113, 113);
}

.reduce-number {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: transparent;
  border: 1px solid #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 8px;
}

:deep(.el-step__description) {
  padding: 3% 0 0 3%;
}
:deep(.el-step:last-of-type .el-step__description) {
  padding: 5px;
}

.route-info-details {
  flex: 1;
  justify-content: center;
  display: flex;
  flex-direction: column;
  min-width: 0;
  margin-left: 15px;
  transform: translateY(10px);
}
</style>
