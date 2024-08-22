import React, { Component } from 'react';
import { Icon } from '@ss/mtd-react';

import allstyles from '../index.less';

export interface ILocation {
  location: string;
}

export default class Location extends Component<ILocation> {
  render() {
    const { location } = this.props;
    return (
      <>
        {location && (
          <div className={allstyles.detailShowFormItem}>
            <div className={allstyles.detailShowFormLabel}>
              <Icon type="location-o" className={allstyles.labelFontStyle} />
            </div>
            <div className={allstyles.detailShowFormInfo}>{location}</div>
          </div>
        )}
      </>
    );
  }
}
