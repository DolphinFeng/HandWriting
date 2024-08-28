import React, { Component } from 'react';
import { Form, Checkbox, Tooltip } from '@ss/mtd-react';
import classNames from 'classnames';
import {
  getPropertyConditionMapping,
  convertFormRoleToForm
} from '@/utils/flow';

import { isCaptionComponent, dealwithTableList } from '@/utils/form';

import { INodeBox, INodeBoxOption } from '../node-box.type';
import { IFormRole } from './task.type';
import { IComponent } from '@/utils/form.type';
import { NODETYPE } from '../../flow.type';

export enum OperationType {
  READABLE = 'readable',
  WRITABLE = 'writable'
}

interface IFormRoleProps {
  option: INodeBoxOption;
  process: INodeBox[];
  formRoles: IFormRole[];
  onFormRoleChange: Function;
  componentList: Array<IComponent>;
  nodeType: NODETYPE;
}

interface IFormRoleState {
  value: Array<IFormRole>;
}
export default class FormRole extends Component<
  IFormRoleProps,
  IFormRoleState
> {
  constructor(props: IFormRoleProps) {
    super(props);
  }

  UNSAFE_componentWillMount() {
    const {
      componentList: componentListOld,
      process,
      option,
      onFormRoleChange,
      formRoles,
      nodeType
    } = this.props;

    const componentList = dealwithTableList(componentListOld);

    const propertyCodes = componentList.map((item) => {
      return item.id;
    });

    const mappingDisabled = getPropertyConditionMapping(
      propertyCodes as string[],
      process,
      option.curNodeIndex as number[]
    );
    // console.log(componentList);
    const currentState = convertFormRoleToForm(
      formRoles,
      componentList,
      mappingDisabled,
      nodeType
    );
    // console.log('currentState', currentState);
    onFormRoleChange(currentState);
  }

  getCheckedProps = (type: OperationType) => {
    const { formRoles } = this.props;

    const effectList = formRoles.filter((item) => {
      return !item.disabled;
    });

    const checkedCount = effectList?.filter((item) => {
      return type === OperationType.READABLE ? item.readable : item.writable;
    }).length;

    if (checkedCount === 0) {
      return {
        checked: false
      };
    }
    if (checkedCount === effectList.length) {
      return {
        checked: true
      };
    }
    return {
      indeterminate: true
    };
  };

  handleSelectedAll = (type: OperationType) => {
    const { formRoles, onFormRoleChange } = this.props;

    // 非全选状态
    const isNotAllSelected = formRoles.some((item) => {
      if (type === OperationType.READABLE) {
        return !item.readable;
      }

      return !item.writable;
    });

    formRoles.map((item) => {
      if (type === OperationType.READABLE) {
        item.readable = isNotAllSelected;
        if (!isNotAllSelected) {
          item.writable = false;
        }
      } else {
        item.writable = isNotAllSelected;
        if (isNotAllSelected && !item.disabled) {
          item.readable = true;
        }
      }
      return item;
    });

    onFormRoleChange(formRoles);
  };

  render() {
    const { formRoles, onFormRoleChange } = this.props;

    const readableProps = this.getCheckedProps(OperationType.READABLE);
    const writableProps = this.getCheckedProps(OperationType.WRITABLE);

    return (
      <Form className='approval-editor-body'>
        <Form.Item>
          <div className='approval-form-role-table'>
            <div className='approval-form-role-row header'>
              <div className='form-role-column-name'>
                <span>表单字段</span>
              </div>
              <div className='form-role-column-group'>
                <div className='form-role-column readable'>
                  <Checkbox
                    onChange={() => {
                      this.handleSelectedAll(OperationType.READABLE);
                    }}
                    {...readableProps}
                  >
                    可读
                  </Checkbox>
                </div>
                <div className='form-role-column writable'>
                  <Checkbox
                    onChange={() => {
                      this.handleSelectedAll(OperationType.WRITABLE);
                    }}
                    {...writableProps}
                  >
                    编辑
                  </Checkbox>
                </div>
              </div>
            </div>
            {formRoles.map((item, index) => {
              const writAbleDom = (
                <Checkbox
                  checked={item.writable}
                  onChange={() => {
                    item.writable = !item.writable;
                    // 可编辑的话一定是可读
                    if (item.writable) {
                      item.readable = true;
                    }

                    onFormRoleChange(formRoles);
                  }}
                ></Checkbox>
              );
              const message = isCaptionComponent(item.id)
                ? '说明文字控件不支持设置「编辑」权限'
                : '该控件被已作为条件判断依据，后续节点不可修改。';
              return (
                <div className='approval-form-role-row' key={index}>
                  <div className='form-role-column-name'>
                    <span>
                      {item.parentId
                        ? `${item.parentLabel || ''} · ${item.label || ''}`
                        : item.label}
                    </span>
                  </div>
                  <div className='form-role-column-group'>
                    <div className='form-role-column readable'>
                      <Checkbox
                        checked={item.readable}
                        onChange={() => {
                          item.readable = !item.readable;
                          // 不可编辑一定不可读
                          if (!item.readable) {
                            item.writable = false;
                          }

                          onFormRoleChange(formRoles);
                        }}
                      ></Checkbox>
                    </div>
                    <div
                      className={classNames('form-role-column writable', {
                        disabled: item.disabled
                      })}
                    >
                      {item.disabled ? (
                        <Tooltip message={message}>
                          <label className='mtd-checkbox mtd-checkbox-disabled'>
                            <span className='mtd-checkbox-input-wrapper'>
                              <input
                                className='mtd-checkbox-input'
                                type='checkbox'
                              />
                              <i className='mtd-checkbox-inner mtdicon'></i>
                            </span>
                          </label>
                        </Tooltip>
                      ) : (
                        writAbleDom
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Form.Item>
      </Form>
    );
  }
}
