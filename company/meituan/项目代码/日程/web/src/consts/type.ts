import { i18nClient } from '@sailor/i18n-web';
/*
 * @Description: 类型描述
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-06-08 14:20:38
 * @LastEditors: chenbaiyu
 * @LastEditTime: 2022-05-09 14:42:03
 * @FilePath: /scheduleweb/src/consts/type.ts
 */

/**
 * 参与者反馈类型
 * 全部
 * 未响应
 * 接受
 * 暂定
 *拒绝
 */
export enum EFeedbackType {
  All = -1,
  Default = 0,
  Accept = 1,
  Tentative = 2,
  Refuse = 3,
  Conflict = 4 // 用于冲突展示，和其它类型是不同的集合
}

/**
 * 日程应用类型
 * 日程
 * 会议
 * 邮箱
 * 互联网+大学
 * 晋升系统
 */
export enum EApplicationsType {
  Schedule = 'schedule',
  Meeting = 'meeting',
  Exchange = 'exchange',
  IPU = 'IPU',
  Promotionapi = 'com.sankuai.it.bi.promotionapi',
  ZhaoPin = 'zhaopin'
}

/*
  Schedule = 1,
  Meeting = 2,
  Exchange = 3,
  IPU = 4,
  Promotionapi = 5
*/
export const EApplicationsNumTypeArr = [
  'schedule',
  'meeting',
  'exchange',
  'IPU',
  'com.sankuai.it.bi.promotionapi',
  'zhaopin'
];

/**
 * 日程角色
 */
export enum ERoleType {
  ORGANIZER = 'ORGANIZER',
  ATTENDEE = 'ATTENDEE',
  ORGANIZER_SHARER = 'ORGANIZER_SHARER',
  ATTENDEE_SHARER = 'ATTENDEE_SHARER',
  ILLEGAL_USER = 'ILLEGAL_USER'
}

/**
 * 组织者、参与者个人信息
 */
export interface IPersonInfo {
  avatar?: string;
  email?: string;
  mis?: string;
  name?: string;
  orgNamePath?: string;
  tenantId?: number;
  xmUid?: string;
  empId?: string;
  feedbackType?: EFeedbackType;
  enName?: string;
}

/**
 * 反馈类型数量
 */
export interface IFeedbackCount {
  count: number;
  feedbackType: EFeedbackType;
}

export interface IVideoMeetingInfoVo {
  startUrl: string;
  joinUrl: string;
  meetingId: string;
}

/**
 * 解析备注元素类型
 */
export enum EContentSchemaType {
  Text = 'text',
  Link = 'link'
}

/**
 * 解析备注元素
 */
export interface IContentSchema {
  type: EContentSchemaType;
  content: string;
  link?: string;
}

export enum ETextHandlerType {
  SPECILLINK = 'specil',
  LINK = 'link'
}

export enum EDXEventType {
  BYICON = 'byIcon', // 点击顶部图标
  BYADDICON = 'byAddIcon', // 点击创建图标
  BYDETAIL = 'byDetail' // 点击具体详情
}

// 窗户选项列表
export const windowOption = [
  {
    value: 'all',
    label: i18nClient.t('window_option_all', '不限')
  },
  {
    value: false,
    label: i18nClient.t('window_option_no_window', '无窗')
  },
  {
    value: true,
    label: i18nClient.t('window_option_have_window', '有窗')
  }
];

// 进入页面的名称
export enum EPageType {
  MEETING = 'meeting',
  SCHEDULE = 'schedule'
}

// 会议室字段
export interface IMeetingRoomObject {
  id: string;
  roomName: string;
  floorName: string;
  buildingName: string;
  email: string;
  equipId?: string;
  equipName?: string;
  roomLocationUrl?: string;
}

// 参与人变更通知类型
export enum EInformType {
  PART = 'part',
  ALL = 'all',
  NONE = 'none'
}

// 循环日程生效范围类型
export enum EEffectiveRangeType {
  SINGLE = 'single',
  CYCLE = 'cycle'
}

export enum EPerformancePosition {
  LAYOUT_START = 2,
  GLOBAL_REQUEST_FINISH = 3,
  WEEKLY_REQUEST_START = 4,
  WEEKLY_REQUEST_END = 5,
  GLOBAL_STORE_INIT = 6,
  WEEKLY_PAGE = 7,
  ROOMS_PAGE = 8,
  EDIT_PAGE = 9,
  DETAIL_PAGE = 10
}
