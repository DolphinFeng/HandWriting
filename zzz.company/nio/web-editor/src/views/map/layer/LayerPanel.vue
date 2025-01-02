<template>
  <transition name="el-zoom-in-top">
    <Panel
      center
      v-model:visible="layerPanelVisible"
      :width="500"
      :max-width="600"
      :height="420"
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
        <el-scrollbar height="100%" @click.right.prevent="layerRightHandler($event)">
          <div @click="layerHandler($event)">
            <p class="layer-describe layer-flex">
              地图数据
              <el-link type="primary" class="layer-describe-buttons" @click="handleBaseMapCondition">条件</el-link>
            </p>
            <div class="layer-box">
              <div
                v-for="item in items1"
                :key="item.item_id"
                class="layer-item"
                :class="{'active-layer': item.show}"
                :data-id="item.item_id"
              >
                {{ item.name }}
              </div>
            </div>
            <p class="layer-describe layer-flex">
              事件-Lane
              <el-link type="primary" class="layer-describe-buttons" @click="handleEventCondition">条件</el-link>
            </p>
            <div class="layer-box">
              <div
                v-for="item in oddLayerSource"
                class="layer-item"
                :class="{'active-layer': item.show}"
                :data-source="item.name"
              >
                {{ item.name }}
              </div>
            </div>
            <p class="layer-describe layer-flex">事件-Road</p>
            <div class="layer-box" @click.stop="linkLayerHandler">
              <div
                v-for="item in linkOddLayerSource"
                class="layer-item"
                :class="{'active-layer': item.show}"
                :data-source="item.name"
              >
                {{ item.name }}
              </div>
            </div>
            <p class="layer-describe layer-flex">事件-SDLink</p>
            <div class="layer-box" @click.stop="sdLinkLayerHandler">
              <div
                v-for="item in sdLinkOddLayerSource"
                class="layer-item"
                :class="{'active-layer': item.show}"
                :data-source="item.name"
              >
                {{ item.name }}
              </div>
            </div>
            <p class="layer-describe layer-flex">
              动态图层-Lane
              <!-- <el-link type="primary" class="layer-describe-buttons" @click="handleDynamicLaneCondition">条件</el-link> -->
              <el-link type="primary" class="layer-describe-buttons" @click="handleDynamicRoadCondition">条件</el-link>
            </p>
            <div class="layer-box">
              <div
                v-for="item in items2"
                :key="item.item_id"
                class="layer-item"
                :class="{'active-layer': item.show}"
                :data-id="item.item_id"
              >
                {{ dynamicLayerSourceTypeAlias[item.name] }}
              </div>
            </div>
            <p class="layer-describe layer-flex">
              动态图层-Road
              <!-- <el-link type="primary" class="layer-describe-buttons" @click="handleDynamicRoadCondition">条件</el-link> -->
            </p>
            <div class="layer-box">
              <div
                v-for="item in items3"
                :key="item.item_id"
                class="layer-item"
                :class="{'active-layer': item.show}"
                :data-id="item.item_id"
                @click.stop="handleDynamicRoadClick(item)"
              >
                {{ dynamicLinkLayerSourceTypeAlias[item.name] }}
              </div>
            </div>
            <p class="layer-describe layer-flex">
              动态图层-SDLink
              <!-- <el-link type="primary" class="layer-describe-buttons" @click="handleDynamicEventCondition">条件</el-link> -->
            </p>
            <div class="layer-box">
              <div
                v-for="item in items5"
                :key="item.item_id"
                class="layer-item"
                :class="{'active-layer': item.show}"
                :data-id="item.item_id"
                @click.stop="handleDynamicSDLinkClick(item)"
              >
                {{ dynamicSDLinkLayerSourceTypeAlias[item.name] }}
              </div>
            </div>
            <!-- <p class="layer-describe layer-flex">
              预上线先验事件库
              <el-link type="primary" class="layer-describe-buttons" @click="handlePriorCondition">条件</el-link>
            </p>
            <div class="layer-box">
              <div
                v-for="item in priorItems"
                :key="item.item_id"
                class="layer-item"
                :class="{'active-layer': item.show}"
                :data-id="item.item_id"
              >
                {{ dynamicPriorLayerSourceTypeAlias[item.name] }}
              </div>
            </div> -->
            <p class="layer-describe layer-flex">
              issue
              <el-link type="primary" class="layer-describe-buttons" @click="handleShowIssueCondition">条件</el-link>
            </p>
            <div class="layer-box">
              <div
                v-for="item in issueLayerSource"
                class="layer-item"
                :class="{'active-layer': store.state.issue.show_by_id[item.item_id]}"
                :data-id="item.item_id"
                data-type="issue"
              >
                {{ item.name }}
              </div>
            </div>
            <p class="layer-describe layer-flex">
              <span>放行</span>
              <Popover @setAllowLayer="setAllowLayer"></Popover>
            </p>
            <div class="layer-box">
              <div
                v-for="item in items4"
                :key="item.item_id"
                class="layer-item"
                :class="{'active-layer': item.show}"
                :data-id="item.item_id"
              >
                {{ item.name }}
              </div>
            </div>
            <p class="layer-describe layer-flex">
              白名单
              <el-link type="primary" class="layer-describe-buttons" @click="handlenadPermissionCondition"
                >条件</el-link
              >
            </p>
            <div class="layer-box">
              <div
                class="layer-item"
                :class="{'active-layer': nadPermissionLayerVisible}"
                @click.stop="nadHandler($event)"
              >
                白名单
              </div>
            </div>
            <p class="layer-describe">其他</p>
            <div class="layer-box">
              <div class="layer-tool-item" @click="addLayerHandler">
                <i class="iconfont icon-xinzeng"></i>
              </div>
            </div>
            <div
              v-for="(item, idx) in customLayerListItems.items"
              :key="item.item_id"
              class="layer-item layer-box2"
              :class="{'active-layer': item.show}"
              :data-id="item.item_id"
              data-type="custom"
            >
              {{ item.name }}
            </div>
          </div>
        </el-scrollbar>
      </template>
    </Panel>
  </transition>
</template>

<script setup>
import {reactive, onMounted} from 'vue';
import {useStore} from 'vuex';
import {PopupData} from '../../../event/popup.js';
import Panel from '../../../components/panel/Panel.vue';
import Popover from '../../../components/popover/Popover.vue';
import {
  layerPanelVisible,
  setAddLayerPanelVisible,
  setLayerPanelVisible,
} from '../../../system/layer/panel/layerPanel.js';
import {
  customLayerListItems,
  layerListItems,
  layerController,
  layerSpecType,
  getHdSpecColor,
} from '../../../system/layer/layerController.js';
import {allowTypeExpr} from '../../../system/layer/laneGroupLayer/laneGroupLayer.js';
import {ALLOW_ROAD} from '../../../system/layer/tileLayer/LaneGroupLayer.js';
import {Cesium3DTileStyle} from 'cesium';
import {wheelCallback} from '../../../event/mouse.js';
import {
  oddLayerSource,
  linkOddLayerSource,
  sdLinkOddLayerSource,
  switchOddLayerSouceVisible,
  switchLinkOddLayerSouceVisible,
  switchSDLinkOddLayerSouceVisible,
} from '../../../system/odd/oddLayerVisible.js';
//import {canChangeODDLayerVisible} from '../../../system/odd/oddLayer.js';

import {
  dynamicLayerSourceTypeAlias,
  dynamicLinkLayerSourceTypeAlias,
  dynamicSDLinkLayerSourceTypeAlias,
  dynamicPriorLayerSourceTypeAlias,
  nadLayer,
  hdSpecLayerOption,
  dynamicLayerSourceType,
  dynamicListPriorLayerSourceType,
  dynamicPriorLayerSourceType,
} from '../../../system/layer/tileLayer/tileLayerController.js';

import {dynamicListPriorEventLayer} from '../../../system/layer/tileLayer/tileLayerController.js';

import {
  dynamicEventConPaneldata,
  getEtsForCity,
  getEtsForUserGroup,
  cityBlacklistOptions,
  combineEts,
  getEtsForItem,
  PANEL_TYPE,
} from './DynamicEventConditionPanel.ts';
import {eventConPaneldata} from './EventConditionPanel.ts';
import {priorConPaneldata} from './PriorConditionPanel.ts';
import {baseMapConPaneldata, setHdOptionExp} from './BaseMapConditionPanel.ts';
import {permissionNadConPaneldata, nadPermissionLayerVisible, setNadVisibleHandler} from './NadPermissionCondition.ts';
import {ref} from 'vue';
import {reloadOddData} from './ReloadOddLayer.js';
import {items3, items5} from './layerPanelData.ts';

const issueLayerSource = reactive([{name: 'issue起终点', item_id: 'issue_start_end_point', show: false}]);
import {NioNotification} from '../../../utils/utils.js';
const items1 = layerListItems.items.slice(0, 4 + hdSpecLayerOption.length); //地图数据
// const items2 = layerListItems.items.slice(
//   4 + hdSpecLayerOption.length,
//   4 + hdSpecLayerOption.length + dynamicLayerSourceType.length,
// ); //动态图层-lane
const items2 = layerListItems.items.slice(
  4 + hdSpecLayerOption.length,
  4 + hdSpecLayerOption.length + dynamicLayerSourceType.length - 2,
); //动态图层-lane
// const items3 = layerListItems.items.slice(
//   4 + hdSpecLayerOption.length + dynamicLayerSourceType.length,
//   4 + hdSpecLayerOption.length + dynamicLayerSourceType.length + 2,
// );
//动态图层-Road
// const items3 = layerListItems.items.slice(
//   4 + hdSpecLayerOption.length + dynamicLayerSourceType.length,
//   4 + hdSpecLayerOption.length + dynamicLayerSourceType.length + 2,
// );
// const items3 = layerListItems.items.slice(
//   4 + dynamicListPriorLayerSourceType.length + dynamicLayerSourceType.length + 15,
// ); // 动态图层-Road
//动态图层-Road
const items4 = layerListItems.items.slice(
  4 + hdSpecLayerOption.length + dynamicLayerSourceType.length + 2,
  4 + hdSpecLayerOption.length + dynamicLayerSourceType.length + 3,
); //放行道路
const priorItems = layerListItems.items.slice(
  4 + hdSpecLayerOption.length + dynamicLayerSourceType.length + 3,
  4 + hdSpecLayerOption.length + dynamicLayerSourceType.length + 7,
); //先验事件
// const items5 = layerListItems.items.slice(
//   4 + dynamicListPriorLayerSourceType.length + dynamicLayerSourceType.length + 12,
//   4 + dynamicListPriorLayerSourceType.length + dynamicLayerSourceType.length + 15,
// ); //动态图层-SDLink
// const items5 = layerListItems.items.slice(
//   4 + hdSpecLayerOption.length + dynamicLayerSourceType.length + 7,
//   4 + hdSpecLayerOption.length + dynamicLayerSourceType.length + 8,
// ); // 暂时只取一个动态图层-SDLink

const store = useStore();

function addLayerHandler() {
  setAddLayerPanelVisible(true);
}

function nadHandler() {
  setNadVisibleHandler(!nadLayer.show);
}

function setLayerPanelVisibleHandler() {
  setLayerPanelVisible(false);
}

function layerRightHandler(ev) {
  const id = ev.target.dataset.id;
  if (id) {
    let item = layerListItems.getItemById(parseInt(id));
    if (item === undefined) {
      item = customLayerListItems.getItemById(parseInt(id));
    }
    const layer = layerController.getLayerById(parseInt(item.layer_id));
    store.commit(
      'setPopup',
      new PopupData(true, [ev.clientX, ev.clientY], 'SET_LAYER', {
        id: id,
        deletable: layer.deletable,
        locatable: layer.locatable,
      }),
    );
  }
}

const setAllowLayer = (curTime = null) => {
  try {
    const item = layerListItems.items.find((v) => v.name === ALLOW_ROAD);

    const layer = layerController.getLayerById(parseInt(item.layer_id));
    if (item.show && layer) {
      const version = store.state.version.curVersion.toString();
      const expr = allowTypeExpr();
      layer.load3DTile(version, expr, curTime, true).then(() => {
        layer.show = true;
        wheelCallback();
      });
    }
  } catch (ex) {
    NioNotification('error', ``, ex.message);
  }
};

function linkLayerHandler(ev) {
  const name = ev.target.dataset.source;
  const type = ev.target.dataset.type;

  //是事件图层
  if (name !== undefined /* && canChangeODDLayerVisible(name) */) {
    switchLinkOddLayerSouceVisible(name);
    reloadOddData(store);
  }
}

function sdLinkLayerHandler(ev) {
  const name = ev.target.dataset.source;
  const type = ev.target.dataset.type;

  //是事件图层
  if (name !== undefined /* && canChangeODDLayerVisible(name) */) {
    switchSDLinkOddLayerSouceVisible(name);
    reloadOddData(store);
  }
}

function handleNsMockClick(item) {
  item.show = !item.show;
  localStorage.setItem(item.name, item.show.toString());

  // 获取先验事件的 ets (7903)
  const selectedItemEts = item.show ? ['7903'] : [];

  // 获取选中的城市的 ets
  const selectedCityEts = Object.keys(cityBlacklistOptions.value || {})
    .filter((city) => cityBlacklistOptions.value[city] === true)
    .map((city) => getEtsForCity(city));

  // 获取用户组的 ets
  const userGroupEts = getEtsForUserGroup(dynamicEventConPaneldata.userGroup);

  // 组合所有的 ets
  const combinedEts = combineEts(selectedItemEts, selectedCityEts, userGroupEts);

  // 加载图层
  dynamicListPriorEventLayer.load3DTile(
    store.state.version.curVersion.toString(),
    combinedEts,
    layerListItems.getSourceFilterExpr(),
  );
}

function layerHandler(ev) {
  debugger;
  const id = ev.target.dataset.id;

  let item = layerListItems.getItemById(parseInt(id));
  if (item && item.name === 'ns_mock') {
    handleNsMockClick(item);
    return;
  }
  const name = ev.target.dataset.source;
  const type = ev.target.dataset.type;
  //是事件图层
  if (name !== undefined /* && canChangeODDLayerVisible(name) */) {
    switchOddLayerSouceVisible(name);
    reloadOddData(store);
  }

  //是issue图层
  if (type === 'issue') {
    store.commit('issue/select', {
      selected_layer: id,
    });
    return;
  }

  if (id) {
    //const index = layerListItems.getIndexById(parseInt(id));
    let item = layerListItems.getItemById(parseInt(id));
    if (item === undefined) {
      item = customLayerListItems.getItemById(parseInt(id));
      item.show = !item.show;
    } else {
      //自定义图层不记录状态
      item.show = !item.show;
      localStorage.setItem(item.name, item.show.toString());
    }

    const layer = layerController.getLayerById(parseInt(item.layer_id));
    //如果是动态图层，则进行字段过滤处理
    if (item.type == layerSpecType.dynamic || item.type == layerSpecType.linkDynamic) {
      const tileset = layer.dataSource.get(0);
      const expr = layerListItems.getSourceFilterExpr();

      //要对dataSource的show进行处理。否则都不显示时也会请求数据
      if (expr === false) {
        layer.show = false;
      } else {
        layer.show = true;
      }

      tileset.style = new Cesium3DTileStyle({
        show: expr,
        color: `color("${layer.color_}")`,
      });

      //强制调用一下，用来刷新线宽
      wheelCallback();
    } else if (item.type == layerSpecType.priorDynamic) {
      const tileset = layer.dataSource.get(0);
      const expr = layerListItems.getPriorSourceFilterExpr();

      //要对dataSource的show进行处理。否则都不显示时也会请求数据
      if (expr === false) {
        layer.show = false;
      } else {
        layer.show = true;
      }

      tileset.style = new Cesium3DTileStyle({
        show: expr,
        color: `color("${layer.color_}")`,
      });

      //强制调用一下，用来刷新线宽
      wheelCallback();
    } else if (item.type == layerSpecType.specHd) {
      //
      const tileset = layer.dataSource.get(0);
      const expr = layerListItems.getHDSpecOption();

      //要对dataSource的show进行处理。否则都不显示时也会请求数据
      if (expr === false) {
        layer.show = false;
      } else {
        layer.show = true;
      }

      let color = getHdSpecColor();

      tileset.style = new Cesium3DTileStyle({
        show: expr,
        color: color,
      });

      //强制调用一下，用来刷新线宽
      wheelCallback();
    } else if (item.type == layerSpecType.dynamicListPriorEvent || item.type == layerSpecType.dynamicEvent) {
      const tileset = layer.dataSource.get(0);
      const expr = layerListItems.getPriorSourceFilterExprByEts();

      //要对dataSource的show进行处理。否则都不显示时也会请求数据
      if (expr === false) {
        layer.show = false;
      } else {
        layer.show = true;
      }

      tileset.style = new Cesium3DTileStyle({
        show: expr,
        color: `color("${layer.color_}")`,
      });

      //强制调用一下，用来刷新线宽
      wheelCallback();
    } else if (item.name === ALLOW_ROAD) {
      const version = store.state.version.curVersion.toString();
      const expr = allowTypeExpr();
      if (item.show) {
        layer.load3DTile(version, expr, null, true).then(() => {
          layer.show = true;
          wheelCallback();
        });
      } else {
        layer.show = false;
      }
    } else if (item.type == 'custom') {
      layer.show = item.show;
    } else if (item.type == layerSpecType.sdLink) {
      layer.show = item.show;
    } else {
      layer.show = item.show;
      if (item.show) {
        setHdOptionExp(layer);
      }
    }
  }
}

function handleShowIssueCondition(ev) {
  ev.stopPropagation();

  store.commit('issue/setConditionPanelShow', {
    show: !store.state.issue.conditionPanelShow,
  });
}

function handleEventCondition(ev) {
  eventConPaneldata.visible = !eventConPaneldata.visible;
}

function handleDynamicEventCondition(ev) {
  dynamicEventConPaneldata.visible = !dynamicEventConPaneldata.visible;
}

function handlePriorCondition(ev) {
  priorConPaneldata.visible = !priorConPaneldata.visible;
}

function handleBaseMapCondition(ev) {
  baseMapConPaneldata.visible = !baseMapConPaneldata.visible;
}

function handlenadPermissionCondition(ev) {
  permissionNadConPaneldata.visible = !permissionNadConPaneldata.visible;
}

function handleDynamicRoadClick(item) {
  item.show = !item.show;
  localStorage.setItem(item.name, item.show.toString());

  const selectedItemEts = items3.filter((i) => i.show).map((i) => getEtsForItem(i.name));

  // 只获取实际选中的城市
  const selectedCityEts = Object.keys(cityBlacklistOptions.value || {})
    .filter((city) => cityBlacklistOptions.value[city] === true) // 明确检查是否为 true
    .map((city) => getEtsForCity(city));

  const userGroupEts = getEtsForUserGroup(dynamicEventConPaneldata.userGroup);

  const combinedEts = combineEts(selectedItemEts, selectedCityEts, userGroupEts);

  console.log('Combined ETSs:', combinedEts);

  dynamicListPriorEventLayer.load3DTile(
    store.state.version.curVersion.toString(),
    combinedEts,
    layerListItems.getPriorSourceFilterExprByEts(),
  );
}

function handleDynamicSDLinkClick(item) {
  item.show = !item.show;
  localStorage.setItem(item.name, item.show.toString());

  const selectedItemEts = items5.filter((i) => i.show).map((i) => getEtsForItem(i.name));

  // 只获取实际选中的城市
  const selectedCityEts = Object.keys(cityBlacklistOptions.value || {})
    .filter((city) => cityBlacklistOptions.value[city] === true) // 明确检查是否为 true
    .map((city) => getEtsForCity(city));

  const userGroupEts = getEtsForUserGroup(dynamicEventConPaneldata.userGroup);

  const combinedEts = combineEts(selectedItemEts, selectedCityEts, userGroupEts);

  console.log('Combined ETSs:', combinedEts);

  dynamicListPriorEventLayer.load3DTile(
    store.state.version.curVersion.toString(),
    combinedEts,
    layerListItems.getPriorSourceFilterExprByEts(),
  );
}

function initializeEts() {
  items3.forEach((item) => {
    const storedState = localStorage.getItem(item.name);
    console.log('storedState', storedState);
    if (storedState === 'true') {
      item.show = true;
      const ets = getEtsForItem(item.name);
      dynamicListPriorEventLayer.load3DTile(
        store.state.version.curVersion.toString(),
        ets,
        layerListItems.getPriorSourceFilterExprByEts(),
      );
    }
  });

  items5.forEach((item) => {
    const storedState = localStorage.getItem(item.name);
    if (storedState === 'true') {
      item.show = true;
      debugger;
      const ets = getEtsForItem(item.name);
      dynamicListPriorEventLayer.load3DTile(
        store.state.version.curVersion.toString(),
        ets,
        layerListItems.getPriorSourceFilterExprByEts(),
      );
    }
  });
}

onMounted(() => {
  initializeEts();
});

function handleDynamicLaneCondition() {
  dynamicEventConPaneldata.panelType = PANEL_TYPE.LANE;
  dynamicEventConPaneldata.visible = !dynamicEventConPaneldata.visible;
}

function handleDynamicRoadCondition() {
  dynamicEventConPaneldata.panelType = PANEL_TYPE.ROAD;
  dynamicEventConPaneldata.visible = !dynamicEventConPaneldata.visible;
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
  background-color: #333546 !important;
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
