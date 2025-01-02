<template>
  <transition name="el-zoom-in-bottom">
    <div v-show="infoBox.show" id="tooltip-view" class="cesium-popup" :style="{zIndex: zIndex}" @mousedown="raiseTop">
      <a class="cesium-popup-close-button cesium-popup-color" @click="closeInfoBoxHandle">×</a>
      <div class="cesium-popup-background" style="padding: 1px 0">
        <div id="tooltip-content" class="cesium-popup-content cesium-popup-color" @mousedown.left="copyText($event)">
          <div class="popup-title">{{ infoBox.title }}</div>
          <div v-for="(val, key) in infoBox.data" class="popup-row">
            <div class="popup-label">{{ key }}</div>
            <div class="popup-content">{{ val }}</div>
          </div>
        </div>
      </div>
      <div class="cesium-popup-tip-container">
        <div class="cesium-popup-tip cesium-popup-background"></div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import {useStore} from 'vuex';
import {copyTextToClipboard} from '../utils/copy.js';
import {ref} from 'vue';
import {infoBox, closeInfoBox} from '../store/info-box.js';

const store = useStore();
//const infoBox = store.state.infoBox;
const zIndex = ref(30);

const raiseTop = function () {
  zIndex.value = ++store.state.maxZIndex;
};

const closeInfoBoxHandle = function () {
  closeInfoBox();
};

const copyText = (ev) => {
  let target = ev.target;
  if (target && target.classList.contains('popup-content')) {
    copyTextToClipboard(target.innerText);
  }
};
</script>

<style scoped>
.popup-title {
  margin: 8px 0 10px;
  text-align: center;
}
.popup-row {
  display: flex;
  margin: 4px 4px;
  word-break: break-all; /* 添加文字换行 */
  white-space: pre-wrap; /* 保留空格和换行符 */
}
.popup-label {
  width: var(--label-width);
  font-size: 12px;
  width: 50%;
}
.popup-content {
  font-size: 12px;
  /* flex: 1; */
  width: 50%;
}
.popup-content:hover {
  color: #409eff;
  cursor: pointer;
}
.cesium-popup {
  --label-width: 200px;
  position: fixed;
  left: 0;
  top: 5px;
  text-align: left;
  user-select: none;
}

.cesium-popup-background {
  background: rgba(0, 0, 0, 0.6);
  border-radius: 6px;
  width: 400px;
}

.cesium-popup-color {
  color: white;
}

.cesium-popup-content {
  margin: 15px 10px 10px;
  line-height: 1.4;
  font-size: 13px;
  max-width: 439px;
  min-width: 50px;
  max-height: 700px; /* 添加最大高度 */
  overflow-y: auto; /* 添加垂直滚动 */
}

.cesium-popup-tip-container {
  margin: 0 auto;
  width: 40px;
  height: 13px;
  position: relative;
  overflow: hidden;
}

.cesium-popup-tip {
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.4);
  width: 17px;
  height: 17px;
  padding: 1px;
  margin: -10px auto 0;
  transform: rotate(45deg);
}

.cesium-popup-close-button {
  position: absolute;
  top: 0;
  right: 0;
  padding: 4px 4px 0 0;
  text-align: center;
  width: 18px;
  height: 14px;
  font: 16px/14px Tahoma, Verdana, sans-serif;
  text-decoration: none;
  font-weight: 700;
  background: transparent;
}

.cesium-popup-close-button:hover {
  cursor: pointer;
  color: #409eff;
}
</style>
