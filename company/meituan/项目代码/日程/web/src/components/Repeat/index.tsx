import React, {
  useState, useEffect, useRef, useImperativeHandle
} from 'react';
import { Select } from '@ss/mtd-react';
import {
  DEFAULT_CUSTOMIZED_PATTERN,
  DEFAULT_DAILY_PATTERN,
  DEFAULT_MONTHLY_PATTERN,
  DEFAULT_REC_PATTERN,
  DEFAULT_RELATIVEMONTHLY_PATTERN,
  DEFAULT_WEEKLY_PATTERN,
  DEFAULT_WORKDAY_PATTERN,
  ERecurrenceShowType, getCurrentRepeatShowTypeList, getRecValuesWithStartTime, IRecurrencePattern
} from '@/consts/recurrenceType';
import styles from './index.less';
import CustomRepeat from './customRepeat';

export interface IPropsType {
  recurrencePattern: IRecurrencePattern;
  originRecurrencePattern?: IRecurrencePattern;
  originRecurrenceDescription?: string;
  onChange: Function; // 修改值
  startTime: number; // 开始时间
  popLayer?: any; // 弹出层父亲
  onRef?: any;
  closeMtdComponent?: Function; // 关闭【提醒选择】
}

/**
 * 重复选择器
 */
export default function Repeat(props: IPropsType) {
  const {
    recurrencePattern, onChange, startTime, popLayer, originRecurrencePattern, originRecurrenceDescription, closeMtdComponent, onRef
  } = props;
  const {
    showType
  } = recurrencePattern || {};
  const [lastCustomPattern, setLastCustomPattern] = useState(null);
  const [repeatSelectList, setRepeatSelectList] = useState([]);
  // 是否满足tab键盘操作，默认收起日期选择器
  const [needAutoHidden, setNeedAutoHidden] = useState(true);
  const repeatSelectRef = useRef(null);

  // 上层组件可以调用关闭方法
  useImperativeHandle(onRef, () => ({
    closeRepeat: () => {
      setNeedAutoHidden(false);
      repeatSelectRef?.current?.blur();
    }
  }));

  useEffect(() => {
    setRepeatSelectList(getCurrentRepeatShowTypeList(startTime, originRecurrencePattern, originRecurrenceDescription));
    const {
      dateOfMonth, daysOfTheWeek, dayOfTheWeekIndex
    } = getRecValuesWithStartTime(startTime);
    // 循环规则在时间变化等 自动更新外部规则
    switch (showType) {
      case ERecurrenceShowType.WEEKLY:
        onChange && onChange(DEFAULT_WEEKLY_PATTERN(daysOfTheWeek));
        break;
      case ERecurrenceShowType.RELATIVEMONTHLY:
        onChange && onChange(DEFAULT_RELATIVEMONTHLY_PATTERN(daysOfTheWeek, dayOfTheWeekIndex));
        break;
      case ERecurrenceShowType.MONTHLY:
        onChange && onChange(DEFAULT_MONTHLY_PATTERN(dateOfMonth));
        break;
      default:
        break;
    }
  }, [startTime, originRecurrencePattern, originRecurrenceDescription, showType]);
  /**
   * 修改重复选择
   */
  const handleChangeValue = (item) => {
    const {
      dateOfMonth, daysOfTheWeek, dayOfTheWeekIndex
    } = getRecValuesWithStartTime(startTime);

    // 缓存住上次的自定义循环规则 方便用户重新编辑
    if (showType === ERecurrenceShowType.CUSTOMIZED) {
      setLastCustomPattern(JSON.parse(JSON.stringify(recurrencePattern)));
    }
    let recurrencePatternToSet = null;
    // 切换类型初始化
    switch (item.value) {
      case ERecurrenceShowType.NONE:
        recurrencePatternToSet = DEFAULT_REC_PATTERN;
        break;
      case ERecurrenceShowType.DAILY:
        recurrencePatternToSet = DEFAULT_DAILY_PATTERN;
        break;
      case ERecurrenceShowType.WORKDAY:
        recurrencePatternToSet = DEFAULT_WORKDAY_PATTERN;
        break;
      case ERecurrenceShowType.WEEKLY:
        recurrencePatternToSet = DEFAULT_WEEKLY_PATTERN(daysOfTheWeek);
        break;
      case ERecurrenceShowType.MONTHLY:
        recurrencePatternToSet = DEFAULT_MONTHLY_PATTERN(dateOfMonth);
        break;
      case ERecurrenceShowType.RELATIVEMONTHLY:
        recurrencePatternToSet = DEFAULT_RELATIVEMONTHLY_PATTERN(daysOfTheWeek, dayOfTheWeekIndex);
        break;
      case ERecurrenceShowType.CUSTOMIZED:
        recurrencePatternToSet = lastCustomPattern || DEFAULT_CUSTOMIZED_PATTERN;
        break;
      case ERecurrenceShowType.ORIGINRECURRENCE:
        recurrencePatternToSet = originRecurrencePattern;
        break;
      default:
        break;
    }
    onChange && onChange(recurrencePatternToSet);
  };

  const renderMainSelect = () => (<Select
    popLayer={{ ...popLayer, width: '300px', className: needAutoHidden ? '' : styles.hiddenDatePicker }}
    className={styles.select}
    value={showType}
    onChange={handleChangeValue}
    clearable={false}
    filterOption
    ref={repeatSelectRef}
    onFocus={() => {
      closeMtdComponent();
      setNeedAutoHidden(true);
    }}
  >
    {repeatSelectList.map((item) => {
      const { value, label } = item;
      return (
        <Select.Option key={value} value={value}>
          {label}
        </Select.Option>
      );
    })}
  </Select>);

  return (
    <>
      <div className={styles.container}>
        {renderMainSelect()}
      </div>
      {showType === ERecurrenceShowType.CUSTOMIZED && <CustomRepeat {...props} />}
    </>
  );
}
