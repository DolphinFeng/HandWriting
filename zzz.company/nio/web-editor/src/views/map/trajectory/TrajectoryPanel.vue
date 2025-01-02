<template>
  <transition name="el-zoom-in-top">
    <Panel v-model:visible="panelVisible"
           :right="60" :top="60" :center="false"
           :min-width="415" :max-width="415"
           :min-height="550" :max-height="750"
           scale-able
           :header-style="{fontSize: '13px'}"
    >
      <template #header>
        <div>
          坐标：<span class="title-position" @click="copyPos">{{transformPos(trajPointData.position)}}</span>
        </div>
        <div style="margin-left: 14px;font-size: 13px;">
          时间：<span>{{transformTime(trajPointData.time)}}</span>
        </div>
        <div style="flex: 1"></div>
        <div class="title-close" @click="closePanel">
          <i class="iconfont icon-guanbi1"></i>
        </div>
      </template>
      <template #default>
        <!-- 图片 -->
        <div class="main-wrapper" v-loading="dataPanel.loading" element-loading-text="" element-loading-background="rgba(122, 122, 122, .8)">
          <div class="main-img">
            <div v-if="!imgNull" style="height: 100%;">
              <img :src="trajPointData.imgPath" alt="" @error="imgErrorHandler" @click="showViewer = true">
              <el-image-viewer
                  v-if="showViewer"
                  :url-list="[trajPointData.imgPath]"
                  @close="showViewer = false"
                  hide-on-click-modal
                  teleported
              ></el-image-viewer>
              <div class="main-img-time"></div>
            </div>
            <div v-else class="main-img-null">
              <el-empty :image-size="80" description="图片加载中..."></el-empty>
            </div>
          </div>
          <div class="main-id">
            id：{{dataPanel.cur}}
          </div>
          <div class="main-progress-box">
            <div @mousedown="addIdxHandler(-1)">
              <i class="iconfont icon-shangyishoushangyige main-play"></i>
            </div>
            <div class="progress-count">{{trajPointData.total === 0 ? 0 : trajPointData.curIdx + 1}}个</div>
            <div style="flex: 1">
              <el-slider
                  id="trajPointSlider"
                  v-model="trajPointData.curIdx"
                  :max="trajPointData.total > 0 ? trajPointData.total - 1 : 0"
                  :step="1"
                  height="4px"
                  @change="sliderHandler"
              ></el-slider>
            </div>
            <div class="progress-count">{{trajPointData.total}}个</div>
            <div style="transform: rotateZ(180deg);" @mousedown="addIdxHandler(1)">
              <i class="iconfont icon-shangyishoushangyige main-play"></i>
            </div>
          </div>
        </div>
        <div class="main-dash"></div>
        <!-- 选项 -->
        <div class="select-group">
          <!-- 时间范围 -->
          <div class="select-duration">
            <el-radio-group
                v-model="timeDuration.curDuration"
                fill="#365dde"
                @change="dataChange"
            >
              <el-radio-button v-for="item in timeDuration.list" :label="item.value">{{item.label}}</el-radio-button>
            </el-radio-group>
          </div>
          <!-- 资料类型 -->
          <div class="select-data-type">
            <el-radio-group
                v-model="dataType.curType"
                fill="#365dde"
                @change="dataChange"
            >
              <el-radio-button v-for="item in dataType.list" :label="item.value">{{item.label}}</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div class="main-dash"></div>
        <!-- 资料选择 -->
        <div style="flex: 1;overflow: hidden">
          <el-scrollbar height="100%">
            <ul class="data-panel-list" @click="panelHandler">
              <li class="data-panel-item" v-for="item in dataPanel.list" :data-id="item.id" :class="{'data-panel-item-active':item.id === dataPanel.cur}">
                <div class="panel-type">{{item.type}}</div>
                <div class="panel-time">{{item.time}}</div>
              </li>
            </ul>
          </el-scrollbar>
        </div>
      </template>
    </Panel>
  </transition>
</template>

<script setup>
import {reactive, ref, watch} from "vue";
import {
  cacheImg,
  dataPanel,
  dataType, imgNull, panelVisible,
  timeDuration,
  trajectoryLayer,
  trajPointData,
} from "../../../system/trajectory/trajectoryLayer.js";
import {copyTextToClipboard} from "../../../utils/copy.js";
import {useStore} from "vuex";
import Panel from "../../../components/panel/Panel.vue";

const store = useStore();
const showViewer = ref(false);

//索引增加方法
const addIdxHandler = trajectoryLayer.addIdxHandler;

const panelHandler = function (ev) {
  //事件代理
  if (ev.target.tagName === 'LI' && dataPanel.cur !== ev.target.dataset.id) {
    dataPanel.cur = ev.target.dataset.id;
    trajectoryLayer.requestTrajectory(dataPanel.cur);
  }
};
const closePanel = function () {
  panelVisible.value = false;
};
const sliderHandler = function () {
  document.querySelector('#trajPointSlider').blur();
};
watch(() => trajPointData.curIdx, (newIdx) => {
  if (trajectoryLayer.trajPointList.length !== 0) {
    trajectoryLayer.setPointActive(newIdx);
    cacheImg(newIdx);
    trajPointData.imgPath = trajectoryLayer.imagesPath[trajectoryLayer.trajPointList[newIdx].name];
    trajPointData.position = trajectoryLayer.trajPointList[newIdx].position;
    trajPointData.time = trajectoryLayer.trajPointList[newIdx].time;
  }
});
watch(() => trajPointData.imgPath, (newImgPath) => {
  imgNull.value = !newImgPath;
});
const transformPos = function (position) {
  return position.length === 0 ? '' : position[0].toFixed(6) + ',' + position[1].toFixed(6);
};
const transformTime = function (time) {
  if (!time) {
    return '';
  }
  let date = new Date(time);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}` ;
};
const copyPos = function () {
  if (trajPointData.position.length > 0) {
    copyTextToClipboard(trajPointData.position.join(','), '已将坐标复制到粘贴板', 2000);
  }
};
const imgErrorHandler = function (e) {
  imgNull.value = true;
};
const dataChange = function () {
  trajectoryLayer.searchWithFrame();
};
</script>

<style scoped>
:deep(.el-radio-button__inner) {
  background-color: #101423;
  color: #fff;
  border: none;
  width: 80px;
  text-align: center;
  padding: 8px 0;
  font-size: 13px;
}
:deep(.el-radio-button) {
  margin: 0 1px 0 0;
}
:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-left: none;
}
:deep(.el-slider__bar) {
  background-color: #375ddf;
}
:deep(.el-slider__runway) {
  background-color: #375ddf;
}
:deep(.el-slider__button) {
  border: none;
  background-color: #375ddf;
}
#trajectoryPanel {
  position: absolute;
  width: 410px;
}

.title-font {
  font-size: 13px;
}
.title-position:hover {
  text-decoration: underline;
  /*font-size: 13px;*/
}
.main-img-time {
  position: absolute;
  bottom: 4px;
  right: 8px;
  font-size: 11px;
}
.main-id {
  margin: 8px 0 6px 26px;
}
.main-dash {
  border-top: 1px dashed #525560;
  margin: 10px 6px;
}
.select-group {
  margin: 0 8px;
}
.select-data-type {
  margin-top: 14px;
}
.data-panel-list {
  display: flex;
  flex-flow: row wrap;
  /*justify-content: space-between;*/
  align-items: center;
  align-content: center;
  padding: 0;
}
.data-panel-item {
  position: relative;
  width: 80px;
  padding: 2px 6px 3px;
  margin: 0 11px 12px;
  border-radius: 4px;
  background-color: #111424;
  font-size: 13px;
  color: #fff;
  /*overflow: hidden;*/
  transition: var(--el-transition-all);
  text-align: center;
  cursor: pointer;
  user-select: none;
}
.data-panel-item-active {
  background-color: #365dde;
}
.data-panel-item div {
  pointer-events: none;
}
.data-badge {
  position: absolute;
  right: 0;
  top: 0;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: #409eff;
  color: #fff;
  transform: translate(50%, -50%);
  font-size: 10px;
}

</style>
