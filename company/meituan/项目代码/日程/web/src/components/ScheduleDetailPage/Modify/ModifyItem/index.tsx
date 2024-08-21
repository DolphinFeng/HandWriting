import { i18nClient } from '@sailor/i18n-web';
import React, { Component } from 'react';
import allstyles from '../../index.less';

export interface IModify {
  ModifyText: string;
  modifyContent: any;
}
export default class Modify extends Component<IModify> {
  render() {
    const { ModifyText, modifyContent } = this.props;
    return (
      <div
        style={{ width: '100%', marginTop: '4px', wordBreak: 'break-word' }}
        // className={allstyles.detailShowFormItem}
      >
        {/* <span className={allstyles.detailShowFormLabel}> */}
        <span style={{ fontSize: '12px', paddingRight: '8px' }}>
          {ModifyText}
        </span>
        {/* </span> */}
        <span
          className={allstyles.detailShowFormInfo}
          style={{ color: 'rgba(0,0,0,0.60)', paddingRight: '8px' }}
        >
          {i18nClient.t('modify_item_change_to', '变更为')}
        </span>
        <span
          className={allstyles.detailShowFormInfo}
          style={{
            fontSize: '12px',
            color: 'rgba(0,0,0,0.60)'
          }}
        >
          {modifyContent}
        </span>
      </div>
    );
  }
}
