/*
 * @Description: 弹出框详情信息
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-06-03 11:00:13
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2021-05-25 15:06:08
 * @FilePath: /scheduleweb/src/components/DetailPopContent/DetailPopBody/index.tsx
 */
import React from 'react';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import { moduleClick } from 'onejs/lx';
import { i18nClient } from '@sailor/i18n-web';
import { Modal } from '@ss/mtd-react';
import DetailStore from '@/pages/newWeekly/store/detail';
import {
  CycleModal,
  RoomNotice
} from '@/components';
import { EFeedbackType } from '@/consts/type';
import { feedbackScheule, feedbackCycleScheule } from '@/services/weekly';
import { messageStore } from '@/store/global';
import Location from '@/components/ScheduleDetailPage/Location';
import Memo from '@/components/ScheduleDetailPage/Memo';
import NoticeDescription from '@/components/ScheduleDetailPage/NoticeDescription';
import Organizer from '@/components/ScheduleDetailPage/Organizer';
import RecurrenceDescription from '@/components/ScheduleDetailPage/RecurrenceDescription';
import RoomName from '@/components/ScheduleDetailPage/RoomName';
import FeedBackTabPage from '@/components/ScheduleDetailPage/FeedBackTabPage';
import styles from './index.less';

export interface IDetailPopBody {
  isPublicCalendar: boolean;
  detail?: DetailStore;
  global?: any;
  minAppendHeight?: number;
  forceAlignCb?: () => void;
  closePop?: () => void;
}
interface IDetailPopBodyState {
  showOverflowLine: boolean;
  openCycleModal: boolean;
  feedbackType: EFeedbackType;
}

@inject('detail', 'global')
@observer
export class DetailPopBody extends React.Component<
IDetailPopBody,
IDetailPopBodyState
> {
  detailBodyRef: HTMLDivElement;

  constructor(props) {
    super(props);
    this.state = {
      showOverflowLine: false,
      openCycleModal: false,
      feedbackType: EFeedbackType.Default
    };
  }

  componentDidMount() {
    this.checkShowOverflowLine();
  }

  checkShowOverflowLine = (): void => {
    const { canFeedback } = this.props.detail;

    if (canFeedback && this.detailBodyRef) {
      const { clientHeight, scrollHeight } = this.detailBodyRef;
      this.setState({
        showOverflowLine: scrollHeight > clientHeight
      });
    }
  };

  openCycleModal = () => {
    this.setState({
      openCycleModal: true
    });
  };

  closeCycleModal = () => {
    this.setState({
      openCycleModal: false
    });
  };

  closePop = () => {
    const { closePop } = this.props;
    if (closePop) {
      closePop();
    }
  };

  handleFeedbackSingle = async (type: EFeedbackType) => {
    const { scheduleId, appKey } = this.props.detail;
    await feedbackScheule({
      appKey,
      scheduleId,
      feedbackType: type
    });
    messageStore.success(
      i18nClient.t('detail_pop_body_is_included_chinese', '回复成功')
    );
    this.closePop();
  };

  handleSingleFeedback = (type) => {
    if (type !== EFeedbackType.Refuse) {
      this.handleFeedbackSingle(type);
    } else {
      Modal.warning({
        title: i18nClient.t(
          'detail_pop_body_reject_this_calendar_confirm',
          '确定要拒绝该日程吗？'
        ),
        message: i18nClient.t(
          'detail_pop_body_no_longer_displayed_after_rejected',
          '拒绝后该日程将不再显示。之后如有日程变更，你会重新收到该日程'
        ),
        okText: i18nClient.t('detail_pop_body_confirm', '确定'),
        cancelText: i18nClient.t('detail_pop_body_reject', '取消'),
        okBtnProps: { type: 'primary' },
        onOk: () => this.handleFeedbackSingle(type)
      });
    }
  };

  handleCycleFeedback = async () => {
    const { scheduleId, appKey, recurrenceScheduleId } = this.props.detail;
    const { feedbackType } = this.state;
    await feedbackCycleScheule({
      scheduleId,
      recurrenceScheduleId,
      appKey,
      feedbackType
    });
    messageStore.success(
      i18nClient.t('detail_pop_body_is_included_chinese', '回复成功')
    );
    this.closePop();
  };

  handleFeedback = async (type: EFeedbackType) => {
    const { isCyclic, scheduleId } = this.props.detail;
    if (isCyclic !== 1) {
      this.handleSingleFeedback(type);
    } else {
      this.setState({ feedbackType: type });
      this.openCycleModal();
    }
    const { currentUser } = this.props.global;
    let moduleName = 'b_oa_ac4zu970_mc'; // 接受
    if (type === EFeedbackType.Tentative) {
      moduleName = 'b_oa_529t9x84_mc'; // 暂定
    } else if (type === EFeedbackType.Refuse) {
      moduleName = 'b_oa_3ml6pgnu_mc'; // 拒绝
    }
    moduleClick(moduleName, {
      userMis: currentUser?.mis,
      scheduleId
    });
  };

  render() {
    const { showOverflowLine, openCycleModal, feedbackType } = this.state;
    const {
      location,
      locationId,
      organizer,
      memo,
      scheduleId,
      appKey,
      recurrenceScheduleId,
      noticeDescription,
      recurrenceDescription,
      roomName,
      roomInfo, // 完整的会议室信息
      roomLocationUrl,
      deadline,
      feedback,
      isCyclic,
      canFeedback
    } = this.props.detail;
    const { isPublicCalendar } = this.props;

    const { minAppendHeight } = this.props;
    const minHeight = 163 + minAppendHeight || 0;
    if (isPublicCalendar) {
      if (!memo) {
        return null;
      }
      return (
        <div
          ref={(ref) => {
            this.detailBodyRef = ref;
          }}
          className={styles.detailPopPublicBody}
          onScroll={(e) => {
            e.stopPropagation();
          }}
        >
          <Memo memo={memo} />
        </div>
      );
    }
    return (
      <div
        ref={(ref) => {
          this.detailBodyRef = ref;
        }}
        className={styles.detailPopBody}
        style={
          // 能反馈，卡片预留更多的位置放反馈按钮
          canFeedback
            ? { minHeight }
            : {
              borderBottomWidth: 14,
              minHeight
            }
        }
      >
        {/* 日程详情主题内容组件 */}
        <Location location={location} />
        <RoomName
          roomName={roomName}
          roomInfo={roomInfo}
          roomLocationUrl={roomLocationUrl}
          locationId={locationId}
        />
        <RoomNotice roomInfo={roomInfo} />
        <Organizer organizer={organizer} />
        <FeedBackTabPage detailBodyRef={this.detailBodyRef} />
        <NoticeDescription noticeDescription={noticeDescription} />
        <RecurrenceDescription
          recurrenceDescription={recurrenceDescription}
          deadline={deadline}
          isCyclic={isCyclic}
        />
        <Memo memo={memo} />

        {showOverflowLine && <div className={styles.scrollLine} />}
        {!!canFeedback && (
          <div className={styles.opts}>
            <div
              className={classNames(styles.btn, {
                [styles.btnSelected]: feedback === EFeedbackType.Accept
              })}
              onClick={(): void => {
                this.handleFeedback(EFeedbackType.Accept);
              }}
            >
              <i
                style={{ fontSize: 16, color: '#00B365' }}
                className="dxcalendar dx-calaccept"
              />
              <p>{i18nClient.t('detail_pop_body_dxcalendar_accept', '接受')}</p>
            </div>
            <div
              className={classNames(styles.btn, {
                [styles.btnSelected]: feedback === EFeedbackType.Tentative
              })}
              onClick={(): void => {
                this.handleFeedback(EFeedbackType.Tentative);
              }}
            >
              <i
                style={{ fontSize: 16, color: '#ff8800' }}
                className="dxcalendar dx-caltemporarily"
              />
              <p>
                {i18nClient.t('detail_pop_body_dxcalendar_indicative', '暂定')}
              </p>
            </div>
            <div
              className={classNames(styles.btn, {
                [styles.btnSelected]: feedback === EFeedbackType.Refuse
              })}
              onClick={(): void => {
                this.handleFeedback(EFeedbackType.Refuse);
              }}
            >
              <i
                style={{ fontSize: 16, color: '#F5483B' }}
                className="dxcalendar dx-calrefues"
              />
              <p>{i18nClient.t('detail_pop_body_dxcalendar_reject', '拒绝')}</p>
            </div>
          </div>
        )}
        <CycleModal
          singleCallBack={() => {
            this.handleFeedbackSingle(feedbackType);
          }}
          cycleCallBack={this.handleCycleFeedback}
          feedbackType={feedbackType}
          openDlg={openCycleModal}
          closeCycleDlg={this.closeCycleModal}
          closePop={this.closePop}
          scheduleId={scheduleId}
          appKey={appKey}
          cycleType={'feed'}
          recurrenceScheduleId={recurrenceScheduleId}
        />
      </div>
    );
  }
}
