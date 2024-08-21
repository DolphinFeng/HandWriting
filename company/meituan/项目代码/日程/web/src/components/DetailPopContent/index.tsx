import React from 'react';
import { inject, observer } from 'mobx-react';
import { pageView } from 'onejs/lx';
import { action, observable } from 'mobx';
import dayjs from 'dayjs';
import DetailStore from '@/pages/newWeekly/store/detail';
import GlobalStore from '@/store/global';
import { EPageType } from '@/consts';
import {
  getSchedules,
  getScheduleCount,
  getScheduleConflicts
} from '@/services/weekly';
import { addModuleClick, addModuleView } from '@/services/lxService';
import { MAX_CONFLICT_NO } from '@/utils';
import DetailPopHeader from './DetailPopHeader';
import { DetailPopBody } from './DetailPopBody/index';
import { getSchedulesMonthly } from '@/services/monthly';
import styles from './index.less';
import { IPublicCalendar } from '@/pages/newMonthly/store/month';

export interface IDetailPopContent {
  detail?: DetailStore;
  week?: any;
  pageType?: EPageType;
  appKey: string;
  startTime: number;
  scheduleId: string;
  calendarId?: string;
  endTime: number;
  isCyclic: number; // 0, 1
  ownerName: string;
  location?: string;
  isAllDay?: number;
  global?: GlobalStore;
  title?: string;
  applicationId?: number;
  calendarSetId?: string;
  calendarListInMonth: IPublicCalendar[];
  forceAlignCb?: () => void;
  closePop?: () => void; // 新会议室会传递这个参数过来
}

@inject('detail', 'global', 'week')
@observer
export default class DetailPopContent extends React.Component<IDetailPopContent> {
  @observable hasRequestFinish = false;

  @observable isPublicCalendar = false;

  @observable publicName = '';

  constructor(props) {
    super(props);
    const {
      week: {
        scheduleSourcePanelStore: {
          publicCalendarList
        }
      },

      detail: {
        setData,
      },
      applicationId,
      calendarListInMonth,
      calendarSetId
    } = this.props;
    const publicItem = calendarSetId
      ? calendarListInMonth?.find(item => item.calendarId === applicationId)
      : publicCalendarList.find(item => item.calendarId === applicationId);
    this.setPublicInfos(!!publicItem, publicItem?.appName);
    setData({ ...this.props });
  }

  @action setPublicInfos = (nPublic, name) => {
    this.isPublicCalendar = nPublic;
    this.publicName = name;
  };

  componentDidMount() {
    const {
      global: { currentUser },
      endTime
    } = this.props;
    this.getDetailPopData();
    this.contanierObserver();
    // 日程详情卡片页面
    pageView('c_oa_h7eboyol', {
      userMis: currentUser?.mis
    });
    if (dayjs().valueOf() > endTime) {
      // 点击已过去日程查看详情
      addModuleClick('b_oa_wwqlzulw_mc');
    }
  }

  popDiv;

  contanierObserver = () => {
    let recordHeight = 0;
    const mutationObserver = new MutationObserver(() => {
      if (!this.popDiv) {
        return;
      }
      const { height } = this.popDiv.getBoundingClientRect();
      if (height === recordHeight) {
        return;
      }
      recordHeight = height;
      // 其它的forceAlignCb是不是可以删除了
      if (this.props.forceAlignCb) {
        this.props.forceAlignCb();
      }
    });
    mutationObserver.observe(this.popDiv, {
      childList: true,
      attributes: true,
      characterData: true,
      subtree: true
    });
  };

  preventDefault = (e) => {
    e = e || window.event;
    if (e.preventDefault) e.preventDefault();
    e.returnValue = false;
  };

  // 获取日程详细信息
  getDetailPopData = async () => {
    await this.getSchedules();
    this.hasRequestFinish = true;
    const {
      week: {
        scheduleSourcePanelStore: {
          publicCalendarList
        }
      },
      detail: {
        applicationId
      },
      calendarListInMonth,
      calendarSetId
    } = this.props;
    const publicItem = calendarSetId
      ? calendarListInMonth?.find(item => item.calendarId === applicationId)
      : publicCalendarList.find(item => item.calendarId === applicationId);
    this.setPublicInfos(!!publicItem, publicItem?.appName);
    if (!this.isPublicCalendar) {
      const scheduleCount = this.getScheduleCount();
      const scheduleConflict = this.getScheduleConflicts();
      await Promise.all([scheduleCount, scheduleConflict]);
    }
    setTimeout(() => {
      if (this.props.forceAlignCb) {
        this.props.forceAlignCb();
      }
    }, 0);
  };

  // 获取日程信息
  getSchedules = async () => {
    const {
      scheduleId, appKey, calendarId, detail, pageType, calendarSetId
    } = this.props;

    const details = !calendarSetId
      ? await getSchedules(
        scheduleId,
        calendarId,
        appKey,
        pageType === EPageType.MEETING ? null : detail.empId // 会议室打开不传empId默认自己
      )
      : await getSchedulesMonthly(calendarSetId, scheduleId);
    const {
      id, applicationId, canCancel, appKey: appKeyGet
    } = details;
    details.canDel = canCancel;
    details.scheduleId = id;
    details.roomName = details.roomInfo?.roomId ? `${details.roomInfo.roomName} ${details.roomInfo.floorName} ${details.roomInfo.buildingName}` : details.roomName;
    this.props.detail.setData(details);
    addModuleView('b_oa_lxhwa39f_mv', {
      scheduleId: id,
      calendarId: applicationId,
      appKey: appKeyGet
    });
  };

  // 获取日程信息反馈
  getScheduleCount = async () => {
    const {
      scheduleId, appKey, detail, pageType
    } = this.props;
    const detailFeedback = await getScheduleCount(
      scheduleId,
      appKey,
      pageType === EPageType.MEETING ? null : detail.empId
    );
    this.props.detail.setData({
      feedbackCountList: detailFeedback ? detailFeedback.feedbackCountList : []
    });
  };

  // 获取日程冲突人员信息
  getScheduleConflicts = async () => {
    const {
      scheduleId, appKey, startTime, endTime
    } = this.props;
    const { organizer, attendees } = this.props.detail;
    const organizerList = organizer ? [organizer.empId] : [];
    const attendeesList = attendees ? attendees.map(item => item.empId) : [];
    const empIdList = [...organizerList, ...attendeesList];
    if (empIdList.length <= MAX_CONFLICT_NO) {
      const params = {
        startTime,
        endTime,
        currentAppKey: appKey,
        empIdList
      };
      const conflictPersons = await getScheduleConflicts(scheduleId, params);
      this.props.detail.setData({ conflictPersons });
    }
  };

  // 关闭弹层的逻辑处理， 增加了是会议室页面还是日程列表页的区分；
  // 不同页面关闭和刷新逻辑不一样
  closePop = () => {
    const { pageType } = this.props;
    if (pageType === EPageType.MEETING) {
      const {
        closePop
      } = this.props;
      if (closePop) {
        // 新会议室
        closePop();
      }
    } else {
      const { closeDetailPop } = this.props.detail;
      const { initScheduleList } = this.props.week;
      closeDetailPop();
      initScheduleList();
    }
  };

  stopPagination = (e) => {
    e.stopPropagation();
  };

  render() {
    // 兼容大部分抖动现象， 只有备注或者人员超过1行的时候会抖动
    const {
      location, isCyclic, ownerName, pageType, calendarSetId
    } = this.props;
    let minAddHeight = 0;
    if (location || pageType === EPageType.MEETING) {
      // 就是 appKey 为meeting的情况 会议室地址
      minAddHeight += 35;
    }
    if (isCyclic) {
      minAddHeight += 35;
    }
    return (
      <div
        ref={(ref) => {
          this.popDiv = ref;
        }}
        className={styles.popContent}
        onClick={this.stopPagination}
      >
        {/* 详情头部 */}
        <DetailPopHeader
          pageType={pageType}
          closePop={this.closePop}
          hasRequestFinish={this.hasRequestFinish}
          isPublicCalendar={this.isPublicCalendar}
          isInMonthly={!!calendarSetId}
          publicName={this.publicName}
          ownerName={ownerName}
        />
        {/* 详情主体内容 */}
        <DetailPopBody
          isPublicCalendar={this.isPublicCalendar}
          closePop={this.closePop}
          minAppendHeight={minAddHeight}
          forceAlignCb={this.props.forceAlignCb}
        />
      </div>
    );
  }
}
