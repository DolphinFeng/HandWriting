import {Cartesian2, Cartesian3, defined} from 'cesium';
import store from '../store/index.js';
import {createViewer} from '../cesium/initMap.js';
import {getHdSpecKeyByValue} from '../system/layer/layerController.js';
import {omit} from 'lodash';

const viewer = createViewer();

export const popupInfoBox = {
  position: new Cartesian3(),
  scratch: new Cartesian2(),
  open(feature, winPos) {
    let obj = {};
    let keys = feature.getPropertyIds();

    for (let i = 0; i < keys.length; i++) {
      obj[keys[i]] = feature.getProperty(keys[i]);
    }

    let type = feature.getProperty('type');
    let hdKey = getHdSpecKeyByValue(type);
    let title = '道路属性';
    if (type == 'l') {
      title = '车道属性';
    } else if (type == 'lb') {
      title = '车道线属性';
    } else if (type == 'sdl') {
      title = 'SDLink属性';
    } else if (hdKey) {
      title = hdKey;
    } else if (!type) {
      title = '属性';
    } else if (type !== 'r') {
      title = '动态图层属性'; //是动态图层

      //根据is_link字段决定
      if (obj['is_link'] == 1) {
        obj = omit(obj, ['is_link', 'lane_id']);
      } else if (obj['is_link'] == 0) {
        obj = omit(obj, ['is_link', 'link_id']);
      }
    }

    //如果是NAD白名单图层
    if (
      feature.tileset !== undefined &&
      feature.tileset.customUri !== undefined &&
      feature.tileset.customUri.endsWith('nad')
    ) {
      title = 'NAD白名单';
    }

    store.commit('infoBox/turnInfoBox', {
      show: true,
      data: obj,
      title: title,
    });
    popupInfoBox.position = viewer.camera.pickEllipsoid(winPos, viewer.scene.globe.ellipsoid);
    viewer.scene.preRender.addEventListener(popupInfoBox.popupListener);
    viewer.scene.requestRender();
  },
  openIssue(obj, winPos) {
    store.commit('infoBox/turnInfoBox', {
      show: true,
      data: obj,
      title: 'ISSUE 信息',
    });
    popupInfoBox.position = viewer.camera.pickEllipsoid(winPos, viewer.scene.globe.ellipsoid);
    viewer.scene.preRender.addEventListener(popupInfoBox.popupListener);
    viewer.scene.requestRender();
  },
  close() {
    store.commit('infoBox/turnInfoBox', {show: false});
    viewer.scene.preRender.removeEventListener(popupInfoBox.popupListener);
  },
  popupListener() {
    popupInfoBox.popup(popupInfoBox.position, popupInfoBox.scratch, document.getElementById('tooltip-view'));
  },
  popup(position, scratch, htmlOverlay) {
    let canvasPosition = viewer.scene.cartesianToCanvasCoordinates(position, scratch);
    if (defined(canvasPosition)) {
      htmlOverlay.style.top = canvasPosition.y - htmlOverlay.offsetHeight + 'px';
      htmlOverlay.style.left = canvasPosition.x - htmlOverlay.offsetWidth / 2 + 'px';
    }
  },
};
