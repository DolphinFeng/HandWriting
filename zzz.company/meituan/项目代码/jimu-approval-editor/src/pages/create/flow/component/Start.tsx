import { cloneDeep } from 'lodash';
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
// import '@ss/mtd-react/lib/style/index.css';
import { Drawer, Form, Button, Radio, Popover, Icon } from '@ss/mtd-react';
import NodeBox from './NodeBox';
import AddNode from './AddNode';
import { IFormProperty } from '../flow.type';
import { INodeBoxOption } from './node-box.type';
import { IComponent } from '@/utils/form.type';
import Styles from './Task/index.less';
import AddCC, { ICCGroupState } from './Task/AddCC';
import { handleCCGroupsValidate } from './Task/util';
import { formTaskComponentList } from '@/utils/form';
import FormRole from './Task/FormRole';
import { IFormRole } from './task.type';
import { NODETYPE } from '@/pages/create/flow/flow.type';

interface IStartProps {
  approval: any;
  formProperties: IFormProperty[];
  componentList: IComponent[];
  option: INodeBoxOption;
}

interface IStartState {
  drawerVisible: boolean;
  // 审批人类型
  settingTab: 'approvalSetting' | 'formRoleSetting';
  ccGroups: ICCGroupState[];
  formRoles: IFormRole[];
}

@inject(({ approval }) => ({
  approval,
  componentList: approval.componentList,
  /**
   * 筛选 componentList 里 required 和 名字在 formComponentList 里的
   */
  formProperties:
    approval.conditionComponentList
      ?.filter((item) => {
        return formTaskComponentList.indexOf(item.componentName) !== -1;
      })
      .map((item) => {
        return {
          propertyCode: item.id,
          propertyName: item.label,
          componentType: item.type,
          componentName: item.componentName
        };
      }) || []
}))
@observer
export default class Start extends Component<IStartProps, IStartState> {
  constructor(props) {
    super(props);

    this.state = {
      drawerVisible: false,
      settingTab: 'approvalSetting',
      ccGroups: [],
      formRoles: []
    };
  }

  initState = () => {
    const { option } = this.props;
    const ccGroupState = cloneDeep(option.ccGroups || []);

    this.setState({
      ccGroups: ccGroupState as ICCGroupState[],
      formRoles: option.formRoles || []
    });
  };

  closeDrawer = () => {
    this.setState({
      drawerVisible: false
    });
  };

  handleSave = () => {
    const hasError = this.handleValidate();

    if (hasError) {
      return;
    }

    const { option } = this.props;
    const { dealWithNodeFn } = option;
    option.ccGroups = [...this.state.ccGroups];
    option.formRoles = this.state.formRoles;
    // 保存 Node
    dealWithNodeFn && dealWithNodeFn(option, 'saveStart');

    this.closeDrawer();
  };

  handleValidate = () => {
    /**
     * 校验抄送组信息
     */
    const { ccGroups = [] as ICCGroupState[] } = this.state;

    const hasCCError = handleCCGroupsValidate(ccGroups);

    if (hasCCError) {
      this.setState({
        ccGroups: [...ccGroups]
      });
    }

    return hasCCError;
  };

  handleCancel = () => {
    this.closeDrawer();
  };

  renderHeader() {
    return (
      <div className='approval-editor-header'>
        <div className='approval-editor-title'>发起</div>
      </div>
    );
  }

  render() {
    const curInfo = this.props;
    const { componentList, option, formProperties, approval } = this.props;

    return (
      <>
        <div className='flow-node start'>
          <div
            onClick={() => {
              this.initState();

              this.setState({
                drawerVisible: true
              });
            }}
          >
            <NodeBox
              {...curInfo}
              componentList={componentList?.map(
                (item): IComponent => {
                  return {
                    id: item.id,
                    componentName: item.componentName,
                    label: item.props?.label || '',
                    options: item.props?.options || []
                  } as IComponent;
                }
              )}
            ></NodeBox>
          </div>
          <div className='bottom-v-line'></div>
          <AddNode {...curInfo}></AddNode>
        </div>
        <Drawer
          className='approval-editor'
          width={550}
          onClose={() => {
            this.setState({
              drawerVisible: false
            });
          }}
          closable
          maskClosable={false}
          visible={this.state.drawerVisible}
        >
          {this.renderHeader()}
          <div className='approval-editor-body'>
            <Radio.Group
              className={Styles['radio-solid']}
              value={this.state.settingTab}
              onChange={(value) => {
                this.setState({
                  settingTab: value
                });
              }}
            >
              <Radio.Button key='ApprovalSetting' value='approvalSetting'>
                抄送人设置
              </Radio.Button>
              <Radio.Button key='FormRoleSetting' value='formRoleSetting'>
                表单权限
                <Popover
                  getContainer={() =>
                    document.querySelector('.approval-editor')
                  }
                  content={
                    <img
                      style={{ width: '400px' }}
                      src='https://p0.meituan.net/travelcube/643fce25c60982c148e05782eb109c5687520.png'
                      alt=''
                    />
                  }
                  placement='bottomRight'
                >
                  <Icon type='info-circle-o'></Icon>
                </Popover>
              </Radio.Button>
            </Radio.Group>
          </div>
          {this.state.settingTab === 'approvalSetting' ? (
            <Form className='approval-editor-body'>
              <Form.Item>
                <AddCC
                  formProperties={formProperties}
                  option={option}
                  nodetype={NODETYPE.Start}
                  ccGroups={this.state.ccGroups}
                  onCCChange={({ ccGroups }) => {
                    this.setState({
                      ccGroups: [...ccGroups]
                    });
                  }}
                />
              </Form.Item>
            </Form>
          ) : (
            <FormRole
              componentList={componentList}
              process={approval.process}
              option={option}
              nodeType={NODETYPE.Start}
              formRoles={this.state.formRoles}
              onFormRoleChange={(val) => {
                this.setState({
                  formRoles: [...val]
                });
              }}
            ></FormRole>
          )}

          <div className='approval-editor-footer'>
            <div className='btn-group'>
              <Button type='primary' onClick={this.handleSave}>
                保存
              </Button>
              <Button className='btn-cancel' onClick={this.handleCancel}>
                取消
              </Button>
            </div>
          </div>
        </Drawer>
      </>
    );
  }
}
