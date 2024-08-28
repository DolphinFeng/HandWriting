import React from 'react';
import { Form, Checkbox, Popover, Icon } from '@ss/mtd-react';
import Styles from './index.less';

import { AllowWithdraw, AllowResubmit } from './index.type';

export interface IProps {
  allowResubmit: boolean;
  allowWithdraw: boolean;
  batchOn: boolean;
  onChange: Function;
}

export default function ApprovalSetting(props: IProps) {
  const { allowResubmit, allowWithdraw, batchOn, onChange } = props;

  return (
    <div className={Styles['setting-panel']}>
      <div className={Styles['setting-item']}>
        <div className={Styles['setting-item-title']}>审批设置</div>
        <div className={Styles['setting-item-desc']}>发起人设置</div>
        <Form>
          <Form.Item style={{ marginBottom: 0 }}>
            <Checkbox
              checked={allowWithdraw}
              onChange={(e) => {
                onChange(AllowWithdraw, e.target.checked);
              }}
            >
              允许发起人撤回审批
              <Popover content='若不允许，则发起人无法在审批中心的单据详情页撤回审批。注：通过接口撤回审批不受此选项影响'>
                <Icon type='info-circle-o' />
              </Popover>
            </Checkbox>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Checkbox
              checked={allowResubmit}
              onChange={(e) => {
                onChange(AllowResubmit, e.target.checked);
              }}
            >
              允许发起人重新发起审批（审批被驳回或撤回后）
              <Popover content='若不允许，则发起人无法在审批中心的单据详情页重新发起审批。注：通过接口重新发起审批不受此选项影响'>
                <Icon type='info-circle-o' />
              </Popover>
            </Checkbox>
          </Form.Item>
        </Form>
        <div className={Styles['setting-item-desc']}>审批人设置</div>
        <Form>
          <Form.Item style={{ marginBottom: 0 }}>
            <Checkbox
              checked={batchOn}
              onChange={(e) => {
                onChange('batchOn', e.target.checked);
              }}
            >
              允许审批人在审批中心进行批量审批
              <Popover content='批量审批开启后，支持在审批中心批量审批。审批人有必填字段（包含隐藏的必填字段）未填写时批量审批不生效'>
                <Icon type='info-circle-o' />
              </Popover>
            </Checkbox>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
