declare namespace StoreState {
    export interface tt {
        loginUrl: string,
        userInfo: CommonTypes.UserInfoItem,
        userDisplayInfo: CommonTypes.userDisplayItem[],
        title: string,
        env: string,
        loginType: string,
        chatId: number,
        isAgent: boolean,
        hasScore: boolean,
        timeData: CommonTypes.mapObject,
        rgPermissionMap: CommonTypes.mapObject,
        userChooseCti: number[],
        downloadTasks: string[],
        spaceList: any[]
    }
}

declare namespace StoreAction {}

