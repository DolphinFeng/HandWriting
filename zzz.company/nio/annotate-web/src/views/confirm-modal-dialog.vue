<template>
  <el-dialog v-model="confirmModalDialogPanelData.visible" title="" width="30%" draggable>
    <span>{{ confirmModalDialogPanelData.detail }}</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="clickOK">{{ confirmModalDialogPanelData.okLabel }}</el-button>
        <el-button type="primary" @click="clickCancel">
          {{ confirmModalDialogPanelData.cancelLabel }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import {confirmModalDialogPanelData} from './confirm-modal-dialog-panel';

function clickOK() {
  confirmModalDialogPanelData.onOk();
}

function clickCancel() {
  confirmModalDialogPanelData.onCancel();
}
</script>

<style scoped></style>
