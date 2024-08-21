/*
 * @Description: 周视图日期头区域
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-05-29 14:30:44
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-11-20 18:19:00
 * @FilePath: /scheduleweb/src/pages/newWeekly/CalendarTable/components/CalendarHeader/TimeCols/index.tsx
 */

import dayjs from 'dayjs';
import React, { Component } from 'react';
import { weekArray } from '../../../const';
import { ENow } from '../../../interface';
import '../index.less';
import { i18nClient } from '@sailor/i18n-web';

interface IPropsType {
  days: Date[];
  current: Date;
  eNows: ENow[];
  attendances: string[];
}

/**
 * 周视图日期头区域
 */
export default class TimeCols extends Component<IPropsType> {
  renderHeaderDate = (
    selectDay: Date,
    eNow: ENow,
    index: number,
    attendanceString
  ): React.ReactElement => {
    const type: ENow = eNow;
    return (
      <div key={index} className="wk-col-header-cell">
        <div className="wk-col-header-date-cell">
          <p
            className={`wk-col-header-week${
              type === ENow.NOW ? ' current' : ''
            }${type === ENow.BEFORE ? ' before' : ''}`}
          >
            {weekArray[index]}
          </p>
          <div className={'wk-col-header-date-contanier'}>
            <p
              className={`wk-col-header-date${
                type === ENow.NOW ? ' current' : ''
              }${type === ENow.BEFORE ? ' before' : ''}`}
            >
              {dayjs(selectDay).format('DD')}
            </p>
            {/* 东八区之外处不显示休 */}
            {new Date().getTimezoneOffset() === -480 && (<div
              className={`wk-col-header-attendance ${attendanceString}-${i18nClient.language}`}
            />)}
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { days, eNows, attendances } = this.props;
    return (
      <div className="wk-col-column">
        <div className="wk-col-header-left" />
        <div className="wk-col-header-right">
          <div className="wk-col-header-cells">
            {days.map((item, index) => {
              return this.renderHeaderDate(
                item,
                eNows[index],
                index,
                attendances[index]
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
