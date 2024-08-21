/*
 * @Description: 周视图时间轴
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-09-11 16:02:15
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-11-11 17:42:08
 * @FilePath: /scheduleweb/src/pages/newWeekly/CalendarTable/Timeline/index.tsx
 */
import React, { PureComponent } from 'react';
import dayjs from 'dayjs';
import { appendzero } from '@/utils';
import './index.less';

interface IPropsType {
  top?: number;
  time?: number;
  showCurrent?: boolean;
}

/**
 * 周视图时间轴
 */
const HIDDEN_CONST_MINUTE = 15; // 隐藏时间的范围 默认相距离15分钟隐藏
export default class extends PureComponent<IPropsType> {
  checkShowTime = (index) => {
    const { showCurrent } = this.props;
    if (index === 0) {
      return false;
    }
    if (!showCurrent) {
      return true;
    }
    const { time } = this.props;
    const hour = dayjs(time).hour();
    const minute = dayjs(time).minute();
    const currentMinute = 60 * hour + minute;
    const indexMinute = index * 60;
    if (Math.abs(currentMinute - indexMinute) < HIDDEN_CONST_MINUTE) {
      return false;
    }
    return true;
  };

  render() {
    // const { top, time, showCurrent } = this.props;

    const ALLTimes = new Array(24).fill(1);
    return (
      <div aria-hidden="true" className="wk-timelinebar-content">
        <div className="wk-timeline-container">
          {/* {showCurrent && (
          <div className="wk-timeline-currentlabel" style={{ top: top - 7 }}>
            {dayjs(time).format('HH:mm')}
          </div>
        )} */}
          {ALLTimes.map((_, index) => {
            return (
              <div className="wk-timeline-item" key={index}>
                {this.checkShowTime(index) && (
                  <span>{`${appendzero(index)}:00`}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
