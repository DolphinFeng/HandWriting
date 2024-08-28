/**
 * 拿到 mis 号之后，setDimension 并且做 cookie 的设置
 */
export const setRaptorUserInfo = function(userInfo) {
  function getCookie(name) {
    const val = document.cookie.match(new RegExp(`(?:^|;)\\s*${name}=([^;]+)`));
    return val ? decodeURIComponent(val[1]) : undefined;
  }

  function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    const expires = `expires=${d.toUTCString()}`;
    document.cookie = `${cname}=${encodeURIComponent(cvalue)}; ${expires}`;
  }

  // 这是封装在 onesjs 里的逻辑
  let unionId =
    getCookie('uuid') ||
    getCookie('unionid') ||
    getCookie('dpid') ||
    getCookie('_lxsdk_cuid') ||
    getCookie('uuid');

  const isEqualCurrentUser = userInfo && userInfo.mis === unionId;

  // 没变化就不 set 了
  if (typeof unionId === 'undefined' || !isEqualCurrentUser) {
    unionId = userInfo.mis;

    // 更新 unionid 为 mis 号，方便问题追踪
    window.Owl &&
      window.Owl.setDimension &&
      window.Owl.setDimension({
        unionId
      });

    // 变更 cookie 值，下次进来直接有了
    setCookie('uuid', unionId, 365);
  }
};

export const captureSchemaError = (
  message = 'unknown',
  level = 'error',
  category = 'js'
) => {
  window.Owl &&
    window.Owl.addError('captureSchemaError', {
      level,
      realUrl: window.location.pathname,
      category,
      tags: {
        message
      }
    });
};
