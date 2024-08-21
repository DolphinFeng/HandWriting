import { i18nClient } from '@sailor/i18n-web';
import React, { useEffect } from 'react';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { Switch, Loading } from '@ss/mtd-react';
import { messageStore } from '@/store/global';
import styles from './index.less';

const NoticeModel = observer((props) => {
  const {
    week: {
      scheduleSharePanelStore: {
        mailStatus,
        mailStatusLoading,
        getSettingMailStatus,
        setSettingMailStatus
      }
    }
  } = props;

  // 获取邮箱状态
  useEffect(() => {
    getSettingMailStatus();
  }, []);

  // 切换
  const handleSwitch = async (e) => {
    const status = e.target.checked ? 1 : 0;
    await setSettingMailStatus(status);
    messageStore.success(
      i18nClient.t('notice_model_mail_success', '修改成功')
    );
  };

  return (<Loading loading={mailStatusLoading}>
    <div className={styles.container}>
      <div className={styles['notice-wrapper']}>
        <div className={styles.title}>
          {i18nClient.t('notice_model_mail_notice', '日程邮箱通知')}
          <Switch size="small" onChange={handleSwitch} disabled={mailStatus === -1} checked={mailStatus === 1}></Switch>
        </div>
        {
          mailStatus === -1 ? (
            <div className={styles.desc}>
              {i18nClient.t('notice_model_no_mail', '日程邮箱通知当前不可用，开通邮箱后启用此功能，大象日程活动将通过邮件同步至Outlook邮箱进行通知')}
            </div>
          ) : (
            <div className={styles.desc}>
              {i18nClient.t('notice_model_mail_des', '大象日程活动将通过邮件同步至 Outlook 邮箱进行通知。关闭后，日程通知邮件将归档至邮箱“已删除邮件”目录，收件箱不再接收日程相关邮件通知')}
            </div>
          )
        }
      </div>
    </div></Loading>);
});

export default inject(({ global, week }) => ({
  global,
  week
}))(NoticeModel);
