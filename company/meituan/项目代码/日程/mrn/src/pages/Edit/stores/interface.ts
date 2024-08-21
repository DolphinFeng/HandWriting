import { IRecurrenceRule, IRoom } from '@src/apis/Edit/interface'
import {
  ERecurrenceType,
  EAllDayStatus,
  ENoticeRule,
  EAllDayNoticeRule,
  EApplicationsType,
  EChatType,
  EEditType,
  EPushType
} from '@src/common/enums'
import { IAttendee } from '@src/common/interfaces'

export interface IEditStore {
  detail: any
  title: string
  location: string
  memo: string
  isAllDay: EAllDayStatus
  startTime: number
  endTime: number
  startDay: number
  endDay: number
  room: IRoom
  attendees: IAttendee[]
  confiltAttendees: IAttendee[]
  noticeRule: ENoticeRule
  noticeRuleOfAllDay: EAllDayNoticeRule
  recurrenceType: ERecurrenceType
  recurrenceRule: IRecurrenceRule
  deadline: number
  bookRules: IBookRules
  endAfterStart: boolean
  cantBookRoom: string | boolean
  organizer: IAttendee
  scheduleId: string
  appKey: EApplicationsType
  isOrganizer: boolean
  chatId: string
  chatType: EChatType
  pushType: EPushType
  bookRoomMessage: string
  isOverDay: boolean
  noChangeSchedule: () => boolean
  noChangeAttendee: () => boolean
  noChangeRecurrenceRule: (rule: IRecurrenceRule, initialRule: IRecurrenceRule) => boolean
  init: (params: IRouteParams) => void
  setTitle: (title: string) => void
  setLocation: (location: string) => void
  setMemo: (memo: string) => void
  setIsAllDay: (isAllDay: EAllDayStatus) => void
  setStartTime: (startTime: number) => void
  setEndTime: (endTime: number) => void
  setRoom: (room: IRoom | null) => void
  setAttendees: (attendees: IAttendee[]) => void
  selectAttendees: () => Promise<void>
  setNoticeRule: (rule: ENoticeRule) => void
  setAllDayNoticeRule: (rule: EAllDayNoticeRule) => void
  setRecurrenceType: (type: ERecurrenceType) => void
  setRecurrenceRule: (rule: IRecurrenceRule) => void
  setDeadline: (deadline: number) => void
  createSchedule: (type: EEditType) => Promise<string>
  setHasChangeEndTime: (hasChangeEndTime: boolean) => void
  canSchedule: () => boolean
  backByBusy: (params: IRouteParams) => void
  setPushType: (pushType: EPushType) => void
}

export interface IBookRules {
  dayBookLimit: number
  maxSpan: number
  minSpan: number
  meetingCountLimit: number
  roomMeanwhileLimit: number
}

export interface IRouteParams {
  selectday?: number
  scheduleId?: string
  empId?: string
  appKey?: EApplicationsType
  startDay?: number
  attendees?: []
  members?: []
  startTime?: number
  endTime?: number
  chatType?: EChatType
  chatId?: string
  isAllDay?: boolean
  refresh?: any
  roomId?: number //会议室id
  roomName?: string //会议室名字
  buildingId?: number //建筑物id
  buildingName?: string //建筑物名字
  buildId?: number //建筑物名字
  buildName?: string //建筑物名字
  floorId?: number //楼层id
  floorName?: string //楼层名字
  equipId?: number // 设备类型
}
