import ReactDOM from 'react-dom';
import styles from './index.less';

const el = document.querySelector('body');
export function ActionWrp(props) {
  return ReactDOM.createPortal(
    <div className={styles.ActionWrp}>{props.children}</div>,
    el
  );
}
