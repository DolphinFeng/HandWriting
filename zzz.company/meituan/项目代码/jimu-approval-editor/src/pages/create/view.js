import { inject, observer } from 'mobx-react';
import { Prompt } from 'react-router-dom';
// import '@ss/mtd-react/lib/style/index.css';
import React, { Component } from 'react';
import { Loading } from '@ss/mtd-react';
import { withRouter } from 'onejs/router';
import _lodash from 'lodash';
import { getFlowById, getUser, getAvatar } from '@/services/bpmn';
import { convertDataToForm } from '@/utils/form';
import Flow from './flow/flow';
import Form from './form/view';
import BaseInfo from './base/index';
import MoreInfo from './more/index.tsx';
import DeployInfo from './publish/index';
import './view.less';

@inject(({ global, approval }) => {
  return {
    ...approval,
    approval,
    setUser: global.setUser,
    initApprovalData: approval.initApprovalData,
    userInfo: global.userInfo,
    setApprovalInfo: approval.setApprovalInfo,
    backFn: approval.backFn,
    setId: approval.setId
  };
})
@observer
@withRouter
export default class Create extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ready: false,
      formReady: false
    };

    this.editorRef = React.createRef();
  }

  async componentDidMount() {
    // const userInfo = await getUser();
    // changeUser(userInfo);
    let { userInfo } = this.props;

    const { backFn, setId } = this.props;
    window.addEventListener('beforeunload', backFn, false);
    window.addEventListener('pagehide', backFn, false);
    window.addEventListener('unload', backFn, false);

    const { id } = this.props.history.location.query;
    setId(id);

    if (!userInfo || !userInfo.userId) {
      userInfo = await getUser();
      const data = await getAvatar({
        mis: userInfo.mis
      });
      userInfo.avatar = data.icon;
      this.props.setUser(userInfo);
    }

    const item = {
      addProcessManager: 1,
      departmentList: [
        {
          id: '',
          type: 1,
          dataType: ''
        }
      ],
      exportByDepartment: 1,
      processEdit: 1,
      userId: userInfo.userId,
      name: `${userInfo.userName}/${userInfo.mis}`,
      avatar: userInfo.avatar
    };

    if (!id) {
      await this.props.initApprovalData({
        approvalInfo: {
          iconUrl:
            'https://p1.meituan.net/travelcube/d490e0fa4a9bd4f2a346393291d3b97c1933.png',
          approvalName: '',
          category: '',
          responseDept: {
            id: '',
            name: ''
          },
          responsePerson: {
            id: item.userId,
            name: item.name
          },
          showInSubmitList: 3,
          processManagers: [
            {
              value: item.userId,
              label: item.name,
              avatar:
                item.avatar ||
                'https://p0.meituan.net/travelcube/d0efd64014b0b4804535be22ab821fcf3638.png',
              type: 'user'
            }
          ],
          processStarters: {
            all: false,
            userDeptForm: []
          },
          dataSource: []
        },
        deployInfo: {
          authMatterId: '',
          authMatterName: '',
          approvalStatus: 'NONE',
          approvalStatusName: '未审批',
          changeAuthMatter: true,
          approvalUrl: ''
        }
      });

      this.setState({
        ready: !this.state.ready
      });

      setTimeout(() => {
        this.setState({
          formReady: true
        });
      }, 0);
      return;
    }

    try {
      const data = await getFlowById({
        id
      });

      const formData = convertDataToForm(data);
      await this.props.initApprovalData(formData);

      this.setState({
        ready: !this.state.ready
      });

      setTimeout(() => {
        this.setState({
          formReady: true
        });
      }, 0);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      // eslint-disable-next-line no-empty
    }
  }

  componentWillUnmount() {
    const { backFn } = this.props;
    window.removeEventListener('beforeunload', backFn); // 离开页面时，清除监听
    window.removeEventListener('pagehide', backFn); // 离开页面时，清除监听
    window.removeEventListener('unload', backFn); // 离开页面时，清除监听
  }

  getConfirmation = () => {
    // 先保存表单信息
    const { curStep } = this.props.approval;
    // 当前在表单页面的时候需要重新校验一下updateForm
    if (curStep === 1) {
      this.props.approval.updateForm?.();
    }
    const { oldInitData, approvalInfo, form, process } = this.props.approval;
    const newData = {
      approvalInfo: _lodash.cloneDeep(approvalInfo),
      form: _lodash.cloneDeep(form),
      process: _lodash.cloneDeep(process)
    };
    // console.log(_lodash.isEqual(oldInitData, newData), newData, oldInitData);
    const isNoEdited = _lodash.isEqual(oldInitData, newData);

    return isNoEdited ? true : '有修改的内容未发布，确认离开吗？';
  };

  render() {
    const {
      curStep,
      // approvalInfo,
      form,
      process,
      approvalMoreSetting
    } = this.props;

    // const isFormReady = this.state.ready && !this.state.formReady;
    // console.log('form', form)

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative'
        }}
      >
        <Prompt
          message={() => {
            return this.getConfirmation();
          }}
        />
        {curStep === 0 && <BaseInfo></BaseInfo>}
        {this.state.ready && <Form hide={curStep !== 1} form={form}></Form>}
        {curStep === 2 && <Flow process={process}></Flow>}
        {curStep === 3 && (
          <MoreInfo approvalMoreSetting={approvalMoreSetting}></MoreInfo>
        )}
        {curStep === 4 && <DeployInfo></DeployInfo>}
        {!this.state.ready && (
          <div className='approval-loading'>
            <Loading
              className='approval-create-loading'
              loading={!this.state.ready}
              size='large'
            ></Loading>
          </div>
        )}
        <div className='panel-mantel'></div>
      </div>
    );
  }
}
