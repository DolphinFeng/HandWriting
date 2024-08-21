import { i18nClient } from '@sailor/i18n-web';
/*
 * @Description: 文件描述
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2021-03-09 18:04:15
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2021-03-25 18:08:53
 * @FilePath: /scheduleweb/src/pages/scheduleEdit/PageHeader/index.tsx
 */
import React from 'react';
import classNames from 'classnames';
import { Button } from '@ss/mtd-react';
import PopUpBtn from '@/components/PopUpBtn';
import { addModuleClick } from '@/services/lxService';

import styles from './index.less';

interface IPageHeader {
  isInMeetingNoJump?: boolean;
  isInMeetingGroup?: boolean;
  id?: string; // this.props.match?.params.id
  handleCancelSchedule?: any;
  btnLoadingStatus: boolean; // this.btnLoadingStatus
  handleCheckEdit?: any;
  handleJumpCreate?: any;
  chatType?: string; // this.chatType
  closeGroupPage?: any;
}
export default class PageHeader extends React.Component<IPageHeader> {
  render() {
    const {
      isInMeetingNoJump,
      id,
      handleCancelSchedule,
      btnLoadingStatus,
      handleCheckEdit,
      chatType,
      closeGroupPage,
      isInMeetingGroup
    } = this.props;

    return (
      <>
        {!isInMeetingNoJump ? (
          <div className={styles.header}>
            <span className={styles.title}>
              {id
                ? i18nClient.t('page_header_edit_schedule', '编辑日程')
                : i18nClient.t('page_header_create_schedule', '创建日程')}
            </span>
            <Button
              className={classNames(styles.btn, styles.cancel)}
              onClick={() => {
                handleCancelSchedule && handleCancelSchedule(false);
                addModuleClick('b_oa_sx7y3kgs_mc');
              }}
            >
              {i18nClient.t('page_header_cancel', '取消')}
            </Button>
            <Button
              className={styles.btn}
              loading={btnLoadingStatus}
              type="primary"
              onClick={handleCheckEdit}
            >
              {i18nClient.t('page_header_fufilled', '完成')}
            </Button>
            {!isInMeetingGroup && <PopUpBtn />}
          </div>
        ) : (
          <div
            className={classNames(styles.header, styles.groupHeader)}
            style={{
              boxShadow: 'none'
            }}
          >
            <span className={styles.title}>
              {chatType === 'groupchat'
                ? i18nClient.t('page_header_group_schedule', '群日程')
                : i18nClient.t('page_header_see_schedule', '查看日程')}
            </span>
            <div className={styles.groupBtns}>
              <Button
                onClick={closeGroupPage}
                hoverShape
                icon="close"
                shape="circle"
                className={styles.closeGroupBtn}
              />
            </div>
          </div>
        )}
      </>
    );
  }
}
