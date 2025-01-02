import {createStore} from 'vuex';
import {imageryProvider} from '../cesium/imagery/imagery-provider.js';
import {createViewer} from '../cesium/create-viewer.js';
import {Cartesian2, Cartographic, Color, Math as CMath} from 'cesium';
import {AroundPoint} from '../animate/around-point.js';
import {version} from './version.js';
import {watch} from 'vue';
import {
  clearNdsTileSet,
  ndsBaseLayerItems,
  getOrCreateNdsTileSet,
  getOrCreateNdsContainer,
  setNdsTileSetVisible,
  setHdSpecTileSetExpr,
  ndsDesc,
  hdSpecDesc,
  isUseHuaiLai,
} from '../system/tileset-manager.js';
import {setHdOptionExp} from '../../src/views/basemap-condition-panel.ts';

import {userInfo} from './user-info.js';
import {resetGridTileLayer} from '../cesium/imagery/tile-grid-provider.js';

const store = createStore({
  state() {
    return {
      sceneMode: '2D',
      map: localStorage.getItem('map') ?? '高德影像', //当前底图
      mapShow: true, //是否显示影像底图
      maxZIndex: 30, //当前最大zIndex层级
    };
  },
  getters: {},
  mutations: {
    //修改底图
    switchMap(state, map) {
      resetGridTileLayer();
      state.map = map;
      if (state.mapShow) {
        let viewer = createViewer();
        viewer.imageryLayers.removeAll();
        viewer.imageryLayers.addImageryProvider(imageryProvider[map]);
      }
      localStorage.setItem('map', map);
    },
    //底图开关
    switchMapShow(state, show) {
      const viewer = createViewer();
      if (show) {
        viewer.scene.globe.baseColor = Color.fromCssColorString('#546a53');
        store.commit('switchMap', state.map);
      } else {
        viewer.scene.globe.baseColor = Color.BLACK;
        viewer.imageryLayers.removeAll();
      }
    },
    //修改视角
    switchDimension: (() => {
      const viewer = createViewer();
      let running = false;

      //相机飞行函数
      function cameraFly(destination) {
        viewer.camera.flyTo({
          destination: Cartographic.toCartesian(destination),
          orientation: {
            heading: viewer.camera.heading,
            roll: 0,
            pitch: CMath.toRadians(-90),
          },
          duration: 1,
        });
      }

      return async function (state, sceneMode) {
        if (running) return;
        running = true;
        let screenPos = new Cartesian2(document.body.clientWidth / 2, document.body.clientHeight / 2);
        let centerPos = viewer.camera.pickEllipsoid(screenPos, viewer.scene.globe.ellipsoid);
        if (store.state.sceneMode === '3D') {
          viewer.scene.screenSpaceCameraController.enableTilt = false;
          viewer.scene.screenSpaceCameraController.enableLook = false;
          store.state.sceneMode = '2D';
          let newCameraPos = Cartographic.fromCartesian(centerPos);
          newCameraPos.height = Cartographic.fromCartesian(viewer.camera.position).height;
          cameraFly(newCameraPos);
        } else if (store.state.sceneMode === '2D') {
          viewer.scene.screenSpaceCameraController.enableTilt = true;
          viewer.scene.screenSpaceCameraController.enableLook = true;
          store.state.sceneMode = '3D';
          let aroundPoint = new AroundPoint(
            viewer,
            centerPos,
            Cartographic.fromCartesian(viewer.camera.position).height,
          );
          aroundPoint.start(2);
        }
        await new Promise((resolve) =>
          setTimeout(() => {
            running = false;
            resolve();
          }, 800),
        );
      };
    })(),
  },
  actions: {},
  modules: {
    version,
    userInfo,
  },
});

//监听版本变化
watch(
  () => store.state.version.curVersion,
  async (newVal, oldVal) => {
    //如果新版本值为Symbol类型，表示是在重置版本，不做处理
    if (newVal !== oldVal && typeof newVal !== 'string') {
      clearNdsTileSet();

      await getOrCreateNdsTileSet(ndsDesc.laneBoundary);
      setNdsTileSetVisible(ndsDesc.laneBoundary, ndsBaseLayerItems[0].visible);

      await getOrCreateNdsTileSet(ndsDesc.lane);
      setNdsTileSetVisible(ndsDesc.lane, ndsBaseLayerItems[1].visible);

      await getOrCreateNdsTileSet(ndsDesc.road);
      setNdsTileSetVisible(ndsDesc.road, ndsBaseLayerItems[2].visible);

      await getOrCreateNdsTileSet(ndsDesc.sdLink);
      setNdsTileSetVisible(ndsDesc.sdLink, ndsBaseLayerItems[3].visible);

      //之前的版本没有红绿灯等要素
      if (isUseHuaiLai(newVal)) {
        await getOrCreateNdsTileSet(hdSpecDesc.ZONE);
        await setHdSpecTileSetExpr(hdSpecDesc.ZONE);
      } else {
        getOrCreateNdsContainer(hdSpecDesc.ZONE).removeAll();
      }

      //加上条件筛选
      if (ndsBaseLayerItems[2].visible) {
        await setHdOptionExp(ndsDesc.road);
      }

      if (ndsBaseLayerItems[1].visible) {
        await setHdOptionExp(ndsDesc.lane);
      }

      if (ndsBaseLayerItems[0].visible) {
        await setHdOptionExp(ndsDesc.laneBoundary);
      }
    }
  },
);

export default store;
