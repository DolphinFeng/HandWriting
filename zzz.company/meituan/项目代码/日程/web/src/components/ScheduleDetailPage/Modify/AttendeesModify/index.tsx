import { i18nClient } from '@sailor/i18n-web';
import React, { Component } from 'react';

import allstyles from '../../index.less';

export interface IAttendeesModify {
  // timestamp: number;
  attendees: any;
}

export default class AttendeesModify extends Component<IAttendeesModify> {
  render() {
    const { attendees } = this.props;
    const { add } = attendees;
    const del = attendees.delete;

    return (
      <div style={{ lineHeight: '17px' }}>
        {add.length !== 0 && (
          <div style={{ marginTop: '4px' }}>
            <span
              style={{
                fontSize: '12px',
                paddingRight: '8px'
              }}
            >
              {i18nClient.t('attendees_modify_members', '成员')}
            </span>
            <span style={{ marginRight: '8px' }}>{i18nClient.t('attendees_modify_attend', '增加了')}</span>
            <span
              className={allstyles.detailShowFormInfo}
              style={{
                fontSize: '12px',
                color: 'rgba(0,0,0,0.60)'
              }}
            >
              {add.join('、')}
            </span>
          </div>
        )}
        {del.length !== 0 && (
          <div style={{ marginTop: '4px' }}>
            <span
              style={{
                fontSize: '12px',
                paddingRight: '8px'
              }}
            >
              {i18nClient.t('attendees_modify_members', '成员')}
            </span>
            <span style={{ marginRight: '8px' }}>{i18nClient.t('attendees_modify_remove', '删除了')}</span>
            <span
              className={allstyles.detailShowFormInfo}
              style={{
                fontSize: '12px',
                color: 'rgba(0,0,0,0.60)'
              }}
            >
              {del.join('、')}
            </span>
          </div>
        )}
      </div>
    );
  }
}
