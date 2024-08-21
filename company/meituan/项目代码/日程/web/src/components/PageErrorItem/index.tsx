import { i18nClient } from '@sailor/i18n-web';

import React from 'react';

export default function PageErrorItem() {
  return (
    <div className="ebundaryError ebundaryErrorContanier">
      <div className="icon">
        <img src="https://s3plus.sankuai.com/common-asserts/sad.png?AWSAccessKeyId=tzwrzkgkf2f5ndgg000000000063c81e&Expires=1869033954&Signature=MgE%2FL6%2Ft0L17auBuTMmMoS0uREs%3D" />
      </div>
      <div className="title">
        {i18nClient.t('page_error_item_click_retry', '加载失败，请点击重试')}
      </div>
      <div className="desc">
        {i18nClient.t('page_error_item_request_error', '接口服务请求异常')}
      </div>
      <div
        onClick={() => {
          window.location.reload();
        }}
        className="reload-btn"
      >
        {i18nClient.t('page_error_item_retry', '重试')}
      </div>
    </div>
  );
}
