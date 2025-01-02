<template>
  <div>
    <el-button link type="primary" @click="visible = !visible">条件</el-button>
  </div>
  <Panel
    center
    v-model:visible="visible"
    :width="340"
    :min-width="300"
    :max-width="400"
    :height="300"
    :min-height="300"
    :max-height="600"
    scale-able
  >
    <template #header>
      <div>放行道路条件</div>
      <div style="flex: 1"></div>
      <div class="title-close" @click="visible = false">
        <i class="iconfont icon-guanbi1"></i>
      </div>
    </template>
    <div style="padding: 0 16px">
      <div>
        <p style="color: #999">截止时间</p>
        <div>
          <el-date-picker
            type="date"
            v-model="allowTypeLayerItems.timers.value"
            @change="handleTimer"
            format="YYYY-MM-DD"
            :clearable="false"
            value-format="YYYYMMDD"
            popper-class="picker-date"
            :disabled-date="(time) => time.getTime() > moment().subtract(1, 'day').startOf()"
            placeholder="请选择截止时间"
            size="default"
          />
        </div>
      </div>
      <div>
        <p style="color: #999">allow_type</p>
        <div class="layer-box" @click="handleLaneClick($event)">
          <div
            v-for="item in allowTypeLayerItems.items"
            :key="item.item_id"
            class="layer-item"
            :class="{'active-layer': item.show}"
            :data-id="item.item_id"
          >
            {{ item.name }}
          </div>
        </div>
      </div>
    </div>
  </Panel>
</template>
<script setup>
import {ref} from 'vue';
import moment from 'moment';
import Panel from '../../components/panel/Panel.vue';
import {
  allowTypeLayerItems,
  setTimer,
  customAllowTypeLayerItems,
} from '../../system/layer/laneGroupLayer/laneGroupLayer.js';
const visible = ref(false);
const emit = defineEmits(['setAllowLayer']);

const handleTimer = (curTime) => {
  setTimer(curTime);
  emit('setAllowLayer', curTime);
};
const handleLaneClick = async (ev) => {
  ev.stopPropagation();
  const id = ev.target.dataset.id;
  if (id) {
    let item = allowTypeLayerItems.getItemById(id);
    if (item === undefined) {
      item = customAllowTypeLayerItems.getItemById(id);
      item.show = !item.show;
    } else {
      item.show = !item.show;
    }
    const curTime = localStorage.getItem('timer');
    emit('setAllowLayer', curTime);
  }
};
</script>

<style>
.filter-popper {
  min-width: 400px !important;
  background-color: #333745 !important;
}
</style>
<style scoped lang="scss">
header {
  display: flex;
  justify-content: space-between;
  color: #ffffff;
  font-size: 16px;
  margin-bottom: 24px;
}
.close-icon {
  cursor: pointer;
}
.layer-box {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  align-content: center;
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
</style>
