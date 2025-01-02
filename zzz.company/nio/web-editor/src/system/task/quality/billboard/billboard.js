import {LayerEvent} from '../../../../event/index.js';
import {BillboardCollection, Cartesian2, Cartesian3, defined} from 'cesium';
import QualityTag from '../tag/QualityTag.js';
import {eventController} from '../../../../event/eventController.js';
import {createViewer} from '../../../../cesium/initMap.js';
import {nioCamera} from '../../../../utils/utils.js';
import QualityModelBillboard from './QualityModelBillboard.js';
import {changeQualityProperty, qualityProperty} from '../property/property.js';
import {markRaw, reactive} from 'vue';
import store from '../../../../store/index.js';
import {PopupData} from '../../../../event/popup.js';
import {taskData, TaskStage} from '../../taskList/taskList.js';

const viewer = createViewer();
export const qualityBillboard = reactive(new QualityModelBillboard());

/** @type{BillboardCollection} */
let billboards = null;
/** @type{Billboard} */
let hoverTag = null;

function removeBillBoard(billBoard) {
  if (defined(billBoard)) {
    billboards.remove(billBoard);
  }
}

function createBillBoard(show, position, id) {
  return {
    id: id ?? null,
    image: '/img/quality.png',
    show: show,
    position: position ?? Cartesian3.fromDegrees(0, 0, 0),
    width: 30,
    height: 30,
    pixelOffset: new Cartesian2(0, -15),
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  };
}

export const billBoardAnimate = (function eventInit() {
  const qualityEvent = new LayerEvent();
  let curQualityTag = null;

  const animateHandler = {
    mousePosition: new Cartesian3(),
    onLeftClick(ev) {
      animateHandler.saveMousePos(ev.position);
      if (curQualityTag) {
        animateHandler.saveQuality();
      } else {
        let newQualityTag = animateHandler.createQuality();
        changeQualityProperty(newQualityTag);
      }
      changeAllowPutTag(false);
    },
    onMouseMove(movement) {
      animateHandler.saveMousePos(movement.endPosition);
      hoverTag.position = animateHandler.mousePosition;
    },
    onRightClick() {
      changeAllowPutTag(false);
    },
    saveMousePos(pos) {
      viewer.camera.pickEllipsoid(pos, viewer.scene.globe.ellipsoid, animateHandler.mousePosition);
    },
    createQuality() {
      const qualityTag = new QualityTag(
        animateHandler.mousePosition.clone(),
        store.state.userInfo.realName,
        taskData.runningTask.oddBranchName,
      );
      taskData.runningTask.addQualityTag(qualityTag);
      return qualityTag;
    },
    saveQuality() {
      curQualityTag.billBoard.position = animateHandler.mousePosition.clone();
      curQualityTag.position = animateHandler.mousePosition.clone();
    },
  };

  qualityEvent.add('MOUSE_MOVE', animateHandler.onMouseMove);
  qualityEvent.add('LEFT_CLICK', animateHandler.onLeftClick);
  qualityEvent.add('RIGHT_CLICK', animateHandler.onRightClick);
  return {
    start(qualityTag) {
      if (qualityTag) {
        qualityTag.billBoard.show = false;
        curQualityTag = qualityTag;
        hoverTag.position = qualityTag.billBoard.position.clone();
      }
      hoverTag.show = true;
      viewer._container.style.cursor = 'pointer';
      eventController.stopAll();
      qualityEvent.startAll();
      viewer.scene.requestRender();
    },
    stop() {
      if (curQualityTag) {
        curQualityTag.billBoard.show = true;
        curQualityTag = null;
      }
      hoverTag.show = false;
      viewer._container.style.cursor = 'auto';
      eventController.startAll();
      let pos = viewer.camera.pickEllipsoid(new Cartesian2(-100, -100));
      if (pos !== undefined) {
        hoverTag.position = pos;
      }
      qualityEvent.stopAll();
      viewer.scene.requestRender();
    },
  };
})();

export function changeAllowPutTag(allowPutTag, qualityTag = null) {
  qualityBillboard.allowPutTag = allowPutTag;
  if (allowPutTag) {
    nioCamera.lockCamera();
    billBoardAnimate.start(qualityTag);
  } else {
    nioCamera.unLockCamera();
    billBoardAnimate.stop();
  }
}

export function qualityTagClickHandler(target) {
  if (qualityProperty.qualityTag === target) {
    changeQualityProperty(null);
  } else {
    changeQualityProperty(target);
  }
}

export function qualityTagRightClickHandler(pos, target) {
  if (taskData.taskStage === TaskStage.QUALITY_CHECK) {
    let meta = markRaw({
      qualityTag: target,
    });
    store.commit('setPopup', new PopupData(true, pos, 'QUALITY', meta));
  }
}

export function deleteQualityTagHandler(qualityTag) {
  let curTask = taskData.runningTask;
  curTask.removeQualityTag(qualityTag);
  removeBillBoard(qualityTag.billBoard);
  if (qualityProperty.qualityTag === qualityTag) {
    changeQualityProperty(null);
  }
}

export function createBillBoardHandler(show, position, id) {
  return markRaw(billboards.add(createBillBoard(show, position, id)));
}

export function initBillboards() {
  billboards = viewer.scene.primitives.add(new BillboardCollection());
  hoverTag = createBillBoardHandler(false);
}

export function destroyBillboards() {
  viewer.scene.primitives.remove(billboards);
  billboards = null;
  hoverTag = null;
}
