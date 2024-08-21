/*
 * @Description: 冲突日历头部显示
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2021-03-01 15:04:15
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2021-03-29 11:46:57
 * @FilePath: /scheduleweb/src/components/ScheduleConflict/ConflictHeader/index.tsx
 */
import { i18nClient } from '@sailor/i18n-web';
import dayImg from '@/asserts/images/day@2x.png';
import nightImg from '@/asserts/images/night@2x.png';
import cls from 'classnames';
import { dayjsWithTimeZone } from '@/utils/time';

import React, { useState, useEffect, useRef } from 'react';
import { addModuleClick } from '@/services/lxService';
import defaultImg from '@/asserts/images/default.png';
import dayjs from 'dayjs';

import { Icon } from '@ss/mtd-react';
import styles from './index.less';
import { debounce, isEqual } from 'lodash';
import { getAttendeeTimeZone } from '@/services/apis';


interface IConflictHeader {
  useConflictList: [];
  minWidth: number;
  setKeyPerson?: any;
  removePerson?: any;
  isInMeetingNoJump?: boolean;
  chatId?: any;
  chatType?: string;

  startTime?: number;
  hasdragableItem?: boolean;
  isAllDay?: boolean;
  isOverDay?: boolean;
  notShowTimezone?: boolean;
  headerHeight?: number;
  handelTimeZoneChange?: (res: any) => void;
  currentUser?: any;
}

const ConflictHeader = (props: IConflictHeader) => {
  const {
    useConflictList,
    minWidth,
    notShowTimezone,
    headerHeight,
    handelTimeZoneChange,
    currentUser
  } = props;

  const timerID = useRef<any>();
  const preCurrentUser = useRef([]); // 上次的用户信息

  const [currentTime, setCurrentTime] = useState(dayjs().valueOf());
  const [userTimeZone, setUserTimeZone] = useState([]);

  useEffect(() => {
    timerID.current = setInterval(
      () => tick(),
      30000 // 每分钟更新一次
    );
    return () => {
      clearInterval(timerID.current);
    };
  }, []);

  useEffect(() => {
    // 接口获取
    const userList = useConflictList.map(res => res.empId);
    if (!isEqual(preCurrentUser.current, userList)) {
      preCurrentUser.current = userList;
      if (useConflictList.length > 1 && useConflictList.length <= 50) {
        debounceFn();
      }
    }
  }, [useConflictList]);

  const debounceFn = debounce(() => getTimeZone(), 100);

  const getTimeZone = async () => {
    const users = useConflictList.map(res => res.empId);
    const res = await getAttendeeTimeZone({ empIdList: users });
    setUserTimeZone(res);
    handelTimeZoneChange(res);
  };

  const tick = () => {
    // 更新状态
    setCurrentTime(dayjs().valueOf());
  };

  const setKeyPerson = (empId) => {
    const {
      setKeyPerson, isInMeetingNoJump, chatId, chatType
    } = props;
    empId && setKeyPerson && setKeyPerson(empId);
    if (isInMeetingNoJump && chatType === 'groupchat') {
      addModuleClick('b_oa_thq6ixqe_mc', {
        chatType,
        chatId
      });
    } else {
      // 编辑或创建页 点击置于最左埋点
      addModuleClick('b_oa_0rp74ai5_mc');
    }
  };

  const removePerson = (empId) => {
    const {
      removePerson, isInMeetingNoJump, chatId, chatType
    } = props;
    empId && removePerson && removePerson(empId);
    if (isInMeetingNoJump && chatType === 'groupchat') {
      addModuleClick('b_oa_achnyw1s_mc', {
        chatType,
        chatId
      });
    } else {
      // 编辑或创建页 点击移除参与人 埋点
      addModuleClick('b_oa_8iqz8rt7_mc');
    }
  };

  const getUserTimeZone = (empId) => {
    // 如果是当前用户，则使用本地时区; 否则根据接口返回
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (currentUser?.empId === empId && tz) return tz;
    const userInfo = userTimeZone.find(item => item.empId === empId);
    return userInfo?.timeZone || 'Asia/Shanghai';
  };

  const needFilter = (empId) => {
    if (currentUser?.empId === empId) return false;
    const userInfo = userTimeZone.find(item => item.empId === empId);
    return userInfo?.isHide;
  };

  const getUserStartTime = () => {
    const {
      hasdragableItem,
      startTime,
      isAllDay,
      isOverDay
    } = props;
    if (isAllDay) {
      console.log(1);
      // 全天日程，开始时间的当天开始时间
      const time = dayjs(startTime).startOf('date').valueOf();
      return time;
    }
    if (hasdragableItem || isOverDay) {
      // 选择了时间块, 或则没有时间块的跨天日程
      return startTime;
    }
    return currentTime;
  };

  const userStartTime = getUserStartTime();
  // 是否全部都有英文名
  const isHasEnname = useConflictList.some(item => (item.enName));

  return (
    <div
      className={styles.header}
      style={{
        width:
          useConflictList && useConflictList.length
            ? minWidth * useConflictList.length
            : '100%', // 保障width足够长
        height: headerHeight
      }}
    >
      {(!useConflictList || useConflictList.length === 0) && (
        <div
          style={{
            background: '#f5f5f5',
            minWidth
          }}
          className={styles.cell}
        />
      )}
      {useConflictList
        && useConflictList.map((item: any, index) => {
          // 获取当前时间 获取选中的开始时间 根据用户时区显示时间标识
          // 获取时区 计算用户时区的时间
          const tz = getUserTimeZone(item.empId);
          const time = dayjsWithTimeZone(userStartTime, tz).format('HH:mm');
          // 判定是白天还是黑夜
          const hour = dayjsWithTimeZone(userStartTime, tz).format('H');
          let isDay = true;
          if (Number(hour) >= 6 && Number(hour) < 20) {
            isDay = true;
          } else {
            isDay = false;
          }
          // 获取GMT偏移
          const offset = dayjsWithTimeZone(userStartTime, tz).utcOffset();
          const offsetHour = Math.floor(offset / 60);
          const offsetMin = offset % 60;
          const str = `GMT${offset >= 0 ? '+' : ''}${offsetHour}${offsetMin > 0 ? ':' : ''}${offsetMin || ''}`;

          // 判定是否白名单 hideName 为undefiend 的时候啥也不展示
          const hideName = needFilter(item.empId);
          console.log(hideName, 'hidename');

          return (
            <div
              style={{
                minWidth,
                background: '#f5f5f5'
              }}
              className={styles.cell}
              key={index}
            >
              <div className={styles.imgContanier}>
                {item.isConflict && <Icon type="warning-circle" />}
                <img
                  width={28}
                  height={28}
                  className={styles.icon}
                  src={item.avatar || defaultImg}
                  alt={i18nClient.t(
                    'schedule_conflict_header_avatar',
                    '头像'
                  )}
                />
              </div>
              <div className={styles.name}>{item.name}</div>
              {/* 如果都没有英文名，需要高度为0 */}
              <div className={styles.name} style={{ height: isHasEnname ? 18 : 0 }}>{item.enName}</div>
              {!notShowTimezone && <>
                {/* 黑名单隐藏，刚选择时未获取时区信息hideName可能会为 undefiend；此时不展示 */}
                {hideName === true && <div className={cls(styles.day, styles.font10px, styles.white)}>{i18nClient.t(
                  'schedule_conflict_header_time_invisible',
                  '时区未展示'
                )}</div>}
                {hideName === true && <div className={styles.font10px}></div>}
                {/* 非黑名单 */}
                {hideName === false && (isDay ? <div className={cls(styles.day, styles.font10px)}>
                  <img src={dayImg} />
                  {time}
                </div> : <div className={cls(styles.night, styles.font10px)}>
                  <img src={nightImg} />
                  {time}
                </div>)}
                {hideName === false && <div className={styles.font10px}>{str}</div>}
              </>}
              <div className={styles.opts}>
                <p
                  onClick={() => {
                    setKeyPerson(item.empId);
                  }}
                >
                  {i18nClient.t(
                    'schedule_conflict_header_left_most',
                    '置于最左'
                  )}
                </p>
                <p
                  onClick={() => {
                    removePerson(item.empId);
                  }}
                  className={styles.del}
                >
                  {i18nClient.t(
                    'schedule_conflict_header_remove_member',
                    '移除成员'
                  )}
                </p>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default ConflictHeader;
