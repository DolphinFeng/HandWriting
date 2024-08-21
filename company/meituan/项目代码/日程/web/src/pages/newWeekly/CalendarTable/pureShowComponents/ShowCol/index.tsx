/*
 * @Description: 周视图天事件
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-05-29 14:30:44
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2021-03-10 19:18:18
 * @FilePath: /scheduleweb/src/pages/newWeekly/CalendarTable/pureShowComponents/ShowCol/index.tsx
 */

import React, { Component } from 'react';
import { IEventItem } from '../../interface';
import { computeSegCoords } from '../../util/event_placement';
import ShowEvent from '../ShowEvent';
import './index.less';

interface IPropsType {
  events: IEventItem[];
  targetDate: Date;
}

/**
 * 周视图事件组
 */
export default class WeekCol extends Component<IPropsType> {
  render() {
    const { events, targetDate } = this.props;
    if (events && events.length > 0) {
      computeSegCoords(events, targetDate);
    }
    return (
      <div className="wk-col-events" style={{ zIndex: 1 }}>
        {events.map((item, index) => {
          return <ShowEvent event={item} key={index} />;
        })}
      </div>
    );
  }
}
