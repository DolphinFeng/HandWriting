import React, { useCallback } from 'react';
import { Select } from '@ss/mtd-react';
import styles from './index.less';
import { ICalendarInfo } from '@/pages/scheduleEdit/FormPanel/store';
import classnames from 'classnames';
import { i18nClient } from '@sailor/i18n-web';

interface IPropsType {
  currentCalendarInfo: ICalendarInfo; // 当前日历
  creatableCalendarsInfo: ICalendarInfo[]; // 可创建的日历类型列表
  onChange: Function;
  disabled: boolean; // 是否禁用
  userName: string; // 用户名
}

/**
 * 日历类型选择
 */
export default function CalendarSelector(props: IPropsType) {
  const {
    currentCalendarInfo,
    creatableCalendarsInfo,
    disabled,
    userName,
    onChange
  } = props;
  const { calendarId } = currentCalendarInfo;
  const CalendarItem = ({ calendarInfo }) => {
    return (
      <>
        <span
          className={styles.status}
          style={{
            backgroundColor:
              calendarInfo.type === 'PUBLIC' ? calendarInfo.color : '#0A70F5'
          }}
        ></span>
        <span className={styles.item}>
          {calendarInfo.type === 'PUBLIC'
            ? calendarInfo.summary
            : i18nClient.t('calendar_selector_user_self', '{userName} (自己）', { userName })}
        </span>
      </>
    );
  };
  const handleChangeValue = useCallback((item) => {
    onChange && onChange(item);
  }, []);

  return (
    <div className={styles.container}>
      <Select
        filterable={false}
        className={styles.select}
        clearable={false}
        value={calendarId}
        filterOption
        disabled={disabled}
        onChange={handleChangeValue}
        popLayer={{
          className: styles.hiddenDatePicker
        }}
        style={{ width: '340px' }}
        renderInputLabel={() => {
          return <CalendarItem calendarInfo={currentCalendarInfo} />;
        }}
      >
        {creatableCalendarsInfo.map((option, index) => (
          <Select.Option
            className={styles.option}
            key={index}
            value={option.calendarId}
            originOption={option}
          >
            <CalendarItem calendarInfo={option} />
            {calendarId === option.calendarId && (
              <i
                className={classnames(
                  styles.icon,
                  'dxcalendar dx-calcheck_color'
                )}
              ></i>
            )}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
}
