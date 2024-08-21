import {
  EAllDayNoticeRule,
  EAllDayStatus,
  EApplicationsType,
  EChatType,
  EFreq,
  ENoticeRule,
  EPushType,
  ERecurrenceType,
  EWeekDay
} from '@src/common/enums'

export interface IGetScheduleDetailParmas {
  scheduleId: string
  empId: string
  appKey: EApplicationsType
}

export interface IRoom {
  roomId: number //会议室id
  roomName: string //会议室名字
  buildingId: number //建筑物id
  buildingName: string //建筑物名字
  floorId: number //楼层id
  floorName: string //楼层名字
  equipId: number // 设备类型
}

export interface IRecurrenceRule {
  freq: EFreq
  interval: number
  byDay?: EWeekDay[]
  byMonthDay?: number[]
}

export interface IAccount {
  avatar: string
  dxUserId: string
  email: string
  empId: string
  mis: string
  name: string
}
export interface IScheduleDetail {
  appKey: EApplicationsType
  attendees: IAttendee[]
  deadline: number
  endTime: number
  isAllDay: EAllDayStatus
  location: string
  memo: string
  noticeRule: ENoticeRule | EAllDayNoticeRule
  organizer: IAttendee
  recurrenceRule: IRecurrenceRule
  recurrenceType: ERecurrenceType
  roomName: string
  startTime: number
  title: string
  roomInfo: IRoom
}

export interface ICreateScheduleParams {
  appKey: EApplicationsType
  attendees: string[]
  bookType: number
  chatId: string
  chatType: EChatType
  deadline: number
  endTime: number
  isAllDay: EAllDayStatus
  location: string
  memo: string
  noticeRule: ENoticeRule | EAllDayNoticeRule
  noticeType: EAllDayStatus
  organizer: string
  recurrenceRule: IRecurrenceRule
  recurrenceType: ERecurrenceType
  room: any
  startTime: number
  title: string
  pushType?: EPushType
}

export interface IRoomId {
  id: number
}

export interface IOrgInfo {
  dxUserId: string
  empId: string
  mis: string
  name: string
}

export interface IAttendee {
  name: string
  mis?: string
  empId?: string
  avatar: string
  dxUserId: string
  xmUid?: string
}
