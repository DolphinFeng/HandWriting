import React from 'react';
import { Icon } from '@ss/mtd-react';
import { cloneDeep } from 'lodash';
import { mergeObjectWithSameProperty } from '@/utils/index';
import { RuleBaseCondition } from './const';
import ConditionEditor from './ConditionEditor.tsx';
import NormalSelect from '../common/NormalSelect.tsx';

export default class TaskRuleConditionGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      temp: [],
      logical: 1,
      isChildren: false,
      subPropertyCode: ''
    };
    this.childrenConditionRef = 'childrenConditionRef';
  }

  // 重置组件的值
  reset(conditions, logical) {
    this.setState(
      {
        temp: cloneDeep(conditions) || [],
        logical
      },
      () => {
        this.handleConditionLengthChange();
      }
    );
  }

  // 保存当前编辑的值，供外部组件调用
  save = () => {
    if (!this.isChildren) {
      // 处理父组件无法保存子组件数据的情况
      const { refs } = this;
      for (const i in refs) {
        if (new RegExp(this.childrenConditionRef).test(i)) {
          const index = refs[i].childrenIndexInParent;
          if (index !== undefined) {
            this.state.temp[index].conditions = refs[i].state.temp;
            this.state.temp[index].logical = refs[i].state.logical;
          }
        }
      }
      this.updateTemp();
    }

    return {
      conditions: this.state.temp,
      logical: this.state.logical
    };
  };

  componentWillMount() {
    const {
      conditions,
      logical,
      isChildren,
      childrenUpdateTemp,
      parentAddCondition,
      childrenIndexInParent
    } = this.props;
    this.childrenUpdateTemp = childrenUpdateTemp || this.childrenUpdateTemp;
    this.parentAddCondition = parentAddCondition;
    this.childrenIndexInParent = childrenIndexInParent;

    this.setState({
      temp: cloneDeep(conditions) || [],
      logical,
      isChildren: isChildren || false
    });
  }

  changeProperty = (option, condition) => {
    mergeObjectWithSameProperty(condition, option);
    condition.data = [];
    condition.operationCode = '';
    condition.operationName = '';
    condition.operationDisplay = '';
    condition.value = '';
    this.updateTemp();
  };

  changeOperation = (option, condition) => {
    // console.log('------changeOperation', option);
    mergeObjectWithSameProperty(condition, option);
    condition.data = {};
    condition.value = '';

    this.updateTemp();
  };

  changeVal = (data, condition) => {
    mergeObjectWithSameProperty(condition, { data });
    this.updateTemp();
  };

  changeLogical(option) {
    this.state.logical = option.value;
    this.updateTemp();
  }

  handleConditionLengthChange() {
    const { onAddOrRemoveCondition } = this.props;
    const conditionLen = (this.state.temp && this.state.temp.length) || 0;
    onAddOrRemoveCondition && onAddOrRemoveCondition(conditionLen);
  }

  // 添加条件
  handleAdd = (data) => {
    const { key, conditionIndex } = data;
    if (key === 'brotherCondition' || !key) {
      // 添加空结构
      this.state.temp.push(RuleBaseCondition());
      this.handleConditionLengthChange();
      this.updateTemp();
    }
    if (key === 'childCondition') {
      const i = conditionIndex;
      const curCondition = this.state.temp[i];
      if (!curCondition.conditions) {
        this.state.temp[i] = {
          logical: 1,
          leaf: false,
          conditions: [curCondition, RuleBaseCondition()]
        };
      } else {
        curCondition.conditions.push(RuleBaseCondition());
      }
      this.updateTemp();
    }
    if (key === 'addParentCondition') {
      if (this.parentAddCondition) {
        this.parentAddCondition({ key: 'brotherCondition' });
      }
      this.updateTemp();
    }
  };

  // 子组件数据更新后通知父组件 目前只有两级嵌套
  childrenUpdateTemp = (childrenTemp, childrenIndexInParent) => {
    // 处理子组件只剩下一个之后，还原到父组件的样子
    if (childrenTemp.length === 1) {
      this.state.temp[childrenIndexInParent] = childrenTemp[0];
      this.updateTemp();
    }
  };

  updateTemp = () => {
    this.setState({
      temp: this.state.temp,
      logical: this.state.logical
    });

    if (this.state.isChildren) {
      this.childrenUpdateTemp &&
        this.childrenUpdateTemp(this.state.temp, this.childrenIndexInParent);
    }
  };

  changeConditionValue = (data, condition) => {
    // console.log('-----mergeObjectWithSameProperty', { data, condition });
    // mergeObjectWithSameProperty(condition, {
    //   data
    // });
    if (condition.propertyCode?.includes('select')) {
      mergeObjectWithSameProperty(condition, {
        data,
        subPropertyCode: 'value'
      });
    } else {
      mergeObjectWithSameProperty(condition, {
        data,
        subPropertyCode: ''
      });
    }

    this.updateTemp();
  };

  // 删除条件
  delCondition = (index) => {
    this.state.temp.splice(index, 1);
    this.handleConditionLengthChange();
    this.updateTemp();
  };

  render() {
    const { temp = [], logical, isChildren } = this.state;

    const conditions = temp;
    const conditionsLen = conditions.length;
    const { formProperties = [], getOptions } = this.props;

    return (
      <div className='bpm-condition-box' style={{ display: 'flex' }}>
        {conditions.length > 1 ? (
          <div className='bpm-condition-calc'>
            <NormalSelect
              value={logical}
              componentProperty={{
                clearable: false
              }}
              onChange={(val) => this.changeLogical(val)}
              style={{ width: '54px' }}
              placeholder=''
              options={[
                { label: '或', value: 1 },
                { label: '且', value: 2 }
              ]}
            />
          </div>
        ) : null}
        <div
          className={
            conditionsLen > 1
              ? 'bpm-condition-detail'
              : 'bpm-condition-detail-single'
          }
        >
          {conditionsLen > 0 ? (
            conditions.map((condition, i) => {
              const children = condition.conditions ? condition : null;
              return children ? (
                <div className='condition-items' key={`children${i}`}>
                  <TaskRuleConditionGroup
                    toFormItem
                    formProperties={formProperties}
                    logical={children.logical}
                    conditions={children.conditions}
                    isChildren
                    parentAddCondition={this.handleAdd}
                    childrenUpdateTemp={this.childrenUpdateTemp}
                    childrenIndexInParent={i}
                    ref={this.childrenConditionRef + i}
                    getOptions={getOptions}
                  />
                </div>
              ) : (
                <ConditionEditor
                  key={`condition-editor${i}`}
                  condition={condition}
                  handleAdd={this.handleAdd}
                  index={i}
                  isChildren={isChildren}
                  temp={temp}
                  delCondition={this.delCondition}
                  changeProperty={this.changeProperty}
                  changeConditionValue={this.changeConditionValue}
                  changeOperation={this.changeOperation}
                  formProperties={formProperties}
                  changeVal={this.changeVal}
                  getOptions={getOptions}
                />
              );
            })
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', height: 32 }}>
              <Icon
                type='add-square-o'
                style={{
                  fontSize: 20,
                  cursor: 'pointer',
                  verticalAlign: 'top',
                  display: 'flex',
                  alignItems: 'center'
                }}
                placeholder='请输入'
                onClick={(option) => {
                  this.handleAdd(option);
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    marginLeft: '6px'
                  }}
                >
                  添加条件
                </span>
              </Icon>
            </div>
          )}
        </div>
      </div>
    );
  }
}
