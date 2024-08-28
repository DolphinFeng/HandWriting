import { inject, observer } from 'mobx-react';
// import '@ss/mtd-react/lib/style/index.css';
import React, { Component } from 'react';
// import ajax from '@/services/ajax';
import Aside from '@/pages/index/Aside';
import ApprovalList from './ApprovalList';
import { getUser, getAvatar } from '@/services/bpmn';
import './index.less';
import Export from './Export';
import TripartiteList from './TripartiteList';
import { setRaptorUserInfo } from '@/utils/errorManager.ts';

@inject(({ approval, global }) => ({
  setUser: global.setUser,
  uacPermissionInfo: global.uacPermissionInfo,
  setData: global.setData,
  curMenu: global.curMenu,
  setStep: approval.setStep
}))
@observer
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      approvalList: []
    };
  }

  async componentDidMount() {
    this.props.setStep(0);
    /**
     * 后续合并接口
     */
    const userInfo = await getUser();

    setRaptorUserInfo(userInfo);

    const data = await getAvatar({
      mis: userInfo.mis
    });
    userInfo.avatar = data.icon;
    this.props.setUser(userInfo);
  }

  setCurMenu(e) {
    this.props.setData({
      curMenu: e
    });
  }

  render() {
    const { curMenu, uacPermissionInfo } = this.props;
    return (
      <div className='admin-content'>
        <Aside
          curMenu={curMenu}
          uacPermissionInfo={uacPermissionInfo}
          setMenu={(e) => {
            this.setCurMenu(e);
          }}
        ></Aside>
        <div className='main-content'>
          {curMenu === 'ApprovalList' && <ApprovalList></ApprovalList>}
          {curMenu === 'Export' && <Export></Export>}
          {curMenu === 'TripartiteList' && <TripartiteList></TripartiteList>}
        </div>
      </div>
    );
  }
}
