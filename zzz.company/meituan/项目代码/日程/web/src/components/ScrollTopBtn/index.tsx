import React from 'react';
import { Icon } from '@ss/mtd-react';
import styles from './index.less';

interface IScrollTopBtnPropsType {
  onScrollTop?: Function;
  style?: React.CSSProperties;
}

export default function ScrollTopBtn(props: IScrollTopBtnPropsType) {
  const { onScrollTop, style } = props;
  return (
    <div
      onClick={() => {
        onScrollTop();
      }}
      style={style}
      className={styles.contanier}
    >
      <Icon type="top" style={{ color: 'rgba(0, 0, 0, 0.84)', fontSize: 16 }} />
    </div>
  );
}
