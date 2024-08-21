/*
 * 会议室服务接口
 */
import ajax from './ajax';

const prefix = '/meeting/api/pc/room/appointment';

/**
 * 接口 [获取预定规则] 的 **请求类型**
 * @请求头 `POST /meeting/api/pc/room/appointment/findBookRuleByBuildingId`
 */
interface FindBookRuleByBuildingIdRequest {
  buildingId?: number;
}

/**
 * 接口 [获取预定规则] 的 **返回类型**
 * @请求头 `POST /meeting/api/pc/room/appointment/findBookRuleByBuildingId`
 */
interface FindBookRuleByBuildingIdResponse {
  /** 可预定最大天数 */
  dayBookLimit?: number;
  /** 最大可预定时间（分钟） */
  maxSpan?: number;
  /** 最小可预定时间（分钟） */
  minSpan?: number;
  roomMeanwhileLimit?: number;
  meetingCountLimit?: number;
  /** 培训会议室弹窗提示文案，当没有时后端返回null */
  trainRoomsTips: string;
  /** 特殊大厦下会议室预定卡片的提示 */
  buildingBookTips?: string;
  /** 特殊大厦下会议室预定卡片的提示 */
  specialRoomsTips?: object;
}

/** 获取预订规则 */
export async function getBookRules(
  params: FindBookRuleByBuildingIdRequest
): Promise<FindBookRuleByBuildingIdResponse> {
  return ajax.post(`${prefix}/findBookRuleByBuildingId`, params);
}
