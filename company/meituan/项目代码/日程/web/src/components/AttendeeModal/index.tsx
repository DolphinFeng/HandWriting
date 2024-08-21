import React from 'react';
import { Button, Modal, Icon } from '@ss/mtd-react';
import { EInformType } from '@/consts';
import { addModuleClick } from '@/services/lxService';
import styles from './index.less';
import { i18nClient } from '@sailor/i18n-web';


interface IDetailDelete {
  openDlg: boolean;
  isChangeAttendee: boolean;
  justAddAttendees?: boolean;
  closeAttendeeModal?: () => void;
  informAttendeeCallBack?: (isInformPart: string) => void;
}

export default class AttendeeModal extends React.Component<IDetailDelete> {
  closeAttendeeModal = () => {
    const { closeAttendeeModal } = this.props;
    closeAttendeeModal && closeAttendeeModal();
    // 返回编辑埋点
    if (this.props.isChangeAttendee) {
      addModuleClick('b_oa_052658le_mc');
    } else {
      addModuleClick('b_oa_i06jftaf_mc');
    }
  };

  componentDidUpdate = () => {
    // 展示推送弹窗埋点
    if (this.props.openDlg) {
      if (this.props.isChangeAttendee) {
        addModuleClick('b_oa_ika6x1tm_mc');
      } else {
        addModuleClick('b_oa_3hsex85v_mc');
      }
    }
  };

  handleInformSubmit = (informType) => {
    const { informAttendeeCallBack } = this.props;
    informAttendeeCallBack && informAttendeeCallBack(informType);
    if (this.props.isChangeAttendee) {
      if (informType === EInformType.PART) {
        addModuleClick('b_oa_hkhlwg0t_mc');
      } else {
        addModuleClick('b_oa_b68t4alz_mc');
      }
    } else if (informType === EInformType.NONE) {
      addModuleClick('b_oa_dmemvw7u_mc');
    } else {
      addModuleClick('b_oa_dl1hmzhh_mc');
    }
  };

  render() {
    const {
      openDlg,
      isChangeAttendee,
      justAddAttendees
    } = this.props;
    return (
      <>
        {openDlg && (
          <Modal
            maskClosable
            title=""
            closable
            onClose={this.closeAttendeeModal}
            className={styles.attendeeModalWrap}
          >
            <Modal.Body>
              <div className={styles.bodyHead}>
                <Icon type="warningmini" />
                {isChangeAttendee ? (
                  <div className={styles.title}>{i18nClient.t('attendee_modal_body_head_notified_who', '此次日程变更通知哪些人?')}</div>
                ) : (
                  <div className={styles.title}>
                    {i18nClient.t('attendee_modal_body_head_is_notified', '此次日程变更是否通知参与者?')}
                  </div>
                )}
              </div>
            </Modal.Body>

            <Modal.Footer>
              {/* <Button
                onClick={this.closeAttendeeModal}
              >
                {i18nClient.t('', '返回编辑')}
              </Button> */}
              {isChangeAttendee ? (
                <>
                  <Button
                    onClick={() => {
                      this.handleInformSubmit(EInformType.PART);
                    }}
                  >
                    {justAddAttendees ? i18nClient.t('attendee_modal_body_head_notified_added', '通知新增的参与者') : i18nClient.t('attendee_modal_body_head_notified_changed', '通知变更的参与者')}
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      this.handleInformSubmit(EInformType.ALL);
                    }}
                  >
                    {i18nClient.t('attendee_modal_body_head_notified_all', '通知所有参与者')}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      this.handleInformSubmit(EInformType.NONE);
                    }}
                  >
                    {i18nClient.t('attendee_modal_body_head_unannounced', '不通知')}
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      this.handleInformSubmit(EInformType.ALL);
                    }}
                  >
                    {i18nClient.t('attendee_modal_body_head_announced', '通知')}
                  </Button>
                </>
              )}
            </Modal.Footer>
          </Modal>
        )}
      </>
    );
  }
}
