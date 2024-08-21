/* eslint-disable no-nested-ternary */
import React from 'react';
import dayjs from 'dayjs';
import { Select } from '@ss/mtd-react';
import { IPropsType } from './index';
import { i18nClient } from '@sailor/i18n-web';
import {
  repeatFreqOption,
  repeatFreqOptions,
  ERepeatFreqOption,
  weeklyDayRepeat,
  EMonthlyType,
  monthlyType
} from './const';
import styles from './index.less';
import {
  dayOfTheWeekList,
  EDaysOfTheWeek,
  ERecurrenceShowType,
  ERecurrenceType
} from '@/consts/recurrenceType';

const getNumberOption = (maxNumber, str = '') => {
  let num = 1;
  const options = [];
  while (num <= maxNumber) {
    options.push({
      value: `${num}`,
      label: num + str
    });
    num++;
  }
  return options;
};

const monthlyDayRepeat = getNumberOption(
  31,
  i18nClient.language === 'zh'
    ? i18nClient.t('repeat_monthly_day_repeat', '日')
    : ''
);

export default function CustomRepeat(props: IPropsType) {
  const {
    recurrencePattern: {
      type,
      showType,
      interval,
      daysOfTheWeek,
      dayOfMonth,
      dayOfTheWeekIndex
    },
    onChange,
    startTime,
    popLayer,
    recurrencePattern
  } = props;
  const intervalOptions = getNumberOption(31);

  let freq = ERepeatFreqOption.DAILY;
  let freqMonnthlyType = EMonthlyType.DAILY;
  const daysOfTheWeekSel = type === ERecurrenceType.WEEKLY
    ? daysOfTheWeek
    : daysOfTheWeek && daysOfTheWeek.length > 0
      ? daysOfTheWeek[0]
      : EDaysOfTheWeek.MO;

  switch (type) {
    case ERecurrenceType.WEEKLY:
      freq = ERepeatFreqOption.WEEKLY;
      break;
    case ERecurrenceType.ABSOLUTE_MONTHLY:
      freq = ERepeatFreqOption.MONTHLY;
      break;
    case ERecurrenceType.RELATIVE_MONTHLY:
      freq = ERepeatFreqOption.MONTHLY;
      freqMonnthlyType = EMonthlyType.WEEKLY;
      break;
    default:
      freq = ERepeatFreqOption.DAILY;
      break;
  }

  // 调整interval
  const handleChangeInterval = (item) => {
    onChange
      && onChange({
        ...recurrencePattern,
        interval: +item.value
      });
  };

  const handleChangeFraq = (item) => {
    let customPattern = null;
    const dayOfWeek = dayjs(startTime).day();
    // 当月几号
    const dateOfMonth = dayjs(startTime).date();
    // 当前周几的值
    const daysOfTheWeekTemp = weeklyDayRepeat[dayOfWeek - 1 < 0 ? 6 : dayOfWeek - 1].value;
    switch (item.value) {
      case ERepeatFreqOption.DAILY:
        customPattern = {
          interval,
          showType,
          type: ERecurrenceType.DAILY
        };
        break;
      case ERepeatFreqOption.WEEKLY:
        customPattern = {
          interval,
          showType,
          type: ERecurrenceType.WEEKLY,
          daysOfTheWeek: [daysOfTheWeekTemp]
        };
        break;
      case ERepeatFreqOption.MONTHLY:
        customPattern = {
          interval,
          showType,
          type: ERecurrenceType.ABSOLUTE_MONTHLY,
          dayOfMonth: dateOfMonth
        };
        break;
      default:
        break;
    }
    onChange && onChange(customPattern);
  };

  // 处理周几
  const handleChangeWeekly = (item) => {
    console.log(type === ERecurrenceType.WEEKLY, item);
    let items = item;
    if (type === ERecurrenceType.WEEKLY) {
      if (item && item.length <= 0) {
        return;
      }
    } else {
      items = [item];
    }

    onChange
      && onChange({
        interval,
        showType,
        type,
        daysOfTheWeek: items,
        dayOfTheWeekIndex
      });
  };

  // 处理第几周
  const handleChangeWeekIndex = (item) => {
    onChange
      && onChange({
        type: ERecurrenceType.RELATIVE_MONTHLY,
        showType: ERecurrenceShowType.CUSTOMIZED,
        interval,
        dayOfTheWeekIndex: item,
        daysOfTheWeek
      });
  };

  // 处理 按周/按月
  const handleChangeMonthType = (item) => {
    let customPattern = null;
    const dayOfWeek = dayjs(startTime).day();
    // 当月几号
    const dateOfMonth = dayjs(startTime).date();
    // 当前周几的值
    const daysOfTheWeekTemp = weeklyDayRepeat[dayOfWeek - 1 < 0 ? 6 : dayOfWeek - 1].value;
    const weekIndex = Math.floor(dateOfMonth / 7);
    switch (item) {
      case EMonthlyType.DAILY:
        customPattern = {
          type: ERecurrenceType.ABSOLUTE_MONTHLY,
          showType: ERecurrenceShowType.CUSTOMIZED,
          interval,
          dayOfMonth: dayOfMonth || dateOfMonth
        };
        break;
      case EMonthlyType.WEEKLY:
        customPattern = {
          type: ERecurrenceType.RELATIVE_MONTHLY,
          showType: ERecurrenceShowType.CUSTOMIZED,
          interval,
          dayOfTheWeekIndex:
            dayOfTheWeekIndex && dayOfTheWeekIndex.length > 0
              ? dayOfTheWeekIndex // TODO: dayOfTheWeekIndex.length?
              : dayOfTheWeekList[weekIndex > 3 ? 4 : weekIndex].value,
          daysOfTheWeek:
            daysOfTheWeek && daysOfTheWeek.length > 0
              ? daysOfTheWeek
              : [daysOfTheWeekTemp]
        };
        break;
      default:
        break;
    }
    onChange && onChange(customPattern);
  };

  // 处理第几天
  const handleDayOfMonth = (item) => {
    onChange
      && onChange({
        interval,
        showType,
        type: ERecurrenceType.ABSOLUTE_MONTHLY,
        dayOfMonth: item
      });
  };

  // const;

  return (
    <>
      <div className={styles.containerRepeat}>
        <span>{i18nClient.t('repeat_every', '每')}</span>
        {/* 调整频率 */}
        <Select
          popLayer={popLayer}
          style={{ width: 56, marginLeft: 8 }}
          className={styles.select}
          value={`${interval || 1}`}
          onChange={handleChangeInterval}
          filterable={false}
          clearable={false}
        >
          {intervalOptions.map((item) => {
            return (
              <Select.Option key={item.value} value={item.value}>
                {item.label}
              </Select.Option>
            );
          })}
        </Select>

        {/* 调整 月、周、日 */}
        <Select
          popLayer={popLayer}
          className={styles.select}
          style={{ width: 86, marginLeft: 8 }}
          value={freq}
          onChange={handleChangeFraq}
          filterable={false}
          clearable={false}
        >
          {interval <= 1
            && repeatFreqOption.map((item) => {
              return (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              );
            })}
          {interval > 1
            && repeatFreqOptions.map((item) => {
              return (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              );
            })}
        </Select>

        {/* 月 按日期 按星期 */}
        {ERepeatFreqOption.MONTHLY === freq && (
          <Select
            onlyKeyValue
            popLayer={popLayer}
            style={{ width: 95, marginLeft: 8 }}
            className={styles.select}
            value={freqMonnthlyType}
            onChange={handleChangeMonthType}
            filterable={false}
            clearable={false}
          >
            {monthlyType.map((item) => {
              return (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              );
            })}
          </Select>
        )}

        {/* 每周调整选中周几的数据 */}
        {type === ERecurrenceType.WEEKLY && (
          <Select
            key="week"
            popLayer={popLayer}
            multiple
            onlyKeyValue
            style={{ width: 130, marginLeft: 8 }}
            className={styles.select}
            value={daysOfTheWeekSel}
            onChange={handleChangeWeekly}
            clearable
            filterable={false}
          >
            {weeklyDayRepeat.map((item) => {
              return (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              );
            })}
          </Select>
        )}

        {type === ERecurrenceType.ABSOLUTE_MONTHLY && (
          <Select
            onlyKeyValue
            popLayer={popLayer}
            style={{ width: 78, marginLeft: 8 }}
            className={styles.select}
            value={dayOfMonth}
            onChange={handleDayOfMonth}
            filterable={false}
            clearable={false}
          >
            {monthlyDayRepeat.map((item) => {
              return (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              );
            })}
          </Select>
        )}
      </div>
      <div className={styles.containerRepeat}>
        {/* 调整第几个周 */}
        {type === ERecurrenceType.RELATIVE_MONTHLY && (
          <Select
            popLayer={popLayer}
            style={{ width: 110 }}
            className={styles.select}
            value={dayOfTheWeekIndex}
            onlyKeyValue
            onChange={handleChangeWeekIndex}
            filterable={false}
            clearable={false}
          >
            {dayOfTheWeekList.map((item) => {
              return (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              );
            })}
          </Select>
        )}

        {/* 每月调整选中周几的数据 */}
        {type === ERecurrenceType.RELATIVE_MONTHLY && (
          <Select
            key="month"
            popLayer={popLayer}
            onlyKeyValue
            style={{ width: 130, marginLeft: 8 }}
            className={styles.select}
            value={daysOfTheWeekSel}
            onChange={handleChangeWeekly}
            clearable={false}
            filterable={false}
          >
            {weeklyDayRepeat.map((item) => {
              return (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              );
            })}
          </Select>
        )}
      </div>
      {type === ERecurrenceType.ABSOLUTE_MONTHLY && +dayOfMonth > 28 && (
        <p className={styles.warnLabel}>
          {i18nClient.t(
            'repeat_specified_date_not_exist_skipped',
            '当月如果指定日期不存在，将会跳过此日程'
          )}
        </p>
      )}
    </>
  );
}
