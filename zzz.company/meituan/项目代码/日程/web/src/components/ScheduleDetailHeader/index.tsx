import { i18nClient } from '@sailor/i18n-web';
import React from 'react';
import { inject, observer } from 'mobx-react';
import dayjs from 'dayjs';
import { Button, Tooltip } from '@ss/mtd-react';
import DetailStore from '@/pages/newWeekly/store/detail';
import { weekArray } from '@/consts/weekly';
import dxJSSDK from '@/utils/dxJSSDK';
import { isRightSideDaxiang } from '@/utils';
import { addModuleClick } from '@/services/lxService';
import { JoinUmeetBtn } from './JoinUmeetBtn';
import { CheckSurveyBtn } from './CheckSurveyBtn';
import { YearMonthDay1, MonthDay1 } from '@/utils/i18n';
import cls from 'classnames';
import styles from './index.less';

interface IScheduleDetailHeader {
  detail?: DetailStore;
  themeType: IBgColorAndName;
  color: string;
  theme?: string;
  isPublicCalendar: boolean;
  closePop?: () => void;
}
interface IBgColorAndName {
  name: string;
  colors: string[];
  isBlackTheme?: boolean;
}
@inject('detail')
@observer
export default class ScheduleDetailHeader extends React.Component<
IScheduleDetailHeader,
IBgColorAndName
> {
  renderDate = (): JSX.Element => {
    const { startTime, endTime, isAllDay } = this.props.detail;
    const startTimeObj = dayjs(startTime);

    const endTimeObj = dayjs(isAllDay === 1 ? endTime - 3600 * 1000 : endTime);

    let startDate = startTimeObj.format(MonthDay1);
    const startWeek = startTimeObj.day();
    const startHour = startTimeObj.format('HH:mm');

    let endDate = endTimeObj.format(MonthDay1);
    const endHour = endTimeObj.format('HH:mm');
    const endWeek = endTimeObj.day();

    // 开始时间或结束时间不为今年，显示年
    if (
      !dayjs().isSame(startTime, 'year')
      || !dayjs().isSame(endTime, 'year')
    ) {
      startDate = startTimeObj.format(YearMonthDay1);
      endDate = endTimeObj.format(YearMonthDay1);
    }

    if (startDate === endDate) {
      // 当天日程
      return (
        <>
          <p className={styles.meetingTime}>
            {startDate} {weekArray[startWeek === 0 ? 6 : startWeek - 1]}{' '}
            {isAllDay === 1
              ? i18nClient.t('schedule_detail_header_all_day', '全天')
              : `${startHour} - ${endHour}`}
          </p>
          <div className={styles.distance} />
        </>
      );
    }
    // 跨天或跨年日程
    return (
      <>
        <p className={styles.meetingTime} style={{ marginTop: '4px' }}>
          {i18nClient.t('schedule_detail_header_start_date', '开始')}：
          {startDate} {weekArray[startWeek === 0 ? 6 : startWeek - 1]}{' '}
          {isAllDay === 1 ? '' : startHour}
        </p>
        <p className={styles.meetingTime}>
          {i18nClient.t('schedule_detail_header_end_date', '结束')}：{endDate}{' '}
          {weekArray[endWeek === 0 ? 6 : endWeek - 1]}{' '}
          {isAllDay === 1 ? '' : endHour}
        </p>
      </>
    );
  };

  // 跳转到群组界面
  groupClick = (id, type) => {
    dxJSSDK.openComment(id, type);
    // 行事历页面进入群组
    if (isRightSideDaxiang) {
      addModuleClick('b_oa_xqjw8wj7_mc');
    } else {
      addModuleClick('b_oa_tzjkk68b_mc');
    }
  };

  render() {
    const {
      themeType,
      detail: {
        title,
        chatInfo,
        role,
        scheduleId,
        videoMeetingInfoVo,
        canSurvey
      },
      color,
      theme,
      isPublicCalendar,
      closePop
    } = this.props;
    const marginTop = `${theme}Margin`;
    return (
      <>
        {themeType.name === '招聘' && (
          <div className={styles.employ}>
            {i18nClient.t(
              'schedule_detail_header_calendar_from_hire',
              '此日程来自招聘，编辑、删除等请前往'
            )}
            <span
              className={styles.txt}
            // onClick={() => {
            //   this.edit(true);
            // }}
            >
              {'招聘系统'} {'>'}
            </span>
          </div>
        )}
        <div
          className={`${styles.container} ${styles[color]} ${styles[theme]}`}
        >
          {i18nClient.language === 'en' ? (<div style={{ lineHeight: '28px' }}>
            <div className={cls(styles.title, styles.longTitle)}>{title}</div>
            {theme === 'theme' && (
              <div className={cls(styles.leftNameEn, styles.longTitle)}>{themeType.name} </div>
            )}
          </div>) : (<div style={{ lineHeight: '28px' }}>
            <span className={styles.title}>{title}</span>
            {theme === 'theme' && (
              <span className={styles.leftName}>{themeType.name}</span>
            )}
          </div>)}

          {this.renderDate()}
          {!isPublicCalendar && (
            <>
              {chatInfo && chatInfo.chatType === 'groupchat' && (
                <Tooltip
                  placement={'top'}
                  delayHide={0}
                  message={i18nClient.t(
                    'schedule_detail_header_access_to_groups',
                    '进入群组'
                  )}
                >
                  <Button
                    className={`${styles.group} ${styles[marginTop]}`}
                    onClick={() => {
                      this.groupClick(chatInfo.chatId, chatInfo.chatType);
                    }}
                    key={'calhuihua'}
                    shape="circle"
                    size="small"
                    hoverShape
                  >
                    <i className="dxcalendar dx-calhuihua" />
                  </Button>
                </Tooltip>
              )}
              <JoinUmeetBtn
                marginTop={marginTop}
                role={role}
                scheduleId={scheduleId}
                videoMeetiongInfoVo={videoMeetingInfoVo}
                isMail={themeType.name === '邮箱'}
                closePop={closePop}
                canSurvey={canSurvey}
              />
              <CheckSurveyBtn
                marginTop={marginTop}
                role={role}
                isMail={themeType.name === '邮箱'}
                scheduleId={scheduleId}
                canSurvey={canSurvey}
              />
            </>
          )}
        </div>
      </>
    );
  }
}
