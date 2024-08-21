/*
 * @Description: 文件描述
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-10-30 17:43:48
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-11-19 20:51:25
 * @FilePath: /scheduleweb/src/pages/newWeekly/CalendarTable/util/event_rendering.ts
 */

// 构造用来比较的结构体
export function buildSegCompareObj(seg) {
  //   let { eventRange } = seg;
  //   let eventDef = eventRange.def;
  //   let range = eventRange.instance
  //     ? eventRange.instance.range
  //     : eventRange.range;
  //   let start = range.start ? range.start.valueOf() : 0; // TODO: better support for open-range events
  //   let end = range.end ? range.end.valueOf() : 0; // "
  const { start, end, title } = seg;
  return {
    // ...eventDef.extendedProps,
    // ...eventDef,
    // id: eventDef.publicId,
    start,
    end,
    title,
    duration: end - start,
    // allDay: Number(eventDef.allDay),
    _seg: seg // for later retrieval
  };
}
