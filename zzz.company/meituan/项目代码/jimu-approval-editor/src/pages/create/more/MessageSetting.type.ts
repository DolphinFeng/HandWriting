import { SortableItemType } from './SortableList';
import { ICallBackSetting } from './index.type';

export enum MessageType {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WITHDREW = 'WITHDREW',
  CC = 'CC'
}

export const MessageTemplate = {
  [MessageType.PENDING]: {
    tpl: '申请人：【申请人姓名及MIS号】',
    tabName: '待审批',
    action: '去审批',
    title: '【流程名称】待你审批'
  },
  [MessageType.APPROVED]: {
    tpl: '审批人：【审批人姓名及MIS号】',
    tabName: '已通过',
    action: '审批详情',
    title: '你发起的【流程名称】已通过'
  },
  [MessageType.REJECTED]: {
    tpl:
      '驳回人：【驳回人姓名及MIS号】 \n 审批节点：【节点名称】\n 驳回原因：【驳回原因】',
    tabName: '已驳回',
    action: '审批详情',
    title: '你发起的【流程名称】被驳回'
  },
  [MessageType.WITHDREW]: {
    tpl: '申请人：【申请人姓名及MIS号】',
    tabName: '已撤回',
    action: '已撤回',
    title: '撤回通知【流程名称】'
  },
  [MessageType.CC]: {
    tpl: '申请人：【申请人姓名及MIS号】 \n 审批人：【审批人姓名及MIS号】',
    tabName: '抄送',
    action: '审批详情',
    title: '抄送通知【流程名称】'
  }
};

interface IField extends SortableItemType {}

interface ISetting {
  fields: Array<IField>;
  fastApprove: boolean;
  isEdit: boolean;
  validateMessage: string | null;
}

type IMessageSetting = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  [key in MessageType]: ISetting;
};

interface IMoreSetting {
  messageSetting: IMessageSetting;
  callbackSetting: ICallBackSetting;
  clientAppKeys: Array<string>;
  secret: boolean;
  allowWithdraw: boolean;
  allowResubmit: boolean;
  batchOn: boolean;
}

interface IFormMessageSetting {
  shenpiViaMessage: boolean;
  messages: Array<IFormSetting>;
}
interface IFormSetting {
  messageType: MessageType;
  messageContentParams: Array<string>;
}

export {
  IField,
  ISetting,
  IMessageSetting,
  IMoreSetting,
  IFormMessageSetting,
  IFormSetting
};
