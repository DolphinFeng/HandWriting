import {createStore} from 'vuex';
import {imageryProvider} from '../cesium/imagery/imageryProvider.js';
import {createViewer} from '../cesium/initMap.js';
import {Cartesian2, Cartographic, Color, Math as CMath} from 'cesium';
import {AroundPoint} from '../animate/aroundPoint.js';
import {PopupData} from '../event/popup.js';
import {version} from './version.js';
import {infoBox} from './infoBox.js';
import {watch} from 'vue';
import {switchHdMapVersion} from '../system/layer/tileLayer/tileLayerController.js';
import {clearOddData} from '../system/odd/saveOdd/saveOdd.js';
import {userInfo} from './userInfo.js';
import {issueStore} from './issue.ts';
import {Observer} from '../js/observer.js';
import {loadingSourceOddHandler} from '../system/odd/loading/loadingOddData.js';
import {requestTaskWork} from '../system/task/taskList/startTask.js';
import {OddTask, taskData} from '../system/task/taskList/taskList.js';
import {clearQualityData} from '../system/task/quality/refreshQualityData.js';
import {clearIssueData} from '../system/issue/layer.ts';
import {loadingIssueHandler} from '../system/issue/loadingIssueData.ts';
import {loadingNadTileHandler} from '../system/nad/loadingNadData.ts';
import {clearNadTileData} from '../system/nad/nadTileLayer.ts';
import {resetGridTileLayer} from '../cesium/imagery/tile-grid-provider.js';
import {setHdOptionExp} from '../../src/views/map/layer/BaseMapConditionPanel.ts';
import {layerListItems} from '../../src/system/layer/layerController.js';
import {roadLayer, laneLayer, laneBoundaryLayer, sdLinkLayer} from '../system/layer/tileLayer/tileLayerController.js';

let escHandler = null;

const store = createStore({
  state() {
    return {
      infoBoxOpen: false, //infoBox开关
      sceneMode: '2D',
      map: localStorage.getItem('map') ?? '高德影像', //当前底图
      mapShow: true, //是否显示影像底图
      maxZIndex: 30, //当前最大zIndex层级
      popup: new PopupData(false),
    };
  },
  getters: {},
  mutations: {
    //infoBox开关
    turnInfoBox(state, open) {
      if (state.infoBoxOpen === open) return;
      state.infoBoxOpen = open;
      if (open === true) {
        document.removeEventListener('keyup', escHandler);
        escHandler = function (ev) {
          if (ev.key === 'Escape') {
            state.infoBoxOpen = false;
          }
        };
        document.addEventListener('keyup', escHandler);
      } else {
        document.removeEventListener('keyup', escHandler);
      }
    },
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
    //修改3维/2维
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
    /**
     * 设置弹窗
     * @param state
     * @param popupData{PopupData}
     */
    setPopup(state, popupData) {
      Object.assign(state.popup, popupData);
    },
  },
  actions: {},
  modules: {
    version,
    infoBox,
    userInfo,
    issue: issueStore,
  },
});

//监听版本变化
watch(
  () => store.state.version.curVersion,
  (newVal, oldVal) => {
    //如果新版本值为Symbol类型，表示是在重置版本，不做处理
    if (newVal !== oldVal && typeof newVal !== 'string') {
      //切换底图版本
      switchHdMapVersion(newVal);
      //清空所有odd缓存
      clearOddData();
      //清空质检标
      clearQualityData();
      //加载新的odd
      loadingSourceOddHandler(true);
      //清空NAD图幅框
      clearNadTileData();
      //加载NAD图幅框
      loadingNadTileHandler(true);
      //清空Issue数据
      clearIssueData();
      //加载新的Issue数据
      loadingIssueHandler(true);
      //加载新当前版本作业库

      if (layerListItems.items[3].show) {
        setHdOptionExp(sdLinkLayer);
      }

      if (layerListItems.items[2].show) {
        setHdOptionExp(roadLayer);
      }

      if (layerListItems.items[1].show) {
        setHdOptionExp(laneLayer);
      }

      if (layerListItems.items[0].show) {
        setHdOptionExp(laneBoundaryLayer);
      }

      if (
        taskData.runningTask instanceof OddTask &&
        taskData.runningTask.mapVersion === store.state.version.curVersion.toString()
      ) {
        requestTaskWork(taskData.runningTask);
      }
      //刷新批次列表
      Observer.fire('batchUpdate', {});
    }
  },
);

//判断当前底图数据版本是不是psp
export function isPspVersion() {
  if (store.state.version.curVersion == '') {
    return false;
  }

  for (let tmp of store.state.version.versionsService) {
    if (store.state.version.curVersion == tmp) {
      return true;
    }
  }

  return false;
}

export default store;
