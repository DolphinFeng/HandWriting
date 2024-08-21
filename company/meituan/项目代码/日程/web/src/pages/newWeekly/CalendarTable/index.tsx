/*
 * @Description: 周视图组件
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-05-29 14:30:44
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2021-01-11 15:20:45
 * @FilePath: /scheduleweb/src/pages/newWeekly/CalendarTable/index.tsx
 */

import React, { Component } from 'react';
import dayjs from 'dayjs';
import { Timeline, WeekCols, CalendarHeader } from './components';
import { splitEvents, splitFullDayEvents } from './util/utils';
import { ENow, IEventItem } from './interface';
import './index.less';
import { HOUR_HEIGHT } from './const';
import HorizeLines from './components/HorizeLines';

interface IPropsType {
  choosedDate: Date;
  weekCalendar: Date[];
  eventCalenderList: IEventItem[];
  weekTimeCurrent: ENow[];
  attendances: string[];
  currentTime: Date;
  colClickCb?: Function; // 点击空白区域回调
  onChangeSelectEvent?: Function; // 点击日程事件块回调
  checkPopItemShow?: Function;
  selectObj?: any;
}

/**
 * 周视图组件
 */
export default class CalendarTable extends Component<IPropsType> {
  weekColumnSubRef;

  // 滚动到指定位置
  scrollToTime = (hour: number, minute: number) => {
    const scrollPos = Math.floor((hour * 60 + minute) * (HOUR_HEIGHT / 60));
    this.scrollTo(scrollPos, false);
  };

  // 滚动位置
  scrollTo = (pos, nSmooth) => {
    const scrollOptions = {
      left: 0,
      top: pos,
      behavior: nSmooth ? 'smooth' : 'auto'
    };
    if (this.weekColumnSubRef) {
      // 兼容不支持scrollTo的浏览器
      if (this.weekColumnSubRef.scrollTo) {
        this.weekColumnSubRef.scrollTo(scrollOptions);
      } else {
        this.weekColumnSubRef.scrollTop = pos;
      }
    }
  };

  getCurrentTop = (currentMoment) => {
    const hour = currentMoment.hour();
    const minute = currentMoment.minute();
    return Math.floor((hour * 60 + minute) * (HOUR_HEIGHT / 60));
  };

  render() {
    const {
      props: {
        eventCalenderList,
        weekTimeCurrent,
        attendances,
        weekCalendar,
        colClickCb,
        onChangeSelectEvent,
        checkPopItemShow,
        selectObj,
        currentTime
      }
    } = this;
    const { dayEvents, fullDayEvents } = splitEvents(
      eventCalenderList,
      weekCalendar
    );
    const { maxTopIndex, allDayEvents } = splitFullDayEvents(
      fullDayEvents,
      weekCalendar
    );

    const isCurrentWeek: boolean = weekTimeCurrent.includes(ENow.NOW);
    const currentTop: number = this.getCurrentTop(dayjs(currentTime));

    return (
      <div role="main" className="wk-calendar">
        <div className="wk-calendar-container">
          <div
            role="grid"
            aria-readonly="true"
            data-enable-grid-navigation="true"
            className="wk-grid-container"
          >
            <CalendarHeader
              eNows={weekTimeCurrent}
              days={weekCalendar}
              current={this.props.currentTime}
              attendances={attendances}
              dayEvents={allDayEvents}
              onChangeSelectEvent={onChangeSelectEvent}
              checkPopItemShow={checkPopItemShow}
              selectObj={selectObj}
              maxTopIndex={maxTopIndex}
              colClickCb={colClickCb}
            />
            <div role="presentation" className="wk-columns">
              <div
                role="presentation"
                className="wk-column-sub"
                ref={(ref) => {
                  this.weekColumnSubRef = ref;
                }}
              >
                <Timeline />
                <div role="presentation" className="wk-block-columns">
                  <div role="row" className="wk-block-columns-sub">
                    <HorizeLines
                      top={currentTop}
                      isCurrentWeek={isCurrentWeek}
                    />
                    <WeekCols
                      onChangeSelectEvent={onChangeSelectEvent}
                      colClickCb={colClickCb}
                      eNows={weekTimeCurrent}
                      weekCalendar={weekCalendar}
                      dayEvents={dayEvents}
                      checkPopItemShow={checkPopItemShow}
                      selectObj={selectObj}
                      currentTop={currentTop}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
