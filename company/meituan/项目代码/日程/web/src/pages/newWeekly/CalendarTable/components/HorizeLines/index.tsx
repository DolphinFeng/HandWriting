/*
 * @Description: 横向线
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-05-29 14:30:44
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-11-20 21:26:07
 * @FilePath: /scheduleweb/src/pages/newWeekly/CalendarTable/components/HorizeLines/index.tsx
 */

import React from 'react';

interface IPropsType {
  isCurrentWeek: boolean;
  top: number;
}

/**
 * 横向线
 */
export default class HorizeLines extends React.PureComponent<IPropsType> {
  render() {
    const ALLLINES = new Array(24).fill(1);
    const { top, isCurrentWeek } = this.props;
    return (
      <div aria-hidden="true">
        {isCurrentWeek && <div className="wk-current-line" style={{ top }} />}
        {ALLLINES.map((_, index) => {
          return <div key={index} className="wk-single-line" />;
        })}
      </div>
    );
  }
}
