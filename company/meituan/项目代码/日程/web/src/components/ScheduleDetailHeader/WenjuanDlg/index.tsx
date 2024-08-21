// 问卷
import React from 'react';
import { i18nClient } from '@sailor/i18n-web';
import { Button, Modal } from '@ss/mtd-react';
import styles from './index.less';
import WenjuanPngZh from '@/asserts/images/zh/wenjuan.png';
import WenjuanPngZhHK from '@/asserts/images/zh-HK/wenjuan.png';
import WenjuanPngEn from '@/asserts/images/en/wenjuan.png';

interface IWenjuanDlg {
  closeDlg: () => void;
  jumpSurvey: () => void;
  isOrg: boolean;
}

// 问卷
export const WenjuanDlg = (props: IWenjuanDlg) => {
  const { closeDlg, jumpSurvey, isOrg } = props;

  const titleDiv = (
    <div className={styles.top}>
      {i18nClient.language === 'zh' && (
        <img
          src={WenjuanPngZh}
          alt={i18nClient.t('wenjuan_dlg_guide', '引导')}
        />
      )}
      {i18nClient.language === 'zh-HK' && (
        <img
          src={WenjuanPngZhHK}
          alt={i18nClient.t('wenjuan_dlg_guide', '引导')}
        />
      )}
      {i18nClient.language === 'en' && (
        <img
          src={WenjuanPngEn}
          alt={i18nClient.t('wenjuan_dlg_guide', '引导')}
        />
      )}
    </div>
  );

  const buff = isOrg
    ? i18nClient.t(
      'wenjuan_dlg_parcitipants_write_wenjuan',
      '参会者填写问卷，向你反馈会议感受'
    )
    : i18nClient.t(
      'wenjuan_dlg_you_write_wenjuan',
      '填写问卷，向组会者反馈感受'
    );

  const btnBuff = isOrg
    ? i18nClient.t('wenjuan_dlg_view_feedback', '查看反馈')
    : i18nClient.t('wenjuan_dlg_write_feedback', '填写反馈');

  return (
    <Modal title={titleDiv} onClose={closeDlg} className={styles.wenjunDlg}>
      <Modal.Body>
        <p className={styles.title}>{buff}</p>
        <p className={styles.info}>
          {i18nClient.t(
            'wenjuan_dlg_improve_efficiency',
            '协同改进开会方式，提升会议效率'
          )}
        </p>
      </Modal.Body>
      <Modal.Footer className={styles.wenjuanFooter}>
        <Button type="primary" onClick={jumpSurvey}>
          <span className={styles.mediumBtn}>{btnBuff}</span>
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
