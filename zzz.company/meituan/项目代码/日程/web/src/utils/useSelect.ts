/*
 * @Description: 选人组件保存上次选中的人
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-07-14 15:19:31
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-07-14 15:24:10
 * @FilePath: /scheduleweb/src/utils/useSelect.ts
 */

const storageKey = 'users_select';

export const getStorageUsers = () => {
  try {
    const useStoreListBuffer: string = localStorage.getItem(storageKey);
    if (useStoreListBuffer) {
      return JSON.parse(useStoreListBuffer);
    }
    return [];
  } catch (e) {
    return [];
  }
};

export const setStorageUsers = (usersList): void => {
  const storePerson = getStorageUsers();
  const allAddUserList = usersList.map((item) => {
    return {
      empId: item.empId,
      name: item.name,
      avatar: item.avatar,
      mis: item.mis,
      enName: item.enName
    };
  });
  const allAddUserEmpIdList = usersList.map(item => item.empId);
  const allList = [
    ...allAddUserList,
    ...storePerson.filter(item => !allAddUserEmpIdList.includes(item.empId))
  ].slice(1, 31); // 排除自己
  localStorage.setItem(storageKey, JSON.stringify(allList));
};
