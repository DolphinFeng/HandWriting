import { i18nClient } from '@sailor/i18n-web';
/*
 * @Description: 转让会议室弹框
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-06-10 15:57:56
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-10-19 16:25:55
 * @FilePath: /scheduleweb/src/components/MeetingTransferDialog/index.tsx
 */
import React from 'react';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { Button, Modal } from '@ss/mtd-react';
import { messageStore } from '@/store/global';
import { weekObject } from '@/consts/weekly';
import { meetingTransfer } from '@/services/apis';
import { SingleUserSelect } from '@/components';
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

interface ITransferState {
  empId?: string;
}

export default class MeetingTransferDialog extends React.Component<
IDetailDelete,
ITransferState
> {
  constructor(props) {
    super(props);
    this.state = {
      empId: ''
    };
  }

  handleSubmit = async () => {
    const { id } = this.props;
    const { empId } = this.state;
    if (!empId) {
      messageStore.error(
        i18nClient.t(
          'meeting_transfer_dialog_please_chose_transferor',
          '请选择转让人'
        )
      );
    } else {
      await meetingTransfer({
        id,
        empId
      });
      messageStore.success(
        i18nClient.t(
          'meeting_transfer_dialog_transfer_successfully',
          '转让成功'
        )
      );
      addModuleClick('b_oa_fc1rcqjy_mc');
      this.closeAllModal();
      this.closePop();
    }
  };

  checkAndSubmit = () => {
    const { endTime } = this.props;
    const current = dayjs().valueOf();
    if (endTime - current <= 15 * 60 * 1000) {
      if (endTime < current) {
        messageStore.error(
          i18nClient.t(
            'meeting_transfer_dialog_meeting_ended_no_transfer',
            '会议已结束，无法转让'
          )
        );
        this.closeAllModal();
      } else {
        messageStore.error(
          i18nClient.t(
            'meeting_transfer_dialog_little_time_no_transfer',
            '剩余不足15分钟，无法转让'
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
    const { empId } = this.state;
    const current = dayjs().valueOf();
    let timeBuffer;
    // 会议未开始
    if (current < startTime) {
      timeBuffer = `${dayjs(startTime).format(YearMonthDay)} ${
        weekObject[new Date(startTime).getDay()]
      } ${dayjs(startTime).format('HH:mm')}`;
    } else {
      // 会议已经开始，不考虑已经开始还有15分钟就结束的会议，前一步会卡
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
              'meeting_transfer_dialog_transfer_meeting_room',
              '转让会议室'
            )}
            onClose={this.closeAllModal}
          >
            <Modal.Body>
              <div className={styles.labelContainer}>
                <div className={styles.labelName}>
                  {i18nClient.t(
                    'meeting_transfer_dialog_meeting_room',
                    '会议室'
                  )}
                </div>
                <div className={styles.valueName}>{roomName}</div>
              </div>
              <div className={styles.labelContainer}>
                <div className={styles.labelName}>
                  {i18nClient.t('meeting_transfer_dialog_time', '时间')}
                </div>
                <div className={styles.valueName}>{timeBuffer}</div>
              </div>
              <div className={styles.labelContainer}>
                <div className={styles.labelName}>
                  {i18nClient.t(
                    'meeting_transfer_dialog_transfer_to',
                    '转让给'
                  )}
                </div>
                <div className={styles.valueName}>
                  <SingleUserSelect
                    width={292}
                    value={empId}
                    onChange={(value) => {
                      this.setState({
                        empId: value
                      });
                    }}
                  />
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                onClick={this.closeAllModal}
                className={classNames(styles.btn, styles.cancel)}
              >
                {i18nClient.t('meeting_transfer_dialog_cancel', '取消')}
              </Button>
              <Button
                type="primary"
                className={styles.btn}
                onClick={this.checkAndSubmit}
              >
                {i18nClient.t('meeting_transfer_dialog_confirm', '确定')}
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>
    );
  }
}
