<template>
  <transition name="el-zoom-in-top">
    <Panel
      center
      v-model:visible="taskDetailPanel.visible"
      :width="610"
      :max-width="800"
      :height="taskDetailPanel.transferResume.length != 0 ? 800 : 300"
      :max-height="1600"
      scale-able
    >
      <template #header>
        <div>任务信息</div>
        <div style="flex: 1"></div>
        <div class="title-close" @click="closePanel">
          <i class="iconfont icon-guanbi1"></i>
        </div>
      </template>
      <template #default>
        <el-scrollbar height="100%" v-loading="taskDetailPanel.loading">
          <li v-for="(item, idx) in taskDetailPanel.descriptions">
            <div class="detail-block">
              {{ item.summary }}
            </div>
            <div v-for="(subItem, idx) in item.items">
              <div style="display: flex">
                <div class="detail-sub-item-key">
                  {{ subItem.key }}
                </div>
                <div class="detail-sub-item-value">
                  {{ subItem.value }}
                </div>
              </div>
            </div>
          </li>
          <li v-if="taskDetailPanel.transferResume.length != 0" class="detail-block">流转记录</li>
          <li v-for="(item, idx) in taskDetailPanel.transferResume" class="transfer-info">
            <div>{{ taskDetailPanel.transferResume.length - idx }}</div>
            <div class="line-center">
              {{ item.createTime }}
            </div>
            <div style="margin-left: 50px">
              <div class="desc-info">
                {{ item.text }}
              </div>
              <div v-if="item.desc.length != ''" class="event-check-item2">
                {{ item.desc }}
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
import Panel from '../components/panel.vue';

import {taskDetailPanel} from './task-detail-panel.ts';

function closePanel() {
  taskDetailPanel.visible = false;
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

.desc-info {
  margin-top: 10px;
  display: inline-block;
  padding: 2px;
  color: #b7b8ba;
  font-size: 13px;
}

.detail-block {
  margin-top: 20px;
  margin-bottom: 20px;
  margin-left: 30px;
  margin-right: 30px;
  border-bottom: 1px dashed #565861;
}

.transfer-info {
  /* border-top: 1px dashed #565861; */
  display: flex;
  align-items: center;
  /* border-bottom: 1px dashed #565861; */
  margin-left: 30px;
  color: #b7b8ba;
  font-size: 13px;
}
.detail-sub-item-key {
  margin-left: 30px;
  margin-top: 10px;
  margin-bottom: 10px;
  width: 60px;
  color: #b7b8ba;
  font-size: 13px;
}
.detail-sub-item-value {
  margin-left: 50px;
  margin-top: 10px;
  margin-bottom: 10px;
  width: 200px;
  color: #b7b8ba;
  font-size: 13px;
}
.line-center {
  margin-left: 40px;
  /* position: relative;
  transform: translateY(40%); */
}

.event-check-item2 {
  padding: 5px;
  border-radius: 3px;
  margin: 10px 0;
  background-color: #242425;
  line-height: 21px;
  transition: background-color 0.25s ease;
}
</style>
