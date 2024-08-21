import { trackClick } from '@src/components/CommonTracker'

export namespace TTKeys {
  export const Product = 'TT'
  /** 页面标识 cid */
  export enum Page {
    /** 常规首页 */
    Home = 'c_onecloud_ruod0de4',
    /** helpdesk 首页 */
    HomeExternal = 'c_onecloud_3jspn7s9',
    /** 大象消息进到列表页 */
    HomeListFromDX = 'c_onecloud_grw707x6',
    /** 列表页 */
    HomeList = 'c_onecloud_xkgssxuj',
    /** 从大象消息直接进到详情页 */
    DetailFromDX = 'c_onecloud_if1r7fnl',
    /**详情页 */
    Detail = 'c_onecloud_cw2y372a',
    /** 创建页 */
    Create = 'c_onecloud_e3emfk5x',
    /** 从带目录链接发起创建页 */
    CreateFromUrl = 'c_onecloud_2koq4uss',
    /** 空间 */
    Space = 'c_onecloud_1zt5tehg',
    /** RG机器人 */
    RG = 'c_onecloud_7vz0ko0n'
  }

  /** 详情页点击事件类型 bid */
  export enum DetailClick {
    slaLevel = 'b_onecloud_ofbdwtcr_mc', // 设置SLA等级
    editTitle = 'b_onecloud_vzh5l9lm_mc', // 编辑标题
    editDesc = 'b_onecloud_o7nrspoz_mc', // 编辑描述
    descTab = 'b_onecloud_6w7oc5br_mc', // 点击描述tab
    chatTab = 'b_onecloud_sfvez3h0_mc', // 点击大象记录tab
    recordTab = 'b_onecloud_v1l993ue_mc', // 点击处理记录tab
    aboutTab = 'b_onecloud_9edjg6sa_mc', // 点击相关内容tab
    comment = 'b_onecloud_5cjdfyvp_mc', // 点击评论按钮
    createChat = 'b_onecloud_m8u6qtm7_mc', // 点击创建群聊按钮
    enterChat = 'b_onecloud_in01erfs_mc', // 进入群聊
    satisfy = 'b_onecloud_n4hwcbq0_mc', // 满意度评价
    assign = 'b_onecloud_ydpqbcfn_mc', // 点击流转按钮
    beginTT = 'b_onecloud_jel4fbj0_mc', // 点击开始处理按钮
    finishTT = 'b_onecloud_7edwmaz4_mc', // 点击处理完成按钮
    closeTT = 'b_onecloud_ruglimc9_mc', // 点击关闭按钮
    moreBtn = 'b_onecloud_udc6k83i_mc', // 点击更多按钮
    reopen = 'b_onecloud_0yd451uk_mc', // 点击重新处理按钮
    pauseTT = 'b_onecloud_3fof9k25_mc', // 点击暂停TT按钮
    changeType = 'b_onecloud_0emgjvos_mc', // 更改类型
    changePermission = 'b_onecloud_fvkpa9ka_mc', // 	更改保密状态
    modifyLabel = 'b_onecloud_cbqu5g4i_mc', // 添加标签
    modifyCC = 'b_onecloud_08wvy366_mc', // 修改抄送人
    modifyCustom = 'b_onecloud_o27kodov_mc', // 修改自定义表单
    customSingleTxt = 'b_onecloud_3sjzsn1i_mc', // 自定义表单-单行文本
    customMultiTxt = 'b_onecloud_kvd5759g_mc', // 自定义表单-多行文本
    customSingleSelect = 'b_onecloud_pv08ee5i_mc', // 自定义表单-下拉单选
    customMultiSelect = 'b_onecloud_avbnoidr_mc', // 自定义表单-下拉多选
    customData = 'b_onecloud_ofnya6ep_mc', // 自定义表单-日期
    searchCategory = 'b_onecloud_aiw0obem_mc', // 指派-搜索服务目录
    searchPeople = 'b_onecloud_w8nvnqa2_mc', // 指派-搜索处理人
    editCategory = 'b_onecloud_m5a9sjvj_mc', // 指派-进入服务目录edit页面
    finishAssign = 'b_onecloud_rpu10rk4_mc', // 指派-点击“完成”按钮
    cancelAssign = 'b_onecloud_kxsszrxj_mc', // 指派-点击取消按钮
    detailUploadFile = 'b_onecloud_z0f1ayil_mc' // 详情页-上传附件
  }

  export enum CreateClick {
    commitNormal = 'b_onecloud_v46qlz9a_mc', // 普通创建
    commitCustom = 'b_onecloud_tqyttmjz_mc', // 自定义表单创建
    slaLevel = 'b_onecloud_6hkmf7lb_mc', // 等级
    reporter = 'b_onecloud_sqswehte_mc', // 发起人
    switchPrivate = 'b_onecloud_ik9t4v5l_mc', // 保密
    cc = 'b_onecloud_pb57sppo_mc', // 抄送人
    type = 'b_onecloud_sfsz2r91_mc', // 类型
    label = 'b_onecloud_0lipaxog_mc', // 标签
    city = 'b_onecloud_1mbswg1g_mc', // 城市

    commitNormalSuccess = 'b_onecloud_fd0w53ye_mc', // 普通创建成功
    commitNormalFail = 'b_onecloud_2gcuvi2s_mc', // 普通创建失败
    commitCustomSuccess = 'b_onecloud_an04cl3l_mc', // 自定义创建成功
    commitCusomFail = 'b_onecloud_7by6mknq_mc', // 自定义创建失败
    createUploadFile = 'b_onecloud_2cijrfc7_mc' // 发起页-上传附件
  }
}

/** track 详情页点击 */
export function ttTrackDetailClick(bid: string) {
  trackClick(bid, TTKeys.Page.Detail, TTKeys.Product, {})
}

/** track 发起页点击 */
export function ttCreateTTClick(bid: string) {
  trackClick(bid, TTKeys.Page.Create, TTKeys.Product, {})
}
