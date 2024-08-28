import React from 'react';
import { Icon, Dropdown, Menu, AutoComplete } from '@ss/mtd-react';
import { getPropertyList, getOperationList } from '@/services/process.ts';

import { getEmployee, getDept } from '@/services/user';
import { shouldRenderSelect, conditionValidator } from './util';
import { IFormProperty } from '../../flow.type';
import { isRemoteBusinessType } from '@/utils/flow';

import SearchSelect, { ISearch } from '../common/SearchSelect';
import SearchTreeSelect from '../common/SearchTreeSelect';
import NormalInput from '../common/NormalInput';
import { ICondition } from './condition.type';

const MenuItem = Menu.Item;

const [w1, wc, w2, w2c, w3] = [180, 180, 420, 350, 100];

const COMPONENTTYPE = {
  SearchSelect: 'SearchSelect',
  Input: 'Input',
  // 可以筛选 tags 的 select 组件
  AutoComplete: 'AutoComplete'
};

export interface IConditionEditorProps {
  addWidth?: number;
  isChildren?: boolean;
  changeConditionValue: Function;
  changeVal: Function;
  temp?: Array<any>;
  formProperties: IFormProperty[];
  condition: ICondition;
  handleAdd: any;
  index?: any;
  changeProperty: Function;
  changeOperation: Function;
  delCondition: Function;
}

export default class ConditionEditor extends React.Component<
  IConditionEditorProps,
  any
> {
  constructor(props: IConditionEditorProps) {
    super(props);
  }

  // 获取当前条件的校验结果类名
  getValidClassNames(condition: ICondition) {
    const result = conditionValidator(condition);

    return result.map((isTrue) => {
      return isTrue ? '' : 'is-bpm-form-error';
    });
  }

  /**
   * 参数适配转化，目标参数
   *  componentType,
   *  isMultiple,
   *  remote
   */
  buildConditionParams = (
    // formProperties: IFormProperty[],
    condition: ICondition
  ) => {
    let componentType = COMPONENTTYPE.Input;
    let isMultiple = false;
    let remote = {} as ISearch;

    switch (condition.businessType) {
      case 1:
        // 人员属于部门.
        componentType = COMPONENTTYPE.SearchSelect;
        if (['bd', 'nbd'].indexOf(condition.operationCode) > -1) {
          remote = {
            remote: getDept,
            dataMap: {
              labelKey: 'label',
              valueKey: 'value'
            }
          };
        } else {
          remote = {
            remote: getEmployee,
            dataMap: {
              labelKey: 'label',
              valueKey: 'value'
            }
          };
        }
        break;
      case 2:
        componentType = COMPONENTTYPE.SearchSelect;
        remote = {
          remote: getDept,
          dataMap: {
            labelKey: 'label',
            valueKey: 'value'
          }
        };
        break;
      case 0:
        // 判断 condition
        if (shouldRenderSelect(condition.propertyCode)) {
          // const property: IFormProperty =
          //   formProperties.filter((item) => {
          //     return item.propertyCode === condition.propertyCode;
          //   })[0] || {};

          // componentType = COMPONENTTYPE.SearchSelect;
          // remote = {
          //   async remote() {
          //     return {
          //       pageList: property.options || [{value:'3123', label:'111'}]
          //     };
          //   }
          // };

          componentType = COMPONENTTYPE.SearchSelect;
          const { getOptions } = this.props;
          remote = {
            async remote() {
              const res = await getOptions(condition.propertyCode);
              return {
                pageList: res.data || [],
                dataSourceType: res.dataSourceType
              };
            },
            remoteType: 'once'
          };
        }
        break;

      default:
        break;
    }

    switch (condition.operationCode) {
      case 'in':
      case 'ni':
      case 'NT':
      case 'CT':
        isMultiple = true;
        break;
      default:
        isMultiple = false;
        break;
    }

    /**
     * 对于非远程数据的，并且非 select 类型（因为自带 option），有多选需求的，渲染 aotuComplete 组件
     */
    if (
      isMultiple &&
      !isRemoteBusinessType(condition.businessType) &&
      !shouldRenderSelect(condition.propertyCode)
    ) {
      componentType = COMPONENTTYPE.AutoComplete;
    }

    return {
      componentType,
      isMultiple,
      remote
    };
  };

  handleMenuClick = (option: any) => {
    const { handleAdd, index } = this.props;

    Object.assign(option, { conditionIndex: index });

    handleAdd(option);
  };

  /**
   * 条件的第三个选择框：condition-value, 是根据前两个生成, 生成规则如下
   *
   */
  renderConditionValue = (condition: ICondition) => {
    const {
      addWidth = 0,
      isChildren,
      changeConditionValue,
      changeVal
      // formProperties
    } = this.props;

    const classNames = this.getValidClassNames(condition);

    const { componentType, isMultiple, remote } = this.buildConditionParams(
      // formProperties,
      condition
    );
    // console.log('----remote', remote)

    const styles = {
      marginRight: 8,
      width: (!isChildren ? w2 : w2c) + addWidth
    };

    switch (componentType) {
      case COMPONENTTYPE.Input:
        /**
         * 因为都统一用 data 的数据结构
         */
        return (
          <NormalInput
            value={typeof condition.data === 'string' ? condition.data : ''}
            onChange={(val: any) => changeVal(val, condition)}
            style={{
              ...styles
            }}
            componentProperty={{
              className: classNames[2]
            }}
          />
        );
      case COMPONENTTYPE.SearchSelect:
        return (
          <SearchSelect
            value={condition.data}
            onChange={(val: any) => changeConditionValue(val, condition)}
            search={remote}
            componentProperty={{
              placeholder: '请选择',
              multiple: isMultiple,
              className: classNames[2],
              style: { ...styles }
            }}
          />
        );
      case COMPONENTTYPE.AutoComplete:
        return (
          <AutoComplete
            multiple
            className={classNames[2]}
            style={{ ...styles }}
            value={
              (condition?.data && (condition?.data as string).split?.(',')) ||
              []
            }
            onChange={(val) => {
              const value = Array.isArray(val) ? val.join(',') : val;
              changeConditionValue(value, condition);
            }}
            placeholder='多选，按 enter 新增'
          ></AutoComplete>
        );
      default:
        return null;
    }
  };

  render() {
    const { delCondition } = this.props;
    const {
      temp = [],
      addWidth = 0,
      formProperties = [],
      condition,
      index,
      isChildren,
      changeProperty,
      changeOperation
    } = this.props;

    const conditions = temp;
    const conditionsLen = conditions.length;

    const showChildrenRule = true;
    const classNames = this.getValidClassNames(condition);

    // 包含与不包含兼容（v1.3需求ct；代表包含；nt：代表不包含）
    if (
      condition.operationCode === 'CT' &&
      condition.operationDisplay === '包含'
    ) {
      condition.operationDisplay = '包含任一';
    }
    if (
      condition.operationCode === 'NT' &&
      condition.operationDisplay === '不包含'
    ) {
      condition.operationDisplay = '不包含任一';
    }

    return (
      <div className='condition-items' key={condition.key || index}>
        {/* 属性选择器 */}
        <SearchTreeSelect
          value={condition}
          onChange={(val: any) => changeProperty(val, condition)}
          allowParentNodeTransToLeafNode
          componentProperty={{
            placeholder: '请选择',
            style: {
              marginRight: 8,
              width: (!isChildren ? w1 : wc) + addWidth
            },
            className: classNames[0],
            filterable: false
          }}
          search={{
            remote: getPropertyList(formProperties),
            dataMap: {
              labelKey: 'propertyName',
              valueKey: 'propertyCode'
            }
          }}
        />
        {/* 操作选择器 */}
        <SearchSelect
          value={condition}
          onChange={(val: any) => changeOperation(val, condition)}
          search={{
            remote: getOperationList(condition, formProperties),
            dataMap: {
              labelKey: 'operationDisplay',
              valueKey: 'operationCode'
            }
          }}
          componentProperty={{
            placeholder: '请选择',
            className: classNames[1],
            style: { marginRight: 8, width: w3 + addWidth },
            popLayer: {
              width: 120
            }
          }}
        />
        {/* 值选择器 */}
        {this.renderConditionValue(condition)}

        {/* 添加条件 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 32
          }}
        >
          <Dropdown
            content={
              <Menu inlineIndent={16}>
                <MenuItem onClick={this.handleMenuClick} key='brotherCondition'>
                  添加条件
                </MenuItem>
                {isChildren ? (
                  <MenuItem
                    onClick={this.handleMenuClick}
                    key='addParentCondition'
                  >
                    添加父条件
                  </MenuItem>
                ) : (
                  <MenuItem
                    onClick={this.handleMenuClick}
                    disabled={conditionsLen === 1 || !showChildrenRule}
                    key='childCondition'
                  >
                    添加子条件
                  </MenuItem>
                )}
              </Menu>
            }
            trigger='click'
          >
            <Icon
              type='add-square-o'
              style={{ fontSize: 20, cursor: 'pointer' }}
            />
          </Dropdown>

          <Icon
            onClick={() => {
              delCondition(index);
            }}
            type='checkbox-indetermina-o'
            style={{
              fontSize: 20,
              marginLeft: 16,
              cursor: 'pointer'
            }}
          />
        </div>
      </div>
    );
  }
}
