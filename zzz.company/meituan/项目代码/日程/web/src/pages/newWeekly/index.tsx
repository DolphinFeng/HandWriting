import { i18nClient } from '@sailor/i18n-web';
/*
 * @Description: 新的周（主）视图页
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-05-29 14:30:44
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2021-05-13 16:07:08
 * @FilePath: /scheduleweb/src/pages/newWeekly/index.tsx
 */

import React, { Component } from 'react';
import { autorun, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import dayjs from 'dayjs';
import { pageView } from 'onejs/lx';
import { routerReplaceWithAppState } from '@/utils';
import { messageStore } from '@/store/global';
import { Icon } from '@ss/mtd-react';
import { EDXEventType, EPerformancePosition } from '@/consts';
import { addModuleClick } from '@/services/lxService';
import { StorageService } from '@/services/storage';
import WeekSwitch from './WeekSwitch';
import CreateBtns from './CreateBtns';
import CalendarTable from './CalendarTable';
import ScheduleSharePanel from './ScheduleSharePanel';
import ScheduleSourcePanel from './ScheduleSourcePanel';
import ScheduleQAPanel from './ScheduleQAPanel';
import ScheduleADPanel from './ScheduleADPanel';
import weekStore from './store/week';
import { getEventIdByScheduleId } from '@/services/apis';
import './index.less';
import { pikeInitAndStart, PIKE_TYPE, pikeStop } from '@/services/pikeService';

interface IPropsType {
  location?: any;
  week?: weekStore;
  global?: any;
  detail?: any;
}

/**
 * 新的周（主）视图页
 */

@inject(({ week, detail, global }) => ({
  week,
  detail,
  global
}))
@observer
export default class extends Component<IPropsType> {
  weekCalendarTable;

  currentTimeInterval;

  disposer;

  @observable closeLeft: boolean = StorageService.getItem('closeLeft');

  @observable segs = [];

  constructor(props) {
    super(props);
    // 进入页面的时候发现用户点击了创建按钮 直接跳转到创建
    const { nDxType } = window;
    if (nDxType === EDXEventType.BYADDICON) {
      this.jumpEdit();
    }
    // 上报页面性能
    const { reportPage } = this.props.global;
    reportPage(EPerformancePosition.WEEKLY_PAGE);
  }

  componentDidMount() {
    const {
      global: { currentUser }
    } = this.props;
    this.initPageInfos();
    this.props.week.setData({ currentDate: new Date() });
    this.currentTimeInterval = setInterval(() => {
      this.props.week.setData({ currentDate: new Date() });
    }, 2 * 60 * 1000);
    // 日程主视图页面埋点
    pageView('c_oa_7cpek44f', {
      userMis: currentUser?.mis
    });

    this.disposer = autorun(() => {
      // 配置请求完成后且和缓存内容不一致，重新获取一下列表
      if (!this.props.global?.allInitSame) {
        const { setAllInitSame } = this.props.global;
        // 放弃使用预请求
        window.calendarsPromise = null;
        this.initAndSelect(true);
        // 校对后，设置状态相同
        setAllInitSame(true);
      }
    });
  }

  componentWillUnmount() {
    pikeStop();
    // window.removeEventListener('PikeMessage', this.pikeMessageHandle);
    window.removeEventListener('dxNotification', this.handleDxNotification);
    this.currentTimeInterval && clearInterval(this.currentTimeInterval);
    if (this.disposer) {
      this.disposer();
      this.disposer = null;
    }
  }

  // 初始化事件信息
  initPageInfos = () => {
    this.init();
    const {
      week: {
        scheduleSourcePanelStore: { getApplications },
        initScheduleList
      }
    } = this.props;
    // pikeInitAndStart(PIKE_TYPE.WEEK, { updateApplication: getApplications, updateSchedules: this.pikeMessageHandle });
    pikeInitAndStart(PIKE_TYPE.WEEK, {
      updateApplications: getApplications,
      updateSchedules: initScheduleList
    });
  };

  init() {
    this.initAndSelect(true);
    window.addEventListener('dxNotification', this.handleDxNotification);
  }

  handleDxNotification = async () => {
    const { nDxType } = window;
    const {
      week: { scheduleSharePanelStore, scheduleSourcePanelStore, setData }
    } = this.props;
    setData({ currentDate: new Date() });

    if (nDxType === EDXEventType.BYADDICON) {
      this.jumpEdit();
    } else {
      // 切入的时候获取一次共享信息 保证实时更新
      await Promise.all([
        scheduleSharePanelStore.getShareToMeList(),
        scheduleSourcePanelStore.getApplications()
      ]);
      this.initAndSelect();
    }
    window.nDxType = null;
  };

  initAndSelect = async (nInit?: boolean) => {
    // 如果有时间 设置时间； 包括2类： 大象点击日程的初始化时间；创建日程返回的时间。
    const {
      nDxNotification, nDxStartTime, nDxScheduleId, nDxEmpId
    } = window;
    this.scrollCalendar();
    const startStamp = Date.now();
    nInit
      && window.Owl
      && window.Owl.addPoint({
        position: EPerformancePosition.WEEKLY_REQUEST_START,
        timeStamp: startStamp
      });
    const choosedDateBeSet = nDxStartTime ? new Date(nDxStartTime) : new Date();
    await this.setChoosedDate(choosedDateBeSet);
    nInit
      && window.Owl
      && window.Owl.addPoint({
        position: EPerformancePosition.WEEKLY_REQUEST_END,
        duration: Date.now() - startStamp
      });
    if (nDxNotification && nDxScheduleId && nDxEmpId) {
      // 在周视图页面找该Id，判断是否为新ID
      const {
        week: { eventOriginList }
      } = this.props;
      const isNewId = eventOriginList.some(
        fItem => nDxScheduleId && fItem.scheduleId === nDxScheduleId
      );
      let eventId = nDxScheduleId;
      if (!isNewId) {
        const params = { scheduleId: nDxScheduleId, eventType: 'SINGLE' };
        eventId = await getEventIdByScheduleId(params);
      }
      this.onChangeSelectEvent(eventId, nDxEmpId, true);
    }
  };

  // # TODOs
  jumpEdit = () => {
    const { nDxStartTime, nDxScheduleId, nDxAppKey } = window;
    this.setPageId();
    routerReplaceWithAppState('/edit', {
      startTime: nDxStartTime,
      scheduleId: nDxScheduleId,
      appKey: nDxAppKey,
      from: 'dx'
    });
    window.nDxType = null;
  };

  pikeMessageHandle = async () => {
    const {
      week: { initScheduleList }

      // detail: { showDetailPop, scheduleId, closeDetailPop }
    } = this.props;
    initScheduleList();
    // 由于复合操作后端触发Pike时机有问题 暂时不提示
    // const list =
    // const idList = list ? list.map(item => item.scheduleId) : [];
    // // 如果打开日程详情的日程被删除，则关闭日程
    // if (showDetailPop && scheduleId) {
    //   if (!idList.includes(scheduleId)) {
    //     messageStore.error('该日程已取消');
    //     closeDetailPop();
    //   }
    // }
  };

  // 滚动到初始化位置
  scrollCalendar = (target?: any) => {
    const currentTime = target ? dayjs(target) : dayjs();
    const hour = currentTime.hour();
    const minute = currentTime.minute();
    this.weekCalendarTable
      && this.weekCalendarTable.scrollToTime(Math.max(hour - 3, 0), minute);
  };

  // 设置选中时间
  setChoosedDate = async (date: Date) => {
    const {
      week: { changeChoosedDate, initScheduleList }
    } = this.props;
    changeChoosedDate(date);
    await initScheduleList();
  };

  setPageId = () => {
    const { setData } = this.props.global;
    setData({
      lastPageId: 'weekly'
    });
  };

  // 进入创建
  openEdit = (startTime, endTime, isAllDay?: number) => {
    const {
      detail: { closeDetailPop }
    } = this.props;
    closeDetailPop();
    const data = {
      startTime: startTime.valueOf(),
      endTime: endTime.valueOf(),
      isAllDay
    };
    this.setPageId();
    routerReplaceWithAppState('/edit', data);
  };

  // 进入创建页
  openTypeEdit = (pid: string, startTime, endTime, isAllDay?: number) => {
    this.openEdit(startTime, endTime, isAllDay);
    addModuleClick(pid);
  };

  // 选中指定日程
  onChangeSelectEvent = (id: string, ownerId: string, nScroll?: boolean) => {
    const {
      week: { eventOriginList },
      detail: { setData }
    } = this.props;
    const item = eventOriginList.find((fItem = { user: {} }) => {
      return (
        id && fItem.scheduleId === id && ownerId && ownerId === fItem.user.empId
      );
    });
    const { nDxNotification, nDxScheduleId, nDxEmpId } = window;
    if (item) {
      // 初始化滚动到可视区域
      if (nScroll && item.isAllDay !== 1 && item.isOverDay !== 1) {
        this.scrollCalendar(item.startTime);
      }

      setData({ showDetailPop: true, scheduleId: id, empId: ownerId });
    } else if (nDxNotification && nDxScheduleId && nDxEmpId) {
      messageStore.error(
        i18nClient.t('new_weekly_this_schedule_not_available', '该日程已失效')
      );
    }
  };

  // 判断日程是否被选中
  checkPopItemShow = (id, ownerId) => {
    const {
      detail: { showDetailPop, scheduleId, empId }
    } = this.props;
    return (
      showDetailPop && id && scheduleId === id && ownerId && ownerId === empId
    );
  };

  render() {
    const {
      week: {
        choosedDate,
        weekCalendar,
        eventCalenderList,
        weekTimeCurrent,
        attendances,
        currentDate,
        eventOriginList
      },
      detail: {
        showDetailPop, scheduleId, empId, closeDetailPop
      }
    } = this.props;
    let scheduleItem = {};
    const item = eventOriginList.find((fItem = { user: {} }) => {
      return (
        scheduleId
        && fItem.scheduleId === scheduleId
        && empId
        && empId === fItem.user.empId
      );
    });
    if (item) {
      scheduleItem = { ...item };
    }

    return (
      <div className="schedule-container">
        <div
          className="schedule-wrapper-left"
          style={{ width: this.closeLeft ? 0 : 180 }}
        >
          <ScheduleSharePanel />
          <ScheduleSourcePanel />
          <ScheduleADPanel />
          <ScheduleQAPanel />
        </div>
        <div className="schedule-wrapper-right">
          <div
            onClick={() => {
              this.closeLeft = !this.closeLeft;
              StorageService.setItem('closeLeft', this.closeLeft);
              // 操作展开收起左侧栏
              addModuleClick('b_oa_m1xkfhd1_mc');
            }}
            className="schedule-wrapper-toggle"
          >
            <Icon
              type={this.closeLeft ? 'right' : 'left'}
              style={{ fontSize: 12, color: 'rgba(0, 0, 0, 0.84)' }}
            />
          </div>
          <div className="main-title">
            <WeekSwitch
              choosedDate={choosedDate}
              onChoosedDateChange={this.setChoosedDate}
            />
            <CreateBtns
              openEdit={(startTime, endTime) => {
                this.openTypeEdit('b_oa_qrdmv0pu_mc', startTime, endTime);
              }}
            />
          </div>
          <div className="calendar-container">
            <CalendarTable
              ref={(ref) => {
                this.weekCalendarTable = ref;
              }}
              colClickCb={(startTime, endTime, isAllDay?: number) => {
                if (isAllDay === 1) {
                  this.openTypeEdit(
                    'b_oa_prub0bak_mc',
                    startTime,
                    endTime,
                    isAllDay
                  );
                } else {
                  this.openTypeEdit('b_oa_i71ai41k_mc', startTime, endTime);
                }
              }}
              onChangeSelectEvent={this.onChangeSelectEvent}
              checkPopItemShow={this.checkPopItemShow}
              selectObj={scheduleItem}
              choosedDate={choosedDate}
              weekCalendar={weekCalendar}
              eventCalenderList={eventCalenderList}
              weekTimeCurrent={weekTimeCurrent}
              attendances={attendances}
              currentTime={currentDate}
            />
          </div>
        </div>
        {showDetailPop && scheduleId && empId && (
          <div onClick={closeDetailPop} className="detailPopMask" />
        )}
      </div>
    );
  }
}
