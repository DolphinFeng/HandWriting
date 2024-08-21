declare namespace StoreState {
    export interface cti {
        loginUrl: string;
        language: string;
        userInfo: CommonTypes.UserInfoItem;
        env: string;
        permission: boolean;
        systemFields: CommonTypes.mapObject[];
        allCategoryTree: CommonTypes.mapObject[];
        userDisplayInfo: CommonTypes.mapObject[];
        showAllCatalogs: boolean;
        isNewRgOncall: boolean;
    }
}

declare namespace StoreAction {}
