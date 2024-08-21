import React, {
  useCallback, useState, useRef, useImperativeHandle
} from 'react';
import { Select } from '@ss/mtd-react';
import { remindNotAlldayOption, remindAlldayOption } from './const';
import styles from './index.less';

// 参数
interface IPropsType {
  isAllDay: number; // 是否全天
  hasMeeting: boolean; // 是否有会议室
  value: string; // 值
  onChange: Function; // 修改值
  onRef?: any;
  closeMtdComponent?: Function; // 关闭【重复选择器】
}

/**
 * 提醒选择
 */
export default function Remind(props: IPropsType) {
  const {
    isAllDay, value, onChange, hasMeeting, onRef, closeMtdComponent
  } = props;

  // 是否满足tab键盘操作，默认收起日期选择器
  const [needAutoHidden, setNeedAutoHidden] = useState(true);
  const remindSelectRef = useRef(null);
  // 上层组件可以调用关闭方法
  useImperativeHandle(onRef, () => ({
    closeRemind: () => {
      setNeedAutoHidden(false);
      remindSelectRef?.current?.blur();
    }
  }));

  /**
   * 修改提醒选择
   */
  const handleChangeValue = useCallback((item) => {
    onChange && onChange(item.value);
  }, []);

  return (
    <div className={styles.container}>
      <Select
        className={styles.select}
        clearable={false}
        value={value}
        onChange={handleChangeValue}
        filterOption
        ref={remindSelectRef}
        onFocus={() => { setNeedAutoHidden(true); closeMtdComponent(); }}
        popLayer={{ className: needAutoHidden ? '' : styles.hiddenDatePicker }}
      >
        {isAllDay
          ? remindAlldayOption.map((item) => {
            return (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
            );
          })
          : remindNotAlldayOption.map((item) => {
            if (hasMeeting) {
              // 有会议室只支持 10分钟提醒
              if (item.value === 'P0Y0M0DT0H10M0S') {
                return (
                    <Select.Option key={item.value} value={item.value}>
                      {item.label}
                    </Select.Option>
                );
              }
              return null;
            }
            return (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
            );
          })}
      </Select>
    </div>
  );
}
