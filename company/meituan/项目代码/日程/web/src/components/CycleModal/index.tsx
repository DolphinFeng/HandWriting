/*
 * @Description: 循环生效 本次生效选择组件
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-06-10 15:57:56
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-12-28 19:27:15
 * @FilePath: /scheduleweb/src/components/CycleModal/index.tsx
 */
import React from 'react';
import { Button, Modal, Radio } from '@ss/mtd-react';
import { EFeedbackType } from '@/consts/type';
import { messageStore } from '@/store/global';
import { deleteScheule, deleteCycleScheule } from '@/services/weekly';
import styles from './index.less';
import { i18nClient } from '@sailor/i18n-web';


/**
 * 操作类型: 取消日程、
 */
enum ECycleType {
  // eslint-disable-next-line no-unused-vars
  Del = 'del',
  // eslint-disable-next-line no-unused-vars
  Feed = 'feed',
  // eslint-disable-next-line no-unused-vars
  Add = 'Add',
  // eslint-disable-next-line no-unused-vars
  Edit = 'edit'
}

interface IDetailDelete {
  openDlg: boolean;
  scheduleId: string;
  appKey: string;
  recurrenceScheduleId?: string;
  feedbackType?: EFeedbackType;
  closeCycleDlg?: () => void;
  closePop?: () => void;
  singleCallBack?: () => void; // 传入的外部当前修改接口，后续重构成全部传入
  cycleCallBack?: () => void; // 传入的外部循环修改接口
  cycleType?: ECycleType;
  attendees?: string[];
}

interface IDetailDeleteState {
  type: string;
}

export default class CycleModal extends React.Component<
IDetailDelete,
IDetailDeleteState
> {
  constructor(props) {
    super(props);
    this.state = {
      type: 'single'
    };
  }

  handleSubmit = async () => {
    const { type } = this.state;
    const {
      scheduleId,
      recurrenceScheduleId,
      cycleType,
      singleCallBack,
      cycleCallBack
    } = this.props;
    if (
      ECycleType.Edit === cycleType
      || ECycleType.Add === cycleType
      || ECycleType.Feed === cycleType
    ) {
      if (type === 'single') {
        if (singleCallBack) {
          singleCallBack();
        }
      } else if (cycleCallBack) {
        cycleCallBack();
      }
    } else {
      // 只有删除日程耦合到该弹框 后续处理掉
      if (type === 'single' || !recurrenceScheduleId) {
        await deleteScheule({
          scheduleId
        });
      } else {
        await deleteCycleScheule({
          scheduleId,
          recurrenceScheduleId
        });
      }
      messageStore.success(i18nClient.t('cycle_modal_calendar_cancellation_successful', '取消日程成功'));
      this.closeAllModal();
      this.closePop();
    }
  };

  closeAllModal = () => {
    const { closeCycleDlg } = this.props;
    if (closeCycleDlg) {
      closeCycleDlg();
    }
  };

  closePop = () => {
    const { closePop } = this.props;
    if (closePop) {
      closePop();
    }
  };

  handlePlaceChange = (checkedValue) => {
    this.setState({ type: checkedValue });
  };

  render() {
    const { openDlg, feedbackType, cycleType } = this.props;
    const { type } = this.state;
    const { clientWidth } = document.querySelector('body');
    return (
      <div>
        {openDlg && (
          <Modal
            style={{ width: 400 }}
            maskClosable={false}
            title={i18nClient.t('cycle_modal_select_the_scope', '此日程为循环日程，请选择生效范围')}
            onClose={this.closeAllModal}
          >
            <Modal.Body>
              {cycleType === 'feed'
                && feedbackType === EFeedbackType.Refuse && (
                  <p>
                    {i18nClient.t('cycle_modal_not_show_after_rejected', '拒绝后该日程将不再显示。之后如有日程变更，你会重新收到该日程')}
                  </p>
              )}
              <Radio.Group
                value={type}
                onChange={this.handlePlaceChange}
                className={styles.radio_group}
              >
                <Radio
                  className={styles.radio_item}
                  style={{ paddingLeft: clientWidth <= 300 ? '0px' : '110px' }}
                  key="single"
                  value="single"
                >
                  {i18nClient.t('cycle_modal_this_schedule', '此日程')}
                </Radio>
                <Radio
                  className={styles.radio_item}
                  style={{ paddingLeft: clientWidth <= 300 ? '0px' : '110px' }}
                  key="cycle"
                  value="cycle"
                >
                  {i18nClient.t('cycle_modal_all_schedule', '所有日程')}
                </Radio>
              </Radio.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                style={{ marginRight: '12px' }}
                onClick={this.closeAllModal}
              >
                {i18nClient.t('cycle_modal_cancel', '取消')}
              </Button>
              <Button type="primary" onClick={this.handleSubmit}>
                {i18nClient.t('cycle_modal_confirm', '确定')}
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>
    );
  }
}
