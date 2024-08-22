import { i18nClient } from '@sailor/i18n-web';
import React from 'react';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { Icon } from '@ss/mtd-react';
import styles from './index.less';

/**
 * 问题反馈
 */
const ScheduleQAPanel = observer(() => {
  return (
    <div className={styles.container}>
      <a
        href="https://tt.sankuai.com/ticket/create?cid=17&tid=2163&iid=9232"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon type={'customer-o'} />
        <span>{i18nClient.t('schedule_qa_panel_feedback', '问题反馈')}</span>
      </a>
    </div>
  );
});

export default inject(stroes => ({
  stroes
}))(ScheduleQAPanel);
