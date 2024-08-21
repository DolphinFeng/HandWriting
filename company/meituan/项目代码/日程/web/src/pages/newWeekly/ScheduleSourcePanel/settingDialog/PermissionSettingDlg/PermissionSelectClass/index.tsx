import { i18nClient } from '@sailor/i18n-web';

import React from 'react';

import { CALENDAR_ROLE, EPERM_TYPE } from '@/common/interface/IcalendarInfo';
import { Dropdown, Select } from '@ss/mtd-react';
import RoleDropDownContent from '../../RoleDropDownContent';
import classnames from 'classnames';
import styles from './index.less';
import { action, observable } from 'mobx';
import Avatar from '../../Avatar';

const { Option } = Select;
const getContainer = (): HTMLElement => document.querySelector('.searchListDrop');

export const defaultImg = 'https://s3plus.sankuai.com/common-asserts/default_task_avatar.png?AWSAccessKeyId=tzwrzkgkf2f5ndgg000000000063c81e&Expires=3991620032&Signature=scHp6klScuzEP4rFK%2BXzvuY%2FrZU%3D';

export interface IPermissionSelect {
  searchResult: any[]; // 搜索结果列表
  userSelected?: any[]; // 选中的用户列表
  initRole: string; // 选中的权限
  onUserChange?: (selectUser: any[]) => void;
  onRoleChange?: (selectRole: any[]) => void;
  onFilter?: (val) => void;
  onFocus?: () => void;
  loading?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  roleList?: any;
  searchType?: EPERM_TYPE;
}

export default class PermissionSelectC extends React.Component<IPermissionSelect> {
  constructor(props) {
    super(props);
    this.state = {
      onChoseRole: false
    };
  }
  @observable filter = false;
  @observable value: any[] = [];
  @action setValue = (val) => {
    this.value = val;
  };
  setonChoseRole = () => {
    this.setState(prevState => ({
      onChoseRole: !prevState.onChoseRole
    }));
  };
  @action setFilter = (val: boolean) => {
    this.filter = val;
  };

  hasSelected = (item, target) => {
    return target.some((targetItem) => {
      return item.value === targetItem?.value;
    });
  };

  handleUserSelectedChange = (optionValue) => {
    this.setValue(optionValue);
    const { onUserChange } = this.props;
    onUserChange && onUserChange(optionValue);
  };

  handleRoleChange = (val) => {
    const { onRoleChange } = this.props;

    onRoleChange && onRoleChange(val);
  };

  handleOnFilter = (val) => {
    const { onFilter } = this.props;
    if (val) {
      this.setFilter(true);
      onFilter && onFilter(val);
    } else {
      this.setFilter(false);
    }
  };

  handleFocus = () => {
    const { onFocus } = this.props;
    this.setFilter(false);
    onFocus && onFocus();
  };

  render() {
    const {
      autoFocus,
      userSelected,
      searchResult,
      initRole,
      placeholder,
      roleList,
      searchType
    } = this.props;
    return (
      <div className={styles.search}>
        <Select
          className={'permission-select'}
          autoFocus={autoFocus}
          value={this.value}
          onChange={this.handleUserSelectedChange}
          multiple={true}
          notFoundMessage={
            !this.filter
              ? placeholder
                || i18nClient.t(
                  'permission_select_class_input_name',
                  '请输入姓名、mis号查找'
                )
              : i18nClient.t(
                'permission_select_class_blank_result',
                '搜索结果为空'
              )
          }
          renderTagLabel={(item) => {
            return item.originOption.label;
          }}
          placeholder={
            placeholder
            || i18nClient.t(
              'permission_select_class_input_name',
              '请输入姓名、mis号查找'
            )
          }
          onFilter={this.handleOnFilter}
          onFocus={this.handleFocus}
        >
          {searchResult.map((userItem, index) => (
            <Option
              key={index}
              value={userItem.value}
              originOption={userItem}
              className={styles.option}
              disabled={this.hasSelected(userItem, userSelected)}
            >
              <div
                className={classnames(
                  styles.optionItem,
                  this.hasSelected(userItem, userSelected)
                    || this.hasSelected(userItem, this.value)
                    ? styles.selected
                    : ''
                )}
              >
                <div
                  className={classnames(
                    styles.checkbox,
                    this.hasSelected(userItem, this.value)
                      ? styles.selected
                      : ''
                  )}
                >
                  {(this.hasSelected(userItem, userSelected)
                    || this.hasSelected(userItem, this.value)) && (
                    <i
                      className={classnames(
                        styles.icon,
                        'dxcalendar dx-calcheck-o'
                      )}
                    />
                  )}
                </div>
                <div className={styles.info}>
                  <Avatar
                    type={searchType}
                    src={userItem.avatar}
                    name={userItem.label}
                  />
                </div>
              </div>
            </Option>
          ))}
        </Select>
        <div className="searchListDrop" onClick={this.setonChoseRole}>
          <Dropdown
            placement="bottomLeft"
            getContainer={getContainer}
            visible={this.state.onChoseRole}
            content={
              <div>
                <RoleDropDownContent
                  role={initRole}
                  onRoleChange={this.handleRoleChange}
                  roleList={roleList}
                />
              </div>
            }
          >
            <div className={styles.searchPerm}>
              <label className={styles.label}>
                {CALENDAR_ROLE[initRole].label}
              </label>
              <i
                className={classnames(styles.icon, 'dxcalendar dx-caldown-o')}
                style={{
                  transform: this.state.onChoseRole && 'rotate(180deg)'
                }}
              />
            </div>
          </Dropdown>
        </div>
      </div>
    );
  }
}
