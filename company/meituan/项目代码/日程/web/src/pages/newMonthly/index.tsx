import React, { useEffect, useRef } from 'react';
import citadelOpenSDK from '@it/citadel-open-sdk';
import { useParams } from 'react-router-dom';
import MonthStore, { IPageStatus } from './store/month';
import { inject, observer } from 'mobx-react';
import MonthCalendarTable from './MonthCalendarTable';
import { visionFollow } from './utils';
import styles from './index.less';
import DetailStore from '../newWeekly/store/detail';
import { throttle } from 'lodash';
import { PIKE_TYPE, pikeInitAndStart, pikeStop } from '@/services/pikeService';
import { MONTH_CHANGE_TYPE } from './MonthCalendarTable/MonthSwitch';

interface IPropsType {
  month: MonthStore;
  detail: DetailStore;

}
interface RouteParams {
  calendarSetId: string;
}

function NewMonthly(props: IPropsType) {
  const {
    month: {
      monthDates, monthEventsShow, pageStatus,
      setPageStatus, visionPush, changeMonth,
      initCalendars, updateEvents, updateCalLists, setCalSetId,
      calendarListInMonth, getPageStatus
    },
    detail: { closeDetailPop }
  } = props;
  const { calendarSetId } = useParams<RouteParams>();
  const { isEmbeddedInCitadel, spotlight, loaded } = citadelOpenSDK;
  const { monthTime } = pageStatus;
  const scrollRef = useRef(null);
  // 内嵌学城与视野跟随
  useEffect(() => {
    setCalSetId(calendarSetId);
    initCalendars();
    if (isEmbeddedInCitadel) {
      console.log('我内嵌在学城');
    }
    isEmbeddedInCitadel && loaded && loaded.success();
    isEmbeddedInCitadel && spotlight && visionFollow(spotlight, getPageStatus, visionPush, visionApply);
  }, []);
  // pike注册
  useEffect(() => {
    const handles = { calendarSetId, updateEvents, updateCalLists };
    pikeInitAndStart(PIKE_TYPE.MONTH, handles);
    return () => {
      pikeStop();
    };
  }, []);


  const visionApply = (data: IPageStatus) => {
    const {
      scrollPos, monthTime: mTime, chosenEvent, chosenRestIndex
    } = data;
    // 改变时间
    changeMonth(MONTH_CHANGE_TYPE.BYTIME, mTime);
    // 改变位置
    scrollPos && scrollRef.current?.scrollTo({
      top: scrollPos.y,
      left: scrollPos.x
    });
    setPageStatus({ scrollPos });
    setPageStatus({ chosenRestIndex });
    setPageStatus({ chosenEvent });
    // 需要先关闭弹窗再清理数据
    !chosenEvent.id && closeDetailPop();
  };

  const handleScroll = throttle((event) => {
    setPageStatus({ scrollPos: { x: event.target.scrollLeft, y: event.target.scrollTop } });
  }, 200);
  return (
    <div className={styles.container} ref={scrollRef} onScroll={handleScroll}>
      <div className={styles.calendarContainer} >
        <MonthCalendarTable
          calendarList={calendarListInMonth}
          monthDates={monthDates}
          monthTime={monthTime}
          monthEventsShow={monthEventsShow}
          pageStatus={pageStatus}
          calendarSetId={calendarSetId}
          setPageStatus={setPageStatus}
          changeMonth={changeMonth}
        />
      </div >
    </div>

  );
}

export default inject(({ month, detail }) => ({ month, detail }))(observer(NewMonthly));
