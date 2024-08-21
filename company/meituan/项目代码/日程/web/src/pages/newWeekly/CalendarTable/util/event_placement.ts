/*
 * @Description: 事件布局
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-10-30 15:21:07
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-12-28 15:51:12
 * @FilePath: /scheduleweb/src/pages/newWeekly/CalendarTable/util/event_placement.ts
 */

import dayjs from 'dayjs';
import { HOUR_HEIGHT } from '../const';
import { compareByFieldSpecs } from './misc';
import { IEventItem } from '../interface';
import { buildSegCompareObj } from './event_rendering';

const ORDERSPECS = [
  { field: 'start', order: 1 },
  { field: 'duration', order: -1 },
  { field: 'title', order: 1 }
];

// 2个事件块是否重叠
function isSlotSegCollision(seg1, seg2) {
  return seg1.bottom > seg2.top && seg1.top < seg2.bottom;
}

function computeSlotSegCollisions(seg, otherSegs, results = []) {
  for (let i = 0; i < otherSegs.length; i++) {
    if (isSlotSegCollision(seg, otherSegs[i])) {
      results.push(otherSegs[i]);
    }
  }

  return results;
}

// 计算子层级中和指定节点有重叠的元素，放到forwardSegs字段中
function computeForwardSlotSegs(levels) {
  let i;
  let level;
  let j;
  let seg;
  let k;

  for (i = 0; i < levels.length; i++) {
    level = levels[i];

    for (j = 0; j < level.length; j++) {
      seg = level[j];

      seg.forwardSegs = [];
      for (k = i + 1; k < levels.length; k++) {
        computeSlotSegCollisions(seg, levels[k], seg.forwardSegs);
      }
    }
  }
}

// 计算事件块后面的跟随的层级 forwardPressure
function computeSlotSegPressures(seg) {
  const { forwardSegs } = seg;
  let forwardPressure = 0;
  let i;
  let forwardSeg;

  if (seg.forwardPressure == null) {
    // not already computed

    for (i = 0; i < forwardSegs.length; i++) {
      forwardSeg = forwardSegs[i];

      // 递归子元素的层级
      computeSlotSegPressures(forwardSeg);

      // 子元素就一层
      forwardPressure = Math.max(
        forwardPressure,
        1 + forwardSeg.forwardPressure
      );
    }

    seg.forwardPressure = forwardPressure;
  }
}

function buildTimeGridSegCompareObj(seg): any {
  const obj = buildSegCompareObj(seg) as any;

  obj.forwardPressure = seg.forwardPressure;
  obj.backwardCoord = seg.backwardCoord;

  return obj;
}

// 按照优先级对日程块排序
function sortForwardSegs(forwardSegs, eventOrderSpecs) {
  const objs = forwardSegs.map(buildTimeGridSegCompareObj);

  const specs = [
    // put higher-pressure first
    { field: 'forwardPressure', order: -1 },
    // put segments that are closer to initial edge first (and favor ones with no coords yet)
    { field: 'backwardCoord', order: 1 }
  ].concat(eventOrderSpecs);

  objs.sort((obj0, obj1) => {
    return compareByFieldSpecs(obj0, obj1, specs);
  });

  return objs.map((c) => {
    return c._seg;
  });
}

// 计算出每个事件块的左边和右边的位置
function computeSegForwardBack(
  seg,
  seriesBackwardPressure,
  seriesBackwardCoord,
  eventOrderSpecs
) {
  const { forwardSegs } = seg;
  let i;

  if (seg.forwardCoord == null) {
    if (!forwardSegs.length) {
      // 已经计算过 防止重新计算
      seg.forwardCoord = 1;
    } else {
      // 找到层级最高的字链路
      sortForwardSegs(forwardSegs, eventOrderSpecs);

      // 如果该元素有子元素 先获取子元素的左右位置 该元素的最右位置为子元素的最左位置
      computeSegForwardBack(
        forwardSegs[0],
        seriesBackwardPressure + 1,
        seriesBackwardCoord,
        eventOrderSpecs
      );
      seg.forwardCoord = forwardSegs[0].backwardCoord;
    }

    // 最左和最右空间出来了，通过右计算左
    seg.backwardCoord = seg.forwardCoord
      - (seg.forwardCoord - seriesBackwardCoord) // available width for series
        / (seriesBackwardPressure + 1); // # of segments in the series

    // 把该元素的所有子元素变量处理一遍
    for (i = 0; i < forwardSegs.length; i++) {
      computeSegForwardBack(
        forwardSegs[i],
        0,
        seg.forwardCoord,
        eventOrderSpecs
      );
    }
  }
}

// 设置所有元素的level
// 最贴近左边的是level 0
// 隔一个元素的是 level 1
// 隔二个元素的是 level 2
function buildSlotSegLevels(segs) {
  const levels = [];
  let i;
  let seg;
  let j;

  for (i = 0; i < segs.length; i++) {
    seg = segs[i];

    // 轮询所有level 找到第一个与所有元素都不重叠的level 塞到该level
    // 找到与
    for (j = 0; j < levels.length; j++) {
      if (!computeSlotSegCollisions(seg, levels[j]).length) {
        break;
      }
    }

    seg.level = j;
    (levels[j] || (levels[j] = [])).push(seg);
  }

  return levels;
}

export function computeSegHorizontals(segs) {
  for (const seg of segs) {
    seg.level = null;
    seg.forwardCoord = null;
    seg.backwardCoord = null;
    seg.forwardPressure = null;
  }

  segs = sortForwardSegs(segs, ORDERSPECS);
  let level0;
  // 计算 top bottom
  // 排序
  const levels = buildSlotSegLevels(segs);
  computeForwardSlotSegs(levels);
  // eslint-disable-next-line
  if ((level0 = levels[0])) {
    for (const seg of level0) {
      computeSlotSegPressures(seg);
    }
    for (const seg of level0) {
      computeSegForwardBack(seg, 0, 0, ORDERSPECS);
    }
  }
}

export function computeDateTop(target: number, startDate: Date): number {
  const targeTime = dayjs(target);
  let hour = targeTime.hour();
  let minute = targeTime.minute();
  // 如果日期不是今天，小于今天就从0开始，大于今天就是24点结束
  if (!dayjs(target).isSame(dayjs(startDate), 'days')) {
    if (dayjs(target) < dayjs(startDate)) {
      hour = 0;
      minute = 0;
    } else {
      hour = 24;
      minute = 0;
    }
  }

  const totalMinute = (hour * 60 + minute) * (HOUR_HEIGHT / 60);
  return Math.floor(totalMinute);
}

// events: IEventItem[];
// targetDate: Date;
// For each segment in an array, computes and assigns its top and bottom properties
export function computeSegVerticals(
  segs: IEventItem[],
  dayDate: Date,
  eventMinHeight = 0
) {
  for (const seg of segs) {
    seg.top = computeDateTop(seg.start, dayDate);
    seg.bottom = Math.max(
      seg.top + (eventMinHeight || 0), // yuck
      computeDateTop(seg.end, dayDate)
    );
  }
}

export function computeSegCoords(segs, dayDate: Date) {
  computeSegVerticals(segs, dayDate);
  return computeSegHorizontals(segs); // requires top/bottom from computeSegVerticals
}
