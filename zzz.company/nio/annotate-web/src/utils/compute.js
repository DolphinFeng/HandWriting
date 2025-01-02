import { createViewer } from '../cesium/create-viewer.js';
import {
  Cartesian2,
  Cartesian3,
  Cartographic,
  Cesium3DTileFeature,
  Math as CMath,
} from 'cesium';
import { NioMessage } from './utils.js';

const viewer = createViewer();

/**
 * 节流
 * @param fn 回调函数
 * @param delay 延迟
 * @returns {(function(): void)|*}
 */
export function throttle(fn, delay = 200) {
  let timer = null;
  return function () {
    if (timer) return;
    fn.apply(this, arguments);
    timer = setTimeout(() => {
      timer = null;
    }, delay);
  };
}

/**
 * 防抖
 * @param fn 回调函数
 * @param delay 延迟
 * @returns {(function(): void)|*}
 */
export function debounce(fn, delay = 200) {
  let timer = null;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, arguments);
    }, delay);
  };
}

/**
 * 登录祝语
 * @returns {string}
 */
export function formatDate() {
  let hour = new Date().getHours();
  if (hour < 6) return '凌晨好';
  else if (hour < 9) return '早上好';
  else if (hour < 12) return '上午好';
  else if (hour < 14) return '中午好';
  else if (hour < 17) return '下午好';
  else if (hour < 19) return '傍晚好';
  else if (hour < 22) return '晚上好';
  else return '夜里好';
}

/**
 * 判断一个对象是否是空对象
 * @param obj{Object}
 * @return{Boolean}
 */
export function isNullObject(obj) {
  for (let key in obj) {
    return false;
  }
  return true;
}

/**
 * 对象浅拷贝
 * @param obj
 */
export function shallowCopy(obj) {
  let res = {};
  for (const key in obj) {
    res[key] = obj[key];
  }
  return res;
}

/**
 * 保存用户当前相机位置
 */
export function saveUserPos() {
  let position = viewer.camera.position;
  let str = `${position.x},${position.y},${position.z}`;
  localStorage.setItem('curPos', str);
  return str;
}

/**
 * 获取当前存储的相机位置
 */
export function getUserPos() {
  let pos = localStorage.getItem('curPos');
  if (pos) {
    pos = pos.split(',');
    return new Cartesian3(
      parseFloat(pos[0]),
      parseFloat(pos[1]),
      parseFloat(pos[2])
    );
  } else {
    //给予用户一个默认位置
    return Cartesian3.fromDegrees(121.33254978457335, 30.875895191533388, 500);
  }
}

/**
 * 查询范围内的cesium对象
 * @param stPos{Cartesian2}
 * @param edPos{Cartesian2}
 * @returns {any[]|null}
 */
export function searchDrillPicks(stPos, edPos) {
  let winPos = new Cartesian2((edPos.x + stPos.x) / 2, (edPos.y + stPos.y) / 2);
  let width = Math.abs(edPos.x - stPos.x),
    height = Math.abs(edPos.y - stPos.y);
  if (width > 800 || height > 800) {
    NioMessage('warning', '选择范围应小于800×800像素', 2000);
    return null;
  }
  if (Math.round(width) === 0 || Math.round(height) === 0) {
    return null;
  }
  return viewer.scene.drillPick(
    winPos,
    1000,
    Math.round(width) * 2,
    Math.round(height) * 2
  );
}

/**
 * 计算屏幕上一点的经纬度，度数或弧度表示，左上角出发
 * @param x 水平坐标
 * @param y 垂直坐标
 * @param type{'degrees'|'radians'}度数or弧度
 * @return {Cartographic}
 */
export function getScreenPoint(x, y, type = 'degrees') {
  let pos = viewer.camera.pickEllipsoid(
    new Cartesian2(x, y),
    viewer.scene.globe.ellipsoid
  );
  let cartographic = Cartographic.fromCartesian(pos);
  cartographic.height = 0;
  if (type === 'degrees') {
    cartographic.longitude = CMath.toDegrees(cartographic.longitude);
    cartographic.latitude = CMath.toDegrees(cartographic.latitude);
  }
  return cartographic;
}

/**
 * 生成32位的uuid
 * @return {string}
 */
export function getUuid32() {
  const s = [];
  const hexDigits = '0123456789abcdef';
  for (let i = 0; i < 32; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4';
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
  s[8] = s[13] = s[18] = s[23];
  return s.join('');
}
