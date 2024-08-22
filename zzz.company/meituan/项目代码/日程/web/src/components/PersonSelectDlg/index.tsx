import { i18nClient } from '@sailor/i18n-web';
/*
 * @Description: 添加参会人
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-06-10 15:57:56
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2021-05-25 19:40:34
 * @FilePath: /scheduleweb/src/components/PersonSelectDlg/index.tsx
 */
import React from 'react';
import { debounce } from 'lodash';
import { Button, Modal } from '@ss/mtd-react';
import dayjs from 'dayjs';
import { CycleModal, UserSelect, AttendeeModal } from '@/components';
import { IPersonInfo, EEffectiveRangeType, EInformType } from '@/consts';
import { addAttendances, addCycleAttendances } from '@/services/weekly';
import { setStorageUsers } from '@/utils';
import { messageStore } from '@/store/global';
import { ERecurrenceType } from '@/consts/recurrenceType';
import './index.less';

interface IPersonSelect {
  openDlg: boolean;
  scheduleId: string;
  appKey: string;
  recurrenceScheduleId?: string;
  isCyclic?: number;
  closeAddDlg?: () => void;
  closePop?: () => void;
  attendees?: IPersonInfo[];
  formData: any;
}

interface IPersonSelecState {
  showCycle: boolean;
  usersList?: IPersonInfo[];
  originUserListNum: number;
  isShowAttendeeModal: boolean;
  type: string;
  informType: string;
  isChangeAttendee: boolean;
}

const storageKey = 'users_select';
export default class PersonSelectDlg extends React.Component<
IPersonSelect,
IPersonSelecState
> {
  throttleHandleInformAttendee = null;

  throttleHandleAddPerson = null;

  constructor(props) {
    super(props);
    this.state = {
      showCycle: false,
      usersList: this.props.attendees,
      originUserListNum: this.props.attendees.length,
      isShowAttendeeModal: false,
      type: '',
      informType: '',
      isChangeAttendee: false
    };
    this.throttleHandleAddPerson = debounce(this.handleAddPerson, 200);
    this.throttleHandleInformAttendee = debounce(
      this.handleInformAttendee,
      200
    );
  }

  componentDidMount() {
    this.setState({
      showCycle: false,
      usersList: this.props.attendees,
      originUserListNum: this.props.attendees.length,
      isShowAttendeeModal: false,
      type: '',
      informType: '',
      isChangeAttendee: false
    });
  }

  // eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      JSON.stringify(nextProps.attendees)
      !== JSON.stringify(this.props.attendees)
    ) {
      this.setState({
        usersList: nextProps.attendees,
        originUserListNum: nextProps.attendees.length
      });
    }
  }

  closeAllModal = () => {
    this.setState({
      usersList: this.props.attendees
    });
    const { closeAddDlg } = this.props;
    if (closeAddDlg) {
      closeAddDlg();
    }
  };

  closePop = () => {
    const { closePop } = this.props;
    if (closePop) {
      closePop();
    }
  };

  closeCycle = () => {
    this.setState({
      showCycle: false
    });
  };

  closeAttendeeModal = () => {
    this.setState({
      isShowAttendeeModal: false
    });
  };

  showAttendeeModal = (type) => {
    this.closeCycle();
    this.setState({ type }, () => {
      this.handleIsShowAttendeeModal();
    });
  };

  handleIsShowAttendeeModal = () => {
    const { type } = this.state;
    const { formData } = this.props;
    let isShowAttendeeModal = true;
    if (formData) {
      if (
        formData.recurrencePattern
        && formData.recurrencePattern.type !== ERecurrenceType.NONE
        && type === EEffectiveRangeType.CYCLE
      ) {
        // 循环日程 且 生效范围是 所有日程, 循环截止时间为过去时间(包含今天-日期)
        formData.deadline <= new Date().getTime()
          && (isShowAttendeeModal = false);
      } else {
        // 循环日程 , 生效范围是 此日程 | 非循环日程
        // 变更为过去时间(不包含今天-精确到毫秒)
        dayjs(formData.endTime).valueOf() < dayjs().valueOf()
          && (isShowAttendeeModal = false);
      }
    }
    this.setState({ isShowAttendeeModal });
    !isShowAttendeeModal && this.handleAddAttendances();
  };

  handleAddAttendances = () => {
    const { isCyclic } = this.props;
    const { type } = this.state;
    if (!isCyclic || type === EEffectiveRangeType.SINGLE) {
      this.addAttendances();
    } else if (type === EEffectiveRangeType.CYCLE) {
      this.addCycleAttendances();
    }
  };

  handleInformAttendee = (informType) => {
    this.setState({ informType }, () => {
      this.handleAddAttendances();
    });
  };

  handlePushType = () => {
    const { informType } = this.state;
    if (informType === EInformType.PART || informType === EInformType.NONE) {
      return 1;
    }
    return 0;
  };

  userSelect = (items) => {
    this.setState({ usersList: items });
  };

  getInitStoredUsers = () => {
    try {
      const useStoreListBuffer: string = localStorage.getItem(storageKey);
      if (useStoreListBuffer) {
        return JSON.parse(useStoreListBuffer);
      }
      return [];
    } catch (e) {
      return [];
    }
  };

  saveStoredUsers = (): void => {
    const { usersList } = this.state;
    setStorageUsers(usersList);
  };

  addAttendances = async () => {
    const { scheduleId } = this.props;
    const { usersList } = this.state;
    if (usersList && usersList.length > 500) {
      messageStore.error(
        i18nClient.t(
          'person_select_dialog_participant_to_much',
          '参与人不能超过500'
        )
      );
    } else {
      const pushType = this.handlePushType();
      await addAttendances(scheduleId, {
        attendees: usersList.map(item => item.empId),
        pushType
      });
      this.saveStoredUsers();
      messageStore.success(
        i18nClient.t(
          'person_select_dialog_add_participant_successfully',
          '添加参会者成功'
        )
      );
      this.closePop();
    }
  };

  addCycleAttendances = async () => {
    const { scheduleId, recurrenceScheduleId } = this.props;
    const { usersList } = this.state;
    if (usersList && usersList.length > 500) {
      messageStore.error(
        i18nClient.t(
          'person_select_dialog_participant_to_much',
          '参与人不能超过500'
        )
      );
    } else {
      const pushType = this.handlePushType();
      await addCycleAttendances(scheduleId, recurrenceScheduleId, {
        attendees: usersList.map(item => item.empId),
        pushType
      });
      this.saveStoredUsers();
      messageStore.success(
        i18nClient.t(
          'person_select_dialog_add_participant_successfully',
          '添加参会者成功'
        )
      );
      this.closePop();
    }
  };

  handleAddPerson = () => {
    const { isCyclic, closePop } = this.props;
    const { usersList, originUserListNum } = this.state;
    if (!usersList) return;

    if (usersList.length === originUserListNum) {
      closePop && closePop();
      return;
    }

    this.setState({ isChangeAttendee: true });
    if (isCyclic) {
      this.setState({ showCycle: true });
    } else {
      this.handleIsShowAttendeeModal();
    }
  };

  render() {
    const { openDlg, attendees } = this.props;
    const {
      showCycle,
      usersList,
      isShowAttendeeModal,
      isChangeAttendee
    } = this.state;
    return (
      <div>
        {openDlg && (
          <Modal
            maskClosable={false}
            title={i18nClient.t(
              'person_select_dialog_add_participant',
              '添加参与者'
            )}
            onClose={this.closeAllModal}
          >
            <Modal.Body>
              <UserSelect
                onChange={this.userSelect}
                initValue={attendees}
                defaultValue={usersList}
                fromModal={true}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button
                style={{ marginRight: '20px' }}
                onClick={this.closeAllModal}
              >
                {i18nClient.t('person_select_dialog_cancel', '取消')}
              </Button>
              <Button type="primary" onClick={this.throttleHandleAddPerson}>
                {i18nClient.t('person_select_dialog_confirm', '确定')}
              </Button>
            </Modal.Footer>
          </Modal>
        )}
        <CycleModal
          openDlg={showCycle}
          closeCycleDlg={this.closeCycle}
          closePop={this.closePop}
          cycleType="Add"
          singleCallBack={() => {
            this.showAttendeeModal(EEffectiveRangeType.SINGLE);
          }}
          cycleCallBack={() => {
            this.showAttendeeModal(EEffectiveRangeType.CYCLE);
          }}
        />
        <AttendeeModal
          openDlg={isShowAttendeeModal}
          isChangeAttendee={isChangeAttendee}
          closePop={this.closePop}
          closeAttendeeModal={this.closeAttendeeModal}
          informAttendeeCallBack={this.throttleHandleInformAttendee}
          justAddAttendees
        />
      </div>
    );
  }
}
