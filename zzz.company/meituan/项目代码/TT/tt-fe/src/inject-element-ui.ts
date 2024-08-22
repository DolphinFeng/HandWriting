import 'element-ui/lib/theme-chalk/icon.css';
// 日历组件中 按钮样式需要额外导入
import 'element-ui/lib/theme-chalk/button.css';
import locale from 'element-ui/lib/locale';
import en from 'element-ui/lib/locale/lang/en';
import hk from 'element-ui/lib/locale/lang/zh-TW';
import zh from 'element-ui/lib/locale/lang/zh-CN';

export const changeLanguageForElement = (language) => {
    switch (language) {
        case 'zh-HK':
            locale.use(hk);
            break;
        case 'en':
            locale.use(en);
            break;
        default:
            locale.use(zh);

    }
};
