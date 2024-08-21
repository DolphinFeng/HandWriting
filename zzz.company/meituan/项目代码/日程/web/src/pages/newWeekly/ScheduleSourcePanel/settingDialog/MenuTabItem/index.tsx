import React from 'react';
import styles from './index.less';
import classnames from 'classnames';

interface IProps {
  name: string;
  count: number;
  active: boolean;
  onClick: () => void;
  split?: boolean;
}


const MenuTabItem = ((props: IProps) => {
  const {
    name, count, active, onClick, split
  } = props;
  const handleClick = () => {
    onClick && onClick();
  };
  return (<div onClick={handleClick} className={ classnames(styles.tab, active ? styles.active : '')}>
    {`${name} ${count}`}
     {split && <div className={styles.split}></div> }
    </div>);
});

export default MenuTabItem;
