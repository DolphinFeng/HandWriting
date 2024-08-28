/**
 * 添加抄送人组件
 */
import React, { Component } from 'react';
import { Button, Card, Icon, Modal } from '@ss/mtd-react';
import Styles from './index.less';
import { IFormProperty, NODETYPE } from '../../flow.type';
import { INodeBoxOption } from '../node-box.type';
import {
  ISelectedItem,
  APPROVERTYPE,
  IApprovalGroup,
  IOptions,
  IApprovalGroupState
} from './task.type';
import ApprovalGroup from './ApprovalGroup';

export interface IAddCCProps {
  formProperties: IFormProperty[];
  option: INodeBoxOption;
  onCCChange: Function;
  nodetype: NODETYPE;
  ccGroups: ICCGroupState[];
}

export interface ICCGroupState extends IApprovalGroup {
  chooseUserModalVisible?: boolean;
  hasError: boolean;
  formMemberList?: Array<IOptions>;
}

export default class AddCC extends Component<IAddCCProps, any> {
  constructor(props: IAddCCProps) {
    super(props);
  }

  handleAddCC = () => {
    this.props.ccGroups.push({
      // 审批人类型
      approverType: APPROVERTYPE.LEADER,
      // 指定审批人时选中的对象
      selectedUsers: [] as ISelectedItem[],
      // 逐级审批类型
      seriesType: APPROVERTYPE.LEADER,
      // 逐级审批时的值
      seriesValue: '1',
      hasError: false
    });

    this.props.onCCChange({
      ccGroups: [...this.props.ccGroups]
    });
  };

  hideModal = (item: ICCGroupState) => {
    item.chooseUserModalVisible = false;

    this.props.onCCChange({
      ccGroups: [...this.props.ccGroups]
    });
  };

  showModal = (item) => {
    item.chooseUserModalVisible = true;

    this.props.onCCChange({
      ccGroups: [...this.props.ccGroups]
    });
  };

  handleDeleteCC = (index) => {
    this.props.ccGroups.splice(index, 1);

    this.props.onCCChange({
      ccGroups: [...this.props.ccGroups]
    });
  };

  handleGroupsUpdate = () => {
    this.props.onCCChange({
      ccGroups: [...this.props.ccGroups]
    });
  };

  handleFormMemberChange = (item: ICCGroupState, { formKey, formValue }) => {
    item.formKey = formKey;
    item.formValue = formValue;

    this.props.onCCChange({
      ccGroups: [...this.props.ccGroups]
    });
  };

  handleApproveTypeChange = (
    item: ICCGroupState,
    approverType: APPROVERTYPE
  ) => {
    item.approverType = approverType;
    item.selectedUsers = [];
    item.formKey = '';
    item.formValue = '';
    item.hasError = false;
    this.props.onCCChange({
      ccGroups: [...this.props.ccGroups]
    });
  };

  handleChooseUserSave = (
    item: ICCGroupState,
    selectedUsers: ISelectedItem[]
  ) => {
    if (selectedUsers.length > 20) {
      Modal.info({
        title: '信息提示',
        message: '指定抄送人员不能超过 20 人'
      });
      return;
    }

    item.selectedUsers = selectedUsers;
    item.chooseUserModalVisible = false;

    this.props.onCCChange({
      ccGroups: [...this.props.ccGroups]
    });
  };

  render() {
    const { formProperties = [] } = this.props;
    const { ccGroups = [] } = this.props;

    const cards = ccGroups.map((item: ICCGroupState, index: number) => {
      return (
        <Card
          key={Math.random()}
          style={{ marginBottom: '8px' }}
          className={Styles.cardStyles}
          header={
            <div className='card-header'>
              <span>抄送人</span>
              <Icon
                type='delete-o'
                onClick={() => {
                  this.handleDeleteCC(index);
                }}
              ></Icon>
            </div>
          }
        >
          <ApprovalGroup
            formProperties={formProperties}
            groupType='CC'
            approvalGroup={item as IApprovalGroupState}
            onApprovalChange={(approvalGroup) => {
              this.props.ccGroups[index] = {
                ...this.props.ccGroups[index],
                ...approvalGroup
              };

              this.props.onCCChange({
                ccGroups: [...this.props.ccGroups]
              });
            }}
          ></ApprovalGroup>
        </Card>
      );
    });

    return (
      <div>
        <div>{cards}</div>
        <div className='more-info'>
          <Button type='primary' shape='text' onClick={this.handleAddCC}>
            + 添加抄送人
          </Button>
        </div>
      </div>
    );
  }
}
