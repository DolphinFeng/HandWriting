import { i18nClient } from '@sailor/i18n-web';
import React, { useState, useImperativeHandle } from 'react';
import { DatePicker } from '@ss/mtd-react';
import styles from './index.less';

export interface IPropsType {
  popLayer?: any; // 弹出层浮层
  handleDeadlineChange?: () => void; // 修改截止时间
  deadline?: number;
  onRef?: any;
  closeRepeat?: Function; // 关闭【重复选择器
}

/**
 * 重复选择器
 */
export default function Recurrence(props: IPropsType) {
  const {
    popLayer, handleDeadlineChange, deadline, closeRepeat, onRef
  } = props;

  // 是否满足tab键盘操作，默认收起日期选择器
  const [needAutoHidden, setNeedAutoHidden] = useState(true);
  /**
   * 弹层展开
   */
  const openAutoHidden = () => {
    closeRepeat();
    setNeedAutoHidden(true);
  };
  /**
   * 供父层关闭弹层
   */
  useImperativeHandle(onRef, () => ({
    closeRecurrence: () => {
      setNeedAutoHidden(false);
    }
  }));

  return (
    <DatePicker
      clearable={false}
      popLayer={{ ...popLayer, className: needAutoHidden ? '' : styles.hiddenDatePicker }}
      onChange={handleDeadlineChange}
      format={i18nClient.t('recurrence_up_to', 'YYYY-MM-DD')}
      valueFormat="timestamp"
      value={deadline}
      style={{ width: 290 }}
      onFocus={openAutoHidden}
    />
  );
}
