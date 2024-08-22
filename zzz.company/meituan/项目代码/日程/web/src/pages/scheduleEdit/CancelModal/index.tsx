import { i18nClient } from '@sailor/i18n-web';
/*
 * @Description: 是否重置已填写的弹框
 */
import React from 'react';
import {
  Button, Icon, Modal
} from '@ss/mtd-react';
// import styles from './index.less';

export default function CancelModal(props) {
  const { nShowCancelDlg, closeShowCancelDlg, submitShowCancelDlg } = props;
  if (!nShowCancelDlg) return null;

  return (
        <Modal
        title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Icon
                    type="warning-circle"
                    style={{ fontSize: 24, lineHeight: '26px', color: '#ffc300' }}
                />
                <div
                    style={{ fontSize: 16, lineHeight: '26px', marginLeft: 10 }}
                >
                    {i18nClient.t('cancel_modal_schedule_creating', '您还有一个日程在创建中，确定舍弃吗?')}
                </div>
            </div>
        }
        closable={false}
        onClose={closeShowCancelDlg}
        style={{ width: 432 }}
        >
        <Modal.Footer>
            <Button
            style={{ marginRight: '12px' }}
            onClick={closeShowCancelDlg}
            >
            {i18nClient.t('cancel_modal_cancel', '取消')}
            </Button>
            <Button
            type="primary"
            onClick={submitShowCancelDlg}
            >
            {i18nClient.t('cancel_modal_confirm', '确定')}
            </Button>
        </Modal.Footer>
        </Modal>
  );
}
