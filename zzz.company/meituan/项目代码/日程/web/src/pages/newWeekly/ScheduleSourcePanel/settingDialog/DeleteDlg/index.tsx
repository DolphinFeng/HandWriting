import { i18nClient } from '@sailor/i18n-web';
import { Button, Modal } from '@ss/mtd-react';
import React from 'react';
import DlgTitle from '../DlgTitle';
import classnames from 'classnames';

import styles from './index.less';

interface IDeleteProps {
  onDelete?: () => void;
  onCancel?: () => void;
}

const DeleteDlg = (props: IDeleteProps) => {
  const { onDelete, onCancel } = props;
  const handleDelete = () => {
    onDelete && onDelete();
  };

  const handleClose = () => {
    onCancel && onCancel();
  };

  return (
    <Modal
      maskClosable={false}
      closable={false}
      title={
        <DlgTitle
          title={i18nClient.t('delete_dlg_confirm_delete', '确认删除该日历吗?')}
          iconType="warning-circle"
          closeable={false}
        />
      }
    >
      <Modal.Body>
        <div className={styles.deleteBody}>
          {i18nClient.t(
            'delete_dlg_all_member_cannot_ues_after_delete',
            '删除该日历，所有日历成员都将无法再使用。'
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div>
          <Button
            onClick={handleClose}
            className={classnames(styles.btn, styles.cancel)}
          >
            {i18nClient.t('delete_dlg_cancel', '取消')}
          </Button>
          <Button
            onClick={handleDelete}
            className={classnames(styles.btn)}
            type="danger"
          >
            {i18nClient.t('delete_dlg_delete', '删除')}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteDlg;
