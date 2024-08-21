import { i18nClient } from '@sailor/i18n-web';
import React from 'react';
import dayjs from 'dayjs';
import {
  IDayTime,
  IEventShowItem,
  IMonthTime,
  IPageStatus,
  IPublicCalendar
} from '../../store/month';
import styles from './index.less';
import { MonthDay } from '../../../../utils/i18n';
import EventShowItem from '../EventShowItem';
import { Popover } from '@ss/mtd-react';
import RestEvents from '../RestEvents';

interface IPropsType {
  datesRow: IDayTime[];
  eventsRow: IEventShowItem[][];
  monthTime: IMonthTime;
  pageStatus: IPageStatus;
  setPageStatus: Function;
  rowCount: number;
  calendarList: IPublicCalendar[];
  calendarSetId: string;
}
const MonthWeekRow = (props: IPropsType) => {
  const {
    datesRow,
    eventsRow,
    monthTime,
    pageStatus: { chosenRestIndex, chosenEvent },
    setPageStatus,
    rowCount,
    pageStatus,
    calendarList,
    calendarSetId
  } = props;
  const handleRestClick = (idx: number) => {
    setPageStatus({ chosenRestIndex: idx });
  };
  const closePop = () => {
    if (chosenEvent?.id || chosenEvent?.idx) {
      // 有子popOver的时候不要直接把自己关掉
      return;
    }
    setPageStatus({
      chosenRestIndex: null,
      chosenEvent: { id: null, idx: null }
    });
  };
  const getCss = (date) => {
    const today = new Date();
    const { month, day } = date;
    const isToday = month === today.getMonth() && day === today.getDate(); // 该天是否为今天
    const isThisMonth = month !== monthTime.month; // 该天是否为当前月的天

    const color = isThisMonth ? 'rgba(17, 25, 37, 0.3)' : '#111925';
    const newMonth = month === 12 ? 1 : (month as number) + 1;
    const dayText = day === 1 && !isToday
      ? dayjs(`${newMonth}-${day}`).format(MonthDay)
      : day;
    return { isToday, color, dayText };
  };

  return (
    <div className={styles.monthRow} key={rowCount}>
      <div className={styles.monthRowDates}>
        {datesRow.map((date, index) => {
          const { isToday, color, dayText } = getCss(date);
          return (
            <div key={index} className={styles.day} style={{ color }}>
              <span className={isToday ? styles.today : undefined}>
                {dayText}
              </span>
            </div>
          );
        })}
      </div>
      <div className={styles.monthRowEvents}>
        {eventsRow.map((dayEvents, index) => {
          const restEvents = dayEvents.filter(x => x.isRest);
          const dayIndexInMonth = rowCount * 7 + index; // 在月视图上的索引
          return (
            <>
              {dayEvents.slice(0, 2).map((event, idx) => {
                if (event && event.isShow) {
                  const calColor = calendarList.find(
                    item => item.calendarId === event.eventInfo.applicationId
                  )?.calendarColor;
                  return (
                    <EventShowItem
                      key={idx}
                      event={event}
                      calColor={calColor}
                      dayIndexInWeek={index}
                      dayIndexInMonth={dayIndexInMonth}
                      pageStatus={pageStatus}
                      setPageStatus={setPageStatus}
                      calendarSetId={calendarSetId}
                      calendarListInMonth={calendarList}
                    />
                  );
                }
                return null;
              })}
              {restEvents.length > 0 && (
                <Popover
                  placement="rightTop"
                  align={{
                    points: ['tc', 'bc'],
                    offset: [0, 0]
                  }}
                  autoDestory
                  visible={chosenRestIndex === dayIndexInMonth}
                  content={
                    <RestEvents
                      restEvents={restEvents}
                      date={datesRow[index]}
                      dayIndexInMonth={dayIndexInMonth}
                      setPageStatus={setPageStatus}
                      pageStatus={pageStatus}
                      calendarList={calendarList}
                      calendarSetId={calendarSetId}
                    />
                  }
                  onDocumentClick={closePop}
                >
                  <div
                    className={styles.rest}
                    style={{ left: `${(index * 100) / 7}%` }}
                    onClick={() => handleRestClick(dayIndexInMonth)}
                  >
                    {restEvents.length <= 1
                      && i18nClient.t(
                        'month_week_row_one_schedule_left',
                        '还有 {length} 个日程',
                        { length: restEvents.length }
                      )}
                    {restEvents.length > 1
                      && i18nClient.t(
                        'month_week_row_some_schedules_left',
                        '还有 {length} 个日程',
                        { length: restEvents.length }
                      )}
                  </div>
                </Popover>
              )}
            </>
          );
        })}
      </div>
      <div></div>
    </div>
  );
};

export default MonthWeekRow;
