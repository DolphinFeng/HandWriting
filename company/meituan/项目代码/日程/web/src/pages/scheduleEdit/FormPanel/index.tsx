import { i18nClient } from '@sailor/i18n-web';
import React, { Component } from 'react';
import { observable } from 'mobx';
import dayjs from 'dayjs';
import classNames from 'classnames';
import { cloneDeep } from 'lodash';
import { inject, observer } from 'mobx-react';
import { Input, Icon } from '@ss/mtd-react';
import {
  DateTimePicker,
  Address,
  UserSelect,
  Remind,
  Repeat,
  Remark,
  Recurrence,
  CalendarSelector
} from '@/components';
import {
  remindAlldayOption,
  remindNotAlldayOption
} from '@/components/Remind/const';
import {
  getQuaterMinuteMoment,
  changeDateOnly,
  initMtdTabIndex,
  KEY_CODE,
  getEnname
} from '@/utils';
import { getSchedules } from '@/services/weekly';
import { messageStore } from '@/store/global';
import { addModuleClick } from '@/services/lxService';
import {
  DEFAULT_REC_PATTERN,
  ERecurrenceShowType,
  ERecurrenceType,
  IRecurrencePattern
} from '@/consts/recurrenceType';
import GroupUserSelectPanel from '../GroupUserSelectPanel';
import MeetingModalPanel from '../MeetingModalPanel';
import { isChangeRepeatRule } from '../compare';
import { StorageService } from '@/services/storage';
import { getCreatableCalendars } from '@/services/apis';
import styles from './index.less';

import { colorNumToStr } from '@/utils/color';

// 参数
interface IPropsType {
  location?: any;
  formPanelStore?: any; // Store
  originFormPanelStore?: any;
  scheduleConflictPanelStore?: any; // Store
  meetingModalPanelStore?: any;
  globalStore?: any; // Store
  originData?: any;
  id?: string;
  appKey?: string;
  itemChangeCallback: () => void;
  setData?: (data: any) => void;
  escStack?: any;
  changeEsc?: Function;
}
const popLayerConfig = {
  getContainer: (): HTMLElement => document.querySelector('.panelPopParent')
};
/**
 * 日程创建、编辑表单
 */
@inject(({ scheduleEditStore, global }) => ({
  formPanelStore: scheduleEditStore.formPanelStore,
  originFormPanelStore: scheduleEditStore.originFormPanelStore,
  scheduleConflictPanelStore: scheduleEditStore.scheduleConflictPanelStore,
  meetingModalPanelStore: scheduleEditStore.meetingModalPanelStore,
  setData: scheduleEditStore.setData,
  globalStore: global
}))
@observer
export default class FormPanel extends Component<IPropsType> {
  titleRef = null;

  datePickerRef = { current: { closeDateTimePicker: Function } };

  useSelectRef = null;

  remindRef = { current: { closeRemind: Function } };

  repeatRef = { current: { closeRepeat: Function } };

  recurrenceRef = { current: { closeRecurrence: Function } };

  @observable meetingAvaliableMessage = null;

  @observable groupUserDialogShowing = false;

  @observable originMeeting = null; // 初始会议室

  @observable isChangeMeeting = false; // 是否修改或删除了会议室

  // 初始化的循环规则
  @observable
  originRecurrencePattern?: IRecurrencePattern = DEFAULT_REC_PATTERN;

  @observable originRecurrenceDescription? = null;

  constructor(props) {
    super(props);
    const {
      formPanelStore: { setData }
    } = this.props;
    setData(this.getDefaultData());
  }

  componentDidMount() {
    // eslint-disable-next-line no-unused-expressions
    const {
      formPanelStore,
      scheduleConflictPanelStore,
      meetingModalPanelStore,
      id,
      originData,
      globalStore: { currentUser }
    } = this.props;
    scheduleConflictPanelStore.init();
    meetingModalPanelStore.init();
    const defaultData = this.getDefaultData();
    if (originData && originData.from !== 'dx') {
      const {
        roomName,
        locationId,
        locationMail,
        isAllDay,
        recurrencePattern
      } = originData;
      defaultData.noticeRule = isAllDay
        ? remindAlldayOption[1].value
        : remindNotAlldayOption[4].value;
      const params = Object.assign(defaultData, originData, {
        recurrencePattern: recurrencePattern || DEFAULT_REC_PATTERN,
        meeting: locationId
          ? {
            id: locationId,
            name: roomName,
            email: locationMail
          }
          : null
      });
      this.originMeeting = params.meeting;
      formPanelStore.setData(params);
      scheduleConflictPanelStore.setData(params);
    }
    if (id) {
      // 编辑页面
      // 有id 无路由状态 初始化
      this.initFromByScheduleId(id, defaultData);
    } else if (originData && originData.from === 'dx') {
      if (originData.startTime) {
        const { startTime } = originData;
        const startTimeGet = getQuaterMinuteMoment(
          changeDateOnly({
            momentByTime: dayjs(),
            momentByDate: dayjs(startTime)
          })
        );
        const endTimeGet = dayjs(startTimeGet).add(1, 'hour');
        // const deadline = dayjs(startTimeGet)
        //   .add(6, 'months')
        //   .valueOf();
        const params = Object.assign(defaultData, {
          startTime: startTimeGet.valueOf(),
          endTime: endTimeGet.valueOf()
          // deadline
        });
        formPanelStore.setData(params);
        scheduleConflictPanelStore.setData(params);
      } else if (originData.scheduleId) {
        this.initFromByScheduleId(originData.scheduleId, defaultData);
      }
    } else if (
      !originData
      || (originData.from === 'dx' && !originData.startTime)
    ) {
      // 无id，无路由状态，初始化
      const startTime = getQuaterMinuteMoment();
      const endTime = dayjs(startTime).add(1, 'hour');
      const data = {
        startTime: startTime.valueOf(),
        endTime: endTime.valueOf()
        // deadline: startTime.add(6, 'months').valueOf()
      };
      const params = Object.assign(defaultData, data);
      formPanelStore.setData(params);
      scheduleConflictPanelStore.setData({
        ...params,
        attendees: StorageService.getItemSession('chatType')
          ? []
          : [currentUser]
      });
    }
    // 获取日历下拉列表
    this.getCreatableCalendars();
    this.titleFocus();
    // 初始化Mtd组件无法聚焦问题
    setTimeout(() => {
      initMtdTabIndex();
    }, 0);
  }

  titleFocus = () => {
    this.titleRef && this.titleRef.focus();
  };

  getDefaultData = () => {
    const {
      formPanelStore: { getDefaultData },
      globalStore: { currentUser },
      originData: { isPublicCalendar } = { isPublicCalendar: false }
    } = this.props;
    return getDefaultData(currentUser, isPublicCalendar);
  };

  // 父组件调用initFromByScheduleId方法
  handleParCallInitFormBySchneduleId = (scheduleId) => {
    this.initFromByScheduleId(scheduleId, this.getDefaultData());
  };
  getCreatableCalendars = async () => {
    const { formPanelStore } = this.props;
    let creatableCalendarsInfo = await getCreatableCalendars();
    creatableCalendarsInfo = creatableCalendarsInfo.map(x => ({
      ...x,
      color: colorNumToStr(x.color)
    }));
    formPanelStore.setData({ creatableCalendarsInfo });
  };
  initFromByScheduleId = async (id, defaultData) => {
    const {
      formPanelStore,
      scheduleConflictPanelStore,
      setData,
      appKey,
      globalStore: { getBookRules }
    } = this.props;
    const { nDxScheduleId } = window;
    this.handleIsChangeMeeting(false);

    formPanelStore.setData({
      requestDetailFail: false
    });

    try {
      const detail = await getSchedules(id, '', appKey);
      if (detail.roomInfo) getBookRules(detail.roomInfo.buildingId);
      detail.roomName = detail.roomInfo?.roomId
        ? `${detail.roomInfo.roomName || ''} ${
          detail.roomInfo.floorName || ''
        } ${detail.roomInfo.buildingName || ''}`
        : detail.roomName;
      detail.recurrencePattern = detail.recurrencePattern || DEFAULT_REC_PATTERN;
      const { calendarInfo } = detail;
      if (calendarInfo) {
        calendarInfo.color = colorNumToStr(calendarInfo.color);
        detail.currentCalendarInfo = calendarInfo;
      }
      if (detail.isAllDay) {
        // 全天日程会到第二天的0点
        detail.endTime -= 3600 * 1000;
      }
      detail.attendees = calendarInfo?.type === 'PUBLIC'
        ? [detail.organizer]
        : [detail.organizer, ...detail.attendees]; // 兼容公共日历

      const params = Object.assign(defaultData, detail);
      if (!params.deadline) {
        params.deadline = dayjs().add(6, 'months').valueOf();
      }

      if (nDxScheduleId || id) {
        const {
          roomName, locationId, locationMail, memo
        } = detail;
        params.scheduleId = nDxScheduleId || id;
        params.meeting = locationId
          ? {
            id: locationId,
            name: roomName,
            email: locationMail
          }
          : null;
        params.remark = params.remark || memo;
        this.originMeeting = params.meeting;
      }
      formPanelStore.setData(params);
      scheduleConflictPanelStore.setData(params);
      setData({ originFormPanelStore: cloneDeep(params) });

      // 循环日程，初始化循环规则
      if (params.recurrencePattern?.type !== ERecurrenceType.NONE) {
        this.originRecurrencePattern = {
          ...params.recurrencePattern,
          showType: ERecurrenceShowType.ORIGINRECURRENCE
        };
        this.originRecurrenceDescription = params.recurrenceDescription;
        formPanelStore.setData({
          recurrencePattern: {
            ...params.recurrencePattern,
            showType: ERecurrenceShowType.ORIGINRECURRENCE
          }
        });
      }
    } catch (e) {
      formPanelStore.setData({
        requestDetailFail: true
      });
      // 捕获的错误抛出去，防止错误无法感知
      console.error(e);
    }
  };

  /**
   * 修改标题
   */
  handleChangeTitle = (e) => {
    const {
      formPanelStore: { setData },
      itemChangeCallback
    } = this.props;
    setData({ title: e.target.value });
    itemChangeCallback();
  };

  /**
   * 修改时间
   */
  handleChangeTime = (startTime, endTime, _isAllDay) => {
    const {
      formPanelStore,
      scheduleConflictPanelStore,
      itemChangeCallback
    } = this.props;
    const { isAllDay, meeting } = formPanelStore;
    // 提醒规则默认值切换
    let noticeRule = remindAlldayOption[1].value;
    if (!_isAllDay) {
      if (meeting) {
        noticeRule = remindNotAlldayOption[3].value;
      } else {
        noticeRule = remindNotAlldayOption[4].value;
      }
    }

    isAllDay !== _isAllDay
      && formPanelStore.setData({
        noticeRule
      });
    formPanelStore.setData({
      startTime,
      endTime,
      isAllDay: _isAllDay
      // deadline: dayjs(startTime)
      //   .add(6, 'months')
      //   .valueOf()
    });
    scheduleConflictPanelStore.setData({
      startTime,
      endTime,
      isAllDay: _isAllDay
    });
    this.checkMeetingUsable();
    itemChangeCallback();
  };

  /**
   * 修改地址
   */
  handleChangeAddress = (location) => {
    const {
      formPanelStore: { setData },
      itemChangeCallback
    } = this.props;
    setData({ location });
    itemChangeCallback();
  };

  /**
   * 操作会议室窗口
   */
  handleMeetingModel = async (status) => {
    let isAvaliable = true;
    if (status) {
      const { avaliable, message } = this.checkMeetingRuleAvaliable();
      isAvaliable = avaliable;
      if (!avaliable) {
        messageStore.error(message);
      }
    }
    if (isAvaliable) {
      const {
        // globalStore: { getBookRules },
        formPanelStore: { setData },
        itemChangeCallback
      } = this.props;
      // 打开窗口的时候获取一下配置信息
      // try {
      //   if (status) {
      //     await getBookRules();
      //   }
      // } finally {
      setData({ meetingModelShow: status });
      itemChangeCallback();
      // }
    }
  };

  /**
   * 修改会议室
   */
  handleChangeMeetingRoom = (item) => {
    const {
      globalStore: { getBookRules },
      formPanelStore: { setData },
      itemChangeCallback
    } = this.props;
    getBookRules(item?.buildingId);
    setData({ meeting: item, meetingAvaliable: true });
    setData({ noticeRule: remindNotAlldayOption[3].value });
    if (this.originMeeting && item.id !== this.originMeeting.id) {
      this.handleIsChangeMeeting(true);
    }
    itemChangeCallback();
  };

  /**
   * 修改提醒规则
   */
  handleChangeRemind = (noticeRule) => {
    const {
      formPanelStore: { setData },
      itemChangeCallback
    } = this.props;
    setData({ noticeRule });
    itemChangeCallback();
  };

  /**
   * 修改日历类型 liyan
   */
  handleChangeCalendar = (calendar) => {
    const {
      formPanelStore: { setData, creatableCalendarsInfo },
      itemChangeCallback
    } = this.props;
    const currentCalendarInfo = creatableCalendarsInfo.find(
      item => item.calendarId === calendar.value
    );
    setData({ currentCalendarInfo });
    itemChangeCallback();
  };

  /**
   * 修改备注
   */
  handleChangeRemark = (remark) => {
    const {
      formPanelStore: { setData },
      itemChangeCallback
    } = this.props;
    setData({ remark });
    itemChangeCallback();
  };

  handleChangeUser = (attendees) => {
    const {
      formPanelStore,
      scheduleConflictPanelStore,
      itemChangeCallback
    } = this.props;
    scheduleConflictPanelStore.setData({
      preAttendeesList: scheduleConflictPanelStore.attendees
    });
    formPanelStore.setData({ attendees });
    scheduleConflictPanelStore.setData({ attendees });
    itemChangeCallback();
  };

  /**
   * 修改循环规则
   * 循环规则和结束时间更新时候，如果为编辑状态只能更新循环日程，不能编辑当前日程
   */
  handleChangeRepeat = (recurrencePattern) => {
    const {
      formPanelStore,
      originFormPanelStore,
      itemChangeCallback
    } = this.props;
    const { setData } = formPanelStore;

    setData({
      recurrencePattern
    });
    // formPanelStore 必须等数据更新后才可进行比较
    setData({
      hasChangeRepeatParams: isChangeRepeatRule(
        originFormPanelStore,
        formPanelStore
      )
    });
    this.checkMeetingUsable();
    itemChangeCallback();
  };

  handleDeadlineChange = (value) => {
    const {
      formPanelStore: { setData },
      originFormPanelStore,
      itemChangeCallback
    } = this.props;
    setData({
      deadline: value,
      hasChangeRepeatParams:
        originFormPanelStore?.deadline
        && !(originFormPanelStore.deadline === value)
    });
    itemChangeCallback();
  };

  handleRemoveMeeting = () => {
    const {
      formPanelStore: { setData },
      itemChangeCallback
    } = this.props;
    setData({
      meeting: null
    });
    this.checkMeetingUsable();
    itemChangeCallback();
    this.handleIsChangeMeeting(true);
    setTimeout(() => {
      this.changeEnterModel(0, false);
    }, 100);
  };

  handleIsChangeMeeting = (state) => {
    const {
      formPanelStore: { scheduleId }
    } = this.props;
    const { nDxScheduleId } = window;
    // 编辑日程页, 展示更改提示文案
    (scheduleId || nDxScheduleId) && (this.isChangeMeeting = state);
  };

  checkMeetingRuleAvaliable = () => {
    const {
      formPanelStore: {
        startTime, endTime, isAllDay, recurrencePattern
      },
      globalStore: {
        bookRules: { minSpan, maxSpan, dayBookLimit }
      }
    } = this.props;

    const today = new Date();
    const nRecurrence = recurrencePattern && recurrencePattern.type !== ERecurrenceType.NONE;
    // 循环
    if (nRecurrence) {
      return {
        avaliable: false,
        message: i18nClient.t(
          'schedule_edit_cannot_book_meeting_room_cycle',
          '循环日程不可预订会议室'
        )
      };
    }
    // 全天
    if (isAllDay === 1) {
      return {
        avaliable: false,
        message: i18nClient.t(
          'schedule_edit_cannot_book_meeting_room_all_day',
          '全天日程不可预订会议室'
        )
      };
    }
    // 过去时间
    if (startTime < today.getTime()) {
      return {
        avaliable: false,
        message: i18nClient.t(
          'schedule_edit_cannot_book_meeting_room_ago',
          '过去时间不可预订会议室'
        )
      };
    }

    // 超过可预订的时间（14天）
    const limitBookDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + dayBookLimit,
      0,
      0,
      0,
      0
    );
    if (startTime >= limitBookDay.getTime() && !!dayBookLimit) {
      return {
        avaliable: false,
        message: i18nClient.t(
          'schedule_edit_only_book_day_book_limit',
          '仅可预订{dayBookLimit}天内的会议室',
          { dayBookLimit }
        )
      };
    }
    // 不在时长范围（240分钟， 15分钟）
    if (endTime - startTime > maxSpan * 60 * 1000) {
      return {
        avaliable: false,
        message: i18nClient.t(
          'schedule_edit_cannot_book_exceed',
          '超过{maxSpan}小时的日程不可预订会议室',
          { maxSpan: maxSpan / 60 }
        )
      };
    }
    if (endTime - startTime < minSpan * 60 * 1000) {
      return {
        avaliable: false,
        message: i18nClient.t(
          'schedule_edit_cannot_book_less',
          '少于{minSpan}分钟的日程不可预订会议室',
          { minSpan }
        )
      };
    }
    return {
      avaliable: true,
      message: '' // default string
    };
  };

  checkMeetingUsable = async (): Promise<void> => {
    // 无会议室 默认true
    const {
      formPanelStore: {
        startTime,
        endTime,
        meeting,
        checkMeetingFree,
        setData,
        scheduleId
      }
    } = this.props;
    const { nDxScheduleId } = window;
    if (!meeting) {
      setData({ meetingAvaliable: true });
    } else {
      const checkResult = this.checkMeetingRuleAvaliable();
      const timeAvaliable = checkResult.avaliable;
      this.meetingAvaliableMessage = checkResult.message;
      if (timeAvaliable) {
        const res = await checkMeetingFree({
          roomId: meeting.id,
          startTime,
          endTime,
          scheduleId: scheduleId || nDxScheduleId
        });
        let buf = '';
        if (res?.conflictTimes?.length > 0) {
          const buffList = res?.conflictTimes.map((item) => {
            return `${dayjs(item.startTime).format('HH:mm')}-${dayjs(
              item.endTime
            ).format('HH:mm')}`;
          });
          buf = buffList.join('、');
        }
        this.meetingAvaliableMessage = i18nClient.t(
          'schedule_edit_buf_meeting_booked',
          '{buf}会议室已被预订',
          { buf }
        );
        setData({ meetingAvaliable: res?.isFreePeriod === true });
      } else {
        setData({ meetingAvaliable: false });
      }
    }
  };
  /**
   * 【按群选人】退出栈存入/弹出
   * visible: 是否可见
   * type: 区分esc触发还是手动关闭弹框。
   *       若为esc键触发，则不进一步调用 changeEnterModel（否则会继续把其他退出栈弹出）
   */
  changeUserDialogShowing = (visible: boolean, type?: string) => {
    this.groupUserDialogShowing = visible;
    !type && this.changeEnterModel(1, visible);
  };
  /**
   * 退出栈
   */
  changeEnterModel = (index: number, val: boolean) => {
    const { changeEsc } = this.props;
    if (val) {
      switch (index) {
        case 0:
          changeEsc(this.handleMeetingModel);
          break;
        case 1:
          changeEsc(this.changeUserDialogShowing);
          break;
        default:
          break;
      }
    } else {
      changeEsc();
    }
  };

  render() {
    const {
      formPanelStore: {
        scheduleId,
        title,
        startTime,
        endTime,
        isAllDay,
        location,
        meeting,
        meetingModelShow,
        noticeRule,
        recurrencePattern,
        remark,
        attendees,
        deadline,
        meetingAvaliable,
        currentCalendarInfo,
        creatableCalendarsInfo
      },
      globalStore: { currentUser },
      id
    } = this.props;
    const { nDxScheduleId } = window;
    const nRecurrence = recurrencePattern && recurrencePattern.type !== ERecurrenceType.NONE;
    // 不能创建公共日历不显示日历下拉框
    const hasPublicCalendar = creatableCalendarsInfo.some(
      item => item.type === 'PUBLIC'
    );
    return (
      <div className={classNames(styles.container, 'panelPopParent')}>
        <div className={classNames(styles.line, styles.lineTitle)}>
          <Input
            ref={(ref) => {
              this.titleRef = ref;
            }}
            className={styles.title}
            clearable={false}
            maxLength={50}
            value={title}
            onChange={this.handleChangeTitle}
            placeholder={i18nClient.t(
              'schedule_edit_input_theme',
              '请输入主题，50 字以内'
            )}
            onFocus={() => this.datePickerRef?.current?.closeDateTimePicker()}
          />
        </div>
        <div className={styles.line}>
          <Icon className={styles.icon} type={'time-o'} />
          <DateTimePicker
            onRef={this.datePickerRef}
            popLayer={popLayerConfig}
            startTime={startTime}
            endTime={endTime}
            isAllDay={isAllDay}
            onChange={this.handleChangeTime}
            scheduleId={scheduleId || nDxScheduleId}
          />
        </div>
        {currentCalendarInfo.type === 'PRIVATE' && (
          <div className={styles.line}>
            <Icon className={styles.icon} type={'location-o'} />
            <Address
              mis={currentUser?.mis}
              location={location}
              meeting={meeting}
              unUsable={!meetingAvaliable}
              unUsableMessage={this.meetingAvaliableMessage}
              isChangeMeeting={this.isChangeMeeting}
              onChange={this.handleChangeAddress}
              onChangeMeetingRoom={this.handleMeetingModel.bind(this, true)}
              onClear={this.handleRemoveMeeting}
              changeEnterModel={this.changeEnterModel}
              closeUserSelect={() => this.useSelectRef.selectRef.blur()}
            />
          </div>
        )}
        {currentCalendarInfo.type === 'PRIVATE' && (
          <div className={styles.line}>
            <Icon className={styles.icon} type={'avatar-add'} />
            <div className={styles.selectContanier}>
              <UserSelect
                width={'100%'}
                ref={(ref) => {
                  this.useSelectRef = ref;
                }}
                popLayer={popLayerConfig}
                defaultValue={attendees}
                onChange={this.handleChangeUser}
                orgnizerId={currentUser.empId}
              />
              <div
                onClick={() => {
                  this.useSelectRef && this.useSelectRef.focus();
                }}
                style={{ display: 'inline-block' }}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    this.changeUserDialogShowing(true);
                    addModuleClick('b_oa_bh1zpdkg_mc');
                  }}
                  className={styles.subIconsGroup}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.keyCode === KEY_CODE.ENTER) {
                      this.changeUserDialogShowing(true);
                      addModuleClick('b_oa_bh1zpdkg_mc');
                    }
                  }}
                  onFocus={() => {
                    this.useSelectRef.selectRef.blur();
                    this.remindRef?.current?.closeRemind();
                  }}
                >
                  <Icon type="avatar-group" />
                  <span>
                    {i18nClient.t('schedule_edit_select_by_group', '按群选人')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        {currentCalendarInfo.type === 'PRIVATE' && (
          <div className={styles.line}>
            <Icon className={styles.icon} type={'bell-o'} />
            <Remind
              isAllDay={isAllDay}
              hasMeeting={!!meeting}
              value={noticeRule}
              onChange={this.handleChangeRemind}
              onRef={this.remindRef}
              closeMtdComponent={() => this.repeatRef?.current?.closeRepeat()}
            />
          </div>
        )}
        {currentCalendarInfo.type === 'PRIVATE' && (
          <div className={styles.line}>
            <i
              style={{ lineHeight: 1 }}
              className={classNames(styles.icon, 'dxcalendar dx-calcycle')}
            />
            <Repeat
              popLayer={popLayerConfig}
              startTime={startTime}
              originRecurrencePattern={this.originRecurrencePattern}
              originRecurrenceDescription={this.originRecurrenceDescription}
              recurrencePattern={recurrencePattern}
              onChange={this.handleChangeRepeat}
              onRef={this.repeatRef}
              closeMtdComponent={() => {
                this.remindRef?.current?.closeRemind();
                this.recurrenceRef?.current?.closeRecurrence();
              }}
            />
          </div>
        )}
        {currentCalendarInfo.type === 'PRIVATE' && nRecurrence && (
          <div
            className={styles.line}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <span style={{ marginRight: '10px' }}>
              {i18nClient.t('schedule_edit_until', '截止到')}
            </span>
            <Recurrence
              popLayer={popLayerConfig}
              handleDeadlineChange={this.handleDeadlineChange}
              deadline={deadline}
              onRef={this.recurrenceRef}
              closeRepeat={() => this.repeatRef?.current?.closeRepeat()}
            />
          </div>
        )}
        <div className={styles.line}>
          <Icon className={styles.icon} type={'file-o'} />
          <Remark
            value={remark}
            onChange={this.handleChangeRemark}
            closeMtdComponent={() => {
              this.repeatRef?.current?.closeRepeat();
              this.recurrenceRef?.current?.closeRecurrence();
            }}
          />
        </div>
        {meetingModelShow && (
          <MeetingModalPanel
            startTime={startTime}
            endTime={endTime}
            meeting={meeting}
            isTimeAvaliable={this.checkMeetingRuleAvaliable().avaliable}
            onCloseModel={this.handleMeetingModel.bind(this, false)}
            onChangeMeetingRoom={this.handleChangeMeetingRoom}
          />
        )}
        {this.groupUserDialogShowing && (
          <GroupUserSelectPanel
            closeDlg={() => {
              this.changeUserDialogShowing(false);
            }}
            usersSelected={attendees}
            onChange={this.handleChangeUser}
            orgnizerId={currentUser.empId}
          />
        )}
        {/* 创建页面有公共日历显示，编辑页面显示 */}
        {hasPublicCalendar && (
          <div className={styles.line}>
            <Icon className={styles.icon} type={'calendar-o'} />
            <CalendarSelector
              currentCalendarInfo={currentCalendarInfo}
              creatableCalendarsInfo={creatableCalendarsInfo}
              disabled={!!id}
              userName={currentUser.name + getEnname(currentUser.enName)}
              onChange={this.handleChangeCalendar}
            />
          </div>
        )}
      </div>
    );
  }
}
