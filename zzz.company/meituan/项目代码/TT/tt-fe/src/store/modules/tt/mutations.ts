import { MutationTree } from 'vuex';
import * as types from '../../mutation-type';

const mutations: MutationTree<StoreState.tt> = {
    [types.GET_LOGIN_URL] (state, payload: string) {
        state['loginUrl'] = payload;
    },
    [types.GET_USER_INFO] (state, payload: CommonTypes.UserInfoItem) {
        state['userInfo'] = payload;
    },
    [types.GET_ENV] (state, payload: string) {
        state['env'] = payload;
    },
    [types.LOGIN_TYPE] (state, payload: string) {
        state['loginType'] = payload;
    },
    [types.SPACE_DOMAIN] (state, payload: string) {
        state['spaceDomain'] = payload;
    },
    [types.GET_USER_DISPLAY] (state, payload: CommonTypes.userDisplayItem[]) {
        state['userDisplayInfo'] = payload;
    },
    setTtListTitle (state, payload: string) {
        state['title'] = payload;
    },
    [types.SET_CHAT_ID] (state, payload: number) {
        state['chatId'] = payload;
    },
    [types.SET_CTI_VERSION] (state, payload: number) {
        state['ctiVersion'] = payload;
    },
    uploadFile (state, payload: boolean) {
        state['uploadFile'] = payload;
    },
    uploadFileSuccess (state, payload: boolean) {
        state['uploadFileSuccess'] = payload;
    },
    uploadFileFail (state, payload: boolean) {
        state['uploadFileFail'] = payload;
    },
    imgUploadStatus (state, payload: boolean) {
        state['imgUploadStatus'] = payload;
    },
    setUploadTicketId (state, payload: string) {
        state['uploadTicketId'] = payload;
    },
    setTicketAbout (state, payload: CommonTypes.mapObject) {
        state['ticketAbout'] = payload;
    },
    [types.SET_HAS_SCORE] (state, payload: boolean) {
        state['hasScore'] = payload;
    },
    setTimeData (state, payload: CommonTypes.mapObject) {
        state['timeData'] = payload;
    },
    [types.SET_GUARD_STATUS] (state, payload: CommonTypes.mapObject) {
        Object.keys(payload).forEach(key => {
            state['guard'][key] = payload[key];
        });
    },
    [types.GET_GUARD_STATUS] (state, payload: string) {
        return state[payload];
    },
    setRgPermissionMap (state, payload: CommonTypes.mapObject) {
        state['rgPermissionMap'] = payload;
    },
    setUserChooseCti (state, payload: number[]) {
        state['userChooseCti'] = payload;
    },
    setDownloadTask (state, payload: string[]) {
        state['downloadTasks'] = payload;
    },
    setDetailPermission (state, payload: CommonTypes.mapObject) {
        state['detailPermission'] = payload;
    },
    setMySpaces (state, payload: number[]) {
        state['mySpaces'] = payload;
    },
    setMyRgs (state, payload: number[]) {
        state['myRgs'] = payload;
    },
    setMySpaceList (state, payload: any[]) {
        state['spaceList'] = payload;
    },
    setCreateEntrance (state, payload: any[]) {
        state['createEntrance'] = payload;
    },
    setCreateReferrer (state, payload: any[]) {
        state['createReferrer'] = payload; // 00 摩西 01 外部系统 02 学城
    },
    setInspectionInfo (state, payload: any) {
        state['inspectionInfo'] = payload;
    },
    setInspectionFilterTitle (state, payload: string) {
        state['inspectionFilterTitle'] = payload;
    },
    setLanguage (state, payload: string) {
        state['language'] = payload;
    },
    setTimeZone (state, payload: string) {
        state['timeZone'] = payload;
    },
    setTimeZoneList (state, payload: any) {
        state['timeZoneList'] = payload;
    }
};

export default mutations;
