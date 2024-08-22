declare namespace CommonTypes {
    // 普通map对象
    export interface mapObject {
        [propName: string]: any;
    }
    // 目录对象
    export interface CatalogItem {
        name: string;
        active: Boolean;
        id: number;
        parentId?: number;
    }
    // RG对象
    export interface RgItem {
        name: string;
        active: Boolean;
        id: number;
        description: string;
        owner?: string;
        ownerName?: string;
        ownerDisplayName: string;
        createdAt: number;
    }
    // RG成员对象
    export interface RgUserItem {
        orgName: string;
        role: string;
        identify: string;
        displayName: string;
        bgName: string;
        type: string;
        buName: string;
        isOncall: Boolean;
        rgId: number;
        id: number;
        active?: boolean;
    }
    // 用户信息对象
    export interface UserInfoItem {
        displayname: string;
        // FIXME: add-type.vue 的模板中依赖 `displayName` 字段，但类型定义中是 `displayname`
        // 为避免 ts 编译错误，在定义的地方增加了 `displayName?` 请确认字段命名并保留一个
        displayName?: string;
        username: string;
        email: string;
        sysAdmin: boolean;
        orgId?: number;
        orgIdPath: string;
    }
    export interface triggerForm {
        name: string;
        scene: string;
        sceneId: number;
        active: boolean;
        triggerTime: string;
        sequence?: number;
        id?: number;
        itemLogic: string;
        conditionGroups: conditionGroupDo[];
        actions: actionDoItem[];
    }
    export interface conditionGroupDo {
        itemLogic: string;
        id?: number;
        parentId?: number;
        conditions: conditionDO[];
    }
    export interface conditionDO {
        fieldName: string;
        fieldPredicate: string;
        fieldValue: string;
        id?: number;
        parentId?: number;
        conditionItemStatus?: boolean;
        itemInvalidReason?: string;
    }
    export interface actionDoItem {
        fieldName: string;
        fieldAction: string;
        fieldValue: string;
        id?: number;
        parentId?: number;
        parentScene?: number;
    }
    export interface OnCallUser {
        onCallId: number;
        misId: string;
        userId: number;
    }
    export interface OnCallGroup {
        rgId: number;
        name: string;
        onCallUserList: string[];
    }
    // 已在数据库中有记录的值班小组，有 id 属性
    export interface OnCallGroupRecord extends OnCallGroup {
        id: number;
    }
    export interface OnCallRule {
        rgId: number;
        ruleCycle: string;
        ruleStart: string;
    }
    export interface RgHistoryItem {
        actTime: number;
        author: string;
        displayName: string;
        id: number;
        message: string;
        operation: string;
        sourceType: string;
    }
    export interface CtiItem {
        categoryName: string;
        categoryId: number;
        typeName: string;
        typeId: number;
        itemName: string;
        itemId: number;
    }
    export interface customField {
        name: string;
        instruction: string;
        type: number;
        inputType?: string;
        identify?: string; // 仅系统字段
        defaultValue: string;
        isRequired?: boolean;
        isHidden?: boolean;
        validator?: string;
        extraSettings?: {
            isItemHidden: boolean;
            isAssignedHidden: boolean;
            specificAssigned: boolean;
            // TODO: itemsScope 类型待确认
            itemsScope: any;
        };
        component?: any;
        required?: boolean;
        hidden?: boolean;
        editable?: boolean;
        defaultAttributes?: map[boolean]; // 仅系统字段,
        options?: CommonTypes.selectOption[]; // 仅选项,
        editable?: boolean;
        // NOTE: 配合 src/views/rg/detail/components/customForm/form/formIndex.vue 中 formatFieldSchema getter 的类型定义
        prop?: string;
        id?: number;
        setting?: any;
    }
    export interface userDisplayItem {
        username: string;
        displayName: string;
        jobStatus: number;
        avatar: string;
        isInternalUser: boolean;
    }
    export interface selectOption {
        value: string;
        isDefault: boolean;
        label?: string;
        disabled?: boolean;
    }
    export interface OrgVO {
        orgId: string;
        orgPath: string;
    }
    export interface triggerSort {
        rgId: number;
        method: string;
        eim: number;
    }
    export interface fileNode {
        inUse: boolean;
        name: string;
        id: number;
        parentId: number;
        children?: fileNode[];
    }
    export interface valueLabel {
        label: string;
        value: number | string;
    }
    export interface SpaceItem {
        createdAt?: number;
        accessLink?: string;
        accessLinkPrefix: string;
        createdBy?: string;
        orgId: number;
        formListLink?: string;
        name: string;
        id?: number;
    }
    export interface replyItem {
        id?: number;
        content: string;
        type: string;
        rgId?: number;
    }

    export interface PaginationResponse<T = any> {
        cn: number;
        pn: number;
        sn: number;
        tn: number;
        items: Array<T>;
    }

    export interface PageParams {
        cn: number;
        sn: number;
    }

    export type FaqRelationType = 'HELPDESK' | 'MOSES';
    export interface Faq {
        id: number;
        enable: boolean;
        rgId: number;
        content: string;
        title: string;
        relationType?: FaqRelationType;
    }

    export interface RgXmGroupNotifSettingDef {
        id?: number;
        rgId: number;
        sendConfig: boolean;
        sendTime: Date;
        xmGroupIds: number[];
    }
    export interface XmGroup {
        name: string;
        xmGroupId: number;
        avatarUrl: string;
        xmGroupDesc?: string;
    }

    export interface RgXmGroupNotifSettingResponse {
        rgId: number;
        sendConfig: boolean;
        sendTime: number;
        xmGroups: Array<{ xmGroupAvatarUrl: string; xmGroupId: number; xmGroupName: string }>;
    }

    export type SlaRaiseType = 'RESPONSE' | 'RESOLVE';

    export type ReceiverRole = 'LEVEL_ONE_LEADER' | 'LEVEL_TWO_LEADER' | 'RG_ADMIN';
    export interface SlaRaiseNotice {
        // 'S1' 到 'S5'
        slaLevel: string;
        slaType: SlaRaiseType;
        // 第 n 次发生
        expiredTimes: number;
        // 是否应该适配 UI 界面修改成这种形式
        noticeReceivers: {
            type: Array<ReceiverRole>;
            username: string[];
        };
        id?: number;
        receiversJoinDxGroup: boolean;
    }

    export type remindReceiversTypeItem = 'ASSIGNED'|'CC'|'LEVEL_ONE_LEADER'|'LEVEL_TWO_LEADER';
    export interface PreRemindSettingItem {
        rgId?: number;
        active?: Boolean;
        slaLevel: string;
        slaType: 'RESPONSE'|'RESOLVE';
        timeUnit: 'DAY'|'HOUR'|'MINUTE'|'SECOND';
        timeValue: number;
        remindReceiversType: Array;
    }
    export type ReceiverRoleType = remindReceiversTypeItem | 'NO_MIS';
    export interface NoticeReceiverOption {
        value: string;
        label: string;
        role: ReceiverRoleType;
        misId: string | null;
    }
}
