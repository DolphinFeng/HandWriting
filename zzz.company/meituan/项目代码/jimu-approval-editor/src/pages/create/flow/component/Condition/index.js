import { inject, observer } from 'mobx-react';
// import '@ss/mtd-react/lib/style/index.css';
import React, { Component } from 'react';
import {
  Drawer,
  Form,
  Button,
  Icon,
  Input,
  Select,
  Tooltip
} from '@ss/mtd-react';

import NodeBox from '../NodeBox';
import AddNode from '../AddNode';
import TaskRuleConditionGroup from './TaskRuleConditionGroup';
import './index.less';
import {
  buildConditionValue,
  validateHasErrorInCondition,
  syncConditionDisplay
} from './util';

import { CompomentType } from '@/utils/base';

const { Option } = Select;

@inject(({ approval }) => ({
  /**
   * 筛选 componentList 里 required 和 名字在 formComponentList 里的
   */
  formProperties:
    approval.conditionComponentList
      ?.filter((item) => {
        return item.required;
      })
      .map((item) => {
        let businessType = 0;

        if (item.componentName === CompomentType.People) {
          businessType = 1;
        } else if (item.componentName === CompomentType.Department) {
          businessType = 2;
        }

        return {
          propertyCode: item.id,
          propertyName: item.label,
          businessType,
          options: item.options,
          data: item.options,
          componentType: item.type,
          componentName: item.componentName
        };
      }) || [],
  getOptions: approval.getOptions
}))
@observer
export default class Condition extends Component {
  constructor(props) {
    super(props);

    this.state = {
      drawerVisible: false,
      isTitleEdit: false,
      editTitle: '',
      priority: 0
    };

    this.conditionRef = React.createRef();
    this.formRef = React.createRef();
  }

  initDrawerState = () => {
    const { option } = this.props;
    const { curNodeIndex } = option;
    const curBranchIndex = curNodeIndex[curNodeIndex.length - 2] + 1;
    const editTitle = option.title || `条件${curBranchIndex}`;

    this.setState({
      drawerVisible: true,
      isTitleEdit: false,
      editTitle,
      priority: option.priority
    });
  };

  closeDrawer = () => {
    this.setState({
      drawerVisible: false
    });
  };

  renderTitle = () => {
    // const { option } = this.props;
    const { isTitleEdit } = this.state;

    const onPressEnter = () => {
      this.setState({
        isTitleEdit: false
      });
    };

    return isTitleEdit ? (
      <Input
        style={{ width: '700px' }}
        value={this.state.editTitle}
        onChange={(e) => {
          this.setState({
            editTitle: e.target.value
          });
        }}
        onPressEnter={onPressEnter}
        onBlur={onPressEnter}
      ></Input>
    ) : (
      <div className='title'>
        <span>{this.state.editTitle}</span>
        {/* <Icon
          type='edit'
          style={{ fontSize: 16, color: '#a1a5ad', width: 16, height: 16 }}
          onClick={() => {
            this.setState({
              isTitleEdit: true,
              editTitle: option.title
            });
          }}
        /> */}
      </div>
    );
  };

  handleSave = () => {
    const { option } = this.props;
    const { dealWithNodeFn } = option;

    /**
     * 保存时数据转化
     */
    const condition = this.conditionRef.current.save();
    /**
     * 递归赋值 value
     */
    buildConditionValue(condition?.conditions || []);

    /**
     * 校验代码要在 buildConditionValue 之后，否则会校验不通过
     */
    const isValid = this.formRef.current.validateFields();
    if (!isValid) {
      return;
    }

    /**
     * 校验完成之后才给 option  赋值
     */
    option.conditions = condition.conditions;
    option.logical = condition.logical;
    option.title = this.state.editTitle;
    option.exchangePriority = this.state.priority;

    // 保存 Node
    dealWithNodeFn(option, 'saveCondition');

    this.closeDrawer();
  };

  componentDidMount() {}

  render() {
    const curInfo = this.props;
    const { option, nodesCount } = this.props;
    const { conditions = [] } = option;

    syncConditionDisplay(this.props.formProperties, option);

    return (
      <>
        <div className='flow-node condition'>
          <div
            onClick={() => {
              /**
               * 默认条件不让修改
               */
              if (option && option.default) {
                return;
              }

              this.initDrawerState();
            }}
          >
            <NodeBox {...curInfo}></NodeBox>
          </div>
          <div className='bottom-v-line'></div>
          <AddNode {...curInfo}></AddNode>
        </div>
        <Drawer
          className='drawer-box'
          width={950}
          visible={this.state.drawerVisible}
          title={
            <div className='condition-header'>
              {this.renderTitle()}
              <Select
                disabled={this.state.priority === nodesCount - 1}
                value={this.state.priority}
                clearable={false}
                onChange={({ value }) => {
                  this.setState({
                    priority: value
                  });
                }}
                style={{ width: '120px' }}
              >
                {// 因为默认的不能调整顺序
                new Array(nodesCount).fill(null).map((_item, index) => {
                  const realIndex = index + 1;
                  return (
                    <Option
                      disabled={index === nodesCount - 1}
                      key={index}
                      value={index}
                    >{`优先级 ${realIndex}`}</Option>
                  );
                })}
              </Select>
            </div>
          }
          closable
          maskClosable={false}
          onClose={() => {
            this.setState({
              drawerVisible: false
            });
          }}
        >
          <div className='condition-tips'>
            满足以下条件时进入当前分支
            <Tooltip message='如需使用单选、数字、金额等表单字段作为条件，需先在“表单设计”中添加对应控件，且控件必须设为必填'>
              <Icon type='info-circle-o' />
            </Tooltip>
          </div>
          <Form ref={this.formRef}>
            <Form.Item
              formItemKey='conditions'
              labelWidth='100%'
              labelPosition='top'
              rules={[
                {
                  validator: (_rule, _value, callback) => {
                    const { conditions } = this.conditionRef.current.save();

                    const hasError = validateHasErrorInCondition(conditions);

                    if (hasError) {
                      callback('请输入完整条件');
                    } else {
                      callback();
                    }
                  }
                }
              ]}
            >
              <div style={{ paddingLeft: '10px' }}>
                <TaskRuleConditionGroup
                  formProperties={this.props.formProperties}
                  toFormItem
                  onAddOrRemoveCondition={() => {}}
                  logical={option.logical ? option.logical : 1}
                  conditions={conditions}
                  ref={this.conditionRef}
                  getOptions={this.props.getOptions}
                />
              </div>
            </Form.Item>
          </Form>
          <div className='condition-footer'>
            <Button
              onClick={() => {
                this.setState({
                  drawerVisible: false
                });
                this.closeDrawer();
              }}
              style={{ marginRight: 20, width: 100 }}
            >
              取消
            </Button>
            <Button
              type='primary'
              onClick={this.handleSave}
              style={{ marginRight: 20, width: 100 }}
            >
              保存
            </Button>
          </div>
        </Drawer>
      </>
    );
  }
}
