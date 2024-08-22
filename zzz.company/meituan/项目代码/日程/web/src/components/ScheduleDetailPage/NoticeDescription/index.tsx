import React, { Component } from 'react';
import { Icon } from '@ss/mtd-react';
// import ContentRenderer from '@/components/ContentRenderer';

import allstyles from '../index.less';

export interface INoticeDescription {
  noticeDescription: string;
}
export default class NoticeDescription extends Component<INoticeDescription> {
  render() {
    const { noticeDescription } = this.props;
    return (
      <>
        {noticeDescription && (
          <div className={allstyles.detailShowFormItem}>
            <div className={allstyles.detailShowFormLabel}>
              <Icon type="bell-o" className={allstyles.labelFontStyle} />
            </div>
            <div className={allstyles.detailShowFormInfo}>
              {noticeDescription}
            </div>
          </div>
        )}
      </>
    );
  }
}
