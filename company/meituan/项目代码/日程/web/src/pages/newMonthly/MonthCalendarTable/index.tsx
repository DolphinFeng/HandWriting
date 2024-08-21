import { i18nClient } from '@sailor/i18n-web';
import React from 'react';
import {
  IDayTime, IEventShowItem, IMonthTime, IPageStatus, IPublicCalendar
} from '../store/month';
import styles from './index.less';
import MonthSwitch from './MonthSwitch';
import MonthWeekRow from './MonthWeekRow';
// import { debounce } from 'lodash';
interface IPropsType {
  monthDates: IDayTime[];
  changeMonth: any;
  monthTime: IMonthTime;
  pageStatus: IPageStatus;
  setPageStatus: Function;
  monthEventsShow: IEventShowItem[][];
  calendarList: IPublicCalendar[];
  calendarSetId: string;
}
export const WEEKDAY = [
  i18nClient.t('weekly_monday', '周一'),
  i18nClient.t('weekly_tuesday', '周二'),
  i18nClient.t('weekly_wednesday', '周三'),
  i18nClient.t('weekly_thursday', '周四'),
  i18nClient.t('weekly_friday', '周五'),
  i18nClient.t('weekly_saturday', '周六'),
  i18nClient.t('weekly_sunday', '周日')
];

const MonthCalendarTable = ((props: IPropsType) => {
  const {
    monthDates, changeMonth, monthEventsShow,
    pageStatus: { monthTime }, pageStatus, setPageStatus, calendarList, calendarSetId
  } = props;
  const weekIndexes = [0, 1, 2, 3, 4, 5];

  return (
    <>
      <MonthSwitch changeMonth={changeMonth} monthTime={monthTime} />
      <div className={styles.monthCalendarTable}>
        <div className={styles.monthCalendarHeader}>
          {WEEKDAY.map((day) => {
            return (<div key={day} className={styles.weekText}>{day}</div>);
          })}
        </div>
        <div className={styles.monthCalendarBody}>
          {weekIndexes.map((weekIndex) => {
            return (
              <MonthWeekRow
                key={weekIndex}
                calendarList={calendarList}
                datesRow={monthDates.slice(weekIndex * 7, (weekIndex + 1) * 7)}
                monthTime={monthTime}
                eventsRow={monthEventsShow.slice(weekIndex * 7, (weekIndex + 1) * 7)}
                pageStatus={pageStatus}
                setPageStatus={setPageStatus}
                rowCount={weekIndex}
                calendarSetId={calendarSetId}
              />
            );
          })}

        </div>
      </div>
    </>
  );
});

export default MonthCalendarTable;
