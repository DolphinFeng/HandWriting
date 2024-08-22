/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  action, autorun, computed, observable
} from 'mobx';
import {
  getChosenMonth, handleCalendars, getMonthDates, handleEventsShow, InitializeCache, preFetchMonth
} from '../MonthCalendarTable/utils';
import { getCalendarsList, getEvents } from '@/services/monthly';
// import { getCalendars } from '@/services/weekly';
import dayjs from 'dayjs';
import { MONTH_CHANGE_TYPE } from '../MonthCalendarTable/MonthSwitch';
import { cloneDeep, isEqual } from 'lodash';
import { colorNumToStr } from '@/utils/color';

export interface IEventItem {
  applicationId: number;
  appKey: string;
  ownerName: string;
  title: string;
  scheduleId: string;
  startTime: number;
  endTime: number;
  posIndex: number;
  isAllDay: 1 | 0;
  isOverDay: 1 | 0;
  isCyclic: number;
  length?: number;
  dayStartIndex: number;
}
export interface IEventShowItem {
  eventInfo: IEventItem;
  isShow: boolean;
  isRest: boolean;
  showLength: number;
  isAcrossWeek: boolean;
}
export interface IMonthTime {
  year: number;
  month: number;
}

export interface IDayTime {
  year: number;
  month: number;
  day: number;
}

export interface IPageStatus {
  monthTime: IMonthTime;
  scrollPos?: { x: string; y: string };
  chosenEvent: {
    id: string | null;
    idx: number | null;
  };
  chosenRestIndex?: number | null;
}

export interface IPublicCalendar {
  calendarId: number;
  appName: string;
  calendarColor: string;
}
// 生成一个缓存map();


// const chacheTimes = s1;
export default class MonthStore {
  current = getChosenMonth(MONTH_CHANGE_TYPE.TODAY);
  @observable pageStatus: IPageStatus = {
    monthTime: this.current, scrollPos: null, chosenRestIndex: null, chosenEvent: { id: null, idx: null },
  };
  eventsChache = InitializeCache();
  @observable calendarSetId: string = null;
  @observable originMonthEvents = [];
  @observable calendarListInMonth: IPublicCalendar[] = [];

  @action.bound
  async changeMonth(type: MONTH_CHANGE_TYPE, time?: IMonthTime) {
    // 如果当前月份=今天，不更新
    const preTime = this.pageStatus.monthTime;
    const newTime = type === MONTH_CHANGE_TYPE.BYTIME ? time : getChosenMonth(type, preTime);
    if (isEqual(preTime, newTime)) {
      return;
    }
    this.pageStatus.monthTime = newTime;
    // 页面时间变化，先清空事件
    this.originMonthEvents = [];
    await this.updateEvents();
  }

  @action.bound
  setCalSetId(id) {
    this.calendarSetId = id;
  }

  @action.bound
  setPageStatus(data: Partial<IPageStatus>) {
    this.pageStatus = {
      ...this.pageStatus, ...data
    };
  }

  @action.bound
  updateEvents = async (isFirstReq = false) => {
    const { month, year } = this.pageStatus.monthTime;
    const timeStr = `${year}-${month}`;
    // 判断缓存中是否有内容
    if (this.eventsChache.has(timeStr) && !isFirstReq) {
      const chache = this.eventsChache.get(timeStr);
      if (chache instanceof Promise) {
        const events = await chache;
        this.originMonthEvents = events.map((item) => {
          const {
            startTime,
            endTime,
            scheduleId,
            title,
            applicationId,
            isAllDay,
            appKey,
            ownerName,
            isCyclic
          } = item;
          return {
            startTime,
            endTime,
            scheduleId,
            title,
            applicationId,
            isAllDay,
            appKey,
            ownerName,
            isCyclic
          };
        });
      } else if (chache !== null) {
        this.originMonthEvents = chache;
      }
    }
    // 重新请求
    const events = await getEvents({
      startTime: dayjs(this.monthDates[0]).valueOf(),
      endTime: dayjs(this.monthDates[41]).add(1, 'day').valueOf() - 1,
      calendarSetId: this.calendarSetId
    });
    this.originMonthEvents = events.map((item) => {
      const {
        startTime,
        endTime,
        scheduleId,
        title,
        applicationId,
        isAllDay,
        appKey,
        ownerName,
        isCyclic
      } = item;
      return {
        startTime,
        endTime,
        scheduleId,
        title,
        applicationId,
        isAllDay,
        appKey,
        ownerName,
        isCyclic
      };
    });
    this.eventsChache.set(timeStr, JSON.parse(JSON.stringify(this.originMonthEvents)));
  };

  visionPush = (spotlight) => {
    autorun(() => {
      spotlight?.push(JSON.parse(JSON.stringify(this.pageStatus)));
    });
  };
  getPageStatus = () => {
    return JSON.parse(JSON.stringify(this.pageStatus));
  };

  @action.bound
  updateCalLists = async () => {
    const calendars = await getCalendarsList({ calendarSetId: this.calendarSetId });
    this.calendarListInMonth = calendars.map((item) => {
      const { appName, calendarId, calendarColor } = item;
      return { appName, calendarId, calendarColor: colorNumToStr(calendarColor) };
    });
  };

  @computed get monthEventsShow(): IEventShowItem[][] {
    return handleCalendars(this.originMonthEvents, this.monthDates);
    // return handleEventsShow(monthEventsList, this.monthDates);
  }

  // 获取展示的时间
  @computed get monthDates() {
    return getMonthDates(this.pageStatus.monthTime);
  }

  initCalendars = async () => {
    await this.updateCalLists();
    await this.updateEvents(true);
    preFetchMonth(this.eventsChache, this.calendarSetId);
  };
}
