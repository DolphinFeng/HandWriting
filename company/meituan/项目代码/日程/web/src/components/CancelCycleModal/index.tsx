import React, { useState, useCallback } from 'react';
import {
  Button, Modal, Input, Radio
} from '@ss/mtd-react';
import { EEffectiveRangeType } from '@/consts';
import styles from './index.less';
import { i18nClient } from '@sailor/i18n-web';


interface ICancelProps {
  openDlg: boolean;
  confirm: (type: EEffectiveRangeType, reason: string) => void;
  closeCancleCycleDlg: () => void;
}

export default function CancelCycleModal(props: ICancelProps) {
  const {
    openDlg, confirm, closeCancleCycleDlg
  } = props;
  const [reason, setReason] = useState('');
  const [type, setType] = useState(EEffectiveRangeType.SINGLE);
  const { clientWidth } = document.querySelector('body');

  const handleSubmit = () => {
    confirm(type, reason);
  };

  const closeAllModal = () => {
    if (closeCancleCycleDlg) {
      closeCancleCycleDlg();
    }
  };

  const handleChangeValue = useCallback((e) => {
    setReason(e.target.value);
  }, []);

  const handlePlaceChange = (checkedValue) => {
    setType(checkedValue);
  };

  return (
    <div>
      {openDlg && (
        <Modal
          className={styles.modal}
          maskClosable={false}
          title={i18nClient.t('cancel_cycle_modal_select_the_scope_of_validity', '此日程为循环日程，请选择生效范围')}
          onClose={closeAllModal}
        >
          <Modal.Body>
            <Radio.Group
              value={type}
              onChange={handlePlaceChange}
              className={styles.radio_group}
            >
              <Radio
                className={styles.radio_item}
                style={{ paddingLeft: clientWidth <= 300 ? '0px' : '130px' }}
                key={EEffectiveRangeType.SINGLE}
                value={EEffectiveRangeType.SINGLE}
              >
               {i18nClient.t('cancel_cycle_modal_this_calendar', '此日程')}
              </Radio>
              <Radio
                className={styles.radio_item}
                style={{ paddingLeft: clientWidth <= 300 ? '0px' : '130px' }}
                key={EEffectiveRangeType.CYCLE}
                value={EEffectiveRangeType.CYCLE}
              >
                {i18nClient.t('cancel_cycle_modal_all_calendar', '所有日程')}
              </Radio>
            </Radio.Group>
            <Input.TextArea
              className={styles.input}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              value={reason}
              maxLength={100}
              onChange={handleChangeValue}
              autosize={{ minRows: 2, maxRows: 2 }}
              placeholder={i18nClient.t('cancel_cycle_modal_tell_participants_the_reason_optional', '告诉参与者取消原因，100字以内，选填')}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button
              className={`${styles.cancel} ${styles.btn}`}
              onClick={closeAllModal}
            >
              {i18nClient.t('cancel_cycle_modal_no_cancellation_for_now', '暂不取消')}
            </Button>
            <Button
              type="primary"
              className={styles.btn}
              onClick={handleSubmit}
            >
              {i18nClient.t('cancel_cycle_modal_cancellation_calendar', '取消日程')}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}
