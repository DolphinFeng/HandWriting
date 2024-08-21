import { i18nClient } from '@sailor/i18n-web';
import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { inject } from 'mobx-react';
import { observer } from 'mobx-react-lite';
import { Checkbox, Icon, Tooltip } from '@ss/mtd-react';
import { throttle } from 'lodash';
import styles from './index.less';
import { publicCalendarsCheck } from '@/services/apis';
import { addModuleClick } from '@/services/lxService';
import SettingDlg from './settingDialog';
import { createLink } from '@/services/monthly';
import { messageStore } from '@/store/global';
import { isPCDaxiang } from '@/utils/environment';
import { deployEnv } from '@onejs/utils';
// 定制需求 隐藏oneone
const ONE_ONE = 'com.sankuai.od.1on1';
const PageData = JSON.parse(window.__PageData__ || '{}');

// 创建日历灰度
const isInPublicCreateGray = deployEnv === 'development'
  ? true
  : PageData?.abTest?.schedulePublicCalendar?.enable || false;
// 复制链接灰度
const isInMonthlyGray = deployEnv === 'development'
  ? true
  : PageData?.abTest?.copyCalendarSetId?.enable || false;

/**
 * 日程来源
 */
const ScheduleSourcePanel = observer((props) => {
  const {
    stroes: {
      week: {
        initScheduleList,
        scheduleSourcePanelStore: {
          scheduleSourceList,
          publicCalendarList,
          changeSource,
          changePublicCalendar,
          changePublicCalendarHover,
          meetingId,
          scheduleId,
          getApplications
        }
      }
    }
  } = props;
  const [showSetting, setShowSetting] = useState(false);
  const [publicCalendarId, setPublicCalendarId] = useState(null);
  const handleChangeSource = useCallback(
    throttle(
      (id: number) => {
        changeSource(id);
        if (id === scheduleId) {
          changeSource(meetingId);
        }
        initScheduleList();
        addModuleClick('b_oa_8gky0f8u_mc', null);
      },
      500,
      { trailing: false }
    ),
    []
  );

  const handleChangePublicCalendar = useCallback(
    throttle(
      async (calendarId: number, checked: boolean) => {
        try {
          changePublicCalendar(calendarId, !checked);
          await publicCalendarsCheck({
            calendarId,
            checked: checked ? 0 : 1
          });
          initScheduleList();
          addModuleClick('b_oa_ml5j1d90_mc', {
            calendarId,
            checked: checked ? 0 : 1,
            device_type: isPCDaxiang ? 4 : 2
          });
        } catch (error) {
          changePublicCalendar(calendarId, checked);
        }
      },
      500,
      { trailing: false }
    ),
    []
  );

  const handleShowSetting = (id?: number) => {
    setPublicCalendarId(id);
    setShowSetting(true);
  };

  const handleCloseSetting = () => {
    setPublicCalendarId(null);
    setShowSetting(false);
    getApplications();
  };

  const getCurrentCalendar = () => {
    return (
      publicCalendarList.find(item => item.calendarId === publicCalendarId)
      || null
    );
  };
  const handleMouseEnter = (calendarId) => {
    changePublicCalendarHover(calendarId, true);
  };
  const handleMouseLeave = (calendarId) => {
    changePublicCalendarHover(calendarId, false);
  };

  const handleCopy = async (id) => {
    const calendarSetId = await createLink([id]);
    const { origin } = window.location;
    const link = `${origin}/monthly/${calendarSetId}`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        messageStore.success(
          i18nClient.t(
            'schedule_source_panel_copy_link_successfully',
            '复制链接成功'
          )
        );
      })
      .catch((err) => {
        console.error('无法复制文本: ', err);
      });
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.title}>
          {i18nClient.t('schedule_source_panel_source', '日程来源')}
        </div>
        <div className={styles.list}>
          {scheduleSourceList
            .filter(item => item.id !== meetingId)
            .map(item => (item.appKey === ONE_ONE ? null : (
                <div className={styles.box} key={item.id}>
                  <Checkbox
                    checked={item.checked}
                    onChange={() => {
                      handleChangeSource(item.id);
                    }}
                  >
                    {item.appName}
                  </Checkbox>
                </div>
            )))}
        </div>

        {publicCalendarList?.length > 0 && (
          <>
            <div className={styles.line}></div>
            <div className={styles.box}>
              <div className={styles.title}>
                {i18nClient.t('schedule_source_panel_subscribe', '订阅日历')}
              </div>
              {isInPublicCreateGray && (
                <Tooltip
                  message={i18nClient.t(
                    'schedule_source_panel_create_subscribe',
                    '创建订阅日历'
                  )}
                  size="small"
                  autoDestory
                >
                  <div
                    className={styles.add}
                    onClick={() => {
                      handleShowSetting();
                    }}
                  >
                    <Icon className={styles.addIcon} type="add"></Icon>
                    <span className={styles.addLabel}>
                      {i18nClient.t('schedule_source_panel_create', '创建')}
                    </span>
                  </div>
                </Tooltip>
              )}
            </div>
            <div className={styles.list}>
              {publicCalendarList.map(item => (
                <div
                  className={classNames(styles.box, styles.publicCalendarCheck)}
                  key={item.calendarId}
                  onMouseEnter={() => handleMouseEnter(item.calendarId)}
                  onMouseLeave={() => handleMouseLeave(item.calendarId)}
                >
                  <div
                    className={styles.calendarItem}
                    onClick={() => {
                      handleChangePublicCalendar(item.calendarId, item.checked);
                    }}
                  >
                    <div
                      className={styles.checkBox}
                      style={{
                        backgroundColor: item.checked
                          ? item.calendarColor
                          : 'white',
                        // eslint-disable-next-line no-nested-ternary
                        borderColor: item.checked
                          ? 'transparent'
                          : item.hovered
                            ? item.calendarColor
                            : 'rgba(0,0,0,0.12)'
                      }}
                    >
                      {<Icon className={styles.checkTick} type="check-thick" />}
                    </div>
                    <p className={styles.checkLabel}>{item.appName}</p>
                    {isInMonthlyGray && isPCDaxiang && (
                      <Tooltip
                        placement={'top'}
                        size="small"
                        autoDestory
                        message={i18nClient.t(
                          'schedule_source_panel_copy_link',
                          '复制日历链接'
                        )}
                        delayHide={0}
                      >
                        <i
                          className={classNames(
                            styles.icon,
                            'dxcalendar dx-callink2'
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(item.calendarId);
                          }}
                        ></i>
                      </Tooltip>
                    )}
                    <Icon
                      className={styles.icon}
                      type="setting"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowSetting(item.calendarId);
                      }}
                    ></Icon>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {showSetting && (
        <SettingDlg
          currentCalendar={getCurrentCalendar()}
          onClose={handleCloseSetting}
        />
      )}
    </>
  );
});

export default inject(stroes => ({
  stroes
}))(ScheduleSourcePanel);
