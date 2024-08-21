import React, { Component } from 'react';
import { Icon } from '@ss/mtd-react';
import { AttendeeItem } from '@/components';
import allstyles from '../index.less';

export interface IOrganizer {
  organizer: any;
  attendType?: string;
}
export default class Organizer extends Component<IOrganizer> {
  render() {
    const { organizer, attendType } = this.props;
    return (
      <>
        {organizer && (
          <div className={allstyles.detailShowFormItem}>
            <div className={allstyles.detailShowFormLabel}>
              <Icon type="avatar-o" className={allstyles.labelFontStyle} />
            </div>
            <div className={allstyles.detailShowFormInfo}>
              <AttendeeItem
                {...organizer}
                isOrganizer
                placement={attendType ? 'topLeft' : 'top'}
              />
            </div>
          </div>
        )}
      </>
    );
  }
}
