import { R } from '@src/utils/request'
import { apiPrefix } from '@src/common/consts'
import { IScheduleResponse } from '@src/common/interfaces'

class CommonApi {
  // 获取当前用户信息
  getUserInfo = async (): Promise<any> => {
    const res = await R.request<IScheduleResponse>({
      method: 'GET',
      path: `${apiPrefix}/userinfo`
    })
    return res.result.data
  }

  // 获取日程来源列表
  getApplications = async (): Promise<any> => {
    const res = await R.request<IScheduleResponse>({
      method: 'GET',
      path: `${apiPrefix}/applications`
    })
    return res.result.data
  }

  // 获取指定时间段 指定人 指定日程来源的所有日程列表
  // 用于日程列表和冲突日历个人日程展示
  // params:
  // startTime, endTime, mtUserIds, appKeyList
  getCalendars = async (params): Promise<any> => {
    const res = await R.request<IScheduleResponse>({
      method: 'GET',
      path: `${apiPrefix}/calendars`,
      searchParams: params
    })
    return res.result.data
  }

  // 所有群成员列表
  groupMember = async (gid): Promise<any> => {
    const res = await R.request<IScheduleResponse>({
      method: 'POST',
      path: `${apiPrefix}/group/member`,
      data: {
        gid
      }
    })
    return res.result.data
  }
}

// export an instance of textApi
export default new CommonApi()
