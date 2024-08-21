/*
 * @Description: 事件块时间文字组件
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2021-03-04 20:12:52
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2021-03-29 10:38:37
 * @FilePath: /scheduleweb/src/components/ScheduleConflict/CurrentTimeLabel/index.tsx
 */

import React from 'react';
import classNames from 'classnames';

import styles from './index.less';

interface ICurrentTimeLabel {
  topTimeBar: number;
  conflictCount: number;
  heightSchedule: number;
  startTimeLabel: string;
  endTimeLabel: string;
}
export default class CurrentTimeLabel extends React.Component<ICurrentTimeLabel> {
  render() {
    const {
      topTimeBar,
      conflictCount,
      heightSchedule,
      startTimeLabel,
      endTimeLabel
    } = this.props;

    return (
      <>
        <div
          style={{
            top: topTimeBar,
            color: conflictCount > 0 ? '#FF8800' : '#00B365 '
          }}
          className={classNames(styles.time, styles.currentTimeLabel)}
        >
          {startTimeLabel}
        </div>
        <div
          style={{
            color: conflictCount > 0 ? '#FF8800' : '#00B365 ',
            top: topTimeBar + heightSchedule + 3
          }}
          className={classNames(styles.time, styles.currentTimeLabel)}
        >
          {endTimeLabel === '00:00' ? '24:00' : endTimeLabel}
        </div>
      </>
    );
  }
}
