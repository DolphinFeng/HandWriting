/*
 * @Description: 帮助工具函数
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-07-06 15:21:10
 * @LastEditors: huangyaowei huangyaowei@meituan.com
 * @LastEditTime: 2023-04-21 19:43:13
 * @FilePath: /scheduleweb/src/utils/helper.ts
 */

/** 会议室类型 */
export enum EquipType {
  /** 投影 */
  projection = 2,
  /** 电视 */
  tv,
  /** 视频 */
  video,
  /** Umeet */
  umeet = 6,
  /** Zoom */
  zoom,
  /** 无线投屏 */
  airplay,
  /** 腾讯会议 */
  tx,
  /** 投影仪 */
  projector = 16,
}

// 根据设备id获取设备类型
export function getEquipType(equipId) {
  switch (equipId) {
    case 2:
      return 'projection';
    case 3:
      return 'television';
    case 4:
      return 'video';
    case 6:
      return 'shixun-video';
    case 7:
      return 'zoom';
    case 8:
      return 'airplay';
    default:
      return '';
  }
}

function toNum(version) {
  const a = version.toString();
  // 也可以这样写 var c=a.split(/\./);
  const c = a.split('.');
  const numPlace = ['', '0', '00', '000', '0000'];
  const r = numPlace.reverse();
  for (let i = 0; i < c.length; i++) {
    const len = c[i].length;
    c[i] = r[len] + c[i];
  }
  const res = c.join('');
  return res;
}

export function cprVersion(a, b) {
  if (!a || !b) {
    return false;
  }
  const _a = toNum(a);
  const _b = toNum(b);
  if (_a < _b) {
    return true;
  }
  return false;
}

// 一位小数前面补0，用于时间展示
export function appendzero(num) {
  return +num < 10 ? `0${num}` : `${num}`;
}

// 用于拼接英文名
export function getEnname(name) {
  if (name) return `(${name})`;
  return '';
}
