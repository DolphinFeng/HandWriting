// https://calendar.sankuai.com/api/v2/xm/schedules/8174736?appKey=schedule&extension=&empId=2533170

import { EApplicationsType, EFeedbackType, ERoleType } from '@src/common/enums'

export interface IErrorInfo {
  errorCode: string
  message: string
}

export interface IEmployee {
  empId: string // org id
  tenantId?: number // 员工类型
  name: string
  mis: string
  xmUid?: string
  orgId?: string
  orgName?: string
  avatar?: string
  email?: string
  orgPath?: string // 无用
  orgNamePath?: string
  jobStatus?: string
  inviterXmUid?: string
}

// !Demo
// {
//   empId: '2073973' // org id
//   tenantId: 1 // 员工类型
//   name: '郑宗杰'
//   mis: 'zhengzongjie'
//   xmUid: '6966388'
//   orgId: '108679'
//   orgName: null
//   avatar: ''
//   email: 'zhengzongjie@test.com'
//   orgPath: null // 无用
//   orgNamePath: 'IPH-美团-基础研发平台-企业平台研发部-办公效率研发中心-后端组-办公应用后端组'
//   jobStatus: '在职'
// }

// 组织者信息
export interface IOrganizer extends IEmployee {}

export interface IAttendee extends IEmployee {
  feedbackType?: string // 反馈类型
}

// 会议室详情
export interface IRoomInfo {
  buildingId: number
  buildingName: string
  floorId: number
  floorName: string
  roomId: number
  roomName: string
  equipId: number
}

// !Demo
// {
//   buildingId: 103
//   buildingName: '北京恒电大厦C座'
//   floorId: 322
//   floorName: '1层'
//   roomId: 506
//   roomName: '广州厅'
// }

// ORGANIZER(0), ATTENDEE(1), ORGANIZER_SHARER(2), ATTENDEE_SHARER(3), ILLEGAL_USER(4);
// export type RoleType =
//   | 'ORGANIZER'
//   | 'ATTENDEE'
//   | 'ORGANIZER_SHARER'
//   | 'ATTENDEE_SHARER'
//   | 'ILLEGAL_USER'

// 循环日程类型，NONE-普通日程，EVERY_DAY-按天循环的日程，WEEKLY-按周循环的日常，PER_MONTH-按月循环的日程，CUSTOMIZED-用户自定义日程
enum ERecurrenceType {
  None = 'NONE',
  EveryDay = 'EVERY_DAY',
  Weeky = 'WEEKY',
  PerMonth = 'PER_MONTH',
  Customized = 'CUSTOMIZED'
}

// NONE-普通日程，DAILY-按天循环的日程，WEEKLY-按周循环的日常，MONTHLY-按月循环的日程
enum ERecurrenvceFreq {
  None = 'NONE',
  Daily = 'DAILY',
  Weekly = 'WEEKLY',
  Monthly = 'MONTHLY'
}

export interface IScheduleDetail {
  // defined
  id: string //日程ID
  title: string // 日程title
  organizer: IOrganizer
  attendees: IAttendee[]
  externalAttendees: []
  roomInfo: IRoomInfo
  role: {
    roleType: ERoleType
  }
  // 时间戳
  startTime: number //开始时间
  endTime: number //结束时间
  startDate: number //开始日期
  endDate: number //结束日期

  // 提醒
  isNotice: true // 是否进行消息提醒
  noticeTime: number // 通知时间
  noticeType: number // 消息提醒类型，0-非全天日程，1-全天日程，2-自定义日程
  noticeRule: string // 消息提醒规则
  noticeBeforeStart: number // 15
  noticeDescription: string

  // 地址
  locationId: number
  roomName: string
  locationType: any
  location: string
  locationMail: any
  locationUrl: string
  roomLocationUrl: string
  targetUrl: string

  // 备注
  memo: string // 备注

  // 其他
  enable: 'ON' | 'OFF' // 日程是否可用，'ON'-可用，'OFF'-不可用
  status: 0 | 1 | 2 // 日程状态，0-未开始，1-进行中，2-已结束
  feedback: EFeedbackType

  // 循环日程+跨天日程等
  isAllDay: 0 | 1 // 是否全天
  isOverDay: 0 | 1 // 跨天
  isCyclic: 0 | 1 // 循环日程

  // 循环日程信息
  deadline: number // 结束日期
  recurrenceScheduleId: string
  recurrenceType: ERecurrenceType // 自定义循环
  recurrenceRule: {
    freq: ERecurrenvceFreq
    interval: number
    byMonthDay: number // 每月的第X天
    byDay: ['SU', 'SA'] // MO-周一，TU-周二，WE-周三，TH-周四，FR-周五，SA-周六，SU-周日
  }
  recurrenceDescription: string // 详情页展示该字段

  applicationId: 1
  appKey: EApplicationsType // schedule 日程类型 1-日程，2-会议，3-邮箱，4-互联网+大学，5-晋升系统
  applicationName: string // 日程
}
