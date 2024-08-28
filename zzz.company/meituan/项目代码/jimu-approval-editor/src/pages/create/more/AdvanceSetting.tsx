import { Input, Button, Form, message } from '@ss/mtd-react';
import React, { useCallback, useRef } from 'react';
import { toJS } from 'mobx';
import Styles from './index.less';
import {
  ICallBackSetting,
  IClientAppkeys,
  CallBackSetting
} from './index.type';
import { useRequest } from '@/services/useRequest';
import { CALLBACK_DEBUG_URL } from '@/services/bpmn';
import AdvanceSettingStartInterface from './AdvanceSettingStartInterface';
import AdvanceEncryption from './AdvanceEncryption';

export interface IProps {
  onChange: Function;
  secret: boolean;
  callbackSetting: ICallBackSetting;
  clientAppKeys: IClientAppkeys;
}

export default function AdvanceSetting(props: IProps) {
  const { onChange, callbackSetting, clientAppKeys, secret } = props;

  const { fetchData } = useRequest(CALLBACK_DEBUG_URL, 'post');

  const formRef = useRef<any>(null);

  const handleRequestTest = useCallback(() => {
    const validate = formRef?.current?.validateFields();

    if (!validate) {
      return;
    }

    const { url, accessKey, accessSecret } = callbackSetting;

    fetchData({
      url,
      accessKey,
      accessSecret
    })
      .then((data) => {
        if (!data) {
          return;
        }
        message.success({
          message: '接口调用成功.'
        });
      })
      .catch((error) => {
        message.error({
          message: `接口调用失败，请检查.${error}`
        });
      });
  }, [callbackSetting]);

  const handleInputChange = useCallback(
    (fieldKey, value) => {
      callbackSetting[fieldKey] = value;
      onChange(
        {
          ...toJS(callbackSetting)
        },
        CallBackSetting
      );
    },
    [callbackSetting]
  );

  return (
    <div className={Styles['setting-panel']}>
      <div className={Styles['setting-item']}>
        <div className={Styles['setting-item-title']}>高级设置</div>
        <div className={Styles['setting-item-desc']}>回调设置</div>
        <div className={Styles['setting-item-desc-detail']}>
          当审批节点被通过、驳回、撤回时，其他系统可以监听这些事件并做对应的处理。配置方法请参考
          <a target='_blank' href='https://km.sankuai.com/page/1300877614'>
            帮助文档
          </a>
          。
        </div>
        <Form
          ref={formRef}
          defaultFieldsValue={toJS(callbackSetting)}
          onFieldValueChange={handleInputChange}
          className={Styles['setting-item-content']}
        >
          <Form.Item
            label='回调地址'
            rules={[
              {
                required: true,
                message: '测试回调必须输入回调地址'
              }
            ]}
            formItemKey='url'
            labelPosition='top'
            style={{ marginBottom: 0 }}
          >
            <Input maxLength={120} toFormItem></Input>
          </Form.Item>
          <Form.Item
            label='AccessKey'
            formItemKey='accessKey'
            labelPosition='top'
            style={{ marginBottom: 0 }}
          >
            <Input toFormItem></Input>
          </Form.Item>
          <Form.Item
            label='AccessSecret'
            formItemKey='accessSecret'
            labelPosition='top'
            style={{ marginBottom: 0 }}
          >
            <Input toFormItem></Input>
          </Form.Item>
          <Form.Item className={Styles['test-button']}>
            <Button onClick={handleRequestTest} type='primary'>
              测试提交
            </Button>
          </Form.Item>
        </Form>
        <AdvanceSettingStartInterface
          clientAppKeys={clientAppKeys}
          onChange={onChange}
        />
        <AdvanceEncryption
          onChange={onChange}
          secret={secret}
        ></AdvanceEncryption>
      </div>
    </div>
  );
}
