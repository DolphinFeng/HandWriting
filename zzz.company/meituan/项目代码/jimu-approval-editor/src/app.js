/**
 * 在路由切换之前做一些事情，比如页面访问权限,或者埋点统计等
 */

export function onRouteChange(/* { location } */) {
  // 如果用户无访问权限，则重定向到“无访问权限”页面
  // if(location.pathname !== '/no-permisson') {
  //     if(nopermission) {
  //         router.replace('/no-permisson');
  //     }
  // }
  // if (location.pathname !== '/approval/admin/create') {
  // }
}
