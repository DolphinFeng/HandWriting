import { inject, observer } from 'mobx-react';
// import '@ss/mtd-react/lib/style/index.css';
import React, { Component } from 'react';
import { withRouter } from 'onejs/router';
import { Icon, Modal } from '@ss/mtd-react';
import UserDeptWrapper from '@/components/UserDeptWrapper';
import { SelectorType } from '@/components/UserDeptWrapper/type';
import './index.less';

@inject(({ approval }) => ({
  setApprovalInfo: approval.setApprovalInfo,
  processDataViewers: approval.approvalInfo.processDataViewers
}))
@observer
@withRouter
export default class WhoCanView extends Component {
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
        message: '最多选择 50 项'
      });
      return;
    }

    this.setState({ isShowModal: false }, () => {
      this.props.setApprovalInfo('processDataViewers', selectedItems);
    });
  };

  handleUserDeptDelete(item) {
    const { processDataViewers, setApprovalInfo } = this.props;

    const curIndex = processDataViewers.findIndex((val) => {
      return item.value === val.value;
    });

    processDataViewers.splice(curIndex, 1);
    setApprovalInfo('processDataViewers', processDataViewers);
  }

  render() {
    const { isShowModal } = this.state;
    const { processDataViewers } = this.props;

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
          {processDataViewers?.map((item, index) => {
            return (
              <div key={index} className='add-user-dept'>
                <img src={item.avatar} alt='' className='user-avatar' />
                <span className='item-label'>{item.label}</span>
                <Icon
                  type='close'
                  onClick={() => {
                    this.handleUserDeptDelete(item);
                  }}
                ></Icon>
              </div>
            );
          })}
        </div>
        <UserDeptWrapper
          isShowModal={isShowModal}
          handleClose={this.handleClose}
          handleSave={this.handleSave}
          value={this.props.processDataViewers}
          userDeptType={SelectorType.User}
          placeholder='支持输入姓名、mis号搜索'
          title='添加指定成员'
        />
      </>
    );
  }
}
