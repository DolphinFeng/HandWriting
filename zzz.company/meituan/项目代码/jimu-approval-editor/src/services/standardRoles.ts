import ajax from './ajax';

// import { standardRolesDataMock } from '../../mock/standardRoles';

/**
 * 根据标准角色类型，获取下面所有子角色
 */
export function getStandardRoles(roleType) {
  return ajax.get(`/service/console/bpm/v2/standard-roles/${roleType}`, {});
  // return Promise.resolve(standardRolesDataMock.data);
}
