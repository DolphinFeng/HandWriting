/*
 * @Description: 周视图天事件
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-05-29 14:30:44
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-12-02 17:10:22
 * @FilePath: /scheduleweb/src/pages/newWeekly/CalendarTable/components/WeekCol/index.tsx
 */

import dayjs from 'dayjs';
import React, { Component } from 'react';
import { HOUR_HEIGHT } from '../../const';
import { ENow, IEventItem } from '../../interface';
import { computeSegCoords } from '../../util/event_placement';
import EventItem from '../EventItem';
import './index.less';

interface IPropsType {
  events: IEventItem[];
  targetDate: Date;
  eNow: ENow;
  currentTop: number;
  colClickCb?: Function;
  onChangeSelectEvent?: Function;
  checkPopItemShow?: Function;
  selectObj?: any;
}

/**
 * 周视图事件组
 */
export default class WeekCol extends Component<IPropsType> {
  // 通过块获取时间
  getTimeFromQuotaIndex = (quotaIndex: number) => {
    const { targetDate } = this.props;
    const hour = parseInt(`${quotaIndex / 4}`, 10);
    const minute = (quotaIndex % 4) * 15;

    return dayjs(targetDate).set({
      hour,
      minute,
      second: 0,
      millisecond: 0
    });
  };

  getMouseTargetInfos = (posTop: number) => {
    const quotaIndex = parseInt(`${posTop / (HOUR_HEIGHT / 4)}`, 10);
    const startTime = this.getTimeFromQuotaIndex(quotaIndex);
    const endTime = dayjs(startTime).add(1, 'hour');
    return {
      startTime,
      endTime
    };
  };

  gridClick = (e) => {
    const { colClickCb } = this.props;
    const { top } = e.target.getBoundingClientRect();
    const { startTime, endTime } = this.getMouseTargetInfos(e.clientY - top);
    colClickCb && colClickCb(startTime.valueOf(), endTime.valueOf());
  };

  render() {
    const {
      events,
      targetDate,
      eNow,
      currentTop,
      onChangeSelectEvent,
      checkPopItemShow,
      selectObj
    } = this.props;
    if (events && events.length > 0) {
      computeSegCoords(events, targetDate);
    }
    return (
      <div
        onClick={this.gridClick}
        className={`wk-col-item${eNow === ENow.NOW ? ' current' : ''}`}
      >
        {eNow === ENow.NOW && (
          <div
            className="wk-col-current-point"
            style={{ top: currentTop - 3 }}
          />
        )}
        <div className="wk-col-events">
          {events.map((item, index) => {
            return (
              <EventItem
                onChangeSelectEvent={onChangeSelectEvent}
                checkPopItemShow={checkPopItemShow}
                selectObj={selectObj}
                event={item}
                key={index}
              />
            );
          })}
        </div>
      </div>
    );
  }
}
