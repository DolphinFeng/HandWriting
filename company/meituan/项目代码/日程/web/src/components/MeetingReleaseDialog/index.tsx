import { i18nClient } from '@sailor/i18n-web';
/*
 * @Description: 释放会议室弹框
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-06-10 15:57:56
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-10-19 16:26:18
 * @FilePath: /scheduleweb/src/components/MeetingReleaseDialog/index.tsx
 */
import React from 'react';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { Button, Modal } from '@ss/mtd-react';
import { messageStore } from '@/store/global';
import { weekObject } from '@/consts/weekly';
import { meetingRelease } from '@/services/apis';
import { getQuaterMinuteMoment } from '@/utils';
import { addModuleClick } from '@/services/lxService';
import styles from './index.less';
import { YearMonthDay } from '@/utils/i18n';

interface IDetailDelete {
  openDlg: boolean;
  closeReleaseDlg?: () => void;
  id: string;
  roomName: string;
  startTime: number;
  endTime: number;
  closePop?: () => void;
}

export default class MeetingReleaseDialog extends React.Component<IDetailDelete> {
  handleSubmit = async () => {
    const { id } = this.props;
    await meetingRelease({
      id
    });
    messageStore.success(
      i18nClient.t('meeting_release_dialog_release_successfully', '释放成功')
    );
    addModuleClick('b_oa_10sy4oo7_mc');
    this.closeAllModal();
    this.closePop();
  };

  checkAndSubmit = () => {
    const { endTime } = this.props;
    const current = dayjs().valueOf();
    if (endTime - current <= 15 * 60 * 1000) {
      if (endTime < current) {
        messageStore.error(
          i18nClient.t(
            'meeting_release_dialog_end_up_release_failed',
            '会议已结束，无法释放'
          )
        );
        this.closeAllModal();
      } else {
        messageStore.error(
          i18nClient.t(
            'meeting_release_dialog_less_than_fifteen_release_failed',
            '剩余不足15分钟，无法释放'
          )
        );
      }
    } else {
      this.handleSubmit();
    }
  };

  closeAllModal = () => {
    const { closeReleaseDlg } = this.props;
    if (closeReleaseDlg) {
      closeReleaseDlg();
    }
  };

  closePop = () => {
    const { closePop } = this.props;
    if (closePop) {
      closePop();
    }
  };

  render() {
    const {
      openDlg, roomName, startTime, endTime
    } = this.props;
    const current = dayjs().valueOf();

    let timeBuffer;
    // 会议还未开始
    if (current < startTime) {
      timeBuffer = `${dayjs(startTime).format(YearMonthDay)} ${
        weekObject[new Date(startTime).getDay()]
      } ${dayjs(startTime).format('HH:mm')}`;
    } else {
      // 会议已经开始
      const canReleaseStart = getQuaterMinuteMoment().valueOf();
      timeBuffer = `${dayjs(canReleaseStart).format(YearMonthDay)} ${
        weekObject[new Date(canReleaseStart).getDay()]
      } ${dayjs(canReleaseStart).format('HH:mm')}`;
    }
    const endHour = dayjs(endTime).hour();
    // 结束时间为0点 处理成24点
    if (+endHour === 0) {
      timeBuffer = `${timeBuffer} - 24:00`;
    } else {
      timeBuffer = `${timeBuffer} - ${dayjs(endTime).format('HH:mm')}`;
    }
    return (
      <div>
        {openDlg && (
          <Modal
            style={{ width: 400 }}
            maskClosable={false}
            title={i18nClient.t(
              'meeting_release_dialog_release_meeting_room',
              '释放会议室'
            )}
            onClose={this.closeAllModal}
          >
            <Modal.Body>
              <div className={styles.labelContainer}>
                <div className={styles.labelName}>
                  {i18nClient.t(
                    'meeting_release_dialog_meeting_room',
                    '会议室'
                  )}
                </div>
                <div className={styles.valueName}>{roomName}</div>
              </div>
              <div className={styles.labelContainer}>
                <div className={styles.labelName}>
                  {i18nClient.t('meeting_release_dialog_time', '时间')}
                </div>
                <div className={styles.valueName}>{timeBuffer}</div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                className={classNames(styles.btn, styles.cancel)}
                onClick={this.closeAllModal}
              >
                {i18nClient.t('meeting_release_dialog_cancel', '取消')}
              </Button>
              <Button
                className={styles.btn}
                type="primary"
                onClick={this.checkAndSubmit}
              >
                {i18nClient.t('meeting_release_dialog_confirm', '确定')}
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>
    );
  }
}
