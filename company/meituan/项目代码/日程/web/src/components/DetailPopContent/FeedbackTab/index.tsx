import { i18nClient } from '@sailor/i18n-web';
import React from 'react';
import { moduleClick } from 'onejs/lx';
import classNames from 'classnames';
import { AttendeeItem } from '@/components';
import { EFeedbackType, IPersonInfo, IFeedbackCount } from '@/consts/type';
import { Icon } from '@ss/mtd-react';
import { MAX_CONFLICT_NO } from '@/utils';
import styles from './index.less';

export interface IFeedbackTabProps {
  attendees?: IPersonInfo[];
  conflictPersons: string[];
  feedbackCountList?: IFeedbackCount[];
  onChange?: () => void;
  mis?: string;
  scheduleId?: string;
}

interface IFeedbackTabState {
  currentFeedbackType: EFeedbackType;
  isShowAll: boolean;
}

// 最多可全部显示的数目
const SHOWNUMBERS = 8;

export class FeedbackTab extends React.Component<
IFeedbackTabProps,
IFeedbackTabState
> {
  constructor(props) {
    super(props);
    this.state = {
      currentFeedbackType: EFeedbackType.All,
      isShowAll: false
    };
  }

  toggleFbType = (type: EFeedbackType) => {
    this.setState(
      {
        currentFeedbackType: type
      },
      () => {
        this.onChange();
      }
    );
    let moduleName = '';
    switch (type) {
      // case EFeedbackType.Accept:
      //   moduleName = 'b_oa_b2bc5xr7_mc'; // 切换查看接受
      //   break;
      case EFeedbackType.Refuse:
        moduleName = 'b_oa_802vncj7_mc'; // 切换查看拒绝
        break;
      // case EFeedbackType.Tentative:
      //   moduleName = 'b_oa_ymocg3pk_mc'; // 切换查看暂定
      //   break;
      case EFeedbackType.Conflict:
        moduleName = 'b_oa_6qzwcfa1_mc'; // 切换查看冲突
        break;
      case EFeedbackType.All:
        moduleName = 'b_oa_ma606396_mc'; // 切换查看所有
        break;
      default:
        break;
    }
    const { mis, scheduleId } = this.props;
    moduleName
      && moduleClick(moduleName, {
        userMis: mis,
        scheduleId
      });
  };

  getTabCount(itemType?: EFeedbackType): string {
    const { feedbackCountList, attendees, conflictPersons } = this.props;

    if (!feedbackCountList) {
      return ' 0';
    }
    if (itemType === EFeedbackType.Conflict) {
      return ` ${conflictPersons.length}`;
    }
    if (itemType === EFeedbackType.All) {
      return ` ${attendees.length}`;
    }
    // + 1是组织者放到全部和接受里面
    const itemSelect = feedbackCountList.find(
      item => item.feedbackType === itemType
    );
    if (itemSelect && itemSelect.count) {
      return ` ${
        itemSelect.count + (itemType === EFeedbackType.Accept ? 1 : 0)
      }`;
    }
    return ` ${itemType === EFeedbackType.Accept ? 1 : 0}`;
  }

  getTabName = (itemType: EFeedbackType): string => {
    switch (itemType) {
      case EFeedbackType.Refuse:
        return i18nClient.t('feedback_tab_refuse', '拒绝{refuse}', {
          refuse: this.getTabCount(EFeedbackType.Refuse)
        });
      case EFeedbackType.Conflict:
        return i18nClient.t('feedback_tab_conflict', '冲突{conflict}', {
          conflict: this.getTabCount(EFeedbackType.Conflict)
        });
      default:
        return i18nClient.t('feedback_tab_all', '全部{all}', {
          all: this.getTabCount(EFeedbackType.All)
        });
    }
  };

  getTabItem(itemType: EFeedbackType): JSX.Element {
    return (
      <span
        className={classNames(styles.tabLabelItem, {
          [styles.active]: this.state.currentFeedbackType === itemType
        })}
        onClick={(): void => {
          this.toggleFbType(itemType);
        }}
      >
        {this.getTabName(itemType)}
      </span>
    );
  }

  getTabHearder = (): JSX.Element => {
    const { attendees } = this.props;
    return (
      <div className={styles.tabHearder}>
        {this.getTabItem(EFeedbackType.All)}
        {this.getTabItem(EFeedbackType.Refuse)}
        {attendees.length <= MAX_CONFLICT_NO
          && this.getTabItem(EFeedbackType.Conflict)}
      </div>
    );
  };

  attendeesRender = (list: IPersonInfo[], allLength: number) => {
    const { isShowAll, currentFeedbackType } = this.state;
    const { conflictPersons } = this.props;
    return (
      <>
        {list.map((item) => {
          return (
            <AttendeeItem
              nTabsItems
              isOrganizer={currentFeedbackType !== EFeedbackType.All}
              isConflict={conflictPersons && conflictPersons.includes(item.mis)}
              key={item.empId}
              {...item}
            />
          );
        })}
        {!isShowAll && allLength > SHOWNUMBERS && (
          <div onClick={this.showAllPersons} className={styles.openIconBtn}>
            <Icon type={'down-thick'} />
          </div>
        )}
      </>
    );
  };

  feedbackTypeContent(): JSX.Element {
    const { isShowAll, currentFeedbackType } = this.state;
    const { attendees, conflictPersons } = this.props;
    if (!attendees || attendees.length === 0) {
      return null;
    }
    const showAttendees = currentFeedbackType !== EFeedbackType.Conflict
      ? attendees.filter(
        item => currentFeedbackType === EFeedbackType.All
              || item.feedbackType === currentFeedbackType
      )
      : attendees.filter(item => conflictPersons.includes(item.mis));
    if (!showAttendees || (showAttendees && showAttendees.length === 0)) {
      return null;
    }

    const showingList = isShowAll || showAttendees.length <= SHOWNUMBERS
      ? showAttendees
      : showAttendees.slice(0, SHOWNUMBERS - 1);
    return <>{this.attendeesRender(showingList, showAttendees.length)}</>;
  }

  showAllPersons = (): void => {
    this.setState({ isShowAll: true });
    this.onChange();
  };

  onChange = () => {
    const { onChange } = this.props;
    if (onChange) {
      setTimeout(() => {
        onChange();
      }, 0);
    }
  };

  render(): JSX.Element {
    return (
      <div>
        {this.getTabHearder()}
        {this.feedbackTypeContent()}
        <div className={styles.distanceItem} />
      </div>
    );
  }
}
