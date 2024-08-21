/*
 * @Description: 群日程接口文件
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2021-03-08 17:53:01
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2021-03-09 11:51:40
 * @FilePath: /scheduleweb/src/services/groupMeeting.ts
 */

// http://localhost:8000
import ajax from './ajax';

const prefix = '/api/v2/xm';

// 获取会议室列表账号
export async function groupMember(params) {
  return ajax.get(
    `${prefix}/group/schedule/member?chatId=${params.chatId}&chatType=${params.chatType}`
  );
}

export async function groupMemberSort(params) {
  return ajax({
    url: `${prefix}/group/schedule/member/sort`,
    method: 'post',
    data: params,
    withErrorMessage: false
  });
}
