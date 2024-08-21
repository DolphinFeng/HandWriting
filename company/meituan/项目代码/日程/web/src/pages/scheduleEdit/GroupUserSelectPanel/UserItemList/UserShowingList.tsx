import React, { Component } from 'react';
import classNames from 'classnames';
import { addModuleClick } from '@/services/lxService';
import { Icon, Tooltip } from '@ss/mtd-react';
import defaultImg from '@/asserts/images/default.png';
import { IMemberItem } from '../interface';

import styles from './index.less';
import { getEnname } from '@/utils';

interface IPropsType {
  usersSelected: IMemberItem[];
  orgnizerId: string;
  removeUsers?: Function;
}

export default class extends Component<IPropsType> {
  scrollToRef;

  scrollToNewSelect = () => {
    this.scrollToRef && this.scrollToRef.scrollIntoView();
  };

  removeUsers = (item: IMemberItem) => {
    const { orgnizerId, removeUsers } = this.props;
    if (orgnizerId !== item.empId) {
      removeUsers && removeUsers([item]);
    }
    // 点击删除或整行
    addModuleClick('b_oa_phklszc0_mc');
  };

  render() {
    const { usersSelected, orgnizerId } = this.props;
    return (
      <div className={styles.usersContainer}>
        {usersSelected.map((item, index) => {
          return (
            <div
              onClick={() => {
                this.removeUsers(item);
              }}
              key={index}
              className={classNames(styles.userItem, {
                [styles.orgItem]: orgnizerId === item.empId
              })}
              style={{ paddingLeft: 8 }}
            >
              <img src={item.avatar || defaultImg} />
              <Tooltip placement='topLeft' message={item.name + getEnname(item.enName)} autoDestory>
                <p>{item.name}{getEnname(item.enName)}</p>
              </Tooltip>
              <div className={styles.radioItem} style={{ marginRight: 0 }}>
                {orgnizerId !== item.empId && (
                  <Icon
                    className={classNames(styles.removeBtn, styles.releaseBtn)}
                    type={'error-circle'}
                  />
                )}
              </div>
            </div>
          );
        })}
        <div
          ref={(ref) => {
            this.scrollToRef = ref;
          }}
          className={styles.scrollItem}
        />
      </div>
    );
  }
}
