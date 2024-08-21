
/**
 * counter
 */
const state: StoreState.tt = {
    // 重定向到sso登入url
    loginUrl: '',
    spaceDomain: '',
    // 获取当前用户信息
    userInfo: {
        displayname: '',
        email: '',
        username: ''
    },
    userDisplayInfo: [],
    // 展示在列表页等的标题
    title: '筛选',
    // 当前环境
    env: '',
    loginType: '',
    chatId: 0,
    // 服务目录版本，根据用户上次登陆情况，预判权限
    ctiVersion: localStorage?.lastVersion ? parseInt(localStorage.lastVersion, 10) : null,
    uploadFile: false,
    uploadFileSuccess: false,
    uploadFileFail: false,
    uploadTicketId: '',
    imgUploadStatus: false,
    // 相关联系统信息
    ticketAbout: {
        ones: {
            url: '',
            id: ''
        },
        itsm: '',
        // TODO: 已流转case的链接
        case: ''
    },
    hasScore: false,
    timeData: {
        endResolveOkTime: '',
        endResponseOkTime: '',
        isEverPaused: false,
        isEverReopened: true,
        realResponse: '',
        resolveColor: '',
        responseColor: '',
        slaResolve: '',
        slaResponse: ''
    },
    guard: {
        comment: false
    },
    rgPermissionMap: {},
    userChooseCti: [],
    downloadTasks: [],
    detailPermission: {
        isWorkHour: true,
        detailOperate: {}
    },
    mySpaces: [],
    myRgs: [],
    spaceList: [],
    createEntrance: '',
    // createReferrer 枚举值 默认为'' 00 摩西 01 外部系统 02 学城
    createReferrer: '',
    inspectionInfo: {
        showInspection: false,
        isAdmin: false,
        isInspector: false
    },
    inspectionFilterTitle: '筛选',
    language: 'zh', // 默认语言为简体中文
    timeZone: 'GMT+08:00',
    timeZoneList: null
};

export default state;
