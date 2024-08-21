/*
 * @Description: 文件描述
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-06-03 20:14:07
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-11-17 14:59:57
 * @FilePath: /scheduleweb/src/pages/newWeekly/WeekSwitch/index.tsx
 */

import React, { Component } from 'react';
import { Icon, DatePicker } from '@ss/mtd-react';
import classNames from 'classnames';
import { addModuleClick } from '@/services/lxService';
import { getCalendarWeek } from '../actions/calendarUtils';
import styles from './index.less';
import dayjs from 'dayjs';
import { i18nClient } from '@sailor/i18n-web';
import { YearMonthDay, YearMonth } from '@/utils/i18n';

interface IPropsType {
  choosedDate: Date;
  onChoosedDateChange: Function;
}

interface IStateType {
  visible: boolean;
}

export default class extends Component<IPropsType, IStateType> {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
  }
  selectDate = (type: string, year: number, month: number, date: number) => {
    const { onChoosedDateChange } = this.props;
    let targeDay = new Date();
    switch (type) {
      case 'prev':
        targeDay = new Date(year, month, date - 7);
        break;
      case 'next':
        targeDay = new Date(year, month, date + 7);
        break;
      default:
        break;
    }
    const weeksDate: Date[] = getCalendarWeek(targeDay);
    const todayIndex = weeksDate.findIndex(item => dayjs(item).isSame(dayjs().format(YearMonthDay), 'day'));
    // 当周的今天或者其它周的周一
    if (todayIndex > -1) {
      onChoosedDateChange(new Date(new Date().setHours(0, 0, 0, 0)));
    } else {
      onChoosedDateChange(weeksDate[0]);
    }
  };

  handleChangeDate = (value: number) => {
    const { onChoosedDateChange } = this.props;
    const targeDay = new Date(new Date(value).setHours(0, 0, 0, 0));
    onChoosedDateChange(targeDay);
  };

  render() {
    const { choosedDate } = this.props;
    const { visible } = this.state;
    const year = choosedDate.getFullYear();
    const month = choosedDate.getMonth();
    const date = choosedDate.getDate();
    return (
      <div className={styles.timeSwitch}>
        <div
          onClick={() => {
            addModuleClick('b_oa_zvpuclbr_mc');
            this.selectDate('now', year, month, date);
          }}
          className={styles.today}
        >
          {i18nClient.t('new_weekly_today', '今天')}
        </div>
        <Icon
          onClick={() => {
            addModuleClick('b_oa_zvpuclbr_mc');
            this.selectDate('prev', year, month, date);
          }}
          className={styles.iconLeft}
          type={'left'}
        />
        <Icon
          onClick={() => {
            addModuleClick('b_oa_zvpuclbr_mc');
            this.selectDate('next', year, month, date);
          }}
          className={styles.iconRight}
          type={'right'}
        />
        <div className={styles.timePickerParent}>
          <DatePicker
            className={classNames(styles.currentDatePicker)}
            onFocus={(): void => {
              this.setState({ visible: true });
              addModuleClick('b_oa_56n2encj_mc');
            }}
            onBlur={(): void => {
              this.setState({ visible: false });
            }}
            clearable={false}
            value={choosedDate.valueOf()}
            onChange={this.handleChangeDate}
            key={choosedDate.valueOf()} // 保证周几能正常刷新
            format={i18nClient.t(
              'new_weekly_format_year_month_day',
              'YYYY年MM月DD日'
            )}
            valueFormat={'timestamp'}
          />

          <div className={styles.selectDate}>
            <p className={styles.timeLabel}>
              {dayjs(`${year}-${month + 1}`).format(YearMonth)}
            </p>
            <Icon
              className={classNames(styles.down, {
                [styles.rotateStyle]: visible
              })}
              type={'down'}
            />
          </div>
          {/* picker打开时候放一个隐藏div方便点击失焦关闭 */}
          {visible && <div className={styles.pickerBro} />}
        </div>
      </div>
    );
  }
}
