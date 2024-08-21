/*
 * @Description: 文件描述
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-06-09 15:22:54
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-12-28 14:59:49
 * @FilePath: /scheduleweb/src/pages/newWeekly/store/detail.ts
 */

import { observable, action } from 'mobx';
import {
  ERoleType,
  IPersonInfo,
  IFeedbackCount,
  IVideoMeetingInfoVo,
  EFeedbackType
} from '@/consts/type';
import { DEFAULT_REC_PATTERN, IRecurrencePattern } from '@/consts/recurrenceType';

export interface IRoleType {
  roleType: ERoleType;
}

export default class DetailStore {
  // 是否展示详情pop
  @observable showDetailPop = false;

  // 能否编辑（不包含第三方的日程）
  @observable canEdit = 0;
  // 能否删除
  @observable canCancel = 0;

  // 能否添加参与人
  @observable canAddAttendee = 0;

  // 能否反馈
  @observable canFeedback = 0;

  // 能否释放和转移会议室
  @observable canMeetingRelease= 0;
  @observable canMeetingTransfer= 0;

  // 能否分享（后端层面，前端还需要额外关注容器）
  @observable canShare = 0;

  // 是否显示视频会议和问卷入口
  @observable canSurvey: 0 | 1 = 0;

  // 应用key
  @observable appKey = '';

  // 开始时间
  @observable startTime = 0;

  @observable startDate = 0;

  // 结束时间

  @observable endTime = 0;

  @observable endDate = 0;

  // Id
  @observable scheduleId = '';

  // 员工Id
  @observable empId: string;

  // 标题
  @observable title = '';

  @observable name = '';

  // 全天日程
  @observable isAllDay = 0;

  // 循环日程
  @observable isCyclic = 0;

  // 循环日程Id
  @observable recurrenceScheduleId = '';

  // 地址
  @observable location = '';

  @observable roomInfo: any = {};

  // 群日程
  @observable chatInfo: any = {};

  // 会议室名称
  @observable roomName = '';

  // 会议室Id
  @observable locationId = '';

  // 会议室邮箱
  @observable locationMail = '';

  // 会议室跳转的地图链接

  @observable locationUrl = '';

  // 组织者
  @observable organizer: IPersonInfo = null;

  @observable creator: IPersonInfo = null;

  // 日程关联角色
  @observable role: IRoleType;

  // 参与者
  @observable attendees: IPersonInfo[] = [];

  @observable vcardAttendees: IPersonInfo[] = [];

  // 备注
  @observable memo = '';

  // 变更记录
  @observable modifyLog: any = [];

  // 反馈统计
  @observable feedbackCountList: IFeedbackCount[] = [];

  // 外部会议编辑的跳转链接
  @observable targetUrl = '';

  // 提醒规则名称
  @observable noticeDescription = '';

  // 重复规则名称
  @observable recurrenceDescription = '';

  // 冲突列表
  @observable conflictPersons: string[] = [];

  // 用于循环规则截止时间等
  @observable noticeType: any;

  @observable noticeRule: any;

  // 循环规则
  @observable recurrencePattern: IRecurrencePattern;

  // 截止时间
  @observable deadline: number;

  // 图片跳转链接
  @observable roomLocationUrl: string;

  // 反馈状态
  @observable feedback: EFeedbackType;

  @observable videoMeetingInfoVo: IVideoMeetingInfoVo;

  @observable applicationId;

  @observable applicationName: string;

  @action
  setData = (data) => {
    for (const key in data) {
      this[key] = data[key];
    }
  };
  // 清除详情页数据，并且关闭详情页
  @action
  closeDetailPop = () => {
    window.nDxScheduleId = null;
    this.setData({
      scheduleId: null,
      showDetailPop: false,
      conflictPersons: [],
      feedbackCountList: [],
      feedback: EFeedbackType.Default,
      attendees: [],
      memo: '',
      appKey: '',
      startTime: 0,
      endTime: 0,
      title: '',
      isAllDay: 0,
      isCyclic: 0,
      recurrenceScheduleId: '',
      location: '',
      roomName: '',
      roomInfo: {},
      locationId: '',
      locationMail: '',
      locationUrl: '',
      organizer: null,
      role: null,
      noticeDescription: '',
      recurrenceDescription: '',
      targetUrl: '',
      noticeType: null,
      recurrencePattern: DEFAULT_REC_PATTERN,
      roomLocationUrl: '',
      deadline: 0,
      videoMeetingInfoVo: null,
      applicationId: 0,
      applicationName: '',
      canEdit: 0,
      canCancel: 0,
      canAddAttendee: 0,
      canFeedback: 0,
      canMeetingRelease: 0,
      canMeetingTransfer: 0,
      canShare: 0,
      canSurvey: 0
    });
  };
}
