<template>
  <Panel
    center
    title-center
    :width="600"
    :height="600"
    scale-able
    :visible="geojsonPanelData.visible"
    v-loading="geojsonPanelData.loading"
  >
    <template #header>
      <div>列表</div>
      <div style="flex: 1"></div>
      <div class="title-close" @click="closePanel">
        <i class="iconfont icon-guanbi1"></i>
      </div>
    </template>
    <template #default>
      <el-scrollbar>
        <el-tree
          :data="geojsonPanelData.tree"
          :props="defaultProps"
          show-checkbox
          @check-change="handleCheckChange"
          @node-click="handleNodeClick"
        >
          <template v-slot="{node, data}">
            <div>{{ data.label }}</div>
          </template>
        </el-tree>
      </el-scrollbar>
    </template>
  </Panel>
</template>

<script lang="ts" setup>
import {Tree, geojsonPanelData, clearMatchPrimitive} from './geojson-list-panel.ts';
import axios from 'axios';
import {NioMessage} from '../../utils/utils.js';
import {createViewer} from '../../cesium/create-viewer.js';
import {Cartographic} from 'cesium';
import {loadGeojsonDlgData} from './load-geojson-panel.ts';
import {setRollbackTilesetVisible, removeAllRollbackTilesets} from './rollback-tilesets.ts';
import {loadingListHandler, pagedListData, clearRollbackAllPrimitive} from './paged-list-panel.ts';

const defaultProps = {
  children: 'children',
  label: 'label',
};

function closePanel() {
  geojsonPanelData.visible = false;
  clearMatchPrimitive();
  removeAllRollbackTilesets();
}

const locate = (item) => {
  if (item.data?.pos?.length >= 2) {
    let viewer = createViewer();
    //@ts-ignore
    let cartographic = Cartographic.fromDegrees(item.data.pos[0], item.data.pos[1]);
    cartographic.height = viewer.camera.positionCartographic.height;
    viewer.camera.setView({
      destination: Cartographic.toCartesian(cartographic),
    });
  } else {
    NioMessage('info', '请先点击加载数据');
  }
};

const handleNodeClick = async (data: Tree) => {
  if (data.tiled == false) {
    pagedListData.loading = true;
    clearRollbackAllPrimitive(true);
    pagedListData.key = data.label;
    pagedListData.pageNo = 1;
    await loadingListHandler();
    pagedListData.loading = false;
  }
};

const handleCheckChange = async (data: Tree, checked: boolean, indeterminate: boolean) => {
  let name = data.label;
  setRollbackTilesetVisible(name, checked);
};

function clickOK() {
  geojsonPanelData.onOk();
}

function clickCancel() {
  geojsonPanelData.onCancel();
}
</script>

<style scoped>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>
