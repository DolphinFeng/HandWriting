import { observable, action } from 'mobx';
import { cloneDeep } from 'lodash';
import * as React from 'react';
import { captureSchemaError } from '@/utils/errorManager';

export interface IApprovalTriInfo {
  id: string;
  name: string;
  icon: string;
  belongDept: {
    id: string;
    name: string;
  };
  responsibleUser: {
    id: string;
    name: string;
  };
  applicationScope: string;
  description: string;
  purpose: string;
  callbackUrl: string;
  accessKey: string;
  accessSecret: string;
  businessDetailUrl: string;
  requesterDetailUrl: string;
}

export interface IValid {
  nameValid: string;
  callbackUrlValid: string;
  accessKeyValid: string;
  accessSecretValid: string;
  businessDetailUrlValid: string;
  requesterDetailUrlValid: string;
}

export default class ApprovalTripartiteCreate {
  @observable formRef?: React.RefObject<any>;

  @observable
  getForm;

  @action.bound
  setGetFormFn(fn) {
    this.getForm = fn;
  }

  @observable curStep = 0;

  /**
   * action
   */
  @action.bound
  setStep(step) {
    this.curStep = step;
  }

  @observable form: string = '';

  @observable approvalTriInfo: IApprovalTriInfo = {
    id: '',
    name: '',
    icon: '',
    belongDept: {
      id: '',
      name: ''
    },
    responsibleUser: {
      id: '',
      name: ''
    },
    applicationScope: '',
    description: '',
    purpose: '',
    callbackUrl: '',
    accessKey: '',
    accessSecret: '',
    businessDetailUrl: '',
    requesterDetailUrl: ''
  };

  // 信息配置校验
  @observable approvalTriInfoValidation: IValid = {
    nameValid: '',
    callbackUrlValid: '',
    accessKeyValid: '',
    accessSecretValid: '',
    businessDetailUrlValid: '',
    requesterDetailUrlValid: ''
  };

  @observable editorRef;

  @observable formVersionId = '';

  @action.bound
  setEditorRef(ref) {
    this.editorRef = ref;
  }

  @action.bound
  setRef = (ref) => {
    this.formRef = ref;
  };

  @action.bound
  setData(data) {
    // eslint-disable-next-line no-unused-vars
    for (const key in data) {
      this[key] = data[key];
    }
  }

  backFn = (e) => {
    e.preventDefault();
    e.returnValue = '确认离开';
  };

  @observable oldInitData = {};

  @action.bound
  async initApprovalData(data = {}, mode: 'update' | 'create') {
    const { baseInfo, formInfo, developInfo } = data;

    // initApprovalData 在创建和更新时都需要执行，创建时 baseInfo 没有值
    if (mode === 'update') {
      this.formVersionId = formInfo?.formVersionId;

      this.approvalTriInfo = {
        id: baseInfo.id,
        name: baseInfo.name,
        icon: baseInfo.icon,
        belongDept: baseInfo.belongDept,
        responsibleUser: baseInfo.responsibleUser,
        applicationScope: baseInfo.applicationScope,
        description: baseInfo.description,
        purpose: baseInfo.purpose,
        callbackUrl: developInfo.approvalCallback?.url,
        accessKey: developInfo.approvalCallback?.accessKey,
        accessSecret: developInfo.approvalCallback?.accessSecret,
        businessDetailUrl: developInfo.businessDetailUrl,
        requesterDetailUrl: developInfo.requesterDetailUrl
      };
    }

    try {
      await this.formRef?.current?.importSchema(formInfo?.model || '');
    } catch (error) {
      captureSchemaError(`${error}`);
    }

    // 用来判断是否有更新
    this.oldInitData = {
      approvalTriInfo: cloneDeep(this.approvalTriInfo)
      // form: JSON.stringify(this.formRef?.current?.getSchema())
    };
  }

  @action.bound
  setApprovalTriInfo(key, value) {
    if (key in this.approvalTriInfo) {
      this.approvalTriInfo[key] = value;
    }
    this.approvalTriInfo = { ...this.approvalTriInfo };
  }
}
