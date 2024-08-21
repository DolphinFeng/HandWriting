/**
 * 获取浏览器的参数
 * @param url URL链接
 * @param param 参数
 */
export const urlParams = (param?: string, url?: string) => {
  const paramsArr: string[] = decodeURIComponent(url || window.location.href).match(
    /([^?=&]+)(=([^&]*))/g
  ) || [];
  const paramsObj: { [x: string]: string } = {};

  paramsArr.forEach((item) => {
    const arr = item.split('=');
    paramsObj[arr[0]] = arr[1];
  });

  return param ? paramsObj[param] : paramsObj;
};
