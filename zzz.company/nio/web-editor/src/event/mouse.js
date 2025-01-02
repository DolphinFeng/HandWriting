import {Observer} from '../js/observer.js';
import {Cartesian2, Cartesian3} from 'cesium';
import {getTileLevel} from '../utils/utils.js';
import {createViewer} from '../cesium/initMap.js';
import {oddLayer} from '../system/odd/oddLayer.js';
import {loadingSourceOddHandler} from '../system/odd/loading/loadingOddData.js';
import {loadingNadTileHandler} from '../system/nad/loadingNadData.ts';

const viewer = createViewer();
//在body上通过观察者注册事件
document.body.addEventListener('click', (ev) => {
  if (ev.shiftKey) {
    Observer.fire('click', {shift: true});
  } else if (ev.ctrlKey) {
    Observer.fire('click', {ctrl: true});
  }
  Observer.fire('click', {
    ctrl: ev.ctrlKey,
    shift: ev.shiftKey,
    alt: ev.altKey,
    default: !(ev.ctrlKey || ev.shiftKey || ev.altKey),
    ev: ev,
  });
});

export function wheelCallback() {
  loadingSourceOddHandler(false);
  loadingNadTileHandler(false);
  let width = document.body.clientWidth,
    height = document.body.clientHeight;
  let pos = viewer.camera.pickEllipsoid(new Cartesian2(width / 2, height / 2), viewer.scene.globe.ellipsoid);
  //3d模式下可能会出现pos为undefined的情况
  if (!pos) {
    return;
  }
  let pos2 = viewer.camera.position;
  let distance = Cartesian3.distance(pos, pos2);
  Observer.fire('tileScale', {
    distance: distance,
    tile: getTileLevel(),
  });
}
