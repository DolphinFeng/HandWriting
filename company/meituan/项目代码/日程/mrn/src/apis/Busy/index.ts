import { R } from '@src/utils/request'
import { apiPrefix } from '@src/common/consts'
import { IScheduleResponse } from '@src/common/interfaces'

class BusyApi {
  // 排序的成员列表
  scheduleMember = async (chatId, chatType): Promise<any> => {
    const res = await R.request<IScheduleResponse>({
      method: 'GET',
      path: `${apiPrefix}/group/schedule/member`,
      searchParams: {
        chatId,
        chatType
      }
    })

    return res.result.data
  }

  // 查看忙闲
  /**
   *
   * @param data
   * currentAppKey 编辑时候排除的日程类型
   * currentScheduleId  编辑时候排除的日程ID
   * empIdList 人员列表
   * queryDate 查看的世界
   * @returns
   */
  busyPeriod = async (data): Promise<any> => {
    const res = await R.request<IScheduleResponse>({
      method: 'POST',
      path: `${apiPrefix}/schedules/conflict/busy/period`,
      data
    })

    return res.result.data
  }

  /**
   * 群成员排序
   * @param data
   * empIds
   * chatId
   * chatType
   * @returns
   */
  groupMemberSort = async (data): Promise<any> => {
    const res = await R.request<IScheduleResponse>({
      method: 'POST',
      path: `${apiPrefix}/group/schedule/member/sort`,
      data
    })
    // withErrorMessage: false
    return res.result.data
  }
}

export default new BusyApi()
