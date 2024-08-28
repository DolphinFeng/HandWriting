import { inject, observer } from 'mobx-react';
// import '@ss/mtd-react/lib/style/index.css';
import React, { Component } from 'react';
import Styles from './index.less';
import MessageSetting from './MessageSetting';
import ApprovalSetting from './ApprovalSettings';
import AdvanceSetting from './AdvanceSetting';
import { IMessageSetting } from './MessageSetting.type';
import { IComponent } from '@/utils/form.type';
import { syncMoreSettingText } from '@/utils/moreSetting';
import {
  ICallBackSetting,
  IClientAppkeys,
  AdvanceSettingType,
  CallBackSetting,
  ClientAppKeys,
  SecretSetting,
  ApprovalSettingType
} from './index.type';

const filterList = ['Captions', 'Image', 'File'];
interface IProps {
  approvalMoreSetting: {
    messageSetting: IMessageSetting;
    callbackSetting: ICallBackSetting;
    clientAppKeys: IClientAppkeys;
    secret: boolean;
    allowResubmit: boolean;
    allowWithdraw: boolean;
    batchOn: boolean;
  };
  setApprovalMoreSetting: Function;
  componentList: IComponent[];
}
@inject(({ approval }) => ({
  componentList: approval.componentList
    ?.filter((item) => filterList.indexOf(item.componentName) === -1)
    .map(
      (item): IComponent => {
        // console.log('componentList', approval.componentList);
        return {
          id: item.id,
          componentName: item.componentName,
          label: item.props?.label || '',
          options: item.props?.options || []
        } as IComponent;
      }
    ),
  approvalMoreSetting: approval.approvalMoreSetting,
  setApprovalMoreSetting: approval.setApprovalMoreSetting
}))
@observer
export default class BaseInfo extends Component<IProps, any> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { approvalMoreSetting, componentList } = this.props;
    const {
      messageSetting,
      callbackSetting,
      clientAppKeys,
      secret,
      allowResubmit,
      allowWithdraw,
      batchOn
    } = approvalMoreSetting;
    // 同步文案修改
    syncMoreSettingText(componentList, messageSetting);

    return (
      <div
        className={Styles['base-info']}
        style={{ width: '100%', height: '100%' }}
      >
        <div className={Styles['base-info-more']}>
          {/** 通知设置 */}
          <MessageSetting
            messageSetting={messageSetting}
            componentList={
              componentList?.filter((component) => {
                if (component.componentName === 'Table') {
                  return false;
                }
                return true;
              }) || []
            }
            onChange={() => {
              this.props.setApprovalMoreSetting(
                'messageSetting',
                messageSetting
              );
            }}
          ></MessageSetting>
          {/* 审批设置 */}
          <ApprovalSetting
            allowResubmit={allowResubmit}
            allowWithdraw={allowWithdraw}
            batchOn={batchOn}
            onChange={(key: ApprovalSettingType, info: boolean) => {
              this.props.setApprovalMoreSetting(key, info);
            }}
          />
          <AdvanceSetting
            callbackSetting={callbackSetting}
            clientAppKeys={clientAppKeys}
            secret={secret}
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            onChange={(
              info: ICallBackSetting | IClientAppkeys | boolean,
              type: AdvanceSettingType
            ) => {
              if (type === CallBackSetting) {
                this.props.setApprovalMoreSetting(CallBackSetting, info);
              } else if (type === ClientAppKeys) {
                this.props.setApprovalMoreSetting(ClientAppKeys, info);
              } else if (type === SecretSetting) {
                this.props.setApprovalMoreSetting(SecretSetting, info);
              }
            }}
          ></AdvanceSetting>
        </div>
      </div>
    );
  }
}
