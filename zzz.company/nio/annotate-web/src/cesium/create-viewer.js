import {
  Ion,
  Viewer,
  FeatureDetection,
  ScreenSpaceEventType,
  Clock,
  SceneMode,
  Color,
  createWorldTerrain,
  ShadowMode,
  ScreenSpaceEventHandler,
} from 'cesium';
import { imageryProvider } from './imagery/imagery-provider.js';

import { markRaw } from 'vue';

//初始化地图
Ion.defaultAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2MjIwOGI3Mi04NGY3LTRiYzktYjdhZC0yMmJmNmUwZWE3ZjIiLCJpZCI6MTAzNDkzLCJpYXQiOjE2NjA4Mzk3MzN9.hXp_shYvH0cyXxxo_jMhWcln_kS9eO_x9zWSxM-qO-c';
const terrainProvider = createWorldTerrain();
let viewer = null;

/** @returns {Viewer} */
function createViewer() {
  if (viewer !== null) {
    return viewer;
  }
  viewer = markRaw(
    new Viewer('cesiumContainer', {
      animation: false,
      automaticallyTrackDataSourceClocks: true,
      baseLayerPicker: false,
      clock: new Clock(),
      contextOptions: undefined,
      fullscreenButton: false,
      fullscreenElement: document.body,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      imageryProvider:
        imageryProvider[localStorage.getItem('map') ?? '高德影像'],
      maximumRenderTimeChange: Infinity,
      navigationHelpButton: false,
      requestRenderMode: false,
      selectionIndicator: false,
      sceneModePicker: false,
      scene3DOnly: true,
      showRenderLoopErrors: false,
      sceneMode: SceneMode.SCENE3D,
      timeline: false,
      terrainShadows: ShadowMode.DISABLED,
      targetFrameRate: undefined,
      useDefaultRenderLoop: true,
    })
  );
  viewer._cesiumWidget._creditContainer.style.display = 'none';

  if (FeatureDetection.supportsImageRenderingPixelated()) {
    viewer.resolutionScale = window.devicePixelRatio;
  }
  //Cesium配置
  viewer.scene.postProcessStages.fxaa.enabled = true;
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
    ScreenSpaceEventType.LEFT_DOUBLE_CLICK
  );
  viewer.scene.globe.showGroundAtmosphere = false;
  viewer.scene.skyBox.show = false;
  viewer.scene.sun.show = false;
  viewer.scene.moon.show = false;
  //viewer.scene.debugShowFramesPerSecond = true; //显示帧率
  viewer.camera.percentageChanged = 0.05;
  viewer.scene.globe.baseColor = Color.fromCssColorString('#546a53');
  return viewer;
}

/*销毁cesium地球*/
function destroyViewer() {
  viewer.destroy();
  viewer = null;
}

const eventHandler = new ScreenSpaceEventHandler(createViewer().scene.canvas);

export { createViewer, destroyViewer, terrainProvider, eventHandler };
