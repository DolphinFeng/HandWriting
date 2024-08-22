import { R } from '@src/utils/request'
import { debug } from '@onejs/mrn-utils'
import { apiPrefix } from '@src/common/consts'
import { IScheduleResponse } from '@src/common/interfaces'
import {
  ICancleAttendCyclicScheduleParams,
  ICancleAttendScheduleParams,
  IFetchConflictsParams,
  IFetchScheduleParams,
  IShareScheduleParams
} from './interfaces'
import { IScheduleDetail } from '../interfaces'

export class DetailApi {
  // 获取详情
  fetchSchedule = async (params: IFetchScheduleParams): Promise<IScheduleDetail> => {
    const { scheduleId, ...restParams } = params
    debug('=====================start fetch schedule=====================')
    const res = await R.request<IScheduleResponse<IScheduleDetail>>({
      method: 'GET',
      path: `${apiPrefix}/schedules/${scheduleId}`,
      searchParams: restParams,
      toast: {
        fail: false
      }
    })

    /**
     * 失败message （rescued: 1）
     *  - 权限不匹配，拒绝操作
     *  - 该日程已失效
     */
    debug('fetch schedule detail', res)
    return res.result.data
  }

  // 获取详情
  fetchScheduleNew = async (params: IFetchScheduleParams): Promise<IScheduleDetail> => {
    const { scheduleId, ...restParams } = params
    debug('=====================start fetch schedule new=====================')
    const res = await R.request<IScheduleResponse<IScheduleDetail>>({
      method: 'GET',
      path: `${apiPrefix}/message/link/schedules/${scheduleId}`,
      searchParams: restParams,
      toast: {
        fail: false
      }
    })

    /**
     * 失败message （rescued: 1）
     *  - 权限不匹配，拒绝操作
     *  - 该日程已失效
     */
    debug('fetch schedule detail', res)
    return res.result.data
  }

  // 获取冲突人员
  fetchConflicts = async (params: IFetchConflictsParams): Promise<string[]> => {
    const { scheduleId, currentAppKey, empIdList, startTime, endTime } = params
    const res = await R.request<IScheduleResponse<string[]>>({
      method: 'POST',
      path: `${apiPrefix}/schedules/${scheduleId}/detail/conflicts`,
      data: {
        currentAppKey,
        empIdList,
        startTime,
        endTime
      },
      toast: {
        fail: undefined
      }
    })

    debug('fetch confilicts', res)
    return res.result.data
  }

  // 删除日程
  cancleSchedule = async (scheduleId: string) => {
    const res = await R.request<IScheduleResponse<any>>({
      method: 'DELETE',
      path: `${apiPrefix}/schedules/${scheduleId}`
    })

    debug('cancle schedule', res)
    return res.result.data
  }

  // 删除循环日程
  cancleCyclicSchedule = async (currentScheduleId: string, recurrenceScheduleId: string) => {
    const res = await R.request<IScheduleResponse<any>>({
      method: 'DELETE',
      path: `${apiPrefix}/schedules/recurrence/${recurrenceScheduleId}/currentSchedule/${currentScheduleId}`
    })

    debug('cancle cycle schedule', res)
    return res.result.data
  }

  // 拒绝参与日程
  cancleAttendSchedule = async (params: ICancleAttendScheduleParams) => {
    const { scheduleId, appKey, extension, feedbackType } = params
    const res = await R.request<IScheduleResponse<any>>({
      method: 'POST',
      path: `${apiPrefix}/schedules/feedback/${scheduleId}`,
      data: {
        appKey,
        scheduleId,
        extension,
        feedbackType
      }
    })

    debug('cancle attend schedule', res)
    return res.result.data
  }

  // 拒绝参与循环日程
  cancleAttendCyclicSchedule = async (params: ICancleAttendCyclicScheduleParams) => {
    const { appKey, scheduleId, recurrenceScheduleId, feedbackType, extension } = params
    const res = await R.request<IScheduleResponse<any>>({
      method: 'POST',
      path: `${apiPrefix}/schedules/feedback/recurrence/${recurrenceScheduleId}/currentSchedule/${scheduleId}`,
      data: {
        appKey,
        scheduleId,
        recurrenceScheduleId,
        feedbackType,
        extension
      }
    })

    debug('cancle attend cycle schedule', res)
    return res.result.data
  }

  // 分享日程
  shareSchedule = async (params: IShareScheduleParams) => {
    const res = await R.request<IScheduleResponse<any>>({
      method: 'POST',
      path: `${apiPrefix}/schedules/share`,
      data: params,
      toast: {
        fail: false
      }
    })
    debug('share schedule', res)
    return res.result.data
  }
}

export const detailApi = new DetailApi()
