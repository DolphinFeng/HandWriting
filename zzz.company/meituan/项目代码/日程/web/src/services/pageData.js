/*
 * @Author: chenbaiyu
 * @Date: 2022-12-22 14:57:13
 * @LastEditTime: 2023-01-05 17:43:35
 * @LastEditors: chenbaiyu
 * @Description:
 * @FilePath: /scheduleweb/src/services/pageData.js
 */
/**
 * 服务端返回数据
 */
const PAGEDATA_KEY = '__PageData__';
// eslint-disable-next-line max-len
// window[PAGEDATA_KEY] = '{"userInfo":{"email":"zhaojingchao@meituan.com","empId":"2643031","mis":"zhaojingchao","name":"赵敬潮"}}';
// 获取服务端返回数据

const pageData = JSON.parse(window[PAGEDATA_KEY] || '{}');

try {
  pageData.lionConfig.roomTipsConfig = JSON.parse(decodeURIComponent(pageData.lionConfig.roomTipsConfig));
} catch (error) {
  console.log(error);
}

// 获取数据服务
export const PageDataService = {
  get(key) {
    return !!key && pageData[key] ? pageData[key] : pageData;
  }
};
