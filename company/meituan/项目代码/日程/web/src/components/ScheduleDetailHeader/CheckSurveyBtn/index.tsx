// 问卷
import React, { useState } from 'react';
import { Tooltip, Button, Badge } from '@ss/mtd-react';
import { ERoleType } from '@/consts';
import { StorageService } from '@/services/storage';
import { IRoleType } from '@/pages/newWeekly/store/detail';
import { survey } from '@/services/thirdParts';
import { isRightSideDaxiang } from '@/utils';
import { addModuleClick } from '@/services/lxService';
import { WenjuanDlg } from '../WenjuanDlg';
import { i18nClient } from '@sailor/i18n-web';
import styles from '../index.less';
import classNames from 'classnames';


interface ICheckSurveyBtn {
  marginTop: string;
  role: IRoleType;
  scheduleId: string;
  isMail: boolean;
  canSurvey?: 0 | 1;
}

const CHECKSURVEYKEY = 'hasSurvey';

// 问卷
export const CheckSurveyBtn = (props: ICheckSurveyBtn) => {
  const {
    marginTop, role, scheduleId, isMail, canSurvey
  } = props;

  const [fstUse, setFstUse] = useState(!StorageService.getItem(CHECKSURVEYKEY));
  const isAttendee = role?.roleType === ERoleType.ATTENDEE;
  const isOrganizer = role?.roleType === ERoleType.ORGANIZER;

  const [reminderDlgOpen, setReminderDlgOpen] = useState(false);

  const recordFstUse = () => {
    StorageService.setItem(CHECKSURVEYKEY, true);
    setFstUse(false);
  };

  const jumpSurvey = async () => {
    const res = await survey(scheduleId);
    setReminderDlgOpen(false);
    res?.surveyUrl && window.open(res.surveyUrl);
    recordFstUse();
  };

  const closeDlg = () => {
    setReminderDlgOpen(false);
    recordFstUse();
  };

  const openSurvey = async () => {
    if (fstUse && !isRightSideDaxiang) {
      // 第一次不在侧边详情页打开，出现引导
      setReminderDlgOpen(true);
    } else {
      jumpSurvey();
    }
    addModuleClick(
      isRightSideDaxiang ? 'b_oa_vnzo4ti5_mc' : 'b_oa_q12a7g9j_mc'
    );
  };

  const getMessage = (): string | React.ReactNode => {
    let message: string | React.ReactNode = '';
    switch (true) {
      case isOrganizer:
        message = i18nClient.t('check_survey_btn_see_feedback', '查看反馈');
        break;
      case isAttendee:
        message = i18nClient.t('check_survey_btn_write_feedback', '填写反馈');
        break;
      default:
        break;
    }
    return message;
  };

  const renderFstReminder = () => (
    <WenjuanDlg
      isOrg={isOrganizer}
      closeDlg={closeDlg}
      jumpSurvey={jumpSurvey}
    />
  );

  const renderButton = () => (
    <Tooltip placement={'top'} delayHide={0} message={getMessage()}>
      <Button
        className={`${styles.group} ${styles[marginTop]}`}
        onClick={openSurvey}
        shape="circle"
        size="small"
        key={'calhuiyifankui'}
        hoverShape
      >
        <i className="dxcalendar dx-calhuiyifankui" />
      </Button>
    </Tooltip>
  );

  const renderComp = () => (
    <>
      {renderButton()}
      {reminderDlgOpen && renderFstReminder()}
    </>
  );

  const newIcon = <span className={classNames(styles.newBadgeIcon, styles[`newBadgeIconBac-${i18nClient.language}`])} />;

  if (!canSurvey) return null;

  if (isMail) return null;

  if (fstUse) {
    return (
      <Badge value={newIcon} className={styles.newBadge}>
        {renderComp()}
      </Badge>
    );
  }
  return renderButton();
};
