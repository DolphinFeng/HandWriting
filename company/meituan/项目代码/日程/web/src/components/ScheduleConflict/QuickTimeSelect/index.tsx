import { i18nClient } from '@sailor/i18n-web';
import React, { useEffect, useState, useRef } from 'react';
import classNames from 'classnames';
import { Icon } from '@ss/mtd-react';
import { addModuleClick } from '@/services/lxService';
import { StorageService } from '@/services/storage';
import styles from './index.less';

interface IScheduleBlockPos {
  start: number;
  distance: number;
}

// 把 [0, 1, 0 ...]忙闲字段解析成空闲段
export const getFreeDistance = (periodList: number[]): IScheduleBlockPos[] => {
  let firstIndex = -1;
  const freeList: any[] = [];
  for (let i = 0; i < periodList?.length; i++) {
    if (periodList[i] === 0) {
      if (firstIndex === -1) {
        firstIndex = i;
        if (i + 1 === periodList.length || periodList[i + 1] === 1) {
          freeList.push({
            start: firstIndex,
            distance: 1
          });
          firstIndex = -1;
        }
      } else if (i + 1 === periodList.length || periodList[i + 1] === 1) {
        freeList.push({
          start: firstIndex,
          distance: i - firstIndex + 1
        });
        firstIndex = -1;
      }
    }
  }
  return freeList;
};

const closeReminder = 'CLOSE_REMINDER';

const getBufFromNumber = (no: number) => (no < 10 ? `0${no}` : `${no}`);

const getMuniteBuffer = (no: number) => {
  switch (no) {
    case 1:
      return '15';
    case 2:
      return '30';
    case 3:
      return '45';
    default:
      return '00';
  }
};
const getBufferByQuota = quota => `${getBufFromNumber(Math.floor(quota / 4))}:${getMuniteBuffer(quota % 4)}`;

export default function QuickTimeSelect({
  recommendPeriod,
  setStartAndEnd,
  scheduleStart,
  scheduleHeight,
  isCurrentDay,
  usersNo
}) {
  const [close, setClose] = useState(StorageService.getItem(closeReminder));

  const [rightPos, setRight] = useState(0);

  const freeList: IScheduleBlockPos[] = getFreeDistance(recommendPeriod);

  const quickTimeRef = useRef(null);

  const closeQReminder = () => {
    setClose(true);
    StorageService.setItem(closeReminder, true);
  };

  const setTime = (start: number, height: number) => {
    setStartAndEnd && setStartAndEnd(start, height);
    closeQReminder();
    addModuleClick('b_oa_96f68zjm_mc');
  };

  const calcPos = () => {
    if (quickTimeRef && quickTimeRef.current) {
      const { right } = quickTimeRef.current.getBoundingClientRect();
      setRight(document.body.clientWidth - right);
    }
  };

  useEffect(() => {
    calcPos();
    window.addEventListener('resize', calcPos);
    return () => {
      window.removeEventListener('resize', calcPos);
    };
  });

  const renderTimeItem = (item: IScheduleBlockPos, index: number) => {
    const unShow = isCurrentDay
      && scheduleStart === item.start
      && scheduleHeight === item.distance;
    // 时间段完全和推荐时间段一致 不hover

    return (
      <div
        ref={quickTimeRef}
        key={index}
        className={styles.quickTime}
        style={{
          top: item.start * 12,
          height: item.distance * 12 - 1
        }}
        onMouseEnter={() => {
          addModuleClick('b_oa_kmrevjk9_mc');
        }}
        onClick={() => {
          setTime(item.start, item.distance);
        }}
      >
        <p className={styles.time}>{getBufferByQuota(item.start)}</p>
        <p className={classNames(styles.time, styles.bottomTime)}>
          {getBufferByQuota(item.start + item.distance)}
        </p>
        <div className={styles.quickTimeSub}>
          {!unShow && (
            <div
              onClick={() => {
                setTime(item.start, item.distance);
              }}
              className={styles.selectArea}
              style={{ right: -rightPos }}
            >
              {usersNo <= 1 && (
                <span>
                  {i18nClient.t(
                    'quick_time_select_this_free_can_select',
                    '此时段空闲，点击可选中'
                  )}
                </span>
              )}
              {usersNo > 1 && (
                <span>
                  {i18nClient.t(
                    'quick_time_select_these_free_can_select',
                    '此时段大家都空闲，点击可选中'
                  )}
                </span>
              )}
            </div>
          )}
        </div>
        <div className={styles.quickLine} />
        {index === 0 && !close && (
          <div className={styles.pop}>
            <div className={styles.rect}>
              {usersNo <= 1 && (
                <p>
                  {i18nClient.t(
                    'quick_time_select_mark_this_free_can_select',
                    '已标出空闲的时段， 点击可直接选中'
                  )}
                </p>
              )}
              {usersNo > 1 && (
                <p>
                  {i18nClient.t(
                    'quick_time_select_mark_these_free_can_select',
                    '已标出大家都空闲的时段， 点击可直接选中'
                  )}
                </p>
              )}

              <Icon
                onClick={closeQReminder}
                className={styles.close}
                type="close"
              />
            </div>
            <div className={styles.trangle} />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {freeList.map((item: IScheduleBlockPos, index: number) => renderTimeItem(item, index))}
    </>
  );
}
