import React from 'react';
import { Radio } from '@ss/mtd-react';
import Styles from './index.less';
import { SecretSetting } from './index.type';

export interface IProps {
  onChange: Function;
  secret: boolean;
}

export default function AdvanceEncryption(props: IProps) {
  const { secret, onChange } = props;

  return (
    <>
      <div className={Styles['setting-item-desc']}>加密设置</div>
      <div className={Styles['setting-item-desc-detail']}>
        快搭将对所有表单字段进行加密存储，除本流程管理员及相关流程角色外都无法查看加密字段数据
      </div>
      <Radio.Group
        value={secret}
        onChange={(val) => {
          onChange(val, SecretSetting);
        }}
      >
        <Radio value>是</Radio>
        <Radio value={false}>否</Radio>
      </Radio.Group>
    </>
  );
}
