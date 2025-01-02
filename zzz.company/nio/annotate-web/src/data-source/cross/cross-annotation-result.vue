<template>
  <transition name="el-zoom-in-top">
    <Panel
      center
      v-model:visible="annoResultPanelData.visible"
      :width="300"
      :max-width="800"
      :height="annoResultPanelData.height"
      :max-height="600"
      :loading="annoResultPanelData.loading"
      scale-able
    >
      <template #header>
        <div>提交</div>
        <div style="flex: 1"></div>
        <div class="title-close" @click="closePanel">
          <i class="iconfont icon-guanbi1"></i>
        </div>
      </template>
      <template #default>
        <el-scrollbar height="100%">
          <!-- 事件类型 -->
          <div class="left-alignment" style="margin-top: 20px">本次提交包含事件信息如下：</div>
          <div v-for="(item, idx) in annoResultPanelData.list" style="margin-top: 20px; border-top: 1px dashed #565861">
            <div class="left-alignment" style="margin-top: 20px">
              {{ '路口id: ' + item.crossId }}
            </div>
            <li class="route-info">
              <div class="left-alignment" style="margin-top: -50px">路径:</div>
              <div style="margin: 0 auto">
                <div style="margin-top: 20px">
                  <canvas :id="'crossResultThum' + item.routeId" style="width: 100%; height: 100%">
                    Your browser does not support the HTML5 canvas tag.
                  </canvas>
                </div>
                <div style="color: #565861">{{ item.routeId }}</div>
              </div>
            </li>
            <div class="left-alignment">标注结果: {{ item.annotation }}</div>
          </div>
          <!-- 多选统计信息 -->
          <div>
            <button class="footer-btn-cancel" @click="cancelHandler">取消</button>
            <button class="footer-btn-ok" @click="confirmHandler">确定</button>
          </div>
        </el-scrollbar>
      </template>
    </Panel>
  </transition>
</template>

<script setup>
import {annoResultPanelData, crossAnnoResultPanelCallback} from './cross-annotation-result-panel.ts';
import {routeInfosPanel, crossInfoPanel, drawCrossThumbnail} from './cross-info-panel.ts';
import {getCrossLabelTypeDesc} from './cross-annotation-panel.ts';
import {annotationMap} from './cross-anno-data.ts';
import {nextTick} from 'vue';
import {submitTask} from '../../system/task-list.ts';
import {NioMessage} from '../../utils/utils.js';

crossAnnoResultPanelCallback.push(() => {
  annoResultPanelData.visible = true;
  let itemCount = annotationMap.annotation.size <= 3 ? annotationMap.annotation.size : 3;
  annoResultPanelData.height = 145 + itemCount * 181;

  annoResultPanelData.list = Array.from(annotationMap.annotation, ([key, value]) => {
    return {
      crossId: annotationMap.crossId,
      routeId: key,
      annotation: getCrossLabelTypeDesc(value),
    };
  });

  nextTick(() => {
    for (let routeInfo of annotationMap.routeInfosPanelBak) {
      if (annotationMap.annotation.has(routeInfo.routeId)) {
        drawCrossThumbnail(undefined, routeInfo, 'crossResultThum' + routeInfo.routeId, 112, 63, 6);
      }
    }
  });
});

//单条事件修改模式时的关闭
function closePanel() {
  annoResultPanelData.visible = false;
}

//取消事件
function cancelHandler() {
  annoResultPanelData.visible = false;
}

//确定保存事件
async function confirmHandler() {
  annoResultPanelData.loading = true;
  if (await submitTask()) {
    annoResultPanelData.visible = false;
    NioMessage('success', '提交成功', 2000);
  }

  annoResultPanelData.loading = false;
}
</script>

<style scoped>
.left-alignment {
  margin-left: 20px;
}
.route-info {
  display: flex;
  justify-content: center;
  align-items: center;
}
.event-data {
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  padding: 8px 10px 14px;
}

.footer-btn-ok {
  margin-left: 20px;
  margin-top: 20px;
  width: 120px;
  padding: 3px 0;
  border: none;
  border-radius: 2px;
  text-align: center;
  font-size: 14px;
  color: white;
  cursor: pointer;
  outline: none;
  background-color: #4e83ee;
}

.footer-btn-cancel {
  margin-left: 20px;
  margin-top: 20px;
  width: 120px;
  padding: 3px 0;
  border: none;
  border-radius: 2px;
  text-align: center;
  font-size: 14px;
  color: white;
  cursor: pointer;
  outline: none;
  background-color: #909399;
}
</style>
