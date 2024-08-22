import { EPERM_TYPE } from '@/common/interface/IcalendarInfo';

export function generatePermissionList(result, type: EPERM_TYPE) {
  return result.map((item) => {
    return generateSelectOption(item, type);
  });
}

function generateSelectOption(val, type: EPERM_TYPE) {
  let item = {};
  switch (type) {
    case EPERM_TYPE.USER_ID:
      item = {
        value: val.empId || val.permissionValue,
        avatar: val.avatar || val.userAvatarm,
        permissionName: val.name || val.permissionName,
        label: `${val.name || val.permissionName}/${val.mis || val.userMis}`,
        mis: val.mis || val.userMis,
      };
      break;
    case EPERM_TYPE.ORG_ID:
      item = {
        value: val.orgId || val.permissionValue,
        label: val.name || val.permissionName,
        permissionName: val.name || val.permissionName
      };
      break;
    default:
      break;
  }

  return item;
}
