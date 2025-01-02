import {eventHandler, createViewer} from '../cesium/create-viewer.js';
import {ScreenSpaceEventType, KeyboardEventModifier} from 'cesium';
import {decodeCesiumId} from '../utils/utils.js';

export const rightClickCallbacks = new Map();
export const leftDownCallbacks = new Map();
export const leftUpCallbacks = new Map();
export const wheelCallbacks = new Map();
export const mouseMoveCallbacks = new Map();
export const altRightClickCallbacks = new Map();
export const leftClickCallbacks = new Map();
export const cesiumObjClickCallbacks = new Map();

const rightClickAction = function (event) {
  for (let rightClickCallback of rightClickCallbacks.values()) {
    rightClickCallback(event);
  }
};

//记录上次选中索引，当有重叠在一起的多个要素时，多次点击同一位置，会被依次选中
let lastClickedFeatureIndex = 0;
const leftClickAction = function (event) {
  let viewer = createViewer();
  let picks = viewer.scene.drillPick(event.position);

  if (lastClickedFeatureIndex >= picks.length || lastClickedFeatureIndex < 0) {
    lastClickedFeatureIndex = 0;
  }

  if (picks.length != 0 && picks[lastClickedFeatureIndex].id) {
    let decodedId = decodeCesiumId(picks[lastClickedFeatureIndex].id);
    if (decodedId) {
      for (let callback of cesiumObjClickCallbacks.values()) {
        callback(decodedId);
      }

      //目前只有质检标轮流多选
      if (decodedId.typeName == 'billboard') lastClickedFeatureIndex++;
    }
  }

  for (let leftClickCallback of leftClickCallbacks.values()) {
    leftClickCallback(event);
  }
};

const leftDownAction = function (event) {
  for (let leftDownCallback of leftDownCallbacks.values()) {
    leftDownCallback(event);
  }
};

const leftUpAction = function (event) {
  for (let callback of leftUpCallbacks.values()) {
    callback(event);
  }
};

const wheelAction = function (event) {
  for (let wheelCallback of wheelCallbacks.values()) {
    wheelCallback(event);
  }
};

const mouseMoveAction = function (event) {
  for (let mouseMoveCallback of mouseMoveCallbacks.values()) {
    mouseMoveCallback(event);
  }
};

const altRightClickAction = function (event) {
  for (let callback of altRightClickCallbacks.values()) {
    callback(event);
  }
};

export function createInputAction() {
  eventHandler.setInputAction(rightClickAction, ScreenSpaceEventType.RIGHT_CLICK);

  eventHandler.setInputAction(altRightClickAction, ScreenSpaceEventType.RIGHT_CLICK, KeyboardEventModifier.ALT);

  eventHandler.setInputAction(leftClickAction, ScreenSpaceEventType.LEFT_CLICK);
  eventHandler.setInputAction(leftDownAction, ScreenSpaceEventType.LEFT_DOWN);
  eventHandler.setInputAction(leftUpAction, ScreenSpaceEventType.LEFT_UP);
  eventHandler.setInputAction(wheelAction, ScreenSpaceEventType.WHEEL);
  eventHandler.setInputAction(mouseMoveAction, ScreenSpaceEventType.MOUSE_MOVE);
}
