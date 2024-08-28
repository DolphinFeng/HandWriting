import React, { Component } from 'react';
import { withRouter } from 'onejs/router';
import { inject } from 'mobx-react';
import _lodash from 'lodash';
import { Icon, Button, notification, Modal } from '@ss/mtd-react';
import { IJMComponent } from '@jimu/types';
import ApprovalValidate from '@/components/ApprovalValidate';
import CreateStep from '@/components/Layout/CreateStep';
import { IValidateMessage } from '@/pages/create/flow/component/node-box.type';
import { createFlow, updateFlow } from '@/services/tripartite';
import { IApprovalTriInfo, IValid } from '@/store/approvalTripartite';
// import { validateForm } from '@/utils/form';

interface IProps {
  curStep: number;
  setStep: Function;
  history: any;
  formRef: React.RefObject<any>;
  approvalTriInfo: IApprovalTriInfo;
  approvalTriInfoValidation: IValid;
  setData: Function;
  getForm: Function;
  formVersionId: string;
  backFn: any;
  formInfo: any;
  oldInitData: any;
}

interface IState {
  loading: boolean;
  err: object[];
}

@withRouter
@inject(({ approvalTripartite }) => {
  return {
    backFn: approvalTripartite.backFn,
    formVersionId: approvalTripartite.formVersionId,
    getForm: approvalTripartite.getForm,
    formRef: approvalTripartite.formRef,
    curStep: approvalTripartite.curStep,
    formInfo: approvalTripartite.formInfo,
    setStep: approvalTripartite.setStep,
    approvalTriInfo: approvalTripartite.approvalTriInfo,
    approvalTriInfoValidation: approvalTripartite.approvalTriInfoValidation,
    setData: approvalTripartite.setData,
    oldInitData: approvalTripartite.oldInitData
  };
})
export default class Header extends Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      err: []
    };
  }

  // eslint-disable-next-line consistent-return
  redirectToList = () => {
    // 先保存表单信息
    const { oldInitData, approvalTriInfo } = this.props;

    // const formInfo = this.props.getForm({ isValidation: true });
    // const { schema } = formInfo;

    const newData = {
      approvalTriInfo: _lodash.cloneDeep(approvalTriInfo)
      // form: JSON.stringify(schema)
    };

    const isNotEdited = _lodash.isEqual(oldInitData, newData);
    if (isNotEdited) {
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
      }
    });
  };

  removeListener() {
    const { backFn } = this.props;
    window.removeEventListener('beforeunload', backFn); // 离开页面时，清除监听
    window.removeEventListener('pagehide', backFn); // 离开页面时，清除监听
    window.removeEventListener('unload', backFn); // 离开页面时，清除监听
  }

  validateBase = (approvalTriInfo, approvalTriInfoValidation) => {
    const result: IValidateMessage[] = [];

    if (approvalTriInfo.name.length > 20 || approvalTriInfo.name.length === 0) {
      result.push({
        validateMessage: '名称不能为空且不超过20个字',
        type: 'base'
      });
      approvalTriInfoValidation.nameValid = '名称不能为空且不超过20个字';
    } else {
      approvalTriInfoValidation.nameValid = '';
    }

    if (
      !approvalTriInfo?.callbackUrl ||
      !/(http|https):\/\/([\w.]+\/?)\S*/.test(approvalTriInfo?.callbackUrl) ||
      approvalTriInfo?.callbackUrl?.length > 1000
    ) {
      result.push({
        validateMessage: '请符合http或者https格式且不超过1000字',
        type: 'base'
      });
      approvalTriInfoValidation.callbackUrlValid =
        '请符合http或者https格式且不超过1000字';
    } else {
      approvalTriInfoValidation.callbackUrlValid = '';
    }

    if (
      approvalTriInfo?.businessDetailUrl &&
      !/(http|https):\/\/([\w.]+\/?)\S*/.test(
        approvalTriInfo?.businessDetailUrl ||
          approvalTriInfo?.businessDetailUrl?.length > 1000
      )
    ) {
      result.push({
        validateMessage: '请符合http或者https格式且不超过1000字',
        type: 'base'
      });
      approvalTriInfoValidation.businessDetailUrlValid =
        '请符合http或者https格式且不超过1000字';
    } else {
      approvalTriInfoValidation.businessDetailUrlValid = '';
    }

    if (!approvalTriInfo.requesterDetailUrl) {
      result.push({
        validateMessage: '已发起单据链接必填',
        type: 'base'
      });
      approvalTriInfoValidation.requesterDetailUrlValid = '已发起链接必填';
    } else if (
      approvalTriInfo?.requesterDetailUrl &&
      !/(http|https):\/\/([\w.]+\/?)\S*/.test(
        approvalTriInfo?.requesterDetailUrl ||
          approvalTriInfo?.requesterDetailUrl?.length > 1000
      )
    ) {
      result.push({
        validateMessage: '请符合http或者https格式且不超过1000字',
        type: 'base'
      });
      approvalTriInfoValidation.requesterDetailUrlValid =
        '请符合http或者https格式且不超过1000字';
    } else {
      approvalTriInfoValidation.requesterDetailUrlValid = '';
    }

    if (
      !approvalTriInfo?.accessKey ||
      !/^[0-9A-Za-z]{5,20}$/.test(approvalTriInfo?.accessKey) ||
      approvalTriInfo?.accessKey.length > 20
    ) {
      result.push({
        validateMessage: 'AccessKey填写错误，请检查。5-20位数字或字母组成',
        type: 'base'
      });
      approvalTriInfoValidation.accessKeyValid =
        'AccessKey填写错误，请检查。5-20位数字或字母组成';
    } else {
      approvalTriInfoValidation.accessKeyValid = '';
    }

    if (
      !approvalTriInfo?.accessSecret ||
      !/^[0-9A-Za-z]{5,20}$/.test(approvalTriInfo?.accessSecret) ||
      approvalTriInfo?.accessSecret.length > 20
    ) {
      result.push({
        validateMessage: 'AccessSecret填写错误，请检查。5-20位数字或字母组成',
        type: 'base'
      });
      approvalTriInfoValidation.accessSecretValid =
        'AccessSecret填写错误，请检查。5-20位数字或字母组成';
    } else {
      approvalTriInfoValidation.accessSecretValid = '';
    }

    return result;
  };

  validateForm = (schema): Array<IValidateMessage> => {
    // const formMessage = validateForm(validationInfo);
    const formMessage = [];

    const MAX_COMPONENT_COUNT = 20;
    // 子组件不能超过 20 个

    let count = 0;

    const dfs = (node: IJMComponent): void => {
      if (!node) {
        return;
      }

      count++;

      if (node.children?.length > 0) {
        node.children.forEach((childNode) => {
          dfs(childNode);
        });
      }
    };

    const components = schema?.pages[0]?.layout?.children;
    components?.forEach((component) => {
      dfs(component);
    });

    if (count > MAX_COMPONENT_COUNT) {
      formMessage.push({
        type: 'form',
        validateMessage: `控件数不能超过 ${MAX_COMPONENT_COUNT} 个`
      });
    }
    return formMessage;
  };

  saveTripartiteApproval = async (): Promise<boolean | void> => {
    const { id } = this.props.history.location.query;

    /**
     * 后面不知道会不会用，暂时注释
     */
    // const formInfo = this.props.getForm({ isValidation: true });
    // const { schema, validationInfo } = formInfo;
    // const model = JSON.stringify(schema);

    const { approvalTriInfo } = this.props;
    const params = {
      baseInfo: {
        name: approvalTriInfo.name,
        icon:
          approvalTriInfo.icon ||
          'https://p1.meituan.net/travelcube/d490e0fa4a9bd4f2a346393291d3b97c1933.png',
        belongDept: approvalTriInfo.belongDept?.id,
        responsibleUser: approvalTriInfo.responsibleUser?.id,
        applicationScope: approvalTriInfo.applicationScope,
        description: approvalTriInfo.description,
        purpose: approvalTriInfo.purpose
      },
      developInfo: {
        approvalCallback: {
          url: approvalTriInfo.callbackUrl,
          accessKey: approvalTriInfo.accessKey,
          accessSecret: approvalTriInfo.accessSecret
        },
        businessDetailUrl: approvalTriInfo.businessDetailUrl,
        requesterDetailUrl: approvalTriInfo.requesterDetailUrl
      }
    };
    const baseMsg = this.validateBase(
      this.props.approvalTriInfo,
      this.props.approvalTriInfoValidation
    );

    /**
     * 表单组件数判断
     */
    // const formMsg = this.validateForm(schema, validationInfo);

    // const validateMessage = [...baseMsg, ...formMsg];
    const validateMessage = [...baseMsg];

    // 及时更新validateMessage，如果成功，红字提示会消失
    this.setState({
      err: validateMessage
    });
    // 及时更新校验提示，使得信息配置页立即标红显示
    this.props.setData({
      approvalInfoValidation: { ...this.props.approvalTriInfoValidation }
    });

    if (validateMessage.length > 0) {
      return false;
    }

    this.setState({
      loading: true
    });

    try {
      if (!id) {
        await createFlow(params);
      } else {
        params.baseInfo.id = id;
        await updateFlow(params);
      }

      // 发布成功会返回 id
      notification.success({
        title: !id ? '发布成功' : '更新成功',
        message: !id ? '三方审批创建成功。' : '三方审批更新成功'
      });

      this.removeListener();
      setTimeout(() => {
        window.location.href = '/approval/admin';
      }, 1500);

      return true;
    } finally {
      this.setState({
        loading: false
      });
    }
  };

  render() {
    const { curStep, setStep, formVersionId } = this.props;
    const { err } = this.state;
    const { id } = this.props.history.location.query;

    return (
      <>
        <div className='tripartite-header'>
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
          <CreateStep info={['信息配置']} curStep={curStep} setStep={setStep} />
          {err.length > 0 && (
            <ApprovalValidate
              key={Math.random()}
              curStep={curStep}
              setStep={setStep}
              errors={err}
            />
          )}

          <div className='approval-header-right'>
            <Button
              onClick={this.saveTripartiteApproval}
              loading={this.state.loading}
            >
              {!id ? '发布' : '更新'}
            </Button>
          </div>
        </div>
        <div className='tripartite-header-bottom'>
          {formVersionId ? `当前表单版本 ID: ${formVersionId}，` : ''}
          使用三方审批前，请仔细阅读「
          <a href='https://km.sankuai.com/page/1286430846' target='_blank'>
            接入文档
          </a>
          」
        </div>
      </>
    );
  }
}
