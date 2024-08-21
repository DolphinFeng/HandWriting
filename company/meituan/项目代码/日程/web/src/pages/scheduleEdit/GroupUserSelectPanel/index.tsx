import { i18nClient } from '@sailor/i18n-web';
import React, { Component } from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { debounce } from 'lodash';
import classNames from 'classnames';
import {
  Modal, Input, Icon, Loading, Button, Tooltip
} from '@ss/mtd-react';
import { group } from '@/services/apis';
import { messageStore } from '@/store/global';
import { addModuleClick } from '@/services/lxService';
import GroupItem from './GroupItem';
import UserShowingList from './UserItemList/UserShowingList';
import { IGroupItem, IMemberItem } from './interface';

import styles from './index.less';
import { MAX_SUPPORT_PERSON } from './const';

interface IPropsType {
  usersSelected: IMemberItem[];
  orgnizerId: string;
  closeDlg?: Function;
  onChange?: Function;
}

@observer
export default class extends Component<IPropsType> {
  throttleChange = null;

  showingListRef = null;

  // 查询的关键字
  @observable queryText: string = undefined;

  // 群组列表
  @observable groupList: IGroupItem[] = [];

  // 加载中
  @observable isLoading = false;

  // 加载失败
  @observable isFailed = false;

  // 弹框中选中的人
  @observable usersSelected: IMemberItem[] = [];

  // 选中的群组
  @observable gIdsSelect: string[] = [];

  // 展开的群组
  @observable gIdsOpening: string[] = [];

  // 区分近期群聊和搜索
  @observable nQueryResult = true;

  // 全选加载中 其它全选隐藏
  @observable allSelecting = false;

  titleRef;

  constructor(props) {
    super(props);
    const { usersSelected } = this.props;
    this.usersSelected = JSON.parse(JSON.stringify(usersSelected));
    this.throttleChange = debounce(this.group, 500);
  }

  componentDidMount() {
    this.queryText = '';
    this.group();
    setTimeout(() => {
      this.titleRef && this.titleRef.focus();
    }, 0);
  }

  handleCloseWindow = () => {
    const { closeDlg } = this.props;
    closeDlg && closeDlg();
  };

  group = async () => {
    try {
      this.gIdsOpening = [];
      this.groupList = [];
      this.isLoading = true;
      this.isFailed = false;
      const list = await group({
        keyword: this.queryText,
        pageSize: 20,
        pageNo: 1
      });
      this.groupList = list?.groupList || [];
      this.nQueryResult = !!this.queryText;
    } catch (e) {
      this.isFailed = true;
    } finally {
      this.isLoading = false;
    }
  };

  handleChange = (e) => {
    if (e.target.value !== this.queryText) {
      this.queryText = e.target.value;
      this.throttleChange();
    }
  };

  toggleSelectGid = (id, isSelect) => {
    const idStr = `${id}`;
    if (isSelect) {
      if (!this.gIdsSelect.includes(idStr)) {
        this.gIdsSelect.push(idStr);
      }
    } else {
      const index = this.gIdsSelect.findIndex(item => item === idStr);
      if (index >= 0) {
        this.gIdsSelect.splice(index, 1);
      }
    }
  };

  toggleOpenGid = (id, isSelect) => {
    const idStr = `${id}`;
    if (isSelect) {
      if (!this.gIdsOpening.includes(idStr)) {
        this.gIdsOpening.push(idStr);
      }
    } else {
      const index = this.gIdsOpening.findIndex(item => item === idStr);
      if (index >= 0) {
        this.gIdsOpening.splice(index, 1);
      }
    }
  };

  addUsers = (items: IMemberItem[]) => {
    const newItems = items.filter((item: IMemberItem) => {
      const index = this.usersSelected.findIndex((fItem: IMemberItem) => {
        return item.empId === fItem.empId;
      });
      return index === -1;
    });
    // 保证观察到数据变化
    this.usersSelected = [...this.usersSelected, ...newItems];
    // 加人后滚动到最下面
    setTimeout(() => {
      this.showingListRef && this.showingListRef.scrollToNewSelect();
    }, 0);
  };

  removeUsers = (items: IMemberItem[]) => {
    const itemList = this.usersSelected.filter((item) => {
      return (
        items.findIndex((fItem) => {
          return fItem.empId === item.empId;
        }) === -1
      );
    });
    this.usersSelected = itemList;
  };

  submit = () => {
    const { onChange } = this.props;
    if (this.usersSelected.length > MAX_SUPPORT_PERSON) {
      messageStore.error(
        i18nClient.t(
          'group_user_select_panel_cannot_execced',
          '参与人不能超过{MAX_SUPPORT_PERSON}'
        )
      );
    } else {
      onChange && onChange(this.usersSelected);
      this.handleCloseWindow();
    }
    addModuleClick('b_oa_boj488y6_mc');
  };

  render() {
    const { orgnizerId } = this.props;
    return (
      <Modal
        maskClosable={false}
        className={styles.container}
        title={i18nClient.t(
          'group_user_select_panel_select_by_group',
          '按群选人'
        )}
        onClose={() => {
          this.handleCloseWindow();
        }}
      >
        <Modal.Body>
          <div className={styles.modalContainer}>
            <div className={styles.groupContainer}>
              <div className={styles.fixContainer}>
                <Tooltip
                  message={i18nClient.t(
                    'group_user_select_panel_input_name',
                    '请输入群名称或群成员查询'
                  )}
                >
                  <Input
                    value={this.queryText}
                    className={styles.inputGroup}
                    placeholder={i18nClient.t(
                      'group_user_select_panel_input_name',
                      '请输入群名称或群成员查询'
                    )}
                    prefix={<Icon type="search" />}
                    onChange={this.handleChange}
                    // onFocus={this.handleFocus}
                    ref={(ref) => {
                      this.titleRef = ref;
                    }}
                  />
                </Tooltip>

                {!this.nQueryResult && this.groupList.length > 0 && (
                  <p className={styles.lastTitle}>
                    {i18nClient.t(
                      'group_user_select_panel_latest_group',
                      '最近群聊'
                    )}
                  </p>
                )}
              </div>
              <div className={styles.groupListContainer}>
                {(this.isLoading || this.isFailed) && (
                  <div className={styles.loadingOrFaildContainer}>
                    {this.isLoading && (
                      <Loading
                        message={i18nClient.t(
                          'group_user_select_panel_loading',
                          '加载中...'
                        )}
                      />
                    )}
                    {this.isFailed && (
                      <>
                        <p className={styles.failed}>
                          {i18nClient.t(
                            'group_user_select_panel_loading_failed',
                            '加载失败'
                          )}
                        </p>
                        <Button onClick={this.group}>
                          {i18nClient.t(
                            'group_user_select_panel_retry',
                            '重试'
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                )}
                {!this.isLoading
                  && !this.isFailed
                  && this.groupList.length === 0 && (
                    <div className={styles.loadingOrFaildContainer}>
                      <p className={styles.failed}>
                        {i18nClient.t(
                          'group_user_select_panel_no_eligible_groups',
                          '暂无符合条件的群组'
                        )}
                      </p>
                    </div>
                )}
                {!this.isLoading
                  && !this.isFailed
                  && this.groupList.map((item, index) => {
                    return (
                      <GroupItem
                        allSelecting={this.allSelecting}
                        setAllSelecting={(val) => {
                          this.allSelecting = val;
                        }}
                        usersSelected={this.usersSelected}
                        gItem={item}
                        key={index}
                        toggleSelectGid={this.toggleSelectGid}
                        toggleOpenGid={this.toggleOpenGid}
                        selectGid={this.gIdsSelect}
                        openingGid={this.gIdsOpening}
                        addUsers={this.addUsers}
                        removeUsers={this.removeUsers}
                        orgnizerId={orgnizerId}
                      />
                    );
                  })}
              </div>
            </div>
            <div className={styles.userContainer}>
              <p className={styles.selectNumbers}>
                {i18nClient.t('group_user_select_panel_elected', '已选')}
                <span>{this.usersSelected.length}</span>
              </p>
              <UserShowingList
                ref={(ref) => {
                  this.showingListRef = ref;
                }}
                usersSelected={this.usersSelected}
                orgnizerId={orgnizerId}
                removeUsers={this.removeUsers}
              />
            </div>
          </div>
          <div className={styles.footer}>
            <Button
              className={classNames(styles.btn, styles.cancel)}
              onClick={this.handleCloseWindow}
            >
              {i18nClient.t('group_user_select_panel_canceled', '取消')}
            </Button>
            <Button className={styles.btn} onClick={this.submit} type="primary">
              {i18nClient.t('group_user_select_panel_confirmed', '确定')}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}
