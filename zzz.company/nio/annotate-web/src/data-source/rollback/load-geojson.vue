<template>
  <el-dialog v-model="loadGeojsonDlgData.visible" title="加载匹配数据" width="30%" draggable>
    <div>taskId</div>
    <el-input v-model="loadGeojsonDlgData.taskId"> </el-input>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="clickOK">{{ loadGeojsonDlgData.okLabel }}</el-button>
        <el-button type="primary" @click="clickCancel">
          {{ loadGeojsonDlgData.cancelLabel }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import {loadGeojsonDlgData} from './load-geojson-panel.ts';
import {loadingRollbackItems} from './geojson-list-panel.ts';
import {clearRollbackAllPrimitive} from './paged-list-panel.ts';
import axios from 'axios';

async function clickOK() {
  clearRollbackAllPrimitive(true);
  loadingRollbackItems(loadGeojsonDlgData.taskId);
  loadGeojsonDlgData.onOk();
}

function clickCancel() {
  loadGeojsonDlgData.onCancel();
}
</script>

<style scoped></style>
