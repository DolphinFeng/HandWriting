declare namespace CommonTypes {
    // 普通map对象
    export interface mapObject {
        [propName: string]: any
    }
    // ticket创建
    export interface TicketCreateItem {
        name: string,
        description?: string,
        ticketType: string,
        categoryName: string,
        categoryId: number,
        typeName: string,
        typeId: number,
        itemName: string,
        itemId: number,
        assigned: string,
        cc?: string[],
        reporter?: string,
        sla: string,
        permission: boolean
    }
    // ticket筛选项
    export interface TicketFilterItem {
        name?: string;
        cc: string;
        ticketState?: string[],
        sla?: string[],
        ticketType?: string[],
        createdAtStart?: number,
        createdAtEnd?: number,
        timePeriod?: number[],
        category?: string,
        type?: string,
        item?: string,
        createdBy?: string[],
        assigned?: string[],
        rgIds?: number | number[],
        spaceIds?: number | number[],
        labels?: number[],
        ctiNameList?: DefaultObject[],
        archiveIds?: number | null,
        labelsRelation?: number,
        reporterOrgIds?: OrgItem[]
        associateSystem?: string[],
        timeoutSituation?: string[],
        ticketHandleType?: string[],
        handlers?: string[]
    }
    // ORG对象
    export interface OrgItem {
        orgId: string,
        orgPath: string
    }
    // 目录对象
    export interface CatalogItem {
        name: string,
        active: Boolean,
        id: number,
        parentId?: number
    }
    // 用户信息对象
    export interface UserInfoItem {
        displayname?: string,
        username: string,
        email?: string,
        avatar: string,
        sysAdmin: boolean,
        tenantId: string,
        buId: number,
        bgId: number,
        guideCreateLink?: string,
        guideType: string
    }
    // RG成员对象
    export interface RgUserItem {
        orgName: string,
        role: string,
        identify: string,
        displayName: string,
        bgName: string,
        type: string,
        buName: string,
        isOncall: Boolean,
        rgId: number,
        id: number
    }
    // 我的RG对象
    export interface MyRgItem {
        createdAt: number,
        ownerName: string,
        isOwner: Boolean,
        name: string,
        ownerDispalyName: string,
        id: number
    }
    //  新操作记录对象
    export interface NewOptionRecordItem {
        "actTime": number,
        "actor": {
          "avatar": string,
          "mis": string,
          "name": string
        },
        "groupId": number,
        "identify": string,
        "message": string,
        "module": string,
        "resource": string
    }
    // 操作记录和大象群消息对象
    export interface OptionRecordItem {
        ticketId: number,
        actor: string,
        actTime: number,
        id: number,
        type: string,
        message: string,TicketFilterItem
        avatar: string
    }
    export interface MosesRecordItem {
        sendTime: number,
        content: string,
        userType: number
    }
    // 创建ticket对象
    export interface CreateTicketItem {
        name: string,
        desc?: string,
        ticketType: string,
        categoryName: string,
        categoryId: number,
        typeName: string,
        typeId: number,
        itemName: string,
        itemId: number,
        assigned: string,
        rgId: number,
        cc?: string[],
        reporter?: string,
        closedDesc?: string,
        sla: string,
        rgId: number,
        permission: boolean,
        labels: [],
        sourceId?: number,
        city: string
    }
    // 操作记录对象
    export interface CountListItem {
        dateTime: string,
        createdNumber: number,
        resolvedNumber: number,
        closedNumber: number,
        handleNumber: number,
        pausedNumber: number,
        reopenNumber: number,
        totalNumber: number,
        transferNumber: number,
        unhandleNumber: number,
    }
    // 发起方统计 item
    export interface InitiatorGroupItem {
        org: string,
        orgNumber: number
    }
    // RG查询组对象
    export interface GroupItem {
        name: string,
        number: number,
        percent: number
    }
    // 时长统计
    export interface SumTimeItem {
        dateTime: string,
        time: number,
        type: string,
        unit: string
    }
    // 合格率统计（格式为小数，如 0.4）
    export interface SumRateItem {
        dateTime: string,
        responseSuccessRate?: number,
        resolveSuccessRate?: number
    }
    // 工作时间响应 合格率统计（格式为百分比%，如合格率为 40%， Rate 的值为 40）
    export interface ResponseSuccessRateItem {
        dateTime: string,
        responseSuccessRate: number,
    }
    // 工作时间解决 合格率统计（格式为百分比%)
    export interface ResolveSuccessRateItem {
        dateTime: string,
        resolveSuccessRate: number
    }
    export interface TimeoutCountItem {
        type: string,
        dateTime: string,
        timeoutNumber: number
    }

    // 用户信息
    export interface userDisplayItem {
        username: string,
        displayName: string,
        jobStatus: number,
        avatar: string,
        isInternalUser: boolean
    }
    // 重新打开统计对象
    export interface ReopenListItem {
        createdNumber: number
        dateTime: string,
        reopenNumber: number,
        reopenOccurRate: number
    }
    // 响应时长统计对象
    export interface ReactTimeItem {
        day: string,
        count: number
    }
    export interface DefaultObject {
        [propName: string]: any
    }
    export interface navItem {
        label: string,
        icon: string,
        value: string
    }
    export interface keyValue {
        label: string,
        value: string
    }
    export interface cascaderValue {
        label: string,
        value: number | CommonTypes.mapObject,
        children?: cascaderValue[],
        showChildren?: cascaderValue[]
    }
    export interface fileNode {
        inUse: boolean,
        name: string,
        id: number,
        parentId: number,
        children?: fileNode[]
    }
    export interface ctiItem {
        categoryId: number,
        categoryName: string,
        typeId: number,
        typeName: string,
        itemId: number,
        itemName: string,
        rgId?: number,
        rgName?: string,
        sendXmNotify?: boolean
    }
    export interface ctiTreeItem {
        ticketRelated?: boolean,
        defaultCti?: ctiItem[],
        children?: ctiTreeItem[],
        parentId?: number,
        categoryId?: number,
        categoryName?: string,
        typeId?: number,
        typeName?: string,
        itemId?: number,
        itemName?: string,
        rgId?: number,
        rgName?: string
    }
    export interface SpaceItem {
        createdAt?: number,
        accessLink?: string,
        accessLinkPrefix: string,
        createdBy?: string,
        orgId: number,
        formListLink?: string,
        name: string,
        id?: number
    }
    export interface GuessAsk {
        title: string,
        color: string,
        icon: string
        ctiName: ctiItem
    }
    export interface HistoryReport {
        ctiName: {
            categoryId: number,
            typeId: number,
            itemId: number
        },
        name: string,
        ticketId: number
    }
    export interface CaseIssue {
        ticketId: number;
        // businessLineId: number;
        assigned: string;
        reporter: string;
        sla: string;
        name: string;
        desc: string;
        attachmentList: any[];
        labelList: any[];
        ccUserList: any[];
        productLineId: number;
        productLineDisplayName: string;
    }
    export interface CustomField {
        id: number;
        instruction?: string;
        inputType?: string;
        identify?: string;
        isHidden: boolean;
        isRequired: boolean;
        name: string;
        type: number;
        options: mapObject[];
        extraSettings?: mapObject;
    }
}