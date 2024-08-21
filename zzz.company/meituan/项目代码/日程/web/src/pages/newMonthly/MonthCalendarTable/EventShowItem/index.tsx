import React, { useRef } from 'react';
import styles from './index.less';
import { IEventShowItem, IPageStatus, IPublicCalendar } from '../../store/month';
import { Popover } from '@ss/mtd-react';
import DetailPopContent from '@/components/DetailPopContent';
import { inject, observer } from 'mobx-react';
import WeekStore from '@/pages/newWeekly/store/week';
import DetailStore from '@/pages/newWeekly/store/detail';

interface IPropsType {
  event: IEventShowItem;
  week: WeekStore;
  detail: DetailStore;
  dayIndexInWeek: number;
  dayIndexInMonth: number;
  pageStatus: IPageStatus;
  setPageStatus: Function;
  calColor: string;
  calendarSetId: string;
  calendarListInMonth: IPublicCalendar[];
}
const EventShowItem = (props: IPropsType) => {
  const {
    event:
    {
      eventInfo: {
        posIndex, title, appKey, startTime, endTime, scheduleId, ownerName, applicationId, isAllDay
      },
      showLength,
      isAcrossWeek,
    },
    week: {
      scheduleSourcePanelStore: {
        getColorByMainColor
      }
    },
    detail: { closeDetailPop },
    dayIndexInWeek,
    dayIndexInMonth,
    setPageStatus,
    pageStatus,
    calColor,
    calendarSetId,
    calendarListInMonth
  } = props;
  const { chosenEvent: { id, idx } } = pageStatus;
  const top = `${posIndex * 20 + posIndex * 3}px`;
  const width = `calc(${100 * showLength / 7}% - ${(isAcrossWeek ? 3 : 6)}px)`;
  const left = ` ${dayIndexInWeek * 100 / 7}%`;
  const { backgroundColor, fontColor, focusColor } = getColorByMainColor(calColor, 'eventItem');
  const isPopVisible = id === scheduleId && dayIndexInMonth === idx;
  const eventClick = () => {
    if (isPopVisible) return;
    closeDetailPop();
    setPageStatus({ chosenEvent: { id: scheduleId, idx: dayIndexInMonth } });
  };

  const handleClose = () => {
    setPageStatus({ chosenRestIndex: null, chosenEvent: { id: null, idx: null } });
    closeDetailPop();
  };
  const detailPopRef = useRef<Popover>();
  /** 重新定位ToolTip的位置 */
  const popCurrentForceAlign = () => {
    // @ts-expect-error pop
    detailPopRef.current?.forceAlign();
  };

  return (
    <>
      <Popover
        visible={isPopVisible}
        ref={detailPopRef}
        className='detailPop'
        autoDestory
        placement='rightTop'
        onDocumentClick={handleClose}
        content={<DetailPopContent
          appKey={appKey}
          startTime={startTime}
          forceAlignCb={popCurrentForceAlign}
          scheduleId={scheduleId}
          endTime={endTime}
          isCyclic={0}
          ownerName={ownerName}
          applicationId={applicationId}
          calendarSetId={calendarSetId}
          calendarListInMonth={calendarListInMonth}
          title={title}
          isAllDay={isAllDay}
        />}
      >
        <div className={styles.eventItem}
          style={{
            width, top, left, backgroundColor: `${id === scheduleId ? focusColor : backgroundColor}`, color: fontColor,
          }}
          onClick={eventClick}
        >
          {title}
        </div>
      </Popover >
    </>
  );
};

export default inject(({ week, detail }) => {
  return {
    week, detail
  };
})(observer(EventShowItem));
