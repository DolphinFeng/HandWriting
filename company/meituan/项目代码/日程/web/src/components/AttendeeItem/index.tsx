/*
 * @Description: 参与人组件
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-06-03 10:35:41
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-12-10 17:50:00
 * @FilePath: /scheduleweb/src/components/AttendeeItem/index.tsx
 */

import React from 'react';
import classNames from 'classnames';
import { moduleView } from 'onejs/lx';
import { Icon, Popover } from '@ss/mtd-react';
import { IPersonInfo, EFeedbackType } from '@/consts/type';
import dxJSSDK from '@/utils/dxJSSDK';
import defaultImg from '@/asserts/images/default.png';
import { Placement } from '@ss/mtd-react/types/base';
import styles from './index.less';
import { i18nClient } from '@sailor/i18n-web';
import { getEnname } from '@/utils';


export interface IAttendeeItemProps extends IPersonInfo {
  isOrganizer?: boolean;
  isConflict?: boolean;
  isSpanType?: boolean;
  nTabsItems?: boolean;
  placement?: Placement;
}

export default function AttendeeItem(props: IAttendeeItemProps) {
  const {
    isConflict,
    name,
    enName,
    mis,
    avatar,
    xmUid,
    isOrganizer,
    feedbackType,
    isSpanType,
    nTabsItems
  } = props;
  const showAvatar = avatar || defaultImg;
  const personalInfo = (
    <div className={styles.dialogVCard}>
      <div>
        <img className={styles.icon} src={showAvatar} alt={i18nClient.t('attendeel_item_dialog_vcard_avatar', '头像')} />
      </div>
      <div>
        {name}{getEnname(enName)}({mis})
      </div>
      <div
        onClick={() => {
          dxJSSDK.openComment(xmUid);
        }}
        className={styles.dialogComment}
      >
        <Icon type="comment" />
      </div>
    </div>
  );
  const labelFontStyle: any = {
    fontSize: 14,
    color: 'rgba(0,0,0,0.36)',
    marginLeft: -2
  };
  return (
    <Popover
      autoDestory
      className={styles.personPop}
      style={{ padding: '0px 24px' }}
      content={personalInfo}
      trigger={'click'}
      placement={'top'}
    >
      <div
        onClick={() => {
          moduleView('b_oa_9n9ypo1t_mv');
        }}
        className={classNames(styles.personInfoItem, {
          [styles.noMarginBottom]: isOrganizer && !nTabsItems,
          [styles.noBorder]: isSpanType
        })}
      >
        {isSpanType && <span>{`${name}/${mis}`}</span>}
        {!isSpanType && (
          <>
            {!isOrganizer && (
              <>
                {feedbackType === EFeedbackType.Accept && (
                  <i
                    style={{ fontSize: 14, color: '#00B365', marginLeft: -2 }}
                    className="dxcalendar dx-calaccept"
                  />
                )}
                {feedbackType === EFeedbackType.Refuse && (
                  <i
                    style={{ fontSize: 14, color: '#F5483B', marginLeft: -2 }}
                    className="dxcalendar dx-calrefues"
                  />
                )}
                {feedbackType === EFeedbackType.Default && (
                  <i style={labelFontStyle} className="dxcalendar dx-calwait" />
                )}
                {feedbackType === EFeedbackType.Tentative && (
                  <i
                    style={{
                      fontSize: 14,
                      color: '#ff8800',
                      marginLeft: -2
                    }}
                    className="dxcalendar dx-caltemporarily"
                  />
                )}
              </>
            )}
            <span>{name}{getEnname(enName)}</span>
            {!isOrganizer && isConflict && (
              <div className={styles.conflactIcon}>
                <p>{i18nClient.t('attendeel_item_conflact_icon', '冲突')}</p>
              </div>
            )}
          </>
        )}
      </div>
    </Popover>
  );
}
