export interface ICallBackSetting {
  url: string;
  accessKey: string;
  accessSecret: string;
}

export type IClientAppkeys = Array<string>;

export type AdvanceSettingType = 'callbackSetting' | 'clientAppKeys' | 'secret';

export const CallBackSetting = 'callbackSetting';

export const SecretSetting = 'secret';

export const ClientAppKeys = 'clientAppKeys';

export type ApprovalSettingType = 'allowWithdraw' | 'allowResubmit' | 'batchOn';

export const AllowWithdraw = 'allowWithdraw';

export const AllowResubmit = 'allowResubmit';
