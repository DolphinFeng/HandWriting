import { computed } from 'mobx'
import { AppStore } from '@src/store'
import { EApplicationsType, EFeedbackType, ERoleType } from '@src/common/enums'
import { toast } from '@onejs/mrn-components'
import { debug, warn } from '@onejs/mrn-utils'
import { INavigation } from '@src/common/interfaces'
import { DetailStore } from '../../stores'
import { IScheduleDetail } from '../../interfaces'
import { detailApi } from '../../apis'
import { IChat } from '../../apis/interfaces'

export class OperationStore {
  constructor(
    private appStore: AppStore,
    private detailStore: DetailStore,
    private navigation: INavigation
  ) {
    //
    debug(this.currentUser)
    debug(this.scheduleUser)
  }

  @computed
  public get schedule() {
    // eslint-disable-next-line react/destructuring-assignment
    const { schedule = {} as IScheduleDetail } = this.detailStore
    return schedule
  }

  @computed
  public get currentUser() {
    // eslint-disable-next-line react/destructuring-assignment
    const { user } = this.appStore?.userInfo || {}
    return user
  }

  @computed
  public get scheduleUser() {
    // eslint-disable-next-line react/destructuring-assignment
    const { scheduleUser } = this.detailStore
    return scheduleUser
  }

  @computed
  public get roleType() {
    const { roleType } = this.schedule?.role || {}
    return roleType
  }

  // 检测是否为循环日程
  @computed
  public get isCyclicSchedule() {
    const { isCyclic } = this.schedule
    return isCyclic === 1
  }

  // 是否为创建者
  @computed
  public get isOrgnizer() {
    return this.roleType === ERoleType.ORGANIZER
  }

  @computed
  public get isAttendee() {
    const { attendees = [] } = this.schedule
    const attended = attendees.find(a => a.empId === this.currentUser.empId)
    return this.roleType === ERoleType.ATTENDEE && attended
  }

  // 是否为已开始的会议
  @computed
  public get isStartedMeeting() {
    const { locationId, startTime } = this.schedule
    return !!locationId && Date.now() >= startTime
  }

  // 是否为内部日程
  @computed
  public get isInnerSchedule() {
    const { appKey } = this.schedule
    return (
      EApplicationsType.Schedule === appKey ||
      EApplicationsType.Meeting === appKey ||
      EApplicationsType.Promotionapi === appKey
    )
  }

  @computed
  public get isOutedSchedule() {
    return !this.isInnerSchedule
  }

  // 是否已拒绝
  @computed
  public get isRefused() {
    const { feedback } = this.schedule
    return feedback === EFeedbackType.Refuse
  }

  @computed
  public get disableCancleSchedule() {
    // 不可以取消日程的逻辑: 非创建者 || 是会议但已开始 || 是外部系统日程
    return !this.isOrgnizer || this.isStartedMeeting || this.isOutedSchedule
  }

  @computed
  public get enableCancleSchedule() {
    return !this.disableCancleSchedule
  }

  // 可以取消参与的逻辑: 是参与者 && 未拒绝
  @computed
  public get enableCancleAttendSchedule() {
    return this.isAttendee && !this.isRefused
  }

  handleCancled = () => {
    const { navigation } = this
    toast.open('取消成功')
    setTimeout(() => navigation.back(), 1000)
  }

  // 删除日程
  handleCancleSchedule = async () => {
    const { id } = this.schedule
    await detailApi.cancleSchedule(id)
    this.handleCancled()
  }

  // 删除循环日程
  handleCancleCyclicSchedule = async () => {
    const { id, recurrenceScheduleId } = this.schedule
    await detailApi.cancleCyclicSchedule(id, recurrenceScheduleId)
    this.handleCancled()
  }

  // 拒绝参与日程
  handleCancleAttendSchedule = async () => {
    const { id, appKey } = this.schedule
    await detailApi.cancleAttendSchedule({
      scheduleId: id,
      appKey,
      extension: appKey === EApplicationsType.Exchange ? 'e' : '',
      feedbackType: EFeedbackType.Refuse
    })
    this.handleCancled()
  }

  // 拒绝参与循环日程
  handleCancleAttendCyclicSchedule = async () => {
    const { id, recurrenceScheduleId, appKey } = this.schedule
    await detailApi.cancleAttendCyclicSchedule({
      scheduleId: id,
      recurrenceScheduleId,
      appKey,
      extension: appKey === EApplicationsType.Exchange ? 'e' : '',
      feedbackType: EFeedbackType.Refuse
    })
    this.handleCancled()
  }

  handleShareSchedule = async (chatList: IChat[]) => {
    const { id, appKey } = this.schedule
    const { empId } = this.scheduleUser
    try {
      await detailApi.shareSchedule({
        chatList,
        scheduleId: id,
        appKey,
        organizerEmpId: empId
      })

      toast.open('分享成功')
    } catch (state) {
      warn('Share Schedule', state)
      toast.open('分享失败，请重试')
    }
  }
}
