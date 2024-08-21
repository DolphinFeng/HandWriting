import { i18nClient } from '@sailor/i18n-web';
import React from 'react';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import dayjs from 'dayjs';
import ShowCol from '@/pages/newWeekly/CalendarTable/pureShowComponents/ShowCol';
import { hours } from './const';
import ConflictHeader from './ConflictHeader';
import DraggableContainer from './DraggableContainer';
import ConflictTimeLine from './ConflictTimeLine';

import styles from './index.less';

interface IScheduleConflictProps {
  isToday: boolean;
  scheduleStart: number;
  scheduleHeight: number;
  useConflictList: [];
  currentUseConflictList: [];
  conflictCount: number;
  noCheckConflit: boolean;
  startTime?: number;
  endTime?: number;
  mis: string;
  isMaxPerson: boolean;
  setStartAndHeight?: any;
  isCurrentDay?: boolean;
  setKeyPerson?: any;
  removePerson?: any;
  noTime: boolean;
  createCallBack?: boolean;
  nCanCreate?: boolean;
  selfDetailScheduleList?: any;
  isAllDay: number;
  isInMeetingNoJump: boolean;
  timeUpdate?: any;
  chatId?: any;
  chatType?: string;
  recommendPeriod?: number[];

  notShowTimezone?: boolean; // 是否展示头部时区
  headerHeight?: number;
  minWidth?: number;
  handelTimeZoneChange?: () => void;
  currentUser?: any;
}
/**
 * 冲突组件
 */
// 一小时格子的高度
const ONE_HOUR_HEIGHT = 48;
// 一刻钟格子的高度
const ONE_QUOTE_HEIGHT = ONE_HOUR_HEIGHT / 4;
@observer
export default class ScheduleConflict extends React.Component<IScheduleConflictProps> {
  @observable currentPos = 0;

  // 正在拖拽中 拖拽中不显示时间和忙闲 （后续可优化）
  @observable isDragging = false;

  @observable draggingHeight = 0;

  @observable draggingTop = 0;

  containerRef: HTMLDivElement = null;

  currentUpdateInterval = null;

  componentDidMount() {
    this.scrollToTarget();
    this.updateCurrentDiv();
    this.currentUpdateInterval = setInterval(() => {
      this.updateCurrentDiv();
    }, 1000 * 30);
  }

  componentWillUnmount() {
    if (this.currentUpdateInterval) {
      clearInterval(this.currentUpdateInterval);
    }
  }

  scrollToTarget = () => {
    setTimeout(() => {
      // 滚动到开始时间的3个小时前 +12 为上方预留了一段高度
      if (this.containerRef) {
        this.containerRef.scrollTop = this.props.scheduleStart * ONE_QUOTE_HEIGHT
          - ONE_HOUR_HEIGHT * 3
          + 12;
      }
    }, 0);
  };

  updateCurrentDiv = () => {
    const { timeUpdate } = this.props;
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    this.currentPos = parseInt(
      `${((currentHour * 60 + currentMinute) * ONE_HOUR_HEIGHT) / 60}`,
      10
    );
    timeUpdate && timeUpdate();
  };

  setStartAndHeight = (start, height) => {
    // 和render中topSchedule转换相对反 注意同时调整
    const { setStartAndHeight } = this.props;
    setStartAndHeight && setStartAndHeight(start, height);
  };

  setDraggingTimeQuote = (top, height) => {
    this.draggingHeight = height;
    this.draggingTop = top;
  };

  render() {
    const {
      scheduleStart,
      scheduleHeight,
      useConflictList,
      currentUseConflictList,
      conflictCount,
      startTime,
      endTime,
      isAllDay,
      setKeyPerson,
      removePerson,
      isToday,
      isCurrentDay,
      createCallBack,
      nCanCreate,
      noCheckConflit,
      noTime,
      selfDetailScheduleList,
      isInMeetingNoJump,
      chatId,
      chatType,
      recommendPeriod,
      notShowTimezone, // 是否展示头部时区
      headerHeight,
      minWidth,
      handelTimeZoneChange,
      currentUser
    } = this.props;

    const topSchedule: number = scheduleStart * ONE_QUOTE_HEIGHT + 1;
    const heightSchedule: number = scheduleHeight * ONE_QUOTE_HEIGHT - 3;
    let topTimeBar: number = scheduleStart * ONE_QUOTE_HEIGHT;
    let startTimeLabel = dayjs(startTime).format('HH:mm');
    let endTimeLabel = dayjs(endTime).format('HH:mm');
    let heghtLableSchedule: number = heightSchedule;
    if (this.isDragging) {
      topTimeBar = this.draggingTop * ONE_QUOTE_HEIGHT;
      heghtLableSchedule = this.draggingHeight * ONE_QUOTE_HEIGHT - 3;
      startTimeLabel = dayjs()
        .set({
          hour: parseInt(`${this.draggingTop / 4}`, 10),
          minute: parseInt(`${this.draggingTop % 4}`, 10) * 15
        })
        .format('HH:mm');
      endTimeLabel = dayjs()
        .set({
          hour: parseInt(`${(this.draggingTop + this.draggingHeight) / 4}`, 10),
          minute:
            parseInt(`${(this.draggingTop + this.draggingHeight) % 4}`, 10) * 15
        })
        .format('HH:mm');
    }

    // 同天结束24点特殊处理
    const isSameDayWith24 = endTime === dayjs(startTime).add(1, 'days').startOf('days').valueOf();

    const isAllDayOrOverDay = !noTime
      && (isAllDay === 1
        || (!dayjs(startTime).isSame(endTime, 'days') && !isSameDayWith24));

    const height = 128 + headerHeight;
    const noJUmHeight = 168 + headerHeight;
    return (
      <div
        ref={(ref: HTMLDivElement): void => {
          this.containerRef = ref;
        }}
        className={styles.container}
      >
        {/* 判断条件确定线条高度 */}
        {isToday && (
          <div
            style={{ top: this.currentPos + headerHeight + 24 + 3 }}
            className={styles.current}
          >
            <div
              className={styles.line}
              style={{
                width:
                  useConflictList && useConflictList.length
                    ? minWidth * useConflictList.length
                    : '100%' // 保障width足够长
              }}
            />
          </div>
        )}
        <ConflictHeader
          setKeyPerson={setKeyPerson}
          removePerson={removePerson}
          minWidth={minWidth}
          useConflictList={useConflictList}
          isInMeetingNoJump={isInMeetingNoJump}
          chatId={chatId}
          chatType={chatType}
          startTime={startTime} // drag块开始时间
          headerHeight={headerHeight} // 头部高度
          notShowTimezone={notShowTimezone} // 是否展示个人时区时间
          hasdragableItem={isCurrentDay && !noCheckConflit} // 是否有选中的select块
          isAllDay={!noTime && isAllDay === 1} // 是否权限日程（全天日程，使用当天：00:00 时间）
          isOverDay={!noTime && (!dayjs(startTime).isSame(endTime, 'days') && !isSameDayWith24)} // 跨天日程
          handelTimeZoneChange={handelTimeZoneChange}
          currentUser={currentUser}
        />
        <div
          className={styles.table}
          style={{
            width:
              useConflictList && useConflictList.length
                ? 63 + minWidth * useConflictList.length
                : '100%',
            height: isInMeetingNoJump
              ? `calc(100vh - ${noJUmHeight}px)`
              : `calc(100vh - ${height}px)`
          }}
        >
          {!isAllDayOrOverDay && (
            <DraggableContainer
              setIsDragging={(value) => {
                this.isDragging = value;
              }}
              noCheckConflit={noCheckConflit}
              noTime={noTime}
              top={topSchedule}
              height={heightSchedule}
              conflictCount={conflictCount}
              setStartAndHeight={this.setStartAndHeight}
              quetoHeight={ONE_QUOTE_HEIGHT}
              isCurrentDay={isCurrentDay}
              nCanCreate={nCanCreate}
              createCallBack={createCallBack}
              setDraggingTimeQuote={this.setDraggingTimeQuote}
              chatType={chatType}
            />
          )}

          <ConflictTimeLine
            scheduleStart={scheduleStart}
            scheduleHeight={scheduleHeight}
            isToday={isToday}
            currentPos={this.currentPos}
            isCurrentDay={isCurrentDay}
            noCheckConflit={noCheckConflit}
            topTimeBar={topTimeBar}
            startTimeLabel={startTimeLabel}
            conflictCount={conflictCount}
            usersNo={useConflictList && useConflictList.length}
            endTimeLabel={endTimeLabel}
            heghtLableSchedule={heghtLableSchedule}
            recommendPeriod={recommendPeriod}
            setStartAndHeight={this.setStartAndHeight}
          />

          {(!useConflictList || useConflictList.length === 0) && (
            <div className={styles.column} key={'zw'}>
              {hours.map((item, hIndex) => {
                return (
                  <div className={styles.cell} key={`${'zw'}-${hIndex}`} />
                );
              })}
            </div>
          )}
          {currentUseConflictList.map((userItem, index) => {
            return (
              <div className={styles.column} style={{ minWidth }} key={index}>
                {hours.map((item, hIndex) => {
                  return (
                    <div className={styles.cell} key={`${index}-${hIndex}`} />
                  );
                })}
                {index !== 0 && (
                  <div className="wk-col-events">
                    {/* TODO: 完全切换成堆叠日历布局 */}
                    {/* 401的时候可能出现busy为null的问题 */}
                    {userItem?.busy?.map((bItem, bIndex) => {
                      return (
                        <div
                          className={styles.busy}
                          key={`${index}-${bIndex}`}
                          style={{
                            top: bItem.start * ONE_QUOTE_HEIGHT - 1,
                            height: bItem.distance * ONE_QUOTE_HEIGHT - 1
                          }}
                        >
                          {/* 大于一刻钟再显示 */}
                          <p>
                            {bItem.distance === 1
                              ? ''
                              : i18nClient.t(
                                'schedule_conflict_name_busy',
                                '{name}-忙碌',
                                { name: userItem.name }
                              )}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
                {index === 0 && (
                  <ShowCol
                    events={selfDetailScheduleList}
                    targetDate={new Date(startTime)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
