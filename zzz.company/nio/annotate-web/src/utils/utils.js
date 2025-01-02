import {createViewer} from '../cesium/create-viewer.js';
import {Cartesian3, defined} from 'cesium';
import {ElMessage, ElNotification} from 'element-plus';
import {NioCamera} from './camera.js';

const viewer = createViewer();

/**
 * 相机控制器
 */
export const nioCamera = new NioCamera();

/**
 * 解析WKT格式的线,返回点集
 * @param str:WKT字符串
 */
export function parseLineWKT(str) {
  str = str.slice(13, str.length - 1);
  let arr = str.split(' '),
    positions = [],
    tmp = [];
  let remain;
  if (arr.length % 3 !== 0) {
    return new Error('WKT解析错误');
  }
  for (let i = 0; i < arr.length; i++) {
    remain = (i + 1) % 3;
    if (remain === 0) {
      positions.push(new Cartesian3(tmp[0], tmp[1], arr[i]));
    } else {
      tmp[remain - 1] = arr[i];
    }
  }
  return positions;
}

/**
 * 统一弹窗信息
 * @param type 类型
 * @param title 内容
 * @param duration 持续时间
 */
export function NioMessage(type, title, duration = 3000) {
  ElMessage({
    type: type,
    message: title,
    showClose: false,
    customClass: 'high-index-message',
    grouping: true,
    offset: 48,
    duration: duration,
  });
}

/**
 * 统一通知信息
 * @param type 类型
 * @param title 标题
 * @param message 内容
 * @param duration 持续时间
 */
export function NioNotification(type, title, message = '', duration = 3000) {
  ElNotification({
    type: type,
    title: title,
    message: message,
    position: 'top-right',
    showClose: false,
    offset: 50,
    duration: duration,
  });
}

/**
 * 获取n个月前的时间
 * @param beforeMonth
 * @returns {Date}
 */
export function getMonthBefore(beforeMonth) {
  let now = new Date(),
    month = now.getMonth();
  let newMonth = month - beforeMonth;
  now.setMonth(newMonth);
  return now;
}

/**
 * 解析时间为字符串格式
 * @param date
 * @returns {string}
 */
export function parseTime(date) {
  if (!(date instanceof Date)) {
    throw new Error('解析失败');
  }
  return `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

/**
 * 查询tile级别
 * @returns {any}
 */
export function getTileLevel() {
  let tiles = new Set();
  let tilesToRender = viewer.scene.globe._surface._tilesToRender;
  if (defined(tilesToRender)) {
    for (let i = 0; i < tilesToRender.length; i++) {
      tiles.add(tilesToRender[i].level);
    }
    return Array.from(tiles)[0];
  }
}

//函数拷贝
export const copyObj = (obj = {}) => {
  //变量先置空
  let newobj = null;

  //判断是否需要继续进行递归
  if (typeof obj == 'object' && obj !== null) {
    newobj = obj instanceof Array ? [] : {}; //进行下一层递归克隆
    for (var i in obj) {
      newobj[i] = copyObj(obj[i]);
    } //如果不是对象直接赋值
  } else newobj = obj;
  return newobj;
};

export function encodeCesiumId(typeName, id, projectId) {
  if (projectId == undefined) {
    return typeName + '-' + id;
  } else {
    return typeName + '-' + id + '-' + projectId;
  }
}

export function decodeCesiumId(cesiumId) {
  if (typeof cesiumId != 'string') {
    return undefined;
  }

  let values = cesiumId.split('-');

  if (values.length == 3) {
    let typeName = values[0];
    let id = values[1];
    let projectId = values[2];
    return {typeName, id, projectId};
  } else if (values.length == 2) {
    let typeName = values[0];
    let id = values[1];
    return {typeName, id};
  }

  return undefined;
}
