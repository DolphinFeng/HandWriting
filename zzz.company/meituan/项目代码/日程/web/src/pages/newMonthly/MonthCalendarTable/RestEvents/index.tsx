import { i18nClient } from '@sailor/i18n-web';
import React from 'react';
import {
  IDayTime,
  IEventShowItem,
  IPageStatus,
  IPublicCalendar
} from '../../store/month';
import { inject, observer } from 'mobx-react';
import { Button } from '@ss/mtd-react';
import DetailStore from '@/pages/newWeekly/store/detail';
import RestEventItem from './RestEventItem';
import styles from './index.less';

interface IPropsType {
  restEvents: IEventShowItem[];
  date: IDayTime;
  detail: DetailStore;
  setPageStatus: Function;
  pageStatus: IPageStatus;
  calendarList: IPublicCalendar[];
  dayIndexInMonth: number;
  calendarSetId: string;
  handleClose: () => void;
}
const days = [
  i18nClient.t('rest_events_sunday', '星期日'),
  i18nClient.t('rest_events_monday', '星期一'),
  i18nClient.t('rest_events_tuesday', '星期二'),
  i18nClient.t('rest_events_wednesday', '星期三'),
  i18nClient.t('rest_events_thursday', '星期四'),
  i18nClient.t('rest_events_friday', '星期五'),
  i18nClient.t('rest_events_saturday', '星期六')
];

function RestEvents(props: IPropsType) {
  const {
    restEvents,
    date: { year, month, day },
    detail: { closeDetailPop },
    setPageStatus,
    pageStatus,
    dayIndexInMonth,
    calendarList,
    calendarSetId
  } = props;
  const {
    chosenEvent: { id, idx }
  } = pageStatus;

  const eventClick = (scheduleId) => {
    if (id === scheduleId && idx === dayIndexInMonth) return;
    closeDetailPop();
    setPageStatus({ chosenEvent: { id: scheduleId, idx: dayIndexInMonth } });
  };

  const handleClose = () => {
    setPageStatus({
      chosenRestIndex: null,
      chosenEvent: { id: null, idx: null }
    });
  };

  const handleCloseDetail = () => {
    setPageStatus({ chosenEvent: { id: null, idx: null } });
    closeDetailPop();
  };

  return (
    <div
      className={styles.container}
      onScroll={(event) => {
        event.stopPropagation();
      }}
    >
      <div className={styles.week}>
        {days[new Date(year, month, day).getDay()]}
      </div>
      <div className={styles.day}>{`${day}`}</div>
      <Button
        icon={'close'}
        shape="rect"
        size="small"
        hoverShape
        onClick={handleClose}
      />

      <div className={styles.eventsContainer}>
        {restEvents.map((event) => {
          return RestEventItem({
            event,
            id,
            idx,
            calendarSetId,
            calendarList,
            dayIndexInMonth,
            handleCloseDetail,
            eventClick
          });
        })}
      </div>
    </div>
  );
}

export default inject(({ detail }) => {
  return {
    detail
  };
})(observer(RestEvents));
