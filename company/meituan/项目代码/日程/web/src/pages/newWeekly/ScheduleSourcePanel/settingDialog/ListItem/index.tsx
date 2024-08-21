import { i18nClient } from '@sailor/i18n-web';
import {
  CALENDAR_ROLE, CALENDAR_ROLE_TYPE, EPERM_TYPE, ORG_ROLE_LIST
} from '@/common/interface/IcalendarInfo';
import React from 'react';
import RoleDropDownContent from '../RoleDropDownContent';
import styles from './index.less';
import { Dropdown } from '@ss/mtd-react';
import classnames from 'classnames';
import Avatar from '../Avatar';


interface IProps {
  owner?: boolean;
  avatar: string;
  name: string;
  role: CALENDAR_ROLE_TYPE;
  permissionType: EPERM_TYPE;
  jobStatus?: number;
  onRoleChange?: (role: CALENDAR_ROLE_TYPE) => void;
}

// setting 是展示用户列表的容器
const getContainer = (): HTMLElement => document.querySelector('.setting');


const ListItem = (props: IProps) => {
  const {
    owner = false, avatar, name, role, onRoleChange, jobStatus,
    permissionType
  } = props;
  const handleRoleChange = (val) => {
    onRoleChange && onRoleChange(val);
  };

  const getContent = () => {
    const roleList = permissionType === EPERM_TYPE.ORG_ID ? ORG_ROLE_LIST : CALENDAR_ROLE;
    return (<div className={styles.permissionListDropContent}><RoleDropDownContent roleList={roleList}
      role={role} deleteAble={true} onRoleChange={handleRoleChange}/></div>);
  };


  return (<div className={classnames(styles.item)}>
    <div className={styles.avatar}>
      <Avatar type={permissionType} src={avatar} name={name} jobStatus={jobStatus} />
    </div>
    {!owner ? <Dropdown placement='bottomLeft'
      getContainer={getContainer}
      content={getContent()}
      trigger='click'>
      <div className={styles.roleButton}>
        <label className={styles.label}>{CALENDAR_ROLE[role].label}</label>
        <i className={classnames(styles.icon, 'dxcalendar dx-caldown-o')} />
      </div>
    </Dropdown> : <div className={styles.owner}>
      {i18nClient.t('list_item_creator', '创建者')}
    </div>}
  </div>);
};

export default ListItem;
