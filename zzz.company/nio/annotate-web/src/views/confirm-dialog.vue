<template>
  <Panel center title-center :width="360" :height="200" :visible="confirmDialogPanelData.visible">
    <template #header>
      <div class="quality-result-title">
        <div>{{ confirmDialogPanelData.title }}</div>
      </div>
    </template>
    <template #default>
      <div class="quality-box" v-loading="confirmDialogPanelData.loading">
        <div class="save-info-box">
          <div>{{ confirmDialogPanelData.detail }}</div>
          <!-- <div v-if="confirmTitleShow">
            质检通过后,该作业任务对应的标注数据,将发送至管理平台,进行后续数据成图,是否确认
          </div>
          <div v-else>质检不通过,该作业任务会打回至原作业员进行修改,是否确认</div> -->
        </div>
        <div class="footer-btn-group">
          <button class="footer-btn cancel" title="取消" @click="cancelHandler">取消</button>
          <button style="margin-left: 40px" class="footer-btn confirm" title="保存事件" @click="confirmHandler">
            确定
          </button>
        </div>
      </div>
    </template>
  </Panel>
</template>

<script setup>
import Panel from '../components/panel.vue';
import {confirmDialogPanelData} from './confirm-dialog-panel.ts';

function confirmHandler() {
  confirmDialogPanelData.onOk();
}

function cancelHandler() {
  confirmDialogPanelData.onCancel();
}
</script>

<style scoped>
.quality-result-title {
  font-size: 15px;
}
.title {
  color: #ccc;
}

.quality-box {
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  height: 100%;
  padding: 14px 12px;
  user-select: none;
}
.save-info-box {
  margin: 25px 20px 0;
  font-size: 14px;
}
</style>
