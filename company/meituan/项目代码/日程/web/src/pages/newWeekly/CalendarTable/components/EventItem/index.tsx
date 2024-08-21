/*
 * @Description: 周视图事件块
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-05-29 14:30:44
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2021-01-12 19:35:43
 * @FilePath: /scheduleweb/src/pages/newWeekly/CalendarTable/components/EventItem/index.tsx
 */

import React, { Component } from 'react';
import dayjs from 'dayjs';
import { Popover } from '@ss/mtd-react';
import { Placement } from '@ss/mtd-react/types/base';
import { DetailPopContent } from '@/components';

import { IEventItem } from '../../interface';
import './index.less';

interface IPropsType {
  event: IEventItem;
  onChangeSelectEvent?: Function;
  checkPopItemShow?: Function;
  selectObj?: any;
  isAllDay?: boolean;
}

/**
 * 周视图事件组
 */
export default class EventItem extends Component<IPropsType> {
  popPlacement: Placement = 'rightTop';

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

  eventClick = (e) => {
    e.stopPropagation();
    if (document.documentElement && document.documentElement.clientHeight) {
      const { top, bottom } = e.currentTarget.getBoundingClientRect();

      if (document.documentElement.clientHeight - bottom >= top) {
        this.popPlacement = 'rightTop';
      } else {
        this.popPlacement = 'rightBottom';
      }
    }
    const {
      onChangeSelectEvent,
      event: { id, ownerId }
    } = this.props;
    onChangeSelectEvent && onChangeSelectEvent(id, ownerId);
  };

  // 判断是否被选中
  checkVisable = (): boolean => {
    const {
      checkPopItemShow,
      event: { id, ownerId }
    } = this.props;
    if (checkPopItemShow && id && ownerId) {
      return checkPopItemShow(id, ownerId);
    }
    return false;
  };

  // 全天日程块处理
  allDayRender = (visible: boolean) => {
    const { event } = this.props;
    const {
      allDayLength, allDayTopIndex, color, title, isAllDay, start
    } = event || {};
    return (
      <div
        className="wk-allday-event-item"
        onClick={this.eventClick}
        style={{
          top: allDayTopIndex * 20,
          width: `calc(${allDayLength * 100}% - ${10 - allDayLength}px)`, // 右边空白留10 注意边框的处理
          background: visible ? color.focusColor : color.backgroundColor
        }}
        title={title}
      >
        <p
          style={
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            {
              color: color.fontColor
            } as React.CSSProperties
          }
        >
          {`${isAllDay ? '' : `${dayjs(start).format('HH:mm')} `}${title}`}
        </p>
      </div>
    );
  };

  // 非全天日程块处理
  unAllDayRender = (visible: boolean) => {
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
    const timeBuffer = `${dayjs(start).format('HH:mm')} - ${dayjs(end).format(
      'HH:mm'
    )}`;

    return (
      <div
        style={{
          ...positionCss,
          paddingTop,
          background: visible ? color.focusColor : color.backgroundColor,
          ...(visible ? { zIndex: 100 } : {})
        }}
        title={`${timeBuffer} ${title}`}
        className={`wk-event-item${level > 0 ? ' wk-event-item-inset' : ''}`}
        onClick={this.eventClick}
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
            {title}
          </p>
        </div>
      </div>
    );
  };


  render() {
    const { event, selectObj, isAllDay } = this.props;
    const { id, ownerId, ownerName } = event || {};
    const visible = this.checkVisable();
    let currentPopRef;

    const popCurrentForceAlign = () => {
      if (currentPopRef) {
        currentPopRef.forceAlign();
      }
    };

    const text = (
      <DetailPopContent
        ownerName={ownerName}
        forceAlignCb={popCurrentForceAlign}
        {...selectObj}
      />
    );

    return (
      <Popover
        key={`${id}_${ownerId}`}
        placement={this.popPlacement}
        autoDestory
        className="detailPop"
        content={text}
        trigger="click"
        visible={visible}
        ref={(ref) => {
          currentPopRef = ref;
        }}
      >
        {isAllDay ? this.allDayRender(visible) : this.unAllDayRender(visible)}
      </Popover>
    );
  }
}
