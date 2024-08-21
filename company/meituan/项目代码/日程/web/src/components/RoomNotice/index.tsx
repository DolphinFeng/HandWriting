import { i18nClient } from '@sailor/i18n-web';
/*
 * @Description: 文件描述
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2021-05-18 21:32:59
 * @LastEditors: chenbaiyu
 * @LastEditTime: 2022-07-21 17:37:31
 * @FilePath: /scheduleweb/src/components/RoomNotice/index.tsx
 */

import React from 'react';
import { PageDataService } from '@/services/pageData.js';

import styles from './index.less';

const RoomNotice = ({ roomInfo, source }) => {
  if (source === 'create-meeting') {
    if (!roomInfo || !roomInfo.equipId) return <></>;
    let tips = '';
    switch (+roomInfo.equipId) {
      case 7: // zoom
        tips = i18nClient.t('room_notice_support_video_conferencing', '支持视频会议、投屏');
        break;
      case 8: // 无线投屏
        tips = i18nClient.t('room_notice_support_conferencing_only', '仅支持无线投屏');
        break;
      default:
        break;
    }
    if (!tips) return <></>;
    // 定会议室页面创建日程时，文案和日程首页的卡片以及侧边栏不同
    return (<div className={styles['room-type']}>
    <div className='placeholder' />
    <span className='toolText'>{tips}</span>
  </div>);
  }
  const specialRoomType = PageDataService.get().lionConfig?.roomTipsConfig;
  // 1.有会议室信息 2.有特殊会议室类型信息 3.会议室为特殊类型 4.当前特殊类型需要展示文案
  return roomInfo && specialRoomType && specialRoomType[roomInfo.equipId] && specialRoomType[roomInfo.equipId].show ? (
    <div className={styles['room-type']}>
      <div className='placeholder' />
      <span
        className='toolText'
        dangerouslySetInnerHTML={{ __html: specialRoomType[roomInfo.equipId].content }}
      />
    </div>
  ) : <></>;
};

export default RoomNotice;
