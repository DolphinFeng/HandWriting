import { i18nClient } from '@sailor/i18n-web';
/*
 * @Description: 周视图全天日程区域
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-05-29 14:30:44
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-12-03 19:58:48
 * @FilePath: /scheduleweb/src/pages/newWeekly/CalendarTable/components/CalendarHeader/AllDayCols/index.tsx
 */

import dayjs from 'dayjs';
import React, { Component } from 'react';
import { IEventItem } from '../../../interface';
import EventItem from '../../EventItem';
import '../index.less';

interface IPropsType {
  days: Date[];
  dayEvents?: IEventItem[][];
  onChangeSelectEvent?: Function; // 点击日程事件块回调
  checkPopItemShow?: Function;
  selectObj?: any;
  maxTopIndex?: number;
  colClickCb?: Function;
}

/**
 * 周视图全天日程区域
 */
export default class AllDayCols extends Component<IPropsType> {
  // 创建全天日程
  addFullDaySchedule = (item) => {
    const { colClickCb } = this.props;
    const start = dayjs(item).startOf('days').valueOf();
    colClickCb && colClickCb(start, start + 1000, 1);
  };

  render() {
    const {
      days,
      dayEvents,
      onChangeSelectEvent,
      checkPopItemShow,
      selectObj,
      maxTopIndex
    } = this.props;

    return (
      <div className="wk-col-column">
        <div className="wk-col-header-left">
          <p>{i18nClient.t('all_day_cols_all_day', '全天')}</p>
        </div>
        <div className="wk-col-header-right">
          <div
            className="wk-col-header-cells"
            style={{ height: (maxTopIndex + 1) * 20 + 5 }}
          >
            {days.map((item, index) => {
              return (
                <div
                  key={index}
                  className="wk-col-header-cell"
                  style={{ height: (maxTopIndex + 1) * 20 + 4 }}
                  onClick={() => {
                    this.addFullDaySchedule(item);
                  }}
                >
                  <div className="wk-col-header-allDay-cell">
                    {dayEvents[index].map((dItem, dIndex) => {
                      return (
                        <EventItem
                          isAllDay
                          onChangeSelectEvent={onChangeSelectEvent}
                          checkPopItemShow={checkPopItemShow}
                          selectObj={selectObj}
                          event={dItem}
                          key={dIndex}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
