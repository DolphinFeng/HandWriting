/*
 * @Description: 文件描述
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-10-14 20:26:22
 * @LastEditors: chenbaiyu
 * @LastEditTime: 2023-01-04 14:44:47
 * @FilePath: /scheduleweb/src/services/dxClientMessage.js
 */
import { moduleClick, pageView } from 'onejs/lx';
import { getVersion } from '@/services/apis';
import { StorageService } from '@/services/storage';
import {
  cprVersion,
  addResError,
  isPCDaxiang,
  isWebDaxiang,
  isRightSideDaxiang
} from '@/utils';
import { EDXEventType, EApplicationsNumTypeArr } from '@/consts/type';
import dxJSSDK, { dxClient } from '@/utils/dxJSSDK';
import { pikeStart, pikeStop } from '@/services/pikeService';
import { PageDataService } from '@/services/pageData';

/**
 * 检查版本更新
 */
const getMis = () => {
  const pageData = PageDataService.get();
  return pageData?.userInfo?.mis;
};

const checkVersion = async () => {
  try {
    const version = await getVersion();
    const lastVersion = StorageService.getItem('schedule-version');
    StorageService.setItem('schedule-version', version);
    console.log(`current version ${version}, last version ${lastVersion}`);
    if (lastVersion && version && cprVersion(lastVersion, version)) {
      addResError('PageReLoad', '版本更新重新加载');
      dxJSSDK.pageReload();
    }
  } catch (e) {
    console.log(e);
  }
};

// 大象消息注册
export const addDXClientMessage = () => {
  // 大象环境中才可以使用JSSDK
  if (!((isPCDaxiang || isWebDaxiang) && !isRightSideDaxiang)) {
    return;
  }
  dxClient.on({
    type: 'notification',
    callback: (err, { rescode, data }) => {
      const notificationInfos = `err: ${JSON.stringify(
        err
      )} rescode: ${JSON.stringify(rescode)} data: ${JSON.stringify(data)}`;
      let nShow = true;
      if (data?.type === 'edit') {
        console.log('notification data: ', data?.data);
        // 行事情历编辑按钮传递的appKey是数值类型: 1,2,3,4,5
        const key = data.data?.appId || 1;
        // 创建日程
        window.nDxNotification = true;
        window.nDxScheduleId = data.data?.id;
        window.nDxAppKey = EApplicationsNumTypeArr[key - 1];
        window.nDxEmpId = data.data?.empId;
        window.nDxType = EDXEventType.BYADDICON;
        window.nDxStartTime = +data.data?.startTime;
        const event = new CustomEvent('dxNotification', {
          type: EDXEventType.BYADDICON
        });
        window.dispatchEvent(event);
        moduleClick('b_oa_kjubgrz7_mc', {
          userMis: getMis()
        });
        addResError('DXNotificationGet', '获取大象编辑信息', {
          info: notificationInfos
        });
      } else if (data.data?.id) {
        // 日程列表
        window.nDxNotification = true;
        window.nDxStartTime = +data.data?.startTime;
        window.nDxScheduleId = data.data?.id;
        window.nDxEmpId = data.data?.empId;
        window.nDxType = EDXEventType.BYDETAIL;
        const event = new CustomEvent('dxNotification', {
          type: EDXEventType.BYDETAIL
        });
        window.dispatchEvent(event);
        moduleClick('b_oa_yx1jivo6_mc', {
          userMis: getMis()
        });
        addResError('DXNotificationGet', '获取大象详情信息', {
          info: notificationInfos
        });
      } else if (JSON.stringify(data.data) === '{}') {
        // 日程图标点击
        // 点击日程图标的时候，触发版本检查
        if (window.location?.pathname !== '/edit') {
          checkVersion();
        }
        if (!StorageService.getItem('schedule-status')) {
          window.nDxNotification = true;
          window.nDxStartTime = 0;
          window.nDxScheduleId = null;
          window.nDxEmpId = null;
          window.nDxType = EDXEventType.BYICON;
          const event = new CustomEvent('dxNotification', {
            type: EDXEventType.BYICON
          });
          window.dispatchEvent(event);
          addResError('DXNotificationGet', '获取大象信息且日程打开需处理', {
            info: notificationInfos
          });
        } else {
          addResError('DXNotificationGet', '获取大象信息且日程已打开无需处理');
          console.log('get infos from notification, but the app is Openning');
        }
        moduleClick('b_oa_xk854gqq_mc', {
          userMis: getMis()
        });
      } else {
        nShow = false;
      }
      // 处理完成后再设置打开状态为打开
      if (nShow) {
        StorageService.setItem('schedule-status', true);
      }
    }
  });

  // 日程隐藏
  dxClient.on({
    type: 'hide',
    callback: () => {
      StorageService.setItem('schedule-status', false);
      if (window.location?.pathname !== '/edit') {
        pikeStop();
        // 关闭日程列表页日程弹框详情
        window.mobx_app.mobx_stores.detail.closeDetailPop();
      }
    }
  });

  // 日程显示
  dxClient.on({
    type: 'show',
    callback: () => {
      if (window.location?.pathname !== '/edit') {
        pikeStart();
      }
      // 调整 raptor及灵犀 PV
      if (window.Owl) {
        // eslint-disable-next-line
        Owl.resetPv();
      }
      pageView('c_oa_7cpek44f', {
        userMis: getMis()
      });
    }
  });

  // 拉取离线消息后，再分发到注册的事件上
  dxClient.request({
    type: 'offline',
    callback: (err, res) => {
      dxClient.distribute(res);
    }
  });
};
