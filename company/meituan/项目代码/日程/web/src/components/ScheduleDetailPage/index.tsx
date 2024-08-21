import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import DetailStore from '@/pages/newWeekly/store/detail';

import Location from '@/components/ScheduleDetailPage/Location';
import Memo from '@/components/ScheduleDetailPage/Memo';
import NoticeDescription from '@/components/ScheduleDetailPage/NoticeDescription';
import Organizer from '@/components/ScheduleDetailPage/Organizer';
import RecurrenceDescription from '@/components/ScheduleDetailPage/RecurrenceDescription';
import RoomName from '@/components/ScheduleDetailPage/RoomName';
import FeedBackTabPage from '@/components/ScheduleDetailPage/FeedBackTabPage';
import Modify from '@/components/ScheduleDetailPage/Modify';
import RoomNotice from '@/components/RoomNotice';
import styles from './index.less';

export interface IScheduleDetailPage {
  detail?: DetailStore;
  global?: any;
  forceAlignCb?: () => void;
  attendType?: string;
}

@inject('detail', 'global')
@observer
export default class ScheduleDetailPage extends Component<IScheduleDetailPage> {
  detailBodyRef: HTMLDivElement;

  render() {
    const {
      location,
      scheduleId,
      roomInfo,
      locationId,
      organizer,
      memo,
      noticeDescription,
      recurrenceDescription,
      roomName,
      roomLocationUrl,
      deadline,
      modifyLog,
      isCyclic
    } = this.props.detail;
    return (
      <div
        className={styles.container}
        ref={(ref) => {
          this.detailBodyRef = ref;
        }}
      >
        <div style={{ marginBottom: '18px' }}>
          <Location location={location} />
          {/* <RoomInfo roomInfo={roomInfo}/> */}
          <RoomName
            roomName={roomName}
            roomLocationUrl={roomLocationUrl}
            locationId={locationId}
            roomInfo={roomInfo}
            scheduleId={scheduleId}
          />
          <RoomNotice roomInfo={roomInfo} />
          <Organizer attendType={this.props.attendType} organizer={organizer} />
          <FeedBackTabPage
            attendType={this.props.attendType}
            detailBodyRef={this.detailBodyRef}
          />
          <NoticeDescription noticeDescription={noticeDescription} />
          <RecurrenceDescription
            recurrenceDescription={recurrenceDescription}
            deadline={deadline}
            isCyclic={isCyclic}
          />
          <Memo memo={memo} />
        </div>

        <Modify modifyLog={modifyLog} />
      </div>
    );
  }
}
