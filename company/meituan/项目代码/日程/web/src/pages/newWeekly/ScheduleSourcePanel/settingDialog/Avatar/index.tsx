import { i18nClient } from '@sailor/i18n-web';
import { EPERM_TYPE } from '@/common/interface/IcalendarInfo';
import React from 'react';
import styles from './index.less';
import classnames from 'classnames';
import { defaultImg } from '../PermissionSettingDlg/PermissionSelectClass';

interface IProps {
  name: string;
  src: string;
  type?: EPERM_TYPE;
  jobStatus?: number;
}

const Avatar = (props: IProps) => {
  const {
    name, src, type, jobStatus
  } = props;
  return (
    <div className={styles.avatar}>
      {type === EPERM_TYPE.ORG_ID ? (
        <i
          className={classnames(styles.icon, 'dxcalendar dx-calhierarchy')}
        ></i>
      ) : (
        <img className={styles.img} src={src || defaultImg}></img>
      )}
      <label className={styles.name}>{`${name}${
        type === EPERM_TYPE.USER_ID && jobStatus === 16
          ? i18nClient.t('avatar_out_job', '（离职）')
          : ''
      }`}</label>
    </div>
  );
};

export default Avatar;
