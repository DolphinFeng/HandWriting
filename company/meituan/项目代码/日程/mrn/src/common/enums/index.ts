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
  Promotionapi = 'com.sankuai.it.bi.promotionapi'
}

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

// 日程类型
export enum EAllDayStatus {
  NO_ALL_DAY = 0, // 非全天日程
  ALL_DAY = 1 // 全天日程
}

// 会话类型
export enum EChatType {
  GroupChat = 'groupchat',
  Chat = 'chat',
  Default = ''
}

export enum EEditType {
  CREATE_NEW = 1,
  EDIT = 2,
  EDIT_RECURRENT = 3
}

export enum EPushType {
  ALL_PUSH = 0,
  ATTENDEE_PUSH = 1
}

export * from './notice'
export * from './recurrent'
export * from './feedback'
