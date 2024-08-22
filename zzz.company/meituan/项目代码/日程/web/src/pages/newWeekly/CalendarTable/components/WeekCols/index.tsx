/*
 * @Description: 周视图事件组
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-05-29 14:30:44
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-11-23 17:52:11
 * @FilePath: /scheduleweb/src/pages/newWeekly/CalendarTable/components/WeekCols/index.tsx
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import WeekCol from '../WeekCol';
import { ENow, IEventItem } from '../../interface';
import './index.less';

interface IPropsType {
  dayEvents: IEventItem[][];
  weekCalendar: Date[];
  eNows: ENow[];
  currentTop?: number;
  colClickCb?: Function;
  onChangeSelectEvent?: Function;
  checkPopItemShow?: Function;
  selectObj?: any;
}

/**
 * 周视图事件组
 */
@observer
export default class WeekCols extends Component<IPropsType> {
  render() {
    const {
      dayEvents,
      weekCalendar,
      eNows,
      currentTop,
      colClickCb,
      onChangeSelectEvent,
      checkPopItemShow,
      selectObj
    } = this.props;

    return (
      <div className="wk-col-items">
        {dayEvents.map((item, index) => {
          return (
            <WeekCol
              events={item}
              targetDate={weekCalendar[index]}
              eNow={eNows[index]}
              key={index}
              currentTop={currentTop}
              colClickCb={colClickCb}
              checkPopItemShow={checkPopItemShow}
              selectObj={selectObj}
              onChangeSelectEvent={onChangeSelectEvent}
            />
          );
        })}
      </div>
    );
  }
}
