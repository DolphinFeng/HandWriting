import ajax, { prefix } from './ajax';

export enum EUmeetDuration {
  LIMITED = 'limited',
  UNLIMITED = 'unlimited'
}

interface ICreateUmeetDuration {
  meetingDuration: EUmeetDuration;
  scheduleId: string;
}

// 获取会议室列表账号
export async function createVideoMeeting(params: ICreateUmeetDuration) {
  return ajax.post(
    `${prefix}/schedule/videoMeeting/create/${params.scheduleId}`,
    params
  );
}

export async function survey(scheduleId: string) {
  return ajax.get(`${prefix}/schedule/survey?scheduleId=${scheduleId}`);
}
