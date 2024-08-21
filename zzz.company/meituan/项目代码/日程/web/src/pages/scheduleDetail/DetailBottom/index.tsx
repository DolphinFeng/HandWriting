import { i18nClient } from '@sailor/i18n-web';
import React from 'react';
import { Modal } from '@ss/mtd-react';
import { inject, observer } from 'mobx-react';
import { messageStore } from '@/store/global';
import { moduleClick } from 'onejs/lx';
import classNames from 'classnames';
import { EPageType } from '@/consts';
import DetailStore from '@/pages/newWeekly/store/detail';
import { feedbackScheule, feedbackCycleScheule } from '@/services/weekly';
import { EFeedbackType } from '@/consts/type';
import { CycleModal } from '@/components';
import dx from '@/utils/dxCalendar';

import styles from './index.less';

export interface IDetailBottom {
  detail?: DetailStore;
  global?: any;
  pageType?: EPageType;
}
interface IDetailPopBodyState {
  // showOverflowLine: boolean;
  openCycleModal: boolean;
  feedbackType: EFeedbackType;
}

@inject('detail', 'global')
@observer
export default class DetailBottom extends React.Component<
IDetailBottom,
IDetailPopBodyState
> {
  constructor(props) {
    super(props);
    this.state = {
      // showOverflowLine: false,
      openCycleModal: false,
      feedbackType: EFeedbackType.Default
    };
  }

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

  handleFeedbackSingle = async (type: EFeedbackType) => {
    const { scheduleId, appKey } = this.props.detail;
    await feedbackScheule({
      appKey,
      scheduleId,
      feedbackType: type
    });
    messageStore.success(
      i18nClient.t('detail_bottom_reply_successfully', '回复成功')
    );
    setTimeout(() => {
      dx.close();
    }, 800);
  };

  handleSingleFeedback = (type) => {
    const { feedback } = this.props.detail;
    if (type !== EFeedbackType.Refuse) {
      this.handleFeedbackSingle(type);
    } else if (feedback === EFeedbackType.Refuse) {
      messageStore.error(
        i18nClient.t(
          'detail_bottom_rejected_already',
          '你已拒绝该日程，不可再次回复'
        )
      );
    } else {
      Modal.warning({
        title: i18nClient.t(
          'detail_bottom_cancel_confirm',
          '确定要拒绝该日程吗？'
        ),
        message: i18nClient.t(
          'detail_bottom_not_after_rejected',
          '拒绝后该日程将不再显示。之后如有日程变更，你会重新收到该日程'
        ),
        okText: i18nClient.t('detail_bottom_confirm', '确定'),
        cancelText: i18nClient.t('detail_bottom_cancel', '取消'),
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
      i18nClient.t('detail_bottom_reply_successfully', '回复成功')
    );
    setTimeout(() => {
      dx.close();
    }, 600);
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
    let moduleName = 'b_oa_blyp3sg1_mc'; // 接受
    if (type === EFeedbackType.Tentative) {
      moduleName = 'b_oa_92va768v_mc'; // 暂定
    } else if (type === EFeedbackType.Refuse) {
      moduleName = 'b_oa_qn5mmq52_mc'; // 拒绝
    }

    moduleClick(moduleName, {
      userMis: currentUser?.mis,
      scheduleId
    });
  };


  render() {
    const { openCycleModal, feedbackType } = this.state;
    const {
      detail: {
        scheduleId, appKey, recurrenceScheduleId, feedback, canFeedback
      }
    } = this.props;

    return (
      <>
        {!!canFeedback && (
          <div
            className={styles.opts}
            style={{
              borderTop: '1px solid rgba(0, 0, 0, 0.06)'
            }}
          >
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
              {feedback === EFeedbackType.Accept ? (
                <p>{i18nClient.t('detail_bottom_recept_already', '已接受')}</p>
              ) : (
                <p>{i18nClient.t('detail_bottom_recept', '接受')}</p>
              )}
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
              {feedback === EFeedbackType.Tentative ? (
                <p>
                  {i18nClient.t('detail_bottom_tentative_already', '已暂定')}
                </p>
              ) : (
                <p>{i18nClient.t('detail_bottom_tentative', '暂定')}</p>
              )}
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
              {feedback === EFeedbackType.Refuse ? (
                <p>{i18nClient.t('detail_bottom_refuse_already', '已拒绝')}</p>
              ) : (
                <p>{i18nClient.t('detail_bottom_refuse', '拒绝')}</p>
              )}
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
          scheduleId={scheduleId}
          appKey={appKey}
          cycleType={'feed'}
          recurrenceScheduleId={recurrenceScheduleId}
        />
      </>
    );
  }
}
