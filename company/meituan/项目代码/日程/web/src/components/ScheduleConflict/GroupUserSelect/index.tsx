import { i18nClient } from '@sailor/i18n-web';
/*
 * @Description: 群成员选择器
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2021-03-09 14:06:33
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2021-04-15 17:02:45
 * @FilePath: /scheduleweb/src/components/ScheduleConflict/GroupUserSelect/index.tsx
 */

import React from 'react';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import {
  Input, Icon, Tooltip, Checkbox, Loading
} from '@ss/mtd-react';
import { groupMembers, getAttanceAccount } from '@/services/apis';
import { StorageService } from '@/services/storage';
import { addModuleClick } from '@/services/lxService';
import { RetryContent } from '@/components';
import defaultImg from '@/asserts/images/default.png';

import MessageStore from '@/utils/messageStore';
import styles from './index.less';
import { getEnname } from '@/utils';

const CheckboxGroup = Checkbox.Group;
interface IGroupUserSelect {
  useConflictList: [];
  chatId: string;
  chatType: string;
  changeAttances?: any;
  currentEmpId?: string;
  userList?: any;
}

@observer
export default class GroupUserSelect extends React.Component<IGroupUserSelect> {
  @observable userList = [];

  @observable outGroupMember = [];

  @observable storeOutMember = [];

  @observable dataSource = [];

  @observable searchKey = null;

  @observable showSelects = false;

  @observable queryFaild = false;

  @observable queryLoading = false;

  innerRef;

  inputRef;

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside);
    this.getGroupList();
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }

  // 处理点击外部关闭下拉弹框
  // TODO: 确认写法是否有问题
  handleClickOutside = (event) => {
    if (this.innerRef && this.innerRef.contains(event.target)) {
      // 点击组件内部无需处理
    } else {
      // 点击组件外部关闭
      this.showSelects = false;
    }
  };

  getGroupList = async () => {
    const { chatId, chatType, userList } = this.props;
    this.queryLoading = true;
    this.queryFaild = false;
    if (chatType === 'groupchat') {
      try {
        const list = await groupMembers({ gid: chatId });
        this.userList = list?.memberList;
        StorageService.setItemSession('groupUserList', this.userList);
        this.queryFaild = false;
      } catch (e) {
        this.queryFaild = true;
      } finally {
        this.queryLoading = false;
      }
    } else {
      this.userList = userList;
      this.queryFaild = false;
      this.queryLoading = false;
    }
  };

  changeAttances = (arr) => {
    const { changeAttances } = this.props;
    // 进行深copy处理
    changeAttances && changeAttances(JSON.parse(JSON.stringify(arr)));
  };

  checkedAll = (e) => {
    const {
      currentEmpId, chatId, chatType, useConflictList
    } = this.props;
    this.outGroupMember = useConflictList.filter((itemx) => {
      return !this.userList.some(itemy => itemx.empId === itemy.empId);
    });
    if (e.target.checked) {
      this.changeAttances([...this.userList, ...this.outGroupMember]);
      if (chatType === 'groupchat') {
        addModuleClick('b_oa_p0bf60d4_mc', {
          chatType,
          chatId
        });
      }
    } else {
      this.changeAttances([
        ...this.userList.filter(item => currentEmpId === item.empId),
        ...this.outGroupMember
      ]);
      if (chatType === 'groupchat') {
        addModuleClick('b_oa_n9pepxtm_mc', {
          chatType,
          chatId
        });
      }
    }
  };

  changeHandle = async (e, pre) => {
    const { chatId, chatType } = this.props;
    if (e.length >= 500) {
      MessageStore.error(
        i18nClient.t(
          'group_user_select_participant_cannot_exce',
          '参与人不可超过500人'
        )
      );
    } else {
      const storeOutMemberId = this.storeOutMember.map(item => item.empId);
      const userListId = this.userList.map(item => item.empId);
      // 之前未选中的群外成员
      const newitem = this.dataSource
        .filter(item => e.includes(item.empId))
        .filter((item) => {
          return (
            !userListId.includes(item.empId)
            && !storeOutMemberId.includes(item.empId)
          );
        });
      if (newitem.length > 0) {
        this.storeOutMember.push(...newitem);
      }
      const allMember = [...this.userList, ...this.storeOutMember];
      this.changeAttances(allMember.filter(item => e.includes(item.empId)));
      if (chatType === 'groupchat') {
        if (e.length > pre.length) {
          // 选中
          addModuleClick('b_oa_ljdsq2ux_mc', {
            chatType,
            chatId
          });
        } else {
          //  取消选中
          addModuleClick('b_oa_a519h174_mc', {
            chatType,
            chatId
          });
        }
      }
    }
  };

  onSearchChange = (e) => {
    this.searchKey = e.target.value;
    this.showListFunc(this.searchKey);
  };

  toggleShow = () => {
    const { userList, chatType } = this.props;
    const userListTemp = chatType === 'groupchat' ? this.userList : userList;
    this.showSelects = !this.showSelects;
    this.dataSource = userListTemp;

    // 选择成员聚焦
    if (this.showSelects) {
      setTimeout(() => {
        this.inputRef && this.inputRef.focus();
        if (this.searchKey) {
          this.searchKey = '';
        }
      }, 0);
      if (this.userList.length === 0) {
        this.getGroupList();
      }
      addModuleClick('b_oa_cg0veh89_mc');
    }
  };

  // 返回一个数组
  showListFunc = async (searchKey) => {
    const { userList, chatType } = this.props;
    const userListTemp = chatType === 'groupchat' ? this.userList : userList;
    const filter = { filter: searchKey };
    if (searchKey) {
      const data = await getAttanceAccount(filter);
      this.dataSource = Array.isArray(data) ? data : [];
    } else {
      this.dataSource = userListTemp;
    }
  };

  isChecked() {
    const { useConflictList } = this.props;
    this.outGroupMember = useConflictList.filter((itemx) => {
      return !this.userList.some(itemy => itemx.empId === itemy.empId);
    });
    if (useConflictList.length >= this.userList.length) {
      return this.userList.every(itemx => useConflictList.some(itemy => itemx.empId === itemy.empId));
    }
    return false;
  }

  render() {
    const {
      useConflictList, currentEmpId, userList, chatType
    } = this.props;
    const userListTemp = chatType === 'groupchat' ? this.userList : userList;

    const checked = this.isChecked();
    const value = useConflictList.map(item => item.empId);
    const placeholder = chatType === 'groupchat'
      ? i18nClient.t(
        'group_user_select_search_group_participants',
        '搜索群内或群外参与人'
      )
      : i18nClient.t(
        'group_user_select_search_other_participants',
        '搜索单聊成员或其他参与人'
      );
    const showList = this.dataSource;

    return (
      <div
        ref={(ref) => {
          this.innerRef = ref;
        }}
        className={styles.container}
      >
        <Tooltip
          placement="topLeft"
          delayHide={0}
          message={i18nClient.t('group_user_select_members_select', '选择成员')}
        >
          <div onClick={this.toggleShow} className={styles.opts}>
            <div className={styles.optsDiv}>
              {i18nClient.t('group_user_select_members', '成员')}
              <Icon
                type={this.showSelects ? 'up-thick' : 'down-thick'}
                style={{ fontSize: 12 }}
              />
            </div>
            {!!useConflictList.length && (
              <div className={styles.count}>
                {i18nClient.t('group_user_select_people_length', '{length}人', {
                  length: useConflictList.length
                })}
              </div>
            )}
          </div>
        </Tooltip>
        {this.showSelects && (
          <div className={styles.groupSelectContanier}>
            {!this.queryFaild && !this.queryLoading && (
              <>
                <Tooltip message={placeholder}>
                  <Input
                    value={this.searchKey}
                    placeholder={placeholder}
                    prefix={<Icon type="search" />}
                    onChange={this.onSearchChange}
                    ref={(ref) => {
                      this.inputRef = ref;
                    }}
                  />
                </Tooltip>

                <div className={styles.groupUsersList}>
                  {!this.searchKey && (
                    <Checkbox
                      disabled={userListTemp.length > 500}
                      checked={checked}
                      onChange={this.checkedAll}
                    >
                      {chatType === 'groupchat'
                        && i18nClient.t(
                          'group_user_select_all_group_members',
                          '全选群成员（共{length}人）',
                          { length: userListTemp.length }
                        )}
                      {chatType !== 'groupchat'
                        && i18nClient.t(
                          'group_user_select_all_members',
                          '全选成员（共{length}人）',
                          { length: userListTemp.length }
                        )}
                    </Checkbox>
                  )}
                  {showList && showList.length > 0 && (
                    <CheckboxGroup
                      value={value}
                      onChange={(e) => {
                        this.changeHandle(e, value);
                      }}
                    >
                      {showList.map((item) => {
                        return (
                          <Checkbox
                            disabled={item.empId === currentEmpId}
                            value={item.empId}
                            key={item.empId}
                          >
                            <img src={item.avatar || defaultImg} />
                            <Tooltip message={`${item.name}${getEnname(item.enName)}/${item.mis}`} autoDestory>
                              <span>
                                {item.name}{getEnname(item.enName)}/{item.mis}
                              </span>
                            </Tooltip>
                          </Checkbox>
                        );
                      })}
                    </CheckboxGroup>
                  )}
                  {!this.queryFaild
                    && this.searchKey
                    && showList.length === 0 && (
                      <p className={styles.noSearchResult}>
                        {i18nClient.t(
                          'group_user_select_no_searches_related_to_searchKey',
                          '没有搜索到相关于“{searchKey}”的成员',
                          { searchKey: this.searchKey }
                        )}
                      </p>
                  )}
                </div>
              </>
            )}
            <div
              style={{
                display: this.queryFaild ? 'flex' : 'none'
              }}
            >
              <RetryContent
                style={{ marginTop: 100 }}
                onRetry={this.getGroupList}
              />
            </div>
            {this.queryLoading && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 130
                }}
              >
                <Loading
                  message={i18nClient.t(
                    'group_user_select_loading',
                    '加载中...'
                  )}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}
