import { observable, action, toJS } from 'mobx';
// import { postActionService } from '@/services/common';
import { cloneDeep } from 'lodash';
import { getFormComponentList } from '@/utils/form.ts';

export default class ApprovalCreate {
  constructor(root) {
    this.root = root;
  }

  backFn = (e) => {
    e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
    // Chrome requires returnValue to be set
    e.returnValue = '确认离开';
  };

  oldInitData = {};

  /**
   * 流程 id
   */
  @observable id;

  @observable curStep = 0;

  @observable data = {};

  // 获取表单数据
  getForm;

  // 获取选项数据源数据
  getOptions;

  // 表单数据
  @observable form = '';

  formValidationInfo = [];

  componentList = [];

  /**
   * 表单 id
   */
  formId = 0;

  /**
   * 给 flow 用的 component list 对象
   */
  conditionComponentList = [];

  /**
   * 表单条件组数据结构，后端拿来做校验
   */
  formControlledFields = [];

  formProperties = [];

  formPropertiesFromService = [];

  // 流程数据
  process = [];

  dataSource = [];

  // 流程设计
  @observable
  flowEditor = {
    // 发起人配置
    creatorInfo: {},
    // 流程信息
    flows: []
  };

  // 信息配置
  @observable approvalInfo = {
    approvalAppId: '',
    approvalName: '',
    summary: '', // 概要
    iconUrl:
      'https://p1.meituan.net/travelcube/d490e0fa4a9bd4f2a346393291d3b97c1933.png',
    cid: '1', // 1为美团
    visible: 1, // 入口是否在审批首页展示
    // 所属分类
    category: '',
    // 归属部门
    responseDept: {
      id: '',
      name: ''
    },
    // 流程负责
    responsePerson: {
      id: '',
      name: ''
    },
    coverage: '', // 适用范围
    businessDesc: '', // 业务说明
    purpose: '', // 审批目的
    showInSubmitList: 3, // 是否在可发起列表展示。3为支持，-5为不支持
    // 谁可以发起
    processStarters: {
      all: false, // 全选
      userDeptForm: [] // 人员和部门的全部信息
    },
    processManagers: [],
    processDataViewers: []
  };

  // 信息配置校验
  @observable approvalInfoValidation = {
    nameValid: '',
    categoryValid: '',
    startersValid: '',
    managersValid: ''
  };

  // 更多配置
  @observable approvalMoreSetting = {
    messageSetting: {
      PENDING: {
        fields: [],
        fastApprove: true
      },
      APPROVED: {
        fields: [],
        fastApprove: false
      },
      REJECTED: {
        fields: [],
        fastApprove: false
      },
      WITHDREW: {
        fields: [],
        fastApprove: false
      },
      CC: {
        fields: [],
        fastApprove: false
      }
    },
    callbackSetting: {
      url: '',
      accessKey: '',
      accessSecret: '',
      event: []
    },
    clientAppKeys: [],
    secret: false,
    authorizedConfigs: [],
    allowWithdraw: true,
    allowResubmit: true,
    batchOn: false
  };

  // 发布上线
  @observable deployInfo = {
    // 所属授权事项
    authMatterName: '',
    authMatterId: '',
    changeAuthMatter: true,
    // 归属部门
    responseDept: {
      id: '',
      name: ''
    },
    // 流程负责
    responsePerson: {
      id: '',
      name: ''
    },
    coverage: '', // 适用范围
    businessDesc: '', // 业务说明
    purpose: '' // 审批目的
  };

  @observable approvalStatus = 'NONE';

  // 发布上线校验
  @observable deployInfoValidation = {
    authMatterValid: '',
    personValid: ''
  };

  // 初始化
  @action.bound
  async initApprovalData(data) {
    const { approvalInfo, form, dataSource, deployInfo, version } = data;
    this.approvalInfo = {
      ...this.approvalInfo,
      approvalName: approvalInfo.approvalName,
      summary: approvalInfo.summary,
      approvalAppId: approvalInfo.id,
      iconUrl: approvalInfo.iconUrl,
      category: approvalInfo.category,
      showInSubmitList: approvalInfo.showInSubmitList,
      // 谁可以发起
      processStarters: approvalInfo.processStarters,
      processManagers: approvalInfo.processManagers,
      processDataViewers: approvalInfo.processDataViewers || []
    };

    this.approvalMoreSetting = {
      ...this.approvalMoreSetting,
      ...approvalInfo.approvalMoreSetting
    };

    this.deployInfo = {
      ...this.deployInfo,
      authMatterId: deployInfo.authMatterId,
      authMatterName: deployInfo.authMatterName,
      changeAuthMatter: deployInfo.changeAuthMatter,
      approvalStatus: deployInfo.approvalStatus,
      approvalStatusName: deployInfo.approvalStatusName,
      approvalUrl: deployInfo.approvalUrl,
      responseDept: approvalInfo.responseDept,
      responsePerson: approvalInfo.responsePerson,
      coverage: approvalInfo.coverage,
      businessDesc: approvalInfo.businessDesc,
      purpose: approvalInfo.purpose
    };

    this.form = form?.model || '{}';
    this.formId = form?.id;
    this.formPropertiesFromService = form?.formProperties;
    this.formControlledFields = form?.formControlledFields;
    this.process = data.process || [];
    this.dataSource = dataSource;
    // 更新表单组件
    this.updateForm('noForm');

    // 用来判断是否有更新
    this.oldInitData = {
      approvalInfo: cloneDeep(this.approvalInfo),
      form: cloneDeep(this.form),
      process: cloneDeep(this.process),
      deployInfo: cloneDeep(this.deployInfo)
    };

    this.version = version;
  }

  /**
   * action
   */
  @action.bound
  setForm(value) {
    this.form = value;
  }

  @action.bound
  setId(value) {
    this.id = value;
  }

  /**
   * action
   */
  @action.bound
  setGetFormFn(fn) {
    this.getForm = fn;
  }

  @action.bound
  setOptionsFn(fn) {
    this.getOptions = fn;
  }

  /**
   * action
   */
  @action.bound
  setProcess(value) {
    this.process = value;
  }

  /**
   * action
   */
  @action.bound
  setApprovalInfo(key, value) {
    if (key in this.approvalInfo) {
      this.approvalInfo[key] = value;
    }
    this.approvalInfo = { ...this.approvalInfo };
  }

  /**
   * action
   */
  @action.bound
  setDeployInfo(key, value) {
    if (key in this.deployInfo) {
      this.deployInfo[key] = value;
    }
    this.deployInfo = { ...this.deployInfo };
  }

  /**
   * action
   */
  @action.bound
  setApprovalMoreSetting(key, value) {
    if (key in this.approvalMoreSetting) {
      this.approvalMoreSetting[key] = value;
    }

    this.approvalMoreSetting = { ...this.approvalMoreSetting };
  }

  /**
   * action
   */
  @action.bound
  setData(data) {
    // eslint-disable-next-line no-unused-vars
    for (const key in data) {
      this[key] = data[key];
    }
  }

  /**
   * action
   */
  @action.bound
  setStep(data) {
    if (this.curStep === 1) {
      // 获取表单的数据
      this.updateForm();
    }
    this.curStep = data;
  }

  /**
   * 问题：停留在表单编辑页时候点击发布，获取不到 componentList；
   * 解决：提取 updateForm ，在发布的时候保存一下。
   */
  updateForm = (type) => {
    /**
     * 没有切换到 Jimu-Editor 页面过，该实例不会被初始化
     * 解决刚进入页面并没有切换到表单编辑页就点击“更新”报错的问题。
     */
    // if (!this.getForm) {
    //   return;
    // }
    // console.log('updateForm  11111')
    const isNoSelectForm = !!type;
    let schema;

    try {
      schema = JSON.parse(this.form);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('schema 有问题', e);
    }

    let validationInfo = [];
    if (!isNoSelectForm) {
      const formInfo = this.getForm({ isValidation: true });
      schema = formInfo.schema;
      validationInfo = formInfo.validationInfo;
      this.formControlledFields = formInfo.conditionFields;
      this.dataSource = formInfo.allDataSource || [];
    }

    if (!schema?.pages) {
      return;
    }
    // console.log(schema)
    const allChildren = cloneDeep(schema?.pages[0]?.layout?.children);

    const { componentList, conditionComponentList } = getFormComponentList(
      allChildren
    );

    this.diffFormComponentList(conditionComponentList);

    this.componentList = componentList;

    // eslint-disable-next-line no-console
    this.formValidationInfo =
      validationInfo.length === 0 ? componentList : validationInfo;

    if (!isNoSelectForm) {
      this.form = JSON.stringify(schema);
    }
  };

  /**
   * 离开表单区域保存下表单变更属性
   */
  diffFormComponentList(allComponent) {
    // 拿来和 this.componentList 去 diff
    const formComponentList = allComponent;

    // 在 this.componentList 里，不在 formComponentList 里的，删掉
    for (let i = this.conditionComponentList.length - 1; i >= 0; i--) {
      const component = this.conditionComponentList[i];

      const formComponent = formComponentList.find((item) => {
        return item.id === component.id;
      });

      if (typeof formComponent === 'undefined') {
        // delete
        this.conditionComponentList.splice(i, 1);
      } else {
        // update
        component.label = formComponent.label;
        component.options = formComponent.options;
      }
    }
    // 在 formComponentList 里 不在 this.componentList 里的，添加进来
    for (let i = 0; i < formComponentList.length; i++) {
      const component = formComponentList[i];
      if (
        this.conditionComponentList.findIndex((item) => {
          return item.id === component.id;
        }) === -1
      ) {
        this.conditionComponentList.push(component);
      }
    }
  }

  @action.bound
  setUrlData(url, data) {
    this.data[url] = data;
  }

  @action.bound
  async updateProcessManagers(processManagers) {
    // const { processManagers } = this.approvalInfo;
    const all = toJS(processManagers);
    if (!all[0] || (all[0] && all[0].avatar && all.length === 1)) {
      return all;
    }
    // const userIds = all.map((item) => item.userId || '');
    return [];
    // const data = await postActionService(
    //   '/api/approval/base/queryUserAndAvatarInfo',
    //   { userIds }
    // );
    // if (!Array.isArray(data)) {
    //   return [];
    // }
    // const newData = all.map((item) => {
    //   const curUser = data.filter((a) => a.userId === item.userId);
    //   item.name = curUser[0].name;
    //   item.avatar = curUser[0].avatar;
    //   return item;
    // });
    // // this.setApprovalInfo('processManagers', newData);
    // return newData;
  }
}
