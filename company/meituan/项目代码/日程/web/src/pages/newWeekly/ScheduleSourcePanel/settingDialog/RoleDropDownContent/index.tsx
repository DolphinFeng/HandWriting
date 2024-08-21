import { i18nClient } from '@sailor/i18n-web';
import { CALENDAR_ROLE_TYPE } from '@/common/interface/IcalendarInfo';
import React from 'react';
import styles from './index.less';
import { Icon } from '@ss/mtd-react';

interface IProps{
  role: CALENDAR_ROLE_TYPE;
  onRoleChange?: (targetRole: string) => void;
  deleteAble?: boolean;
  roleList: any;
}

const RoleDropDownContent = (props: IProps) => {
  const {
    role, onRoleChange, deleteAble, roleList
  } = props;

  const handleRoleChange = (value?) => {
    onRoleChange && onRoleChange(value);
  };


  return (<div>
        {Object.keys(roleList).map((key) => {
          return (
                <div className={styles.dropDownItem} key={key}>
                    <div className={styles.dropDownLabel} onClick={() => handleRoleChange(key)}>
                        <label className={styles.label}>{roleList[key].label}</label>
                        <label className={styles.description}>{roleList[key].description}</label>
                    </div>
                    {role === key && <Icon className={styles.icon} type='check' />}
                </div>
          );
        })}
        {deleteAble && <div className={styles.dropDownDeleteItem}>
           <div className={styles.split} />
           <div onClick={() => handleRoleChange()} className={styles.deleteLabel}>
            {i18nClient.t('role_drop_down_content_delete_role', '移除权限')}
            </div>
        </div>}
    </div>);
};

export default RoleDropDownContent;
