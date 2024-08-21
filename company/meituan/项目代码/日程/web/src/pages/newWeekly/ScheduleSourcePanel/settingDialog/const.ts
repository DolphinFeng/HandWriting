import { i18nClient } from '@sailor/i18n-web';
import { EPERM_TYPE } from '@/common/interface/IcalendarInfo';

export const MENU_TABS = [
  {
    key: EPERM_TYPE.ALL,
    label: i18nClient.t('setting_dialog_all', '全部'),
  },
  {
    key: EPERM_TYPE.ORG_ID,
    label: i18nClient.t('setting_dialog_department', '部门'),
  },
  {
    key: EPERM_TYPE.USER_ID,
    label: i18nClient.t('setting_dialog_people', '个人'),
  }
];
