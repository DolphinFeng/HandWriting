import { observable, action } from 'mobx';
import { getApplications } from '@/services/apis';
import { EApplicationsType } from '@/consts/type';
import { StorageService } from '@/services/storage';
import { colorNumToStr } from '@/utils/color';
import { generate } from '@ant-design/colors';

enum ECalendarType {
  PUBLIC = 'PUBLIC'
}

// 日程来源
export interface IScheduleSource {
  id: number; // ID
  appKey: string; // APPKEY
  appName: string; // 名称
  checked: boolean; // 是否选取
}
export interface IPublicCalendar {
  checked: boolean;
  appName: 'string';
  calendarId: number;
  calendarColor: string;
  role: 'ADMIN' | 'READER' | 'OENER';
  description: 'string';
  hovered: boolean;
}
export interface ICalendarColor {
  mainColor: string;
  serialColors: string[];
}
const APPLICATION_KEY = 'application';
const PUBLIC_APPLICATION_KEY = 'publicApplication';
/**
 * 日程来源数据
 */
export default class ScheduleSourcePanelStore {
  // 日程来源
  @observable scheduleSourceList: IScheduleSource[] = [];
  // 公共日历表
  @observable publicCalendarList: IPublicCalendar[] = [];

  // 日程来源: 会议和日程id
  @observable meetingId: number = null;

  @observable scheduleId: number = null;

  initApplications = [];

  initPublicCalendars = [];

  @observable calendarColors: ICalendarColor[] = [];
  // calendarColors: ICalendarColor[] = [];

  constructor() {
    const applications = StorageService.getItem(APPLICATION_KEY);
    const publicCalendars = StorageService.getItem(PUBLIC_APPLICATION_KEY);
    if (applications) {
      this.initApplications = applications;
      this.setApplicationInfos(applications);
    }
    if (publicCalendars) {
      this.initPublicCalendars = publicCalendars;
      this.setPublicCalendarList(publicCalendars);
    }
  }

  /**
   * 更新数据
   */
  @action.bound
  setData(data: any) {
    for (const key in data) {
      this[key] = data[key];
    }
  }

  checkApplicationsSameAsStorage(applications: any[], calendars: any[]) {
    // application全选只要判断key完全一样就命中缓存
    const applicationSame = applications.map(item => item.appKey).sort().join(',') === this.initApplications.map(item => item.appKey).sort().join(',');
    // public calendars 相同需要选中的日历相同
    const calendarsSame = calendars.filter(item => item.checked).map(item => item.calendarId).sort().join(',') === this.initPublicCalendars.filter(item => item.checked).map(item => item.calendarId).sort().join(',');
    return applicationSame && calendarsSame;
  }

  /**
   * 获取日程来源
   */
  @action.bound
  async getApplications(first?: boolean) {
    const data = window.applicationsPromise ? await window.applicationsPromise : await getApplications();
    window.applicationsPromise = null;
    const applications = data.filter(item => item.calendarType !== ECalendarType.PUBLIC);
    const calendars = data.filter(item => item.calendarType === ECalendarType.PUBLIC);
    this.setApplicationInfos(applications);
    this.setPublicCalendarList(calendars);
    const nSame = first ? this.checkApplicationsSameAsStorage(applications, calendars) : false;
    this.applicationStorage(applications);
    this.publicCalendarStorage(calendars);
    return nSame;
  }

  @action setApplicationInfos = (data) => {
    const scheduleSourceList = data.map((item) => {
      const { id, appKey, appName } = item;
      return {
        id,
        appKey,
        appName,
        checked: true
      };
    });
    const meetingItem = scheduleSourceList.find(
      item => item.appKey === EApplicationsType.Meeting
    );
    const scheduleItem = scheduleSourceList.find(
      item => item.appKey === EApplicationsType.Schedule
    );
    meetingItem && this.setData({ meetingId: meetingItem.id });
    scheduleItem && this.setData({ scheduleId: scheduleItem.id });
    scheduleSourceList && this.setData({ scheduleSourceList });
  };

  @action setPublicCalendarList = (data) => {
    const publicCalendarList = data.map((item) => {
      const {
        checked, appName, calendarId, calendarColor, role, description
      } = item;
      return {
        checked, appName, calendarId, calendarColor: colorNumToStr(calendarColor), role, description, hovered: false
      };
    });
    this.setData({ publicCalendarList });
  };

  /**
   * 切换日程来源
   */
  @action.bound
  async changeSource(id) {
    this.setData({
      scheduleSourceList: this.scheduleSourceList.map((item) => {
        if (item.id === id) {
          return { ...item, checked: !item.checked };
        }
        return item;
      })
    });
  }

  /**
   * 切换公共日历
   */
  @action.bound
  changePublicCalendar(newCalendarId, newChecked) {
    const publicCalendarList = this.publicCalendarList.map((item) => {
      if (item.calendarId === newCalendarId) {
        return { ...item, checked: newChecked };
      }
      return item;
    });
    this.setData({
      publicCalendarList
    });
    // 更新最新的缓存
    this.publicCalendarStorage(publicCalendarList);
  }
  @action.bound
  changePublicCalendarHover(calendarId, hovered) {
    const publicCalendarList = this.publicCalendarList.map((item) => {
      if (item.calendarId === calendarId) {
        return { ...item, hovered };
      }
      return item;
    });
    this.setData({
      publicCalendarList
    });
    // 更新最新的缓存
    this.publicCalendarStorage(publicCalendarList);
  }

  applicationStorage = (list) => {
    StorageService.setItem(APPLICATION_KEY, list.map((item) => {
      const { id, appKey, appName } = item;
      return { id, appKey, appName };
    }));
  };

  publicCalendarStorage = (list) => {
    StorageService.setItem(PUBLIC_APPLICATION_KEY, list.map((item) => {
      const {
        checked, appName, calendarId, calendarColor
      } = item;
      return {
        checked, appName, calendarId, calendarColor
      };
    }));
  };

  @action.bound
  // eslint-disable-next-line consistent-return
  getColorByMainColor = (color, colorType: 'eventItem' | 'detail'): any => {
    // 加颜色兜底
    if (!color) {
      return colorType === 'detail' ? ['#1CCE72', '#00B365'] : {
        backgroundColor: '#BAEFD7',
        fontColor: '#007038',
        focusColor: '#b9ecd4',
      };
    }
    let colorItem = this.calendarColors.find(item => item.mainColor === color);
    if (!colorItem) {
      const calendarColors = this.calendarColors.map(item => item);
      colorItem = {
        mainColor: color,
        serialColors: generate(color)
      };
      calendarColors.push(colorItem);
      this.setData({ calendarColors });
    }
    const { serialColors } = colorItem;

    // eslint-disable-next-line default-case
    switch (colorType) {
      case 'eventItem':
        return {
          backgroundColor: serialColors[0],
          focusColor: serialColors[1],
          fontColor: serialColors[7]
        };
      case 'detail':
        return [serialColors[5], serialColors[4]];
    }
  };
}
