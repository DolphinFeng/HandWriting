/*
 * @Description:
 * @Author: wuhongjie02@meituan.com
 * @Date: 2022-05-11 19:24:12
 * @LastEditTime: 2022-06-10 12:39:07
 * @LastEditors: wuhongjie02@meituan.com
 * @FilePath: /jimu-approval-editor/src/pages/create/flow/component/Task/const.js
 * @Reference:
 */
import {
  APPROVETYPE,
  APPROVERTYPE,
  APPROVEFORMROLE,
  Level,
  ExpireAutoEnum
} from './task.type';

import { STANDARD_APPROVERTYPE_TITLE } from '@/utils/form.type';

export const STANDARD_APPROVERTYPE_KEY = {
  [APPROVERTYPE.STANDARD_ROLE_FINANCIAL]: 'STANDARD_ROLE_FINANCIAL',
  [APPROVERTYPE.STANDARD_ROLE_HR]: 'STANDARD_ROLE_HR',
  [APPROVERTYPE.STANDARD_ROLE_LEGAL]: 'STANDARD_ROLE_LEGAL',
  [APPROVERTYPE.STANDARD_ROLE_CONTROL]: 'STANDARD_ROLE_CONTROL'
};

export const STANDARD_ROLETYPE_TIP = {
  [APPROVERTYPE.STANDARD_ROLE_FINANCIAL]:
    '流程中涉及公司财务管理相关内容（如账务、预算、采买、支付等）需要财务身份参与决策审批时，可选择此类角色。包含：财务BP、CFO等',
  [APPROVERTYPE.STANDARD_ROLE_HR]:
    '流程中涉及人力资源相关内容（如员工入转调离、薪酬绩效等）需要HR身份参与决策审批时，可选择此类角色。包含：HRBP、HRBP Leader、HRBP Head、人力资源负责人等',
  [APPROVERTYPE.STANDARD_ROLE_LEGAL]:
    '流程中涉及公司法务合规相关内容（如法律法规、对公用印等）需要法务身份参与决策审批时，可选择此类角色。包含：法务BP、法务负责人等',
  [APPROVERTYPE.STANDARD_ROLE_CONTROL]:
    '流程中涉及公司内部风控相关内容（如流程授权、制度监察等）需要内控身份参与决策审批时，可选择此类角色。包含：内控BP、内控负责人等'
};

export const APPROVERTYPE_TITLE = {
  [APPROVERTYPE.LEADER]: '发起人上级',
  [APPROVERTYPE.COST_CENTER_OWNEER]: '成本中心负责人',
  [APPROVERTYPE.DEPTOWNER]: '发起人部门负责人',
  [APPROVERTYPE.SPECIFY]: '指定审批人',
  [APPROVERTYPE.STEPBYSTEP]: '逐级审批',
  [APPROVERTYPE.HRBP]: '发起人 HRBP',
  [APPROVERTYPE.FORM_MEMBER]: '表单控件对应角色',
  [APPROVERTYPE.DESIGNATE_BY_SELF]: '申请人本人',
  [APPROVERTYPE.DESIGNATE_BY_CUSTOMER]: '接口指定审批人',
  ...STANDARD_APPROVERTYPE_TITLE
};

export const CC_APPROVERTYPE_TITLE = {
  ...APPROVERTYPE_TITLE,
  [APPROVERTYPE.SPECIFY]: '指定抄送人'
};

/**
 * 表单对应的角色
 */
export const FORM_BASE_ROLES = {
  [APPROVEFORMROLE.ER]: 'ER',
  [APPROVEFORMROLE.LEADER]: '主管',
  [APPROVEFORMROLE.HRBP]: 'HRBP',
  [APPROVEFORMROLE.HRBPHEAD]: 'HRBP Head',
  [APPROVEFORMROLE.CEOMinusTwo]: 'CEO-2',
  [APPROVEFORMROLE.CEOMinusOne]: 'CEO-1',
  [APPROVEFORMROLE.RECRUITER_LEADER]: '招聘Leader'
};

export const FORM_DEPARTMENT_ROLES = {
  ...FORM_BASE_ROLES,
  // 人员和部门的美团-2 含义不一样
  [APPROVEFORMROLE.CEOMinusTwo]: '美团-2部门负责人',
  [APPROVEFORMROLE.CEOMinusOne]: '美团-1部门负责人'
};

export const FORM_PEOPLE_ROLES = {
  [APPROVEFORMROLE.EMPLOYEE]: '人员本人',
  ...FORM_BASE_ROLES,
  // 人员和部门的美团-2 含义不一样
  [APPROVEFORMROLE.MeiTuanMinusOne]: '美团-1部门负责人',
  [APPROVEFORMROLE.MeiTuanMinusTwo]: '美团-2部门负责人'
};

export const APPROVERTYPE_TARGET = {
  [APPROVERTYPE.LEADER]: '指定层级',
  [APPROVERTYPE.DEPTOWNER]: '指定层级',
  [APPROVERTYPE.STEPBYSTEP]: '审批终点'
};

export const APPROVETYPE_TITLE = {
  [APPROVETYPE.ALL]: { label: '会签', desc: '需所有审批人同意' },
  [APPROVETYPE.ANY]: { label: '或签', desc: '一名审批人同意即可' },
  [APPROVETYPE.SERIES]: { label: '依次审批', desc: '按顺序依次审批' }
};
/**
 * 目前的部门枚举
 */
export const DEPARTMENT = ['-1', '-2', '-3', '-4', '-5'];

/**
 * 老的部门枚举，X1，X2 ... 21 年底废弃
 */
export const DEPRECATED_DEPARTMENT = ['X1', 'X2', 'X3A', 'X3B', 'X4'];

export const FILTER_CEILINGS = Object.values(Level).concat(['-1', '-2']);

/**
 * 超时审批
 */
export const EXPIRE_AUTO = {
  // 20220815 表单联动场景自动通过校验有问题，暂不支持
  // [ExpireAutoEnum.APPROVE]: '自动通过',
  [ExpireAutoEnum.REJECT]: '自动驳回'
};

export const SYSTEM_COMPONENTS = [
  {
    id: 'STARTER',
    label: '发起人',
    type: 'STARTER',
    category: 'SYSTEM'
  }
];
