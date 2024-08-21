export const TicketStatus = [
    { key: 'ticket_status_not_handle', value: '未处理' },
    { key: 'ticket_status_processing', value: '处理中' },
    { key: 'ticket_status_solved', value: '已解决' },
    { key: 'ticket_status_closed', value: '已关闭' },
    { key: 'ticket_status_reopen', value: '重新打开' },
    { key: 'ticket_status_pause', value: '暂停' }
];
export const TicketSla = ['S1', 'S2','S3', 'S4', 'S5'];
export const TicketType = [
    { key: 'ticket_type_malfunction', value: '服务故障' },
    { key: 'ticket_type_event', value: '事件' },
    { key: 'ticket_type_defect', value: '缺陷' },
    { key: 'ticket_type_demand', value: '需求' },
    { key: 'ticket_type_question', value: '问题咨询' },
    { key: 'ticket_type_suggestion', value: '建议' }
];
export const AssociateSystem = [
    { key: 'associate_system_ones', value: '转入ONES' },
    { key: 'associate_system_case', value: '转入CASE' }
];
export const TimeoutSituation = [
    { key: 'timeout_situation_response', value: '响应超时' },
    { key: 'timeout_situation_handle', value: '处理超时' },
    { key: 'timeout_situation_almost', value: '即将超时' }
];
export const TicketRGHandleType = [{
    label: 'ticket_handle_type_service_handle',
    value: 'assigned',
    disabled: false
}, {
    label: 'ticket_handle_type_service_transfer',
    value: 'transferred',
    disabled: false
}];
export const TicketSpaceHandleType = [{
    label: 'ticket_handle_type_space_handle',
    value: 'assigned',
    disabled: false
}, {
    label: 'ticket_handle_type_space_transfer',
    value: 'transferred',
    disabled: false
}];
export const AllowedFileType = [
    'image/jpeg',
    'text/plain',
    'image/png',
    'application/vnd.ms-powerpoint',
    'application/vnd.ms-excel',
    'application/msword',
    'audio/mpeg',
    'audio/mp4',
    'video/mp4'
];
export const TicketStateMap = {
    '处理中': {
        text: 'ticket_state_text_doing',
        cb: 'doing',
        type: 'primary',
        bid: 'b_onecloud_xwsob4e9_mc'
    },
    '挂起中': {
        text: 'ticket_state_text_pend',
        cb: 'pend',
        type: '',
        bid: 'b_onecloud_23a6spyh_mc'
    },
    '暂停中': {
        text: 'ticket_state_text_pause',
        cb: 'pause',
        type: '',
        bid: 'b_onecloud_23a6spyh_mc'
    },
    '已解决': {
        text: 'ticket_state_text_done',
        cb: 'done',
        type: 'primary',
        bid: 'b_onecloud_ndvaobh8_mc'
    },
    '已关闭': {
        text: 'ticket_state_text_close',
        cb: 'close',
        type: '',
        bid: 'b_onecloud_758znuj7_mc'
    },
    '重新打开': {
        text: 'ticket_state_text_retry',
        cb: 'retry',
        type: '',
        bid: 'b_onecloud_hyr05fut_mc'
    }
};
export const LevelTips = {
    S1: 'level_tip_S1',
    S2: 'level_tip_S2',
    S3: 'level_tip_S3',
    S4: 'level_tip_S4',
    S5: 'level_tip_S5'
};
export const TimeTypes = {
    MINUTE: 'time_type_minute',
    HOUR: 'time_type_hour',
    DAY: 'time_type_day',
    WEEK: 'time_type_week'
};
export const STATE_MAP_EN = {
    '已解决': 'done',
    '暂停中': 'pending',
    '挂起中': 'pending',
    '未处理': 'todo',
    '重新打开': 'reopen',
    '处理中': 'doing',
    '处理中-ONES': 'doing',
    '处理中-CASE': 'doing',
    '已关闭': 'close'
};
export const STATE_MAP_CN = {
    'todo': 'dashboard_status_map_todo',
    'pause': 'dashboard_status_map_pause',
    'reopen': 'dashboard_status_map_reopen',
    'doing': 'dashboard_status_map_doing'
};
export const STATE_TITLE_MAP = {
    'done': 'state_title_done',
    'close': 'state_title_close',
    'pause': 'state_title_pause',
    'retry': 'state_title_retry'
};
export const STATE_FORM_ITEM = {
    'done': {
        select: '',
        text: 'state_form_item_done_text',
        archive: 'state_form_item_done_archive',
        label: 'state_form_item_done_label'
    },
    'close': {
        select: 'state_form_item_close_select',
        text: 'state_form_item_close_text',
        archive: 'state_form_item_close_archive',
        label: 'state_form_item_close_label'
    },
    'pause': {
        select: 'state_form_item_pause_select',
        text: 'state_form_item_pause_text',
        archive: '',
        label: ''
    },
    'retry': {
        select: '',
        text: 'state_form_item_retry_text',
        archive: '',
        label: ''
    }
};
export const TicketSlaIcon = {
    S1: 'icon-feichangjinji1',
    S2: 'icon-jinji',
    S3: 'icon-gao',
    S4: 'icon-zhong',
    S5: 'icon-di'
};
export const ReopenTimeMap = {
    reopenNumber: '重新打开数'
};
export const ResolveTimeMap = {
    workResolve: '工作时间解决时长'
};
export const ResponseTimeMap = {
    workResponse: '工作时间响应时长'
};
export const ResponseSuccessRateMap = {
    responseSuccessRate: '响应合格率'
};
export const ResolveSuccessRateMap = {
    resolveSuccessRate: '解决合格率'
};
export const TimeoutMap = {
    timeoutNumber: '超时数'
};
export const Sla2CN = {
    S1: 'S1_label',
    S2: 'S2_label',
    S3: 'S3_label',
    S4: 'S4_label',
    S5: 'S5_label'
};
export const onesIssueTypes = ['REQUIREMENT', 'DEVTASK', 'DEFECT'];
export const onesIssueMap = {
    REQUIREMENT: 'ones_issue_requirement',
    DEVTASK: 'ones_issue_task',
    DEFECT: 'ones_issue_defect'
};

export const SLA_RULE_DESC = {
    S1: 'sla_rule_desc_s1',
    S2: 'sla_rule_desc_s2'
};
export const SLA_MOBILE_COLOR = {
    S1: '#FF5F57',
    S2: '#F5BA31',
    S3: '#24BD78',
    S4: '#1C6CDC',
    S5: '#666666'
};

export const LIST_PAGE_TILTE_MAP = {
    mine: 'list_page_title_mine',
    favor: 'list_page_title_favor',
    createdBy: 'list_page_title_createdBy',
    all: 'list_page_title_all',
    rg: 'list_page_title_rg',
    space: 'list_page_title_space',
    todo: 'list_page_title_todo',
    joinBy: 'list_page_title_joinBy'
};

export const DEFAULT_AVATAR = '//s3plus.sankuai.com/v1/mss_4a5c70e8b289484393a22a82f4c3ed40/static-source/default-avatar.png';

export const DX_MESSAGE_TYPE = {
    'text': {
        cn_name: 'dx_message_type_text',
        detail: true
    },
    'audio': {
        cn_name: 'dx_message_type_audio',
        detail: false
    },
    'calendar': {
        cn_name: 'dx_message_type_calendar',
        detail: false
    },
    'emotion': {
        cn_name: 'dx_message_type_emotion',
        detail: true
    },
    'event': {
        cn_name: 'dx_message_type_event',
        detail: false
    },
    'file': {
        cn_name: 'dx_message_type_file',
        detail: false
    },
    'gps': {
        cn_name: 'dx_message_type_gps',
        detail: false
    },
    'image': {
        cn_name: 'dx_message_type_image',
        detail: true
    },
    'link': {
        cn_name: 'dx_message_type_link',
        detail: false
    },
    'multilink': {
        cn_name: 'dx_message_type_multilink',
        detail: false
    },
    'vcard': {
        cn_name: 'dx_message_type_vcard',
        detail: false
    },
    'video': {
        cn_name: 'dx_message_type_video',
        detail: false
    },
    'cancel': {
        cn_name: 'dx_message_type_cancel',
        detail: false
    }
};
export const TopNavTabsWithQuality = [
    {
        value: 'handle',
        label: 'top_nav_tab_handle_tt',
        href: '',
        lx: 'b_techportal_xez22q4m_mc'
    }, {
        value: 'filter',
        label: 'top_nav_tab_search_tt',
        lx: 'b_techportal_wpvh89ul_mc'
    }, {
        value: 'quality',
        label: 'top_nav_tab_inspect_tt',
        lx: 'b_techportal_wnw3w54g_mc'
    }, {
        value: 'statisticNew',
        label: 'top_nav_tab_analyze',
        lx: 'b_techportal_4wl6twbc_mc'
    }, {
        value: 'cti',
        label: 'top_nav_tab_cti',
        lx: 'b_techportal_vsrra02f_mc'
    }
];
export const TopNavTabsNew = [
    {
        value: 'handle',
        label: 'top_nav_tab_handle_tt',
        href: '',
        lx: 'b_techportal_xez22q4m_mc'
    }, {
        value: 'filter',
        label: 'top_nav_tab_search_tt',
        lx: 'b_techportal_wpvh89ul_mc'
    }, {
        // 新版统计分析
        value: 'statisticNew',
        label: 'top_nav_tab_analyze',
        lx: 'b_techportal_4wl6twbc_mc'
    }, {
        value: 'cti',
        label: 'top_nav_tab_cti',
        lx: 'b_techportal_vsrra02f_mc'
    }
];
export const TopNavTabsOutside = [
    {
        value: 'outsideMyTT',
        label: 'top_nav_question_i_init',
        lx: 'b_techportal_h1tx5riv_mc',
        icon: 'icon-personal1',
        route: '/ticket/handle?filter=createdBy'
    }, {
        value: 'outsideAssigned',
        label: 'top_nav_question_assign_to_me',
        lx: 'b_techportal_ru8sawl0_mc',
        icon: 'icon-assign',
        route: '/ticket/list?filter=todo'
    }
];
export const TopnavOnlyMy = [{
    value: 'outsideMyTT',
    label: 'top_nav_question_i_init',
    lx: 'b_techportal_h1tx5riv_mc'
}];
export const TopNavTabsSpace = [
    {
        value: 'spaceQuestion',
        label: 'top_nav_my_question',
        lx: 'b_techportal_4f3fgf3e_mc'
    }, {
        value: 'spaceAsk',
        label: 'top_nav_want_question',
        lx: 'b_techportal_slq7tjc6_mc'
    }
];
export const DetailTabs = [
    {
        value: 'comment',
        label: 'moses_tab_comment'
    }, {
        value: 'record',
        label: 'moses_tab_record'
    }
];
export const DetailTabsMoses = [
    {
        value: 'comment',
        label: 'moses_tab_comment'
    }, {
        value: 'record',
        label: 'moses_tab_record'
    }, {
        value: 'moses',
        label: 'moses_tab_chat'
    }
];
export const LanguageType = {
    '中文简体': 'zh',
    '中文繁體': 'zh-HK',
    'English(US)': 'en'
};
export const TimeZoneType = {
    'en': {
        'Asia/shanghai': 'GMT+08:00',
        'Asia/Riyadh': 'GMT+03:00'
    },
    'zh': {
        '亚洲/上海': 'GMT+08:00',
        '亚洲/利雅得': 'GMT+03:00'
    },
    'zh-HK': {
        '亞洲/上海': 'GMT+08:00',
        '亞洲/利雅得': 'GMT+03:00'
    }
};
export const Catalogs = ['category', 'type', 'item'];
export const NoCatalog = {
    categoryName: '找不到合适的目录',
    categoryId: 14,
    typeName: '找不到合适的目录',
    typeId: 172,
    itemName: '找不到合适的目录',
    itemId: 524,
    rgId: 342,
    rgName: 'MTMT'
};
export const BaseCti = {
    categoryName: '',
    categoryId: 0,
    typeName: '',
    typeId: 0,
    itemName: '',
    itemId: 0,
    rgId: 0,
    rgName: ''
};
export const CreateTip = {
    'name': '<p>对TT内容的概括，最多支持60字</p><p>建议您的标题中包含具体的系统、页面和问题，方便处理方快速定位</p><p>例如：TT系统的发起TT页面无法增加抄送人</p>',
    'desc': '<p>对您遇到问题进行更细致的说明，便于处理方掌握情况。</p><p>建议您描述包含以下步骤，以便帮助处理方快速了解情况：</p><p>1.系统名称</p><p>2.具体问题</p><p>3.问题所在页面/模块</p><p>4.操作路径</p><p>5.问题截图</p><p>6.具体操作人</p>',
    'attachment': '<p>文件大小不超过50M，可上传的文件类型<p><p>图片：</p><p>.jpg,.jpeg,.png,.gif,.bmp,.wbmp,.webp,.tif,.psd</p><p>文本：</p><p>.svg,.js,.jsx,.json,.css,.less,.xml,.thrift,.php,.java,.go,.log</p><p>压缩文件：</p><p>.apk,.zip,.gz,.tgz,.gzip,.rar,.7z</p><p>多媒体文件：</p><p>.mp3,.mp4,.avi,.mkv,.3gp,.mov</p><p>文档文件：</p><p>.xmind,.xlsx,.xls,.pptx,.ppt,.docx,.doc,.key,.csv,.db,.txt,.pages,.eml,.rp,.pdf,.crash</p>'
};
export const HrefLinkMap = {
    'handle': '/ticket/handle?filter=todo',
    'filter': '/ticket/list',
    'statisticNew': '/ticket/statistic/new',
    'cti': '',
    'spaceQuestion': '',
    'spaceAsk': '',
    'outsideMyTT': '/ticket/handle?filter=createdBy',
    'outsideAssigned': '/ticket/list?filter=todo',
    'outsideAsk': '/ticket/create'
};
export const CommonProblems = [{
    link: 'https://km.sankuai.com/collabpage/2218074023',
    title: 'trouble_tracker_tt_quick_start_manual'
}, {
    link: 'https://km.sankuai.com/collabpage/510552983',
    title: 'organize_different_entry_pages_for_tt'
}, {
    link: 'https://km.sankuai.com/collabpage/1116462388',
    title: 'as_the_initiator_of_the_problem_how_to_initiate_tt'
}, {
    link: 'https://km.sankuai.com/collabpage/1116437168',
    title: 'as_the_problemsolving_party_how_to_handle_tt'
}, {
    link: 'https://km.sankuai.com/collabpage/1540839121',
    title: 'tt_time_calculation_logic8fp'
}, {
    link: 'https://km.sankuai.com/collabpage/1045757620',
    title: 'introduction_to_common_functions'
}];
export const ticketNumToSidebar = {
    'todo': 'unresolved',
    'mine': 'assigned',
    'favor': 'cc',
    'createdBy': 'reporter',
    'joinBy': 'join'
};

export const SlaOptions = [{
    value: 'S1',
    label: 'S1_label',
    instruction: 'S1_instruction'
}, {
    value: 'S2',
    label: 'S2_label',
    instruction: 'S2_instruction'
}, {
    value: 'S3',
    label: 'S3_label',
    instruction: 'S3_instruction'
}, {
    value: 'S4',
    label: 'S4_label',
    instruction: 'S4_instruction'
}, {
    value: 'S5',
    label: 'S5_label',
    instruction: 'S5_instruction'
}];
export const attachmentIconMap = {
    'mp4': 'icon-mov1',
    'mov': 'icon-mov1',
    'pdf': 'icon-pdf',
    'ppt': 'icon-ppt',
    'doc': 'icon-word',
    'docx': 'icon-word',
    'key': 'icon-keynot',
    'pages': 'icon-pages',
    'xlsx': 'icon-excel',
    'numbers': 'icon-numbers',
    'default': 'icon-text'
};
export const unknownCommontText = `<p><span style="color: rgba(0, 0, 0, 0.87);">尊敬的用户您好，您当前提交的问题选择目录不准确，无法流转到正确的处理团队，请您重新选择正确的目录进行问题发起。</span></p><p><br /></p><p><span style="color: rgba(0, 0, 0, 0.87);">重要提示：为避免耽误您的事情，紧急或非常紧急工单请立即选择其他处理方式进行并行处理。</span></p><p><br /></p><p><span style="color: rgba(0, 0, 0, 0.87);">同时TT团队会根据您当前提交的信息在每日18-20点期间为您进行尝试流转，如仍无法找到正确的处理团队会将您的问题记录在后续不断优化发起目录，感谢您使用TT系统。</span></p>`;

export const CreateEntranceMap = {
    'ticket_create': '00',
    'ticket_custom': '02',
    'ticket_cid': '01',
    'space_create': '03',
    'passport_create': '04'
};

export const DataExportFieldsMap = {
    'BASE': 'data_export_field_base',
    'PEOPLE': 'data_export_field_people',
    'TIME': 'data_export_field_time',
    'DOWNSTREAMSYS': 'data_export_field_down_stream',
    'RESULT': 'data_export_field_result',
    'TRANSFER': 'data_export_field_transfer'
};
export const OncallWeekdayList = [
    { label: 'week_list_sunday', value: '0' },
    { label: 'week_list_monday', value: '1' },
    { label: 'week_list_tuesday', value: '2' },
    { label: 'week_list_wednesday', value: '3' },
    { label: 'week_list_thursday', value: '4' },
    { label: 'week_list_friday', value: '5' },
    { label: 'week_list_saturday', value: '6' }
];
