import React, { Component } from 'react';
import { Icon } from '@ss/mtd-react';
import { inject, observer } from 'mobx-react';
import DetailStore from '@/pages/newWeekly/store/detail';

import classNames from 'classnames';
import { FeedbackTab } from '../FeedbackTab';

import allstyles from '../index.less';

export interface IFeedBackTabPage {
  detail?: DetailStore;
  minAppendHeight?: number;
  global?: any;
  attendType?: string;
  forceAlignCb?: () => void;
  closePop?: () => void;
  detailBodyRef: HTMLDivElement;
}

@inject('detail', 'global')
@observer
export default class FeedBackTabPage extends Component<IFeedBackTabPage> {
  render() {
    const {
      conflictPersons,
      feedbackCountList,
      attendees,
      scheduleId,
      organizer
    } = this.props.detail;
    const { currentUser } = this.props.global;

    let attendeesWithOrg = [];
    if (organizer) {
      attendeesWithOrg = [{ ...organizer, feedbackType: 1 }];
    }
    if (attendees && attendees.length > 0) {
      const newAttendees = attendees.filter((item) => {
        return item.empId !== organizer?.empId;
      });
      attendeesWithOrg = [...attendeesWithOrg, ...newAttendees];
    }
    return (
      <div
        className={classNames(
          allstyles.detailShowFormItem,
          allstyles.detailSmallInfoDistant
        )}
      >
        <div className={allstyles.detailShowFormLabel}>
          <Icon type="avatar-group" className={allstyles.labelFontStyle} />
        </div>
        <div className={allstyles.detailShowFormInfo}>
          <FeedbackTab
            conflictPersons={conflictPersons}
            feedbackCountList={feedbackCountList}
            attendees={attendeesWithOrg}
            attendType={this.props.attendType}
            mis={currentUser?.mis}
            scheduleId={scheduleId}
            onChange={(): void => {
              if (this.props.forceAlignCb) {
                this.props.forceAlignCb();
              }
            }}
          />
        </div>
      </div>
    );
  }
}
