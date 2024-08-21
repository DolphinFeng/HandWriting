import { i18nClient } from '@sailor/i18n-web';
/*
 * @Description: 弹出框头信息
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-06-02 17:32:53
 * @LastEditors: chenbaiyu
 * @LastEditTime: 2022-12-29 11:02:52
 * @FilePath: /scheduleweb/src/components/DetailPopContent/DetailPopHeader/index.tsx
 */
import React from 'react';
import { inject, observer } from 'mobx-react';
import dayjs from 'dayjs';
import classNames from 'classnames';
import {
  Button, Tooltip, Modal, Popover
} from '@ss/mtd-react';
import { observable } from 'mobx';
import DetailStore from '@/pages/newWeekly/store/detail';
import {
  EApplicationsType,
  EEffectiveRangeType,
  ERoleType
} from '@/consts/type';
import { messageStore } from '@/store/global';
import { EPageType } from '@/consts';

import { deleteScheule, deleteCycleScheule } from '@/services/weekly';
import { addModuleClick } from '@/services/lxService';
import { routerReplaceWithAppState } from '@/utils/environment';
import share from '@/utils/share';

import {
  CycleModal,
  PersonSelectDlg,
  MeetingReleaseDialog,
  MeetingTransferDialog,
  CancelModal,
  CancelCycleModal
} from '@/components';

import ScheduleDetailHeader from '@/components/ScheduleDetailHeader';
import styles from './index.less';
import WeekStore from '@/pages/newWeekly/store/week';
import MonthStore from '@/pages/newMonthly/store/month';
import { getEnname } from '@/utils';

interface IDetailPopHeader {
  detail?: DetailStore;
  global?: any;
  week?: WeekStore;
  month?: MonthStore;
  ownerName: string;
  hasRequestFinish: boolean;
  isPublicCalendar: boolean;
  publicName?: string;
  pageType?: EPageType;
  isInMonthly?: boolean;
  closePop?: () => void;
}
interface IBgColorAndName {
  name: string;
  colors: string[] | any;
  isBlackTheme?: boolean;
}
interface IDetailPopHeaderState {
  openCycleDlg: boolean;
  openCancelDlg: boolean;
  openCancelCycleDlg: boolean;
  openAddDlg: boolean;
}
@inject('detail', 'global', 'week', 'month')
@observer
export default class extends React.Component<
IDetailPopHeader,
IDetailPopHeaderState
> {
  // 展示更多按钮
  @observable showMoreBtns = false;

  // 释放窗口
  @observable openReleaseDlg = false;

  // 转让窗口
  @observable openTransferDlg = false;

  @observable showShareModal = false;

  @observable openCancelDlg = false;

  @observable openCancelCycleDlg = false;

  // 会议室转让释放区域
  meetingPopBtns;

  // 更多按钮
  moreBtnRef;

  constructor(props) {
    super(props);
    this.state = {
      openCycleDlg: false,
      openCancelDlg: false,
      openCancelCycleDlg: false,
      openAddDlg: false
    };
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }

  /**
   * 获取文字颜色 日程卡片类型名称 卡片渐变色
   */
  getTypeName = (): IBgColorAndName => {
    const {
      ownerName,
      detail: { appKey },
      global: {
        currentUser: { name, enName }
      }
    } = this.props;

    let result: IBgColorAndName = {
      name: '日程',
      colors: ['#0A70F5', '#2A8EFE'],
      isBlackTheme: false
    };

    switch (appKey) {
      case EApplicationsType.Exchange:
        result = {
          name: '邮箱',
          colors: ['#0A70F5', '#2A8EFE']
        };
        break;

      case EApplicationsType.IPU:
        result = {
          name: '互联网+大学',
          colors: ['#0A70F5', '#2A8EFE']
        };
        break;
      case EApplicationsType.Promotionapi:
        result = {
          name: '晋升系统',
          colors: ['#0A70F5', '#2A8EFE']
        };
        break;
      case EApplicationsType.Schedule:
      case EApplicationsType.Meeting:
        result.name = i18nClient.t(
          'detail_pop_content_someone_calendar',
          '{name}的日程',
          { name: ownerName || `${name}${getEnname(enName)}` }
        );
        break;
      default:
        break;
    }

    return result;
  };

  toggleDlg = (value) => {
    this.setState({ openCycleDlg: value });
  };

  toggleCancleDlg = (value) => {
    this.setState({ openCancelDlg: value });
  };

  toggleCancelCycleDlg = (value) => {
    this.setState({ openCancelCycleDlg: value });
  };

  handleDel = async (reason?: string) => {
    const { scheduleId } = this.props.detail;
    await deleteScheule({ scheduleId, reason });
    messageStore.success(
      i18nClient.t(
        'detail_pop_content_cancel_calendar_successfully',
        '取消日程成功'
      )
    );
    this.closePop();
  };

  handleCircleDel = async (type: EEffectiveRangeType, reason: string) => {
    const { scheduleId, recurrenceScheduleId } = this.props.detail;
    if (type === EEffectiveRangeType.SINGLE || !recurrenceScheduleId) {
      await deleteScheule({
        scheduleId,
        reason
      });
    } else {
      await deleteCycleScheule({
        scheduleId,
        recurrenceScheduleId,
        reason
      });
    }
    messageStore.success(
      i18nClient.t(
        'detail_pop_content_cancel_calendar_successfully',
        '取消日程成功'
      )
    );
    this.closePop();
  };

  openDelDlg = (): void => {
    Modal.warning({
      title: i18nClient.t(
        'detail_pop_content_cancel_calendar_confirm',
        '确定要取消该日程吗？'
      ),
      okText: i18nClient.t('detail_pop_content_cancel_calendar', '取消日程'),
      cancelText: i18nClient.t(
        'detail_pop_content_no_cancel_for_now',
        '暂不取消'
      ),
      okBtnProps: { type: 'primary', style: { fontWeight: 500 } },
      cancelBtnProps: {
        style: {
          backgroundColor: 'rgba(17, 25, 37, 0.05)',
          border: 'transparent',
          fontWeight: 500,
          color: '#111925'
        }
      },
      onOk: () => this.handleDel()
    });
  };

  deleteClick = () => {
    const { isCyclic, attendees } = this.props.detail;
    const hasAttendees = attendees && attendees.length > 0;
    const isCyclicSchedule = isCyclic === 1;
    switch (true) {
      case isCyclicSchedule && hasAttendees:
        this.toggleCancelCycleDlg(true);
        break;
      case isCyclicSchedule && !hasAttendees:
        this.toggleDlg(true);
        break;
      case !isCyclicSchedule && hasAttendees:
        this.toggleCancleDlg(true);
        break;
      case !isCyclicSchedule && !hasAttendees:
        this.openDelDlg();
        break;
      default:
        break;
    }
  };

  closePop = () => {
    const { closePop } = this.props;
    if (closePop) {
      closePop();
    }
  };

  edit = (isExchange) => {
    const {
      pageType,
      detail: {
        scheduleId,
        closeDetailPop,
        title,
        targetUrl,
        startTime,
        endTime,
        isAllDay,
        memo,
        noticeType,
        noticeRule,
        appKey,
        deadline,
        roomName,
        locationId,
        locationMail,
        recurrenceScheduleId
      },
      global: { setData },
      isPublicCalendar
    } = this.props;
    if (!this.nFromOutSystemType() || isPublicCalendar) {
      // 内部来源日程或者公共日历日程跳转
      closeDetailPop();
      const data = {
        scheduleId,
        title,
        startTime,
        endTime,
        isAllDay,
        remark: memo,
        noticeType,
        noticeRule,
        recurrenceScheduleId,
        deadline,
        roomName,
        locationId,
        locationMail,
        appKey,
        isPublicCalendar // 是公共日历
      };
      setData({
        lastPageId: pageType === EPageType.MEETING ? 'rooms' : 'weekly'
      });
      routerReplaceWithAppState(`/edit/${scheduleId}/${appKey}`, data);
    } else {
      // 外部来源会议，打开targeturl
      window.open(targetUrl);
    }
    addModuleClick('b_oa_09cdgsva_mc', {
      scheduleId
    });
    // 点击跳转邮箱系统
    if (isExchange) {
      addModuleClick('b_oa_aj7x6c54_mc');
    }
  };

  /**
   * 外部来源的会议
   * 不显示编辑和增加人跳转到系统去，分享按钮控制
   */
  nFromOutSystemType = (): boolean => {
    const { appKey } = this.props.detail;
    if (
      appKey === EApplicationsType.IPU
      || appKey === EApplicationsType.Exchange
      || appKey === EApplicationsType.ZhaoPin
    ) {
      return true;
    }
    return false;
  };

  /**
   * 是否为创建者
   */
  nIsOrganizer = (): boolean => {
    const {
      // pageType,
      detail: { role, organizer },
      global: { currentUser }
    } = this.props;
    if (
      role?.roleType === ERoleType.ORGANIZER
      && organizer?.empId === `${currentUser.empId}`
    ) {
      return true;
    }
    return false;
  };

  // 第三方系统编辑按钮 目前还需要前端控制
  nCanOutSystemEdit = () => {
    const { targetUrl } = this.props.detail;
    // 是组织者 + 第三方系统 + 有跳转的第三方系统链接
    if (this.nIsOrganizer() && this.nFromOutSystemType() && targetUrl) {
      return true;
    }
    return false;
  };

  // 分享
  // 订会议室页面传递 组织者ID | 主视图页面传递日程 拥有者ID
  shareClick = () => {
    const {
      detail: { scheduleId, appKey, empId }
    } = this.props;
    share
      && share.shareToOther({
        scheduleId,
        appKey,
        organizerEmpId: empId
      });
    // 详情卡片-点击分享按钮
    addModuleClick('b_oa_008essr0_mc');
  };

  openAdd = () => {
    this.setState({ openAddDlg: true });
    // const { currentUser } = this.props.global;
    const { scheduleId } = this.props.detail;
    addModuleClick('b_oa_twsvk4so_mc', {
      scheduleId
    });
  };

  // 点击区域之外关闭释放和转让会议室按钮区域
  handleClickOutside = (event) => {
    if (
      (this.meetingPopBtns && this.meetingPopBtns.contains(event.target))
      || (this.moreBtnRef && this.moreBtnRef.contains(event.target))
    ) {
      // 点击组件内部无需处理
    } else {
      // 点击组件外部关闭
      this.showMoreBtns = false;
    }
  };

  closeAdd = () => {
    this.setState({ openAddDlg: false });
  };

  // 不足15分钟的会议日程不能转让或释放
  finishInQuato = (buf, finshBUf) => {
    const { endTime } = this.props.detail;
    const current = dayjs().valueOf();
    if (endTime - current <= 15 * 60 * 1000) {
      if (endTime < current) {
        messageStore.error(finshBUf);
      } else {
        messageStore.error(buf);
      }
      return true;
    }
    return false;
  };

  // 释放
  openReleaseCb = () => {
    const timeNotEnoughText = i18nClient.t(
      'detail_pop_content_less_than_fifteen_left_to_release',
      '剩余不足15分钟，无法释放'
    );
    const meetingClosedText = i18nClient.t(
      'detail_pop_content_meeting_closed_not_released',
      '会议已结束，无法释放'
    );
    if (!this.finishInQuato(timeNotEnoughText, meetingClosedText)) {
      this.openReleaseDlg = true;
      this.showMoreBtns = false;
      addModuleClick('b_oa_xuq2c72c_mc');
    }
  };

  // 转让
  openTransferCb = () => {
    const timeNotEnoughText = i18nClient.t(
      'detail_pop_content_less_than_fifteen_left_to_transfer',
      '剩余不足15分钟，无法转让'
    );
    const meetingClosedText = i18nClient.t(
      'detail_pop_content_meeting_closed_not_transfer',
      '会议已结束，无法转让'
    );
    if (!this.finishInQuato(timeNotEnoughText, meetingClosedText)) {
      this.openTransferDlg = true;
      this.showMoreBtns = false;
      addModuleClick('b_oa_dd0lk0a6_mc');
    }
  };

  // 渲染释放和转让按钮
  renderMeetingBtns = (canMeetingRelease, canMeetingTransfer) => {
    const text = (
      <div
        ref={(ref) => {
          this.meetingPopBtns = ref;
        }}
      >
        {!!canMeetingRelease && <div onClick={this.openReleaseCb} className={styles.meetingBtn}>
          {i18nClient.t(
            'detail_pop_content_release_meeeting_rooms',
            '释放会议室'
          )}
        </div>}
        {!!canMeetingTransfer && <div onClick={this.openTransferCb} className={styles.meetingBtn}>
          {i18nClient.t(
            'detail_pop_content_transfer_meeeting_rooms',
            '转让会议室'
          )}
        </div>}
      </div>
    );
    return (
      <Popover
        className={styles.meetingBtnsPop}
        content={text}
        placement={'bottom'}
        visible={this.showMoreBtns}
      >
        <div className={styles.hiddenForPopover} />
      </Popover>
    );
  };

  render() {
    const {
      detail: {
        scheduleId,
        recurrenceScheduleId,
        appKey,
        isCyclic,
        attendees,
        organizer,
        roomName,
        startTime,
        endTime,
        applicationName,
        applicationId,
        memo,
        canAddAttendee,
        canCancel,
        canEdit,
        canMeetingRelease,
        canMeetingTransfer,
        canShare
      },
      global: { showShare },
      isPublicCalendar,
      publicName,
      hasRequestFinish,
      isInMonthly
    } = this.props;
    const {
      openCycleDlg,
      openCancelDlg,
      openCancelCycleDlg,
      openAddDlg
    } = this.state;
    let themeType: IBgColorAndName;

    let calendar;
    let detailColors;
    if (isPublicCalendar) {
      const {
        week: {
          scheduleSourcePanelStore: { publicCalendarList, getColorByMainColor }
        },
        month: { calendarListInMonth }
      } = this.props;

      if (!isInMonthly) {
        // 公共日历并且不是月视图页面
        calendar = publicCalendarList.find(item => item.calendarId === applicationId);
      } else {
        // 月视图页面
        calendar = calendarListInMonth.find(
          item => item.calendarId === applicationId
        );
      }

      detailColors = getColorByMainColor(calendar?.calendarColor, 'detail');
      themeType = {
        name: applicationName || publicName,
        colors: detailColors,
        isBlackTheme: false
      };
    } else {
      themeType = this.getTypeName();
    }

    let attendeesWithOrg = [];

    if (organizer) {
      attendeesWithOrg = [organizer];
    }
    if (attendees && attendees.length > 0) {
      attendeesWithOrg = [...attendeesWithOrg, ...attendees];
    }

    return (
      <div
        className={styles.popHeaderContent}
        style={{
          backgroundImage: `linear-gradient(111deg, ${themeType.colors[0]} 0%,  ${themeType.colors[1]} 100%)`,
          ...(!memo && isPublicCalendar ? { borderRadius: 10 } : {}) // 没有备注且是公共日历，底部显示圆角
        }}
      >
        <div className={styles.typeAndOpt}>
          <Tooltip
            placement={'bottomLeft'}
            delayHide={0}
            message={themeType.name}
          >
            <div
              className={classNames(styles.type, {
                [styles.colorBlackTheme]: themeType.isBlackTheme
              })}
            >
              {themeType.name}
            </div>
          </Tooltip>
          <div style={{ flex: '1', color: '#fff' }} />
          {hasRequestFinish && (
            <div className={styles.topButton}>
              {
                // canEdit 目前服务端针对的是内部日程，直接可以编辑
                // 外部日程，满足编辑条件， 除了邮箱的可以编辑
                (!!canEdit || (this.nCanOutSystemEdit() && themeType.name !== '邮箱')) && (
                  <Tooltip
                    placement={'bottom'}
                    delayHide={0}
                    message={i18nClient.t(
                      'detail_pop_content_edit_calendar',
                      '编辑日程'
                    )}
                  >
                    <Button
                      icon={'edit-o'}
                      onClick={this.edit}
                      shape="circle"
                      size="small"
                      hoverShape
                    />
                  </Tooltip>
                )
              }
              {/* 邮箱可编辑逻辑 */}
              {(!canEdit && this.nCanOutSystemEdit() && themeType.name === '邮箱') && (
                  <div className={styles.exchangeTxtWrap}>
                    <div className={styles.exchangeTxt}>
                      {i18nClient.t(
                        'detail_pop_content_calendar_from_email',
                        '此日程来自邮箱,编辑、删除等请前往'
                      )}
                      <span
                        className={styles.txt}
                        onClick={() => {
                          this.edit(true);
                        }}
                      >
                        {i18nClient.t(
                          'detail_pop_content_email_system',
                          '邮箱系统'
                        )}
                      </span>
                    </div>
                  </div>
              )}
              {!!canAddAttendee && (
                <Tooltip
                  placement={'bottom'}
                  delayHide={0}
                  message={i18nClient.t(
                    'detail_pop_content_add_participant',
                    '添加参与者'
                  )}
                >
                  <Button
                    icon="avatar-add"
                    shape="circle"
                    size="small"
                    hoverShape
                    onClick={this.openAdd}
                  />
                </Tooltip>
              )}
              {!!canCancel && (
                <Tooltip placement={'bottom'} delayHide={0} message={i18nClient.t(
                  'detail_pop_content_cancel_calendar_tooltip',
                  '取消日程'
                )}>
                  <Button
                    icon="delete-o"
                    onClick={this.deleteClick}
                    shape="circle"
                    size="small"
                    hoverShape
                  />
                </Tooltip>
              )}
              {/* (后端可分享 || 第三方日程) && 容器支持 */}
              {!!((canShare || this.nFromOutSystemType()) && showShare) && (
                <Tooltip placement={'bottom'} delayHide={0} message={i18nClient.t(
                  'detail_pop_content_share_calendar_tooltip',
                  '分享日程'
                )}>
                  <Button
                    icon="share-o"
                    onClick={this.shareClick}
                    shape="circle"
                    size="small"
                    hoverShape
                  />
                </Tooltip>
              )}

              {!!(canMeetingRelease || canMeetingTransfer) && (
                <div
                  ref={(ref) => {
                    this.moreBtnRef = ref;
                  }}
                  className={styles.lastMoreBtn}
                >
                  <Tooltip
                    placement={'bottom'}
                    delayHide={0}
                    message={i18nClient.t('detail_pop_content_more', '更多')}
                  >
                    <Button
                      icon="ellipsis"
                      onClick={(e) => {
                        this.showMoreBtns = true;
                        // 防止冒泡到window上导致又把popover关闭
                        e.stopPropagation();
                      }}
                      shape="circle"
                      size="small"
                      hoverShape
                    />
                  </Tooltip>
                  {this.renderMeetingBtns(canMeetingRelease, canMeetingTransfer)}
                </div>
              )}
            </div>
          )}
        </div>
        <ScheduleDetailHeader
          color="detailColor"
          theme="detailTheme"
          isPublicCalendar={isPublicCalendar}
          themeType={themeType}
          closePop={this.closePop}
        />

        <CycleModal
          openDlg={openCycleDlg}
          closeCycleDlg={(): void => {
            this.toggleDlg(false);
          }}
          cycleType="del"
          closePop={this.closePop}
          scheduleId={scheduleId}
          appKey={appKey}
          recurrenceScheduleId={recurrenceScheduleId}
        />
        <CancelModal
          openDlg={openCancelDlg}
          closeCancelDlg={(): void => {
            this.toggleCancleDlg(false);
          }}
          confirm={this.handleDel}
        />
        <CancelCycleModal
          openDlg={openCancelCycleDlg}
          closeCancleCycleDlg={(): void => {
            this.toggleCancelCycleDlg(false);
          }}
          confirm={this.handleCircleDel}
        />
        {/* 添加参与人弹窗 */}
        <PersonSelectDlg
          openDlg={openAddDlg}
          isCyclic={isCyclic}
          closeAddDlg={this.closeAdd}
          closePop={this.closePop}
          scheduleId={scheduleId}
          appKey={appKey}
          attendees={attendeesWithOrg}
          formData={this.props.detail}
          recurrenceScheduleId={recurrenceScheduleId}
        />
        {/* 释放会议室弹窗 */}
        <MeetingReleaseDialog
          openDlg={this.openReleaseDlg}
          roomName={roomName}
          id={scheduleId}
          startTime={startTime}
          endTime={endTime}
          closeReleaseDlg={() => {
            this.openReleaseDlg = false;
          }}
          closePop={this.closePop}
        />
        {/* 转让会议室弹窗 */}
        <MeetingTransferDialog
          openDlg={this.openTransferDlg}
          roomName={roomName}
          id={scheduleId}
          startTime={startTime}
          endTime={endTime}
          closeReleaseDlg={() => {
            this.openTransferDlg = false;
          }}
          closePop={this.closePop}
        />
      </div>
    );
  }
}
