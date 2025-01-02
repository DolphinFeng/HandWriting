<template>
  <div>
    <BaseMapOptionPanel></BaseMapOptionPanel>
  </div>
  <transition name="el-zoom-in-top">
    <Panel
      center
      v-model:visible="layerPanelVisible"
      :width="340"
      :max-width="400"
      :height="480"
      :max-height="600"
      scale-able
    >
      <template #header>
        <div>图层管理</div>
        <div style="flex: 1"></div>
        <div class="title-close" @click="setLayerPanelVisibleHandler">
          <i class="iconfont icon-guanbi1"></i>
        </div>
      </template>
      <template #default>
        <el-scrollbar height="100%">
          <div>
            <p class="layer-describe">采集标注</p>
            <div class="layer-box" @click="crossLayerHandler($event)">
              <div
                v-for="(item, idx) in crossLayerItems"
                :key="item.name"
                class="layer-item"
                :class="{'active-layer': item.visible}"
                :data-name="item.name"
                :data-index="idx"
              >
                {{ item.name }}
              </div>
            </div>
            <p class="layer-describe layer-flex">推理数据</p>
            <div v-loading="inferLayerLoading != 0" class="layer-box" @click="inferLayerHandler($event)">
              <div
                v-for="(item, idx) in inferLayerItems"
                :key="item.name"
                class="layer-item"
                :class="{'active-layer': item.visible}"
                :data-name="item.name"
                :data-index="idx"
              >
                {{ item.name }}
              </div>
            </div>
            <p class="layer-describe layer-flex">融合数据</p>
            <div v-loading="fusionLayerLoading != 0" class="layer-box" @click="fusionLayerHandler($event)">
              <div
                v-for="(item, idx) in fusionLayerItems"
                :key="item.name"
                class="layer-item"
                :class="{'active-layer': item.visible}"
                :data-name="item.name"
                :data-index="idx"
              >
                {{ item.name }}
              </div>
            </div>
            <p class="layer-describe layer-flex">
              编译数据
              <el-link type="primary" class="layer-describe-buttons" @click="handleBaseMapCondition">条件</el-link>
            </p>
            <div class="layer-box" @click="baseLayerHandler($event)">
              <div
                v-for="(item, idx) in ndsBaseLayerItems"
                :key="item.name"
                class="layer-item"
                :class="{'active-layer': item.visible}"
                :data-name="item.name"
                :data-index="idx"
              >
                {{ item.name }}
              </div>
            </div>
          </div>
        </el-scrollbar>
      </template>
    </Panel>
  </transition>
</template>

<script setup>
import Panel from '../components/panel.vue';
import BaseMapOptionPanel from './basemap-condition-panel.vue';
import {layerPanelVisible, setLayerPanelVisible} from '../store/version.js';
import {
  ndsBaseLayerItems,
  inferLayerItems,
  fusionLayerItems,
  setNdsTileSetVisible,
  setHdSpecTileSetExpr,
  getOrCreateNdsTileSet,
  getInferLayerOption,
  getFusionLayerOption,
  hdSpecDesc,
} from '../system/tileset-manager.js';
import {crossLayerItems, crossTileLayer, loadCrossTileHandler, crossDesc} from '../data-source/cross/cross-material.ts';
import {showCrossRouteLines} from '../data-source/cross/cross-route-line.ts';
import {baseMapConPaneldata, setHdOptionExp} from './basemap-condition-panel.ts';
import {showCrossHighlightEntities} from '../data-source/cross/cross-highlight-entity.js';
import {
  crossInferResumePanel,
  loadProductData,
  inferLayerLoading,
} from '../data-source/cross/cross-infer-resume-panel.ts';
import {
  crossFusionResumePanel,
  loadFusionProductData,
  fusionLayerLoading,
} from '../data-source/cross/cross-fusion-resume-panel.ts';
import {renderPrimitiveManager} from '../model/render-primitive.ts';
import {nextTick} from 'vue';
import {dataManager} from '../model/feature.ts';

function handleBaseMapCondition(ev) {
  baseMapConPaneldata.visible = !baseMapConPaneldata.visible;
}

function setLayerPanelVisibleHandler() {
  setLayerPanelVisible(false);
}

async function inferLayerHandler(ev) {
  if (inferLayerLoading.value != 0) {
    return;
  }

  const name = ev.target.dataset.name;
  const index = ev.target.dataset.index;

  inferLayerItems[index].visible = !inferLayerItems[index].visible;
  localStorage.setItem(name + 'infer', inferLayerItems[index].visible.toString());

  //重新加载产品库数据。先清空
  for (let record of crossInferResumePanel.list) {
    for (let id of record.productIds) {
      renderPrimitiveManager.removePrimitive(id);
    }
  }

  //如果都关闭了，则关闭产品库按钮
  let inferLayers = getInferLayerOption();
  if (inferLayers.length == 0) {
    for (let record of crossInferResumePanel.list) {
      record.showProduct = false;
    }

    return;
  }

  for (let record of crossInferResumePanel.list) {
    if (record.showProduct) {
      loadProductData(record);
    }
  }
}

async function fusionLayerHandler(ev) {
  if (inferLayerLoading.value != 0) {
    return;
  }

  const name = ev.target.dataset.name;
  const index = ev.target.dataset.index;

  fusionLayerItems[index].visible = !fusionLayerItems[index].visible;
  localStorage.setItem(name + 'fusion', fusionLayerItems[index].visible.toString());

  //重新加载产品库数据。先清空
  for (let record of crossFusionResumePanel.list) {
    for (let id of record.productIds) {
      renderPrimitiveManager.removePrimitive(id);
    }

    for (let id of record.meshProductIds) {
      renderPrimitiveManager.removePrimitive(id);
    }
  }

  //如果都关闭了，则关闭产品库按钮
  let fusionLayers = getFusionLayerOption();
  if (fusionLayers.length == 0) {
    for (let record of crossFusionResumePanel.list) {
      record.showProductData = false;
      record.showMeshData = false;
    }

    return;
  }

  for (let record of crossFusionResumePanel.list) {
    if (record.showProductData) {
      loadFusionProductData(record, false);
    }
  }

  for (let record of crossFusionResumePanel.list) {
    if (record.showMeshData) {
      loadFusionProductData(record, true);
    }
  }
}

async function baseLayerHandler(ev) {
  const name = ev.target.dataset.name;
  const index = ev.target.dataset.index;

  ndsBaseLayerItems[index].visible = !ndsBaseLayerItems[index].visible;
  localStorage.setItem(name, ndsBaseLayerItems[index].visible.toString());
  await getOrCreateNdsTileSet(name);

  if (Object.keys(hdSpecDesc).includes(name)) {
    await setHdSpecTileSetExpr(name);
  } else {
    if (ndsBaseLayerItems[index].visible) {
      await setHdOptionExp(name);
    }
    setNdsTileSetVisible(name, ndsBaseLayerItems[index].visible);
  }
}

function crossLayerHandler(ev) {
  const name = ev.target.dataset.name;
  const index = ev.target.dataset.index;
  crossLayerItems[index].visible = !crossLayerItems[index].visible;
  localStorage.setItem(name, crossLayerItems[index].visible.toString());

  if (name == crossDesc.crossPoint) {
    crossTileLayer.polygonCollectionCross.show = crossLayerItems[index].visible;
    showCrossHighlightEntities(crossLayerItems[index].visible, crossDesc.crossPoint);
    loadCrossTileHandler(false);
  } else if (name == crossDesc.roundAbout) {
    crossTileLayer.polygonCollectionRoundAbout.show = crossLayerItems[index].visible;
    showCrossHighlightEntities(crossLayerItems[index].visible);
    loadCrossTileHandler(false);
  } else if (name == crossDesc.rampPoint) {
    crossTileLayer.polygonCollectionRamp.show = crossLayerItems[index].visible;
    showCrossHighlightEntities(crossLayerItems[index].visible, crossDesc.rampPoint);
    loadCrossTileHandler(false);
  } else if (name == crossDesc.mainRoad) {
    crossTileLayer.polygonCollectionMainRoad.show = crossLayerItems[index].visible;
    showCrossHighlightEntities(crossLayerItems[index].visible, crossDesc.mainRoad);
    loadCrossTileHandler(false);
  } else if (name == crossDesc.crossRoute) {
    showCrossRouteLines(crossLayerItems[index].visible);
  }
}

nextTick(() => {
  loadCrossTileHandler(false);
});
</script>

<style scoped>
:deep(.el-checkbox) {
  color: #fff;
}
:deep(.el-checkbox__input),
:deep(.el-checkbox__label) {
  pointer-events: none;
}
.layer-tool-item {
  cursor: pointer;
  font-size: 14px;
  padding-left: 5.5%;
  padding-top: 1%;
}
.layer-tool-item i {
  pointer-events: none;
  color: rgb(197, 197, 197);
}
.layer-box {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  align-content: center;
  padding-left: 3%;
}
.layer-box2 {
  display: inline-block;
  width: auto;
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
  margin-bottom: 0;
  color: rgb(197, 197, 197);
  text-align: left;
}
.layer-flex {
  display: flex;
  justify-content: space-between;
  padding-right: 17px;
}
</style>
<style>
.el-input__wrapper,
.el-input__wrapper:hover {
  background-color: #252526 !important;
  box-shadow: 0 0 0 1px #252526 inset;
}
.picker-date,
.el-popper__arrow::before {
  background-color: #ffffff !important;
  border: 0 !important;
}
.el-date-picker {
  background-color: #333546 !important;
}
.disabled .el-date-table-cell,
.disabled .cell {
  background-color: #606266 !important;
}

.is-focus {
  box-shadow: 0 0 0 1px #333546 inset !important;
}
.el-picker-panel__body,
.el-date-picker__header > span,
.el-date-picker__header button {
  color: #ffffff !important;
}
.picker-date tbody tr th,
.picker-date tbody tr td,
.picker-date tbody tr .cell {
  color: #ffffff !important;
}
</style>
../data-source/cross/cross-route-line.js
