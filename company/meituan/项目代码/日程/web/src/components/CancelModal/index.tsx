import React, { useState, useCallback } from 'react';
import { Button, Modal, Input } from '@ss/mtd-react';
import styles from './index.less';
import { i18nClient } from '@sailor/i18n-web';


interface ICancelProps {
  openDlg: boolean;
  confirm: (type: string, reason: string) => void;
  closeCancelDlg: () => void;
}

export default function CancelModal(props: ICancelProps) {
  const {
    openDlg, confirm, closeCancelDlg
  } = props;
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    confirm(reason);
  };

  const closeAllModal = () => {
    if (closeCancelDlg) {
      closeCancelDlg();
    }
  };

  const handleChangeValue = useCallback((e) => {
    setReason(e.target.value);
  }, []);

  return (
    <div>
      {openDlg && (
        <Modal
          className={styles.modal}
          maskClosable={false}
          title={i18nClient.t('cancel_modal_cancellation_calendar_title', '取消日程')}
          onClose={closeAllModal}
        >
          <Modal.Body>
          <Input.TextArea
            className={styles.input}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            value={reason}
            maxLength={100}
            onChange={handleChangeValue}
            autosize={{ minRows: 4, maxRows: 4 }}
            placeholder={i18nClient.t('cancel_modal_tell_participants_the_reason_optional', '告诉参与者取消原因，100字以内，选填')}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              className={`${styles.cancel} ${styles.btn}`}
              onClick={closeAllModal}
            >
              {i18nClient.t('cancel_modal_no_cancellation_for_now', '暂不取消')}
            </Button>
            <Button
              type="primary"
              className={styles.btn}
              onClick={handleSubmit}
            >
              {i18nClient.t('cancel_modal_cancel_calendar', '取消日程')}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
