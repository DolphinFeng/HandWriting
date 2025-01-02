<template>
  <tool-item title="底图" icon="icon-ditukanban" :width="320">
    <template #default>
      <div class="tool-item">
        <div class="tool-item-header" style="background-color: transparent">
          <span>参考底图</span>
          <span style="flex: 1"></span>
          <el-switch v-model="store.state.mapShow" inline-prompt @change="changeMapVisible" style=""> </el-switch>
          <span style="justify-content: space-between"></span>
          <!-- <span>图幅框</span>
          <span style="flex: 1"></span>
          <el-switch v-model="tileGridLayerVisible" inline-prompt @change="changeTileGridVisible"></el-switch> -->
        </div>
        <el-scrollbar class="data-box" max-height="100px">
          <el-radio-group v-model="store.state.map" class="radio-group" @change="changeMap">
            <el-radio v-for="item in mapList.list" :label="item.title" size="small" style="width: 75px"> </el-radio>
          </el-radio-group>
        </el-scrollbar>
      </div>
    </template>
  </tool-item>
</template>

<script setup>
import ToolItem from './tool-item.vue';
import {useStore} from 'vuex';
import {reactive} from 'vue';
import {imageryProvider} from '../cesium/imagery/imagery-provider.js';
import {tileGridLayerVisible, changeTileGridShow} from '../cesium/imagery/tile-grid-provider.js';

const store = useStore();
const mapList = reactive({
  list: Object.keys(imageryProvider).map((item) => {
    return {title: item};
  }),
});

const changeMapVisible = function (val) {
  store.commit('switchMapShow', val);
};
const changeMap = function (label) {
  store.commit('switchMap', label);
};
const changeTileGridVisible = function (val) {
  changeTileGridShow(val);
};
</script>

<style scoped>
:deep(.el-radio:nth-of-type(3n)) {
  margin-right: 0;
}
:deep(.el-radio) {
  color: #fff;
}
</style>
