<template>
  <transition name="el-zoom-in-top">
    <Panel
        center v-model:visible="addLayerPanelVisible"
        :width="500" :min-width="400" :max-width="600"
        :height="300" :min-height="300" :max-height="300"
        scale-able
        :fixed-top="true"
    >
      <template #header>
        <div>添加图层</div>
        <div style="flex: 1"></div>
        <div class="title-close" @click="closeAddPanel">
          <i class="iconfont icon-guanbi1"></i>
        </div>
      </template>
      <template #default>
        <el-tabs type="border-card">
          <!-- 3DTile图层 -->
          <el-tab-pane label="3DTile">
            <div class="add-item">
              <div class="add-item-label">URL：</div>
              <div class="add-item-content">
                <input v-model="formData.tileFormData.url" :class="{'apply-shake': formData.tileFormData.shakeURL}" class="add-item-input" type="text"
                       placeholder="添加3DTile图层">
              </div>
            </div>
            <div class="add-item">
              <div class="add-item-label">图层名：</div>
              <div class="add-item-content">
                <input v-model="formData.tileFormData.name" :class="{'apply-shake': formData.tileFormData.shakeName}" class="add-item-input" type="text"
                       placeholder="请输入图层命名">
              </div>
            </div>
            <div class="add-item">
              <div class="add-item-label">颜色：</div>
              <div class="add-item-content">
                <el-color-picker v-model="formData.tileFormData.color" show-alpha color-format="hex"></el-color-picker>
              </div>
            </div>
            <div class="add-item" style="justify-content: flex-end">
              <el-button type="primary" @click="tileHandler">
                <i class="iconfont icon-xinzeng"></i>
                <span>添加</span>
              </el-button>
            </div>
          </el-tab-pane>
          <!-- WKT图层 -->
          <el-tab-pane label="WKT">
            <div class="add-item">
              <div class="add-item-label">URL：</div>
              <div class="add-item-content">
                <input v-model="formData.wktFormData.url" :class="{'apply-shake': formData.wktFormData.shakeURL}" class="add-item-input" type="text"
                       placeholder="添加WKT图层">
              </div>
            </div>
            <div class="add-item">
              <div class="add-item-label">图层名：</div>
              <div class="add-item-content">
                <input v-model="formData.wktFormData.name" :class="{'apply-shake': formData.wktFormData.shakeName}" class="add-item-input" type="text"
                       placeholder="请输入图层命名">
              </div>
            </div>
            <div class="add-item" style="justify-content: flex-end">
              <el-button type="primary" @click="wktHandler">
                <i class="iconfont icon-xinzeng"></i>
                <span>添加</span>
              </el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </template>
    </Panel>
  </transition>
</template>

<script setup>
import {inject, reactive, ref, watch} from "vue";
import {useStore} from "vuex";
import axios from "axios";
import {NioNotification} from "../../../utils/utils.js";
import {createViewer} from "../../../cesium/initMap.js";
import {LayerFactory} from "../../../system/layer/custom/customLayer.js";
import wkt from 'terraformer-wkt-parser';
import Panel from "../../../components/panel/Panel.vue";
import {
  addLayerPanelVisible,
  setAddLayerPanelVisible,
  setLayerPanelVisible
} from "../../../system/layer/panel/layerPanel.js";
import {layerController} from "../../../system/layer/layerController.js";

const store = useStore();
const date = new Date();
const day = date.getDate() - 1;
const formData = reactive({
  tileFormData: {
    url: `http://10.115.16.83:8001/customLayers/${date.getFullYear()}${date.getMonth()+1}${day < 10 ? '0' + day : day}-all-dst/tileset.json`,
    name: '',
    color: '#ffea00',
    shakeURL: false,
    shakeName: false,
  },
  wktFormData: {
    url: 'http://10.115.16.83:8001/wkt/hefei_wkt.txt',
    name: 'wktLayer',
    borderColor: '',
    borderWidth: '',
    shakeURL: false,
    shakeName: false,
  }
});

const viewer = createViewer();

const shakeInput = function (target, filed) {
  target[filed] = true;
  setTimeout(() => {
    target[filed] = false;
  }, 820);
};

//表单验证策略
const strategy = {
  async tile() {
    let data = formData.tileFormData;
    if (data.url === '') {
      return Promise.reject('url');
    } else if (data.name === '') {
      return Promise.reject('name');
    }
    let urlFormat = /tileset\.json/gi;
    if (!urlFormat.test(data.url)) {
      return Promise.reject('url');
    }
    return true;
  },
  async wkt() {
    let data = formData.wktFormData;
    if (data.url === '') {
      return Promise.reject('url');
    } else if (data.name === '') {
      return Promise.reject('name');
    }
    return true;
  },
};
//生成自定义3dtile
const tileHandler = function () {
  let data = formData.tileFormData;
  strategy.tile().then(res => {
    new LayerFactory('Custom3DTileLayer', {
      url: data.url,
      label: data.name,
      color: data.color,
    }).then(res => {
      setLayerPanelVisible(false);
    }).catch(err => {
      NioNotification('error', '加载3DTile失败', err.message, 3000);
    });
  }).catch(err => {
    switch (err) {
      case 'url':
        shakeInput(data, 'shakeURL');break;
      case 'name':
        shakeInput(data, 'shakeName');break;
      default:
        NioNotification('error', '文件格式错误','请选择tileset.json文件', 3000);
    }
  });
};
const wktHandler = function () {
  const data = formData.wktFormData;
  strategy.wkt().then(res => {
    axios.get(data.url).then(res => {
      let wktList = res.data.split('\n'), arr = [];
      for (let i = wktList.length - 1; i >= 0; i--) {
        if (wktList[i]) {
          arr.push(wkt.parse(wktList[i]));
        }
      }
      let layer = new LayerFactory('CustomWKTLayer', {
        name: data.name,
        list: arr
      });
      layerController.unshift(layer);
      layer.location();
      setLayerPanelVisible(false);
    }).catch(e => {
      NioNotification('error', 'WKT解析失败', e.message, 3000);
    });
  }).catch(err => {
    switch (err) {
      case 'url':
        shakeInput(data, 'shakeURL');break;
      case 'name':
        shakeInput(data, 'shakeName');break;
    }
  });
};

const closeAddPanel = function () {
  setAddLayerPanelVisible(false);
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

:deep(.el-tabs--border-card>.el-tabs__header) {
  border: none;
}

:deep(.el-tabs__content) {
  padding: 0 !important;
}

:deep(.el-tabs--border-card>.el-tabs__header) {
  background-color: transparent;
}

:deep(.el-tabs--border-card>.el-tabs__header .el-tabs__item.is-active) {
  color: #3e8cf6;
  border-color: transparent;
  border-bottom: 2px solid;
  background-color: transparent;
}
:deep(.el-tabs--border-card>.el-tabs__header .el-tabs__item) {
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
