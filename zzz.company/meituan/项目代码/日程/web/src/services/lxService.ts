/*
 * @Description: 埋点功能
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-10-14 20:26:22
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-10-15 16:28:07
 * @FilePath: /scheduleweb/src/services/lxService.ts
 */

import { moduleClick, moduleView } from 'onejs/lx';
import { PageDataService } from '@/services/pageData';

const getMis = () => {
  const pageData = PageDataService.get();
  return pageData?.userInfo?.mis;
};

export const addModuleClick = (mid: string, infos?) => {
  moduleClick(mid, {
    userMis: getMis(),
    ...infos
  });
};

export const addModuleView = (mid: string, infos?) => {
  moduleView(mid, {
    userMis: getMis(),
    ...infos
  });
};
