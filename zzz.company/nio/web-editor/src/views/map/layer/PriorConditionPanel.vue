<template>
  <transition name="el-zoom-in-top">
    <Panel
      v-model:visible="priorConPaneldata.visible"
      :width="340"
      :min-width="300"
      :max-width="400"
      :height="120"
      :min-height="250"
      :max-height="600"
      :top="316"
      :left="1153"
      scale-able
    >
      <template #header>
        <div>预上线先验事件库条件</div>
        <div style="flex: 1"></div>
        <div class="title-close" @click="() => closePanel()">
          <i class="iconfont icon-guanbi1"></i>
        </div>
      </template>
      <template #default>
        <p class="layer-describe">产品库</p>
        <el-input
          style="width: 50%; margin: 10px"
          v-model="priorConPaneldata.productId"
          @blur="handleBlur('productId')"
        ></el-input>
        <p class="layer-describe">分支</p>
        <el-input
          style="width: 50%; margin: 10px"
          v-model="priorConPaneldata.branchId"
          @blur="handleBlur('branchId')"
        ></el-input>
      </template>
    </Panel>
  </transition>
</template>

<script lang="ts" setup>
import Panel from '../../../components/panel/Panel.vue';
import {priorConPaneldata} from './PriorConditionPanel';
import {layerListItems} from '../../../system/layer/layerController.js';
import {dynamicEventLayer, priorDynamicEventLayer} from '../../../system/layer/tileLayer/tileLayerController.js';
import {useStore} from 'vuex';
import {ref} from 'vue';

const store = useStore();

let productBlurState = ref(false);
let branchBlurState = ref(false);

function handleBlur(type: string) {
  if (type == 'productId') {
    productBlurState.value = true;
  } else if (type == 'branchId') {
    branchBlurState.value = true;
  }

  if (productBlurState.value == true && branchBlurState.value == true) {
    // 实现逻辑
    console.log('111');
  }
}

function closePanel() {
  priorConPaneldata.visible = false;
  priorConPaneldata.productId = '';
  priorConPaneldata.branchId = '';
  productBlurState.value = false;
  branchBlurState.value = false;
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
.layer-box {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  align-content: center;
  padding-left: 3%;
  padding-right: 3%;
}
.layer-item {
  padding: 1px 11px;
  border-radius: 8px;
  margin: 10px;
  background-color: #121525;
  font-size: 12px;
  line-height: 21px;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.25s ease;
}
.active-layer {
  background-color: #5486eb;
}
.layer-describe {
  padding-left: 5%;
  padding-right: 5%;
  margin-bottom: 0;
  color: rgb(197, 197, 197);
  text-align: left;
}
</style>

<style>
.el-input__wrapper,
.el-input__wrapper:hover {
  background-color: #252526 !important;
  box-shadow: 0 0 0 1px #252526 inset;
}
.picker-date,
.el-popper__arrow::before,
.el-time-panel {
  background-color: #333546 !important;
  border: 0 !important;
}
.el-date-range-picker,
.el-picker-panel__footer {
  background-color: #333546 !important;
}
.disabled .el-date-table-cell,
.disabled .cell {
  background-color: #606266 !important;
}

.is-focus {
  box-shadow: 0 0 0 1px #333546 inset !important;
}

.el-date-range-picker__time-header {
  border-bottom: none !important;
}

.el-date-range-picker__content.is-left {
  border-right: none !important;
}

.el-picker-panel__footer {
  border-top: none !important;
}

.el-picker-panel__body,
.el-date-picker__header > span,
.el-date-picker__header button,
.el-time-panel .el-time-spinner__item {
  color: #ffffff !important;
}
.picker-date tbody tr th,
.picker-date tbody tr td,
.picker-date tbody tr .cell {
  color: #ffffff !important;
}

.el-date-table td.in-range .el-date-table-cell,
.el-time-panel .el-time-spinner__item:hover {
  background-color: rgba(64, 158, 255, 0.2) !important;
}

.el-picker-panel__footer .is-text,
.el-time-panel__btn.cancel {
  color: var(--el-color-primary) !important;
}

.el-picker-panel__footer .is-text:hover,
.el-time-panel__btn.cancel {
  background: none !important;
}

.el-picker-panel__footer .is-plain,
.el-time-panel__btn.confirm {
  background: none !important;
  color: #ffffff;
}

.el-picker-panel__footer .is-plain:hover,
.el-time-panel__btn.confirm {
  color: var(--el-color-primary);
}

.el-picker-panel__icon-btn {
  color: #fff;
}
</style>
