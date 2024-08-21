import { i18nClient } from '@sailor/i18n-web';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Loading, Icon } from '@ss/mtd-react';
import { observable } from 'mobx';
import classNames from 'classnames';
import { groupMembers } from '@/services/apis';
import { messageStore } from '@/store/global';
import { addModuleClick } from '@/services/lxService';
import defaultGroupImg from '@/asserts/images/group.png';
import { KEY_CODE } from '@/utils';
import { IGroupItem, IMemberItem } from '../interface';
import UserItemList from '../UserItemList';
import { MAX_SUPPORT_PERSON } from '../const';
import styles from './index.less';

enum GROUP_ERROR {
  OUTNUMBER = 'GROUP_MEMBER_MORE_THAN',
  NOTEXIST = 'GROUP_NOT_EXIST'
}

interface IPropsType {
  gItem: IGroupItem;
  usersSelected: IMemberItem[];
  selectGid?: string[]; // '全选'的组
  openingGid?: string[]; // 暂开的组
  toggleSelectGid?: Function;
  toggleOpenGid?: Function;
  addUsers?: Function;
  removeUsers?: Function;
  orgnizerId?: string;
  allSelecting?: boolean;
  setAllSelecting?: Function;
}

// 请求列表不同详情
// 0 只打开
// 1 打开后选中所有
// 2 打开后取消所有
enum EOpenType {
  OPENING = 0,
  SELECT = 1,
  UNSELECT = 2
}

@observer
export default class extends Component<IPropsType> {
  // 加载中
  @observable loading = false;

  // 失败
  @observable failed = false;

  // 错误原因
  @observable groupError: string = null;

  // 请求成功完成
  @observable success = false;

  // 当前组成员
  @observable userList: IMemberItem[] = [];

  constructor(props) {
    super(props);
    const {
      gItem: { num }
    } = this.props;
    if (num > MAX_SUPPORT_PERSON) {
      this.failed = true;
      this.groupError = GROUP_ERROR.OUTNUMBER;
    }
  }

  getGroupMembers = async (eType: EOpenType) => {
    const { gItem, toggleOpenGid, setAllSelecting } = this.props;
    if (
      this.success
      || this.groupError === GROUP_ERROR.OUTNUMBER
      || this.groupError === GROUP_ERROR.NOTEXIST
    ) {
      toggleOpenGid && toggleOpenGid(gItem.gid, true);
    } else {
      try {
        this.loading = true;
        this.failed = false;
        setAllSelecting && setAllSelecting(true);
        const list = await groupMembers({ gid: gItem.gid });
        this.userList = list?.memberList;
        if (eType === EOpenType.SELECT) {
          this.addGroupUsers();
        } else if (eType === EOpenType.UNSELECT) {
          this.removeGroupUsers();
        } else {
          toggleOpenGid && toggleOpenGid(gItem.gid, true);
        }
        this.success = true;
      } catch (e) {
        this.failed = true;
        this.groupError = e?.originData?.data?.errorCode;
        if (
          this.groupError === GROUP_ERROR.NOTEXIST
          || this.groupError === GROUP_ERROR.OUTNUMBER
        ) {
          toggleOpenGid && toggleOpenGid(gItem.gid, true);
        }
      } finally {
        setAllSelecting && setAllSelecting(false);
        this.loading = false;
      }
    }
  };

  toggleOpeningGroup = (e) => {
    const { gItem, openingGid, toggleOpenGid } = this.props;
    const isOpen = !openingGid.includes(`${gItem.gid}`);
    if (isOpen) {
      this.getGroupMembers(EOpenType.OPENING);
    } else {
      toggleOpenGid && toggleOpenGid(gItem.gid, false);
    }

    // 埋点 - 按群选人点击 箭头/整行 区分展开/收起
    const { target } = e;
    if (
      target
      && target?.classList?.value
      && target.classList.value.includes('mtdicon')
    ) {
      // 点击箭头
      if (isOpen) {
        addModuleClick('b_oa_8im9sj4b_mc');
      } else {
        addModuleClick('b_oa_111npsbj_mc');
      }
    } else {
      // 点击整行
      addModuleClick('b_oa_8h2m7zr0_mc');
    }
  };

  addGroupUsers = () => {
    const {
      gItem,
      toggleSelectGid,
      addUsers,
      orgnizerId,
      usersSelected,
      toggleOpenGid
    } = this.props;
    const num = this.userList.length ? this.userList.length : gItem.num;
    // 群都有自己 +1 合并起来还是不超过MAX_SUPPORT_PERSON(500)
    if (num + usersSelected.length > MAX_SUPPORT_PERSON + 1) {
      messageStore.error(
        i18nClient.t(
          'group_item_participant_not_exceed',
          '参与人不能超过{MAX_SUPPORT_PERSON}',
          { MAX_SUPPORT_PERSON }
        )
      );
    } else {
      addUsers
        && addUsers(this.userList.filter(item => item.empId !== orgnizerId));
      toggleSelectGid && toggleSelectGid(gItem.gid, true);
    }
    toggleOpenGid && toggleOpenGid(gItem.gid, true);
  };

  removeGroupUsers = () => {
    const {
      gItem, toggleSelectGid, removeUsers, orgnizerId
    } = this.props;
    toggleSelectGid && toggleSelectGid(gItem.gid, false);
    removeUsers
      && removeUsers(this.userList.filter(item => item.empId !== orgnizerId));
  };

  toggleSelectGroup = (e) => {
    e.stopPropagation();
    const {
      gItem, selectGid, toggleOpenGid, usersSelected
    } = this.props;
    const isSelect = selectGid.includes(`${gItem.gid}`);
    if (
      this.groupError === GROUP_ERROR.OUTNUMBER
      || this.groupError === GROUP_ERROR.NOTEXIST
    ) {
      messageStore.error(
        this.groupError === GROUP_ERROR.NOTEXIST
          ? i18nClient.t(
            'group_item_participant_group_disbanded',
            '本群已解散，请选择其他群'
          )
          : i18nClient.t(
            'group_item_participant_not_support_exceed',
            '暂不支持添加超过{MAX_SUPPORT_PERSON}人的群',
            { MAX_SUPPORT_PERSON }
          )
      );
      toggleOpenGid && toggleOpenGid(gItem.gid, true);
    } else if (isSelect) {
      // 增删用户列表；
      // 如果还未请求，先请求用户列表 成功后再增删用户列表
      // 且全选需要展开
      if (this.success) {
        this.removeGroupUsers();
      } else {
        this.getGroupMembers(EOpenType.UNSELECT);
      }
    } else if (this.success) {
      this.addGroupUsers();
    } else if (gItem.num + usersSelected.length > MAX_SUPPORT_PERSON + 1) {
      messageStore.error(
        i18nClient.t(
          'group_item_participant_not_exceed',
          '参与人不能超过{MAX_SUPPORT_PERSON}',
          { MAX_SUPPORT_PERSON }
        )
      );
    } else {
      this.getGroupMembers(EOpenType.SELECT);
    }
    if (!isSelect) {
      // 点击全选
      addModuleClick('b_oa_pj1mpesk_mc');
    } else {
      // 点击取消全选
      addModuleClick('b_oa_er9x2m2o_mc');
    }
  };

  render() {
    const {
      gItem,
      usersSelected,
      selectGid,
      openingGid,
      removeUsers,
      addUsers,
      orgnizerId,
      allSelecting
    } = this.props;

    const isGroupOpen = openingGid.includes(`${gItem.gid}`);
    const isGroupSelect = selectGid.includes(`${gItem.gid}`);
    return (
      <>
        <div
          className={styles.groupItem}
          onClick={this.toggleOpeningGroup}
          onKeyDown={event => event.keyCode === KEY_CODE.ENTER && this.toggleOpeningGroup(event)
          }
          tabIndex={0}
        >
          <div className={styles.groupInfos}>
            <div
              className={classNames(styles.iconInfos, {
                [styles.hoverIcon]: !this.loading
              })}
            >
              {!this.loading && !isGroupOpen && <Icon type={'right-thick'} />}
              {this.loading && (
                <Loading className={styles.loadingIcon} size="small" />
              )}
              {!this.loading && isGroupOpen && <Icon type={'down-thick'} />}
            </div>
            <img src={gItem.avatar || defaultGroupImg} />
            <p>{gItem.name}</p>
            <span>{this.userList.length || gItem.num}</span>
          </div>
          {/* 保证该区域也能收起展开 */}
          <div onClick={this.toggleOpeningGroup} className={styles.toggleArea}>
            <div className={styles.gradientItem} />
            {!allSelecting && (
              <div
                onClick={this.toggleSelectGroup}
                className={styles.toggleBtn}
                tabIndex={0}
                onKeyDown={event => event.keyCode === KEY_CODE.ENTER
                  && this.toggleSelectGroup(event)
                }
              >
                {isGroupSelect
                  ? i18nClient.t('group_item_cancel_all_select', '取消全选')
                  : i18nClient.t('group_item_all_select', '全选')}
              </div>
            )}
          </div>
        </div>
        {openingGid.includes(`${gItem.gid}`)
          && (this.groupError === GROUP_ERROR.NOTEXIST
            || this.groupError === GROUP_ERROR.OUTNUMBER) && (
            <div className={styles.errorInfos}>{`${
              this.groupError === GROUP_ERROR.OUTNUMBER
                ? i18nClient.t(
                  'group_item_participant_not_support_exceed',
                  '暂不支持添加超过{MAX_SUPPORT_PERSON}人的群',
                  { MAX_SUPPORT_PERSON }
                )
                : i18nClient.t(
                  'group_item_participant_group_disbanded',
                  '本群已解散，请选择其他群'
                )
            }`}</div>
        )}
        {openingGid.includes(`${gItem.gid}`) && this.success && (
          <UserItemList
            orgnizerId={orgnizerId}
            usersSelected={usersSelected}
            usersList={this.userList}
            addUsers={addUsers}
            removeUsers={removeUsers}
          />
        )}
      </>
    );
  }
}
