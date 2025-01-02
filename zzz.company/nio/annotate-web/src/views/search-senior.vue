<template>
  <transition name="el-zoom-in-top">
    <Panel
      center
      v-model:visible="searchSeniorPanelVisible"
      :width="400"
      :min-width="100"
      :max-width="600"
      :height="200"
      :min-height="100"
      :max-height="300"
      scale-able
      :fixed-top="true"
    >
      <template #header>
        <div>高级查询</div>
        <div style="flex: 1"></div>
        <div class="title-close" @click="closeSeniorPanel">
          <i class="iconfont icon-guanbi1"></i>
        </div>
      </template>
      <template #default>
        <el-tabs type="border-card">
          <!-- 3DTile图层 -->
          <el-tab-pane label="按Lane ID">
            <div class="add-item">
              <div class="add-item-content">
                <input
                  v-model="searchData.lane_id"
                  :class="{'apply-shake': searchData.shake_id}"
                  class="add-item-input"
                  type="text"
                  placeholder="Lane ID"
                />
              </div>
            </div>
            <div class="add-item" style="justify-content: flex-end">
              <el-button type="primary" @click="laneIdHandler">
                <span>确定</span>
              </el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="按Link ID">
            <div class="add-item">
              <div class="add-item-content">
                <input
                  v-model="searchData.link_id"
                  :class="{'apply-shake': searchData.shake_id}"
                  class="add-item-input"
                  type="text"
                  placeholder="Link ID"
                />
              </div>
            </div>
            <div class="add-item" style="justify-content: flex-end">
              <el-button type="primary" @click="linkIdHandler">
                <span>确定</span>
              </el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="按SD Link ID">
            <div class="add-item">
              <div class="add-item-content">
                <input
                  v-model="searchData.sdLink_id"
                  :class="{'apply-shake': searchData.shake_id}"
                  class="add-item-input"
                  type="text"
                  placeholder="SD Link ID"
                />
              </div>
            </div>
            <div class="add-item" style="justify-content: flex-end">
              <el-button type="primary" @click="sDLinkIdHandler">
                <span>确定</span>
              </el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </template>
    </Panel>
  </transition>
</template>

<script setup>
import {reactive} from 'vue';
import axios from 'axios';
import store from '../store/store.js';
import Panel from '../components/panel.vue';
import {NioMessage} from '../utils/utils.js';
import {searchSeniorPanelVisible, setSearchSeniorPanelVisible} from '../system/search-senior.js';
import {getBaseMapUrl} from '../system/tileset-manager.js';
import {fetchLink, fetchSdLink} from './SearchHdLink.js';

import {createHighlightLineEntity, clearAllTempEntities} from '../system/temp-entities.js';

const searchData = reactive({
  lane_id: '',
  link_id: '',
  sdLink_id: '',
  event_id: '',
  issue_id: '',
  shake_id: false,
});

const shakeInput = function () {
  searchData.shake_id = true;
  setTimeout(() => {
    searchData.shake_id = false;
  }, 820);
};

async function checkLaneId() {
  if (searchData.lane_id === '') {
    return Promise.reject('err');
  }

  return true;
}

async function checkLinkId() {
  if (searchData.link_id === '') {
    return Promise.reject('err');
  }

  return true;
}

async function checkSdLinkId() {
  if (searchData.sdLink_id === '') {
    return Promise.reject('err');
  }

  return true;
}

const laneIdHandler = function () {
  let mesh = '';
  let id = searchData.lane_id;
  const baseMapURL = getBaseMapUrl(store.state.version.curVersion);

  try {
    mesh = (BigInt(id) >> BigInt(32)).toString();
  } catch (error) {
    shakeInput();
  }

  checkLaneId()
    .then((res) => {
      //左移32位
      debugger;
      let flag = axios
        .get(`${baseMapURL}/hd_map/china_json_${store.state.version.curVersion}_new/lane/${mesh}.geojson`)
        .then((res) => {
          let find = false;
          let features = res.data.features;
          debugger;
          if (features === undefined) {
            NioMessage('warning', '未找到该lane id结果，请核实id或版本号', 1500);
            return;
          }

          for (let i = 0; i < features.length; i++) {
            if (features[i].properties.id === id) {
              createHighlightLineEntity(features[i].geometry.coordinates);
              find = true;
              break;
            }
          }

          if (find === false) {
            NioMessage('warning', '未找到该lane id结果，请核实id或版本号', 1500);
          }
        })
        .catch((err) => {
          NioMessage('error', '查询底图数据失败' + err.message, 1500);
          return false;
        });
    })
    .catch((err) => {
      shakeInput();
    });
};

const linkIdHandler = function () {
  let mesh = '';
  let id = searchData.link_id;
  id = id.trim();
  try {
    mesh = (BigInt(id) >> BigInt(32)).toString();
  } catch (error) {
    shakeInput();
  }

  checkLinkId()
    .then(async (res) => {
      searchData.loading = true;
      let lines = await fetchLink(id);
      for (let line of lines) {
        createHighlightLineEntity(line);
      }
    })
    .catch((err) => {
      shakeInput();
    })
    .finally(() => {
      searchData.loading = false;
    });
};

const sDLinkIdHandler = function () {
  let mesh = '';
  let id = searchData.sdLink_id;
  id = id.trim();
  try {
    mesh = (BigInt(id) >> BigInt(32)).toString();
  } catch (error) {
    shakeInput();
  }

  checkSdLinkId()
    .then(async (res) => {
      searchData.loading = true;
      let line = await fetchSdLink(id);
      createHighlightLineEntity(line);
    })
    .catch((err) => {
      shakeInput();
    })
    .finally(() => {
      searchData.loading = false;
    });
};

const closeSeniorPanel = function () {
  setSearchSeniorPanelVisible(false);
  clearAllTempEntities();
};
</script>

<style scoped>
:deep(.el-color-picker__trigger) {
  border: none;
}

:deep(.el-tabs--border-card) {
  background-color: transparent !important;
}

:deep(.el-tabs--border-card) {
  border: none;
}
:deep(.el-tabs--border-card > .el-tabs__header) {
  border: none;
}

:deep(.el-tabs__content) {
  padding: 0 !important;
}
:deep(.el-tabs--border-card > .el-tabs__header) {
  background-color: transparent;
}
:deep(.el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active) {
  color: #3e8cf6;
  border-color: transparent;
  border-bottom: 2px solid;
  background-color: transparent;
}
:deep(.el-tabs--border-card > .el-tabs__header .el-tabs__item) {
  color: #fff;
  transition: none;
}
#add-layer-panel {
  position: fixed;
  width: 500px;
  margin: auto;
}
.add-item {
  display: flex;
  align-items: center;
  margin: 18px 40px;
  color: #fff;
}
.add-item-label {
  font-size: 14px;
  width: 60px;
  text-align: right;
}
.add-item-content {
  flex: 1;
  height: 28px;
  margin-left: 8px;
}
.add-item-input {
  width: 100%;
  height: 100%;
  padding: 0 24px 0 10px;
  border: none;
  border-radius: 4px;
  background-color: #101223;
  font-size: 11px;
  color: white;
}
.add-item-input:focus {
  outline: none;
}
</style>
