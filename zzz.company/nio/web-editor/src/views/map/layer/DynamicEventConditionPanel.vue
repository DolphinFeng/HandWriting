<template>
  <transition name="el-zoom-in-top">
    <Panel
      v-model:visible="dynamicEventConPaneldata.visible"
      :width="500"
      :min-width="500"
      :max-width="600"
      :height="currentHeight"
      :min-height="currentHeight"
      :max-height="600"
      :top="316"
      :left="1153"
      scale-able
    >
      <template #header>
        <div>{{ panelTitle }}</div>
        <div style="flex: 1"></div>
        <div class="title-close" @click="() => closePanel()">
          <i class="iconfont icon-guanbi1"></i>
        </div>
      </template>
      <template #default>
        <el-scrollbar height="100%">
          <p class="layer-describe">环境</p>
          <div class="layer-box">
            <div
              @click.stop="clickEnv($event)"
              v-for="item in DYNAMIC_ENV_LIST"
              :key="item"
              class="layer-item"
              :class="{
                'active-layer': dynamicEventConPaneldata.env == item,
              }"
              :data-id="item"
            >
              {{ item }}
            </div>
          </div>

          <template v-if="dynamicEventConPaneldata.panelType === PANEL_TYPE.ROAD">
            <p class="layer-describe">用户组</p>
            <div class="layer-box">
              <div
                v-for="group in userGroupList"
                :key="group.name"
                class="layer-item"
                :class="{
                  'active-layer': dynamicEventConPaneldata.userGroup == group.name,
                }"
                @click="selectUserGroup(group.name)"
              >
                {{ group.name }}
              </div>
            </div>

            <div style="display: flex; align-items: center">
              <p class="layer-describe">城区黑名单</p>
              <el-checkbox
                style="margin-bottom: -12px; margin-left: -10px"
                v-model="checkedAllCities"
                label="全选"
                size="large"
                @change="checkedAllCitiesChanged"
                :indeterminate="isIndeterminateCities"
              />
            </div>
            <div class="layer-box">
              <div
                v-for="city in CITY_BLACKLIST"
                :key="city"
                class="layer-item"
                :class="{
                  'active-layer': cityBlacklistOptions[city],
                }"
                @click="toggleCitySelection(city)"
              >
                {{ city }}
              </div>
            </div>
          </template>
        </el-scrollbar>
      </template>
    </Panel>
  </transition>
</template>

<script lang="ts" setup>
import Panel from '../../../components/panel/Panel.vue';
import {
  dynamicEventConPaneldata,
  DYNAMIC_ENV_LIST,
  userGroupList,
  CITY_BLACKLIST,
  getEtsForCity,
  getEtsForUserGroup,
  fetchVehicleTags,
  combineEts,
  getEtsForItem,
  PANEL_TYPE,
} from './DynamicEventConditionPanel.ts';
import {layerListItems} from '../../../system/layer/layerController.js';
import {items3, items5} from './layerPanelData.ts';
import {
  dynamicEventLayer,
  priorDynamicEventLayer,
  dynamicListPriorEventLayer,
} from '../../../system/layer/tileLayer/tileLayerController.js';
import {useStore} from 'vuex';
import {ref, onMounted, computed, watch, nextTick} from 'vue';

const store = useStore();

const cityBlacklistOptions = ref(
  CITY_BLACKLIST.reduce((acc, city) => {
    const savedState = localStorage.getItem(`cityBlacklist_${city}`);
    acc[city] = savedState === null ? true : savedState === 'true';
    return acc;
  }, {}),
);

const checkedAllCities = ref(Object.values(cityBlacklistOptions.value).every((v) => v === true));
const isIndeterminateCities = ref(false);

const panelTitle = computed(() => {
  return dynamicEventConPaneldata.panelType === PANEL_TYPE.LANE ? '动态图层条件' : '动态图层-Lane、Road、SDLink条件';
});

const currentHeight = ref(300);

watch(
  () => dynamicEventConPaneldata.panelType,
  async (newType) => {
    if (dynamicEventConPaneldata.visible) {
      dynamicEventConPaneldata.visible = false;
      await nextTick();
      currentHeight.value = newType === PANEL_TYPE.LANE ? 120 : 500;
      await nextTick();
      dynamicEventConPaneldata.visible = true;
    } else {
      currentHeight.value = newType === PANEL_TYPE.LANE ? 120 : 500;
    }
  },
  {immediate: true},
);

function clickEnv(ev) {
  let id = ev.target.dataset.id;
  if (id == dynamicEventConPaneldata.env) {
    return;
  }

  dynamicEventConPaneldata.env = id;
  fetchVehicleTags();

  const version = store.state.version.curVersion.toString();
  dynamicEventLayer.load3DTile(version, layerListItems.getSourceFilterExpr());
  priorDynamicEventLayer.load3DTile(version, layerListItems.getPriorSourceFilterExpr());
}

function selectUserGroup(group) {
  dynamicEventConPaneldata.userGroup = group;
  const version = store.state.version.curVersion.toString();
  const userGroupEts = getEtsForUserGroup(group);
  const selectedCities = Object.keys(cityBlacklistOptions.value)
    .filter((city) => cityBlacklistOptions.value[city])
    .map((city) => {
      const cityEts = getEtsForCity(city);
      return `${cityEts},${userGroupEts},sdfsdf`;
    })
    .join(';');

  console.log('Selected User Group and Cities ETS:', selectedCities);
  dynamicListPriorEventLayer.load3DTile(version, selectedCities, layerListItems.getPriorSourceFilterExprByEts());
}

function closePanel() {
  dynamicEventConPaneldata.visible = false;
}

function checkedAllCitiesChanged(val) {
  Object.keys(cityBlacklistOptions.value).forEach((city) => {
    cityBlacklistOptions.value[city] = val;
    localStorage.setItem(`cityBlacklist_${city}`, val.toString());
  });

  isIndeterminateCities.value = false;
  checkedAllCities.value = val;

  const version = store.state.version.curVersion.toString();
  const userGroupEts = getEtsForUserGroup(dynamicEventConPaneldata.userGroup);

  const selectedCityEts = Object.keys(cityBlacklistOptions.value)
    .filter((city) => cityBlacklistOptions.value[city])
    .map((city) => getEtsForCity(city));

  const selectedRoadEts = items3.filter((i) => i.show).map((i) => getEtsForItem(i.name));

  const selectedSDLinkEts = items5.filter((i) => i.show).map((i) => getEtsForItem(i.name));

  const combinedEts = combineEts([...selectedRoadEts, ...selectedSDLinkEts], selectedCityEts, userGroupEts);

  dynamicListPriorEventLayer.load3DTile(version, combinedEts, layerListItems.getPriorSourceFilterExprByEts());
}

function toggleCitySelection(city) {
  cityBlacklistOptions.value[city] = !cityBlacklistOptions.value[city];
  localStorage.setItem(`cityBlacklist_${city}`, cityBlacklistOptions.value[city].toString());

  updateCitySelectionState();

  const version = store.state.version.curVersion.toString();
  const userGroupEts = getEtsForUserGroup(dynamicEventConPaneldata.userGroup);

  const selectedCityEts = Object.keys(cityBlacklistOptions.value)
    .filter((city) => cityBlacklistOptions.value[city])
    .map((city) => getEtsForCity(city));

  const selectedRoadEts = items3.filter((i) => i.show).map((i) => getEtsForItem(i.name));

  const selectedSDLinkEts = items5.filter((i) => i.show).map((i) => getEtsForItem(i.name));

  const combinedEts = combineEts([...selectedRoadEts, ...selectedSDLinkEts], selectedCityEts, userGroupEts);

  console.log('Combined ETSs after city selection:', combinedEts);

  dynamicListPriorEventLayer.load3DTile(version, combinedEts, layerListItems.getPriorSourceFilterExprByEts());
}

function updateCitySelectionState() {
  const total = CITY_BLACKLIST.length;
  const checkedCount = Object.values(cityBlacklistOptions.value).filter(Boolean).length;

  if (checkedCount === 0) {
    checkedAllCities.value = false;
    isIndeterminateCities.value = false;
  } else if (checkedCount === total) {
    checkedAllCities.value = true;
    isIndeterminateCities.value = false;
  } else {
    checkedAllCities.value = false;
    isIndeterminateCities.value = true;
  }
}

onMounted(() => {
  fetchVehicleTags();
  updateCitySelectionState();
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
.layer-box {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  align-content: center;
  padding-left: 3%;
  padding-right: 3%;
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
  padding-right: 5%;
  margin-bottom: 0;
  color: rgb(197, 197, 197);
  text-align: left;
}
</style>

<style>
.el-input__wrapper,
.el-input__wrapper:hover {
  background-color: #252526 !important;
  box-shadow: 0 0 0 1px #252526 inset;
}
.picker-date,
.el-popper__arrow::before,
.el-time-panel {
  background-color: #333546 !important;
  border: 0 !important;
}
.el-date-range-picker,
.el-picker-panel__footer {
  background-color: #333546 !important;
}
.disabled .el-date-table-cell,
.disabled .cell {
  background-color: #606266 !important;
}

.is-focus {
  box-shadow: 0 0 0 1px #333546 inset !important;
}

.el-date-range-picker__time-header {
  border-bottom: none !important;
}

.el-date-range-picker__content.is-left {
  border-right: none !important;
}

.el-picker-panel__footer {
  border-top: none !important;
}

.el-picker-panel__body,
.el-date-picker__header > span,
.el-date-picker__header button,
.el-time-panel .el-time-spinner__item {
  color: #ffffff !important;
}
.picker-date tbody tr th,
.picker-date tbody tr td,
.picker-date tbody tr .cell {
  color: #ffffff !important;
}

.el-date-table td.in-range .el-date-table-cell,
.el-time-panel .el-time-spinner__item:hover {
  background-color: rgba(64, 158, 255, 0.2) !important;
}

.el-picker-panel__footer .is-text,
.el-time-panel__btn.cancel {
  color: var(--el-color-primary) !important;
}

.el-picker-panel__footer .is-text:hover,
.el-time-panel__btn.cancel {
  background: none !important;
}

.el-picker-panel__footer .is-plain,
.el-time-panel__btn.confirm {
  background: none !important;
  color: #ffffff;
}

.el-picker-panel__footer .is-plain:hover,
.el-time-panel__btn.confirm {
  color: var(--el-color-primary);
}

.el-picker-panel__icon-btn {
  color: #fff;
}
</style>
