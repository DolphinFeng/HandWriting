import { cloneDeep } from 'lodash';
import { NODETYPE } from '@/pages/create/flow/flow.type';
import {
  INodeBox,
  INodeBoxOption,
  IValidateMessage
} from '@/pages/create/flow/component/node-box.type';
import { toFlowable } from '@/pages/create/flow/utils/toFlowable';
import {
  ApprovalDeDuplicateType,
  IApprovalGroup,
  IFormRole,
  AdvancedType,
  ExpireAutoEnum
} from '@/pages/create/flow/component/Task/task.type';
import { convertMessageToData, convertDataToMessage } from './moreSetting';

import { schemaMigration } from './schemaMigration';

import {
  IApprovalGroupData,
  IApprovalGroupResponse,
  IFormData,
  IComponent,
  IFormField
} from './form.type';

import { dataType } from './base';

import {
  convertApprovalToData,
  convertConditionToData,
  convertConditionToForm,
  convertApprovalToForm,
  DEFAULT_FORM_ROLE_VALUE,
  restoreCanvasModel,
  getDefaultNodeFormRole,
  getDiffedFields,
  getUsedPropertyCodes,
  simplifyCanvasModel,
  mappingFormRoleToFormFileds,
  mappingFormFiledsToFormRole
} from './flow';
import { ICondition } from '@/pages/create/flow/component/Condition/condition.type';

export const formComponentList = ['Number', 'Money', 'Select', 'SelectDD'];
export const formTaskComponentList = ['People', 'Department'];

const DataTypeMapping = {
  Money: 'NUMBER',
  Number: 'NUMBER',
  SelectDD: 'ARRAY',
  Date: 'DATE',
  DateRange: 'DATE'
};

type DataTypeMappingType = keyof typeof DataTypeMapping;

export const findNode = (
  curNodeIndex: number[],
  process: INodeBox[]
): INodeBox => {
  let curArr: any;

  curNodeIndex.forEach((item) => {
    curArr = (curArr && curArr.child && curArr.child[item]) || process[item];
  });

  return curArr;
};

const containerType = ['Card', 'ColumnsGrid', 'Column'];
export function getFormComponentList(allComponent: any) {
  const componentList: any = [];
  const conditionComponentList: any = [];
  const stack = allComponent;

  if (stack) {
    while (stack.length > 0) {
      const curItem = stack.shift();
      const { componentName } = curItem;
      if (containerType.includes(componentName)) {
        stack.unshift(...curItem.children);
      } else {
        pushCondition(curItem, conditionComponentList);
        componentList.push(curItem);
      }
    }
  }

  return { componentList, conditionComponentList };
}

/**
 * 实现：拿 instanceKey 去 schema 里找到一个 treeNode，递归 treeNode 找到所有子节点的key
 */
export const findAllChildrenByInstanceKey = (form, instanceKey): string[] => {
  const layout = form?.pages[0]?.layout?.children;

  if (!layout) {
    return [];
  }

  // 层序遍历, 找到节点就退出
  const levelOrderSearch = (nodes, id) => {
    while (nodes.length > 0) {
      let currentLevelCount = nodes.length;

      while (currentLevelCount > 0) {
        const currentNode = nodes.shift();

        if (!currentNode) {
          currentLevelCount--;
          continue;
        }

        // id 唯一，找到即退出，没找到就继续查找 children
        if (currentNode.id === id) {
          return currentNode;
        }
        if (
          Array.isArray(currentNode.children) &&
          currentNode.children.length > 0
        ) {
          currentNode.children.forEach((element) => {
            nodes.push(element);
          });
        }

        currentLevelCount--;
      }
    }

    return null;
  };

  const node = levelOrderSearch(cloneDeep(layout), instanceKey);

  if (!node) {
    return [];
  }

  const result: string[] = [];
  // 递归找到所有的 chilren key
  const findAllChildrenKey = (nodes: any[]) => {
    if (!nodes || (nodes.length && nodes.length === 0)) {
      return;
    }

    for (let i = 0; i < nodes.length; i++) {
      result.push(nodes[i].id);
      findAllChildrenKey(nodes[i].children);
    }
  };

  findAllChildrenKey(node.children);

  return result;
};

function pushCondition(item: any, conditionComponentList: any) {
  const { componentName } = item;
  const isRequire = !!item.props.required;
  const allFormComponentList = [...formTaskComponentList, ...formComponentList];
  if (allFormComponentList.includes(componentName) && isRequire) {
    const curItem = {
      id: item.id,
      label: item.props?.label,
      options: item.props?.options,
      type: dataType[item.componentName],
      required: item.props?.required,
      componentName: item.componentName
    };
    conditionComponentList.push(curItem);
  }
}

export const convertDataToUserDeptForm = (data) => {
  if (!data) return [];

  const userForm = data.users
    ? data.users.map((item) => {
        return {
          value: String(item.uid),
          label: `${item.name}/${item.misId}`,
          avatar:
            item.iconUrl ||
            'https://p0.meituan.net/travelcube/d0efd64014b0b4804535be22ab821fcf3638.png',
          // type: TYPE.USER
          type: 'user'
        };
      })
    : [];

  const deptForm = data.depts
    ? data.depts.map((item) => {
        return {
          value: item.deptId,
          label: item.name,
          description: item.fullName,
          avatar:
            'https://p0.meituan.net/travelcube/0322c6885031df80d1d2cc07487ff82a2049.png',
          // type: TYPE.DEPARTMENT
          type: 'department'
        };
      })
    : [];

  const userDeptForm = userForm.concat(deptForm);

  return userDeptForm;
};

const convertDataToUserForm = (item) => {
  if (!item) {
    return {};
  }
  return {
    value: String(item.uid),
    label: `${item.name}/${item.misId}`,
    avatar:
      item.iconUrl ||
      'https://p0.meituan.net/travelcube/d0efd64014b0b4804535be22ab821fcf3638.png',
    type: 'user'
  };
};

/**
 * 将接口的 data 转化成 form 的数据
 */
export const convertDataToForm = (data: any): IFormData => {
  const { info, process, form, deployInfo, extension = {}, datasources } = data;

  if (!process) {
    return {} as IFormData;
  }
  /**
   * sequenceFlows 和 userTasks 里找
   */
  const { sequenceFlows, userTasks, canvasModel = '[]', start = {} } = process;
  /**
   * sequenceFlows 和 userTasks 对象转成 UI 对象
   */
  const taskNodes =
    userTasks?.map(
      (item: IApprovalGroupResponse): INodeBox => {
        const form = convertUserTasks(item);

        const {
          starterDeduplicate,
          approverDeduplicate,
          handleLimit,
          expireAuto
        } = item;

        const ccGroups = item?.ccGroups?.map((ccGroup) => {
          return convertApprovalToForm(ccGroup) as IApprovalGroup;
        });

        const formRoles = mappingFormFiledsToFormRole(item.formFields);

        return {
          id: item.id,
          resourceId: item.resourceId,
          option: {
            approvalGroup: form,
            title: item.name,
            overrideid: item.code,
            starterDeduplicate:
              starterDeduplicate || ApprovalDeDuplicateType.Yes,
            approverDeduplicate:
              approverDeduplicate || ApprovalDeDuplicateType.Yes,
            ccGroups,
            formRoles,
            advanced: {
              enable:
                (expireAuto && expireAuto !== ExpireAutoEnum.NOTHING) || false,
              handleLimit: handleLimit || 4,
              expireAuto: expireAuto || ExpireAutoEnum.NOTHING
            }
          }
        };
      }
    ) || [];

  const startNode = {
    resourceId: start.resourceId,
    option: {
      formRoles: mappingFormFiledsToFormRole(start.formFields || []),
      ccGroups: start?.ccGroups?.map((ccGroup) => {
        return convertApprovalToForm(ccGroup) as IApprovalGroup;
      })
    }
  };

  const conditionNodes =
    sequenceFlows?.map(
      (item: any): INodeBox => {
        const { conditionSetModel } = item;

        convertConditionToForm(conditionSetModel.conditions);

        const option: INodeBoxOption = {
          conditions: conditionSetModel.conditions,
          logical: conditionSetModel.logical,
          leaf: conditionSetModel.leaf
        };

        return {
          resourceId: item.resourceId,
          option
        };
      }
    ) || [];

  const nodeDetails = conditionNodes.concat(taskNodes);

  // 画布 UI model ,左侧的表单使用这个数据渲染
  const canvasModelObject = restoreCanvasModel(
    JSON.parse(canvasModel),
    nodeDetails,
    startNode as INodeBox
  );

  const approvalMoreSetting = {
    messageSetting: convertDataToMessage(extension?.message),
    callbackSetting: extension?.callback || {},
    clientAppKeys: extension?.clientAppKeys || [],
    secret: extension?.secret || false,
    authorizedConfigs: extension?.authorizedConfigs || [],
    allowWithdraw:
      typeof extension?.allowWithdraw === 'undefined'
        ? true
        : extension.allowWithdraw,
    allowResubmit:
      typeof extension?.allowResubmit === 'undefined'
        ? true
        : extension.allowResubmit,
    batchOn: extension?.batchOn || false
  };

  let processStarters = {};
  if (
    typeof info?.processStarters === 'undefined' ||
    info?.processStarters?.all
  ) {
    processStarters = {
      all: true,
      userDeptForm: []
    };
  } else {
    processStarters = {
      all: false,
      userDeptForm: convertDataToUserDeptForm(info?.processStarters)
    };
  }

  const processDataViewers =
    info.processDataViewers?.map(convertDataToUserForm) || [];

  let changeAuthMatter;

  if (deployInfo?.changeAuthMatter === undefined) {
    changeAuthMatter = true;
  } else {
    changeAuthMatter = deployInfo?.changeAuthMatter;
  }

  return {
    process: canvasModelObject,
    approvalInfo: {
      processManagers: info.processManagers.map(convertDataToUserForm),
      processDataViewers,
      iconUrl: info.iconUrl,
      summary: info.summary,
      approvalName: info.name,
      category: info.category,
      responseDept: {
        id: info.responseDept,
        name: info?.responseDeptData?.seriesName
      },
      responsePerson: {
        id: info.responsePerson,
        // name: `${info?.responsePersonData?.name}/${info?.responsePersonData?.code}`
        name: info?.responsePersonData
          ? `${info.responsePersonData.name}/${info?.responsePersonData.code}`
          : ''
      },
      coverage: info.coverage,
      businessDesc: info.businessDesc,
      purpose: info.purpose,
      showInSubmitList: info.showInSubmitList,
      processStarters,
      approvalMoreSetting
    },
    form: {
      id: form.id,
      model: schemaMigration(form.model),
      formProperties: form.formProperties,
      formControlledFields: form.formControlledFields
    },
    deployInfo: {
      authMatterId: deployInfo?.authMatterId || '',
      authMatterName: deployInfo?.authMatterName || '',
      approvalStatus: deployInfo?.approvalStatus || 'NONE',
      approvalStatusName: deployInfo?.approvalStatusName || '未审批',
      approvalUrl: deployInfo?.approvalUrl || '',
      changeAuthMatter
    },
    dataSource: datasources,
    version: process.version
  };
};

// formControlledFields

const convertFormControlledFields = (
  fields: Array<{
    code: string;
    conditionSetModel: ICondition;
  }>
) => {
  /**
   * 兼容后端现有方式，数组需要转化成 字符串，逗号隔开
   */
  const conditionIterator = (condition: ICondition) => {
    if (condition.conditions && condition.conditions.length > 0) {
      condition.conditions.forEach(conditionIterator);
    } else {
      condition.operationCode = condition.operator || '';
      if (Array.isArray(condition.value)) {
        condition.value = condition.value.join(',');
      }
    }
  };

  return (
    fields
      ?.map((item) => {
        conditionIterator(item.conditionSetModel);
        return item;
      })
      .filter((item) => {
        /**
         * 给后端的数据结构里不要有空数据，这个和 render 的实现有关，后续去除
         */
        if (
          item.conditionSetModel?.conditions?.length === 0 &&
          item.conditionSetModel?.leaf === false
        ) {
          return false;
        }
        return true;
      }) || []
  );
};

// 判断属性是否是用户自主配置的，比如选项
const isDataTypeCustom = (id, componentList) => {
  if (!id) return false;

  const component = componentList.filter((item) => {
    return item.id === id;
  });
  if (component[0].dataSource && component[0].dataSource.dataSourceType) {
    return true;
  }
  return false;
};

/**
 * form 数据转成接口数据
 */
export const convertFormToData = (formData: IFormData, id: number = 0) => {
  const {
    approvalInfo,
    process,
    approvalMoreSetting,
    deployInfo,
    form = {} as any,
    componentList: componentListOld = [] as IComponent[],
    formId,
    formControlledFields,
    formPropertiesFromService = [],
    conditionComponentList = [] as IComponent[],
    dataSource
  } = formData;

  const componentList = dealwithTableList(componentListOld);

  const conditionComponents = getUsedPropertyCodes(
    conditionComponentList,
    process
  );

  const formProperties =
    conditionComponents &&
    conditionComponents.map((item) => {
      const formItem = formPropertiesFromService?.find((formItem) => {
        return item.id === formItem.code;
      });

      const isCustom = isDataTypeCustom(item.id, componentList);
      return {
        id: formItem?.id || 0,
        code: item.id,
        name: item?.label || item.id,
        dataType: isCustom
          ? 'CUSTOM'
          : DataTypeMapping[item.componentName as DataTypeMappingType] ||
            'CHAR',
        dataTypeProperties: isCustom
          ? [
              { id: 'value', name: 'value' },
              { id: 'label', name: 'label' }
            ]
          : [],
        options: item?.options
      };
    });

  /**
   * 因为 simplify 修改了 process 里的对象，所以  cloneDeep
   */
  const canvasModel = JSON.stringify(simplifyCanvasModel(cloneDeep(process)));
  const model = toFlowable([...process], {
    properties: {
      name: approvalInfo.approvalName
    }
  });

  const { tasks, conditionNodes, startNode } = getNodesFromProcess(process);

  const processManagers = approvalInfo.processManagers?.map((item: any) => {
    return item.value;
  });

  const processDataViewers =
    approvalInfo.processDataViewers?.map((item) => {
      return item.value;
    }) || [];

  let processStarters = {};
  if (approvalInfo.processStarters.all) {
    processStarters = {
      all: true,
      userIds: [],
      deptIds: []
    };
  } else {
    const deptIds: Array<string> = [];
    const userIds: Array<string> = [];
    approvalInfo.processStarters.userDeptForm.forEach((item) => {
      if (item.type === 'department') {
        deptIds.push(item.value);
      } else if (item.type === 'user') {
        userIds.push(item.value);
      }
    });
    processStarters = {
      all: false,
      userIds,
      deptIds
    };
  }

  let startNodeFormFields = {} as IFormField[];

  // ui 上是否设置了
  const hasSettingStartNode =
    startNode?.option?.formRoles && startNode.option.formRoles.length > 0;

  const defaultStartNode = hasSettingStartNode
    ? startNode.option?.formRoles
    : getDefaultNodeFormRole(componentList, {}, NODETYPE.Start);

  startNodeFormFields = mappingFormRoleToFormFileds(
    defaultStartNode as IFormRole[]
  );

  const start = {
    formFields: getDiffedFields(
      startNodeFormFields,
      componentList,
      NODETYPE.Start
    ),
    ccGroups: startNode?.option?.ccGroups?.map(convertApprovalToData) || []
  };

  const userTasks = tasks.map((task: INodeBox) => {
    const option: INodeBoxOption = task.option || ({} as INodeBoxOption);
    const approvalGroup: IApprovalGroup = option?.approvalGroup || {};
    const ccGroups: IApprovalGroupData[] =
      option?.ccGroups?.map(convertApprovalToData) || [];
    const { approveType } = approvalGroup;
    const approveGroup = convertApprovalToData(approvalGroup);
    const advanced: AdvancedType = option?.advanced || {
      enable: false,
      handleLimit: 4,
      expireAuto: ExpireAutoEnum.NOTHING
    };

    // 去重配置
    const { starterDeduplicate, approverDeduplicate } = option;

    const mappedFormFields = mappingFormRoleToFormFileds(
      option.formRoles || []
    )?.filter((item) => {
      return item.privilege !== DEFAULT_FORM_ROLE_VALUE;
    });

    const formFields = getDiffedFields(
      mappedFormFields,
      componentList,
      NODETYPE.Task
    );

    return {
      id: task.id,
      resourceId: task.resourceId,
      name: option?.title,
      code: option?.overrideid,
      approveType,
      approveGroups: [approveGroup],
      ccGroups,
      starterDeduplicate,
      approverDeduplicate,
      formFields,
      handleLimit: advanced.handleLimit,
      expireAuto: advanced.enable ? advanced.expireAuto : ExpireAutoEnum.NOTHING
    };
  });

  const sequenceFlows = conditionNodes.map((condition: INodeBox) => {
    const { option = {} as INodeBoxOption } = condition;
    const { conditions } = option;

    convertConditionToData(conditions, componentList);

    const conditionSetModel = {
      conditions,
      logical: option.logical,
      leaf: option.conditions?.length === 0
    };
    return {
      resourceId: condition.resourceId,
      conditionSetModel
    };
  });

  if (!approvalMoreSetting?.messageSetting) {
    throw new Error('message 初始化数据异常');
  }

  const message = convertMessageToData(approvalMoreSetting?.messageSetting);
  const callback = {
    ...(approvalMoreSetting?.callbackSetting || {})
  };
  const clientAppKeys = approvalMoreSetting?.clientAppKeys;
  const secret = approvalMoreSetting?.secret || false;
  const transferFields = convertFormControlledFields(
    formControlledFields as any
  );
  const allowWithdraw =
    typeof approvalMoreSetting?.allowWithdraw === 'undefined'
      ? true
      : approvalMoreSetting?.allowWithdraw;
  const allowResubmit =
    typeof approvalMoreSetting?.allowResubmit === 'undefined'
      ? true
      : approvalMoreSetting?.allowResubmit;

  const batchOn =
    typeof approvalMoreSetting?.batchOn === 'undefined'
      ? false
      : approvalMoreSetting?.batchOn;

  const submitDataSource = dataSource?.map((item) => {
    return {
      id: item?.id || null,
      url: item?.url || null,
      accessKey: item?.accessKey || null,
      accessSecret: item?.accessSecret || null,
      contentSecret: item?.contentSecret || null
    };
  });

  return {
    info: {
      id,
      name: approvalInfo.approvalName,
      iconUrl: approvalInfo.iconUrl,
      category: approvalInfo.category,
      summary: approvalInfo.summary,
      responseDept: deployInfo.responseDept.id,
      responsePerson: deployInfo.responsePerson.id,
      coverage: deployInfo.coverage,
      businessDesc: deployInfo.businessDesc,
      purpose: deployInfo.purpose,
      showInSubmitList: approvalInfo.showInSubmitList,
      processManagers,
      processDataViewers,
      processStarters
    },
    form: {
      model: form,
      id: formId,
      formProperties,
      formControlledFields: transferFields
    },
    process: {
      canvasModel,
      model,
      userTasks,
      start,
      sequenceFlows
    },
    extension: {
      message,
      callback,
      clientAppKeys,
      secret,
      allowWithdraw,
      allowResubmit,
      batchOn
    },
    deployInfo: {
      authMatterId: deployInfo.authMatterId,
      authMatterName: deployInfo.authMatterName
    },
    datasources: submitDataSource
  };
};

/**
 * 广度优先遍历，找出画布里所有的子节点
 * 深拷贝
 */
const getNodesFromProcess = (
  process: Array<INodeBox>
): {
  tasks: INodeBox[];
  conditionNodes: INodeBox[];
  startNode?: INodeBox;
} => {
  const stack = cloneDeep(process);
  const tasks = [] as INodeBox[];
  const conditionNodes = [] as INodeBox[];
  let startNode = {} as INodeBox;

  while (stack.length > 0) {
    let stackLength = stack.length;
    while (stackLength > 0) {
      const pop = stack.pop();
      if (Array.isArray(pop?.child)) {
        pop?.child.forEach((item: any) => {
          stack.push(item);
        });
      }

      if (pop?.type === NODETYPE.Task) {
        tasks.push(pop);
      } else if (pop?.type === NODETYPE.Condition && !pop?.option?.default) {
        conditionNodes.push(pop);
      } else if (pop?.type === NODETYPE.Start) {
        startNode = pop;
      }
      stackLength--;
    }
  }

  return {
    tasks,
    conditionNodes,
    startNode
  };
};

/**
 * @param 接口审批组数据转表单数据
 */
const convertUserTasks = (data: IApprovalGroupResponse): IApprovalGroup => {
  const approveGroup = data.approveGroups[0];
  // 编辑回传需要

  if (!approveGroup) {
    return {};
  }

  const result = convertApprovalToForm(approveGroup);
  result.code = approveGroup.code;
  result.approveType = data.approveType;

  return result;
};

export const validateForm = (nodes: any[]): IValidateMessage[] => {
  const result: IValidateMessage[] = [];
  if (
    nodes.length < 1 ||
    (nodes.length === 1 && nodes[0]?.curValidationStatus)
  ) {
    result.push({
      type: 'form',
      validateMessage: '请选择至少配置一个表单控件'
    });
  }

  nodes.forEach((node) => {
    if (node.componentName === 'Table' && node.children?.length < 1) {
      result.push({
        type: 'form',
        validateMessage: `${node.props.label}至少需要添加一个子控件`
      });
    } else if (node.curValidationStatus === false) {
      result.push({
        type: 'form',
        validateMessage: `${node.props.label}控件校验失败`
      });
    }
  });

  /**
   * 遍历 nodes
   */
  return result;
};

export {
  buildTaskDescription,
  buildConditionDescription,
  findNodesByPropertyCodes,
  validateNode,
  validateProcess,
  validateBase,
  validateApproval,
  getFormRoles,
  getUsedPropertyCodes,
  removeProperties,
  findConditonsByPropertyCodes
} from './flow';

export { dataType };

export const isCaptionComponent = (key) => {
  return key?.indexOf('captions') > -1;
};

export const dealwithTableList = (componentList) => {
  // console.log('approval.componentList', approval.componentList);
  const curComponentList: Array<IComponent> = [];
  componentList?.forEach((item: any) => {
    curComponentList.push({
      id: item.id,
      componentName: item.componentName,
      label: item.props?.label || '',
      options: item.props?.options || [],
      dataSource: item.props?.dataSource
    } as IComponent);
    if (item.componentName === 'Table') {
      item.children.forEach((curItem) => {
        curComponentList.push({
          id: curItem.id,
          componentName: curItem.componentName,
          label: curItem.props?.label || '',
          options: curItem.props?.options || [],
          parentId: curItem.parentInstanceKey,
          parentLabel: item.props?.label || '',
          dataSource: item.props?.dataSource
        } as IComponent);
      });
    }
  });
  return curComponentList;
};
