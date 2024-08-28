import { inject, observer } from 'mobx-react';
// import '@ss/mtd-react/lib/style/index.css';
import React, { Component } from 'react';
import { withRouter } from 'onejs/router';
import { Icon, Modal } from '@ss/mtd-react';
import PopNameCard from '@/components/PeopleCard';
import UserDeptWrapper from '@/components/UserDeptWrapper';
import { SelectorType } from '@/components/UserDeptWrapper/type';
import './index.less';

@inject(({ approval }) => ({
  setApprovalInfo: approval.setApprovalInfo,
  processManagers: approval.approvalInfo.processManagers
}))
@observer
@withRouter
export default class WhoManage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isShowModal: false
    };
  }

  componentDidMount() {}

  handleClose = () => {
    this.setState({ isShowModal: false });
  };

  handleSave = (selectedItems) => {
    if (selectedItems.length > 10) {
      Modal.info({
        title: '提示',
        message: '最多选择 10 项'
      });
      return;
    }

    this.setState({ isShowModal: false }, () => {
      this.props.setApprovalInfo('processManagers', selectedItems);
    });
  };

  handleUserDeptDelete(item) {
    const { processManagers, setApprovalInfo } = this.props;

    const curIndex = processManagers.findIndex((val) => {
      return item.value === val.value;
    });

    processManagers.splice(curIndex, 1);
    setApprovalInfo('processManagers', processManagers);
  }

  renderContent = (item) => {
    return (
      <div key={item.value} className='add-user-dept'>
        <img src={item.avatar} alt='avatar' className='user-avatar' />
        <span className='item-label'>{item.label}</span>
        <Icon
          type='close'
          onClick={() => {
            this.handleUserDeptDelete(item);
          }}
        ></Icon>
      </div>
    );
  };

  render() {
    const { isShowModal } = this.state;
    const { processManagers } = this.props;

    return (
      <>
        <div className='add-box'>
          <div
            className='add-icon'
            onClick={() => {
              this.setState({ isShowModal: true });
            }}
          >
            <Icon type='add'></Icon>
            <span>添加人员</span>
          </div>
          {processManagers?.map((item) => {
            return (
              <PopNameCard
                mis={item.label.split('/')[1] || ''}
                tenantId={item.tenantId || '1'}
              >
                {this.renderContent(item)}
              </PopNameCard>
            );
          })}
        </div>
        <UserDeptWrapper
          isShowModal={isShowModal}
          handleClose={this.handleClose}
          handleSave={this.handleSave}
          value={this.props.processManagers}
          userDeptType={SelectorType.User}
          placeholder='支持输入姓名、mis号搜索'
          title='添加指定成员'
        />
      </>
    );
  }
}
