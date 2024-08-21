// 发起/加入 Umeet
import React, { useState, useEffect } from 'react';
import {
  Tooltip, Button, Modal, Badge
} from '@ss/mtd-react';
import { ERoleType, IVideoMeetingInfoVo } from '@/consts';
import { StorageService } from '@/services/storage';
import { IRoleType } from '@/pages/newWeekly/store/detail';
import { i18nClient } from '@sailor/i18n-web';
import { createVideoMeeting, EUmeetDuration } from '@/services/thirdParts';
import messageStore from '@/utils/messageStore';
import {
  copyTextToClipboard,
  formatMeetingId,
  isRightSideDaxiang
} from '@/utils';
import { addModuleClick } from '@/services/lxService';
import styles from '../index.less';
import classNames from 'classnames';

interface IJoinUmeetBtn {
  marginTop: string;
  role: IRoleType;
  scheduleId: string;
  // eslint-disable-next-line react/require-default-props
  videoMeetiongInfoVo?: IVideoMeetingInfoVo;
  isMail: boolean;
  canSurvey?: 0 | 1;
  closePop?: () => void;
}

const JOINMEETINGKEY = 'hasJoined';

export const JoinUmeetBtn = (props: IJoinUmeetBtn) => {
  const {
    marginTop,
    role,
    videoMeetiongInfoVo,
    scheduleId,
    isMail,
    canSurvey,
    closePop
  } = props;

  const isAttendee = role?.roleType === ERoleType.ATTENDEE;
  const isOrganizer = role?.roleType === ERoleType.ORGANIZER;
  const [fstUse, setFstUse] = useState(!StorageService.getItem(JOINMEETINGKEY));
  const [videoMeetiongInfoCurInfo, setVideoMeetiongInfoCurInfo] = useState({
    ...(videoMeetiongInfoVo || {}),
    startUrl: isOrganizer
      ? videoMeetiongInfoVo?.startUrl
      : videoMeetiongInfoVo?.joinUrl
  });

  useEffect(() => {
    setVideoMeetiongInfoCurInfo({
      ...(videoMeetiongInfoVo || {}),
      startUrl: isOrganizer
        ? videoMeetiongInfoVo?.startUrl
        : videoMeetiongInfoVo?.joinUrl
    });
  }, [props.videoMeetiongInfoVo]);

  const recordFstUse = () => {
    StorageService.setItem(JOINMEETINGKEY, true);
    setFstUse(false);
  };

  const startAndCopy = async (
    startUrl: string,
    joinUrl: string,
    meetingId: string
  ) => {
    const copyBuff = i18nClient.t(
      'join_umeet_btn_id_link',
      '会议ID：{formatMeetingId}\n会议链接：{joinUrl}',
      { formatMeetingId: formatMeetingId(meetingId), joinUrl }
    );
    await copyTextToClipboard(copyBuff);
    window.open(startUrl);
    messageStore.success(
      i18nClient.t(
        'join_umeet_btn_information_copied_successfully',
        '会议信息已成功复制到剪切板'
      )
    );
    closePop && closePop();
  };

  const remind = (
    status: number,
    startUrl: string,
    joinUrl: string,
    meetingId: string
  ) => {
    switch (status) {
      case 0:
        setVideoMeetiongInfoCurInfo({
          startUrl,
          joinUrl,
          meetingId
        });
        startAndCopy(startUrl, joinUrl, meetingId);
        break;
      case 3:
        Modal.info({
          title: i18nClient.t(
            'join_umeet_btn_ongoing_meeting_exceed',
            '当前正在进行的会议过多，请前往Umeet发起限时40分钟会议。'
          ),
          okBtnProps: { type: 'primary' },
          okText: i18nClient.t('join_umeet_btn_i_know', '我知道了')
        });
        break;
      case 4:
        messageStore.error(
          i18nClient.t('join_umeet_btn_initiated_too_often', '发起过于频繁')
        );
        break;
      case 8:
        messageStore.error(
          i18nClient.t('join_umeet_btn_not_log_in', 'SSO账号没登录')
        );
        break;
      default:
        messageStore.error(
          i18nClient.t('join_umeet_btn_unknown_error', '未知异常')
        );
        break;
    }
  };

  const videoMeetingCreate = async () => {
    const res = await createVideoMeeting({
      scheduleId,
      meetingDuration: EUmeetDuration.UNLIMITED
    });
    const {
      status, joinUrl, meetingId, startUrl
    } = res || {};
    remind(status, startUrl, joinUrl, meetingId);
  };

  const startMeeting = () => {
    Modal.warning({
      title: i18nClient.t(
        'join_umeet_btn_sure_initiate_meeting',
        '确定发起会议吗？'
      ),
      message: (
        <div>
          <div>
            {i18nClient.t(
              'join_umeet_btn_participant_will_receive_link',
              '发起后，日程参与者将收到公众号“大象日程”发送的视频会议链接'
            )}
          </div>
        </div>
      ),
      okText: i18nClient.t('join_umeet_btn_launch', '发起'),
      cancelText: i18nClient.t('join_umeet_btn_cancel', '取消'),
      okBtnProps: { type: 'primary' },
      onOk: () => videoMeetingCreate()
    });
  };

  const openUmeet = async () => {
    recordFstUse();
    switch (true) {
      case !!videoMeetiongInfoCurInfo?.joinUrl:
        // 已发起
        startAndCopy(
          videoMeetiongInfoCurInfo?.startUrl,
          videoMeetiongInfoCurInfo?.joinUrl,
          videoMeetiongInfoCurInfo?.meetingId
        );
        break;
      case isOrganizer:
        // 未发起的组织者 --- 发起
        startMeeting();
        break;
      case isAttendee:
        // 未发起的参与者 --- 报错提示
        messageStore.error(
          i18nClient.t(
            'join_umeet_btn_please_wait',
            '请等待组会者发起后，再点击加入'
          )
        );
        break;
      default:
        break;
    }
    addModuleClick(
      isRightSideDaxiang ? 'b_oa_hblma305_mc' : 'b_oa_hhtxnqxq_mc'
    );
  };

  const getMessage = (): string | React.ReactNode => {
    let message: string | React.ReactNode = '';
    switch (true) {
      case !!videoMeetiongInfoCurInfo?.joinUrl:
        // 已发起
        message = (
          <div>
            <p>{i18nClient.t('join_umeet_btn_attend_meeting', '加入会议')}</p>
            <p>
              {i18nClient.t('join_umeet_btn_id', '会议ID：{formatMeetingId}', {
                formatMeetingId: formatMeetingId(
                  videoMeetiongInfoCurInfo.meetingId
                )
              })}
            </p>
            <p>
              {i18nClient.t('join_umeet_btn_link', '会议链接：{joinUrl}', {
                joinUrl: videoMeetiongInfoCurInfo.joinUrl
              })}
            </p>
          </div>
        );
        break;
      case isOrganizer:
        // 未发起的组织者
        message = i18nClient.t('join_umeet_btn_launch_meeting', '发起会议');
        break;
      case isAttendee:
        // 未发起的参与者
        message = i18nClient.t('join_umeet_btn_attend_meeting', '加入会议');
        break;
      default:
        break;
    }
    return message;
  };

  const renderButton = () => {
    const message = getMessage();
    const placement = !!videoMeetiongInfoCurInfo?.joinUrl && !isRightSideDaxiang
      ? 'topLeft'
      : 'top';
    return (
      <Tooltip
        placement={placement}
        delayHide={0}
        message={message}
        className={styles.inToolTip}
      >
        <Button
          className={`${styles.group} ${styles[marginTop]}`}
          onClick={openUmeet}
          shape="circle"
          size="small"
          key="calshipin"
          hoverShape
        >
          <i className="dxcalendar dx-calshipin" />
        </Button>
      </Tooltip>
    );
  };

  if (!canSurvey) return null;

  if (isMail) return null;

  if (fstUse || !!videoMeetiongInfoCurInfo?.joinUrl) {
    const badgeMessge = fstUse ? (
      <span className={classNames(styles.newBadgeIcon, styles[`newBadgeIconBac-${i18nClient.language}`])} />
    ) : (
      <span
        className={classNames(
          styles.ingBadgeIcon,
          styles[`inBadgeIconBac-${i18nClient.language}`]
        )}
      />
    );
    const badgeStyle = fstUse ? styles.newBadge : styles.ingBadge;
    return (
      <Badge value={badgeMessge} className={badgeStyle}>
        {renderButton()}
      </Badge>
    );
  }
  return renderButton();
};
