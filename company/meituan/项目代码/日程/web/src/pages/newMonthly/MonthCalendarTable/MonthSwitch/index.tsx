import { i18nClient } from '@sailor/i18n-web';
import { Button, Tooltip } from '@ss/mtd-react';
import React from 'react';
import styles from './index.less';
import { IMonthTime } from '../../store/month';
import classNames from 'classnames';

interface IPropsType {
  changeMonth: (type: MONTH_CHANGE_TYPE) => {};
  monthTime: IMonthTime;
}
export enum MONTH_CHANGE_TYPE {
  PREV = 'prev',
  NEXT = 'next',
  TODAY = 'today',
  BYTIME = 'by_time'
}

const MonthSwitch: React.FC<IPropsType> = (props: IPropsType) => {
  const {
    changeMonth,
    monthTime: { year, month }
  } = props;
  const handleChangeMonth = (type: MONTH_CHANGE_TYPE) => {
    changeMonth(type);
  };
  return (
    <div className={styles.monthSwitch}>
      <Button
        className={styles.todayButton}
        onClick={() => {
          handleChangeMonth(MONTH_CHANGE_TYPE.TODAY);
        }}
      >
        {i18nClient.t('month_switch_today', '今天')}
      </Button>

      <div className={styles.switchContainer}>
        <Tooltip
          message={i18nClient.t('month_switch_last_month', '上个月')}
          size="small"
          placement="bottom"
          autoDestory
        >
          <i
            onClick={() => {
              handleChangeMonth(MONTH_CHANGE_TYPE.PREV);
            }}
            className={classNames(
              styles.icon,
              styles.iconLeft,
              'icon dxcalendar dx-calleft_day_nav'
            )}
          ></i>
        </Tooltip>

        <div className={styles.line}></div>
        <Tooltip
          message={i18nClient.t('month_switch_next_month', '下个月')}
          size="small"
          placement="bottom"
          autoDestory
        >
          <i
            onClick={() => {
              handleChangeMonth(MONTH_CHANGE_TYPE.NEXT);
            }}
            className={classNames(
              styles.icon,
              styles.iconRight,
              'icon dxcalendar dx-calright_day_nav'
            )}
          ></i>
        </Tooltip>
      </div>
      <div style={{ fontSize: '16px' }}>
        {i18nClient.t('month_switch_year_month', '{year}年{month}月', {
          year,
          month: month + 1
        })}
      </div>
    </div>
  );
};

export default MonthSwitch;
