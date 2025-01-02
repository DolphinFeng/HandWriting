<template>
  <div
    v-if="popupInfo.visible"
    id="popup"
    :style="{
      left: popupInfo.pos[0] + 'px',
      top: popupInfo.pos[1] + 'px',
    }"
  >
    <!-- 修改坐标 -->
    <div v-if="popupInfo.type === 'COPY_POS'" class="pickup" @mousedown.left="pickup">
      <div class="pickup-item">拾取坐标</div>
      <div class="pickup-detail">
        <div>屏幕坐标</div>
        <div>二维坐标</div>
        <div>WGS84经纬度坐标</div>
      </div>
    </div>
    <div v-if="popupInfo.type === 'DELETE_CROSS_TAG'" class="pickup" @mousedown.left="deleteCrossTag">
      <div class="pickup-item">删除</div>
    </div>
  </div>
</template>

<script setup>
import {useStore} from 'vuex';
import {createViewer} from '../cesium/create-viewer.js';
import {popupInfo} from '../store/popup.ts';
import {Cartesian2, Cartesian3, Cartographic, sampleTerrainMostDetailed, Math as CMath} from 'cesium';
import {copyTextToClipboard} from '../utils/copy.js';
import {billboardManager} from '../system/billboard-manager.ts';
import {crossCheckPanelData} from '../data-source/cross/cross-check-panel.ts';

const viewer = createViewer();
const store = useStore();

//cesium右键获取坐标
const pickup = async function (event) {
  const ellipsoid = viewer.scene.globe.ellipsoid;
  let cartesian = new Cartesian3();
  let cartographic = new Cartographic();
  viewer.camera.pickEllipsoid(Cartesian2.fromArray([event.x, event.y]), ellipsoid, cartesian);
  ellipsoid.cartesianToCartographic(cartesian, cartographic);
  let str = `${CMath.toDegrees(cartographic.longitude)},${CMath.toDegrees(cartographic.latitude)}`;
  if (store.state.sceneMode === '3D') {
    let res = await sampleTerrainMostDetailed(terrainProvider, [cartographic]);
    str += `,${res[0].height}`;
  }
  await copyTextToClipboard(str, '坐标复制成功');
  popupInfo.visible = false;
};

function deleteCrossTag() {
  billboardManager.removeBillboard(popupInfo.userData);
  popupInfo.visible = false;
  crossCheckPanelData.visible = false;
}
</script>

<style scoped>
#popup {
  position: fixed;
  left: 0;
  top: 0;
  border: 1px solid #535456;
  border-radius: 4px;
  background-color: #3f4045;
  overflow: hidden;
  box-shadow: var(--el-box-shadow-dark);
  color: white;
  text-align: center;
  z-index: 1000000;
  transform: translateY(-20px);
  user-select: none;
  font-size: 12px;
}
.pickup {
  position: relative;
  width: 90px;
}
.pickup-item {
  border-radius: 2px;
  line-height: 18px;
  transition: background-color 0.2s ease;
  cursor: pointer;
}
.pickup-item:hover {
  background-color: #409eff;
}
.pickup-detail {
  display: none;
  position: absolute;
  top: 0;
  left: 90px;
}
.pickup-detail div {
  width: 120px;
  padding: 2px;
}
.set-layer {
  width: 100px;
}
.set-layer-item {
  height: 20px;
  line-height: 20px;
  transition: background-color 0.2s ease;
  cursor: pointer;
}
.set-layer-item:hover {
  background-color: #409eff;
}
.odd-lane {
  width: 90px;
  padding: 4px;
}
.odd-line-item {
  border-radius: 2px;
  line-height: 18px;
  transition: background-color 0.2s ease;
  cursor: pointer;
}
.odd-line-item:hover {
  background-color: #409eff;
}
.divider {
  height: 1px;
  margin: 3px 2px;
  background-color: #555658;
}
</style>
