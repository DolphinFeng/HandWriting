<template>
  <transition name="el-zoom-in-top">
    <Panel
      center
      v-model:visible="mapVersionPanelVisible"
      :width="320"
      :max-width="400"
      :height="470"
      :max-height="600"
      scale-able
    >
      <template #header>
        <div>版本数据</div>
        <div style="flex: 1"></div>
        <div class="title-close" @click="setMapVersionPanelVisibleHandler">
          <i class="iconfont icon-guanbi1"></i>
        </div>
      </template>
      <template #default>
        <div class="tool-item">
          <el-scrollbar class="data-box" max-height="1000px">
            <div style="margin-top: 5px"></div>
            <div class="span-color">
              <span style="font-size: 13px">众包2.0</span>
              <span style="flex: 1"></span>
            </div>
            <div style="margin-top: 5px"></div>
            <el-radio-group v-model="store.state.version.curVersion">
              <el-radio
                v-for="item in store.state.version.versionsGeom2_0"
                :label="item"
                size="small"
                style="width: 75px"
              ></el-radio>
            </el-radio-group>
            <div style="margin-top: 5px"></div>
            <div class="span-color">
              <span style="font-size: 13px">众包1.95</span>
              <span style="flex: 1"></span>
            </div>
            <div style="margin-top: 5px"></div>
            <el-radio-group v-model="store.state.version.curVersion">
              <el-radio
                v-for="item in store.state.version.versionsGeom1_95"
                :label="item"
                size="small"
                style="width: 75px"
              ></el-radio>
            </el-radio-group>
            <div style="margin-top: 5px"></div>
            <div class="span-color">
              <span style="font-size: 13px">腾讯3.1</span>
              <span style="flex: 1"></span>
            </div>
            <div style="margin-top: 5px"></div>
            <el-radio-group v-model="store.state.version.curVersion">
              <el-radio
                v-for="item in store.state.version.versionsHd3_1"
                :label="item"
                size="small"
                style="width: 75px"
              ></el-radio>
            </el-radio-group>
            <div style="margin-top: 5px"></div>
            <div class="span-color">
              <span style="font-size: 13px">服务区</span>
              <span style="flex: 1"></span>
            </div>
            <div style="margin-top: 5px"></div>
            <el-radio-group v-model="store.state.version.curVersion">
              <el-radio
                v-for="item in store.state.version.versionsService"
                :label="item"
                size="small"
                style="width: 75px"
              ></el-radio>
            </el-radio-group>
          </el-scrollbar>
        </div>
      </template>
    </Panel>
  </transition>
</template>

<script setup>
import {mapVersionPanelVisible, setMapVersionPanelVisible} from '../../../../system/layer/panel/layerPanel.js';
import {useStore} from 'vuex';
const store = useStore();

function setMapVersionPanelVisibleHandler() {
  setMapVersionPanelVisible(false);
}
</script>

<style scoped>
:deep(.el-radio:nth-of-type(3n)) {
  margin-right: 0;
}
:deep(.el-radio) {
  color: #fff;
  font-weight: normal;
}

.span-color {
  color: rgb(197, 197, 197);
}
</style>
