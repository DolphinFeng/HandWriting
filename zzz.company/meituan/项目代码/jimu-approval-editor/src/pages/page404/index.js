import styles from './index.less';

export default () => {
  return (
    <div className={styles.notfound}>
      <div className='content'>
        <span className='icon'>404</span>
        <span className='tip'>404错误</span>
        <span className='detail'>页面不存在，检查一下链接地址吧！</span>
      </div>
    </div>
  );
};
