import { EFeedbackType } from '@src/common/enums'

export interface IFetchScheduleParams {
  scheduleId: string // 日程ID
  appKey: string // 应为enum类型，但后端可自定义，采用string类型
  extension: string // appKey === exchange 值为 'e'，其他为 ''
  empId: string // orgId，作为查看日程的视角
}

export interface IFetchConflictsParams {
  scheduleId: string
  currentAppKey: string
  empIdList: string[]
  startTime: number
  endTime: number
}

export interface IChat {
  chatId: string
  chatID?: string
  chatType: string
}

export interface IShareScheduleParams {
  chatList: IChat[]
  scheduleId: string
  appKey: string
  organizerEmpId: string
}

export interface ICancleAttendScheduleParams {
  appKey: string
  scheduleId: string
  feedbackType: EFeedbackType
  extension: string
}

export interface ICancleAttendCyclicScheduleParams {
  appKey: string
  scheduleId: string
  recurrenceScheduleId: string
  feedbackType: EFeedbackType
  extension: string
}
