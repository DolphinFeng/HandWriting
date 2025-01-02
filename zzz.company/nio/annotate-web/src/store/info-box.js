//弹框设置
import { reactive } from 'vue';
import { Cartesian2, Cartesian3, defined } from 'cesium';
import { createViewer } from '../cesium/create-viewer.js';

const viewer = createViewer();

export const infoBox = reactive({
  show: false, //弹框开关
  data: {},
  title: '',
  position: null,
});

export function openInfoBox(data, title, winPos) {
  viewer.scene.preRender.removeEventListener(updateInfoBoxPosition);
  infoBox.show = true;
  infoBox.data = data;
  infoBox.title = title;

  infoBox.position = viewer.camera.pickEllipsoid(winPos, viewer.scene.globe.ellipsoid);
  viewer.scene.preRender.addEventListener(updateInfoBoxPosition);
}

export function closeInfoBox(){
  infoBox.show = false;
  viewer.scene.preRender.removeEventListener(updateInfoBoxPosition);
}

let updateInfoBoxPosition = () => {
  let position = infoBox.position;
  let scratch = new Cartesian2();
  let canvasPosition = viewer.scene.cartesianToCanvasCoordinates(position, scratch);
  if (defined(canvasPosition)) {
    let htmlOverlay = document.getElementById('tooltip-view');
    htmlOverlay.style.top = canvasPosition.y - htmlOverlay.offsetHeight + 'px';
    htmlOverlay.style.left = canvasPosition.x - htmlOverlay.offsetWidth / 2 + 'px';
  }
};
