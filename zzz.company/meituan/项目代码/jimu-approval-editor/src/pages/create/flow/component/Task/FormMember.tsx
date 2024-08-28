import React, { Component } from 'react';
import { Select, Tooltip } from '@ss/mtd-react';
import { getFormRoles } from '@/utils/form';
import { IFormMember, IOptions, APPROVEFORMROLE } from './task.type';
import { FORM_BASE_ROLES } from './const';

import { IFormProperty } from '../../flow.type';
import { getFormOptions } from './util';

const { Option } = Select;

const DISABLED_APPROVE_ROLE = [
  FORM_BASE_ROLES[APPROVEFORMROLE.HRBP],
  FORM_BASE_ROLES[APPROVEFORMROLE.HRBPHEAD]
];

export interface IFormMemberProps extends IFormMember {
  onChange?: Function;
  hasError: boolean;
  isCC?: boolean;
  formProperties: Array<IFormProperty>;
}

export interface IFormMemberState {
  formKey?: string;
  formValue?: string;
  formMemberList?: Array<IOptions>;
}
/**
 * 表单控件对应角色组件
 */
export default class FormMember extends Component<
  IFormMemberProps,
  IFormMemberState
> {
  constructor(props: IFormMemberProps) {
    super(props);
  }

  componentWillMount() {
    const { formKey, formValue } = this.props;

    this.setState({
      formKey: formKey || '',
      formValue: getFormRoles({
        formKey,
        formValue
      }),
      formMemberList: getFormOptions(formKey || '')
    });
  }

  render() {
    const { formKey, formValue, formMemberList } = this.state;
    const { onChange, hasError, isCC } = this.props;

    return (
      <>
        <span className='label'>请选择表单内控件对应角色</span>
        <div className='approval-flex-row'>
          <Select
            value={formKey}
            onChange={(option) => {
              const optionList = getFormOptions(option?.value);

              this.setState({
                formKey: option?.value,
                formValue: '',
                formMemberList: optionList
              });

              /**
               * 父节点状态更新
               */
              onChange &&
                onChange({
                  formKey: option?.value,
                  formValue: ''
                });
            }}
            placeholder='请选择表单控件'
          >
            {this.props.formProperties.map((item, index) => {
              return (
                <Option key={index} value={item.propertyCode}>
                  {item.propertyName}
                </Option>
              );
            })}
          </Select>
          对应的
          <Select
            value={formValue}
            onChange={(option) => {
              this.setState({
                formValue: option?.value || ''
              });
              /**
               * 父节点状态更新
               */
              onChange &&
                onChange({
                  formKey: this.state.formKey,
                  formValue: option?.value || ''
                });
            }}
            placeholder='请选择角色'
          >
            {formMemberList?.map((item, index) => {
              const disabled =
                !isCC && DISABLED_APPROVE_ROLE.includes(item.value);
              return (
                <Option key={index} value={item.label} disabled={disabled}>
                  {disabled ? (
                    <Tooltip message='请选择HR类标准角色审批人'>
                      {item.value}
                    </Tooltip>
                  ) : (
                    <span>{item.value}</span>
                  )}
                </Option>
              );
            })}
          </Select>
        </div>
        {hasError && !formKey && <div className='error'>请选择表单组件</div>}
        {hasError && !formValue && <div className='error'>请选择角色</div>}
      </>
    );
  }
}
