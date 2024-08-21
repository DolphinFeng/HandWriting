import { i18nClient } from '@sailor/i18n-web';
import React from 'react';
import { Button, Tooltip } from '@ss/mtd-react';
import { inject, observer } from 'mobx-react';
import { addModuleClick } from '@/services/lxService';
import { EApplicationsType, EFeedbackType } from '@/consts/type';

import { EPageType } from '@/consts';
import share from '@/utils/share';
import DetailStore from '@/pages/newWeekly/store/detail';

import dx from '@/utils/dxCalendar';

import styles from './index.less';
import { getEnname } from '@/utils';

interface IDetailHeader {
  ownerName: string;
  detail?: DetailStore;
  global?: any;
  closePop?: () => void;
  minAppendHeight?: number;
  pageType?: EPageType;
}
interface IBgColorAndName {
  name: string;
  colors: string[];
  isBlackTheme?: boolean;
}

@inject('detail', 'global')
@observer
export default class DetailHeader extends React.Component<IDetailHeader> {
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
      colors: ['#2A8EFE', '#0A70F5'],
      isBlackTheme: false
    };
    switch (appKey) {
      case EApplicationsType.Exchange:
        result = {
          name: '邮箱',
          colors: ['#2A8EFE', '#0A70F5']
          // colors: ['#30BBFF', '#0FA4FA']
        };
        break;
      // 会议和日程合并
      // case EApplicationsType.Meeting:
      //   result = {
      //     name: '会议',
      //     colors: ['#2A8EFE', '#0A70F5']
      //     // colors: ['#21D3C9', '#00B8B1']
      //   };
      //   break;
      case EApplicationsType.IPU:
        result = {
          name: '互联网+大学',
          colors: ['#2A8EFE', '#0A70F5']
          // colors: ['#FFD420', '#FFC300']
          // isBlackTheme: true
        };
        break;
      case EApplicationsType.Promotionapi:
        result = {
          name: '晋升系统',
          colors: ['#2A8EFE', '#0A70F5']
          // colors: ['#1CCE72', '#00B365']
        };
        break;
      case EApplicationsType.ZhaoPin:
        result = {
          name: '招聘',
          colors: ['#2A8EFE', '#0A70F5']
          // colors: ['#1CCE72', '#00B365']
        };
        break;
      case EApplicationsType.Schedule:
      case EApplicationsType.Meeting:
        result.name = i18nClient.t('detail_top_name_schedule', '{name}的日程', {
          name: ownerName || (name + getEnname(enName))
        });
        break;
      default:
        break;
    }
    return result;
  };

  nShowShare = (): boolean => {
    const {
      detail: { feedback }
    } = this.props;
    if (feedback !== EFeedbackType.Refuse) {
      // 判断目前用户是否拒绝日程
      return true;
    }
    return false;
  };

  // 第三方日程顶部不显示查看日程按钮
  nShowCalendar = (key: string): boolean => {
    // '邮箱','晋升系统','招聘' '邮箱'去除
    const outSchedule = [
      EApplicationsType.Promotionapi,
      EApplicationsType.ZhaoPin
    ];
    return outSchedule.every((item) => {
      return item !== key;
    });
  };

  // 编辑
  edit = (isExchange) => {
    const {
      detail: {
        targetUrl,
      }
    } = this.props;

    // 点击跳转邮箱系统
    if (isExchange) {
      addModuleClick('b_oa_aj7x6c54_mc');
      window.open(targetUrl);
    }
  };

  // 分享
  shareClick = () => {
    const {
      detail: {
        scheduleId, appKey, organizer
      },
      global: { currentUser }
    } = this.props;
    // 如果是邮箱日程使用empId，如果是普通日程使用organizer.empId
    const oEmpId = organizer ? organizer.empId : null;
    const organizerEmpId = appKey === EApplicationsType.Exchange ? currentUser?.empId : oEmpId;
    share
      && share.dxShareToOther({
        scheduleId,
        appKey,
        organizerEmpId
      });
    // 详情卡片-点击分享按钮
    addModuleClick('b_oa_mb2hgvaf_mc');
  };

  closePop = () => {
    const { closePop } = this.props;
    if (closePop) {
      closePop();
    }
  };

  // 跳转日程
  enterCalendar(type) {
    const {
      detail: {
        scheduleId, empId, startTime, applicationId
      },
      global: { currentUser }
    } = this.props;
    const params = {
      id: scheduleId,
      empId: empId || currentUser.empId,
      type,
      startTime
    };
    if (type === 'edit') {
      addModuleClick('b_oa_8gz3z06y_mc');
      dx.openSchedule({ ...params, appid: applicationId });
    } else {
      addModuleClick('b_oa_lvz4jts8_mc');
      dx.openSchedule(params);
    }
  }

  render() {
    // const themeType: IBgColorAndName = this.getTypeName();
    const {
      detail: { canEdit, canShare, appKey },
    } = this.props;

    // 拒绝日程后 不显示分享按钮
    // 来自第三方的日程 不显示日程按钮
    const canCalendar = this.nShowCalendar(appKey);

    const isEmailCalendar = appKey === EApplicationsType.Exchange;
    return (
      <>
        <div className={styles.container}>
          <div className={styles.topLeft}>
            <div className={styles.leftName}>
              <span>
                {i18nClient.t('detail_top_schedule_detail', '日程详情')}
              </span>
            </div>
            <div className={styles.leftIcon}>
              {!!canEdit && (
                <Tooltip placement={'bottom'} delayHide={0} message={i18nClient.t('detail_top_edit_schedule', '编辑日程')}>
                  <Button
                    icon="edit-o"
                    onClick={() => this.enterCalendar('edit')}
                    shape="circle"
                    hoverShape
                  />
                </Tooltip>
              )}
              {((!!canShare || isEmailCalendar) && this.nShowShare()) && (
                <Tooltip placement={'bottom'} delayHide={0} message={i18nClient.t(
                  'detail_top_share_schedule',
                  '分享日程'
                )}>
                  <Button
                    icon="share-o"
                    onClick={this.shareClick}
                    shape="circle"
                    hoverShape
                  />
                </Tooltip>
              )}
              {canCalendar && (
                <Tooltip
                  placement={'bottom'}
                  delayHide={0}
                  message={i18nClient.t(
                    'detail_top_see_in_schedule',
                    '在日程中查看'
                  )}
                >
                  <Button
                    icon="calendar-o"
                    onClick={() => this.enterCalendar('detail')}
                    shape="circle"
                    hoverShape
                  />
                </Tooltip>
              )}
              {/* {themeType.name === '邮箱' && (
                <Tooltip placement={'bottom'} delayHide={0} message="邮箱系统">
                  <Button
                    icon="close"
                    // 跳转到邮箱系统
                    onClick={() => {
                      this.edit(true);
                    }}
                    shape="circle"
                    size="small"
                    hoverShape
                  />
                </Tooltip>
              )} */}
            </div>
          </div>
          <div style={{ paddingLeft: '4px' }}>
            <Tooltip
              placement={'bottom'}
              delayHide={0}
              message={i18nClient.t('detail_top_cancel', '取消')}
            >
              <Button
                icon="close"
                onClick={dx.close}
                shape="circle"
                hoverShape
                style={{ marginLeft: '0px' }}
              />
            </Tooltip>
          </div>
        </div>
      </>
    );
  }
}
