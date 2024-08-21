import React from 'react';
import classNames from 'classnames';
import CurrentTimeLabel from '../CurrentTimeLabel';
import { hours } from '../const';
import QuickTimeSelect from '../QuickTimeSelect';
import styles from './index.less';

export default function ConflictTimeLine({
  isToday,
  currentPos,
  isCurrentDay,
  noCheckConflit,
  topTimeBar,
  startTimeLabel,
  conflictCount,
  endTimeLabel,
  heghtLableSchedule,
  recommendPeriod,
  setStartAndHeight,
  scheduleStart,
  scheduleHeight,
  usersNo
}) {
  return (
    <div className={classNames(styles.timeColumn)}>
      {isToday && (
        // 自己margin的一部分 加上自身高度的一半
        <div style={{ top: currentPos + 11 - 4 }} className={styles.current}>
          <div className={styles.circle} />
        </div>
      )}
      {isCurrentDay && !noCheckConflit && (
        <CurrentTimeLabel
          topTimeBar={topTimeBar}
          startTimeLabel={startTimeLabel}
          conflictCount={conflictCount}
          endTimeLabel={endTimeLabel}
          heightSchedule={heghtLableSchedule}
        />
      )}
      {hours.map((item, index) => {
        return (
          <React.Fragment key={index}>
            <div className={styles.time}>
              {index <= 9 ? `0${index}:00` : `${index}:00`}
            </div>
            <div
              className={classNames(styles.time, styles.lTime)}
            >{`${index}:15`}</div>
            <div
              className={classNames(styles.time, styles.lTime)}
            >{`${index}:30`}</div>
            <div
              className={classNames(styles.time, styles.lTime)}
            >{`${index}:45`}</div>
          </React.Fragment>
        );
      })}
      <div className={styles.time}>{'24:00'}</div>
      <QuickTimeSelect
        usersNo={usersNo}
        scheduleStart={scheduleStart}
        scheduleHeight={scheduleHeight}
        recommendPeriod={recommendPeriod}
        setStartAndEnd={setStartAndHeight}
        isCurrentDay={isCurrentDay}
      />
    </div>
  );
}
