/*
 * @Description: 记录打点信息
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-08-28 19:24:49
 * @LastEditors: huangyaowei huangyaowei@meituan.com
 * @LastEditTime: 2023-04-21 10:34:55
 * @FilePath: /scheduleweb/src/utils/log.js
 */
import { PageDataService } from '@/services/pageData';

// 获取页面数据
const pageData = PageDataService.get();

export function addResError(name: string, msg: string, infos?) {
  const version = 7;
  if (window.Owl) {
    window.Owl.addError(
      {
        name: `${version}-${name}`,
        msg
      },
      {
        combo: false,
        level: 'info',
        category: 'resourceError',
        realUrl: window.location.href,
        tags: {
          userMis: pageData?.userInfo?.mis, // 用户mis号
          ...infos
        }
      }
    );
  }
}
