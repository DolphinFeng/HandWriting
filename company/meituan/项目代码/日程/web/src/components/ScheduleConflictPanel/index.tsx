import { i18nClient } from '@sailor/i18n-web';
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { observable } from 'mobx';
import dayjs from 'dayjs';
import classNames from 'classnames';
import {
  Button, Icon, Popover, DatePicker
} from '@ss/mtd-react';
import { ScheduleConflict } from '@/components';
import GlobalStore from '@/store/global';
import { addModuleClick } from '@/services/lxService';
import { week } from '@/components/DateTimePicker/const';
import GroupUserSelect from '@/components/ScheduleConflict/GroupUserSelect';
import { MAX_CONFLICT_NO, KEY_CODE } from '@/utils';
import { dayjsWithTimeZone } from '@/utils/time';
import styles from './index.less';

// 参数
interface IPropsType {
  scheduleConflictPanelStore?: any; // Store
  global?: GlobalStore;
  setStartAndHeight?: any;
  removePerson?: any;
  createCallBack?: any;
  nCanCreate?: boolean;
  chatId?: string;
  chatType?: string;
  changeAttances?: any;
  isInMeetingNoJump: boolean;
  userList?: any;
  isAllDay: number;
  setKeyPerson?: any;
  showSortTips?: boolean;
  closeShowSortTips?: any;
  isPublicCalendar: boolean;
}

/**
 * 日程冲突面板
 */
@inject(({ scheduleEditStore, global }) => ({
  scheduleConflictPanelStore: scheduleEditStore.scheduleConflictPanelStore,
  global
}))
@observer
export default class extends Component<IPropsType> {
  @observable isToday = false;
  @observable nIsPickerOpening = false;
  @observable setNeedAutoHidden = true;
  @observable userTimeZone = [];

  componentDidMount() {
    this.timeUpdate();
  }

  timeUpdate = () => {
    const {
      scheduleConflictPanelStore: { startTime }
    } = this.props;
    this.isToday = dayjs().isSame(startTime, 'day');
  };

  preDay = () => {
    const {
      isInMeetingNoJump,
      chatType,
      scheduleConflictPanelStore: { preDay }
    } = this.props;
    if (isInMeetingNoJump) {
      addModuleClick('b_oa_r0zezmzr_mc', { chatType });
    }
    preDay && preDay();
    this.timeUpdate();
  };

  nextDay = () => {
    const {
      isInMeetingNoJump,
      chatType,
      scheduleConflictPanelStore: { nextDay }
    } = this.props;
    if (isInMeetingNoJump) {
      addModuleClick('b_oa_r0zezmzr_mc', { chatType });
    }
    nextDay && nextDay();
    this.timeUpdate();
  };

  selectDay = (time) => {
    const {
      isInMeetingNoJump,
      chatType,
      scheduleConflictPanelStore: { selectDay }
    } = this.props;
    if (isInMeetingNoJump) {
      addModuleClick('b_oa_y81ukdcg_mc', { chatType });
    }
    selectDay && selectDay(time);
    this.timeUpdate();
  };

  setStartAndHeight = (start, height) => {
    const { setStartAndHeight } = this.props;
    setStartAndHeight && setStartAndHeight(start, height);
  };

  setKeyPerson = (empId) => {
    const { setKeyPerson } = this.props.scheduleConflictPanelStore;
    setKeyPerson(empId);
    this.props.setKeyPerson && this.props.setKeyPerson();
  };

  removePerson = (empId) => {
    this.props.removePerson && this.props.removePerson(empId);
  };

  handleChangeDate = (value: number) => {
    this.selectDay(value);
  };

  render() {
    const {
      scheduleConflictPanelStore: {
        startTime,
        endTime,
        scheduleStart,
        scheduleHeight,
        useConflictList,
        currentUseConflictList,
        conflictCount,
        noCheckConflit,
        today,
        originStartTime,
        attendees,
        noTime,
        selfDetailScheduleList,
        failed,
        recommendPeriod
      },
      global: { currentUser },
      createCallBack,
      nCanCreate,
      chatId,
      chatType,
      changeAttances,
      isInMeetingNoJump,
      userList,
      isAllDay,
      showSortTips,
      closeShowSortTips,
      isPublicCalendar
    } = this.props;
    // # TODOs 进入编辑页失效
    const time = startTime || dayjs().valueOf();

    // 是选中块的那一天
    const isCurrentDay = originStartTime === startTime;
    const isMaxPerson = !isPublicCalendar && attendees && attendees.length > MAX_CONFLICT_NO;
    const showBtns = (isCurrentDay && !isInMeetingNoJump)
      || (this.isToday && isInMeetingNoJump);

    // 同天结束24点特殊处理
    const isSameDayWith24 = endTime === dayjs(startTime).add(1, 'days').startOf('days').valueOf();
    const hasdragableItem = isCurrentDay && !noCheckConflit; // 是否有选中的select块
    const isOverDay = !noTime && (!dayjs(time).isSame(endTime, 'days') && !isSameDayWith24); // 跨天日程
    const getUserStartTime = () => {
      // 全天日程，开始时间的当天开始时间 是否权限日程（全天日程，使用当天：00:00 时间）
      if (!noTime && isAllDay === 1) {
        const allDayTime = dayjs(time).startOf('date').valueOf();
        return allDayTime;
      }
      if (hasdragableItem || isOverDay) {
        // 选择了时间块, 或则没有时间块的跨天日程
        return time;
      }
      // 应该获取header组件内的currentTime
      return dayjs().valueOf();
    };

    // 计算不同时区的偏移量（当前用户使用，本地偏移）
    const getUserTimeZoneOffset = (empId) => {
      if (currentUser?.empId === empId) return new Date().getTimezoneOffset() * -1;
      const userInfo = this.userTimeZone.find(item => item.empId === empId);
      const tz = userInfo?.timeZone || 'Asia/Shanghai';
      const userStartTime = getUserStartTime();
      const offset = dayjsWithTimeZone(userStartTime, tz).utcOffset();
      return offset;
    };
    // 判定用户是否需要过滤
    const needFilter = (empId) => {
      if (currentUser?.empId === empId) return false;
      const userInfo = this.userTimeZone.find(item => item.empId === empId);
      return userInfo?.isHide;
    };
    // 判定除当前用户没有其他参与人或所有参与人在相同时区（偏移量相同），参与人数大于50， 如果是公共日程（只显示自己）
    const useConflictList_temp = useConflictList.filter(element => !needFilter(element?.empId));
    const notShowTimezone = useConflictList_temp.length < 2 || useConflictList_temp.length > 50 || isPublicCalendar
      || useConflictList_temp.every(element => getUserTimeZoneOffset(element?.empId) === getUserTimeZoneOffset(useConflictList_temp[0]?.empId));


    const headerHeight = notShowTimezone ? 76 : 115; // 可根据判断
    const minWidth = notShowTimezone ? 76 : 68;

    const getTimeOffset = () => {
      const offset = new Date().getTimezoneOffset() * -1;
      const offsetHour = Math.floor(offset / 60);
      const offsetMin = offset % 60;
      const str = `GMT${offset >= 0 ? '+' : ''}${offsetHour}${offsetMin > 0 ? ':' : ''}${offsetMin || ''}`;
      return str;
    };

    const popDiv = (
      <div className="pop-infos">
        <div>
          <p>
            {i18nClient.t(
              'schedule_conflict_panel_maintained_by_group',
              '此列表由群成员共同维护: '
            )}
          </p>
          <p>
            {i18nClient.t(
              'schedule_conflict_panel_set_members_limit',
              '设置成员的范围、排序将对所有群成员可见'
            )}
          </p>
        </div>
        <Icon onClick={closeShowSortTips} type="close" />
      </div>
    );

    return (
      <div
        className={styles.container}
        style={isInMeetingNoJump ? { padding: 0 } : {}}
      >
        <div className={styles.header}>
          <div className={styles.hBlock} style={{ height: headerHeight }}>
            {isInMeetingNoJump && chatType && (
              <GroupUserSelect
                useConflictList={useConflictList}
                chatId={chatId}
                chatType={chatType}
                changeAttances={changeAttances}
                currentEmpId={currentUser?.empId}
                userList={userList}
              />
            )}
            {!notShowTimezone && <div className={styles.timeline}>{getTimeOffset()}</div>}
          </div>
          <Button
            onClick={() => {
              if (!showBtns) {
                today(isInMeetingNoJump);
                this.timeUpdate();
                if (isInMeetingNoJump) {
                  addModuleClick('b_oa_l8nspk7k_mc', { chatType });
                }
              }
            }}
            className={classNames(styles.startBtn, {
              [styles.startDisabled]: showBtns
            })}
            tabIndex={-1}
          >
            {isInMeetingNoJump
              ? i18nClient.t('schedule_conflict_panel_today', '今天')
              : i18nClient.t('schedule_conflict_panel_start_day', '起始天')}
          </Button>
          <div
            tabIndex={0}
            className={styles.iconContainer}
            onKeyDown={e => e.keyCode === KEY_CODE.ENTER && this.preDay()}
          >
            <Icon
              onClick={this.preDay}
              className={styles.iconLeft}
              type={'left'}
            />
          </div>
          <div
            tabIndex={0}
            className={styles.iconContainer}
            onKeyDown={e => e.keyCode === KEY_CODE.ENTER && this.nextDay()}
            onFocus={() => {
              this.setNeedAutoHidden = false;
            }}
          >
            <Icon
              onClick={this.nextDay}
              className={styles.iconRight}
              type={'right'}
            />
          </div>
          {time && (
            <div>
              <DatePicker
                value={time}
                className={classNames(styles.currentDatePicker, {
                  [styles.pikerOpen]: this.nIsPickerOpening,
                  [styles.datePickerWidthEn]: i18nClient.language === 'en',
                  [styles.datePickerWidthHK]: i18nClient.language === 'zh-HK',
                })}
                onChange={this.handleChangeDate}
                onFocus={(): void => {
                  this.nIsPickerOpening = true;
                  this.setNeedAutoHidden = true;
                }}
                onBlur={(): void => {
                  this.nIsPickerOpening = false;
                }}
                valueFormat="timestamp"
                key={time}
                format={i18nClient.t(
                  'schedule_conflict_panel_month_day',
                  'MM月DD日 {getDay}',
                  { getDay: week[dayjs(time).get('day')] }
                )}
                clearable={false}
                popLayer={{
                  className: this.setNeedAutoHidden
                    ? ''
                    : styles.hiddenDatePicker
                }}
              />
              {/* picker打开时候放一个隐藏div方便点击失焦关闭 */}
              {this.nIsPickerOpening && <div className={styles.pickerBro} />}
            </div>
          )}
          {!noCheckConflit
            && conflictCount !== 0
            && !isMaxPerson
            && !isInMeetingNoJump && (
              <span className={styles.tag}>
                {conflictCount <= 1
                  && i18nClient.t(
                    'schedule_conflict_panel_one_person',
                    '日程冲突 {conflictCount} 人',
                    {
                      conflictCount
                    }
                  )}
                {conflictCount > 1
                  && i18nClient.t(
                    'schedule_conflict_panel_conflictCount_persons',
                    '日程冲突 {conflictCount} 人',
                    {
                      conflictCount
                    }
                  )}
              </span>
          )}
        </div>
        <Popover
          autoDestory
          placement={'top'}
          className="block-popover-custom"
          content={popDiv}
          visible={showSortTips}
          align={{ offset: [0, 10] }}
          style={{ width: 260, maxWidth: 300 }}
        >
          <div
            className={styles.main}
            tabIndex={0}
            onFocus={() => {
              this.setNeedAutoHidden = false;
            }}
          >
            {isMaxPerson && (
              <div className={styles.cover}>
                <div>
                  <p>
                    {MAX_CONFLICT_NO <= 1
                      && i18nClient.t(
                        'schedule_conflict_panel_support_one_person',
                        '仅支持 {MAX_CONFLICT_NO} 人及以内日程忙闲预览',
                        { MAX_CONFLICT_NO }
                      )}
                    {MAX_CONFLICT_NO > 1
                      && i18nClient.t(
                        'schedule_conflict_panel_support_max_conflict_persons',
                        '仅支持 {MAX_CONFLICT_NO} 人及以内日程忙闲预览',
                        { MAX_CONFLICT_NO }
                      )}
                  </p>
                  <p>
                    {i18nClient.t(
                      'schedule_conflict_panel_recommended_watch_key_members',
                      '建议您优先关注关键成员'
                    )}
                  </p>
                </div>
              </div>
            )}
            {failed && !isMaxPerson && (
              <div className={styles.cover}>
                <div>
                  <p>
                    {i18nClient.t(
                      'schedule_conflict_panel_loading_failed',
                      '加载失败，请关闭应用后重试'
                    )}
                  </p>
                </div>
              </div>
            )}
            {time && (
              <ScheduleConflict
                timeUpdate={this.timeUpdate}
                isToday={this.isToday}
                isCurrentDay={isCurrentDay}
                mis={currentUser?.mis}
                currentUser={currentUser}
                scheduleStart={scheduleStart}
                scheduleHeight={scheduleHeight}
                useConflictList={
                  isPublicCalendar ? [currentUser] : useConflictList
                }
                // 用户的时区信息
                userTimeZone={this.userTimeZone}
                handelTimeZoneChange={(list) => { this.userTimeZone = list; }}
                // 不否展示头部时区
                notShowTimezone={notShowTimezone}
                // 头部高度
                headerHeight={headerHeight}
                // 头部宽度
                minWidth={minWidth}
                currentUseConflictList={
                  isPublicCalendar ? [currentUser] : currentUseConflictList
                }
                conflictCount={conflictCount}
                noCheckConflit={noCheckConflit}
                isMaxPerson={isMaxPerson}
                setStartAndHeight={this.setStartAndHeight}
                setKeyPerson={this.setKeyPerson}
                removePerson={this.removePerson}
                noTime={noTime}
                createCallBack={createCallBack}
                nCanCreate={nCanCreate}
                selfDetailScheduleList={selfDetailScheduleList}
                startTime={time}
                endTime={endTime}
                isAllDay={isAllDay}
                isInMeetingNoJump={isInMeetingNoJump}
                chatId={chatId}
                chatType={chatType}
                recommendPeriod={recommendPeriod}
              />
            )}
          </div>
        </Popover>
      </div>
    );
  }
}
