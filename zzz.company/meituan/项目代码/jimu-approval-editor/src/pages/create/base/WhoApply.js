import { inject, observer } from 'mobx-react';
// import '@ss/mtd-react/lib/style/index.css';
import React, { Component } from 'react';
import { withRouter } from 'onejs/router';
import { Icon, Modal, Tooltip } from '@ss/mtd-react';
import PopNameCard from '@/components/PeopleCard';
import UserDeptWrapper from '@/components/UserDeptWrapper';
import { SelectorType } from '@/components/UserDeptWrapper/type';
import './index.less';

@inject(({ approval }) => ({
  setApprovalInfo: approval.setApprovalInfo,
  processStarters: approval.approvalInfo.processStarters
}))
@observer
@withRouter
export default class WhoApply extends Component {
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
    if (selectedItems.length > 50) {
      Modal.info({
        title: '提示',
        message: '最多选择50项'
      });
      return;
    }

    this.setState({ isShowModal: false }, () => {
      this.props.setApprovalInfo('processStarters', {
        all: false,
        userDeptForm: selectedItems
      });
    });
  };

  handleUserDeptDelete(item) {
    const { userDeptForm } = this.props.processStarters;
    const curIndex = userDeptForm.findIndex((val) => {
      return item.value === val.value;
    });

    userDeptForm.splice(curIndex, 1);

    this.props.setApprovalInfo('processStarters', {
      all: false,
      userDeptForm
    });
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
    const { processStarters } = this.props;

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
            <span>添加成员或部门</span>
          </div>
          {processStarters.userDeptForm?.map((item) => {
            return (
              <>
                {item.type === 'user' ? (
                  <PopNameCard
                    mis={item.label.split('/')[1] || ''}
                    tenantId={item.tenantId || '1'}
                  >
                    {this.renderContent(item)}
                  </PopNameCard>
                ) : (
                  <Tooltip message={item.description || item.seriesName}>
                    {this.renderContent(item)}
                  </Tooltip>
                )}
              </>
            );
          })}
        </div>
        <UserDeptWrapper
          isShowModal={isShowModal}
          handleClose={this.handleClose}
          handleSave={this.handleSave}
          value={this.props.processStarters.userDeptForm}
          userDeptType={SelectorType.Both}
          placeholder='支持输入姓名、mis号、完整部门链搜索'
          title='添加指定成员或部门'
        />
      </>
    );
  }
}
