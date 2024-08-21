/*
 * @Description: 文件描述
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-11-25 16:02:11
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-11-25 16:58:50
 * @FilePath: /scheduleweb/src/pages/scheduleEdit/GroupUserSelectPanel/interface.ts
 */
export interface IGroupItem {
  avatar: string;
  gid: string;
  name: string;
  num?: number;
}

export interface IMemberItem {
  empId?: string;
  name: string;
  mis: string;
  xmUid?: string;
  orgId?: string;
  avatar?: string;
  email?: string;
}
