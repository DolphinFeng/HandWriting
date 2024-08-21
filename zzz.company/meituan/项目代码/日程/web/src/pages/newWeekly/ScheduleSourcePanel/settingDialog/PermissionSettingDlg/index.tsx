import { i18nClient } from '@sailor/i18n-web';

import React, { useState, useRef } from 'react';
import styles from './index.less';
import { Button, Modal, Radio } from '@ss/mtd-react';
import DlgTitle from '../DlgTitle';
import {
  CALENDAR_ROLE,
  CALENDAR_ROLE_TYPE,
  EPERM_TYPE,
  ORG_ROLE_LIST
} from '@/common/interface/IcalendarInfo';
import { getAttanceAccount } from '@/services/apis';
import { generatePermissionList } from './utils';
import { searchDepartment } from '@/services/calendarInfo';
import classnames from 'classnames';
import PermissionSelectC from './PermissionSelectClass';

interface ISettingDlg {
  onClose: () => void;
  initUser?: any[];
  onAddUser?: (user: any[], type: EPERM_TYPE, role: CALENDAR_ROLE_TYPE) => void;
}

const PermissionSettingDlg = (props: ISettingDlg) => {
  const { onClose, initUser, onAddUser } = props;
  const selectRef = useRef(null);

  const [searchResult, setSearchResult] = useState([]);

  const [searchType, setSearchType] = useState(EPERM_TYPE.USER_ID);
  const [currentRole, setCurrentRole] = useState(CALENDAR_ROLE_TYPE.SUBSCRIBED);

  const [selectUsers, setSelectUsers] = useState([]);

  const handleClose = () => {
    onClose && onClose();
  };

  const handleSearch = async (val: string) => {
    let searchRes = [];
    switch (searchType) {
      case EPERM_TYPE.ORG_ID:
        // eslint-disable-next-line
        const res = await searchDepartment({ filter: val.trim() });
        searchRes = res ? [res] : [];
        break;
      case EPERM_TYPE.USER_ID:
        searchRes = await getAttanceAccount({ filter: val });
        break;
      default:
        break;
    }
    setSearchResult([...searchRes] || []);
  };

  const handleRoleChange = (arg) => {
    setCurrentRole(arg);
  };

  const handleSearchTypeChange = (val) => {
    setSearchType(val);
    if (val === EPERM_TYPE.ORG_ID) {
      setCurrentRole(CALENDAR_ROLE_TYPE.SUBSCRIBED);
    }
    setSearchResult([]);
    setSelectUsers([]);
    selectRef?.current?.setValue([]);
  };

  const handleUserChange = (val) => {
    setSelectUsers(val);
  };

  const handleConfirm = () => {
    onAddUser && onAddUser(selectUsers, searchType, currentRole);
  };

  return (
    <Modal
      className={styles.permissionSettingDlg}
      maskClosable={false}
      closable={false}
      title={
        <DlgTitle
          title={i18nClient.t('permission_setting_dlg_add_role', '新增权限')}
          onClose={handleClose}
        />
      }
    >
      <Modal.Body>
        <div className={styles.type}>
          <Radio.Group value={searchType} onChange={handleSearchTypeChange}>
            <Radio key={EPERM_TYPE.USER_ID} value={EPERM_TYPE.USER_ID}>
              {i18nClient.t('permission_setting_dlg_people', '个人')}
            </Radio>
            <Radio key={EPERM_TYPE.ORG_ID} value={EPERM_TYPE.ORG_ID}>
              {i18nClient.t('permission_setting_dlg_department', '部门')}
            </Radio>
          </Radio.Group>
        </div>
        <div>
          <PermissionSelectC
            ref={selectRef}
            initRole={currentRole}
            onFilter={handleSearch}
            userSelected={generatePermissionList(
              initUser.filter((item) => {
                return item?.permissionType === searchType;
              }),
              searchType
            )}
            placeholder={
              searchType === EPERM_TYPE.ORG_ID
                ? i18nClient.t(
                  'permission_setting_dlg_onlu_support_complete_chain',
                  '仅支持输入完整部门链'
                )
                : i18nClient.t(
                  'permission_setting_dlg_input_name_mis',
                  '请输入姓名、mis号查找'
                )
            }
            searchType={searchType}
            roleList={
              searchType === EPERM_TYPE.ORG_ID ? ORG_ROLE_LIST : CALENDAR_ROLE
            }
            onUserChange={handleUserChange}
            searchResult={generatePermissionList(searchResult, searchType)}
            onRoleChange={handleRoleChange}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={handleClose}
          className={classnames(styles.btn, styles.cancel)}
        >
          {i18nClient.t('permission_setting_dlg_cancel', '取消')}
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={selectUsers.length < 1}
          className={classnames(styles.btn)}
          type="primary"
        >
          {i18nClient.t('permission_setting_dlg_add_role', '新增权限')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PermissionSettingDlg;
