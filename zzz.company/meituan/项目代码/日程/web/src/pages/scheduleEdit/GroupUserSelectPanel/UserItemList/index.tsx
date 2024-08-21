import { i18nClient } from '@sailor/i18n-web';
import React, { Component } from 'react';
import classNames from 'classnames';
import { Icon, Tooltip } from '@ss/mtd-react';
import { messageStore } from '@/store/global';
import { addModuleClick } from '@/services/lxService';
import defaultImg from '@/asserts/images/default.png';
import { getEnname, KEY_CODE } from '@/utils';
import { IMemberItem } from '../interface';
import { MAX_SUPPORT_PERSON } from '../const';
import styles from './index.less';

interface IPropsType {
  usersSelected: IMemberItem[];
  usersList: IMemberItem[];
  addUsers?: Function;
  removeUsers?: Function;
  orgnizerId?: string;
}

export default class extends Component<IPropsType> {
  toggleSelectUser = (item: IMemberItem) => {
    const {
      addUsers, removeUsers, orgnizerId, usersSelected
    } = this.props;
    if (orgnizerId === item.empId) {
      return;
    }
    if (this.checkIsSelected(item)) {
      removeUsers && removeUsers([item]);
    } else if (usersSelected.length >= MAX_SUPPORT_PERSON) {
      messageStore.error(
        i18nClient.t('user_item_list_max_support_person', '参与人不能超过{MAX_SUPPORT_PERSON}', {
          MAX_SUPPORT_PERSON
        })
      );
    } else {
      addUsers && addUsers([item]);
    }
    // 点击复选或整行
    addModuleClick('b_oa_n4igrtxo_mc');
  };

  checkIsSelected = (checkItem: IMemberItem): boolean => {
    const { usersSelected } = this.props;
    return (
      usersSelected.findIndex(item => item.empId === checkItem.empId) >= 0
    );
  };

  render() {
    const { usersList, orgnizerId } = this.props;
    return (
      <div className={styles.userList}>
        {usersList.map((item, index) => {
          return (
            <div
              onClick={() => {
                this.toggleSelectUser(item);
              }}
              key={index}
              className={classNames(styles.userItem, {
                [styles.orgItem]: orgnizerId === item.empId
              })}
              onKeyDown={event => event.keyCode === KEY_CODE.ENTER && this.toggleSelectUser(item)
              }
              tabIndex={0}
            >
              <img src={item.avatar || defaultImg} />
              <Tooltip placement='topLeft' message={item.name + getEnname(item.enName)} autoDestory>
                <p>{item.name}{getEnname(item.enName)}</p>
              </Tooltip>
              <div className={styles.radioItem}>
                {this.checkIsSelected(item) && orgnizerId !== item.empId && (
                  <Icon
                    className={styles.removeBtn}
                    style={{ color: '#0A70F5' }}
                    type={'success-circle'}
                  />
                )}
                {!this.checkIsSelected(item) && orgnizerId !== item.empId && (
                  <Icon
                    className={styles.removeBtn}
                    style={{ color: 'rgba(0, 0, 0, 0.36)' }}
                    type={'radio-unchecked'}
                  />
                )}
                {orgnizerId === item.empId && (
                  <Icon
                    className={styles.removeBtn}
                    style={{ color: '#0A70F5', opacity: 0.4 }}
                    type={'success-circle'}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}
