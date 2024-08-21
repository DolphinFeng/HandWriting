import { i18nClient } from '@sailor/i18n-web';
import React, { useCallback, useState } from 'react';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import {
  Checkbox, Button, Modal, Tooltip
} from '@ss/mtd-react';
import classNames from 'classnames';
import { throttle } from 'lodash';
import { moduleClick } from 'onejs/lx';
import defaultImg from '@/asserts/images/default.png';
import styles from './index.less';
import ShareModel from './ShareModel';
import NoticeModel from './NoticeModel';
import { getEnname } from '@/utils';

enum TabList {
  share = 1,
  notice = 2,
}

/**
 * 日程共享
 */
const ScheduleSharePanel = observer((props) => {
  const {
    stroes: {
      week: {
        initScheduleList,
        scheduleSharePanelStore: { changeShareUser, meInfo, shareToMeList }
      }
    }
  } = props;

  // 弹窗显示状态
  const [isModalShow, setModalShowStatus] = useState(false);

  // tab 切换状态
  const [activeTab, setActiveTab] = useState(TabList.share);

  // 切换日程共享用户
  const handleChangeShareUser = useCallback(
    throttle(
      async (id: any) => {
        await changeShareUser(id);
        initScheduleList();
        moduleClick('b_oa_40xnj9q0_mc', null);
      },
      500,
      { trailing: false }
    ),
    []
  );

  const handleTab = (item) => {
    setActiveTab(item);
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <span>{i18nClient.t('schedule_share_panel_calendar', '日程')}</span>
        <Button
          size="small"
          onClick={() => {
            setModalShowStatus(true);
            moduleClick('b_oa_n0d9kcrh_mc', null);
          }}
        >
          {i18nClient.t('schedule_share_panel_setters', '设置')}
        </Button>
      </div>
      <div className={styles.list}>
        {meInfo && (
          <div className={classNames(styles.box, styles[meInfo.scheduleTheme])}>
            <Checkbox
              checked={meInfo.checked}
              onChange={() => {
                handleChangeShareUser('self');
              }}
            >
              <div className={styles.user}>
                <img
                  className={styles.headicon}
                  src={meInfo.avatar || defaultImg}
                />
                <Tooltip message={i18nClient.t(
                  'schedule_share_panel_meinfo',
                  '{meInfo}（自己）',
                  { meInfo: meInfo.name + getEnname(meInfo.enName) }
                )} autoDestory>
                  <span>
                    {i18nClient.t(
                      'schedule_share_panel_meinfo',
                      '{meInfo}（自己）',
                      { meInfo: meInfo.name + getEnname(meInfo.enName) }
                    )}
                  </span>
                </Tooltip>
              </div>
            </Checkbox>
          </div>
        )}
        {shareToMeList.map(item => (
          <div
            className={classNames(styles.box, styles[item.scheduleTheme])}
            key={item.id}
          >
            <Checkbox
              checked={!!item.checked}
              onChange={() => {
                handleChangeShareUser(item.id);
              }}
            >
              <div className={styles.user}>
                <img
                  className={styles.headicon}
                  src={item.userAvatar || defaultImg}
                />
                <Tooltip message={item.userName + getEnname(item.enName)} autoDestory>
                  <span>{item.userName + getEnname(item.enName) || ' '}</span>
                </Tooltip>
              </div>
            </Checkbox>
          </div>
        ))}
      </div>
      {isModalShow && (
        <Modal
          className={styles.sharemodal}
          title={i18nClient.t(
            'schedule_share_panel_share_setters',
            '日历设置'
          )}
          onClose={() => {
            setModalShowStatus(false);
          }}
        >
          <Modal.Body className={styles.sharemodalbody}>
            <div className={styles['tab-wrapper']}>
              <div className={styles['tab-list']}>
                <div className={classNames(styles.list, activeTab === TabList.share && styles.active)} onClick={() => handleTab(TabList.share)}>
                  <i className={classNames(styles.icon, 'dxcalendar dx-calcalendar-share-r')} />
                  {i18nClient.t('schedule_share_panel_tab_share', '日历共享')}
                </div>
                <div className={classNames(styles.list, activeTab === TabList.notice && styles.active)} onClick={() => handleTab(TabList.notice)}>
                  <i className={classNames(styles.icon, 'dxcalendar dx-calbell-o-r')} />
                  {i18nClient.t('schedule_share_panel_tab_notice', '通知')}
                </div>
              </div>
              {activeTab === TabList.share && <ShareModel />}
              {activeTab === TabList.notice && <NoticeModel />}
            </div>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
});

export default inject(stroes => ({
  stroes
}))(ScheduleSharePanel);
