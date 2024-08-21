import { ActionTree } from 'vuex';
import * as types from '../../mutation-type';

// export interface
const actions: ActionTree<StoreState.cti, any> = {
    // 重定向到sso登入url
    getLoginUrl: ({ commit }, loginUrl) => {
        commit(types.GET_LOGIN_URL, loginUrl);
    },
    getEnv: ({ commit }, env) => {
        commit(types.GET_ENV, env);
    },
    getUserPermission: ({ commit }, permission) => {
        commit(types.GET_USER_PERMISSION, permission);
    },
    getUserInfo: ({ commit }, userInfo) => {
        commit(types.GET_USER_INFO, userInfo);
    },
    getSystemFields: ({ commit }, systemFields) => {
        commit(types.GET_SYSTEM_SETTINGS, systemFields);
    },
    getAllCategoryTress: ({ commit }, allCategoryTree) => {
        commit(types.GET_CATEGORY_TREE, allCategoryTree);
    }
};

export default actions;
