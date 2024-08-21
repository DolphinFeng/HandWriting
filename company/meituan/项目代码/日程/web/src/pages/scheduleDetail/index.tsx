import { i18nClient } from '@sailor/i18n-web';
import React, { Component } from 'react';
import GlobalStore from '@/store/global';
import DetailStore from '@/pages/newWeekly/store/detail';
import { Icon, Tooltip, Button } from '@ss/mtd-react';
// import { observable } from 'mobx';
import { EPageType } from '@/consts';
import { pageView } from 'onejs/lx';
import { EApplicationsType, EPerformancePosition } from '@/consts/type';
import { inject, observer } from 'mobx-react';
import { getEnname, MAX_CONFLICT_NO } from '@/utils';
import {
  getPcSchedules,
  getScheduleCount,
  getScheduleConflicts
} from '@/services/weekly';

import dx from '@/utils/dxCalendar';
import SchedulDetailPage from '@/components/ScheduleDetailPage';
import ScheduleDetailHeader from '@/components/ScheduleDetailHeader';
import DetailTop from './DetailTop';
import DetailBottom from './DetailBottom';
// import DetailContent from './DetailContent';

import styles from './index.less';

export interface IScheduleDetailContentProps {
  detail?: DetailStore;
  week?: any;
  pageType?: EPageType;
  appKey: string;
  startTime: number;
  scheduleId: string;
  endTime: number;
  isCyclic: number; // 0, 1
  isAllDay: number; // 0 1
  ownerName: string;
  location?: string;
  global?: GlobalStore;
  match: any;
  title?: string;
  forceAlignCb?: () => void;
}
interface IBgColorAndName {
  name: string;
  colors: string[];
  isBlackTheme?: boolean;
}
interface IScheduleDetailState {
  finish: boolean;
  failed: boolean;
}

@inject('detail', 'global', 'week')
@observer
export default class extends Component<
IScheduleDetailContentProps,
IScheduleDetailState
> {
  constructor(props) {
    super(props);

    this.state = {
      finish: false,
      failed: false
    };
    // 上报页面性能
    const { reportPage } = this.props.global;
    reportPage(EPerformancePosition.DETAIL_PAGE);
  }

  componentDidMount() {
    this.init();
  }

  init = async () => {
    const {
      global: { currentUser }
    } = this.props;
    const success = await this.getDetailPopData();
    if (success) {
      this.getScheduleCount();
      pageView('c_oa_u0ig7205', {
        userMis: currentUser?.mis
      });
      await this.getScheduleConflicts();
    }
  };

  // 获取日程详细信息
  getDetailPopData = async () => {
    let success = true;
    try {
      await this.getSchedules();
    } catch (e) {
      this.setState({ failed: true });
      success = false;
    } finally {
      this.setState({
        finish: true
      });
    }
    return success;
  };

  // 获取日程信息
  getSchedules = async () => {
    const {
      calendarId, empId, appKey, calendarRealId, eventId
    } = this.props.location.query;
    const scheduleId = calendarId;
    // const { pageType } = this.props;

    try {
      const details = window.detailPagePromise ? await window.detailPagePromise : await getPcSchedules({
        scheduleId,
        calendarId: calendarRealId,
        empId,
        eventId,
        // pageType === EPageType.MEETING ? null : empId, // 会议室打开不传empId默认自己
        appKey
      });
      details.scheduleId = details.id;
      this.props.detail.setData(details);
    } finally {
      window.detailPagePromise = null;
    }
  };

  // 获取日程信息反馈
  getScheduleCount = async () => {
    // const { scheduleId, appKey, detail, pageType } = this.props;
    const { scheduleId, appKey } = this.props.detail;
    const { pageType, detail } = this.props;
    const detailFeedback = await getScheduleCount(
      scheduleId,
      appKey,
      pageType === EPageType.MEETING ? null : detail.empId
      // empId
    );
    this.props.detail.setData({
      feedbackCountList: detailFeedback ? detailFeedback.feedbackCountList : []
    });
  };

  // 获取日程冲突人员信息
  getScheduleConflicts = async () => {
    const {
      scheduleId, appKey, startTime, endTime
    } = this.props.detail;
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

  stopPagination = (e) => {
    e.stopPropagation();
  };

  // 关闭弹层的逻辑处理， 增加了是会议室页面还是日程列表页的区分；
  // 不同页面关闭和刷新逻辑不一样

  getTypeName = (): IBgColorAndName => {
    const {
      ownerName,
      detail: { appKey },
      global: {
        currentUser: { name, enName }
      }
    } = this.props;

    let result: IBgColorAndName = {
      name: '日程',
      colors: ['#2A8EFE', '#0A70F5'],
      isBlackTheme: false
    };
    switch (appKey) {
      case EApplicationsType.Exchange:
        result = {
          name: '邮箱',
          colors: ['#2A8EFE', '#0A70F5']
        };
        break;
      case EApplicationsType.IPU:
        result = {
          name: '互联网+大学',
          colors: ['#2A8EFE', '#0A70F5']
        };
        break;
      case EApplicationsType.Promotionapi:
        result = {
          name: '晋升系统',
          colors: ['#2A8EFE', '#0A70F5']
        };
        break;
      case EApplicationsType.Schedule:
      case EApplicationsType.Meeting:
        result.name = i18nClient.t(
          'schedule_detail_name_schedule',
          '{name}的日程',
          { name: ownerName || name + getEnname(enName) }
        );
        break;
      default:
        break;
    }
    return result;
  };

  render() {
    const { finish, failed } = this.state;
    if (finish) {
      const { ownerName } = this.props; // 获取父组件传过来的数据

      const themeType: IBgColorAndName = this.getTypeName();
      if (!failed) {
        return (
          <div onClick={this.stopPagination} className={styles.container}>
            <DetailTop ownerName={ownerName} />
            <div
              style={{
                overflow: 'auto',
                marginTop: '45px',
                paddingBottom: '75px'
              }}
            >
              <ScheduleDetailHeader
                color="pcColor"
                themeType={themeType}
                theme="theme"
              />
              <SchedulDetailPage attendType="calendar" />
              <DetailBottom />
            </div>
          </div>
        );
      }

      return (
        <>
          <div className={styles.errorTop}>
            <span className={styles.title}>{i18nClient.t('schedule_detail_schedule_detail', '日程详情')}</span>
            <div className={styles.close}>
              <Tooltip
                placement={'bottom'}
                delayHide={0}
                message={i18nClient.t('schedule_detail_cancel', '取消')}
              >
                <Button
                  icon="close"
                  onClick={dx.close}
                  shape="circle"
                  size="small"
                  hoverShape
                />
              </Tooltip>
            </div>
          </div>
          <div className={styles.errorContent}>
            <Icon type="calendar-o" />
            <p className={styles.errorBody}>
              {i18nClient.t('schedule_detail_not_valid', '日程已失效或请求失败')}
            </p>
          </div>
        </>
      );
    }
    return <div className={styles.errorContent} />;
  }
}
