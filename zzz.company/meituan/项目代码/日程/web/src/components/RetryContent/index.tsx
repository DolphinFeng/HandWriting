import { i18nClient } from '@sailor/i18n-web';
import React from 'react';
import { Button } from '@ss/mtd-react';
import styles from './index.less';

interface IRetryContentPropsType {
  onRetry?: Function;
  style?: React.CSSProperties;
}

export default function RetryContent(props: IRetryContentPropsType) {
  const { onRetry, style } = props;
  return (
    <div style={style} className={styles.contanier}>
      <p>
        {i18nClient.t(
          'retry_content_search_failed_click_retry',
          '查询失败，请点击重试'
        )}
      </p>
      <p className={styles.describle}>
        {i18nClient.t(
          'retry_content_retry_failed_check_network',
          '多次尝试未成功，请检查网络是否异常，或联系 6000'
        )}
      </p>
      <Button
        type="primary"
        ghost
        onClick={() => {
          onRetry && onRetry();
        }}
      >
        {i18nClient.t('retry_content_search_again', '重新查询')}
      </Button>
    </div>
  );
}
