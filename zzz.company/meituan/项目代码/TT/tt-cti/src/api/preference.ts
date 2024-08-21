import { service } from '../utils';

// 获取用户
export const getUserLanguage = () => {
    return service.get('/tt/1.0/preference/query');
};
