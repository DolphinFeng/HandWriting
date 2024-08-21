import { i18nClient } from '@sailor/i18n-web';
import { weeklyDayRepeat } from '@/components/Repeat/const';
import dayjs from 'dayjs';

// 循环规则
export enum ERecurrenceType {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  ABSOLUTE_MONTHLY = 'ABSOLUTE_MONTHLY',
  RELATIVE_MONTHLY = 'RELATIVE_MONTHLY',
  ABSOLUTE_YEARLY = 'ABSOLUTE_YEARLY',
  RELATIVE_YEARLY = 'RELATIVE_YEARLY'
}

// 循环规则显示类型
export enum ERecurrenceShowType {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WORKDAY = 'WORKDAY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  RELATIVEMONTHLY = 'RELATIVEMONTHLY',
  ORIGINRECURRENCE = 'ORIGINRECURRENCE', // 当前显示的规则
  CUSTOMIZED = 'CUSTOMIZED'
}

// 每周的周几
export enum EDaysOfTheWeek {
  MO = 'MO',
  TU = 'TU',
  WE = 'WE',
  TH = 'TH',
  FR = 'FR',
  SA = 'SA',
  SU = 'SU'
}

// 月份中的第几周
export enum EDayOfTheWeekIndex {
  FIRST = 'FIRST',
  SECOND = 'SECOND',
  THIRD = 'THIRD',
  FOURTH = 'FOURTH',
  LAST = 'LAST'
}

export const dayOfTheWeekList = [
  {
    value: EDayOfTheWeekIndex.FIRST,
    label: i18nClient.t('recurrence_type_first', '第一个')
  },
  {
    value: EDayOfTheWeekIndex.SECOND,
    label: i18nClient.t('recurrence_type_second', '第二个')
  },
  {
    value: EDayOfTheWeekIndex.THIRD,
    label: i18nClient.t('recurrence_type_third', '第三个')
  },
  {
    value: EDayOfTheWeekIndex.FOURTH,
    label: i18nClient.t('recurrence_type_forth', '第四个')
  },
  {
    value: EDayOfTheWeekIndex.LAST,
    label: i18nClient.t('recurrence_type_last', '最后一个')
  }
];

export interface IRecurrencePattern {
  showType: ERecurrenceShowType; // 显示type
  type: ERecurrenceType;
  interval?: number;
  daysOfTheWeek?: EDaysOfTheWeek[];
  dayOfTheWeekIndex?: EDayOfTheWeekIndex;
  month?: number;
  dayOfMonth?: number;
}

export const getRecValuesWithStartTime = (startTime) => {
  // 周几
  const dayOfWeek = dayjs(startTime).day();
  // 当月几号
  const dateOfMonth = dayjs(startTime).date();
  let weekIndex = Math.floor(dateOfMonth / 7);
  // 第7， 14天还是上一周
  if (dateOfMonth % 7 === 0) {
    weekIndex -= 1;
  }
  // 当前周几的值
  const daysOfTheWeek = weeklyDayRepeat[dayOfWeek - 1 < 0 ? 6 : dayOfWeek - 1].value;
  const daysOfTheWeekLabel = weeklyDayRepeat[dayOfWeek - 1 < 0 ? 6 : dayOfWeek - 1].label;
  // 每个月的第个周 第一 二 三 四 最后一个
  const dayOfTheWeekIndex = dayOfTheWeekList[weekIndex > 3 ? 4 : weekIndex].value;

  return {
    dayOfWeek,
    dateOfMonth,
    weekIndex,
    daysOfTheWeek,
    dayOfTheWeekIndex,
    daysOfTheWeekLabel
  };
};

// 可空数字判断相等
export const checkNumSame = (a, b) => {
  if (!a && !b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  if (+a !== +b) {
    return false;
  }
  return true;
};

// 全不存在存在相同
export const checkSame = (a, b) => {
  if (!a && !b) {
    return true;
  }
  if (a === b) {
    return true;
  }
  return false;
};

// 判断循环规则
export const checkPatternChanged = (
  originPattern: IRecurrencePattern,
  targetPattern: IRecurrencePattern
) => {
  let isChange = false;
  if (!originPattern || !targetPattern) {
    if (!originPattern && !targetPattern) {
      return false;
    }
    return true;
  }
  switch (true) {
    case originPattern.type !== targetPattern.type:
      isChange = true;
      break;
    case !checkNumSame(originPattern.interval, targetPattern.interval):
      isChange = true;
      break;
    case !checkSame(
      originPattern.dayOfTheWeekIndex,
      targetPattern.dayOfTheWeekIndex
    ):
      isChange = true;
      break;
    case !checkNumSame(originPattern.month, targetPattern.month):
      isChange = true;
      break;
    case !checkNumSame(originPattern.dayOfMonth, targetPattern.dayOfMonth):
      isChange = true;
      break;
    case originPattern?.daysOfTheWeek?.length
      !== targetPattern?.daysOfTheWeek?.length:
      isChange = true;
      break;
    case originPattern?.daysOfTheWeek?.sort().join()
      !== targetPattern?.daysOfTheWeek?.sort().join():
      isChange = true;
      break;
    default:
      break;
  }
  return isChange;
};

// 无循环
export const DEFAULT_REC_PATTERN: IRecurrencePattern = {
  type: ERecurrenceType.NONE,
  showType: ERecurrenceShowType.NONE
};

// 每天
export const DEFAULT_DAILY_PATTERN = {
  interval: 1,
  showType: ERecurrenceShowType.DAILY,
  type: ERecurrenceType.DAILY
};

// 工作日
export const DEFAULT_WORKDAY_PATTERN = {
  interval: 1,
  showType: ERecurrenceShowType.WORKDAY,
  type: ERecurrenceType.WEEKLY,
  daysOfTheWeek: [
    EDaysOfTheWeek.MO,
    EDaysOfTheWeek.TU,
    EDaysOfTheWeek.WE,
    EDaysOfTheWeek.TH,
    EDaysOfTheWeek.FR
  ]
};

// 每周
export const DEFAULT_WEEKLY_PATTERN = daysOfTheWeek => ({
  interval: 1,
  showType: ERecurrenceShowType.WEEKLY,
  type: ERecurrenceType.WEEKLY,
  daysOfTheWeek: [daysOfTheWeek]
});

// 每月
export const DEFAULT_MONTHLY_PATTERN = dateOfMonth => ({
  interval: 1,
  showType: ERecurrenceShowType.MONTHLY,
  type: ERecurrenceType.ABSOLUTE_MONTHLY,
  dayOfMonth: dateOfMonth
});

// 每月第几周 周几
export const DEFAULT_RELATIVEMONTHLY_PATTERN = (
  daysOfTheWeek,
  dayOfTheWeekIndex
) => ({
  interval: 1,
  showType: ERecurrenceShowType.RELATIVEMONTHLY,
  type: ERecurrenceType.RELATIVE_MONTHLY,
  daysOfTheWeek: [daysOfTheWeek],
  dayOfTheWeekIndex
});

export const DEFAULT_CUSTOMIZED_PATTERN = {
  interval: 1,
  showType: ERecurrenceShowType.CUSTOMIZED,
  type: ERecurrenceType.DAILY
};

// 自定义循环规则显示的下拉框
export const repeatShowTypeList = [
  {
    value: ERecurrenceShowType.NONE,
    label: i18nClient.t('recurrence_type_no_repeat', '不重复')
  },
  {
    value: ERecurrenceShowType.DAILY,
    label: i18nClient.t('recurrence_type_every_day', '每天')
  },
  {
    value: ERecurrenceShowType.WORKDAY,
    label: i18nClient.t('recurrence_type_every_workday', '每周的工作日')
  },
  {
    value: ERecurrenceShowType.WEEKLY,
    label: i18nClient.t('recurrence_type_every_week', '每周')
  },
  {
    value: ERecurrenceShowType.MONTHLY,
    label: i18nClient.t('recurrence_type_every_month_day', '每月的同一天')
  },
  {
    value: ERecurrenceShowType.RELATIVEMONTHLY,
    label: i18nClient.t(
      'recurrence_type_every_month_week_day',
      '每月的第几周的周几'
    ) // 这个字段根据开始日期动态计算覆盖
  },
  {
    value: ERecurrenceShowType.CUSTOMIZED,
    label: i18nClient.t('recurrence_type_customisation', '自定义')
  }
];

export const getCurrentRepeatShowTypeList = (
  startTime: number,
  originRecurrencePattern?: IRecurrencePattern,
  recurrenceDescription?: string
) => {
  if (!startTime) {
    return [];
  }
  const {
    dateOfMonth,
    weekIndex,
    daysOfTheWeek,
    dayOfTheWeekIndex,
    daysOfTheWeekLabel
  } = getRecValuesWithStartTime(startTime);

  let typeList = repeatShowTypeList.map((item) => {
    const { value, label } = item;
    let labelShow = label;
    switch (item.value) {
      case ERecurrenceShowType.RELATIVEMONTHLY:
        labelShow = i18nClient.t(
          'recurrence_type_monthly_week',
          '每月的{dayOfTheWeekList}{daysOfTheWeekLabel}',
          {
            dayOfTheWeekList: dayOfTheWeekList[weekIndex].label,
            daysOfTheWeekLabel
          }
        );
        break;
      case ERecurrenceShowType.WEEKLY:
        labelShow = i18nClient.t(
          'recurrence_type_weekly_day',
          '每周的{daysOfTheWeekLabel}',
          { daysOfTheWeekLabel }
        );
        break;
      case ERecurrenceShowType.MONTHLY:
        labelShow = i18nClient.t(
          'recurrence_type_monthly_day',
          '每月的{dateOfMonth}日',
          { dateOfMonth }
        );
        break;
      default:
        break;
    }
    return {
      value,
      label: labelShow
    };
  });

  if (
    originRecurrencePattern
    && originRecurrencePattern.type !== ERecurrenceType.NONE
  ) {
    const originItem = {
      value: ERecurrenceShowType.ORIGINRECURRENCE,
      label: recurrenceDescription
    };
    let sameRule = ERecurrenceShowType.NONE;
    switch (true) {
      case !checkPatternChanged(
        originRecurrencePattern,
        DEFAULT_MONTHLY_PATTERN(dateOfMonth)
      ):
        sameRule = ERecurrenceShowType.MONTHLY;
        break;
      case !checkPatternChanged(originRecurrencePattern, DEFAULT_DAILY_PATTERN):
        sameRule = ERecurrenceShowType.DAILY;
        break;
      case !checkPatternChanged(
        originRecurrencePattern,
        DEFAULT_WORKDAY_PATTERN
      ):
        sameRule = ERecurrenceShowType.WORKDAY;
        break;
      case !checkPatternChanged(
        originRecurrencePattern,
        DEFAULT_WEEKLY_PATTERN(daysOfTheWeek)
      ):
        sameRule = ERecurrenceShowType.WEEKLY;
        break;
      case !checkPatternChanged(
        originRecurrencePattern,
        DEFAULT_RELATIVEMONTHLY_PATTERN(daysOfTheWeek, dayOfTheWeekIndex)
      ):
        sameRule = ERecurrenceShowType.RELATIVEMONTHLY;
        break;
      default:
        break;
    }

    // 有规则 未命中快捷规则 插入一个规则
    if (sameRule === ERecurrenceShowType.NONE) {
      typeList.splice(repeatShowTypeList.length - 1, 0, originItem);
    } else {
      // 命中快捷规则，覆盖快捷规则
      typeList = typeList.map((item) => {
        const { value } = item;
        if (value === sameRule) {
          return originItem;
        }
        return item;
      });
    }
  }
  return typeList;
};
