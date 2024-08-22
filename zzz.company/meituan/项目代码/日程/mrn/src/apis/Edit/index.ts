import { R } from '@src/utils/request'
import { apiPrefix } from '@src/common/consts'
import { EApplicationsType } from '@src/common/enums'
import { IAttendee, IScheduleResponse } from '@src/common/interfaces'
import {
  IGetScheduleDetailParmas,
  ICreateScheduleParams,
  IScheduleDetail,
  IAccount
} from './interface'

class EditApi {
  fetchBookRules = async (): Promise<any> => {
    const res = await R.request<IScheduleResponse>({
      method: 'GET',
      path: `${apiPrefix}/getBookRules`
    })

    return res.result.data
  }

  // 大象UID转ORG员工信息
  transferAccount = async (data: string[]): Promise<IAttendee[]> => {
    const res = await R.request<IScheduleResponse<IAttendee[]>>({
      method: 'POST',
      path: `${apiPrefix}/account/transfer`,
      data: {
        xmUidList: data
      }
    })

    return res.result.data
  }

  // 根据输入来查找与会人
  searchAccount = async (data: string): Promise<IAccount[]> => {
    const res = await R.request<IScheduleResponse<IAccount[]>>({
      method: 'POST',
      path: `${apiPrefix}/meeting/dataset/account`,
      data: {
        filter: data
      }
    })

    return res.result.data
  }

  // 参与人添加参与人
  addAttendees = async (data: any, scheduleId: string): Promise<any> => {
    const res = await R.request<IScheduleResponse<IAccount[]>>({
      method: 'POST',
      path: `${apiPrefix}/schedules/attendances/${scheduleId}`,
      data
    })

    return res.result
  }

  // 参与人添加循环日程参与人
  addRecurrentAttendees = async (
    data: any,
    recurrenceScheduleId: string,
    scheduleId: string
  ): Promise<any> => {
    const res = await R.request<IScheduleResponse<IAccount[]>>({
      method: 'POST',
      path: `${apiPrefix}/schedules/attendances/recurrence/${recurrenceScheduleId}/currentSchedule/${scheduleId}`,
      data
    })

    return res.result
  }

  // 创建日程
  createSchedule = async (data: ICreateScheduleParams): Promise<any> => {
    const res = await R.request<IScheduleResponse>({
      method: 'POST',
      path: `${apiPrefix}/schedules`,
      data
    })

    return res.result.data
  }

  // 编辑日程
  editSchedule = async (
    data: ICreateScheduleParams,
    scheduleId: string
  ): Promise<IScheduleDetail> => {
    const res = await R.request<IScheduleResponse<IScheduleDetail>>({
      method: 'PUT',
      path: `${apiPrefix}/schedules/${scheduleId}`,
      data
    })

    return res.result.data
  }

  // 编辑循环日程
  editRecurrenceSchedule = async (
    data: ICreateScheduleParams,
    recurrenceScheduleId: string,
    scheduleId: string
  ): Promise<IScheduleDetail> => {
    const res = await R.request<IScheduleResponse<IScheduleDetail>>({
      method: 'PUT',
      path: `${apiPrefix}/schedules/recurrence/${recurrenceScheduleId}/currentSchedule/${scheduleId}`,
      data
    })

    return res.result.data
  }

  // 获取日程详情
  getScheduleDetail = async (parmas: IGetScheduleDetailParmas): Promise<any> => {
    const { scheduleId, appKey, ...rest } = parmas
    const res = await R.request<IScheduleResponse>({
      method: 'GET',
      path: `${apiPrefix}/schedules/${scheduleId}`,
      searchParams: {
        appKey,
        extension: appKey === EApplicationsType.Exchange ? 'e' : '',
        ...rest
      }
    })

    return res.result.data
  }
}

export default new EditApi()
