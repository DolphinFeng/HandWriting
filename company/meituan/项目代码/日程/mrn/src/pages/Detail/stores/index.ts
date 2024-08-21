import { action, computed, observable } from 'mobx'
import { warn } from '@onejs/mrn-utils'
import { EApplicationsType } from '@src/common/enums'
import { detailApi } from '../apis'
import { IErrorInfo, IScheduleDetail } from '../interfaces'
import { IFetchConflictsParams } from '../apis/interfaces'
import { filterOrgnizerInAttendees } from '../adaptors/filterOrgnizerInAttendees'

interface IScheduleInfo {
  scheduleId: string
  appKey: string
  empId: string // 本日程所属人
  source?: string
}

interface IFetchScheduleParams extends IScheduleInfo {}

export class DetailStore {
  @observable
  public fetching = true
  @observable
  public schedule: IScheduleDetail = {} as IScheduleDetail
  @observable
  public errorInfo: IErrorInfo = null

  @observable
  public conflictFetching = true
  @observable
  public conflicts: string[] = [] // mis号列表

  @observable
  public scheduleInfo = {} as IScheduleInfo

  @computed
  public get hasSchedule() {
    if (this.schedule?.id) {
      return true
    }
    return false
  }

  @computed
  public get scheduleUser() {
    const { empId } = this.scheduleInfo
    return { empId }
  }

  @action
  public setSchedule = (schedule: IScheduleDetail) => {
    this.schedule = schedule
  }

  @action
  public setConflicts = (conflicts: string[]) => {
    this.conflicts = conflicts
  }

  @action
  public setScheduleInfo = (scheduleInfo: IScheduleInfo) => {
    this.scheduleInfo = scheduleInfo
  }

  @action
  private setFetching = (fetching: boolean) => {
    this.fetching = fetching
  }

  @action
  private setConflictFetching = (fetching: boolean) => {
    this.fetching = fetching
  }

  @action
  private setErrorInfo = (err: IErrorInfo) => {
    this.errorInfo = err
  }

  /**
   * @param appKey 日程类型
   * @param empId 日程查看角色
   * @param scheduleId 日程ID
   * @returns void
   */
  public init = async (params: {
    appKey: string
    empId: string
    scheduleId: string
    source: string // 来源，用于区分入口来源，如果是message_link,则需要处理循环日程被更新导致scheduleId删除的情形
  }) => {
    const { appKey, empId, scheduleId, source } = params
    this.setScheduleInfo({ appKey, empId, scheduleId, source })

    await this.fetchSchedule({ appKey, empId, scheduleId, source })
    if (!this.schedule?.appKey) {
      return
    }

    // 获取冲突列表
    const { id, attendees, organizer, startTime, endTime } = this.schedule
    const empIdList = [organizer.empId, ...attendees.map(a => a.empId)]

    await this.fetchConflicts({
      scheduleId: id,
      currentAppKey: appKey,
      empIdList,
      startTime,
      endTime
    })
  }

  public fetchSchedule = async (params: IFetchScheduleParams) => {
    const { scheduleId, appKey = 'schedule', empId, source } = params

    this.setFetching(true)
    let schedule: IScheduleDetail = null

    try {
      let fetchScheduleMethod = detailApi.fetchSchedule
      if (source === 'message_link') {
        fetchScheduleMethod = detailApi.fetchScheduleNew
      }

      schedule = await fetchScheduleMethod({
        scheduleId,
        appKey,
        empId,
        extension: appKey === EApplicationsType.Exchange ? 'e' : ''
      })

      this.setSchedule(filterOrgnizerInAttendees(schedule))
      // 更新id
      const { id } = schedule
      this.setScheduleInfo({
        ...this.scheduleInfo,
        scheduleId: id
      })
    } catch (state) {
      const { data } = state.result
      this.setErrorInfo(data)
      warn('fetch schedule fail', params)
    } finally {
      this.setFetching(false)
    }
  }

  public fetchConflicts = async (params: IFetchConflictsParams) => {
    let conflicts: string[] = []
    this.setConflictFetching(true)
    try {
      conflicts = await detailApi.fetchConflicts(params)
      if (!Array.isArray(conflicts)) {
        conflicts = []
      }
      this.setConflicts(conflicts)
    } catch (err) {
      warn('fetch conflicts', params)
    } finally {
      this.setConflictFetching(false)
    }
  }
}
