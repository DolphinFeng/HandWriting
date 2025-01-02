<template>
  <transition name="el-zoom-in-top">
    <Panel
      v-model:visible="eventConPaneldata.visible"
      :width="500"
      :min-width="300"
      :max-width="800"
      :height="520"
      :min-height="100"
      :max-height="600"
      :top="316"
      :left="1153"
      scale-able
    >
      <template #header>
        <div>事件类型</div>
        <el-checkbox
          style="margin-left: 20px"
          v-model="checkedAll"
          label="全选"
          size="large"
          @change="checkedAllChanged"
          :indeterminate="isIndeterminate"
        />
        <div style="flex: 1"></div>
        <div class="title-close" @click="() => closePanel()">
          <i class="iconfont icon-guanbi1"></i>
        </div>
      </template>
      <template #default>
        <el-scrollbar height="100%">
          <p class="layer-describe">高速城快 (NOP+)</p>
          <div class="layer-box">
            <div
              @click.stop="clickNop($event)"
              v-for="(val, key) in EventTypeNop"
              class="layer-item"
              :class="{
                'active-layer': eventConPaneldata.nopOption[key],
              }"
              :data-id="key"
            >
              {{ val + ': ' + key }}
            </div>
          </div>
          <p class="layer-describe">城区 (NAD)</p>
          <div class="layer-box">
            <div
              @click.stop="clickNad($event)"
              v-for="(val, key) in EventTypeNad"
              class="layer-item"
              :class="{
                'active-layer': eventConPaneldata.nadOption[key],
              }"
              :data-id="key"
            >
              {{ val + ': ' + key }}
            </div>
          </div>
        </el-scrollbar>
      </template>
    </Panel>
  </transition>
</template>

<script lang="ts" setup>
import Panel from '../../../components/panel/Panel.vue';
import {eventConPaneldata} from './EventConditionPanel.ts';
import {reloadOddData} from './ReloadOddLayer.js';
import {useStore} from 'vuex';
import {ref} from 'vue';
import {EventTypeNop, EventTypeNad} from '../../../system/odd/enum/EventType.js';

const store = useStore();

const checkedAll = ref(true);
const isIndeterminate = ref(false);

//初始化调用一次
setCheckAllState();

function checkedAllChanged() {
  const eventTypeNopOption = Object.keys(EventTypeNop).reduce((obj, key) => {
    obj[key] = checkedAll.value;
    localStorage.setItem('event-' + key, checkedAll.value.toString());
    return obj;
  }, {});

  eventConPaneldata.nopOption = eventTypeNopOption;

  const eventTypeNadOption = Object.keys(EventTypeNad).reduce((obj, key) => {
    obj[key] = checkedAll.value;
    localStorage.setItem('event-' + key, checkedAll.value.toString());
    return obj;
  }, {});

  eventConPaneldata.nadOption = eventTypeNadOption;
  isIndeterminate.value = false;
  reloadOddData(store);
}

function setCheckAllState() {
  let checked: number = 0;
  let unchecked: number = 0;
  let keys1 = Object.keys(eventConPaneldata.nopOption);
  for (let key1 of keys1) {
    if (eventConPaneldata.nopOption[key1] == false) {
      unchecked++;
    } else {
      checked++;
    }
  }

  let keys2 = Object.keys(eventConPaneldata.nadOption);
  for (let key2 of keys2) {
    if (eventConPaneldata.nadOption[key2] == false) {
      unchecked++;
    } else {
      checked++;
    }
  }

  let keysLength: number = keys1.length + keys2.length;

  if (checked == keysLength) {
    checkedAll.value = true;
    isIndeterminate.value = false;
  } else if (unchecked == keysLength) {
    checkedAll.value = false;
    isIndeterminate.value = false;
  } else {
    isIndeterminate.value = true;
  }
}

function clickNop(ev) {
  let id = ev.target.dataset.id;
  eventConPaneldata.nopOption[id] = !eventConPaneldata.nopOption[id];
  localStorage.setItem('event-' + id, eventConPaneldata.nopOption[id].toString());
  setCheckAllState();

  reloadOddData(store);
}

function clickNad(ev) {
  let id = ev.target.dataset.id;
  eventConPaneldata.nadOption[id] = !eventConPaneldata.nadOption[id];
  localStorage.setItem('event-' + id, eventConPaneldata.nadOption[id].toString());
  setCheckAllState();

  reloadOddData(store);
}

function closePanel() {
  eventConPaneldata.visible = false;
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
