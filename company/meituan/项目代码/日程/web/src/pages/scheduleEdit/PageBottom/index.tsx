import { i18nClient } from '@sailor/i18n-web';
/*
 * @Description: 文件描述
 * @Author: zhouwenting02 <zhouwenting02@meituan.com>
 * @Date: 2021-05-12 15:04:15
 * @LastEditors: zhouwenting02
 * @LastEditTime: 2021-05-12 15:04:15
 * @FilePath: /scheduleweb/src/pages/scheduleEdit/PageBottom/index.tsx
 */
import React from 'react';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import dayjs from 'dayjs';
import { getEnname, MAX_CONFLICT_NO } from '@/utils';
import { Button } from '@ss/mtd-react';
import { week } from '@/components/DateTimePicker/const';
import { addModuleClick } from '@/services/lxService';
import { MonthDayBlank } from '@/utils/i18n';
import styles from './index.less';

interface IPageBottom {
  scheduleConflictPanelStore?: any;
  isInMeetingNoJump?: boolean;
  handleJumpCreate?: any;
}

@inject(({ scheduleEditStore }) => ({
  scheduleConflictPanelStore: scheduleEditStore.scheduleConflictPanelStore
}))
@observer
export default class PageBottom extends React.Component<IPageBottom> {
  handleConflictUsersName = () => {
    const {
      scheduleConflictPanelStore: { useConflictList }
    } = this.props;
    return useConflictList
      .filter(item => item.isConflict)
      .map(item => `${item.name}${getEnname(item.enName)}`); // 英文名替换
  };

  render() {
    const {
      handleJumpCreate,
      scheduleConflictPanelStore: {
        conflictCount,
        originStartTime,
        originEndTime,
        attendees,
        noCheckConflit
      }
    } = this.props;
    const isMaxPerson = attendees && attendees.length > MAX_CONFLICT_NO;
    const conflictUserListName = this.handleConflictUsersName();
    const nameList = conflictUserListName.slice(0, 2);
    return (
      <>
        <div
          className={classNames(styles.groupBottom)}
          style={{
            boxShadow: 'none'
          }}
        >
          <div className={classNames(styles.conflict)}>
            {/* 中文环境：12月25日周一 15:15-16:15 */}
            {!noCheckConflit && i18nClient.language !== 'en' && (
              <div className={classNames(styles.date)}>
                {dayjs(originStartTime).format(MonthDayBlank)}
                {week[dayjs(originStartTime).get('day')]}
                {dayjs(originStartTime).format(' HH:mm-')}
                {dayjs(originEndTime).format('HHmm') === '0000'
                  ? '24:00'
                  : dayjs(originEndTime).format('HH:mm')}
              </div>
            )}

            {/* 英文环境： Mon 12-25 15:15-16:15  */}
            {!noCheckConflit && i18nClient.language === 'en' && (
              <div className={classNames(styles.date)}>
                {week[dayjs(originStartTime).get('day')]}
                {' '}
                {dayjs(originStartTime).format(MonthDayBlank)}
                {dayjs(originStartTime).format(' HH:mm-')}
                {dayjs(originEndTime).format('HHmm') === '0000'
                  ? '24:00'
                  : dayjs(originEndTime).format('HH:mm')}
              </div>
            )}


            {!!conflictCount && !isMaxPerson && !noCheckConflit && (
              <div className={classNames(styles.names)}>
                {nameList.map((name, index) => (<>
                  <span className={styles.conflictname}>{name}</span>
                  <span className={styles.conflicttip}>{index + 1 === nameList.length ? '' : '、'}</span>
                </>))}
                <span className={styles.conflicttip}>{conflictCount <= 2
                  && i18nClient.t('page_bottom_conflict', '日程冲突')}
                  {conflictCount > 2
                    && i18nClient.t(
                      'page_bottom_conflict_count',
                      '等{conflictCount}人日程冲突',
                      { conflictCount }
                    )}</span>
              </div>
            )}
          </div>
          <Button
            type="primary"
            className={classNames(
              styles.btn,
              !conflictCount && noCheckConflit ? styles.single : null
            )}
            onClick={() => {
              handleJumpCreate && handleJumpCreate();
              addModuleClick('b_oa_1l1tfmdu_mc');
            }}
          >
            {i18nClient.t('page_bottom_create_schedule', '创建日程')}
          </Button>
        </div>
      </>
    );
  }
}
