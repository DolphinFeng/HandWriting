import React from 'react';
import { withRouter, Link } from 'onejs/router';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import _lodash from 'lodash';
// import '@ss/mtd-react/lib/style/index.css';
import { Icon, Button, notification, Modal } from '@ss/mtd-react';
import './reset.css';
import './layout.less';
import CreateStep from '@/components/Layout/CreateStep';
import ApprovalValidate from '@/components/ApprovalValidate';

import UserInfo from '@/components/Layout/UserInfo';
import {
  convertFormToData,
  validateProcess,
  validateForm,
  validateBase,
  validateApproval
} from '@/utils/form';
import { createFlow, publishFlow, updateFlow, getUAC } from '@/services/bpmn';

import TripartiteHeader from '../pages/create-tripartite/header';

const UAC_ROLE_KEY = '/service/v2/console';
const UAC_THIRD_ROLE_KEY = '/thirdapproval/console';
const UAC_APP_KUAIDA = 'ApprovalList';
const UAC_APP_THIRD = 'TripartiteList';

export default withRouter((props) => {
  const { children } = props;
  return (
    <div className='onejs-app'>
      <App>{children}</App>
    </div>
  );
});

@withRouter
@inject(({ global, approval, approvalTripartite }) => {
  return {
    setCurrentPd: global.setCurrentPd,
    currentPd: global.currentPd,
    globalSetData: global.setData,
    ...global,
    approval,
    setData: approval.setData,
    approvalTripartite,
    approvalStatusName: approval.deployInfo.approvalStatusName,
    approvalStatus: approval.deployInfo.approvalStatus
  };
})
@observer
class App extends React.Component {
  setMenuHover(path) {
    if (window.location.pathname.indexOf(path) > -1) {
      return 'hover';
    }
    return '';
  }

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      err: [],
      hasPermission: false,
      showErr: false,
      pageReady: false,
      hasPermisssionInfo: []
    };
  }

  async componentDidMount() {
    const result = await getUAC().catch(() => {
      return [];
    });

    let uacArray = [];

    if (Array.isArray(result) && result.length > 0) {
      result.forEach((item) => {
        if (item.remoteMenus && item.remoteMenus.length > 0) {
          const uacs = item.remoteMenus.map((menu) => {
            return menu.url;
          });
          uacArray = uacArray.concat(uacs);
        }
      });

      // /**
      //  * 检查是否有权限
      //  */
      const hasPermisssionInfo = [];
      if (uacArray.includes(UAC_ROLE_KEY)) {
        hasPermisssionInfo.push(UAC_APP_KUAIDA);
      }
      if (uacArray.includes(UAC_THIRD_ROLE_KEY)) {
        hasPermisssionInfo.push(UAC_APP_THIRD);
      }

      const hasPermission = hasPermisssionInfo.length > 0;

      this.setState({
        hasPermission,
        hasPermisssionInfo
      });

      let curMenu = '';
      if (hasPermission) {
        curMenu = hasPermisssionInfo.includes('ApprovalList')
          ? 'ApprovalList'
          : 'TripartiteList';
      }
      this.props.globalSetData({
        uacPermissionInfo: hasPermisssionInfo,
        curMenu
      });
    }

    this.setState({
      pageReady: true
    });
  }

  // eslint-disable-next-line consistent-return
  redirectToList = () => {
    // 先保存表单信息
    this.updateFormData();
    const {
      oldInitData,
      approvalInfo,
      form,
      process,
      deployInfo
    } = this.props.approval;
    const newData = {
      approvalInfo: _lodash.cloneDeep(approvalInfo),
      form: _lodash.cloneDeep(form),
      process: _lodash.cloneDeep(process),
      deployInfo: _lodash.cloneDeep(deployInfo)
    };
    // console.log(_lodash.isEqual(oldInitData, newData), newData, oldInitData);
    const isNoEdited = _lodash.isEqual(oldInitData, newData);
    if (isNoEdited) {
      this.removeListener();
      // eslint-disable-next-line no-return-assign
      return (window.location.href = '/approval/admin');
    }
    this.removeListener();

    Modal.confirm({
      title: '有修改的内容未发布，确认离开吗？',
      message: '',
      onOk: () => {
        window.location.href = '/approval/admin';
      },
      onCancel: () => {}
    });
    // window.location.href = '/approval/admin';
  };

  removeListener() {
    const { backFn } = this.props.approval;
    window.removeEventListener('beforeunload', backFn); // 离开页面时，清除监听
    window.removeEventListener('pagehide', backFn); // 离开页面时，清除监听
    window.removeEventListener('unload', backFn); // 离开页面时，清除监听
  }

  updateFormData() {
    // 先保存表单信息
    // const { curStep } = this.props.approval;
    // console.log(curStep);
    // 当前在表单页面的时候需要重新校验一下updateForm
    // if (curStep === 1) {
    //   this.props.approval.updateForm?.();
    // }
    this.props.approval.updateForm?.();
  }

  async publishApprovalFlow(id) {
    await publishFlow({ id });
    // 发布成功会返回 id
    notification.success({
      title: '已进入发布前审核',
      message: '请等待内控审核通过，可在发布上线界面查看审核进度'
    });

    setTimeout(() => {
      // this.redirectToList();
      this.removeListener();
      window.location.href = '/approval/admin';
    }, 1500);
  }

  async saveApproval() {
    // 先保存表单信息
    this.updateFormData();
    const {
      approvalInfo,
      deployInfo,
      approvalInfoValidation,
      deployInfoValidation,
      approvalMoreSetting,
      form,
      process,
      componentList,
      conditionComponentList,
      formId,
      // 这个方法会是获取表单信息用，在保存的时候一定是初始化之后了
      getForm,
      formPropertiesFromService,
      // eslint-disable-next-line no-unused-vars
      formValidationInfo,
      dataSource
    } = this.props.approval;

    const { id } = this.props.history.location.query;

    const formInfo = getForm({ isValidation: true });

    // eslint-disable-next-line no-unused-vars
    const formData = {
      approvalInfo,
      deployInfo,
      approvalMoreSetting: toJS(approvalMoreSetting),
      form,
      process,
      formId,
      formPropertiesFromService,
      componentList,
      formControlledFields: formInfo.conditionFields,
      conditionComponentList,
      dataSource
    };

    const baseMsg = validateBase(approvalInfo, approvalInfoValidation);
    const processMsg = validateProcess(process);
    const deployMsg = validateApproval(deployInfo, deployInfoValidation);

    if (processMsg && processMsg.length > 0) {
      this.props.approval.setProcess(process);
    }

    // 校验有问题，先注释。form 内有组件会提示至少配置一个表单组件
    const formMsg = validateForm(formValidationInfo);
    // console.log(componentList)
    // const selectMsg = validateSelect(process, componentList);
    // const formMsg = [];
    // console.log(formMsg, processMsg);
    const validateMessage = [
      ...baseMsg,
      ...formMsg,
      ...processMsg,
      ...deployMsg
    ];
    // this.setState({
    //   err: validateMessage
    // });

    // 及时更新validateMessage，如果成功，红字提示会消失
    this.setState({
      err: validateMessage
    });
    // 及时更新校验提示，使得信息配置页和发布上线页立即标红显示
    this.props.setData({
      approvalInfoValidation: { ...approvalInfoValidation },
      deployInfoValidation: { ...deployInfoValidation }
    });
    if (validateMessage && validateMessage.length > 0) {
      this.setState({
        showErr: true
      });
      return false;
    }
    this.setState({
      showErr: false
    });

    const params = convertFormToData(formData, parseInt(id, 10));

    this.setState({
      loading: true
    });
    try {
      let data = {};

      if (!id) {
        // 创建
        data = await createFlow(params);
        if (data) {
          await this.publishApprovalFlow(data);
        }
      } else {
        data = await updateFlow(params);
        if (data && !data.errorCode) {
          await this.publishApprovalFlow(id);
        }
      }
    } finally {
      this.setState({
        loading: false
      });
    }
    return true;
  }

  render() {
    const { currentUser, approvalStatusName, approvalStatus } = this.props;
    const { err, hasPermission, pageReady } = this.state;
    const { curStep, setStep } = this.props.approval;
    const { id } = this.props.history.location.query;
    const curRoutePath = this.props.history.location.pathname;

    const noRoleDom = (
      <div className='no-permission'>
        <span>暂未向您开放此功能</span>
        <Button
          type='primary'
          className='apply-role'
          onClick={() => {
            window.open(
              'https://iam.sankuai.com/access-permission?field=add&resourceId=137&roleId=294476&source=UPM'
            );
          }}
        >
          申请权限
        </Button>
        <a
          href='https://km.sankuai.com/page/1229742145#id-1.2%E7%94%9F%E4%BA%A7%E7%8E%AF%E5%A2%83%E8%AE%BF%E9%97%AE%E5%9C%B0%E5%9D%80+%E6%9D%83%E9%99%90%E7%94%B3%E8%AF%B7'
          target='_blank'
        >
          查看使用手册
        </a>
      </div>
    );

    const statusColor = {
      NONE: '#000000',
      PENDING: '#E2B010',
      APPROVED: '#00b365'
    };

    const calcWidth = (approvalStatusName) => {
      // 16为字符长度，10为模块间距
      return `${approvalStatusName?.length * 16 + 10}px`;
    };

    return (
      <div style={{ height: '100%' }}>
        {(curRoutePath === '/approval/admin' ||
          curRoutePath === '/approval/admin/') && (
          <div className='jimu-app-header'>
            {/* <div className='logo'></div> */}
            <Link className='mypdlist' to='/approval/admin'>
              <img src='https://p0.meituan.net/travelcube/af35f5c8f58b4ca86bf353a085b334f611865.png' />
            </Link>
            {/* <a
            className='helpdoc'
            target='_blank'
            href='https://km.sankuai.com/page/735246822'
          >
            帮助手册
          </a> */}
            <UserInfo {...currentUser} />
          </div>
        )}
        {curRoutePath === '/approval/admin/create' && (
          <div className='jimu-app-header' style={{ height: '60px' }}>
            <div
              className='mypdlist'
              onClick={() => {
                this.redirectToList();
              }}
            >
              <Icon
                type='left'
                style={{
                  fontSize: '24px',
                  padding: '10px 15px',
                  marginBottom: '2px',
                  verticalAlign: 'middle'
                }}
              ></Icon>
            </div>
            {/* 占位符，保持CreateStep居中 */}
            {approvalStatus !== 'NONE' && (
              <div style={{ width: calcWidth(approvalStatusName) }}></div>
            )}
            {err.length > 0 && <div style={{ width: '100px' }}></div>}

            <CreateStep curStep={curStep} setStep={setStep} />

            {approvalStatus !== 'NONE' && (
              <span
                style={{ color: statusColor[approvalStatus] }}
                className='approval-status-name'
              >
                {approvalStatusName}
              </span>
            )}
            {err.length > 0 && (
              <ApprovalValidate
                curStep={curStep}
                setStep={setStep}
                errors={err}
              />
            )}

            <div className='approval-header-right'>
              <Button
                type='primary'
                onClick={this.saveApproval.bind(this)}
                loading={this.state.loading}
              >
                {!id ? '发布' : '更新'}
              </Button>
            </div>
          </div>
        )}
        {curRoutePath === '/approval/admin/create-tripartite' && (
          <TripartiteHeader />
        )}

        <div
          className='approval-content'
          style={{ width: '100%', height: 'calc(100vh - 60px)' }}
        >
          {!hasPermission && pageReady ? noRoleDom : this.props.children}
        </div>
      </div>
    );
  }
}
