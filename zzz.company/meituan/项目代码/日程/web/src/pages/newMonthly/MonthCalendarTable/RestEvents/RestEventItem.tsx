import { i18nClient } from '@sailor/i18n-web';
import React from 'react';
import { Popover } from '@ss/mtd-react';
import DetailPopContent from '@/components/DetailPopContent';
import styles from './index.less';

function RestEventItem(props) {
  const {
    eventInfo: {
      title,
      startTime,
      length,
      isAllDay,
      applicationId,
      scheduleId,
      appKey,
      endTime,
      ownerName,
      dayStartIndex
    }
  } = props.event;

  const {
    id,
    idx,
    calendarSetId,
    calendarList,
    dayIndexInMonth,
    handleCloseDetail,
    eventClick
  } = props;

  let detailPopRef = null;

  const color = calendarList.find(item => item.calendarId === applicationId)
    ?.calendarColor;
  const start = new Date(startTime);

  const close = () => {
    handleCloseDetail?.();
  };

  const popCurrentForceAlign = () => {
    detailPopRef?.forceAlign();
  };

  return (
    <Popover
      visible={id === scheduleId && idx === dayIndexInMonth}
      className="detailPop"
      autoDestory
      placement="rightBottom"
      onDocumentClick={close}
      ref={(ref) => {
        detailPopRef = ref;
      }}
      content={
        <DetailPopContent
          forceAlignCb={popCurrentForceAlign}
          appKey={appKey}
          startTime={startTime}
          scheduleId={scheduleId}
          endTime={endTime}
          isCyclic={0}
          ownerName={ownerName}
          applicationId={applicationId}
          calendarSetId={calendarSetId}
          calendarListInMonth={calendarList}
          title={title}
          isAllDay={isAllDay}
        />
      }
    >
      <div
        className={styles.eventContainer}
        onClick={() => {
          eventClick?.(scheduleId);
        }}
        style={{
          ...(id === scheduleId ? { background: 'rgba(0, 0, 0, 0.04)' } : {})
        }}
      >
        <div className={styles.miniBox}>
          <div className={styles.box} style={{ backgroundColor: color }}></div>
        </div>
        <div className={styles.time}>
          {(length > 1 && dayStartIndex !== dayIndexInMonth) || isAllDay
            ? i18nClient.t('rest_event_item_allday', '全天')
            : `${String(start.getHours()).padStart(2, '0')}:${String(
              start.getMinutes()
            ).padStart(2, '0')}`}
        </div>
        <div className={styles.title}>{title}</div>
      </div>
    </Popover>
  );
}

export default RestEventItem;
