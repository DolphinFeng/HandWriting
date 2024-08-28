import { ICCGroupState } from './AddCC';
import {
  APPROVERTYPE,
  IApprovalGroupState,
  OptionTypeEnum,
  IOptions,
  Env,
  AdvancedType
} from './task.type';
import { FORM_PEOPLE_ROLES, FORM_DEPARTMENT_ROLES } from './const';
import { dataType } from '@/utils/form';
import { InputTypeEnum } from '@/utils/form.type';

/**
 * 审批组设计了一套新的 DSL 从成本中心负责人开始，后续使用新的审批组 DSL
 * 目前成本中心、接口指定审批人、审批人自己 等三个 是新的DSL
 * @param val
 * @returns
 */
export const isNewApprovalGroup = (
  optionType?: OptionTypeEnum | APPROVERTYPE,
  type: 'approvertype' | 'option' = 'option'
) => {
  if (!optionType) {
    return false;
  }

  // 接口过来的数据
  if (type === 'option') {
    return (
      optionType === OptionTypeEnum.COST_CENTER_OWNER ||
      optionType === OptionTypeEnum.STARTER ||
      optionType === OptionTypeEnum.API_APPROVER
    );
  }

  // UI上的数据
  if (type === 'approvertype') {
    return (
      optionType === APPROVERTYPE.COST_CENTER_OWNEER ||
      optionType === APPROVERTYPE.DESIGNATE_BY_CUSTOMER ||
      optionType === APPROVERTYPE.DESIGNATE_BY_SELF
    );
  }

  return false;
};

export const handleCCGroupsValidate = (ccGroups = [] as ICCGroupState[]) => {
  let hasCCError = false;

  for (const ccGroup of ccGroups) {
    if (
      ccGroup.approverType === APPROVERTYPE.FORM_MEMBER &&
      (!ccGroup.formKey || !ccGroup.formValue)
    ) {
      ccGroup.hasError = true;
      hasCCError = true;
    } else if (
      ccGroup.approverType === APPROVERTYPE.SPECIFY &&
      ccGroup.selectedUsers?.length === 0
    ) {
      ccGroup.hasError = true;
      hasCCError = true;
    }
  }

  return hasCCError;
};

export const handleApprovalValidate = (approvalGroup: IApprovalGroupState) => {
  if (!approvalGroup) {
    return false;
  }

  const {
    approverType,
    selectedUsers,
    formKey,
    formValue,
    optionType,
    inputType,
    inputKey,
    standardRoleConfig
  } = approvalGroup;

  let hasError = false;

  if (approverType === APPROVERTYPE.SPECIFY && selectedUsers.length === 0) {
    hasError = true;
  }

  if (approverType === APPROVERTYPE.FORM_MEMBER && (!formKey || !formValue)) {
    hasError = true;
  }

  if (
    (optionType === OptionTypeEnum.COST_CENTER_OWNER ||
      approverType === APPROVERTYPE.STEPBYSTEP) &&
    inputType === InputTypeEnum.DYNAMIC &&
    !inputKey
  ) {
    hasError = true;
  }

  if (optionType === OptionTypeEnum.STANDARD_ROLES) {
    if (!standardRoleConfig?.roleType) {
      hasError = true;
    }
    standardRoleConfig?.properties &&
      standardRoleConfig?.properties.forEach((prop) => {
        if (!prop.code || !prop.inputKey) {
          hasError = true;
        }
      });
  }

  return hasError;
};

export const handleAdvanceValidate = (advanced: AdvancedType): boolean => {
  const { handleLimit } = advanced;

  let hasError = false;

  // 1-1000的整数
  if (
    handleLimit < 1 ||
    handleLimit > 1000 ||
    !/^\d+$/g.test(handleLimit.toString())
  ) {
    hasError = true;
  }

  return hasError;
};

export const getFormOptions = (formKey: string): Array<IOptions> => {
  if (!formKey) {
    return [];
  }

  if (formKey.indexOf(dataType.People) > -1) {
    return Object.keys(FORM_PEOPLE_ROLES).map((key) => {
      return { label: key, value: FORM_PEOPLE_ROLES[key] };
    });
  }
  if (formKey.indexOf(dataType.Department) > -1) {
    return Object.keys(FORM_DEPARTMENT_ROLES).map((key) => {
      return { label: key, value: FORM_DEPARTMENT_ROLES[key] };
    });
  }
  return [];
};

export const getEnv = (): string => {
  const [production, staging, test] = [
    { host: ['shenpi.sankuai.com'], value: Env.production },
    { host: ['shenpi.it.st.sankuai.com'], value: Env.staging },
    { host: ['shenpi.it.test.sankuai.com'], value: Env.test }
  ];
  const { host } = window.location;
  if (production.host.includes(host)) {
    return production.value;
  }
  if (staging.host.includes(host)) {
    return staging.value;
  }
  if (test.host.includes(host)) {
    return test.value;
  }
  return test.value;
};
