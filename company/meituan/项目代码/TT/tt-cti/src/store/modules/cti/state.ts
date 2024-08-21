
/**
 * counter
 */
const state: StoreState.cti = {
    // 重定向到sso登入url
    loginUrl: '',
    env: '',
    permission: true,
    language: 'zh', // 默认语言为简体中文
    // 获取当前用户信息
    userInfo: {
        displayname: '',
        email: '',
        username: '',
        sysAdmin: false,
        orgId: null,
        orgIdPath: ''
    },
    systemFields: [],
    allCategoryTree: [],
    userDisplayInfo: [],
    showAllCatalogs: false,
    isNewRgOncall: false
};

export default state;
