import { i18nClient } from '@sailor/i18n-mrn'
import { CustomSelectOptionModel } from '../components/custom/CustomSingleSelectRow'

export interface Response<T = any> {
  code: number
  message: string
  data?: T
}

/**
 * 当前用户信息
 * https://km.sankuai.com/page/572939171
 */
export interface TTUserInfo {
  bgId: number
  buId: number
  displayname: string
  email: string
  external: boolean
  id: number
  sysAdmin: boolean
  tenantId: string
  username: string
  guideType?: string
  spaceId?: number
  guideCreateLink?: string
}

export interface TicketDetail {
  actualWorkTime: number
  archiveId?: string // "258"
  archiveName?: string // "分类1"
  assigned: string // 处理人
  associatedProjects: Array<any>
  attachment: Array<any>
  attachments: Array<any>
  categoryId: string
  categoryName: string // 一级目录的名字
  createdAt: number
  createdBy: string
  closeAt: number
  closedReason?: string
  closedDesc?: string
  customFormId?: number
  customField13850: string
  customField20208: string
  customField24098: string
  cc: Array<string>
  desc: string // 描述 富文本
  expectTime: number // ?
  id: number
  itemId: string // 三级目录对应的id
  itemName: string // 三级目录名字
  key: string // ?
  labels: Array<string>
  location: string
  name: string
  nextStates: Array<TicketStatu>
  org: string // 发起人 组织架构
  permission: string // 是否公开，枚举 《public，private》
  priority: number // ?
  progress: number // ?
  projectId: number // ?
  remainingTime: number // ?
  reporter: string // 发起人
  resolution?: string
  rgId: string // 解决组id
  rgName: string
  sla: string // s4
  source: string
  sourceId: number
  state: {
    category: string
    description: string
    name: string
    value: string
  }
  subtypeId: number
  ticketType: string
  typeId: string
  typeName: string //二级目录
  updatedAt: number
  updatedBy: string
  workTimeIsOpen: boolean
  workflowId: number
  customFieldContents?: Array<CustomFieldContent>
  customFieldValues?: Array<CustomFieldValue>
}

export interface RgPermission {
  /** 操作问题归档权限 */
  archive: boolean
  /** 操作标签权限 */
  label: boolean
  /**
   * 操作工单时，问题归档必填限定
   * https://km.sankuai.com/page/546687511
   */
  archiveRequire: boolean
  /** 标签是否必填 */
  labelRequired: boolean
}

// 自定义表单-详情页
export interface CustomFieldValue {
  createdAt: number
  createdBy: string
  customFieldId: number
  dataType: number
  id: number
  ticketId: number
  value: string
}
// 自定义表单-详情页
export interface CustomFieldContent {
  defaultValue: string
  id: number
  inputType: string // 这个很重要 CustomFieldType
  instruction: string
  isHidden: boolean
  isRequired: boolean
  name: string
  identify: string
  type: number // 2 自定义表单 1普通表单
  updateIdentify: string
  options: Array<{ isDefault: boolean; value: string }>
}
// 自定义表单-详情页
export const CustomFieldTypeList = [
  'SINGLE_LINE_TEXT',
  'MULTI_LINE_TEXT',
  'SINGLE_DROP_DOWN',
  'MULTI_DROP_DOWN',
  'DATE',
]

export interface TicketStatu {
  name: string
  description: string
}

// "rgId": "14207",
//                 "typeName": "JARVIS",
//                 "categoryName": "配送",
//                 "createdAt": 1591586866097,
//                 "itemName": "稳定性运营",
//                 "id": 3154375,
//                 "state": "未处理",
//                 "key": "TT-434415",
//                 "updatedAt": 1591586866097,
//                 "cc": [
//                     "tianwenbo",
//                     "lizijun"
//                 ],
//                 "updatedBy": "it_jarvis",
//                 "sla": "S5",
//                 "permission": "public",
//                 "reporter": "it_jarvis",
//                 "ticketType": "问题咨询",
//                 "subtypeId": "ticket",
//                 "labels": "",
//                 "itemId": "9169",
//                 "createdBy": "it_jarvis",
//                 "name": "111",
//                 "typeId": "400",
//                 "assigned": "yuanjunnan",
//                 "categoryId": "33"
export interface TicketListItem {
  name: string
  state: string
  sla: string
  createdAt: number
  updatedAt: number
  id: number
}

export interface TicketListNumberModel {
  cc: number
  unresolved: number
  assigned: number
  reporter: number
  join: number
}

export class RootTree {
  categoryId: number
  categoryName: string // 一级目录名称
  children: Array<SecondTree>
  // 一二级直接发起目录新增字段
  ticketRelated: boolean
  defaultCti?: CTI // ticketRelated true时，提供defaultCti
}

export class SecondTree {
  typeId: number
  typeName: string // 二级目录名称
  children: Array<ThirdTree>
  // 一二级直接发起目录新增字段
  ticketRelated: boolean
  defaultCti?: CTI // ticketRelated true时，提供defaultCti
}

export class ThirdTree {
  itemId: number
  itemName: string // 三级目录名称
  rgId: number
  rgName: string
  // 一二级直接发起目录新增字段
  ticketRelated: boolean
  defaultCti?: CTI // ticketRelated true时，提供defaultCti
}

export class CTI {
  categoryId: number
  categoryName: string
  itemId: number
  itemName: string
  rgId: number
  rgName: string
  typeId: number
  typeName: string
}

// 这个modal很重要，各种点击操作都是更改modal的内容， 进而渲染页面
export class UintModal {
  categoryId: string
  categoryName: string
  typeId: string
  typeName: string
  itemId: string
  itemName: string
  rgId: string
  rgName: string
  selected: Level
  /** 处理人mis */
  assigned: string // 处理人 ， 如果是直接处理人搜索，使用这个即可；如果搜索服务目录则还需根据rgid获取值班人， 外部调用
  createLevel?: Level // 直接发起TT的级别 默认不传
  onlyPeople?: boolean // 处理人搜索，true:不选择目录直接发给处理人
  /** 用户指定了处理人 */
  appointAssigned?: boolean
  /** 处理人中文名  */
  assignedDisplayName?: string
  assignedI18nDisplayName?: string
  isWorkHour?: boolean
}

export enum Level {
  'category' = 'category', // 一级目录
  'type' = 'type', // 二级目录
  'item' = 'item', // 三级目录
}

/**
 * https://km.sankuai.com/page/572939171
 */
export class CCPersonModel {
  avatar: string
  i18nDisplayName: string
  displayName: string
  // jobStatus: number
  username: string
  external: boolean
}

// region Comment
export interface CommentReplied {
  displayName: string
  name: string
  id: number
}

export interface CommentChild {
  createdAt: any
  createdBy: string
  replied: CommentReplied
  displayName: string
  repliedId: number
  commentType: string
  id: number
  text: string
  toUsers: any[]
  ticketId: number
  parentId: number
}

export interface CommentItem {
  createdAt: number
  createdBy: string
  children: CommentChild[]
  displayName: string
  repliedId: number
  commentType: string
  id: number
  text: string
  toUsers: any[]
  ticketId: number
  parentId: number
}

export interface Comment {
  tn: number
  cn: number
  sn: number
  items: CommentItem[]
  pn: number
}
// endregion Comment

export interface UploadResponse {
  code: number
  message: string
  data: UploadFileInfo
}

export interface UploadFileInfo {
  createdAt: number
  size: number
  createdBy: string
  name: string
  id: number
  ticketId: number
  url: string
}

export interface Label {
  id: number
  name: string
}

// content: "<p>模板内容示例</p><p>【页面链接】：</p><p>【所属模块】：</p><p>【Appkey】：</p>"
// id: 7152
// name: "测试模板1111"
// rgId: 18621
// type: "NORMAL"
export interface CreateTempModel {
  content: string
  id: number
  rgId: number
  type: string
}

export class CreateTTParams {
  name: string
  ticketType: string
  categoryName: string
  categoryId: number
  typeName: string
  typeId: number
  itemName: string
  itemId: number
  assigned: string
  sla: string

  cc?: string[]
  reporter?: string
  desc?: string
}

export declare type UserList = Record<
  string,
  {
    avatar: string
    displayName: string
    isExternalUser: boolean
    i18nDisplayName: string
  }
>

export interface ScoreModal {
  satisfy: 'satisfied' | 'common' | 'Dissatisfied'
  suggest: string
  dissatisfiedReasons: []
  resolution: string
}

export interface RgUser {
  active: boolean
  bgName: string
  buName: string
  displayName: string
  identify: string
  orgName: string
  /** 用户指定了处理人 */
  selectPersonManually?: boolean
  external: boolean
}

export interface SLATime {
  responseExpiration: number
  resolveExpiration: number
  responseAt?: number
  resolvedAt?: number
  rgCrossTime?: number
}

export enum CustomFieldType {
  system = 1,
  custom = 2,
}

export enum CustomFieldSystemType {
  /** 输入名称 */
  name = 'name',
  /** 输入描述 */
  desc = 'desc',
  /** 指派 */
  assigned = 'assigned',
  /** 发起人 */
  reporter = 'reporter',
  /** 权限 */
  permission = 'permission',
  /** 抄送人 */
  cc = 'cc',
  /** 标签 */
  labels = 'labels',
  /** 关联 TT */
  associateTicket = 'associateTicket',
  /** 问题类型 */
  ticketType = 'ticketType',
  /** 问题等级 */
  sla = 'sla',
  /** 附件 */
  file = 'file',
  /** 城市 */
  city = 'city',
}

export enum CustomFieldCustomType {
  singleText = 'SINGLE_LINE_TEXT',
  multiText = 'MULTI_LINE_TEXT',
  singleDrop = 'SINGLE_DROP_DOWN',
  multiDrop = 'MULTI_DROP_DOWN',
  date = 'DATE',
  relationInterface = 'RELATION_INTERFACE',
}

// id: 361
// identify: "desc"
// isHidden: false
// isRequired: true
// name: "问题描述"
// type: 1
// https://km.sankuai.com/page/339872839#id-%E5%88%9B%E5%BB%BA%E6%88%96%E6%9B%B4%E6%96%B0%E8%A1%A8%E5%8D%95
export class CustomFieldModel {
  id: number
  /** type是sytem 1时，从这里选择组件 */
  identify: CustomFieldSystemType
  // isHidden: false
  isRequired: boolean
  name: string
  type: CustomFieldType
  /** 自定义的类型 */
  inputType: CustomFieldCustomType
  /** 是否需要隐藏 */
  isHidden: boolean
  instruction: string
  defaultValue: string
  /** 单选多选选项 */
  options?: Array<CustomSelectOptionModel>
  extraSettings?: CustomExtraModel
}

/** 自定义指派用的 model */
export class CustomExtraModel {
  isItemHidden: boolean
  specificAssigned: boolean
  isAssignedHidden: boolean
  itemsScope: any
  relationIntefaceIdentify: string
}

export class CustomCreateModel {
  customFieldContents: Array<CustomFieldModel>
  type: string
}

// "copyLink":"http://tt.cloud.test.sankuai.com/ticket/custom/create/1901/5973",
//             "createdAt":1589381288763,
//             "createdBy":"liyuyao",
//             "displayName":"李昱瑶",
//             "id":1901,
//             "instruction":"aaa",
//             "name":"aaa",
//             "permissionOrgs":[
//                {
//                   "orgId":"104497",
//                   "orgPath":"IPH-美团-基础研发平台-基础技术部-前端技术中心"
//                },
//                {
//                   "orgId":"153544",
//                   "orgPath":"IPH-美团-基础研发平台-基础技术部-前端技术中心-项目平台开发组"
//                }
//             ],
//             "rgId":5973,
//             "updatedAt":1592379031370,
//             "updatedBy":"liyuyao"
export interface CustomListItemModel {
  copyLink: string
  createdAt: string
  createdBy: string
  displayName: string
  id: number
  instruction: string
  name: string
  // permissionOrgs: any
  rgId: number
  updatedAt: number
  updatedBy: string
}

// "auth":"private","rgId":18621,"ccSwitch":"on","id":339,"mailSwitch":"off","userMap":{"ruanshanshan":"阮闪闪"}
export interface RGSettingsModel {
  auth: string
  ccSwitch: string
  userMap: any
}

//#region ticket archive
export interface RgArchiveInfo {
  rgId: number
  active: boolean
  rootNode?: ArchiveInfo
}
export interface ArchiveInfo {
  id: number
  name: string
  leaf: boolean
  inUse: boolean
  parentId?: number
}
export interface ArchiveChildren {
  items: ArchiveInfo[]
}
export interface ArchiveSearchResultItem extends ArchiveInfo {
  fullName: string
}
export interface ArchiveSearchResult {
  items: ArchiveSearchResultItem[]
}
//#endregion ticket archive

export const ALL_EMPTY_CATEGORY = {
  categoryId: null,
  typeId: null,
  itemId: null,
  categoryName: 'constants_708c9d',
  typeName: 'constants_708c9d',
  itemName: 'constants_708c9d',
  // categoryName: i18nClient.t('constants_708c9d', { defaultValue: '请选择' }),
  // typeName: i18nClient.t('constants_708c9d', { defaultValue: '请选择' }),
  // itemName: i18nClient.t(, { defaultValue: '请选择' }),
  rgId: null,
  rgName: null,
  selected: Level.category,
} as UintModal

export const SECOND_EMPTY_CATEGORY = {
  typeId: null,
  itemId: null,
  typeName: 'constants_708c9d',
  itemName: 'constants_708c9d',
  // typeName: i18nClient.t('constants_708c9d', { defaultValue: '请选择' }),
  // itemName: i18nClient.t('constants_708c9d', { defaultValue: '请选择' }),
  rgId: null,
  rgName: null,
  selected: Level.type,
} as UintModal

export const THIRD_EMPTY_CATEGORY = {
  itemId: null,
  itemName: 'constants_708c9d',
  // itemName: i18nClient.t('constants_708c9d', { defaultValue: '请选择' }),
  rgId: null,
  rgName: null,
  selected: Level.item
} as UintModal

// 目录不翻译
export const NO_SUITABLE_DIRECTORY = '找不到合适的目录'
export const AUTO_CREATE_NO_DIRECTORY = '※不选择目录直接发起※'

export interface WorkPermissionItem {
  type: string
  field: string
  permission: boolean
  content?: string
}

export enum NonWorkPermission {
  doingTicket = 'doingTicket',
  closeTicket = 'closeTicket',
  pauseTicket = 'pauseTicket',
  createChatRoom = 'createChatRoom',
}

export enum PermissionType {
  EDITABLE = 'editable', // 最高权限，可见、可操作
  VISIBLE = 'visible', // 可见，但不可编辑
  DISABLE = 'disabled', // 不可见、不可编辑
}
/**
 * TT 详情页各按钮权限，具体见https://km.sankuai.com/page/549222905
 */
export interface DetailOperate {
  assignToMe: PermissionType
  closeTicket: PermissionType
  createChatRoom: PermissionType
  relateCOE: PermissionType
  sla: PermissionType
  permission: PermissionType
  relateTT: PermissionType
  ticketType: PermissionType
  doingTicket: PermissionType
  retryTicket: PermissionType
  reopen: PermissionType
  chatRecord: PermissionType
  doneTicket: PermissionType
  pauseTicket: PermissionType
  createOnes: PermissionType
  attachment: PermissionType
  createItsm: PermissionType
  circulation: PermissionType
  createCase: PermissionType
  name: PermissionType
  desc: PermissionType
  nonWorkingWarn: PermissionType
  pendTicket: PermissionType
  evaluation: PermissionType
}

export interface TicketOperate {
  detailOperate: DetailOperate
  isWorkHour: boolean
}
