import { ActionTree } from 'vuex';
import * as types from '../../mutation-type';

// export interface
const actions: ActionTree<StoreState.tt, any> = {
    // 重定向到sso登入url
    getLoginUrl: ({ commit }, loginUrl) => {
        commit(types.GET_LOGIN_URL, loginUrl);
    },
    getUserInfo: ({ commit }, userInfo) => {
        commit(types.GET_USER_INFO, userInfo);
    },
    getEnv: ({ commit }, env) => {
        commit(types.GET_ENV, env);
    },
    userDisplayInfo: ({ commit }, userDisplayInfo) => {
        commit(types.GET_USER_DISPLAY, userDisplayInfo);
    },
    setChatId: ({ commit }, setChatId) => {
        commit(types.SET_CHAT_ID, setChatId);
    },
    setCtiVersion: ({ commit }, version) => {
        commit(types.SET_CTI_VERSION, version);
    }
};

export default actions;
