import { Icon } from '@ss/mtd-react';
import styles from './index.less';

export default () => {
  return (
    <div className={styles.nopermission}>
      <div className='content'>
        <Icon type='lock-o' className='icon' />
        <span className='tip'>暂无浏览权限</span>
        <span className='detail'>还没有浏览权限，请联系管理员开通权限！</span>
      </div>
    </div>
  );
};
