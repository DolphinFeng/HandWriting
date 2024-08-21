import React, { useCallback } from 'react';
import classNames from 'classnames';
import { Input, Icon, Tooltip } from '@ss/mtd-react';
import { moduleClick } from 'onejs/lx';
import { IMeetingInfo } from './interface';
import { KEY_CODE } from '@/utils';
import styles from './index.less';
import { i18nClient } from '@sailor/i18n-web';


// 参数
interface IPropsType {
  location: string; // 地点
  unUsable: boolean; // 是否可用
  unUsableMessage?: string;
  mis: string;
  meeting: IMeetingInfo; // 会议室
  onChange: Function; // 修改地点
  onChangeMeetingRoom: Function; // 修改会议室
  onClear: Function; // 情况选择的会议室
  isChangeMeeting: boolean; // 是否更改了会议室
  changeEnterModel: Function; // 确认enter键
  closeUserSelect: Function; // 关闭用户选择弹框
}

/**
 * 地址及会议室选择器
 */
export default function Address(props: IPropsType) {
  let inputRef;
  const {
    location,
    meeting,
    unUsable,
    unUsableMessage,
    onChange,
    onChangeMeetingRoom,
    onClear,
    mis,
    isChangeMeeting,
    changeEnterModel,
    closeUserSelect
  } = props;

  /**
   * 修改地点
   */
  const handleChangeValue = useCallback((e) => {
    onChange && onChange(e.target.value);
  }, []);

  /**
   * 修改会议室
   */
  const handleChangeMeetingRoom = useCallback((e) => {
    // 退出栈：入栈
    changeEnterModel(0, true);
    e.stopPropagation();
    onChangeMeetingRoom && onChangeMeetingRoom();
    moduleClick('b_oa_k4ixxnqu_mc', {
      userMis: mis
    });
  }, []);

  // 返回
  return (
    <div>
      <div
        className={classNames(styles.container, {
          [styles.warn]: unUsable
        })}
      >
        <Input
          className={styles.address}
          clearable={false}
          maxLength={50}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          value={location}
          ref={(ref) => {
            inputRef = ref;
          }}
          onChange={handleChangeValue}
          placeholder={i18nClient.t('address_input_fifty_words_or_less', '地点，50 字以内')}
          showCount
        />
        <div
          onClick={() => {
            inputRef && inputRef.focus();
          }}
          style={{ display: 'inline-block' }}
        >
          <div
            className={classNames(styles.meetingRoom, {
              [styles.noMeeting]: !meeting || !meeting.id
            })}
            onClick={handleChangeMeetingRoom}
            onKeyDown={(e) => {
              // Enter 键打开会议室弹框
              if (e.keyCode === KEY_CODE.ENTER) {
                handleChangeMeetingRoom(e);
              }
            }}
            tabIndex={0}
            onFocus={() => closeUserSelect()}
          >
            <Icon className={styles.meetingIcon} type={'meetingroom'} />
            <span className={styles.text}>
              {meeting && meeting.id ? (
                <Tooltip message={i18nClient.t('address_meeting_room_tooltip', '更换会议室')} autoDestory>
                  <div>
                    {/* 防止详情页无buildingName展示问题 */}
                    {meeting.name} {meeting.floorName} {meeting.buildingName}
                  </div>
                </Tooltip>
              ) : (
                i18nClient.t('address_book_meeting_room', '订会议室')
              )}
            </span>

            {meeting && meeting.id && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                onKeyDown={(e) => {
                  // Enter 键关闭所选会议室
                  if (e.keyCode === KEY_CODE.ENTER) {
                    e.preventDefault();
                    e.stopPropagation();
                    onClear();
                  }
                }}
                className={styles.rightDelBtn}
                tabIndex={0}
              >
                <Icon className={styles.rightIcon} type={'closemini'} />
              </div>
            )}
          </div>
        </div>
      </div>
      {unUsable && <p className={styles.warnLabel}>{unUsableMessage}</p>}
      {!unUsable && isChangeMeeting && (
        <p className={styles.changeWranLabel}>
          {i18nClient.t('address_container_been_deleted', '原有会议室已被您更换或删除，编辑完成后将会释放')}
        </p>
      )}
    </div>
  );
}
