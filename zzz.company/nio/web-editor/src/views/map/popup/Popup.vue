<template>
  <div
    v-if="store.state.popup.visible"
    id="popup"
    @mousedown.left="eventHandler($event, store.state.popup.meta)"
    :style="{left: store.state.popup.pos[0] + 'px', top: store.state.popup.pos[1] + 'px'}"
  >
    <!-- 修改坐标 -->
    <div v-if="popup.type === 'COPY_POS'" class="pickup" @mousedown.left="pickup">
      <div class="pickup-item">拾取坐标</div>
      <div class="pickup-detail">
        <div>屏幕坐标</div>
        <div>二维坐标</div>
        <div>WGS84经纬度坐标</div>
      </div>
    </div>
    <!-- 设置图层 -->
    <div v-else-if="popup.type === 'SET_LAYER'" class="set-layer">
      <div v-if="popup.meta.locatable" class="set-layer-item" data-type="layerLocation">定位图层</div>
      <div class="set-layer-item" data-type="layerModify">修改样式</div>
      <div v-if="popup.meta.deletable" class="set-layer-item" data-type="layerRemove">删除图层</div>
    </div>
    <!-- 创建事件 -->
    <div v-else-if="popup.type === 'INIT_EVENT'" class="odd-lane">
      <div class="odd-line-item" data-type="initOdd">生成事件</div>
      <div class="divider"></div>
      <div class="odd-line-item" data-type="cancelInitOdd">取消</div>
    </div>
    <!-- 删除事件 -->
    <div v-else-if="popup.type === 'DELETE'" class="odd-lane">
      <div class="odd-line-item" data-type="deleteOdd">{{ popup.meta.mode === 'ONE' ? '删除' : '批量删除' }}</div>
      <div class="divider"></div>
      <div class="odd-line-item" data-type="cancelDeleteOdd">取消</div>
    </div>
    <!-- 质检标操作 -->
    <div v-else-if="popup.type === 'QUALITY'" class="odd-lane">
      <div class="odd-line-item" data-type="qualityMove">移动</div>
      <div class="divider"></div>
      <div class="odd-line-item" data-type="qualityDelete">删除</div>
    </div>
  </div>
</template>

<script setup>
import {useStore} from 'vuex';
import {Cartesian2, Cartesian3, Cartographic, sampleTerrainMostDetailed, Math as CMath} from 'cesium';
import {createViewer, terrainProvider} from '../../../cesium/initMap.js';
import {copyTextToClipboard} from '../../../utils/copy.js';
import {NioMessage} from '../../../utils/utils.js';
import {PopupData} from '../../../event/popup.js';
import {oddLayer} from '../../../system/odd/oddLayer.js';
import {createEvent, PanelOpenType, setPanelMode} from '../../../system/odd/eventPanel/oddPanelData.js';
import {hoverOddLayer} from '../../../system/odd/hoverOddLayer.js';
import {deleteQualityTagHandler, changeAllowPutTag} from '../../../system/task/quality/quality.js';
import {
  checkTaskVersionMatch,
  taskData,
  TaskStage,
  getRunningTaskSource,
} from '../../../system/task/taskList/taskList.js';
import {layerController} from '../../../system/layer/layerController.js';
import {oddPanelData} from '../../../system/odd/eventPanel/oddPanelData.js';

const store = useStore();
const viewer = createViewer();
const popup = store.state.popup;

//cesium右键获取坐标
const pickup = async function (ev) {
  const ellipsoid = viewer.scene.globe.ellipsoid;
  let cartesian = new Cartesian3();
  let cartographic = new Cartographic();
  viewer.camera.pickEllipsoid(Cartesian2.fromArray(store.state.popup.pos), ellipsoid, cartesian);
  ellipsoid.cartesianToCartographic(cartesian, cartographic);
  let str = `${CMath.toDegrees(cartographic.longitude)},${CMath.toDegrees(cartographic.latitude)}`;
  if (store.state.sceneMode === '3D') {
    let res = await sampleTerrainMostDetailed(terrainProvider, [cartographic]);
    str += `,${res[0].height}`;
  }
  store.commit('setPopup', new PopupData(false));
  await copyTextToClipboard(str, '坐标复制成功');
};

function canDelete() {
  if (taskData.runningTask == null) {
    return false;
  }

  let running_task_source = getRunningTaskSource();
  if (running_task_source === 5) {
    return false;
  }

  //任务source 是 1，且任务类型不是ao_speedlimit_making，允许删除任意类型
  if (running_task_source === 1 && taskData.runningTask.typeCode !== 'ao_speed_limit_making') {
    return true;
  }

  let lanes = [...oddLayer.hoverEvent.values()];
  if (lanes.length === 1) {
    if (lanes[0].oddDataList[oddPanelData.curEventIdx].source !== running_task_source) {
      NioMessage('warning', '只可删除本任务来源的数据');
      return false;
    }
  } else if (lanes.length > 1) {
    for (let i = 0; i < lanes.length; i++) {
      let oddDataList = lanes[i].oddDataList;
      for (let j = 0; j < oddDataList.length; j++) {
        if (oddDataList[j].source !== running_task_source) {
          NioMessage('warning', '只可删除本任务来源的数据');
          return false;
        }
      }
    }
  }

  return true;
}

const eventStrategy = {
  //图层定位
  layerLocation() {
    layerController.location(popup.meta.id);
  },
  //图层修改
  layerModify() {
    NioMessage('warning', '开发中', 2000);
  },
  //删除图层
  layerRemove() {
    layerController.removeLayer(popup.meta.id);
  },
  //生成ODD
  initOdd() {
    if (!checkTaskVersionMatch()) {
      NioMessage('warning', '当前选择的版本与任务版本不符，请切换后重试');
    } else if (taskData.taskStage !== TaskStage.WORKING) {
      NioMessage('warning', '非作业状态');
    } else {
      createEvent();
    }
  },
  //取消生成Odd
  cancelInitOdd() {
    hoverOddLayer.clearHoverLanes();
  },
  //删除Odd
  deleteOdd() {
    if (taskData.taskStage !== TaskStage.WORKING) {
      NioMessage('warning', '非作业状态');
    } else if (!checkTaskVersionMatch()) {
      NioMessage('warning', '当前选择的版本与任务版本不符，请切换后重试');
    } else {
      if (canDelete()) {
        oddLayer.deleteEvent();
      }
    }
  },
  //取消删除Odd
  cancelDeleteOdd() {
    oddLayer.clearHoverEvent();
    setPanelMode(PanelOpenType.CLOSE);
  },
  //移动质检标
  qualityMove(meta) {
    if (!checkTaskVersionMatch()) {
      NioMessage('warning', '当前选择的版本与任务版本不符，请切换后重试');
    } else {
      changeAllowPutTag(true, meta.qualityTag);
    }
  },
  //删除质检标
  qualityDelete(meta) {
    if (!checkTaskVersionMatch()) {
      NioMessage('warning', '当前选择的版本与任务版本不符，请切换后重试');
    } else {
      deleteQualityTagHandler(meta.qualityTag);
    }
  },
};
function eventHandler(ev, meta) {
  let type = ev.target?.dataset?.type;
  if (type && type in eventStrategy) {
    eventStrategy[type](meta);
  }
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
