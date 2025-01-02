import ReactJson from 'react-json-view';
import {Modal} from 'antd';

export default function JsonViewDlg(props: any) {
  const {visible, closeDialog, content} = props;
  return (
    <Modal title="详情" open={visible} onOk={closeDialog} onCancel={closeDialog} width={800}>
      <ReactJson
        src={content}
        name={false}
        collapsed={2}
        displayDataTypes={false}
        displayObjectSize={false}
        enableClipboard={true}
        iconStyle="square"
      />
    </Modal>
  );
}
