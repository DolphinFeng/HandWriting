

import React from 'react';
import { Icon } from '@ss/mtd-react';
import styles from './index.less';

interface ITitle {
  title: string;
  onClose?: () => void;
  closeable?: boolean;
  iconType?: string;
}

export default ((props: ITitle) => {
  const {
    title = '', closeable = true, onClose, iconType
  } = props;

  const handleClick = () => {
    onClose && onClose();
  };
  return (
    <div className={styles.dlgTitle}>
      <label className={styles.title}>
        {iconType && <Icon type={iconType}></Icon>}
        {title}</label>
      {closeable && <Icon className={styles.close} onClick={handleClick} type='close' />}
    </div>
  );
});
