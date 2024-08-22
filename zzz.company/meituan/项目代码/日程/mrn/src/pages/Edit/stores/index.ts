import { action, autorun, computed, observable, toJS } from 'mobx'
import KNB from '@mrn/mrn-knb'
import { warn } from '@onejs/mrn-utils'
import { toast } from '@onejs/mrn-components'
//
import {
  ERecurrenceType,
  EAllDayStatus,
  ENoticeRule,
  EAllDayNoticeRule,
  EApplicationsType,
  EChatType,
  ERoleType,
  EEditType,
  EPushType
} from '@src/common/enums'
import { DefaultBookRules } from '@src/common/consts'
import appStore from '@src/store'
import { ONE_MINUTE, TimeUtils } from '@src/utils/time'
import { BusyApi, EditApi } from '@src/apis'
import { IRecurrenceRule, IRoom, IScheduleDetail, IAttendee } from '@src/apis/Edit/interface'
import { getConflictInfos, getQuotaByTime } from '@src/pages/Busy/util'
import { IBookRules, IEditStore, IRouteParams } from './interface'
//
export * from './interface'

export class EditStore implements IEditStore {
  // ---------------------------- 表单值 ----------------------------
  @observable public title: string = '' // 标题

  @observable public isAllDay: EAllDayStatus = EAllDayStatus.NO_ALL_DAY // 全天

  @observable public initialStartTime: number // 记录初始的开始时间，用来判断用户是否改变了时间

  @observable public startTime: number = TimeUtils.getNextQuarterh() // 开始

  @observable public startDay: number = TimeUtils.getToday0Time() // 开始（全天）

  @observable public endTime: number = TimeUtils.getNextHour(TimeUtils.getNextQuarterh()) // 结束

  @observable public endDay: number = TimeUtils.getToday24Time() // 结束（全天）

  @observable public location: string = '' // 地点

  @observable public room: IRoom // 会议室

  @observable public attendees: IAttendee[] = [] // 参与人(含创建人)

  @observable public confiltAttendees: IAttendee[] = [] // 冲突人

  @observable public noticeRule: ENoticeRule = ENoticeRule['15分钟前'] // 提醒

  @observable public noticeRuleOfAllDay: EAllDayNoticeRule = EAllDayNoticeRule['当天9:00'] // 提醒（全天）

  @observable public recurrenceType: ERecurrenceType = ERecurrenceType.NONE // 重复

  @observable public recurrenceRule: IRecurrenceRule // 重复规则

  @observable public deadline: number // 截止日期

  @observable public memo: string = '' // 备注

  @observable public pushType: EPushType = EPushType.ATTENDEE_PUSH // 通知类型

  // ---------------------------- 编辑状态 ----------------------------
  @observable public scheduleId: string // 日程id（表示处于编辑态）

  @observable public hasChangeEndTime: boolean // 用户是否修改过结束时间

  @observable public isSending: boolean = false // 是否正在创建中

  // ----------------------------------------------------------------
  @observable public bookRules: IBookRules = DefaultBookRules // 会议室预定规则（后端配置）

  @observable public organizer: IAttendee // 创建人

  @observable public chatId: string // 会话id

  @observable public chatType: EChatType // 会话类型

  @observable public detail: any // 编辑状态下日程的初始值

  @computed public get appKey(): EApplicationsType {
    return this.room ? EApplicationsType.Meeting : EApplicationsType.Schedule
  }

  // 是否是创建人
  @computed public get isOrganizer() {
    return (
      !this.scheduleId ||
      (this.detail?.role?.roleType === ERoleType.ORGANIZER &&
        this.detail?.organizer?.empId === appStore.userInfo.user.empId)
    )
  }

  // 结束时间是否大于开始时间
  @computed public get endAfterStart(): boolean {
    return this.isAllDay ? this.startDay < this.endDay : this.startTime < this.endTime
  }

  // 是否可以预定会议室
  @computed public get cantBookRoom(): boolean {
    return !this.bookRoomMessage
  }

  // 是否跨天
  @computed public get isOverDay(): boolean {
    const { format } = TimeUtils
    if (this.isAllDay) {
      return format(this.startDay, 'YYYY-MM-dd') !== format(this.endDay, 'YYYY-MM-dd', true)
    }
    return format(this.startTime, 'YYYY-MM-dd') !== format(this.endTime, 'YYYY-MM-dd', true)
  }

  // 预定会议室提示信息
  @computed public get bookRoomMessage(): string {
    const { dayBookLimit, maxSpan, minSpan } = this.bookRules || DefaultBookRules

    switch (true) {
      case this.recurrenceType !== ERecurrenceType.NONE:
        return '循环日程不可预订会议室'
      case !!this.isAllDay:
        return '全天日程不可预订会议室'
      case this.isOverDay:
        return '跨天日程不可预订会议室'
      case this.endTime < Date.now():
        return '过去时间不可预订会议室'
      case new Date(this.startTime).getDate() - new Date().getDate() >
        (dayBookLimit || DefaultBookRules.dayBookLimit):
        return `仅可预订${dayBookLimit || DefaultBookRules.dayBookLimit}天内的会议室`
      case this.endTime - this.startTime > (maxSpan || DefaultBookRules.maxSpan) * ONE_MINUTE:
        return `超过${maxSpan || DefaultBookRules.maxSpan / 60}小时的日程不可预订会议室`
      case this.endTime - this.startTime < (minSpan || DefaultBookRules.minSpan) * ONE_MINUTE:
        return `少于${minSpan || DefaultBookRules.minSpan}分钟的日程不可预订会议室`
      default:
        return undefined
    }
  }

  constructor() {
    // 获取有冲突的参会人
    autorun(async () => {
      const params = {
        currentScheduleId: this.scheduleId,
        currentAppKey: this.scheduleId ? this.appKey : null,
        empIdList: [...this.attendees.map(item => item.empId)],
        queryDate: this.startTime
      }
      const busyPeriod = await this.getBusyPeriod(params, this.endTime)
      this.setConfiltAttendees(busyPeriod.filter((i: any) => i.isConflict))
    })
  }

  // ---------------------------- 初始化 ----------------------------
  @action public init = (params: IRouteParams): void => {
    const {
      selectday,
      scheduleId,
      empId,
      appKey,
      chatId,
      chatType,
      attendees,
      startTime,
      endTime,
      roomId,
      roomName,
      buildId,
      buildName,
      floorId,
      floorName,
      equipId
    } = params

    this.initBookRule()

    switch (true) {
      // 新建群日程
      case !!chatType:
        this.chatId = chatId
        this.chatType = chatType
        this.setOrganizer(appStore.userInfo.user)
        this.setAttendees(attendees && attendees.length > 0 ? attendees : [appStore.userInfo.user])
        this.setStartTime(startTime)
        this.setEndTime(endTime)
        this.startDay = TimeUtils.getToday0Time(startTime)
        this.endDay = TimeUtils.getToday24Time(endTime)
        break
      // 编辑日程
      case !!scheduleId:
        this.scheduleId = scheduleId
        this.getScheduleDetail(scheduleId, empId, appKey)
        break
      // 订会议室创建
      case !!roomId:
        this.setOrganizer(appStore.userInfo.user)
        this.setAttendees(attendees && attendees.length > 0 ? attendees : [appStore.userInfo.user])
        this.setStartTime(+startTime)
        this.setEndTime(+endTime)
        this.startDay = TimeUtils.getToday0Time(+startTime)
        this.endDay = TimeUtils.getToday24Time(+endTime)
        this.setRoom({
          roomId,
          buildingId: buildId,
          buildingName: buildName,
          roomName,
          floorId,
          floorName,
          equipId: +equipId
        })
        this.initialStartTime = +startTime // !TODO: ??
        break
      // 新建日程
      default:
        this.setOrganizer(appStore.userInfo.user)
        this.setAttendees([appStore.userInfo.user])
        let start = TimeUtils.getNextQuarterh()
        let end = TimeUtils.getNextHour(start)
        if (selectday) {
          start = TimeUtils.setDate(start, Number(selectday))
          end = TimeUtils.getNextHour(start)
          this.startDay = TimeUtils.getToday0Time(start)
          this.endDay = TimeUtils.getToday24Time(end)
        }
        this.setStartTime(start)
        this.setEndTime(end)
        this.initialStartTime = start
        break
    }
  }

  @action public getScheduleDetail = async (
    scheduleId: string,
    empId: string,
    appKey: EApplicationsType
  ): Promise<void> => {
    const res = await EditApi.getScheduleDetail({ scheduleId, empId, appKey })
    this.setScheduleDetail(res)
  }

  // 获取冲突信息
  @action public getBusyPeriod = async (params, endTime: number) => {
    const conflictInfos = await BusyApi.busyPeriod(params)
    return getConflictInfos(
      conflictInfos,
      true,
      getQuotaByTime(this.startTime),
      getQuotaByTime(endTime)
    )
  }

  @action public setScheduleDetail = (detail: IScheduleDetail): void => {
    // 记录编辑态初始值
    this.detail = detail
    // 表单内容初始化
    this.setTitle(detail.title)
    this.setIsAllDay(detail.isAllDay)
    if (detail.isAllDay) {
      this.startDay = detail.startTime
      this.endDay = detail.endTime
    } else {
      this.setStartTime(detail.startTime)
      this.setEndTime(detail.endTime)
    }
    detail.location && this.setLocation(detail.location)
    detail.roomInfo && this.setRoom(detail.roomInfo)
    this.setOrganizer(detail.organizer)
    this.setAttendees([detail.organizer, ...detail.attendees])
    if (detail.isAllDay) {
      this.setAllDayNoticeRule(
        (detail.noticeRule as EAllDayNoticeRule) || EAllDayNoticeRule['当天9:00']
      )
    } else {
      this.setNoticeRule((detail.noticeRule as ENoticeRule) || ENoticeRule['15分钟前'])
    }
    detail.recurrenceType && this.setRecurrenceType(detail.recurrenceType || ERecurrenceType.NONE)
    detail.recurrenceRule && this.setRecurrenceRule(detail.recurrenceRule)
    detail.deadline && this.setDeadline(detail.deadline)
    this.setMemo(detail.memo)
  }

  // -------------- 修改表单 --------------

  @action public setTitle = (title: string): void => {
    this.title = title
  }

  @action public setLocation = (place: string): void => {
    this.location = place
  }

  @action public setIsAllDay = (isAllDay: EAllDayStatus): void => {
    this.isAllDay = isAllDay
  }

  @action
  public setStartTime = (startTime: number): void => {
    if (this.isAllDay) {
      this.startDay = TimeUtils.getToday0Time(startTime)
      if (!this.hasChangeEndTime && !this.scheduleId) {
        this.setEndTime(startTime)
      }
    } else {
      this.startTime = startTime
      if (!this.hasChangeEndTime) {
        if (this.scheduleId) {
          const { startTime: initialStartTime = 0, endTime: initialEndTime = 0 } = this.detail || {}
          this.setEndTime(TimeUtils.getNextTime(startTime, initialEndTime - initialStartTime))
        } else {
          this.setEndTime(TimeUtils.getNextHour(startTime))
        }
      }
    }
  }

  @action setConfiltAttendees = (confiltAttendees: IAttendee[]) => {
    this.confiltAttendees = confiltAttendees
  }

  @action
  public setEndTime = (endTime: number): void => {
    if (this.isAllDay) {
      this.endDay = TimeUtils.getToday24Time(endTime)
    } else {
      this.endTime = endTime
    }
  }

  @action public setHasChangeEndTime = (hasChangeEndTime: boolean): void => {
    this.hasChangeEndTime = hasChangeEndTime
  }

  @action setRoom = (room: IRoom | null): void => {
    this.room = room
    room && this.setNoticeRule(ENoticeRule['10分钟前']) // 预定会议室默认10分钟前提醒
  }

  @action public setAttendees = (attendees: IAttendee[]): void => {
    this.attendees = attendees
  }

  @action public setRecurrenceType = (type: ERecurrenceType): void => {
    this.recurrenceType = type
    if (type !== ERecurrenceType.NONE && !this.deadline) {
      this.setDeadline(TimeUtils.getNextMonth(new Date(), 2))
    }
  }

  @action public setRecurrenceRule = (rule: IRecurrenceRule): void => {
    this.recurrenceRule = rule
  }

  @action public setNoticeRule = (rule: ENoticeRule): void => {
    this.noticeRule = rule
  }

  @action public setAllDayNoticeRule = (rule: EAllDayNoticeRule): void => {
    this.noticeRuleOfAllDay = rule
  }

  @action public setDeadline = (deadline: number): void => {
    this.deadline = deadline
  }

  @action public setMemo = (memo: string): void => {
    this.memo = memo
  }

  @action public setPushType = (pushType: EPushType): void => {
    this.pushType = pushType
  }

  @action public backByBusy = ({ startTime, endTime }): void => {
    if (startTime !== this.startTime || endTime !== this.endTime) {
      this.setStartTime(startTime)
      this.setEndTime(endTime)
    }
  }

  // ----------------------------

  @action public createSchedule = async (type: EEditType): Promise<string> => {
    this.isSending = true
    try {
      const addAttendeesParams = {
        attendees: this.attendees.map(i => i.empId),
        pushType: this.pushType
      }
      const params = {
        appKey: this.appKey,
        attendees: this.attendees.map(i => i.empId),
        bookType: 22, // 暂定
        chatId: this.chatId,
        chatType: this.chatType,
        deadline: this.deadline,
        endTime: this.isAllDay ? this.endDay : this.endTime,
        isAllDay: this.isAllDay,
        location: this.location,
        memo: this.memo,
        noticeRule: this.isAllDay ? this.noticeRuleOfAllDay : this.noticeRule,
        noticeType: this.isAllDay,
        organizer: this.organizer.empId,
        room: this.room && {
          id: this.room.roomId,
          buildName: this.room.buildingName,
          name: this.room.roomName,
          floorName: this.room.floorName
        },
        recurrenceRule: this.recurrenceRule,
        recurrenceType: this.recurrenceType,
        startTime: this.isAllDay ? this.startDay : this.startTime,
        title: this.title || `${appStore.userInfo?.user?.name}发起的日程`,
        pushType: this.pushType
      }

      let res: any
      switch (true) {
        case type === EEditType.CREATE_NEW:
          res = await EditApi.createSchedule(params)
          break
        case type === EEditType.EDIT && this.isOrganizer:
          res = await EditApi.editSchedule(params, this.scheduleId)
          break
        case type === EEditType.EDIT && !this.isOrganizer:
          res = await EditApi.addAttendees(addAttendeesParams, this.scheduleId)
          break
        case type === EEditType.EDIT_RECURRENT && this.isOrganizer:
          res = await EditApi.editRecurrenceSchedule(
            params,
            this.detail?.recurrenceScheduleId,
            this.scheduleId
          )
          break
        case type === EEditType.EDIT_RECURRENT && !this.isOrganizer:
          res = await EditApi.addRecurrentAttendees(
            addAttendeesParams,
            this.detail?.recurrenceScheduleId,
            this.scheduleId
          )
          break
        default:
          break
      }

      if (res.code === 200) return this.scheduleId
      if (res.scheduleId) return res.scheduleId
      if (res.message) {
        toast.open(res.message)
      }
    } catch (err) {
      console.log('[createSchedule] fail', err)
    }
    this.isSending = false
    return ''
  }

  @action public setBookRules = (rule: IBookRules): void => {
    this.bookRules = rule
  }

  @action public setOrganizer = (organizer: IAttendee): void => {
    this.organizer = organizer
  }

  // 是否没改变参会人
  public noChangeAttendee = (): boolean => {
    const attendees = this.attendees.map(i => i.empId)
    const initialAttendees = this.detail.attendees.map((i: IAttendee) => i.empId)
    return (
      (initialAttendees.length as number) + 1 === attendees.length && // 详情接口里的 attendees 不包含创建者
      initialAttendees.every((i: string) => attendees.includes(i))
    )
  }

  // 判断表单内容项是否没有改变
  public noChange = (value: any, initialValue: any): boolean => {
    switch (true) {
      case !value && !initialValue: // 俩都是空 => 没改
        return true
      case value && !initialValue: // 原本没有，新增了 => 改了
        return false
      case !value && initialValue: // 原本有的，删了 => 改了
        return false
      case typeof value !== 'object' && typeof initialValue !== 'object': // 两个值都是普通类型 => 直接比较
        return value === initialValue
      case Array.isArray(toJS(value)) && Array.isArray(toJS(initialValue)): // 比较两个数组 => 长度一致，互相包含 => 没改
        return (
          value.length === initialValue.length && value.every((i: any) => initialValue.includes(i))
        )
      default:
        return null // 都存在值 => 不确定改没改，后面再做判断
    }
  }

  public noChangeRecurrenceRule = (
    rule: IRecurrenceRule,
    initialRule: IRecurrenceRule
  ): boolean => {
    const noChange = this.noChange(rule, initialRule)
    if (noChange !== null) {
      return noChange
    }
    return (
      this.noChange(rule.freq, initialRule.freq) &&
      this.noChange(rule.interval, initialRule.interval) &&
      this.noChange(rule.byDay, initialRule.byDay) &&
      this.noChange(rule.byMonthDay, initialRule.byMonthDay)
    )
  }

  // 是否没改变会议内容
  public noChangeSchedule = (): boolean => {
    const start = this.isAllDay ? this.startDay : this.startTime
    const end = this.isAllDay ? this.endDay : this.endTime
    const noticeRule = this.isAllDay ? this.noticeRuleOfAllDay : this.noticeRule
    if (this.scheduleId && this.detail) {
      return (
        this.noChange(this.title, this.detail.title) &&
        this.noChange(this.isAllDay, this.detail.isAllDay) &&
        this.noChange(start, this.detail.startTime) &&
        this.noChange(end, this.detail.endTime) &&
        this.noChange(this.location, this.detail.location) &&
        this.noChange(this.room?.roomId, this.detail.roomInfo?.roomId) &&
        this.noChange(noticeRule, this.detail.noticeRule) &&
        this.noChange(this.recurrenceType, this.detail.recurrenceType || ERecurrenceType.NONE) &&
        this.noChangeRecurrenceRule(this.recurrenceRule, this.detail.recurrenceRule) &&
        this.noChange(this.memo, this.detail.memo) &&
        this.noChange(this.deadline, this.detail.deadline) &&
        this.noChangeAttendee()
      )
    } else {
      return (
        this.noChange(this.title, '') &&
        this.noChange(this.isAllDay, EAllDayStatus.NO_ALL_DAY) &&
        this.noChange(start, this.initialStartTime) &&
        this.noChange(end, TimeUtils.getNextHour(this.initialStartTime)) &&
        this.noChange(this.location, '') &&
        this.noChange(this.room, null) &&
        this.noChange(noticeRule, ENoticeRule['15分钟前']) &&
        this.noChange(this.recurrenceType, ERecurrenceType.NONE) &&
        this.noChange(this.memo, '') &&
        this.attendees.length === 1 &&
        this.attendees[0].empId === this.organizer.empId
      )
    }
  }

  public canSchedule = (): boolean => {
    const startTime = this.isAllDay ? this.startDay : this.startTime
    switch (true) {
      case this.isSending:
        return false
      case !this.endAfterStart:
        toast.open('结束时间必须晚于开始时间')
        return false
      case this.attendees && this.attendees.length > 500:
        toast.open('参与人不能超过500')
        return false
      case this.recurrenceType !== ERecurrenceType.NONE && this.isOverDay:
        toast.open('循环日程不支持跨天')
        return false
      case this.recurrenceType !== ERecurrenceType.NONE &&
        TimeUtils.getToday0Time(this.deadline) < TimeUtils.getToday0Time(startTime):
        toast.open('截止日期不可早于开始日期')
        return false
      case this.recurrenceType !== ERecurrenceType.NONE &&
        this.deadline > TimeUtils.getNextYear(startTime, 2):
        toast.open('最多可设置2年循环，请修改截止日期')
        return false
      case this.room && !this.cantBookRoom:
        toast.open(this.bookRoomMessage)
        return false
      default:
        return true
    }
  }

  public selectAttendees = async (): Promise<void> => {
    const selectedPersons = await this.selectPersonsHandler()

    if (selectedPersons) {
      const selectedPersonsOrgInfo = await EditApi.transferAccount(
        selectedPersons.map(i => i.dxUserId.toString())
      )
      this.setAttendees([...this.attendees, ...selectedPersonsOrgInfo])
    }
  }

  private initBookRule = async (): Promise<void> => {
    try {
      const bookRules = await EditApi.fetchBookRules()
      this.setBookRules(bookRules)
    } catch (err) {
      warn('[initBookRule] fail', err)
    }
  }

  private selectPersonsHandler = async (): Promise<IAttendee[]> =>
    new Promise((resolve: (Persons: []) => void): void => {
      KNB.use('dxmp.selectPersons', {
        title: '添加参与人',
        limit: 500,
        limitTip: '参与人不可超过500人',
        exceptUidArr: this.attendees.map(i => i.dxUserId || i.xmUid),
        success: ({ ret }) => {
          resolve(
            ret.map(i => ({
              name: i.name,
              dxUserId: i.uid,
              avatar: i.avatar
            }))
          )
        },
        fail: (err: Error) => {
          warn('[selectPersonsHandler] fail', err)
        }
      })
    })
}
