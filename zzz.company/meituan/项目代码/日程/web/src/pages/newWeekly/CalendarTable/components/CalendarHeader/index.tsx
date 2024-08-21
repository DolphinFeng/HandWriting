/*
 * @Description: 周视图头
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-05-29 14:30:44
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-12-02 16:53:04
 * @FilePath: /scheduleweb/src/pages/newWeekly/CalendarTable/components/CalendarHeader/index.tsx
 */

import React, { Component } from 'react';
import AllDayCols from './AllDayCols';
import TimeCols from './TimeCols';
import './index.less';
import { ENow, IEventItem } from '../../interface';

interface IPropsType {
  days: Date[];
  current: Date;
  eNows: ENow[];
  attendances: string[];
  dayEvents?: IEventItem[][];
  onChangeSelectEvent?: Function; // 点击日程事件块回调
  checkPopItemShow?: Function;
  selectObj?: any;
  maxTopIndex?: number;
  colClickCb?: Function; // 点击空白区域回调
}

/**
 * 周视图头
 */
export default class CalendarHeader extends Component<IPropsType> {
  render() {
    const {
      days,
      current,
      eNows,
      attendances,
      dayEvents,
      onChangeSelectEvent,
      checkPopItemShow,
      selectObj,
      maxTopIndex,
      colClickCb
    } = this.props;

    return (
      <div className="wk-col-header">
        <TimeCols
          attendances={attendances}
          eNows={eNows}
          current={current}
          days={days}
        />
        <AllDayCols
          colClickCb={colClickCb}
          onChangeSelectEvent={onChangeSelectEvent}
          checkPopItemShow={checkPopItemShow}
          selectObj={selectObj}
          dayEvents={dayEvents}
          days={days}
          maxTopIndex={maxTopIndex}
        />
      </div>
    );
  }
}
