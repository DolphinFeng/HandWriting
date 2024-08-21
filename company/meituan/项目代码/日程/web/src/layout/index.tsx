import React, { useLayoutEffect, useState } from 'react';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import dayjs from 'dayjs';
import objectSupport from 'dayjs/plugin/objectSupport';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import ErrorBoundary from '@/components/ErrorBoudary';
import { addResError } from '@/utils';
import { PageDataService } from '@/services/pageData.js';
import { setMetric } from '@/utils/owl';
import { EMetricKey } from '@/utils/metrics';
import { EPerformancePosition } from '@/consts/type';
import PageErrorItem from '@/components/PageErrorItem';
import { ROOMS_TO_SCHEDULE_WINDOW } from '@/consts/jumpRooms';

dayjs.extend(objectSupport);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(utc);
dayjs.extend(tz);

/**
 * 主页面加载
 */
const MainLayout = observer((props) => {
  const {
    stroes: {
      global: { setData, currentUser },
      week: { scheduleSharePanelStore, scheduleSourcePanelStore }
    },
    children
  } = props;

  // 处理会议室服务跳过来携带的window参数
  const sessionStorageWindowData = window.sessionStorage.getItem(
    ROOMS_TO_SCHEDULE_WINDOW
  );
  if (sessionStorageWindowData) {
    window.sessionStorage.removeItem(ROOMS_TO_SCHEDULE_WINDOW);
    const windowData = JSON.parse(sessionStorageWindowData);
    Object.keys(windowData ?? {})?.forEach((windowKey) => {
      window[windowKey] = windowData[windowKey];
    });
  }

  // 初始化请求失败
  const [requestFailed, setRequestFailed] = useState(false);
  useLayoutEffect(() => {
    const startStamp = Date.now();

    // 开始请求通用配置,layout加载时间
    window.Owl
      && window.Owl.addPoint({
        position: EPerformancePosition.LAYOUT_START,
        timeStamp: startStamp
      });

    setData({ currentUser: PageDataService.get('userInfo') });

    Promise.all([
      scheduleSharePanelStore.getUserInfo(),
      scheduleSharePanelStore.getShareToMeList(true),
      scheduleSourcePanelStore.getApplications(true)
    ])
      .then((res) => {
        // 全局缓存有效，规避再次业务请求
        const sameAsLocalStorage = res[1] && res[2] && scheduleSharePanelStore.nUserSameAsLocal;
        setData({ currentUser: res[0], allInitSame: sameAsLocalStorage });
        setMetric(
          EMetricKey.ALL_COMMON_LOCAL_STORAGE_SAME,
          sameAsLocalStorage ? 1 : 0
        );
        window.Owl
          && window.Owl.addPoint({
            position: EPerformancePosition.GLOBAL_REQUEST_FINISH,
            duration: Date.now() - startStamp
          });
      })
      .catch(() => {
        setRequestFailed(true);
        addResError('PageFirstRequestFailed', '服务端初始化请求失败');
      });
  }, []);

  if (requestFailed) {
    return <PageErrorItem />;
  }

  if (currentUser && currentUser.mis) {
    return (
      <ErrorBoundary>
        <>{children}</>
      </ErrorBoundary>
    );
  }

  return null;
});

export default inject(stroes => ({
  stroes
}))(MainLayout);
