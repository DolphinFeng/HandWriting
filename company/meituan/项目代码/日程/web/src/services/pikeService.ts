import { deployEnv } from '@onejs/utils';
import { PageDataService } from '@/services/pageData';
import { registerChannel, offlineChannel } from './monthly';
import { debounce } from 'lodash';
import { addResError } from '@/utils';
// 获取页面数据
const pageData = PageDataService.get();

// eslint-disable-next-line no-nested-ternary
const pikeEnv = ['development', 'test'].includes(deployEnv)
  ? 'test'
  : ['st', 'stage', 'staging'].includes(deployEnv)
    ? 'stage'
    : 'product';
let pikeInstance = null;
export enum PIKE_TYPE {
  MONTH = 'monthPike',
  WEEK = 'weekPike'
}
enum BIZ_TYPE {
  CALENDAR = 'CALENDAR',
  SCHEDULE = 'SCHEDULE'
}
const PIKE_ID = {
  monthPike: 'meituan_it_oa_calendar_pike',
  weekPike: 'meituan_it_oa_cooperation_calendar'
};

const getPikeBundle = async () => {
  return await import('@dp/pike-message-web');
};

let pikeType = null;
let msgHandles = null;
let params = null;
let initPromise = null;
const isGray = pageData.gray && pageData.gray !== 'prod';

// const delay = async time => new Promise(resolve => setTimeout(resolve, time));

// 初始化pike
const initPike = async () => {
  const starTime = new Date().getTime();
  const res = await getPikeBundle();
  const Pike = res?.default;
  console.log(pikeType);
  pikeInstance = new Pike(PIKE_ID[pikeType], {
    autoConnect: false,
    keepAlive: true,
    alias: pageData.userInfo && pageData.userInfo.empId,
    env: isGray ? 'product' : pikeEnv // 走灰度链路， 是生成环境下的流量隔离方案 https://km.sankuai.com/collabpage/1640661449
  });
  if (!pikeInstance) return;
  if (isGray) {
    pikeInstance.beforeOpen((...args) => {
      console.log('-----------beforeOpen', ...args);
      return {
        query: { 'M-TransferContext-INF-CELL': 'gray-release-it-schedule' }
      };
    });
  }

  pikeInstance.onReady(() => {
    const endTime = new Date().getTime();
    console.log('一切就绪，可以进行数据传输 😁。');
    console.log('PIKE_INIT_TIME', `startTime：${starTime}, endTime: ${endTime}, time: ${endTime - starTime}ms`);
    addResError('PIKE_INIT_TIME', `startTime：${starTime}, endTime: ${endTime}, time: ${endTime - starTime}ms`);
    httpHandle();
  });
  pikeInstance.onClose(() => {
    console.log('关闭了链接');
  });
};

function httpHandle() {
  if (pikeType === PIKE_TYPE.MONTH) {
    const { updateCalLists, updateEvents } = msgHandles;
    updateCalLists();// 如果是日历编辑，则更新日历
    updateEvents(); // 总是更新日程
  } else {
    const { updateApplications, updateSchedules } = msgHandles;
    // console.log('收到日历pike');
    updateApplications();
    updateSchedules();
  }
}


// 注册消息处理
function registerMegHandle() {
  if (pikeType === PIKE_TYPE.MONTH) {
    const { calendarSetId, updateCalLists, updateEvents } = msgHandles;
    pikeInstance.onLogin(async (data) => {
      const { token } = data;
      params = { calendarSetId, pikeToken: token };
      await registerChannel(params);
    });

    const debounceFun = debounce((data) => {
      console.log('收到月视图pike消息');
      addResError('RECEIVER_PIKE_MONTH_TIME', `收到月视图pike消息: ${new Date().getTime()}`);
      const { bizType, msg: { msgType } } = JSON.parse(data);
      bizType === BIZ_TYPE.CALENDAR && msgType === 'CALENDAR_EDIT' && updateCalLists();// 如果是日历编辑，则更新日历
      updateEvents(); // 总是更新日程
    }, 200);
    pikeInstance.onMessage(data => debounceFun(data));
  } else {
    const { updateApplications, updateSchedules } = msgHandles;
    const debounceFun = debounce((data) => {
      console.log('收到周视图pike消息');
      addResError('RECEIVER_PIKE_WEEK_TIME', `收到周视图pike消息: ${new Date().getTime()}`);
      const { bizType } = JSON.parse(data);
      if (bizType === BIZ_TYPE.CALENDAR) {
        // console.log('收到日历pike');
        updateApplications();
      }
      updateSchedules();
    }, 200);
    pikeInstance.onMessage(data => debounceFun(data));
  }
}

const initPikeInstance = async () => {
  try {
    await initPike();
    await registerMegHandle();
  } catch (error) {
    console.log(error, '[pike load failed]');
  }
};

export function pikeInitAndStart(type: PIKE_TYPE, handles) {
  pikeType = type;
  msgHandles = handles;
  initPromise = initPikeInstance();
  initPromise.then(() => {
    pikeInstance?.start();
  });
}

export function pikeStart() {
  if (!(pikeType && msgHandles)) {
    return;
  }
  initPromise = initPikeInstance();
  initPromise.then(() => {
    pikeInstance?.start();
  });
}

export function pikeStop() {
  initPromise?.then(async () => {
    if (pikeType === PIKE_TYPE.MONTH) {
      // 注册下线
      await offlineChannel(params);
      console.log(`成功下线:${params.pikeToken}`);
    }
    pikeInstance?.stop();
  });
}
