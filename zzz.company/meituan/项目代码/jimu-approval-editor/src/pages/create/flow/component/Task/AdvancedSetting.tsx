import React, { useRef, useEffect } from 'react';
import { Form, Switch, Input, Select, Popover, Icon } from '@ss/mtd-react';
import { ExpireAutoEnum, AdvancedType } from './task.type';
import { EXPIRE_AUTO } from './const';

interface IProps {
  overrideid: string;
  advanced: AdvancedType;
  onChange: Function;
  allOverrideid: string[];
  changeOverrideid: Function;
}

const { Option } = Select;
export const RegexpId = /^[a-zA-Z_0-9]{1,30}$/g;

export default function AdvancedSetting(props: IProps) {
  const {
    advanced,
    onChange,
    overrideid,
    changeOverrideid,
    allOverrideid
  } = props;
  const { enable, handleLimit, expireAuto } = advanced;
  const form = useRef<any>(null);

  // 模拟获取焦点和失去焦点，先走一遍校验，防止tab切换后校验信息不显示
  useEffect(() => {
    // console.log('1111111', form);
    form?.current?.validateFields();
  }, []);

  function onFieldValueChangeHandle(key, value) {
    if (key === 'handleLimit') {
      onChange({ handleLimit: +value ? +value : '' });
    }
    if (key === 'overrideid') {
      changeOverrideid(value);
    }
  }
  return (
    <>
      <Form
        ref={form}
        defaultFieldsValue={{
          handleLimit,
          overrideid
        }}
        onFieldValueChange={onFieldValueChangeHandle}
      >
        <Form.Item>
          <div className='label'>
            <span>节点标识</span>
            <Popover
              // getContainer={() =>
              //   document.querySelector('.approval-editor')
              // }
              content={
                <div>
                  节点标识供研发同学使用，可通过节点ID为某节点指定审批人等。为避免影响流程流转，请非研发同学谨慎修改！
                  <a
                    href='https://km.sankuai.com/collabpage/1357142346'
                    target='_blank'
                  >
                    了解更多
                  </a>
                </div>
              }
              // placement='bottomRight'
            >
              <Icon
                style={{
                  paddingLeft: '10px',
                  fontSize: '18px',
                  verticalAlign: 'text-top'
                }}
                type='info-circle-o'
              ></Icon>
            </Popover>
          </div>
        </Form.Item>
        <Form.Item
          label='自定义ID'
          labelWidth='5em'
          labelPosition='left'
          span={14}
          formItemKey='overrideid'
          rules={[
            {
              message: '自定义ID不能为空',
              validator: (_, value) => value.length > 0
            },
            {
              message: '自定义ID只能由1~30个英文字母,下划线,数字组成',
              validator: (_, value) => {
                return new RegExp(RegexpId).test(value);
              }
            },
            {
              message: '同一审批内，节点自定义ID不可重复',
              validator: (_, value) => {
                return !allOverrideid.includes(value);
              }
            }
          ]}
        >
          <Input toFormItem value={overrideid}></Input>
        </Form.Item>
        <Form.Item>
          <div className='timeout-setting-header'>
            <div className='label'>审批超时处理</div>
            {/* <Popover content='当该审批节点的表单存在必填字段时，不会触发超时审批「自动通过」逻辑'>
              <Icon type='info-circle-o' />
            </Popover> */}
            <Switch
              checked={enable}
              onChange={(e) => {
                onChange({
                  enable: e.target.checked,
                  expireAuto:
                    expireAuto === ExpireAutoEnum.NOTHING
                      ? ExpireAutoEnum.REJECT
                      : expireAuto
                });
              }}
            />
          </div>
          <div className='sub-info'>
            <p>审批超时未处理时，自动触发相应的处理规则，如超时自动驳回。</p>
          </div>
        </Form.Item>

        {enable && (
          <>
            <Form.Item style={{ marginBottom: 0 }}>
              <div className='timeout-setting-header'>
                <span className='label'>处理规则</span>
                <Popover content='未处理时长仅计算工作日，法定节假日及双休日不计算在内，如设置超过12小时自动驳回，周五22:00提交单据，则自动驳回时间为周一8:00'>
                  <Icon type='info-circle-o' />
                </Popover>
              </div>
            </Form.Item>
            <Form.Item
              label='流程到达该节点超过'
              labelWidth='9em'
              span={12}
              formItemKey='handleLimit'
              rules={[
                {
                  message: '时间不能为空',
                  validator: (_, value) => {
                    return `${value}`.length > 0;
                  }
                },
                {
                  message: '只能输入1-1000的整数',
                  validator: (_, value) => {
                    if (!/^\d+$/g.test(value)) {
                      return false;
                    }
                    const num = +value;
                    if (num < 1 || num > 1000) {
                      return false;
                    }
                    return true;
                  }
                }
              ]}
            >
              <Input toFormItem style={{ paddingRight: '4px' }} />
            </Form.Item>
            <Form.Item label='小时未处理时' span={12}>
              <Select
                value={expireAuto}
                onChange={(val) => onChange({ expireAuto: val.value })}
              >
                {Object.keys(EXPIRE_AUTO)
                  .filter((key) => key !== ExpireAutoEnum.NOTHING)
                  .map((key) => {
                    return (
                      <Option key={key} value={key}>
                        {EXPIRE_AUTO[key]}
                      </Option>
                    );
                  })}
              </Select>
            </Form.Item>
          </>
        )}
      </Form>
    </>
  );
}
