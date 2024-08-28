import { Button, Form, Upload, Icon } from '@ss/mtd-react';
import './index.less';
import React, { useState, useCallback } from 'react';

enum CompleteType {
  Initialize = 'init',
  Loading = 'loading',
  Success = 'success',
  Failed = 'failed'
}

export default () => {
  const [completeType, setCompleteType] = useState<CompleteType>(
    CompleteType.Initialize
  );

  const [message, setMessage] = useState<string>('');

  const onUpload = () => {
    setCompleteType(CompleteType.Loading);
  };

  const onError = () => {
    setCompleteType(CompleteType.Failed);
    setMessage('网络传输失败（1）');
  };

  const onSuccess = ({ data, status }) => {
    if (status === 1) {
      setCompleteType(CompleteType.Success);
    } else {
      setCompleteType(CompleteType.Failed);
      setMessage(data.message || '名单解析出错 (0)');
    }
  };

  const renderStatus = useCallback(() => {
    if (completeType === CompleteType.Success) {
      return <Icon className='success' type='success-circle'></Icon>;
    }
    if (completeType === CompleteType.Failed) {
      return <Icon className='failed' type='error-circle'></Icon>;
    }
    return null;
  }, [completeType]);

  const renderMessage = useCallback(() => {
    if (completeType === CompleteType.Loading) {
      return '名单上传中......';
    }
    if (completeType === CompleteType.Success) {
      return '名单上传成功，<b>请耐心等待批量转移成功通知后再导入新名单。</b>';
    }
    if (completeType === CompleteType.Failed) {
      return `<b style="color:#f5483b">${message}</b>`;
    }
    return '';
  }, [completeType, message]);

  return (
    <div className='batch-transform'>
      <Form>
        <Form.Item>
          <div className='subtitle'>批量转移在途审批单据</div>
        </Form.Item>
        <Form.Item>
          <div>
            请下载模板后按照模板格式填写后导入，如人数较多，执行需要时间，导入成功后请耐心等待审批管理助手公众号转移完成通知。
          </div>
        </Form.Item>

        <Form.Item>
          <Upload
            action='/service/console/bill/batch/transfer/upload'
            // action='/service/propla/file/upload'
            onUpload={onUpload}
            accept='.xlsx'
            onError={onError}
            onSuccess={onSuccess}
            style={{ marginRight: 10 }}
          >
            <Button loading={completeType === CompleteType.Loading}>
              导入名单
            </Button>
          </Upload>

          <a
            href='https://s3plus.sankuai.com/v1/mss_8c96abc444e14a23a220b2bd8d3bbcc8/ape/template.xlsx'
            target='_blank'
          >
            下载模板
          </a>
        </Form.Item>
        <Form.Item>
          <div className='message'>
            {renderStatus()}
            <span
              dangerouslySetInnerHTML={{
                __html: renderMessage()
              }}
            ></span>
          </div>
        </Form.Item>

        <Form.Item>
          <div className='notice'>注意事项</div>
          1.该转移操作不可逆，请务必在导入名单前仔细检查，确保名单正确，千万不要错行。
          <br />
          2.如名单人数较多，可能在途单据也很多，强烈建议分批导入。
          <br />
          3.如果多人操作，请协商错开导入时间。
        </Form.Item>
      </Form>
    </div>
  );
};
