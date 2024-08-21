/*
 * @Description: 环境判断
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2021-01-11 19:02:40
 * @LastEditors: chenbaiyu
 * @LastEditTime: 2023-02-13 11:19:26
 * @FilePath: /scheduleweb/src/utils/environment.ts
 */
import { deployEnv } from '@onejs/utils';
import { router } from 'onejs/router';
import { StorageService } from '@/services/storage';

export enum EBookType {
  WEB_MEETING = 11, // web预订会议室
  PC_DX_MEETING = 12, // PC大象预订会议室
  WEB_DX_MEETING = 13, // web大象预订会议室
  WEB_SCHEDULE = 14, // web预订日程
  PC_DX_SCHEDULE = 15, // PC大象预订日程
  WEB_DX_SCHEDULE = 16, // web大象预订日程
  PC_PCHAT = 17,
  PC_GROUPCHAT = 18
}

export enum EChatType {
  GROUPCHAT = 'groupchat',
  CHAT = 'chat',
  DEFAULT = ''
}

export enum EWebViewType {
  BROWSER = 0,
  DX_RIGHT = 1,
  DX = 2
}

// 是否是从会议室微应用打开的日程
export const isInMeeting = window.location.hash.includes('byMeetingApp');

// 是否是大象PC
export const isPCDaxiang = /DXShell|大象/.test(window.navigator.userAgent);

export const isWindows = /Windows|windows/.test(window.navigator.userAgent);

// 行事历侧边栏打开（在大象中，无桥接口权限，避免使用桥接口）
export const isRightSideDaxiang = /DXRightSideShell/.test(
  window.navigator.userAgent
);

// 是否是在大象web中
export const isWebDaxiang = window.name.includes('dxweb-app-');

// eslint-disable-next-line no-nested-ternary
export const webViewType = isRightSideDaxiang
  ? EWebViewType.DX_RIGHT
  : isPCDaxiang
    ? EWebViewType.DX
    : EWebViewType.BROWSER;

// 环境判断
export const isTest = ['development', 'test'].includes(deployEnv);

export const isMac = /macintosh|mac os x/i.test(navigator.userAgent);

export const locales = navigator.userAgent.match(/dx_la\/([^ ]+)/)?.[1]
  || localStorage.getItem('locales')
  || 'zh';

// 单聊群聊判断
export const getChatType = (): EChatType => {
  // if (!isPCDaxiang) {
  //   return EChatType.DEFAULT;
  // }
  if (
    window.location.pathname === '/group'
    || StorageService.getItemSession('chatType') === 'groupchat'
  ) {
    StorageService.setItemSession('chatType', 'groupchat');
    return EChatType.GROUPCHAT;
  }
  if (
    window.location.pathname === '/chat'
    || StorageService.getItemSession('chatType') === 'chat'
  ) {
    StorageService.setItemSession('chatType', 'chat');
    return EChatType.CHAT;
  }
  return EChatType.DEFAULT;
};

// 获取预定类型，用于后端提交数据埋点
// nMeeting 代表是否发起的是会议日程
// 会议日程通过不同渠道（浏览器、大象web、大象pc）记录不同的类型
// 日程通过不同渠道（浏览器、大象web、大象pc）记录不同的类型
export const getBookType = (
  nMeeting: boolean,
  chatType?: string
): EBookType => {
  let res: EBookType = EBookType.PC_DX_MEETING;
  if (chatType === 'groupchat') {
    res = EBookType.PC_GROUPCHAT;
  } else if (chatType === 'chat') {
    res = EBookType.PC_PCHAT;
  } else if (nMeeting) {
    if (isPCDaxiang) {
      res = EBookType.PC_DX_MEETING;
    } else if (isWebDaxiang) {
      res = EBookType.WEB_DX_MEETING;
    } else {
      res = EBookType.WEB_MEETING;
    }
  } else if (isPCDaxiang) {
    res = EBookType.PC_DX_SCHEDULE;
  } else if (isWebDaxiang) {
    res = EBookType.WEB_DX_SCHEDULE;
  } else {
    res = EBookType.WEB_SCHEDULE;
  }
  return res;
};

// 用于区分是不同微应用的逻辑, 不同微应用有不同的情况
// 目前会议室微应用打开方式为 hash: byMeetingApp
// 后续微应用增加其它标志
export const routerReplaceWithAppState = (pathname: string, state?) => {
  if (pathname?.includes('rooms')) {
    const { host: currentHost, protocol } = window.location ?? {};
    const host = currentHost?.includes('localhost')
      ? 'calendar.it.test.sankuai.com'
      : currentHost;
    const hash = isInMeeting ? '#byMeetingApp' : '';
    window.location.replace(`${protocol}//${host}${pathname}${hash}`);
  } else {
    router.replace({
      pathname,
      state,
      hash: isInMeeting ? 'byMeetingApp' : ''
    });
  }
};
