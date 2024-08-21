import React, { Component } from 'react';
import { Icon } from '@ss/mtd-react';
import ContentRenderer from '@/components/ContentRenderer';

import allstyles from '../index.less';

export interface IMemo {
  memo: string;
}
export default class Memo extends Component<IMemo> {
  render() {
    const { memo } = this.props;
    return (
      <>
        {memo && (
          <div className={allstyles.detailShowFormItem}>
            <div className={allstyles.detailShowFormLabel}>
              <Icon type="file" className={allstyles.labelFontStyle} />
            </div>
            <div
              className={`${allstyles.detailShowFormInfo} ${allstyles.memolink}`}
            >
              <ContentRenderer text={memo} />
            </div>
          </div>
        )}
      </>
    );
  }
}
