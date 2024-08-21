import { MutationTree } from 'vuex';
import * as types from '../../mutation-type';

const mutations: MutationTree<StoreState.cti> = {
    [types.GET_LOGIN_URL] (state, payload: string) {
        state.loginUrl = payload;
    },
    [types.GET_ENV] (state, payload: string) {
        state.env = payload;
    },
    [types.GET_USER_PERMISSION] (state, payload: boolean) {
        state.permission = payload;
    },
    [types.GET_USER_INFO] (state, payload: CommonTypes.UserInfoItem) {
        state.userInfo = payload;
    },
    [types.GET_SYSTEM_SETTINGS] (state, payload: CommonTypes.mapObject[]) {
        state.systemFields = payload.concat();
    },
    [types.GET_CATEGORY_TREE] (state, payload: CommonTypes.mapObject[]) {
        state.allCategoryTree = payload.concat();
    },
    setShowAllCatalogs (state, payload: boolean) {
        state.showAllCatalogs = payload;
    },
    setLanguage (state, payload: string) {
        state.language = payload;
    },
    [types.GET_USER_DISPLAY] (state, payload: CommonTypes.userDisplayItem[]) {
        state.userDisplayInfo = payload;
    },
    [types.GET_RG_ONCALL_VERSION] (state, payload: boolean) {
        state.isNewRgOncall = payload;
    }
};

export default mutations;
