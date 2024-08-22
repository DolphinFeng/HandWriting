/*
 * @Description: 日程详情页分享
 * @Author: zhouwenting02 <zhouwenting02@meituan.com>
 * @Date: 2021-04-26 17:51:12
 * @LastEditors: zhouwenting02
 * @LastEditTime: 2021-04-26 17:51:20
 * @FilePath: /scheduleweb/src/utils/share.ts
 */
import React from 'react';
import { i18nClient } from '@sailor/i18n-web';
import dxJSSDK from '@/utils/dxJSSDK';
import { shareToOther } from '@/services/apis';
import { messageStore } from '@/store/global';
import dx from './dxCalendar';

let msg = null;
const createMsgNode = (xmUid, type) => {
  const mode = React.createElement(
    'span',
    {
      className: 'txt',
      style: {
        color: '#0A70F5',
        display: 'inline-block',
        marginLeft: 40,
        cursor: 'pointer'
      },
      // 跳转指定的会话
      onClick() {
        dxJSSDK.openComment(xmUid, type); // type: chat | groupchat
        msg && msg.close();
      }
    },
    i18nClient.t('share_switch_to_the_session', '切换到该会话')
  );
  const reactNode = React.createElement(
    'div',
    {
      className: 'shareSuccessWrap',
      style: {
        fontSize: 14
      }
    },
    i18nClient.t('share_share_successfully', '分享成功'),
    mode
  );
  return reactNode;
};

const share = async (usersInfo, params) => {
  const { scheduleId, appKey, organizerEmpId } = params;
  try {
    const chatList = usersInfo.map((item) => {
      return {
        chatId: item.uid,
        chatType: item.sessionType || 'chat' // chat-单聊 groupchat-群聊
      };
    });
    console.log('Share: ', usersInfo, chatList, scheduleId, appKey);
    await shareToOther({
      chatList,
      scheduleId,
      appKey,
      organizerEmpId
    });
    if (chatList.length === 1) {
      const { chatType, chatId } = chatList[0];
      const node = createMsgNode(chatId, chatType);
      msg = messageStore.customSuccess(node);
    } else {
      messageStore.success(i18nClient.t('share_share_successfully', '分享成功'));
    }
  } catch (error) {
    messageStore.error(i18nClient.t('share_share_failed', '分享失败'));
  }
};

export default {
  shareToOther(params) {
    // 展示转发的 选人/选群 组件
    const selectPersonPanel = dxJSSDK.showSelectPerson();
    selectPersonPanel.then((res: any) => {
      if (res && res.ok) {
        console.log('prevUsersInfo: ', res.usersInfo);
        share(res.usersInfo, params);
      }
    });
  },
  dxShareToOther(params) {
    // 展示转发的 选人/选群 组件
    const selectPersonPanel = dx.openShare(params);
    console.log(selectPersonPanel);
    selectPersonPanel.then((res: any) => {
      if (res && res.success) {
        console.log('prevUsersInfo: ', res.usersInfo);
        share(res.usersInfo, params);
      }
    });
  }
};
