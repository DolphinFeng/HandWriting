import { i18nClient } from '@sailor/i18n-web';
/*
 * @Description: 新增日程、编辑日程页
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-05-29 14:30:44
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2021-04-08 20:42:10
 * @FilePath: /scheduleweb/src/pages/scheduleEdit/index.tsx
 */

import React, { Component } from 'react';
import { observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import dayjs from 'dayjs';
import { pageView } from 'onejs/lx';
import { Modal } from '@ss/mtd-react';
import { CycleModal, AttendeeModal } from '@/components';
import { messageStore } from '@/store/global';
import {
  setStorageUsers,
  getQuaterMinuteMoment,
  changeDateOnly,
  routerReplaceWithAppState,
  urlParams,
  KEY_CODE
} from '@/utils';
import { RoomsStorageService, StorageService } from '@/services/storage';
import {
  EDXEventType,
  EEffectiveRangeType,
  EInformType,
  EPerformancePosition
} from '@/consts';
import { groupMember, groupMemberSort } from '@/services/apis';
import { addModuleClick } from '@/services/lxService';
import ScheduleConflictPanel from '@/components/ScheduleConflictPanel';
import dxJSSDK from '@/utils/dxJSSDK';
import PageHeader from './PageHeader';
import PageBottom from './PageBottom';
import FormPanel from './FormPanel';
import CancelModal from './CancelModal';

import {
  compare,
  checkParams,
  getHourAndMinuteByQueto,
  handleIsEditAttendee,
  getDefault,
  checkParamsPublic,
  comparePublic
} from './compare';
import styles from './index.less';
import { ERecurrenceType } from '@/consts/recurrenceType';
import PageErrorItem from '@/components/PageErrorItem';
import { ROOMS_TO_SCHEDULE_STATE } from '@/consts/jumpRooms';

interface IPropsType {
  location?: any;
  scheduleEditStore?: any; // Store
  meetingModalPanelStore?: any;
  formPanelStore?: any;
  scheduleConflictPanelStore?: any;
  match?: any;
  global?: any;
}

const sorttipsKey = 'sorttips';

/**
 * 日程编辑页面
 */
@inject(({ scheduleEditStore, global }) => ({
  scheduleEditStore,
  formPanelStore: scheduleEditStore.formPanelStore,
  scheduleConflictPanelStore: scheduleEditStore.scheduleConflictPanelStore,
  meetingModalPanelStore: scheduleEditStore.meetingModalPanelStore,
  global
}))
@observer
export default class extends Component<IPropsType> {
  // 按钮Loading
  @observable btnLoadingStatus = false;

  @observable nShowCycleDlg = false;

  @observable nShowCancelDlg = false;

  @observable showAttendeeModal = false;

  // 是否修改了参与人
  @observable isChangeAttendee = false;

  @observable isChangeFormPanelStore = false;

  @observable type = null; // 循环日程的生效范围: single | cycle

  @observable informType = null; // 参与人通知范围: part | all | none

  // 点击大象小日历详情列表进入 还是点击大象小日历创建按钮进入
  @observable cancelReEdit = false;

  // 进入页面时候的时间
  @observable inTime = 0;

  // 是否编辑过
  @observable hasChangeValue = false;

  // 群日程打开
  @observable isInMeetingGroup = StorageService.getItemSession('chatType');

  // 群日程打开后已经弹开独立弹窗了
  @observable hasPopupInMeetingGroup = StorageService.getItemSession(
    'chatPopup'
  );

  @observable chatId = null;

  @observable chatType = null;

  // 单聊人员列表
  @observable userList = [];

  // 正在弹出中
  @observable isPoping = false;

  @observable showSortTips = false;

  // 子组件弹框退出栈
  @observable escStack = [];

  openTime: number = Date.now();

  formPanelRef;

  editCancelModal = null;

  stateData;

  constructor(props) {
    super(props);
    // 上报页面性能
    const { reportPage, setData } = this.props.global;
    reportPage(EPerformancePosition.EDIT_PAGE);

    const sessionStorageData = window.sessionStorage.getItem(
      ROOMS_TO_SCHEDULE_STATE
    );
    if (sessionStorageData) {
      window.sessionStorage.removeItem(ROOMS_TO_SCHEDULE_STATE);
      this.stateData = JSON.parse(sessionStorageData);
      setData({ lastPageId: 'rooms' });
    } else {
      this.stateData = this.props.location?.state;
    }
  }

  componentDidMount() {
    window.addEventListener('dxNotification', this.handleDxNotification);

    this.inTime = this.stateData?.startTime || dayjs().valueOf(); // inTime
    const {
      global: { currentUser, getBookRules, lastPageId },
      scheduleConflictPanelStore: { setData }
    } = this.props;
    pageView('c_oa_6d6ij2uu', {
      userMis: currentUser?.mis
    });
    if (
      lastPageId === 'rooms'
      && !(window.nDxScheduleId || this.props.match?.params.id)
    ) {
      const roomsSelectedBuild = RoomsStorageService.getItem(
        'meetingBuildingSelected'
      );
      const [, buildingId] = roomsSelectedBuild ?? [];
      getBookRules(buildingId);
    }
    if (this.isInMeetingGroup) {
      setData({ noTime: true }, false);
      this.getSessionInfos();
    } else {
      setData({ noTime: false });
      document.addEventListener('keydown', this.escFunction, false);
    }
  }

  componentWillUnmount() {
    // 销毁拦截判断是否离开当前页面
    window.removeEventListener('dxNotification', this.handleDxNotification);
    document.removeEventListener('keydown', this.escFunction, false);
  }

  reInit = () => {
    this.btnLoadingStatus = false;
    this.nShowCycleDlg = false;
    this.inTime = 0;
    this.hasChangeValue = false;
    this.reInitWithStartTime(window.nDxStartTime);
    window.nDxStartTime = 0;
    // 重新加载FormPanel的方法
    window.nDxScheduleId
      && this.formPanelRef.handleParCallInitFormBySchneduleId(
        window.nDxScheduleId
      );
  };

  getSessionInfos = async () => {
    // getSectionInfo桥接口有性能问题，使用群日程中拼接的query获取，大象后续发版需要确认Query
    const queryKey = '_sessionId_';
    this.chatId = urlParams(queryKey);
    this.chatType = this.isInMeetingGroup;
    this.getKeyPerson();
  };

  getKeyPerson = async () => {
    const {
      global: { currentUser },
      scheduleConflictPanelStore: { setData },
      formPanelStore
    } = this.props;
    try {
      const attendees = window.groupPagePromise
        ? await window.groupPagePromise
        : await groupMember({
          chatId: this.chatId,
          chatType: this.chatType
        });
      setData({
        attendees,
        keyPerson: attendees
          .filter(item => item.empId !== currentUser.empId)
          .map(item => item.empId)
      });
      formPanelStore.setData({
        attendees: [
          ...attendees.filter(item => item.empId === currentUser.empId),
          ...attendees.filter(item => item.empId !== currentUser.empId)
        ]
      });
      if (this.chatId) {
        this.userList = attendees;
      }
    } catch (e) {
      // 请求群成员失败，设置群成员为自己
      setData({ attendees: [currentUser] });
      if (window.groupPagePromise) {
        messageStore.error(
          e?.message
            || i18nClient.t(
              'schedule_edit_request_timeout',
              '请求超时，请稍后再试'
            )
        );
      }
    } finally {
      window.groupPagePromise = null;
    }
  };

  handleDxNotification = () => {
    const { nDxType } = window;
    if (nDxType === EDXEventType.BYADDICON) {
      if (this.hasChangeValue) {
        this.nShowCancelDlg = true;
        this.cancelReEdit = true;
      } else {
        this.reInit();
      }
    } else if (nDxType === EDXEventType.BYICON) {
      if (!this.hasChangeValue) {
        this.backToFromPage(true);
      }
    } else if (nDxType === EDXEventType.BYDETAIL) {
      this.handleCancelSchedule(true);
    }
    window.nDxType = null;
  };

  // 取消编辑
  handleCancelSchedule = (byNotification) => {
    if (!byNotification) {
      window.nDxStartTime = this.inTime;
    }
    if (this.hasChangeValue) {
      if (!byNotification) {
        if (!this.editCancelModal) {
          this.editCancelModal = Modal.warning({
            title: i18nClient.t(
              'schedule_edit_not_save',
              '本次编辑还未保存，确定退出吗？'
            ),
            okText: i18nClient.t('schedule_edit_confirm', '确定'),
            cancelText: i18nClient.t('schedule_edit_cancel', '取消'),
            okBtnProps: { type: 'primary' },
            style: { zIndex: 2031, width: 400 },
            onOk: () => {
              this.backToFromPage();
              this.editCancelModal = null;
            },
            onCancel: () => {
              this.editCancelModal = null;
            }
          });
        }
      } else {
        this.nShowCancelDlg = true;
        this.cancelReEdit = false;
      }
    } else if (!byNotification) {
      this.backToFromPage();
    } else {
      this.backToFromPage(true);
    }
    this.clearWindowFormData();
  };

  escFunction = (event: any) => {
    if (event.keyCode === KEY_CODE.ESC) {
      // 确保第一个一直是编辑页退出
      const firstEscFunc = this.escStack.length === 0
        ? this.handleCancelSchedule
        : this.escStack.pop();
      firstEscFunc && firstEscFunc(false, 'esc');
    }
  };

  changeEsc = (handleFunc?: any) => {
    if (handleFunc) {
      this.escStack.push(handleFunc);
    } else {
      this.escStack.pop();
    }
  };

  checkParams = (): boolean => {
    const {
      scheduleEditStore: {
        formPanelStore: {
          startTime,
          endTime,
          isAllDay,
          recurrencePattern,
          meeting,
          attendees,
          meetingAvaliable,
          deadline,
          remark
        }
      },
      global: {
        bookRules: { minSpan, maxSpan, dayBookLimit }
      }
    } = this.props;

    return checkParams({
      startTime,
      endTime,
      isAllDay,
      recurrencePattern,
      meeting,
      attendees,
      meetingAvaliable,
      deadline,
      remark,
      minSpan,
      maxSpan,
      dayBookLimit
    });
  };

  reInitWithStartTime = (startTime) => {
    const { formPanelStore, scheduleConflictPanelStore } = this.props;
    this.props.scheduleConflictPanelStore.init();
    this.props.meetingModalPanelStore.init();
    const { currentUser } = this.props.global;
    const { nDxScheduleId, nDxAppKey } = window;
    const defaultData = getDefault(nDxScheduleId, currentUser, nDxAppKey);
    const startTimeGet = getQuaterMinuteMoment(
      changeDateOnly({
        momentByTime: dayjs(),
        momentByDate: startTime ? dayjs(startTime) : dayjs()
      })
    );
    const endTimeGet = dayjs(startTimeGet).add(1, 'hour');
    const params = Object.assign(defaultData, {
      startTime: startTimeGet.valueOf(),
      endTime: endTimeGet.valueOf()
    });
    formPanelStore.setData(params);
    scheduleConflictPanelStore.setData(params);
  };

  trackCreateTime = (scheduleId?: string) => {
    const dataFinish = Date.now();
    if (this.chatId) {
      addModuleClick('b_oa_44fau4wq_mc', {
        duration: dataFinish - this.openTime,
        scheduleId,
        chatType: this.chatType
      });
    } else {
      addModuleClick('b_oa_7idyqe6n_mc', {
        duration: dataFinish - this.openTime,
        scheduleId,
        chatType: this.chatType
      });
    }
  };

  // 编辑日程
  handleEditSchedule = async () => {
    const {
      scheduleEditStore: { scheduleEdit }
    } = this.props;
    this.btnLoadingStatus = true;
    try {
      const pushType = this.handlePushType();
      const res = await scheduleEdit(this.chatType, this.chatId, pushType);
      this.trackCreateTime(res?.scheduleId);
      this.back();
    } catch {
      this.btnLoadingStatus = false;
    }
  };

  handlePushType = () => {
    if (
      this.informType === EInformType.PART
      || this.informType === EInformType.NONE
    ) {
      return 1;
    }
    return 0;
  };

  // 编辑循环日程
  handleRecurrenceEditSchedule = async () => {
    const {
      scheduleEditStore: { scheduleRecurrenceEdit }
    } = this.props;
    this.btnLoadingStatus = true;
    try {
      const pushType = this.handlePushType();
      const res = await scheduleRecurrenceEdit(
        this.chatType,
        this.chatId,
        pushType
      );
      this.trackCreateTime(res?.scheduleId);
      this.back();
    } catch {
      this.btnLoadingStatus = false;
    }
  };

  // 从不同页面回来回到不同页面去
  // 必须跳到日程列表页，触发原因是大象点击小日历
  backToFromPage = (nBackToSchedule?: boolean) => {
    const {
      global: { lastPageId, setData }
    } = this.props;

    if (this.chatType) {
      this.closeGroupPage();
    } else {
      // 卸载页面时候记录page信息用来处理跳转逻辑
      setData({
        lastPageId: 'edit'
      });
      if (!nBackToSchedule && lastPageId === 'rooms') {
        routerReplaceWithAppState('/rooms');
      } else {
        routerReplaceWithAppState('/');
      }
    }
  };

  back = () => {
    const {
      scheduleEditStore: {
        formPanelStore: { attendees, scheduleId, meeting }
      }
    } = this.props;
    attendees && setStorageUsers(attendees); // 公共日历attendees为null
    // eslint-disable-next-line
    messageStore.success(
      i18nClient.t('schedule_edit_save_successfully', '保存成功')
    );
    this.nShowCycleDlg = false;
    this.showAttendeeModal = false;
    window.nDxStartTime = this.inTime;
    this.clearWindowFormData();
    if (!scheduleId && meeting) {
      addModuleClick('b_oa_sfgt2zxk_mc', {
        chatType: this.chatType
      });
    }
    // 0.65s关闭群日程窗口
    if (this.chatType) {
      // 群日程保持loading态 防止2次提交
      this.btnLoadingStatus = true;
      setTimeout(() => {
        this.backToFromPage();
      }, 650);
    } else {
      this.backToFromPage();
    }
  };

  openCycleEditDlg = (): void => {
    const m = Modal.warning({
      title: i18nClient.t(
        'schedule_edit_cycle_save_confirm',
        '该日程为循环日程，本次编辑将在所有日程中生效，确定保存吗？'
      ),
      okText: i18nClient.t('schedule_edit_confirm', '确定'),
      cancelText: i18nClient.t('schedule_edit_cancel', '取消'),
      okBtnProps: { type: 'primary' },
      onOk: () => {
        m.close();
        this.type = EEffectiveRangeType.CYCLE;
        this.handleIsShowAttendeeModal();
      }
    });
  };

  // 判断是否编辑了表单
  handleIsEditFormPanel = () => {
    const {
      scheduleEditStore: { formPanelStore, originFormPanelStore }
    } = this.props;
    if (!originFormPanelStore || !formPanelStore) return;

    const isEditAttendee = handleIsEditAttendee(
      originFormPanelStore.attendees,
      formPanelStore.attendees
    );
    if (isEditAttendee) {
      this.isChangeAttendee = true;
      this.isChangeFormPanelStore = true;
    } else {
      this.isChangeAttendee = false;
      this.isChangeFormPanelStore = compare(
        originFormPanelStore,
        formPanelStore
      );
    }
  };

  closeAttendeeModal = () => {
    this.showAttendeeModal = false;
    this.isChangeAttendee = false;
    this.isChangeFormPanelStore = false;
  };

  setCycleScheduleType = (type) => {
    this.type = type;
    this.nShowCycleDlg = false;
    this.handleIsShowAttendeeModal();
  };

  initChangeState = () => {
    this.isChangeAttendee = false;
    this.isChangeFormPanelStore = false;
  };

  clearWindowFormData = () => {
    window.nDxAppKey = null;
    window.nDxScheduleId = null;
    window.nDxEmpId = null;
  };

  createSchedule = () => {
    this.handleEditSchedule();
    addModuleClick('b_oa_hs97uscd_mc', { chatType: this.chatType }); // 创建页 创建日程成功
  };

  handleCheckEdit = () => {
    this.initChangeState();
    const {
      scheduleEditStore: {
        formPanelStore: {
          currentCalendarInfo: { type }
        }
      }
    } = this.props;
    if (type === 'PUBLIC') {
      this.handleCheckEditPublic();
    } else {
      this.handleCheckEditPersonal();
    }
  };
  // 处理公共日历提交
  handleCheckEditPublic = () => {
    if (this.checkParamsPublic()) {
      const {
        scheduleEditStore: {
          formPanelStore: { scheduleId, endTime },
          originFormPanelStore
        }
      } = this.props;
      if (!scheduleId) {
        const isPastSchedule = endTime < Date.now();
        if (isPastSchedule) {
          Modal.warning({
            title: i18nClient.t(
              'schedule_edit_confirm_create_ago',
              '确定创建过去时间的日程吗？'
            ),
            okText: i18nClient.t('schedule_edit_confirm', '确定'),
            cancelText: i18nClient.t('schedule_edit_cancel', '取消'),
            okBtnProps: { type: 'primary' },
            onOk: () => {
              this.scheduleEditPublic();
              addModuleClick('b_oa_hs97uscd_mc', { chatType: this.chatType }); // 创建页 创建日程成功
            }
          });
        } else {
          this.scheduleEditPublic();
          addModuleClick('b_oa_hs97uscd_mc', { chatType: this.chatType }); // 创建页 创建日程成功
        }
      } else {
        if (!originFormPanelStore) {
          messageStore.error(
            i18nClient.t('schedule_edit_request_failed', '请求失败')
          );
          return;
        }
        this.handleIsEditFormPanelPublic();
        // 未变更表单数据
        if (!this.isChangeFormPanelStore) {
          this.back();
          addModuleClick('b_oa_hs97uscd_mc', { chatType: this.chatType }); // 创建页 创建日程成功
        } else {
          // 非循环日程
          this.scheduleEditPublic();
        }
      }
    }
  };
  // 公共日历提交
  scheduleEditPublic = async () => {
    const {
      scheduleEditStore: { scheduleEditPublic }
    } = this.props;
    this.btnLoadingStatus = true;
    try {
      const res = await scheduleEditPublic();
      this.trackCreateTime(res?.scheduleId);
      this.back();
    } catch {
      this.btnLoadingStatus = false;
    }
  };

  // 检查公共日历参数
  checkParamsPublic() {
    const {
      scheduleEditStore: {
        formPanelStore: {
          startTime, endTime, isAllDay, remark
        }
      }
    } = this.props;
    return checkParamsPublic({
      startTime,
      endTime,
      isAllDay,
      remark
    });
  }

  // 判断是否编辑编辑公共表单
  handleIsEditFormPanelPublic = () => {
    const {
      scheduleEditStore: { formPanelStore, originFormPanelStore }
    } = this.props;
    if (!originFormPanelStore || !formPanelStore) return;

    const isEditAttendee = handleIsEditAttendee(
      originFormPanelStore.attendees,
      formPanelStore.attendees
    );
    if (isEditAttendee) {
      this.isChangeAttendee = true;
      this.isChangeFormPanelStore = true;
    } else {
      this.isChangeAttendee = false;
      this.isChangeFormPanelStore = comparePublic(
        originFormPanelStore,
        formPanelStore
      );
    }
  };

  handleCheckEditPersonal = () => {
    const {
      scheduleEditStore: {
        editTypes,
        formPanelStore: { scheduleId, endTime, recurrencePattern },
        originFormPanelStore
      }
    } = this.props;

    const { nDxScheduleId } = window;
    // 区分变更 | 没有变更数据
    // 变更数据, 查看 是否需要 展示推送弹窗, 循环日程的弹窗是照常展示的
    if (this.checkParams()) {
      if (!scheduleId && !nDxScheduleId && !this.props.match?.params.id) {
        const isPastSchedule = endTime < Date.now();
        const isCyclic = recurrencePattern && recurrencePattern.type !== ERecurrenceType.NONE;
        if (isPastSchedule && !isCyclic) {
          Modal.warning({
            title: i18nClient.t(
              'schedule_edit_confirm_create_ago',
              '确定创建过去时间的日程吗？'
            ),
            okText: i18nClient.t('schedule_edit_confirm', '确定'),
            cancelText: i18nClient.t('schedule_edit_cancel', '取消'),
            okBtnProps: { type: 'primary' },
            onOk: () => this.createSchedule()
          });
        } else {
          this.createSchedule();
        }
      } else {
        if (!originFormPanelStore) {
          messageStore.error(
            i18nClient.t('schedule_edit_request_failed', '请求失败')
          );
          return;
        }
        this.handleIsEditFormPanel();
        // 未变更表单数据
        if (!this.isChangeFormPanelStore) {
          this.back();
        } else if (editTypes === 3) {
          this.nShowCycleDlg = true;
        } else if (editTypes === 2) {
          this.openCycleEditDlg();
        } else {
          // 非循环日程
          this.handleIsShowAttendeeModal();
        }
      }
    }
  };

  // 变更了数据, 不展示推送弹窗, 只看变更后的时间是否结束
  handleIsShowAttendeeModal = () => {
    const {
      scheduleEditStore: { formPanelStore, originFormPanelStore, editTypes }
    } = this.props;
    // 检查是否只有一个参与者, 即只有组织者
    let showAttendeeModal = true;
    if (
      formPanelStore?.attendees?.length === 1
      && originFormPanelStore?.attendees?.length === 1
    ) {
      showAttendeeModal = false;
    } else if (
      formPanelStore.recurrencePattern?.type
      && formPanelStore.recurrencePattern?.type !== ERecurrenceType.NONE
      && this.type === EEffectiveRangeType.CYCLE
    ) {
      // 循环日程 且 生效范围是 所有日程, 循环截止时间为过去时间(包含今天-日期)
      formPanelStore.deadline <= new Date().getTime()
        && (showAttendeeModal = false);
    } else {
      // 循环日程 , 生效范围是 此日程
      // 非循环日程, 变更为过去时间(不包含今天-精确到毫秒)
      dayjs(formPanelStore.endTime).valueOf() < dayjs().valueOf()
        && (showAttendeeModal = false);
    }
    if (this.isChangeFormPanelStore && showAttendeeModal) {
      this.showAttendeeModal = true;
    } else {
      this.showAttendeeModal = false;
      this.informType = EInformType.NONE;
      // 非循环日程 | 循环日程生效范围是 此日程
      // eslint-disable-next-line no-unused-expressions
      editTypes === 1 || this.type === EEffectiveRangeType.SINGLE
        ? this.handleEditSchedule()
        : this.handleRecurrenceEditSchedule();
    }
  };

  handleInformAttendee = (informType) => {
    const {
      scheduleEditStore: { editTypes }
    } = this.props;

    this.informType = informType;
    // 循环日程变更了循环规则 | 循环日程生效范围: 所有日程
    if (this.type === EEffectiveRangeType.CYCLE) {
      this.handleRecurrenceEditSchedule();
    } else if (
      (editTypes !== 3 && editTypes !== 2)
      || this.type === EEffectiveRangeType.SINGLE
    ) {
      // 非循环日程 | 循环日程生效范围为: 此日程
      this.handleEditSchedule();
    }
  };

  // 拖拽事件块后调整时间
  setStartAndHeight = (start, height) => {
    const {
      scheduleConflictPanelStore: { startTime, resetSchedule },
      formPanelStore
    } = this.props;

    const startQuote = parseInt(start, 10);
    const endQuote = startQuote + parseInt(height, 10);

    const startTimeByQuote = dayjs(startTime)
      .set(getHourAndMinuteByQueto(startQuote))
      .valueOf();

    const endTime = dayjs(startTime)
      .set(getHourAndMinuteByQueto(endQuote))
      .valueOf();

    resetSchedule({
      startTime: startTimeByQuote,
      endTime,
      originStartTime: startTimeByQuote,
      originEndTime: endTime,
      scheduleStart: startQuote,
      scheduleHeight: endQuote - startQuote,
      noTime: false
    });
    formPanelStore.setData({ startTime: startTimeByQuote, endTime });
    this.formPanelRef && this.formPanelRef.checkMeetingUsable();
    this.hasChangeValue = true;
  };

  removePerson = (empId) => {
    const { formPanelStore, scheduleConflictPanelStore } = this.props;
    formPanelStore.removePerson(empId);
    scheduleConflictPanelStore.removePerson(empId);
    this.groupMemberSort();
    this.showToolTip();
    this.hasChangeValue = true;
  };

  showToolTip = () => {
    if (this.chatType === 'groupchat' && !this.showSortTips) {
      const hasShow = StorageService.getItem(sorttipsKey);
      if (!hasShow) {
        this.showSortTips = true;
        StorageService.setItem(sorttipsKey, true);
      }
    }
  };

  setKeyPerson = () => {
    this.groupMemberSort();
    this.showToolTip();
  };

  changeAttances = async (emps) => {
    const {
      formPanelStore,
      scheduleConflictPanelStore: { setData, attendees }
    } = this.props;
    if (emps) {
      // 调整人员的时候保持已有顺序
      const hasSortedList = attendees.filter(
        item => emps.findIndex(fItem => fItem.empId === item.empId) !== -1
      );
      const unSortedList = emps.filter(
        item => attendees.findIndex(fItem => fItem.empId === item.empId) === -1
      );
      const empTemps = [...hasSortedList, ...unSortedList];
      formPanelStore.setData({ attendees: empTemps });
      await setData({ attendees: empTemps });
      this.groupMemberSort();
      this.showToolTip();
    }
  };

  groupMemberSort = () => {
    const {
      scheduleConflictPanelStore: {
        organizer: { empId },
        useConflictList
      }
    } = this.props;

    if (this.chatType === 'groupchat') {
      const kpGroup = useConflictList
        .map(item => item.empId)
        .filter(item => item !== empId);
      groupMemberSort({
        empIds: [empId, ...kpGroup],
        chatId: this.chatId,
        chatType: this.chatType
      });
    }
  };

  closeShowSortTips = () => {
    this.showSortTips = false;
  };

  createCallBack = async () => {
    const {
      scheduleConflictPanelStore: {
        noTime,
        organizer: { empId },
        setData,
        useConflictList,
        startTime
      },
      formPanelStore
    } = this.props;
    this.isPoping = true;
    const closeTime = Date.now();
    // 是否含有群外成员
    const isOutGroupMember = useConflictList.some((item) => {
      return !this.userList.includes(item);
    });
    if (isOutGroupMember) {
      addModuleClick('c_oa_825220eo');
    }

    addModuleClick('b_oa_g0iy7z69_mc', {
      duration: closeTime - this.openTime,
      chatType: this.chatType
    });
    try {
      this.startPop();
      const popUpStatus = await dxJSSDK.popUp();
      // 弹出成功
      if (popUpStatus === 0) {
        // electron窗口不可见会导致渲染停止
        const kpGroup = useConflictList
          .map(item => item.empId)
          .filter(item => item !== empId);
        setData(
          {
            keyPerson: kpGroup
          },
          true
        );
        // 不卡流程直接提交
        this.groupMemberSort();

        if (noTime) {
          // 未选中时间则选最近1小时
          const startCurrent = dayjs(
            getQuaterMinuteMoment(dayjs(startTime))
          ).valueOf();
          const endTime = dayjs(startCurrent).add(1, 'hour').valueOf();
          setData(
            {
              startTime: startCurrent,
              endTime,
              originStartTime: startCurrent,
              originEndTime: endTime,
              noTime: false
            },
            false
          );
          formPanelStore.setData({ startCurrent, endTime });
        }

        StorageService.setItemSession('chatPopup', true);
        this.hasPopupInMeetingGroup = true;
      }
      this.isPoping = false;
      // 窗口未聚焦 目前不生效
      setTimeout(() => {
        this.formPanelRef && this.formPanelRef.titleFocus();
      }, 200);
    } catch (e) {
      this.isPoping = false;
    }
  };

  closeGroupPage = () => {
    StorageService.removeItemSession('chatPopup');
    StorageService.removeItemSession('chatType');
    StorageService.removeItemSession('groupUserList');
    dxJSSDK.close();
  };

  startPop = () => {
    // 关闭提示弹框
    this.closeShowSortTips();
    // 隐藏页面 为页面准备好强制渲染一次
    document.body.style.display = 'none';
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    // 2s强制刷新一次，防止visibilitychange事件丢失，出现白屏
    setTimeout(() => {
      this.endPop();
    }, 2000);
  };

  endPop = () => {
    // 触发强制渲染，解决渲染失效
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    document.body.style.display = 'block';
  };

  onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      this.endPop();
    }
  };

  render() {
    // 群日程侧边栏模式
    const isInMeetingNoJump = this.isInMeetingGroup && !this.hasPopupInMeetingGroup;
    const {
      formPanelStore: { isAllDay, requestDetailFail, currentCalendarInfo }
    } = this.props;

    const { nDxScheduleId, nDxAppKey } = window;
    if (requestDetailFail) {
      return <PageErrorItem />;
    }
    return (
      <div
        className={styles.container}
        style={{ minWidth: isInMeetingNoJump ? 'auto' : 860 }}
      >
        {this.isPoping && <div className={styles.popWhiteDiv} />}
        {/* 顶部 */}
        <PageHeader
          isInMeetingNoJump={isInMeetingNoJump}
          isInMeetingGroup={this.isInMeetingGroup}
          id={nDxScheduleId || this.props.match?.params.id}
          handleCancelSchedule={this.handleCancelSchedule}
          btnLoadingStatus={this.btnLoadingStatus}
          handleCheckEdit={this.handleCheckEdit}
          chatType={this.chatType}
          // handleJumpCreate={this.createCallBack}
          closeGroupPage={this.closeGroupPage}
        />
        {/* 主要内容 */}
        <div className={styles.main}>
          <div
            className={styles.left}
            style={{
              display: isInMeetingNoJump ? 'none' : 'flex'
            }}
          >
            <FormPanel
              itemChangeCallback={() => {
                this.hasChangeValue = true;
              }}
              ref={(ref) => {
                this.formPanelRef = ref;
              }}
              originData={this.stateData}
              id={nDxScheduleId || this.props.match?.params.id}
              appKey={nDxAppKey || this.props.match?.params.appKey}
              escStack={this.escStack}
              changeEsc={this.changeEsc}
            />
          </div>
          <div className={styles.right} style={{ paddingLeft: 24 }}>
            <ScheduleConflictPanel
              removePerson={this.removePerson}
              setStartAndHeight={this.setStartAndHeight}
              createCallBack={this.createCallBack}
              setKeyPerson={this.setKeyPerson}
              nCanCreate={isInMeetingNoJump}
              chatId={this.chatId}
              chatType={this.chatType}
              changeAttances={this.changeAttances}
              isInMeetingNoJump={isInMeetingNoJump}
              userList={this.userList}
              isAllDay={isAllDay}
              showSortTips={this.showSortTips}
              closeShowSortTips={this.closeShowSortTips}
              isPublicCalendar={currentCalendarInfo.type === 'PUBLIC'}
            />
          </div>
        </div>
        {isInMeetingNoJump && (
          <PageBottom handleJumpCreate={this.createCallBack} />
        )}
        <CycleModal
          cycleType="edit"
          openDlg={this.nShowCycleDlg}
          closeCycleDlg={() => {
            this.nShowCycleDlg = false;
          }}
          singleCallBack={() => {
            this.setCycleScheduleType(EEffectiveRangeType.SINGLE);
          }}
          cycleCallBack={() => {
            this.setCycleScheduleType(EEffectiveRangeType.CYCLE);
          }}
        />
        <AttendeeModal
          openDlg={this.showAttendeeModal}
          isChangeAttendee={this.isChangeAttendee}
          closeAttendeeModal={this.closeAttendeeModal}
          informAttendeeCallBack={this.handleInformAttendee}
        />
        <CancelModal
          nShowCancelDlg={this.nShowCancelDlg}
          closeShowCancelDlg={() => {
            window.nDxStartTime = 0;
            this.clearWindowFormData();
            this.nShowCancelDlg = false;
          }}
          submitShowCancelDlg={() => {
            this.nShowCancelDlg = false;
            if (!this.cancelReEdit) {
              this.backToFromPage(true);
            } else {
              this.reInit();
            }
          }}
        />
      </div>
    );
  }
}
