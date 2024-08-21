/*
 * @Description: 统一文件引入
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-06-03 20:14:07
 * @LastEditors: chenbaiyu
 * @LastEditTime: 2023-01-12 16:14:16
 * @FilePath: /scheduleweb/src/global.js
 */

/**
 * 资源引入
 */
import '@/asserts/styles/global.less';
import '@/asserts/dxcalendar/dxcalendar.css';
import '@/asserts/icomoon/style.css';
import { i18nClient } from '@sailor/i18n-web';
import resources from '@/asserts/locales/resources';
import { locales } from '@/utils/environment';

i18nClient.init({
  fallbackLng: 'zh',
  resources,
  interpolation: {
    escapeValue: false
  },
  react: {
    useSuspense: false
  }
});

i18nClient.changeLanguage(locales);
