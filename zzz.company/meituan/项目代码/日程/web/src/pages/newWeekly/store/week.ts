import { i18nClient } from '@sailor/i18n-web';
/*
 * @Description: 周视图页面store
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-11-12 17:29:03
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-12-10 19:53:46
 * @FilePath: /scheduleweb/src/pages/newWeekly/store/week.ts
 */
import { observable, action, computed } from 'mobx';

import dayjs from 'dayjs';
import {
  getCalendars,
  getAttendances,
} from '@/services/weekly';
import { ENow, IEventItem } from '../CalendarTable/interface';
import { getCalendarWeek, setAttendances } from '../actions/calendarUtils';
import { checkSelectDay } from '../CalendarTable/util/utils';

import ScheduleSharePanelStore from '../ScheduleSharePanel/store';
import ScheduleSourcePanelStore from '../ScheduleSourcePanel/store';
import { EVENT_COLORS } from '../const';
import { EApplicationsType, publicCalendarColor } from '@/consts';
import { setMetric } from '@/utils/owl';
import { EMetricKey } from '@/utils/metrics';
import { StorageService } from '@/services/storage';
import messageStore from '@/utils/messageStore';
import { getEnname } from '@/utils';

const eventOriginListKey = 'eventOriginListKey';
const attendanceKey = 'attendanceKey';

export default class WeekStore {
  // 日程共享Store
  scheduleSharePanelStore = new ScheduleSharePanelStore();

  // 日程来源Store
  scheduleSourcePanelStore = new ScheduleSourcePanelStore();

  // 当前时间、所选时间、所选周
  @observable currentDate: Date = new Date();

  @observable choosedDate: Date = new Date();

  @observable weekCalendar: Date[] = getCalendarWeek();

  // 每天标志的数组
  // eslint-disable-next-line max-len
  @observable attendances = setAttendances((StorageService.getItem(attendanceKey) || []), this.weekCalendar[0].getTime(), this.weekCalendar[6].getTime());
  // || ;

  // 日程原始事件列表
  @observable eventOriginList = StorageService.getItem(eventOriginListKey) || [];

  hasReport = false;

  @computed
  get weekTimeCurrent(): ENow[] {
    const tempENowList: ENow[] = [];
    let isSameOrAfter = false;
    for (let i = 0; i < this.weekCalendar.length; i++) {
      if (isSameOrAfter) {
        // 优化快速计算
        tempENowList.push(ENow.AFTER);
        continue;
      }
      const item: Date = this.weekCalendar[i];
      const itemNow: ENow = checkSelectDay(item, this.currentDate);
      if (itemNow !== ENow.BEFORE) {
        isSameOrAfter = true;
      }
      tempENowList.push(itemNow);
    }
    return tempENowList;
  }

  // 日程事件数据用于周视图组件
  @computed
  get eventCalenderList() {
    if (Array.isArray(this.eventOriginList)) {
      return this.eventOriginList.map((item = { user: {} }) => {
        const {
          startTime,
          endTime,
          title,
          scheduleId,
          user: { empId },
          isAllDay,
          isOverDay,
          applicationId
        } = item;
        const { shareToMeList } = this.scheduleSharePanelStore;
        const { scheduleTheme: color, userName, enName } = shareToMeList.find(shareItem => shareItem.userId === empId) || {};
        let eventColor = color ? EVENT_COLORS[color] : EVENT_COLORS.blue;

        // 公共日历颜色
        const { publicCalendarList, getColorByMainColor } = this.scheduleSourcePanelStore;
        const publicCalendar = publicCalendarList.find(calendarItem => calendarItem.calendarId === applicationId);
        if (publicCalendar) {
          const { calendarColor } = publicCalendar;
          eventColor = getColorByMainColor(calendarColor, 'eventItem');
          if (!eventColor) {
            eventColor = publicCalendarColor;
          }
        }
        const eventItem: IEventItem = {
          id: scheduleId,
          start: startTime,
          end: endTime,
          duration: endTime - startTime,
          title,
          isAllDay,
          isOverDay,
          ownerId: empId,
          ownerName: userName ? userName + getEnname(enName) : null,
          color: eventColor,
          applicationId
        };
        return eventItem;
      });
    }
    return [];
  }

  /**
   * 获取跳到日程的初始化参数接口
   * @param option {beginTime: 开始时间， type: 类型，source: 来源}
   * @returns {Function()
   */
  getCurrentWeekDay = () => {
    const { choosedDate } = this;
    const targetDate = dayjs(choosedDate);
    return targetDate;
  };

  /**
   * 更新数据
   */
  @action.bound
  setData(data: any) {
    for (const key in data) {
      this[key] = data[key];
    }
  }

  saveEventLocalStorage = (eventList, beginTime, lastTime) => {
    // 空闲时间缓存本周的数据
    setTimeout(() => {
      if (Date.now() > beginTime && Date.now() < lastTime) {
        StorageService.setItem(eventOriginListKey, eventList.map((item) => {
          const {
            startTime,
            endTime,
            title,
            scheduleId,
            user: { empId },
            isAllDay,
            isOverDay,
            appKey,
            applicationId
          } = item;
          return {
            startTime,
            endTime,
            title,
            scheduleId,
            user: { empId },
            isAllDay,
            isOverDay,
            appKey,
            applicationId
          };
        }));
      }
    }, 0);
  };

  // 获取节假日信息
  getAttendances = async () => {
    const startTime = this.weekCalendar[0].getTime();
    const endTime = this.weekCalendar[6].getTime();
    const isCurrentWeek = Date.now() > startTime && Date.now() < endTime + 24 * 3600 * 1000;
    // 前置请求处理
    const nUsePrefetch = window.attendancesPromise && isCurrentWeek;
    try {
      const data = nUsePrefetch ? await window.attendancesPromise : await getAttendances({ startTime, endTime });
      this.attendances = setAttendances(data, startTime, endTime);
      if (isCurrentWeek) {
        StorageService.setItem(attendanceKey, data);
      }
    } catch (e) {
      this.attendances = setAttendances((StorageService.getItem(attendanceKey) || []), startTime, endTime);
      if (nUsePrefetch) {
        messageStore.error(e?.message || i18nClient.t('week_request_timeout_please_try_again', '请求超时，请稍后再试'));
      }
    } finally {
      window.attendancesPromise = null;
    }
  };

  getCalendars = async () => {
    const startTime = this.weekCalendar[0].getTime();
    const endTime = this.weekCalendar[6].getTime() + 24 * 3600 * 1000;
    const nUsePrefetch = window.calendarsPromise && Date.now() > startTime && Date.now() < endTime;
    const startFetchTime = Date.now();

    const { meInfo, shareToMeList } = this.scheduleSharePanelStore;
    const users = meInfo?.checked ? [meInfo.empId] : [];
    const appKeyList = this.scheduleSourcePanelStore.scheduleSourceList
      .filter(item => !!item.checked)
      .map(item => item.appKey)
      .join(',');
    const calendarIdList = this.scheduleSourcePanelStore.publicCalendarList.filter(item => !!item.checked).map(item => item.calendarId).join(',');
    const mtUserIds = users
      .concat(
        shareToMeList
          .filter(item => !!item.checked)
          .map(item => item.userId)
      )
      .join(',');
    // 前置请求处理
    try {
      if (nUsePrefetch) {
        this.eventOriginList = await window.calendarsPromise;
      } else {
        this.eventOriginList = await getCalendars({
          startTime,
          endTime,
          mtUserIds,
          appKeyList,
          calendarIdList
        });
        // 没有勾选邮箱上报时间
        if (!appKeyList.includes('EApplicationsType.Exchange')) {
          setMetric(EMetricKey.NO_EXCHANGE_REQUEST_TIME, Date.now() - startFetchTime);
        }
      }
      // 缓存当周数据
      this.saveEventLocalStorage(this.eventOriginList, startTime, endTime);

      if (!this.hasReport) {
        const hasExchange = this.eventOriginList.some(item => item.appKey === EApplicationsType.Exchange);
        setMetric(EMetricKey.HAS_EXCHANGE, hasExchange ? 1 : 0);
        this.hasReport = true;
      }
      return this.eventOriginList;
    } catch (e) {
      if (nUsePrefetch) {
        messageStore.error(e?.message || i18nClient.t('week_request_timeout_please_try_again', '请求超时，请稍后再试'));
      }
      let listTemp = [];
      // 过滤掉缓存中不属于列表用户的数据, TODO: calendarIdLists优化过滤掉未选中的
      if (StorageService.getItem(eventOriginListKey)) {
        const allUsers = mtUserIds.split(',');
        const allApplications = appKeyList.split(',');
        const calendarIdLists = calendarIdList.split(',');
        // eslint-disable-next-line max-len
        listTemp = StorageService.getItem(eventOriginListKey).filter(item => allUsers.includes(item.user?.empId) && (allApplications.includes(item.appKey) || calendarIdLists.includes(`${item.applicationId}`)));
      }
      this.eventOriginList = listTemp;
      return this.eventOriginList;
    } finally {
      window.calendarsPromise = null;
    }
  };

  initScheduleList = async () => {
    this.getAttendances();
    return await this.getCalendars();
  };

  changeChoosedDate = (date?: Date) => {
    const choosedDate = date || new Date();
    this.choosedDate = choosedDate;
    this.weekCalendar = getCalendarWeek(choosedDate);
  };
}
