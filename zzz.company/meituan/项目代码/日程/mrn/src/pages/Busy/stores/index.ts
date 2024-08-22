import { action, observable, toJS } from 'mobx'
import { CommonApi, BusyApi } from '@src/apis'
import appStore from '@src/store'
import { ONE_DAY } from '@onejs/mrn'
import { IAttendee, IEventItem } from '@src/common/interfaces'
import { EApplicationsType, EChatType } from '@src/common/enums'
import { asyncAll, debug, info } from '@onejs/mrn-utils'
import { EVENT_COLORS } from '@src/common/consts'
import {
  changeTimeByQuota,
  getConflictInfos,
  getQuotaByTime,
  IConflictItem,
  initStartAndEndCurrent,
  isSameDay,
  MAX_CONFLICT_NO
} from '../util'

export interface IConflictUser {
  empId: string
  name: string
}

export interface IBusyRouteParams {
  scheduleId?: string
  appkey?: EApplicationsType
  attendees?: []
  startTime?: number
  endTime?: number
  chatType?: EChatType
  chatId?: string
  editable?: boolean
}

export class BusyStore {
  @observable loading: boolean = false
  @observable failed: boolean = false
  // 回到的起始天
  @observable currentDay: number = -1

  // 当前时间 用于更新时间轴
  @observable currentTime: number = Date.now()

  // 是否可操作
  @observable editable: boolean = false
  // 会话信息
  @observable chatId: string = null

  @observable chatType: EChatType = EChatType.Default

  // 选择的开始时间、结束时间
  @observable startTime: number = 0

  @observable endTime: number = 0

  // 选中时间段开始和结束时间
  @observable originStartTime: number = -1

  @observable originEndTime: number = -1

  // 查看日程的ID
  @observable scheduleId: string = null

  // 查看日程的类型
  @observable appKey: EApplicationsType = EApplicationsType.Schedule

  // 当前用户的日程列表
  @observable selfDetailScheduleList: IEventItem[] = []

  // 选择的使用成员
  @observable attendees: IAttendee[] = []

  // 所有群成员
  @observable groupMemberList: IAttendee[] = []

  // 关键成员
  @observable keyPerson: string[] = []

  // 计算好的冲突列表
  @observable useConflictList: IConflictItem[] = []

  @observable conflictIdList: IConflictUser[] = []

  // 开始点击、结束点击位置
  @observable startClickPos: number = -1

  @observable endClickPos: number = -1

  // 点击操作的头像 元素位置及序列号
  @observable popoverEmpId: string = null

  @observable popoverCenterX: number = 0

  @observable popoverIndex: number = -1

  @action
  setData = data => {
    /* eslint-disable guard-for-in */
    for (const key in data) {
      this[key] = data[key]
    }
  }

  @action getAllGroupMembers = async () => {
    const res = await CommonApi.groupMember(this.chatId)
    this.groupMemberList = res.memberList.map(item => {
      const { name, mis, empId, avatar, dxUserId } = item
      return {
        name,
        mis,
        empId,
        avatar,
        dxUserId
      }
    })
  }

  @action getScheduleMember = async () => {
    const res = await BusyApi.scheduleMember(this.chatId, this.chatType)
    this.attendees = res
    this.keyPerson = this.attendees.map(item => item.empId)
  }

  @action initGroup = async (chatId: string, chatType: EChatType) => {
    this.setData({
      chatId,
      chatType,
      editable: true,
      currentDay: new Date().valueOf(),
      ...initStartAndEndCurrent()
    })
    if (chatType === EChatType.GroupChat) {
      this.getAllGroupMembers()
    }
    await this.getScheduleMember()
    await this.initEvents(true)
  }

  @action initEdit = async (params: IBusyRouteParams) => {
    const { startTime, endTime } = params || {}
    // TODO: 兜底
    // if (!startTime) {
    //   startTime = Date.now()
    //   endTime = startTime + ONE_HOUR
    // }
    const startClickPos = getQuotaByTime(startTime)
    const endClickPos = getQuotaByTime(endTime)
    debug(endClickPos)
    this.setData({
      ...params,
      originStartTime: startTime,
      originEndTime: endTime,
      startClickPos,
      endClickPos: endClickPos === 0 ? 96 : endClickPos, // 处理结束时间为第二天0点的时候
      currentDay: startTime
    })
    await this.initEvents(true)
  }

  // 获取当前用户的忙闲
  @action getSelfCalendars = res => {
    this.selfDetailScheduleList = res
      .filter(
        item => item.isOverDay !== 1 && item.scheduleId !== this.scheduleId // 过滤跨天和正在编辑的当前日程
      )
      .map((item = { user: {} }) => {
        const {
          startTime,
          endTime,
          title,
          scheduleId,
          user: { empId },
          isAllDay,
          isOverDay
        } = item
        const eventItem: IEventItem = {
          id: scheduleId,
          start: startTime,
          end: endTime,
          duration: endTime - startTime,
          title,
          isAllDay,
          isOverDay,
          ownerId: empId,
          ownerName: appStore.userInfo.user?.name,
          color: EVENT_COLORS.blue
        }
        return eventItem
      })
  }

  @action busyPeriod = res => {
    const check: boolean = isSameDay(this.startTime, this.originStartTime)
    debug(check, this.startClickPos, this.endClickPos)
    this.useConflictList = getConflictInfos(res, check, this.startClickPos, this.endClickPos)
    debug(toJS(this.useConflictList))
    if (check) {
      this.conflictIdList = this.useConflictList
        .filter(item => item.isConflict)
        .map(item => ({
          empId: item.empId,
          name: item.name
        }))
      this.sortConflictList()
    }
  }

  @action sortConflictList = () => {
    const loginUserEmpId = appStore.userInfo?.user?.empId
    // 组织者排在最前面，kp排在其次，冲突接着，不冲突最后
    const list = [
      ...this.useConflictList.filter(item => item.empId === loginUserEmpId),
      ...this.useConflictList
        .filter(item => this.keyPerson.includes(item.empId) && item.empId !== loginUserEmpId)
        .sort((a, b) => {
          const aIndex = this.keyPerson.findIndex(x => x === a.empId)
          const bIndex = this.keyPerson.findIndex(x => x === b.empId)
          return aIndex - bIndex
        }),
      ...this.useConflictList.filter(
        item =>
          item.isConflict && item.empId !== loginUserEmpId && !this.keyPerson.includes(item.empId)
      ),
      ...this.useConflictList.filter(
        item =>
          !item.isConflict && item.empId !== loginUserEmpId && !this.keyPerson.includes(item.empId)
      )
    ]
    this.useConflictList = list
  }

  @action initEvents = async (nLoading?: boolean) => {
    const startTime = new Date(this.startTime).setHours(0, 0, 0, 0).valueOf()
    const endTime = startTime + ONE_DAY
    this.quickShowPersons()

    if (this.attendees.length <= MAX_CONFLICT_NO) {
      if (nLoading) {
        this.loading = true
      }
      this.failed = false
      const getCalendars = CommonApi.getCalendars({
        startTime,
        endTime,
        mtUserIds: appStore.userInfo.user?.empId,
        appKeyList: appStore.applicationList?.applicationList.map(item => item.appKey).join(',')
      })
      const busyPeriod = BusyApi.busyPeriod({
        currentScheduleId: this.scheduleId,
        currentAppKey: this.scheduleId ? this.appKey : null,
        empIdList: [...this.attendees.map(item => item.empId)],
        queryDate: this.startTime
      })
      await asyncAll([getCalendars, busyPeriod])
        .then(res => {
          this.getSelfCalendars(res[0])
          this.busyPeriod(res[1])
        })
        .catch(e => {
          this.failed = true
          info(e)
        })
        .finally(() => {
          this.loading = false
        })
    }
  }

  @action setStart = (startQuota: number) => {
    this.startClickPos = startQuota
    this.originStartTime = changeTimeByQuota(this.startTime, startQuota)
    this.endClickPos = -1
    this.originEndTime = -1
    this.conflictIdList = []
  }

  @action setEnd = (endQuota: number) => {
    this.endClickPos = endQuota
    this.originEndTime = changeTimeByQuota(this.startTime, endQuota)
    this.resetSchedule()
  }

  // 重新设置时间段
  @action
  resetSchedule = () => {
    this.useConflictList = this.useConflictList.map(item => ({
      ...item,
      isConflict: item?.busyPeriod?.slice(this.startClickPos, this.endClickPos).includes(1)
    }))
    this.conflictIdList = this.useConflictList
      .filter(item => item.isConflict)
      .map(item => ({
        empId: item.empId,
        name: item.name
      }))
  }

  @action changeDay = timeStamp => {
    this.clearList()
    this.startTime = timeStamp
    this.initEvents()
  }

  // 回到起始天
  @action backCurrentDay = () => {
    if (this.chatId !== null) {
      this.changeDay(new Date().valueOf())
    } else {
      this.changeDay(this.currentDay)
    }
  }

  @action setEmpLeft = () => {
    const index = this.keyPerson.findIndex(item => item === this.popoverEmpId)
    // 调整kp顺序
    // 无该kp者插入头
    // 有该kp先删除 再插入
    const sIndex = this.useConflictList.findIndex(item => item.empId === this.popoverEmpId)
    if (index > 0) {
      this.keyPerson.splice(index, 1)
    }
    this.keyPerson.unshift(this.popoverEmpId)
    // 调整显示顺序
    if (sIndex >= 0) {
      const item = this.useConflictList[sIndex]
      this.useConflictList.splice(sIndex, 1)
      this.useConflictList.splice(1, 0, item)
    }
    this.clearPop()
    this.groupMemberSort()
  }

  @action removeEmp = () => {
    const empId = this.popoverEmpId
    const itemIndex = this.useConflictList.findIndex(sItem => sItem.empId === empId)
    const kpIndex = this.keyPerson.findIndex(kItem => kItem === empId)
    const attendeesIndex = this.attendees.findIndex(kItem => kItem.empId === empId)
    const conflictIdIndex = this.conflictIdList.findIndex(kItem => kItem.empId === empId)
    if (itemIndex >= 0) {
      this.useConflictList.splice(itemIndex, 1)
    }
    if (kpIndex >= 0) {
      this.keyPerson.splice(kpIndex, 1)
    }
    if (attendeesIndex >= 0) {
      this.attendees.splice(attendeesIndex, 1)
    }
    if (conflictIdIndex >= 0) {
      this.conflictIdList.splice(conflictIdIndex, 1)
    }
    this.clearPop()
    this.groupMemberSort()
    // 保证从50+人口减少后重新请求日程忙闲
    this.initEvents()
  }

  // 重新设置选择人员
  @action setEmp = (attendees: IAttendee[]) => {
    this.attendees = attendees.slice()
    this.keyPerson = this.attendees.map(item => item.empId)
    this.initEvents()
    this.groupMemberSort(true)
  }

  @action clearPop = () => {
    this.setData({ popoverEmpId: null, popoverCenterX: 0, popoverIndex: -1 })
  }

  @action quickShowPersons = () => {
    const useConflictEmpIdsList = this.useConflictList.map(item => item.empId)
    const appends = this.attendees
      .filter(item => !useConflictEmpIdsList.includes(item.empId))
      .map(item => ({
        ...item,
        busyPeriod: new Array(96).fill(0),
        busy: [],
        isConflict: false
      }))

    this.useConflictList = [...this.useConflictList, ...appends]
    if (this.attendees.length > MAX_CONFLICT_NO) {
      this.conflictIdList = []
    }
  }

  // 用于切换时间情空已有的列表数据
  @action clearList = () => {
    this.selfDetailScheduleList = []
    this.useConflictList = this.attendees.map(item => ({
      ...item,
      busyPeriod: new Array(96).fill(0),
      busy: [],
      isConflict: false
    }))
  }

  // 群日程创建成功后刷新
  @action refreshBack = () => {
    this.setData({
      startClickPos: -1,
      endClickPos: -1,
      originStartTime: -1,
      originEndTime: -1,
      conflictIdList: []
    })
    this.initEvents()
  }

  groupMemberSort = (byAttendees?: boolean) => {
    if (this.chatType === EChatType.GroupChat) {
      const loginUserEmpId = appStore.userInfo?.user?.empId
      const empList = byAttendees ? this.attendees : this.useConflictList
      const empIds = empList.map(item => item.empId).filter(item => item !== loginUserEmpId)
      BusyApi.groupMemberSort({
        empIds: [loginUserEmpId, ...empIds],
        chatId: this.chatId,
        chatType: this.chatType
      })
    }
  }
}
