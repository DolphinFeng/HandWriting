import { i18nClient } from '@sailor/i18n-web';

export interface ICalendarInfo {
  summary: string;
  description: string;
  color: number;
  subscribeAcls?: ICalendarSubscriber[];
}

export enum EPERM_TYPE {
  USER_ID = 'USER_ID',
  ORG_ID = 'ORG_ID',
  GROUP_ID = 'GROUP_ID',
  ALL = 'ALL'
}

export enum CALENDAR_ROLE_TYPE {
  ADMIN = 'ADMIN', // 管理员
  VISIBLE = 'VISIBLE', // 可见
  SUBSCRIBED = 'SUBSCRIBED', // 订阅者
  OWNER = 'OWNER' // 创建者
}

export const CALENDAR_ROLE = {
  ADMIN: {
    key: CALENDAR_ROLE_TYPE.ADMIN,
    label: i18nClient.t('common_calendar_role_admin_label', '管理员'),
    description: i18nClient.t('common_calendar_role_admin_description', '管理日历、日程及成员权限')
  },
  SUBSCRIBED: {
    key: CALENDAR_ROLE_TYPE.SUBSCRIBED,
    label: i18nClient.t('common_calendar_role_subscribed_label', '订阅者'),
    description: i18nClient.t('common_calendar_role_subscribed_description', '订阅日历并查看所有日程详情')
  }
};

export const ORG_ROLE_LIST = {
  SUBSCRIBED: {
    key: CALENDAR_ROLE_TYPE.SUBSCRIBED,
    label: i18nClient.t('common_org_role_list_subscribed_label', '订阅者'),
    description: i18nClient.t('common_org_role_list_subscribed_description', '订阅日历并查看所有日程详情')
  }
};

export interface ICalendarSubscriber {
  permissionType: EPERM_TYPE;
  permissionValue?: string;
  role: CALENDAR_ROLE_TYPE;//
  userAvatar?: string;
}
