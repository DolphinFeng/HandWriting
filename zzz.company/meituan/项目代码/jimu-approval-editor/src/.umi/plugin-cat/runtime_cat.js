// 路由切换
export function onRouteChange({
  location,
  matchedRoutes,
}) {
  if (window.Owl && !window.__POWERED_BY_QIANKUN__) {
    let pathName = location.pathname;
    if (matchedRoutes.length) {
      pathName = matchedRoutes[matchedRoutes.length - 1].route.path;
    }
    window.Owl.resetPv({
      pageUrl: location.href,
    });
  }
}
