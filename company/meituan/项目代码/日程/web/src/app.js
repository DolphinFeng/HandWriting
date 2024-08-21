/*
 * @Description: 初始化执行函数
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-06-04 11:16:28
 * @LastEditors: chenbaiyu
 * @LastEditTime: 2023-01-05 15:38:35
 * @FilePath: /scheduleweb/src/app.js
 */
import { addResError } from '@/utils';
import { addDXClientMessage } from '@/services/dxClientMessage';
// import { pikeStart, pikeStop } from '@/services/pikeService';

// 页面初次渲染
export async function render(oldRender) {
  addResError('PageFirstLoad', '页面首次加载');
  addDXClientMessage();
  oldRender();
}


// 路由切换
export function onRouteChange({ location }) {
  // if (
  //   !location.pathname.startsWith('/edit')
  //   && !location.pathname.startsWith('/rooms')
  // ) {
  //   pikeStart();
  // } else {
  //   pikeStop();
  // }
}
