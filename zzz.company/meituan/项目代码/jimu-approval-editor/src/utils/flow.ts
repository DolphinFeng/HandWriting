import {
  isPlainObject,
  isEmpty,
  differenceWith,
  remove,
  cloneDeep
} from 'lodash';

import { NODETYPE } from '@/pages/create/flow/flow.type';
import {
  INodeBox,
  INodeBoxOption,
  IValidateMessage
} from '@/pages/create/flow/component/node-box.type';
import {
  IApprovalGroup,
  APPROVERTYPE,
  APPROVEFORMROLE,
  ISelectedItem,
  IFormMember,
  IFormRole,
  OptionTypeEnum
} from '@/pages/create/flow/component/Task/task.type';

import {
  ICondition,
  IConditionValueOption,
  IConditionValueOptionData
} from '@/pages/create/flow/component/Condition/condition.type';

import { LogicalText } from '@/pages/create/flow/component/Condition/const';

import {
  IUsers,
  IApprovalGroupData,
  OutputTypeEnum,
  ReportChainTypeEnum,
  ChoiceTypeEnum,
  GroupTypeEnum,
  InputTypeEnum,
  IComponent,
  EntityTypeEnum,
  IFormField,
  FilterCeilingOrFloorType,
  IApprovalGroupForm,
  STANDARD_ROLES_KEY,
  STANDARD_APPROVERTYPE_TITLE
} from './form.type';
import {
  shouldRenderSelect,
  buildConditionValue,
  validateHasErrorInCondition
} from '@/pages/create/flow/component/Condition/util';
import {
  DEPRECATED_DEPARTMENT,
  FORM_PEOPLE_ROLES,
  FORM_DEPARTMENT_ROLES
} from '@/pages/create/flow/component/Task/const';

import { isNewApprovalGroup } from '@/pages/create/flow/component/Task/util';

import { dataType } from './base';

const isArrayConditionValue = (condition) => {
  return ['in', 'ni', 'NT', 'CT'].indexOf(condition.operationCode) > -1;
};

/**
 * 废弃的部门层级，X1，X2，X3A 等
 */
const isDeprecatedDepartment = (filterValue?: string) => {
  if (!filterValue) {
    return false;
  }

  return DEPRECATED_DEPARTMENT.some((grade) => {
    return grade === filterValue;
  });
};

/**
 * 将approval group 的数据由 formdata 转化成 data
 */
export const convertApprovalToData = (
  task: IApprovalGroup | undefined
): IApprovalGroupData => {
  const params: IApprovalGroupData = {};

  if (typeof task === 'undefined') {
    return params;
  }
  // 编辑回传需要
  params.code = task.code;

  if (task.optionType === 'STANDARD_ROLES') {
    params.optionType = task.standardRoleConfig?.roleType;
    params.standardRoleConfig = task.standardRoleConfig;
  } else if (isNewApprovalGroup(task.optionType as OptionTypeEnum, 'option')) {
    params.optionType = task.optionType;
    params.inputKey = task.inputKey;
    params.inputType = task.inputType;
    params.entityType = entityTypeAdaptor(task.inputKey);

    switch (task.optionType) {
      case OptionTypeEnum.COST_CENTER_OWNER:
        params.outputType = OutputTypeEnum.COST_CENTER_OWNER;
        params.groupType = GroupTypeEnum.COST_CENTER;
        break;
      default:
        break;
    }
  } else {
    switch (task.approverType) {
      // 发起人上级
      case APPROVERTYPE.LEADER:
        params.inputType = InputTypeEnum.STARTER;
        params.groupType = GroupTypeEnum.REPORT_CHAIN;
        params.choiceType = ChoiceTypeEnum.FIRST;

        // 发起人汇报链上的各级主管
        if (task.seriesType === APPROVERTYPE.LEADER) {
          params.filterField = ReportChainTypeEnum.REPORT_CHAIN_LEVEL;
          params.filterValue = task.seriesValue;
        }
        // 按CEO层级向下指定
        else if (task.seriesType === APPROVERTYPE.LOWER_THAN_CEO) {
          params.filterField = ReportChainTypeEnum.OA_GRADE;
          params.filterValue = 'CEO';
          params.levelOffset = task.seriesValue;
        }
        break;
      // 发起人部门负责人
      case APPROVERTYPE.DEPTOWNER:
        params.inputType = InputTypeEnum.STARTER;
        params.groupType = GroupTypeEnum.DEPARTMENT_CHAIN;
        params.outputType = OutputTypeEnum.DEPARTMENT_OWNER;
        // 按发起人层级向上指定
        /**
         * 兼容废弃的 X1，X2 数据
         */
        if (isDeprecatedDepartment(task.seriesValue)) {
          params.filterField = ReportChainTypeEnum.DEPARTMENT_GRADE;
        } else {
          params.filterField = task.seriesType;
        }

        params.filterValue = task.seriesValue;
        break;
      // 指定审批人
      case APPROVERTYPE.SPECIFY:
        params.inputType = InputTypeEnum.STATIC;
        params.groupType = GroupTypeEnum.EMPLOYEE;
        params.users = task.selectedUsers?.map((item) => {
          const { id = '' } = item;
          return parseInt(id, 10);
        });
        break;
      // 逐级审批
      case APPROVERTYPE.STEPBYSTEP:
        params.inputType = task.inputType;
        params.groupType = GroupTypeEnum.REPORT_CHAIN;
        params.choiceType = ChoiceTypeEnum.SERIES;
        params.inputKey = task.inputKey;
        params.entityType = entityTypeAdaptor(params.inputKey);

        if (task.seriesType === APPROVERTYPE.DEPTOWNER) {
          /**
           * 兼容 废弃的X1，X2 数据
           */
          if (isDeprecatedDepartment(task.seriesValue)) {
            params.filterField = ReportChainTypeEnum.DEPARTMENT_GRADE;
          } else {
            params.filterField = ReportChainTypeEnum.DEPARTMENT_DEPTH;
          }
        } else if (task.seriesType === APPROVERTYPE.LEADER) {
          params.filterField = ReportChainTypeEnum.REPORT_CHAIN_LEVEL;
        }
        params.filterValue = task.seriesValue;

        // 封顶设置
        if (typeof task.filterCeiling !== 'undefined' && !!task.filterCeiling) {
          params.filterCeilings = [
            {
              type: 'DEPARTMENT_DEPTH',
              value: task.filterCeiling
            }
          ];
        }

        // 保底设置
        if (typeof task.filterFloor !== 'undefined' && !!task.filterFloor) {
          params.filterFloors = [
            {
              type: 'JOB_LEVEL',
              value: task.filterFloor
            }
          ];
        }
        break;
      // 发起人的 HRBP
      case APPROVERTYPE.HRBP:
        params.inputType = InputTypeEnum.STARTER;
        params.groupType = GroupTypeEnum.DEPARTMENT_CHAIN;
        params.outputType = OutputTypeEnum.DEPARTMENT_HRBP;
        params.filterField = ReportChainTypeEnum.DEPARTMENT_LEVEL;
        params.filterValue = '0';
        break;
      case APPROVERTYPE.FORM_MEMBER:
        params.inputType = InputTypeEnum.DYNAMIC;
        params.inputKey = task.formKey;
        params.entityType = entityTypeAdaptor(task.formKey);

        if (task.formValue === APPROVEFORMROLE.ER) {
          params.groupType = GroupTypeEnum.ER;
        } else if (task.formValue === APPROVEFORMROLE.FAWU) {
          params.groupType = GroupTypeEnum.FAWU;
        } else if (task.formValue === APPROVEFORMROLE.LEADER) {
          params.groupType = GroupTypeEnum.REPORT_CHAIN;
          params.filterField = ReportChainTypeEnum.REPORT_CHAIN_LEVEL;
          params.filterValue = '1';
          params.choiceType = ChoiceTypeEnum.FIRST;
        } else if (task.formValue === APPROVEFORMROLE.HRBPHEAD) {
          params.groupType = GroupTypeEnum.DEPARTMENT_CHAIN;
          params.outputType = OutputTypeEnum.DEPARTMENT_HRBP;
          params.filterField = ReportChainTypeEnum.DEPARTMENT_GRADE;
          params.filterValue = 'X4';
        } else if (task.formValue === APPROVEFORMROLE.HRBP) {
          params.groupType = GroupTypeEnum.DEPARTMENT_CHAIN;
          params.outputType = OutputTypeEnum.DEPARTMENT_HRBP;
          params.filterField = ReportChainTypeEnum.DEPARTMENT_LEVEL;
          params.filterValue = '0';
        } else if (
          task.formValue === APPROVEFORMROLE.CEOMinusTwo ||
          task.formValue === APPROVEFORMROLE.CEOMinusOne
        ) {
          params.groupType = GroupTypeEnum.REPORT_CHAIN;
          params.filterField = ReportChainTypeEnum.OA_GRADE;
          params.filterValue = 'CEO';
          params.choiceType = ChoiceTypeEnum.FIRST;
          params.levelOffset =
            task.formValue === APPROVEFORMROLE.CEOMinusTwo ? '-2' : '-1';
        } else if (
          task.formValue === APPROVEFORMROLE.MeiTuanMinusOne ||
          task.formValue === APPROVEFORMROLE.MeiTuanMinusTwo
        ) {
          params.inputType = InputTypeEnum.DYNAMIC;
          params.inputKey = task.formKey;
          params.entityType = EntityTypeEnum.USER;
          params.filterField = ReportChainTypeEnum.DEPARTMENT_DEPTH;
          params.filterValue =
            task.formValue === APPROVEFORMROLE.MeiTuanMinusTwo ? '-2' : '-1';
          params.outputType = OutputTypeEnum.DEPARTMENT_OWNER;
          params.groupType = GroupTypeEnum.DEPARTMENT_CHAIN;
        } else if (task.formValue === APPROVEFORMROLE.RECRUITER_LEADER) {
          params.groupType = GroupTypeEnum.RECRUITER_LEADER;
        } else if (task.formValue === APPROVEFORMROLE.EMPLOYEE) {
          params.groupType = GroupTypeEnum.EMPLOYEE;
          params.inputType = InputTypeEnum.DYNAMIC;
          params.entityType = EntityTypeEnum.USER;
          params.inputKey = task.formKey;
        }
        break;
      // 接口指定审批人
      case APPROVERTYPE.DESIGNATE_BY_CUSTOMER:
        params.optionType = OptionTypeEnum.API_APPROVER;

        break;
      // 指定审批人为自己
      case APPROVERTYPE.DESIGNATE_BY_SELF:
        params.optionType = OptionTypeEnum.STARTER;

        break;

      default:
        break;
    }
  }

  return params;
};

/**
 * 将 process 转化成一个 canvasModel ，但 process 数据有冗余。
 * 遍历 nodes tree ，移除 option 即可
 */
export const simplifyCanvasModel = (process: Array<INodeBox>) => {
  const simplyfyModel = [...process];

  const helper = (nodes: Array<INodeBox> | undefined) => {
    if (!nodes || (nodes.length && nodes.length === 0)) {
      return;
    }

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      const overrideid = node?.option?.overrideid;

      node.option = {
        overrideid
      };
      if (Array.isArray(node.child) && node.child?.length > 0) {
        helper(node.child);
      }
    }
  };

  helper(process);
  return simplyfyModel;
};

/**
 * 获得浅拷贝的节点。
 */
export const findShallowNodesFromProcess = (
  process: INodeBox[]
): {
  tasks: INodeBox[];
  conditionNodes: INodeBox[];
} => {
  const tasks: INodeBox[] = [];
  const conditionNodes: INodeBox[] = [];

  if (!process || process.length === 0) {
    return {
      tasks,
      conditionNodes
    };
  }

  const helper = (nodes: INodeBox[]) => {
    if (nodes.length === 0) {
      return;
    }

    for (const node of nodes) {
      if (node.type === NODETYPE.Task) {
        tasks.push(node);
      } else if (node.type === NODETYPE.Condition) {
        conditionNodes.push(node);
      } else if (node.child && node.child.length > 0) {
        helper(node.child);
      }
    }
  };

  helper(process);

  return {
    tasks,
    conditionNodes
  };
};

export const getFormRoles = (formMember: IFormMember): string => {
  const { formKey = '', formValue = '' } = formMember || {};
  if (formKey.indexOf(dataType.People) > -1) {
    return FORM_PEOPLE_ROLES[formValue];
  }
  if (formKey.indexOf(dataType.Department) > -1) {
    return FORM_DEPARTMENT_ROLES[formValue];
  }
  return '';
};

export const validateBase = (approvalInfo, approvalInfoValidation) => {
  const result: IValidateMessage[] = [];

  if (
    approvalInfo.approvalName.length > 20 ||
    approvalInfo.approvalName.length < 4 ||
    !/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/gi.test(approvalInfo.approvalName)
  ) {
    result.push({
      validateMessage: '名称只能由 4-20 个汉字,英文字母,下划线,数字组成',
      type: 'base'
    });
    approvalInfoValidation.nameValid =
      '名称只能由 4-20 个汉字,英文字母,下划线,数字组成';
  } else {
    approvalInfoValidation.nameValid = '';
  }

  if (!approvalInfo?.category || approvalInfo?.category?.length === 0) {
    result.push({
      validateMessage: '请选择所属分类',
      type: 'base'
    });
    approvalInfoValidation.categoryValid = '请选择所属分类';
  } else {
    approvalInfoValidation.categoryValid = '';
  }

  if (
    !approvalInfo?.processStarters?.all &&
    approvalInfo?.processStarters?.userDeptForm?.length === 0
  ) {
    result.push({
      validateMessage: '请选择谁可以发起这个审批',
      type: 'base'
    });
    approvalInfoValidation.startersValid = '请选择谁可以发起这个审批';
  } else {
    approvalInfoValidation.startersValid = '';
  }

  if (approvalInfo?.processManagers?.length === 0) {
    result.push({
      validateMessage: '请选择谁可以管理这个审批',
      type: 'base'
    });
    approvalInfoValidation.managersValid = '请选择谁可以管理这个审批';
  } else {
    approvalInfoValidation.managersValid = '';
  }

  return result;
};

export const validateApproval = (deployInfo, deployInfoValidation) => {
  const result: IValidateMessage[] = [];
  if (!deployInfo?.authMatterName || deployInfo?.authMatterName?.length === 0) {
    result.push({
      validateMessage: '所属授权事项为必填项，请填写',
      type: 'publish'
    });
    deployInfoValidation.authMatterValid = '所属授权事项为必填项，请填写';
  } else {
    deployInfoValidation.authMatterValid = '';
  }
  if (
    !deployInfo?.responsePerson?.id ||
    deployInfo?.responsePerson?.id?.length === 0
  ) {
    result.push({
      validateMessage: '审批说明中流程负责人不能为空',
      type: 'publish'
    });
    deployInfoValidation.personValid = '审批说明中流程负责人不能为空';
  } else {
    deployInfoValidation.personValid = '';
  }
  return result;
};

export const validateProcess = (nodes: INodeBox[]): IValidateMessage[] => {
  const result: IValidateMessage[] = [];

  if (nodes.length === 0) {
    result.push({
      validateMessage: '请选择审批节点',
      type: 'process'
    });
  }
  const USER_TASK_LIMIT = 200;
  let userTaskCount = 0;

  const dfs = (nodes: INodeBox[]): void => {
    for (let index = 0; index < nodes.length; index++) {
      const node = nodes[index];

      /**
       * task 和 conditions 没有 child 节点，branch 有
       */
      if (!node.child || node.child.length === 0) {
        if (node.type !== NODETYPE.Task && node.type !== NODETYPE.Condition) {
          continue;
        }
        if (!node.option) {
          continue;
        }

        if (node.type === NODETYPE.Task) {
          userTaskCount++;
        }

        const validateMessage = validateNode(node.type, node.option);
        node.option.validateMessage = validateMessage;

        if (validateMessage.length > 0) {
          result.push({
            validateMessage,
            type: 'process'
          });
        }
      } else {
        dfs(node.child);
      }
    }
  };

  dfs(nodes);

  if (userTaskCount >= USER_TASK_LIMIT) {
    result.push({
      validateMessage: `当前审批节点数量限制，不能超过 ${USER_TASK_LIMIT} 个`,
      type: 'process'
    });
  }

  /**
   * 遍历 nodes
   */
  return result;
};

export const validateNode = (
  type: NODETYPE,
  option: INodeBoxOption | undefined
): string => {
  let message: string = '';

  if (type === NODETYPE.Task) {
    if (isEmpty(option?.approvalGroup)) {
      message = '请设置审批节点';
    }
    if (option?.approvalGroup?.optionType === OptionTypeEnum.STANDARD_ROLES) {
      const properties =
        option?.approvalGroup?.standardRoleConfig?.properties || [];
      properties.forEach((prop) => {
        if (!prop.code || !prop.inputKey) {
          message = '审批节点 - 标准角色属性未配置完整';
        }
      });
    }
  } else if (type === NODETYPE.Condition) {
    if (
      (!option?.conditions || option.conditions.length === 0) &&
      !option?.default
    ) {
      message = '请选择条件节点';
    } else if (validateHasErrorInCondition(option?.conditions)) {
      message = '条件节点未配置完成';
    }
  }
  return message;
};

/**
 * 递归 condition
 * data 的类型有 :
 * string: 字符串类型，NormalInput 组件
 * object: object 类型，Select 组件
 * array:  Select mutiple 组件
 */
export const buildConditionDescription = (
  item: INodeBoxOption,
  description = ''
) => {
  const { conditions, logical } = item;

  if (!conditions || conditions.length === 0) {
    return description;
  }

  for (let i = 0; i < conditions.length; i++) {
    const condition = conditions[i];
    const isLast = i === conditions.length - 1;
    let desc = '';

    if (typeof condition.data !== 'undefined') {
      if (Array.isArray(condition.data)) {
        desc = condition.data
          .map((childItem) => {
            return childItem.label;
          })
          .join(',');
      } else if (typeof condition.data === 'string') {
        desc = condition.data;
      } else if (isPlainObject(condition.data)) {
        desc = condition.data.label;
      }
    }

    if (condition.leaf) {
      // 包含与不包含兼容（v1.3需求ct；代表包含；nt：代表不包含）
      if (
        condition.operationCode === 'CT' &&
        condition.operationDisplay === '包含'
      ) {
        condition.operationDisplay = '包含任一';
      }
      if (
        condition.operationCode === 'NT' &&
        condition.operationDisplay === '不包含'
      ) {
        condition.operationDisplay = '不包含任一';
      }
      description += `${condition.propertyName}${condition.operationDisplay}${desc}`;
    } else {
      description += `${buildConditionDescription(condition, '')}`;
    }

    if (!isLast) {
      description += ` ${LogicalText[logical]} `;
    }
  }

  return description;
};

const getComponentName = (formKey: string, componentList: IComponent[]) => {
  const defaultComponentName = '表单内控件';

  if (!formKey || !componentList || componentList.length === 0) {
    return defaultComponentName;
  }

  return (
    componentList.find((component) => {
      return component.id === formKey;
    })?.label || defaultComponentName
  );
};

export const buildTaskDescription = (
  approvalGroup: IApprovalGroup,
  componentList?: IComponent[]
) => {
  const {
    approverType,
    seriesType,
    seriesValue,
    formKey,
    inputKey,
    inputType,
    optionType,
    standardRoleConfig
  } = approvalGroup;

  switch (optionType) {
    case OptionTypeEnum.COST_CENTER_OWNER:
      return '成本中心负责人';
    case OptionTypeEnum.STANDARD_ROLES: {
      const tempApproveType = standardRoleConfig?.roleType;
      if (tempApproveType) {
        return `${
          STANDARD_APPROVERTYPE_TITLE[
            APPROVERTYPE[standardRoleConfig?.roleType]
          ]
        } - ${standardRoleConfig?.roleName}`;
      }
      break;
    }
    default:
      break;
  }

  switch (approverType) {
    case APPROVERTYPE.LEADER:
      if (seriesType === APPROVERTYPE.LOWER_THAN_CEO) {
        return `发起人的第 CEO${seriesValue}`;
      }
      if (seriesType === APPROVERTYPE.LEADER) {
        return `发起人的第 ${seriesValue} 级主管`;
      }
      break;
    case APPROVERTYPE.DEPTOWNER:
      if (
        isDeprecatedDepartment(approvalGroup.seriesValue) ||
        approvalGroup.seriesType === ReportChainTypeEnum.DEPARTMENT_LEVEL
      ) {
        return `发起人所在的 ${seriesValue} 级部门负责人`;
      }
      return `发起人所在的 美团${seriesValue}级部门负责人`;
    case APPROVERTYPE.SPECIFY:
      return `指定成员`;
    case APPROVERTYPE.STEPBYSTEP:
      // eslint-disable-next-line no-case-declarations
      const inputTypeInfo =
        inputType === InputTypeEnum.DYNAMIC
          ? getComponentName(inputKey || '', componentList || [])
          : '发起人';

      if (seriesType === APPROVERTYPE.LEADER) {
        return `逐级审批到${inputTypeInfo}的第 ${seriesValue} 级主管`;
      }

      if (isDeprecatedDepartment(approvalGroup.seriesValue)) {
        return `逐级审批到${inputTypeInfo}所在的 ${seriesValue} 级部门负责人`;
      }
      return `逐级审批到${inputTypeInfo}所在的美团${seriesValue}级部门负责人`;

    case APPROVERTYPE.DESIGNATE_BY_CUSTOMER:
      return `接口指定审批人`;
    case APPROVERTYPE.DESIGNATE_BY_SELF:
      return `申请人本人`;

    case APPROVERTYPE.HRBP:
      return `发起人的 HRBP`;
    case APPROVERTYPE.FORM_MEMBER:
      return `${getComponentName(
        formKey || '',
        componentList || []
      )} 对应的 ${getFormRoles(approvalGroup)}`;
    // eslint-disable-next-line no-fallthrough
    default:
      return `请选择审批人`;
  }
  return '';
};

export const isRemoteBusinessType = (businessType: number) => {
  return [1, 2].indexOf(businessType) > -1;
};

const isBelongDepartMent = (operationCode: string) => {
  return ['bd', 'nbd'].indexOf(operationCode) > -1;
};

const isMultiple = (operationCode: string) => {
  return ['in', 'ni', 'CT', 'NT'].indexOf(operationCode) > -1;
};

export const convertConditionToForm = (
  conditions: ICondition[] | undefined
) => {
  if (!conditions || conditions.length === 0) {
    return;
  }

  for (const condition of conditions) {
    if (!condition.leaf && condition.conditions) {
      convertConditionToForm(condition.conditions);
    }

    /**
     * 非叶子结点，无需具体赋值.
     */
    if (!condition.leaf) {
      continue;
    }

    /**
     * 针对1 和 2 的类型，处理下data
     */
    if (isRemoteBusinessType(condition.businessType)) {
      condition.data =
        (condition.data as IConditionValueOptionData[]).map((item) => {
          if (condition.businessType === 1) {
            /**
             * UI 上是 发起人和发起人部门，但后端保存库里之后变成了 制单人和制单人部门。
             * 前端暂时统一处理
             */
            condition.propertyName =
              condition.propertyCode === 'SYS_CRT_USERID'
                ? '发起人'
                : condition.propertyName;

            if (isBelongDepartMent(condition.operationCode)) {
              return {
                id: item.dataId,
                value: item.dataId,
                label: item.seriesName
              } as any;
            }
            return {
              id: item.dataId,
              value: item.code,
              label: item.name
            } as any;
          }
          if (condition.businessType === 2) {
            condition.propertyName =
              condition.propertyCode === 'SYS_CRT_DEPTID'
                ? '发起人部门'
                : condition.propertyName;
            return {
              id: item.dataId,
              value: item.dataId,
              label: item.seriesName
            } as any;
          }
          return item;
        }) || [];
    } else if (shouldRenderSelect(condition.propertyCode)) {
      // console.log('------shouldRenderSelect', condition);
      /**
       * 处理选项数据源
       */
      if (
        condition.subPropertyCode === 'value' &&
        Array.isArray(condition.data)
      ) {
        if (isMultiple(condition.operationCode)) {
          condition.data = condition.data.map((item) => {
            return {
              label: item.name,
              value: item.dataId
            };
          });
        } else {
          condition.data = {
            label: condition.data[0].name,
            value: condition.data[0].dataId
          };
        }
      } else {
        /**
         * 处理表单组件
         */
        condition.data = condition.value.split(',').map((item) => {
          return {
            label: item,
            value: item,
            id: item
          };
        });
      }
    } else {
      condition.data = condition.value;
    }

    if (!isArrayConditionValue(condition) && Array.isArray(condition.data)) {
      condition.data = condition.data[0] as any;
    }
  }
};

const convertSelectToData = (condition, componentList) => {
  // console.log('------convertSelectToData', {
  //   condition: JSON.stringify(condition),
  //   componentList
  // });
  if (condition.propertyCode.includes('select')) {
    const component = componentList.find(
      (item) => item.id === condition.propertyCode
    );
    // 判断是不是自定义选项
    const isCustomOption = component.options.length !== 0;

    if (Array.isArray(condition.data)) {
      condition.data = condition.data.map((item) => {
        if (isCustomOption) {
          const option = component.options.find(
            (option) => option.value === item.value
          );
          if (option) {
            return {
              dataId: option?.value,
              name: option?.label
            };
          }
        }
        return {
          dataId: item?.value,
          name: item?.label
        };
      });
    } else {
      // eslint-disable-next-line no-lonely-if
      if (isCustomOption) {
        const option = component.options.find(
          (option) => option.value === condition.data.value
        );
        if (option) {
          condition.data = [
            {
              dataId: option?.value,
              name: option?.label
            }
          ];
        } else {
          // 兼容option没找到的情况
          condition.data = [
            {
              dataId: condition.data?.value,
              name: condition.data?.label
            }
          ];
        }
      } else {
        condition.data = [
          {
            dataId: condition.data?.value,
            name: condition.data?.label
          }
        ];
      }
    }
    condition.subPropertyCode = 'value';
  }
};

export const convertConditionToData = (
  conditions: ICondition[] | undefined,
  componentList
) => {
  if (!conditions || conditions.length === 0) {
    return;
  }

  for (const condition of conditions) {
    /**
     * 针对1 和 2 的类型，处理下data
     */
    if (isRemoteBusinessType(condition.businessType)) {
      if (
        !Array.isArray(condition.data) &&
        typeof condition.data !== 'string'
      ) {
        condition.data = [condition.data];
      }

      condition.data =
        (condition.data as IConditionValueOption[]).map((item) => {
          if (condition.businessType === 1) {
            return {
              dataId: item.id,
              code: item.value,
              name: item.label,
              seriesName: item.label
            } as any;
          }
          if (condition.businessType === 2) {
            return {
              dataId: item.id,
              code: item.value,
              seriesName: item.label,
              name: item.label
            } as any;
          }
          return item;
        }) || [];
    } else {
      // eslint-disable-next-line no-lonely-if
      if (condition.leaf && condition.propertyCode.includes('select')) {
        convertSelectToData(condition, componentList);
      } else {
        // 组件属性类型返回空数组
        condition.data = [];
      }
    }
    if (!condition.leaf && condition.conditions) {
      convertConditionToData(condition.conditions, componentList);
    }
  }
};

/**
 * 获取在流程里使用的属性
 */
export const getUsedPropertyCodes = (
  conditionComponentList: IComponent[],
  process: INodeBox[]
): IComponent[] => {
  const result = [] as IComponent[];

  conditionComponentList.forEach((item) => {
    if (item.id) {
      const usedNodes = findNodesByPropertyCodes([item.id], process);
      if (usedNodes.length > 0) {
        result.push(item);
      }
    }
  });

  return result;
};

const removeOptionFromCondition = (
  optionKey: string,
  conditionNode: INodeBox
) => {
  if (
    !conditionNode ||
    !conditionNode.option ||
    !conditionNode.option.conditions
  ) {
    return;
  }

  const helper = (conditions: ICondition[]) => {
    if (!conditions || !conditions.length || conditions.length === 0) {
      return;
    }
    for (const condition of conditions) {
      if (condition.leaf) {
        // 处理 condition.data
        if (shouldRenderSelect(condition.propertyCode)) {
          if (Array.isArray(condition.data)) {
            condition.data = (condition.data as IConditionValueOption[]).filter?.(
              (item) => {
                return item.value !== optionKey;
              }
            );
          } else {
            condition.data = {
              id: '',
              label: '',
              value: ''
            };
          }
        }
      } else {
        helper(condition.conditions || []);
      }
    }
  };

  helper(conditionNode.option?.conditions || []);

  // 删除了 data，需要 rebuild 下 conditionValue
  buildConditionValue(conditionNode.option.conditions);
};

/**
 * 从 condfition 节点里移除 option
 */
export const removeOptionFromConditionNodes = (
  optionKey: string,
  nodes: INodeBox[]
) => {
  if (!nodes || nodes.length === 0) {
    return;
  }

  nodes.forEach((node) => {
    removeOptionFromCondition(optionKey, node);
  });
};

/**
 * condition 里任何一个节点，找到就返回 true
 */
const isUsedByCondition = (
  propertyCodes: string[],
  conditions: ICondition[],
  type: 'propery' | 'option',
  optionKey: string
): Boolean => {
  let result = false;

  const isUsed = (condition: ICondition) => {
    if (type === 'propery') {
      return propertyCodes.indexOf(condition.propertyCode) > -1;
    }

    if (type === 'option') {
      return condition.value && condition.value.indexOf(optionKey) > -1;
    }

    return false;
  };

  const helper = (conditions: ICondition[]) => {
    if (!conditions || !conditions.length || conditions.length === 0) {
      return;
    }

    for (const condition of conditions) {
      /**
       * 如果叶子节点
       */
      if (condition.leaf && isUsed(condition)) {
        result = true;
        return;
      }
      helper(condition.conditions || []);
    }
  };

  helper(conditions);

  return result;
};

export const isOptionUsedInNodes = (optionKey: string, nodes: INodeBox[]) => {
  if (!nodes || nodes.length === 0) {
    return false;
  }

  return nodes.some((item: INodeBox) => {
    const { conditions = [] } = item.option || {};
    return isUsedByCondition([''], conditions, 'option', optionKey);
  });
};

/**
 * 判断 currentIndex 是否在 compareIndex 之后的路径上
 */
export const isReachableNode = (
  currentIndex: number[],
  compareIndex: number[]
) => {
  if (!compareIndex || compareIndex.length === 0) {
    return false;
  }

  /**
   * 第一层的结构直接可以判断 index
   */
  if (currentIndex[0] !== compareIndex[0]) {
    return currentIndex[0] > compareIndex[0];
  }

  /**
   * 第二层开始逐一对比
   */
  let start = 1;

  while (start < currentIndex.length - 1 && start < compareIndex.length - 1) {
    if (currentIndex[start] === compareIndex[start]) {
      start++;
      continue;
    }
    return false;
  }
  return currentIndex[start] > compareIndex[start];
};

interface IMappingComponentDisabled {
  [key: string]: boolean;
}

/**
 * 在当前节点之前被conditionNode 使用过的话，标记出来；
 */
export const getPropertyConditionMapping = (
  propertyCodes: string[],
  process: INodeBox[],
  curNodeIndex: number[]
): IMappingComponentDisabled => {
  const mappingConditions = {};
  const { conditionNodes } = findShallowNodesFromProcess(process);

  conditionNodes.forEach((item) => {
    const { conditions } = item.option as INodeBoxOption;

    propertyCodes.forEach((properyCode) => {
      const isUsed = isUsedByCondition(
        [properyCode],
        conditions || [],
        'propery',
        ''
      );
      if (isUsed) {
        if (typeof mappingConditions[properyCode] === 'undefined') {
          mappingConditions[properyCode] = false;
        }
        mappingConditions[properyCode] = isReachableNode(
          curNodeIndex,
          item.option?.curNodeIndex as number[]
        );
      }
    });
  });

  return mappingConditions;
};

const isNotWritableComponent = (componentName: string) => {
  if (!componentName) {
    return false;
  }

  const NOT_WRITABLE_COMPONENT = ['Captions'];

  return NOT_WRITABLE_COMPONENT.indexOf(componentName) > -1;
};

// 审批节点的表单权限默认是 01(即可读不可编辑)
export const DEFAULT_FORM_ROLE_VALUE = 1;
// 发起节点的表单权限默认是 11(即可读可编辑)
export const DEFAULT_FORM_ROLE_START_VALUE = 3;

const binaryIdentifyKey = ['writable', 'readable'];

export const mappingFormRoleToFormFileds = (
  formRoles: IFormRole[]
): IFormField[] => {
  const privilegeList = formRoles.map((item) => {
    const binaryString = binaryIdentifyKey
      .map((key) => {
        return item[key] ? '1' : '0';
      })
      .join('');

    const privilege = parseInt(binaryString, 2);

    return {
      fieldId: item.id,
      privilege:
        typeof privilege !== 'undefined' ? privilege : DEFAULT_FORM_ROLE_VALUE,
      ...(item.parentId ? { parentFieldId: item.parentId } : {})
    };
  });

  return privilegeList;
};

/**
 * 将二进制的表达转化成 true, false
 */
export const mappingFormFiledsToFormRole = (
  formFields: IFormField[]
): IFormRole[] => {
  if (!formFields || formFields.length === 0) {
    return [];
  }

  const formRoles = formFields.map((item) => {
    const binaryArray = item.privilege
      .toString(2)
      .padStart(binaryIdentifyKey.length, '0')
      .split('');

    const formRole = {
      id: item.fieldId
    } as IFormRole;

    binaryIdentifyKey.forEach((key, index) => {
      formRole[key] = binaryArray[index] === '1';
    });
    return formRole;
  });

  return formRoles;
};

/**
 * 默认的权限节点
 */
export const getDefaultNodeFormRole = (
  componentList: IComponent[],
  mappingComponentDisabled: IMappingComponentDisabled,
  nodeType: NODETYPE
) => {
  if (!componentList || componentList.length === 0) {
    return [];
  }

  return componentList.map((component: IComponent) => {
    const writable =
      nodeType === NODETYPE.Start &&
      !isNotWritableComponent(component.componentName);

    const disabled =
      mappingComponentDisabled?.[component.id as string] ||
      isNotWritableComponent(component.componentName);

    return {
      id: component.id,
      label: component.label,
      parentId: component.parentId || '',
      parentLabel: component.parentLabel || '',
      readable: true,
      writable,
      disabled
    } as IFormRole;
  });
};

/**
 * 处理表单组件更新之后，直接发布的数据变化
 */
export const getDiffedFields = (
  formFields: IFormField[],
  componentList: IComponent[],
  nodeType: NODETYPE
): IFormField[] => {
  if (!componentList || componentList.length === 0) {
    return [];
  }

  const defaultPrivilege =
    nodeType === NODETYPE.Start
      ? DEFAULT_FORM_ROLE_START_VALUE
      : DEFAULT_FORM_ROLE_VALUE;

  /**
   * 在 componentList 里但不在formFields 里的，需要新增
   */
  const needAddFields = differenceWith(
    componentList,
    formFields,
    (component, field) => {
      return field.fieldId === component.id;
    }
  ).map((component: IComponent) => {
    return {
      fieldId: component.id,
      privilege: defaultPrivilege
    } as IFormField;
  });

  const result = formFields.concat(needAddFields);

  return remove(result, function(item) {
    return componentList.some((component) => {
      return item.fieldId === component.id;
    });
  });
};

/**
 * 方法调用者：展开节点之，以及转化数据时
 * 1. 判断是否有前置使用
 * 2. 判断数据是否需要补充
 *
 * formRole: 保存到后端的数据状态
 * componentList: 一份表单组件列表
 * mappingComponentDisabled: 哪些组件当前节点可用记录
 */
export const convertFormRoleToForm = (
  formRoles: IFormRole[],
  componentList: IComponent[],
  mappingComponentDisabled: IMappingComponentDisabled,
  nodeType: NODETYPE
): IFormRole[] => {
  if (!componentList || componentList.length === 0) {
    return [];
  }

  const getWritable = (
    currentFormRoleValue: IFormRole,
    componentInfo: IComponent
  ) => {
    // 组件不可编辑
    if (isNotWritableComponent(componentInfo.componentName)) {
      return false;
    }

    const id = componentInfo.id as string;

    // 前置节点已用到，不可编辑
    if (mappingComponentDisabled?.[id]) {
      return false;
    }

    // 有当前值
    if (typeof currentFormRoleValue?.writable !== 'undefined') {
      return currentFormRoleValue.writable;
    }

    // 当是发起节点且不满足以上前置条件，证明是一个新加入的组件，展示 true
    if (nodeType === NODETYPE.Start) {
      return true;
    }

    return false;
  };

  // 没有 formRole 就是 default 逻辑
  if (!formRoles || formRoles.length === 0) {
    return getDefaultNodeFormRole(
      componentList,
      mappingComponentDisabled,
      nodeType
    );
  }

  // 设置了的审批节点表单权限，在之前的 condition 节点修改之后需要变化
  return componentList.map((component: IComponent) => {
    const currentFormRoleValue = formRoles.find((item: IFormRole) => {
      return item.id === component.id;
    });

    const readable =
      typeof currentFormRoleValue?.readable !== 'undefined'
        ? currentFormRoleValue?.readable
        : true;

    // 不可编辑的组件有 Captions 以及发起节点
    const writable = getWritable(currentFormRoleValue as IFormRole, component);

    const disabled =
      mappingComponentDisabled?.[component.id as string] ||
      isNotWritableComponent(component.componentName);

    return {
      id: component.id,
      label: component.label,
      parentId: component.parentId || '',
      parentLabel: component.parentLabel || '',
      readable,
      writable,
      disabled
    } as IFormRole;
  });
};

/**
 * 判断一个审批组是否用到了表单的组件
 */
export const hasFormComponent = (approvalGroup, propertyCodes) => {
  if (
    approvalGroup &&
    approvalGroup.formKey &&
    propertyCodes.indexOf(approvalGroup.formKey) > -1
  ) {
    return true;
  }

  if (
    approvalGroup &&
    approvalGroup.inputType &&
    propertyCodes.indexOf(approvalGroup.inputKey) > -1
  ) {
    return true;
  }

  if (
    approvalGroup &&
    approvalGroup.optionType === OptionTypeEnum.STANDARD_ROLES
  ) {
    let res = false;
    (approvalGroup?.standardRoleConfig?.properties || []).forEach((item) => {
      if (propertyCodes.includes(item.inputKey)) {
        res = true;
      }
    });
    if (res) {
      return res;
    }
  }

  return false;
};
/**
 * 通过 properyCode 在画布里查找使用到的节点
 */
export const findNodesByPropertyCodes = (
  propertyCodes: string[],
  process: INodeBox[]
): INodeBox[] => {
  const { tasks, conditionNodes } = findShallowNodesFromProcess(process);

  const result: INodeBox[] =
    conditionNodes?.filter((item) => {
      const { conditions } = item.option as INodeBoxOption;

      // 判断在条件里是否用到
      const isUsed = isUsedByCondition(
        propertyCodes,
        conditions || [],
        'propery',
        ''
      );

      return isUsed;
    }) || [];

  tasks &&
    tasks.forEach((item) => {
      const { approvalGroup, ccGroups = [] } = item.option as INodeBoxOption;

      /**
       * task 节点里只有 审批组 和抄送组 formKey 有值时才判断
       */
      if (hasFormComponent(approvalGroup, propertyCodes)) {
        result.push(item);
      } else if (ccGroups.length > 0) {
        if (
          ccGroups.some((approvalGroup) => {
            return hasFormComponent(approvalGroup, propertyCodes);
          })
        ) {
          result.push(item);
        }
      }
    });

  return result;
};

export const findConditonsByPropertyCodes = (
  propertyCode,
  formControlledFields
) => {
  // console.log('------findConditonsByPropertyCodes', {
  //   propertyCode,
  //   formControlledFields
  // });
  if (!propertyCode) return [];

  const usedConditions = [];
  formControlledFields.forEach((controlledField) => {
    const { conditions = [] } = controlledField.conditionSetModel;
    conditions.forEach((item) => {
      if (item.conditions && Array.isArray(item.conditions)) {
        item.conditions.forEach((condition) => {
          if (condition.propertyCode === propertyCode) {
            usedConditions.push(condition);
          }
        });
      } else if (item.propertyCode === propertyCode) {
        usedConditions.push(item);
      }
      // if (item.propertyCode === propertyCode) {
      //   usedConditions.push(item);
      // }
    });
  });
  return usedConditions;
};
/**
 * 删除一个表单属性，对应流程画布里的 task 和 condition 对应的内容删掉
 */
export const removeProperties = (
  propertyCodes: string[],
  process: INodeBox[]
): void => {
  const dfs = (conditions: ICondition[]) => {
    if (!conditions || conditions.length === 0) {
      return;
    }

    for (let last = conditions.length - 1; last >= 0; last--) {
      const condition = conditions[last];

      if (propertyCodes.indexOf(condition.propertyCode) > -1) {
        conditions.splice(last, 1);
      }

      if (Array.isArray(condition.conditions)) {
        dfs(condition.conditions);
        if (condition.conditions.length === 1) {
          conditions[last] = condition.conditions[0];
        }
      }
    }
  };

  const nodes = findNodesByPropertyCodes(propertyCodes, process);

  for (const curNode of nodes) {
    if (!curNode) {
      return;
    }
    const { option } = curNode;

    if (curNode.type === NODETYPE.Condition) {
      if (!option || !option.conditions || option.conditions.length === 0) {
        return;
      }

      dfs(option.conditions);
    } else if (curNode.type === NODETYPE.Task) {
      if (!option || !option.approvalGroup) {
        return;
      }

      // 如果是标准审批组，则只删除用到的属性，置为空，其它审批组，设置为空
      if (hasFormComponent(option.approvalGroup, propertyCodes)) {
        if (
          option.approvalGroup?.optionType === OptionTypeEnum.STANDARD_ROLES
        ) {
          (option.approvalGroup?.standardRoleConfig?.properties || []).forEach(
            (property) => {
              if (propertyCodes.includes(property.inputKey)) {
                delete property.inputType;
                delete property.inputKey;
                delete property.dataPath;
                option.validateMessage = '审批节点 - 标准角色属性未配置完整';
              }
            }
          );
        } else {
          option.approvalGroup = {} as IApprovalGroup;
          option.validateMessage = '请选择审批人';
        }
      }

      // 判断抄送组, 如果选择了表单组件，删除该组
      if (option.ccGroups?.length) {
        for (let last = option.ccGroups.length - 1; last >= 0; last--) {
          const ccGroup = option.ccGroups[last];
          if (hasFormComponent(ccGroup, propertyCodes)) {
            option.validateMessage = '请选择抄送人';
            option.ccGroups.splice(last, 1);
          }
        }
      }
    }
  }
};

/**
 * 将 canvasModel 还原成流程画布的 schema
 * startNode 对于后端来说是个特殊的节点，无resourceid
 */
export const restoreCanvasModel = (
  canvasModel: any,
  nodeDetails: INodeBox[],
  startNode: INodeBox
) => {
  const result = cloneDeep(canvasModel);
  const helper = (nodes: INodeBox[]) => {
    if (!nodes || (nodes.length && nodes.length === 0)) {
      return nodes;
    }
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      if (node.type === NODETYPE.Condition || node.type === NODETYPE.Task) {
        const detail = nodeDetails.find((item: INodeBox) => {
          return item.resourceId === node.resourceId;
        });

        // task 和 condition 节点一定会有，如果没有肯定是 一个 default 的 condition 节点
        if (detail && detail.option) {
          /**
           * 这个 id和 code 是编辑时回传用的
           */
          node.id = detail.id;
          node.option = {
            ...node.option,
            ...detail.option
          };
        } else {
          node.option = {
            default: true
          };
        }
      } else if (node.type === NODETYPE.Start) {
        if (startNode && startNode.option) {
          node.option = {
            ...node.option,
            ...startNode.option
          };
        }
      } else {
        node.option = {};
      }

      if (Array.isArray(node.child) && node.child?.length > 0) {
        helper(node.child);
      }
    }
    return nodes;
  };

  return helper(result);
};

/**
 * 适配 entityType
 */
const entityTypeAdaptor = (formKey?: string): EntityTypeEnum => {
  if (!formKey) {
    return EntityTypeEnum.UNKNOW;
  }

  if (formKey.indexOf(dataType.People) > -1) {
    return EntityTypeEnum.USER;
  }
  if (formKey.indexOf(dataType.Department) > -1) {
    return EntityTypeEnum.DEPARTMENT;
  }
  return EntityTypeEnum.UNKNOW;
};

const mappingOptionToApprover = (optionType?: OptionTypeEnum): APPROVERTYPE => {
  if (!optionType) {
    return APPROVERTYPE.UNKNOW;
  }

  if (optionType === OptionTypeEnum.COST_CENTER_OWNER) {
    return APPROVERTYPE.COST_CENTER_OWNEER;
  }

  if (optionType === OptionTypeEnum.STARTER) {
    return APPROVERTYPE.DESIGNATE_BY_SELF;
  }

  if (optionType === OptionTypeEnum.API_APPROVER) {
    return APPROVERTYPE.DESIGNATE_BY_CUSTOMER;
  }

  return APPROVERTYPE.UNKNOW;
};

export const convertApprovalToForm = (
  approveGroup: IApprovalGroupForm
): IApprovalGroup => {
  const result: IApprovalGroup = {};
  if (!approveGroup) {
    return result;
  }
  // console.log(APPROVERTYPE['STANDARD_ROLE_FINANCIAL'], 'asdf33333');
  if (
    approveGroup.optionType &&
    Object.values(STANDARD_ROLES_KEY).includes(approveGroup.optionType)
  ) {
    result.approverType = APPROVERTYPE[approveGroup.optionType];
    result.optionType = OptionTypeEnum.STANDARD_ROLES;
    result.standardRoleConfig = approveGroup.standardRoleConfig;
    return result;
  }
  if (isNewApprovalGroup(approveGroup.optionType, 'option')) {
    // approveGroup上有optionType字段 则视为新的DSL
    result.inputKey = approveGroup.inputKey;
    result.inputType = approveGroup.inputType;
    result.groupType = approveGroup.groupType;
    result.optionType = approveGroup.optionType;
    result.outputType = approveGroup.outputType;
    // result.approverType = result.optionType;
    result.approverType = mappingOptionToApprover(approveGroup.optionType);
    return result;
  }

  // 逐级审批
  if (approveGroup.choiceType === ChoiceTypeEnum.SERIES) {
    // 逐级审批
    result.approverType = APPROVERTYPE.STEPBYSTEP;
    result.inputType = approveGroup.inputType;
    result.inputKey = approveGroup.inputKey;

    if (approveGroup.filterField === ReportChainTypeEnum.REPORT_CHAIN_LEVEL) {
      // 按上级
      result.seriesType = APPROVERTYPE.LEADER;
    } else if (
      approveGroup.filterField === ReportChainTypeEnum.DEPARTMENT_GRADE ||
      approveGroup.filterField === ReportChainTypeEnum.DEPARTMENT_DEPTH
    ) {
      // 按部门
      result.seriesType = APPROVERTYPE.DEPTOWNER;
    }
    result.seriesValue = approveGroup.filterValue;

    /**
     * 封顶
     */
    if (
      typeof approveGroup.filterCeilings !== 'undefined' &&
      approveGroup.filterCeilings?.length > 0
    ) {
      result.filterCeiling = (approveGroup.filterCeilings as FilterCeilingOrFloorType[])[0].value;
    }

    /**
     * 保底
     */
    if (
      typeof approveGroup.filterFloors !== 'undefined' &&
      approveGroup.filterFloors?.length > 0
    ) {
      result.filterFloor = (approveGroup.filterFloors as FilterCeilingOrFloorType[])[0].value;
    }
  } else if (
    approveGroup.inputType === InputTypeEnum.STARTER &&
    approveGroup.groupType === GroupTypeEnum.REPORT_CHAIN
  ) {
    // 上级主管(含自下而上和自上而下)
    if (approveGroup.choiceType === ChoiceTypeEnum.FIRST) {
      result.approverType = APPROVERTYPE.LEADER;

      if (approveGroup.filterValue === 'CEO') {
        result.seriesType = APPROVERTYPE.LOWER_THAN_CEO;
        result.seriesValue = approveGroup.levelOffset;
      } else {
        result.seriesType = APPROVERTYPE.LEADER;
        result.seriesValue = approveGroup.filterValue;
      }
    }
  }
  // 发起人部门负责人
  else if (
    approveGroup.inputType === InputTypeEnum.STARTER &&
    approveGroup.groupType === GroupTypeEnum.DEPARTMENT_CHAIN &&
    approveGroup.outputType === OutputTypeEnum.DEPARTMENT_OWNER
  ) {
    // 部门层级
    if (approveGroup.filterField === ReportChainTypeEnum.DEPARTMENT_LEVEL) {
      result.seriesType = ReportChainTypeEnum.DEPARTMENT_LEVEL;
    } else if (
      approveGroup.filterField === ReportChainTypeEnum.DEPARTMENT_GRADE ||
      approveGroup.filterField === ReportChainTypeEnum.DEPARTMENT_DEPTH
    ) {
      // 部门属性
      result.seriesType = ReportChainTypeEnum.DEPARTMENT_DEPTH;
    }
    result.approverType = APPROVERTYPE.DEPTOWNER;
    result.seriesValue = approveGroup.filterValue;
  }
  // 指定审批人
  else if (
    approveGroup.inputType === InputTypeEnum.STATIC &&
    approveGroup.groupType === GroupTypeEnum.EMPLOYEE
  ) {
    result.approverType = APPROVERTYPE.SPECIFY;
    result.selectedUsers = approveGroup.users?.map(
      (item: IUsers): ISelectedItem => {
        return {
          id: item?.uid?.toString(),
          label: item.name,
          value: item.misId
        };
      }
    );
  } else if (
    approveGroup.inputType === InputTypeEnum.STARTER &&
    approveGroup.groupType === GroupTypeEnum.DEPARTMENT_CHAIN &&
    approveGroup.outputType === OutputTypeEnum.DEPARTMENT_HRBP
  ) {
    result.approverType = APPROVERTYPE.HRBP;
  } else if (approveGroup.inputType === InputTypeEnum.DYNAMIC) {
    result.approverType = APPROVERTYPE.FORM_MEMBER;
    result.formKey = approveGroup.inputKey;
    result.entityType = entityTypeAdaptor(approveGroup.inputKey);

    if (
      approveGroup.groupType === GroupTypeEnum.DEPARTMENT_CHAIN &&
      approveGroup.outputType === OutputTypeEnum.DEPARTMENT_HRBP &&
      approveGroup.filterField === ReportChainTypeEnum.DEPARTMENT_LEVEL &&
      approveGroup.filterValue === '0'
    ) {
      result.formValue = APPROVEFORMROLE.HRBP;
    } else if (
      approveGroup.groupType === GroupTypeEnum.DEPARTMENT_CHAIN &&
      approveGroup.outputType === OutputTypeEnum.DEPARTMENT_HRBP &&
      approveGroup.filterField === ReportChainTypeEnum.DEPARTMENT_GRADE &&
      approveGroup.filterValue === 'X4'
    ) {
      result.formValue = APPROVEFORMROLE.HRBPHEAD;
    } else if (
      approveGroup.groupType === GroupTypeEnum.REPORT_CHAIN &&
      approveGroup.filterField === ReportChainTypeEnum.REPORT_CHAIN_LEVEL &&
      approveGroup.filterValue === '1' &&
      approveGroup.choiceType === ChoiceTypeEnum.FIRST
    ) {
      result.formValue = APPROVEFORMROLE.LEADER;
    } else if (approveGroup.groupType === GroupTypeEnum.FAWU) {
      result.formValue = APPROVEFORMROLE.FAWU;
    } else if (approveGroup.groupType === GroupTypeEnum.ER) {
      result.formValue = APPROVEFORMROLE.ER;
    } else if (
      approveGroup.groupType === GroupTypeEnum.REPORT_CHAIN &&
      approveGroup.filterField === ReportChainTypeEnum.OA_GRADE &&
      approveGroup.filterValue === 'CEO' &&
      approveGroup.choiceType === ChoiceTypeEnum.FIRST
    ) {
      result.formValue =
        approveGroup.levelOffset === '-2'
          ? APPROVEFORMROLE.CEOMinusTwo
          : APPROVEFORMROLE.CEOMinusOne;
    } else if (approveGroup.groupType === GroupTypeEnum.RECRUITER_LEADER) {
      result.formValue = APPROVEFORMROLE.RECRUITER_LEADER;
    } else if (approveGroup.groupType === GroupTypeEnum.EMPLOYEE) {
      result.formValue = APPROVEFORMROLE.EMPLOYEE;
    } else if (
      approveGroup.groupType === GroupTypeEnum.DEPARTMENT_CHAIN &&
      approveGroup.outputType === OutputTypeEnum.DEPARTMENT_OWNER &&
      approveGroup.filterField === ReportChainTypeEnum.DEPARTMENT_DEPTH
    ) {
      result.formValue =
        approveGroup.filterValue === '-2'
          ? APPROVEFORMROLE.MeiTuanMinusTwo
          : APPROVEFORMROLE.MeiTuanMinusOne;
    }
  }
  return result;
};
