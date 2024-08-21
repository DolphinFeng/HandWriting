/*
 * @Description: 周视图事件块
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-05-29 14:30:44
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2021-03-29 11:24:14
 * @FilePath: /scheduleweb/src/pages/newWeekly/CalendarTable/pureShowComponents/ShowEvent/index.tsx
 */

import React, { Component } from 'react';
import dayjs from 'dayjs';
import { IEventItem } from '../../interface';
import './index.less';

interface IPropsType {
  event: IEventItem;
}

/**
 * 纯查看事件组
 */
export default class ShowEvent extends Component<IPropsType> {
  // 计算非全天日程块样式
  computedCss = (event: IEventItem) => {
    const { backwardCoord } = event; // the left side if LTR. the right side if RTL. floating-point
    let { forwardCoord } = event; // the right side if LTR. the left side if RTL. floating-point
    let left; // amount of space from left edge, a fraction of the total width
    let right; // amount of space from right edge, a fraction of the total width

    const shouldOverlap = true;
    const isRtl = false;
    if (shouldOverlap) {
      // double the width, but don't go beyond the maximum forward coordinate (1.0)
      forwardCoord = Math.min(
        1,
        backwardCoord + (forwardCoord - backwardCoord) * 2
      );
    }

    if (isRtl) {
      left = 1 - forwardCoord;
      right = backwardCoord;
    } else {
      left = backwardCoord;
      right = 1 - forwardCoord;
    }

    const props = {
      zIndex: event.level + 1, // convert from 0-base to 1-based
      left: `${left * 100}%`,
      right: `${right * 100}%`,
      top: event.top - 1,
      bottom: -event.bottom + 3
    };

    if (shouldOverlap && event.forwardPressure) {
      // add padding to the edge so that forward stacked events don't cover the resizer's icon
      props[isRtl ? 'marginLeft' : 'marginRight'] = 10; // 10 is a guesstimate of the icon's width
    }

    return { ...props };
  };

  // 非全天日程块处理
  unAllDayRender = () => {
    const { event } = this.props;
    const {
      level, title, start, end, color
    } = event || {};
    const positionCss = this.computedCss(event);
    const { bottom, top } = positionCss;
    const height = Math.abs(bottom) - top;
    const lineHeight = height < 17 ? '12px' : '17px';
    const paddingTop = height < 17 ? 0 : 4;
    const lines = Math.floor(height / 17) === 0 ? 1 : Math.floor(height / 17);
    const parentHeight = height < 17 ? height : (lines > 2 ? lines - 1 : 1) * 17;
    const endBuffer = dayjs(end).format('HH:mm') === '00:00'
      ? '24:00'
      : dayjs(end).format('HH:mm');
    const timeBuffer = `${dayjs(start).format('HH:mm')} - ${endBuffer}`;

    return (
      <div
        style={{
          ...positionCss,
          paddingTop,
          background: color.backgroundColor
        }}
        title={`${timeBuffer} ${title}`}
        className={`wk-event-item${level > 0 ? ' wk-event-item-inset' : ''}`}
      >
        {lines > 1 && (
          <p
            style={{ color: color.fontColor }}
            className={'wk-event-time'}
          >{`${timeBuffer}`}</p>
        )}
        <div
          style={{ height: parentHeight, overflow: 'hidden', minHeight: 11 }}
        >
          <p
            style={
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              {
                lineHeight,
                color: color.fontColor
              } as React.CSSProperties
            }
          >
            {/* 防止截断低于行高不显示文字 */}
            {height < 13 ? '' : title}
          </p>
        </div>
      </div>
    );
  };

  render() {
    return <>{this.unAllDayRender()}</>;
  }
}
