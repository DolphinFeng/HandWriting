import { EPERM_TYPE } from '@/common/interface/IcalendarInfo';
import React from 'react';
import ListItem from '../ListItem';
import styles from './index.less';


interface IListProps {
  permissionUsers: any[];
  creator?: any;
  handleChange: (role, user?) => void;
  emptyNode?: string;
}

const UserList = (props: IListProps) => {
  const {
    permissionUsers, creator, handleChange, emptyNode
  } = props;

  const handleRoleChange = (role, user) => {
    handleChange && handleChange(role, user);
  };


  const renderListItem = (
    item => (
      <ListItem
        role={item.role}
        name={
          item.permissionType === EPERM_TYPE.ORG_ID
            ? item.permissionName
            : `${item.permissionName || item.name}/${item.mis || item.userMis}`
        }
        jobStatus={item.jobStatusId}
        avatar={item.userAvatar}
        permissionType={item.permissionType}
        onRoleChange={val => handleRoleChange(val, item)}
      />
    )

  );

  return (

        <div className={styles.userListContainer}>
          {creator && (
            <ListItem
              role={creator.role}
              name={
                creator.permissionType === EPERM_TYPE.ORG_ID
                  ? creator.permissionName
                  : `${creator.permissionName || creator.name}/${creator.mis || creator.userMis}`
                }
              avatar={creator.userAvatar}
              permissionType={creator.permissionType}
              owner
              jobStatus={creator.jobStatusId}
            />
          )}
          {permissionUsers.length
            > 0 ? permissionUsers.map(item => renderListItem(item)) : !creator && <div className={styles.empty}>{emptyNode}</div>}
        </div>

  );
};

export default UserList;
