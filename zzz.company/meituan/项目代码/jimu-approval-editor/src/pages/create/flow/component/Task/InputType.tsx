import React from 'react';
import { Radio, Select } from '@ss/mtd-react';
import { InputTypeEnum, OutputTypeEnum } from '@/utils/form.type';
import { IFormProperty } from '../../flow.type';

const { Option } = Select;
/**
 * 审批人类型组件
 * 根据
 *  发起人
 *  表单控件
 */

export interface InputTypeProps {
  onApprovalChange: Function;
  inputType?: InputTypeEnum;
  inputKey?: string;
  hasError: boolean;
  formProperties: IFormProperty[];
}

export default function InputType(props: InputTypeProps) {
  const {
    onApprovalChange,
    inputType,
    inputKey,
    formProperties,
    hasError
  } = props;

  return (
    <>
      <span className='label'>根据</span>
      <div className='approval-select'>
        <Radio.Group
          onChange={(val) => {
            onApprovalChange({
              inputType: val
            });
          }}
          value={inputType}
          className='approval-vertical-group'
        >
          <Radio value={InputTypeEnum.STARTER}>发起人</Radio>
          <Radio value={InputTypeEnum.DYNAMIC}>表单控件</Radio>
        </Radio.Group>
        {inputType === InputTypeEnum.DYNAMIC && (
          <Select
            value={inputKey}
            onChange={(option) => {
              onApprovalChange({
                outputType: OutputTypeEnum.COST_CENTER_OWNER,
                inputKey: option?.value
              });
            }}
          >
            {formProperties.map((item, index) => {
              return (
                <Option key={index} value={item.propertyCode}>
                  {item.propertyName}
                </Option>
              );
            })}
          </Select>
        )}
        {hasError && !inputKey && <div className='error'>请选择角色</div>}
      </div>
    </>
  );
}
