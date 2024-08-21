import { service } from '../utils';

// 获取用户语言设置
export const setUserLanguage = (params: {
    misId?: string,
    locale: string,
    timeZone: string
}) => {
    return service.post('/tt/1.0/preference/userSetting/set', { ...params });
};

// 获取用户
export const getUserLanguage = () => {
    return service.get('/tt/1.0/preference/query');
};

export const getLanguageOptions = () => {
    return service.get('/tt/1.0/preference/local');
};

export const getTimeZoneOptions = () => {
    return service.get('/tt/1.0/preference/timezone');
};
