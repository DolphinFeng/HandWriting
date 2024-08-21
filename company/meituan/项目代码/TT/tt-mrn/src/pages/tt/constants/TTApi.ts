import { DomainType, getKey } from '@common/helpers/api'
import { AppName } from '@src/common/helpers/app'
import {
  Response,
  Label,
  UploadResponse,
  UserList,
  ArchiveInfo,
  RgArchiveInfo,
  ArchiveChildren,
  ArchiveSearchResult,
  RgPermission,
  TTUserInfo
} from '@tt/constants/TTServiceModule'
import KNB from '@mrn/mrn-knb'
import { Platform } from '@mrn/react-native'
import { get, post, put, del } from '@src/common/helpers/request'

export const ttGet = (url, params, extra?) => {
  return get(url, params, extra, false)
}
export const ttPost = (url, params, data, contentType?, extra?) => {
  return post(url, params, data, contentType, extra, false)
}
export const ttPut = (url, params, data, extra?) => {
  return put(url, params, data, extra, false)
}
export const ttDel = (url, params, data, extra?) => {
  return del(url, params, data, extra, false)
}
export const cGet = (url, params, extra?) => {
  return get(url, params, extra, true)
}
export const cPost = (url, params, data, contentType?, extra?) => {
  return post(url, params, data, contentType, extra, true)
}
export const cPut = (url, params, data, extra?) => {
  return put(url, params, data, extra, true)
}
export const cDel = (url, params, data, extra?) => {
  return del(url, params, data, extra, true)
}

/**
 * ticket相关接口
 *
 */

// 创建ticket
export const createTicket = (params: {
  name: string
  desc?: string
  ticketType: string
  categoryName: string
  categoryId: number
  typeName: string
  typeId: number
  itemName: string
  itemId: number
  assigned: string
  cc?: string[]
  reporter?: string
  sla: string
  entranceSource?: string
}) => {
  return ttPost('/api/tt/1.0/ticket', {}, params)
}
// 查询ticket列表
export const getTicketList = (
  cn: number,
  sn: number,
  params?: {
    state?: string
    sla?: string
    ticketType?: string
    createdAtStart?: number
    createdAtEnd?: number
    categoryName?: string
    typeName?: string
    itemName?: string
    createdBy?: string
    assigned?: string
    rgIds?: number[]
    name?: string
    handlers?: []
  }
) => {
  return ttPost('/api/tt/1.0/ticket/filter/query', { cn: cn, sn: sn }, params)
}

/** 获取我的流转列表  */
export const getTicketMyJoinList = (cn: number, sn: number) => {
  return ttGet('/api/tt/1.0/ticket/filter/who/join', { cn: cn, sn: sn })
}

// 按name查询ticket
export const getTicketByName = (keyword: string, cn?: number, sn?: number) => {
  return ttGet('/api/tt/1.0/ticket/keyword/query', {
    keyword: keyword,
    cn: cn,
    sn: sn
  })
}
// 上传附件
export const uploadAttachFiles = (params: any, data) => {
  return ttPost('/api/tt/1.0/file/upload', params, data)
}
// 发起页描述上传附件
export const uploadCreateDescFiles = (params: any, data) => {
  return ttPost('/api/tt/1.0/file/upload/desc', params, data)
}
// 查询ticket详情
export const getTicketDetail = (ticketId: number) => {
  return ttGet(`/api/tt/1.0/ticket/${ticketId}`, {})
}
// 获取工作流
export const getNextState = (ticketId: number) => {
  return ttGet(`/api/tt/1.0/ticket/${ticketId}/next/state`, {})
}
// 获取处理记录列表
export const getOptionRecord = (
  ticketId: number,
  params: {
    cn: number
    sn: number
  }
) => {
  return ttGet(`/api/tt/1.0/history/${ticketId}`, params)
}
// 获取评论记录
export const getCommentRecord = (ticketId: number, cn: number, sn: number) => {
  return ttGet(`/api/tt/1.0/comment/${ticketId}`, { cn: cn, sn: sn })
}
// 评论创建
export const pushComment = (params: {
  commentType: string
  text: string
  repliedId: number
  parentId: number
  repliedMis: string
  ticketId: number
  toUsers: string[]
}) => {
  return ttPost('/api/tt/1.0/comment', {}, params)
}
// 评论删除
export const deleteComment = (ticketId: number, commentId: number) => {
  return ttDel(`/api/tt/1.0/comment/delete/${ticketId}/${commentId}`, {}, {})
}
// 更新ticket
export const updateTicket = (
  ticketId: number,
  params?: {
    sla?: string
    slaChangeReason?: string
    assigned?: string
    categoryName?: string
    categoryId?: number
    typeName?: string
    typeId?: number
    itemName?: string
    itemId?: number
    stage?: string
    resolution?: string
    closedReason?: string
    closedDesc?: string
    pendingReason?: string
    ticketType?: string
    permission?: string // public private
    state?: string
    name?: string
    desc?: string
    labels?: number[]
    cc?: string[]
    reopenReason?: string
    archiveId?: string
    appointAssigned?: boolean
    inviteNewAssigned?: boolean
    customStatusId: string // 自定义状态
    customStatusDisplayName: string // 自定义状态展示名
  }
) => {
  return ttPut(`/api/tt/1.0/ticket/update/${ticketId}`, {}, params)
}
// 附件下载
export const downloadAttachment = (params: {
  fileName: string
  ticketId: number
}) => {
  return ttGet('/api/tt/1.0/file/download', { params })
}
// 附件删除
export const deleteAttachment = (attachmentId: number) => {
  return ttDel(`/api/tt/1.0/file/${attachmentId}/delete`, {}, {})
}
// 设置协助RG
export const setRgConfig = (params: {
  name: string
  rgId: number
  assistRgs: any
}) => {
  return ttPost('/api/tt/1.0/assist/rg/setting', {}, params)
}
// 设置SLA
export const setSlaConfig = (params: any[]) => {
  return ttPost('/api/tt/1.0/sla/setting', {}, params)
}
// SLA设置查询
export const getSlaConfig = (rgId: number) => {
  return ttGet(`/api/tt/1.0/sla/${rgId}/search`, {})
}
// 设置sla是否升级
export const setSlaUpgrade = (params: {
  name: string
  categoryId: number
  typeId?: number
  itemId?: number
  slaUpgrade: Boolean
}) => {
  return ttPost('/api/tt/1.0/sla/upgrade/setting', {}, params)
}
// 数据统计-按照rg和时间
export const getCountByRg = (params: {
  rgId: number
  misId: string
  dateStartAt: number
  dateEndAt: number
}) => {
  return ttGet('/api/tt/1.0/statistic/state/count/by/rg', { params })
}
// 数据统计-按照cti和时间
export const getCountByCti = (params: {
  categoryId?: number
  typeId?: number
  itemId?: number
  dateStartAt: number
  dateEndAt: number
}) => {
  return ttGet('/api/tt/1.0/statistic/state/count/by/cti', { params })
}
// 目录统计-按照rg和时间（饼图）
export const getGroupByRg = (params: {
  rgId: number
  misId: string
  dateStartAt: number
  dateEndAt: number
}) => {
  return ttGet('/api/tt/1.0/statistic/tree/group/by/rg', { params })
}
// 目录统计-按照cti和时间（饼图）
export const getGroupByCti = (params: {
  categoryId: number
  typeId?: number
  itemId?: number
  dateStartAt: number
  dateEndAt: number
}) => {
  return ttGet('/api/tt/1.0/statistic/tree/group/by/cti', { params })
}
// 类型统计-按照rg和时间（饼图）
export const getGroupTypeByRg = (params: {
  rgId: number
  misId: string
  dateStartAt: number
  dateEndAt: number
}) => {
  return ttGet('/api/tt/1.0/statistic/type/group/by/rg', { params })
}
// 类型统计-按照cti和时间（饼图）
export const getGroupTypeByCti = (params: {
  categoryId?: number
  typeId?: number
  itemId?: number
  dateStartAt: number
  dateEndAt: number
}) => {
  return ttGet('/api/tt/1.0/statistic/type/group/by/cti', { params })
}
// 等级统计-按照rg和时间（饼图）
export const getGroupSlaByRg = (params: {
  rgId: number
  misId: string
  dateStartAt: number
  dateEndAt: number
}) => {
  return ttGet('/api/tt/1.0/statistic/sla/group/by/rg', { params })
}
// 等级统计-按照cti和时间（饼图）
export const getGroupSlaByCti = (params: {
  categoryId?: number
  typeId?: number
  itemId?: number
  dateStartAt: number
  dateEndAt: number
}) => {
  return ttGet('/api/tt/1.0/statistic/sla/group/by/cti', { params })
}
// oncall统计-按照rg和时间（饼图）
export const getGroupOncallByRg = (params: {
  rgId: number
  dateStartAt: number
  dateEndAt: number
}) => {
  return ttGet('/api/tt/1.0/statistic/oncall/group/by/rg', { params })
}
// 时长统计-按照响应和处理（rg）
export const getSumTimeByRg = (params: {
  rgId: number
  misId: string
  dateStartAt: number
  dateEndAt: number
  type: 'RESOLVE' | 'RESPONSE'
}) => {
  return ttGet('/api/tt/1.0/statistic/time/sum/by/rg', { params })
}
// 时长统计-按照响应和处理（cti）
export const getSumTimeByCti = (params: {
  categoryId?: number
  typeId?: number
  itemId?: number
  dateStartAt: number
  dateEndAt: number
  type: 'RESOLVE' | 'RESPONSE'
}) => {
  return ttGet('/api/tt/1.0/statistic/time/sum/by/cti', { params })
}
// 合格率统计-按照响应和处理（rg）
export const getSumRateByRg = (params: {
  rgId: number
  misId: string
  dateStartAt: number
  dateEndAt: number
}) => {
  return ttGet('/api/tt/1.0/statistic/rate/sum/by/rg', { params })
}
// 合格率统计-按照响应和处理（cti）
export const getSumRateByCti = (params: {
  categoryId?: number
  typeId?: number
  itemId?: number
  dateStartAt: number
  dateEndAt: number
}) => {
  return ttGet('/api/tt/1.0/statistic/rate/sum/by/cti', { params })
}
// 获取公告内容
export const getAnnouncement = () => {
  return ttGet('/api/tt/1.0/web/notice/content', {})
}
// 关联coe
export const connectCoe = (params: {
  linkType: string
  content: string
  source: number
}) => {
  return ttPost('/api/tt/1.0/coe/associate', {}, params)
}
// 关联tt
export const connectTT = (params: any[]) => {
  return ttPost('/api/tt/1.0/ticket/associate', {}, params)
}
// 获取ticket的关联信息
export const getConnectPage = (ticketId: number) => {
  return ttGet('/api/tt/1.0/associate/search', { ticketId: ticketId })
}
// 删除ticket的关联信息
export const deleteConnectPage = (params: {
  linkType: string
  destination?: number
  source: number
}) => {
  return ttDel('/api/tt/1.0/associate/delete', {}, { params })
}
// 按name搜索ticket
export const searchTicketByName = (name: string) => {
  return ttGet('/api/tt/1.0/ticket/name/query', { name: name })
}
// 获取ticket相关的时间信息
export const getTicketTime = (ticketId: number) => {
  return ttGet('/api/tt/1.0/ticket/time', { ticketId: ticketId })
}
// 获取权限人员
export const getTicketPermission = (ticketId: number) => {
  return ttGet(`/api/tt/1.0/ticket/${ticketId}/permission/users`, {})
}
// 获取ones参与的项目
export const getOnesProjects = (params: {
  username: string
  projectName: string
  cn: number
  sn: number
}) => {
  return ttGet('/api/tt/1.0/ones/project/joined', { params })
}
// 获取ones某项目下的成员
export const getProjectUsers = (
  projectId: number,
  params: {
    username: string
    cn: number
    sn: number
  }
) => {
  return ttGet(`/api/tt/1.0/ones/project/${projectId}/member`, { params })
}
// 获取ones某项目下的成员
export const createOnes = (params: {
  ticketId: number
  projectId: number
  issueType: string
  name: string
  assigned: string
  cc: string[]
  reporter: string
  expectClose: number
  desc: string
  attachment: any[]
}) => {
  return ttPost('/api/tt/1.0/ones/issue', {}, params)
}
// 获取ticket角色
export const getTicketRole = (
  ticketId: number,
  params?: {
    username: string
  }
) => {
  return ttGet(`/api/tt/1.0/ticket/${ticketId}/role`, { params })
}
// 同步导出数据
export const downloadExcelSync = (params: {
  state?: string[]
  sla?: string[]
  name?: string
  ticketType?: string[]
  createdAtStart?: number
  createdAtEnd?: number
  createdBy?: string
  assigned?: string
  categoryName?: string
  typeName?: string
  itemName?: string
  rgIds?: number[]
  cc?: string[]
}) => {
  return ttPost('/api/tt/1.0/file/sync/download', {}, params)
}
// 异步导出数据
export const downloadExcelAsync = (params: {
  state?: string[]
  sla?: string[]
  name?: string
  ticketType?: string[]
  createdAtStart?: number
  createdAtEnd?: number
  createdBy?: string
  assigned?: string
  categoryName?: string
  typeName?: string
  itemName?: string
  rgIds?: number[]
  cc: string[]
}) => {
  return ttPost('/api/tt/1.0/file/async/download', {}, params)
}

// 获取ticket角色
export const getNxAccessToken = () => {
  return ttGet('/api/tt/1.0/admin/get/js/ticket', {})
}
// 创建大象群
export const createChatRoom = (ticketId: number, includeCc: Boolean) => {
  return ttPost(
    `/api/tt/1.0/chat/created/${ticketId}`,
    { includeCc: includeCc },
    {}
  )
}
// 判断是否存在大象群
export const chatRoomExist = (ticketId: number) => {
  return ttGet('/api/tt/1.0/chat/already/created', { ticketId: ticketId })
}
// 获取大象群聊天记录
export const getChatRecord = (ticketId: number, cn: number, sn: number) => {
  return ttGet('/api/tt/1.0/chat/record/list', {
    ticketId: ticketId,
    cn: cn,
    sn: sn
  })
}
// 解散大象群
export const cancelChatRoom = (params: {
  roomId: number
  ticketId: number
}) => {
  return ttPost('/api/tt/1.0/chat/room/cancel', {}, params)
}
// 拉新人进群
export const inviteUserToChat = (params: {
  ticketId: number
  roomId: number
  userList: string[]
}) => {
  return ttPost('/api/tt/1.0/chat/user/invite/history', {}, params)
}
// 获取自定义表单配置
export const getCustomForm = (customFormId: number, forceGet?: boolean) => {
  return ttGet(`/api/tt/1.0/rg/custom/form/${customFormId}`, {})
}
// 自定义创建ticket
export const createCustomTicket = (params: {
  ticket: {
    name: string
    description?: string
    ticketType: string
    categoryName: string
    categoryId: number
    typeName: string
    typeId: number
    itemName: string
    itemId: number
    assigned: string
    cc?: string[]
    reporter?: string
    sla: string
    sourceId?: number
    entranceSource?: string
  }
  customFieldValueList: any[]
}) => {
  return ttPost('/api/tt/1.0/ticket/custom/form/create', {}, params)
}
// 获取表单详情
export const getCustomFields = (params: {
  customFormId: number
  forceGet?: boolean
}) => {
  return ttGet(`/api/tt/1.0/rg/custom/form/${params.customFormId}`, { params })
}
// 更新自定义ticket
export const updateCustomTicket = (
  ticketId: number,
  params?: {
    ticketUpdate?: {
      sla?: string
      assigned?: string
      categoryName?: string
      categoryId?: number
      typeName?: string
      typeId?: number
      itemName?: string
      itemId?: number
      stage?: string
      resolution?: string
      closedReason?: string
      closedDesc?: string
      pendingReason?: string
    }
    customFieldValueList: any[]
  }
) => {
  return ttPost(`/api/tt/1.0/ticket/custom/form/update/${ticketId}`, {}, params)
}
// 【外卖代理商】标题自动添加
export const getWmDistrictCityTitle = (mis: string) => {
  return ttGet('/api/tt/1.0/wm/district/city/prefix/by/mis', { mis: mis })
}

// 用户添加满意度
export const addScore = (params: {
  ticketId: number
  satisfy: 'satisfied' | 'common' | 'Dissatisfied'
  suggest?: string
  reasons?: String[]
  resolution?: 'resolved' | 'unresolved' | ''
}) => {
  return ttPost('/api/tt/1.0/score/add', {}, params)
}
// 获取满意度
export const getScore = ticketId => {
  return ttGet('/api/tt/1.0/score/find', { ticketId: ticketId })
}

/**
 * cgi相关接口
 *
 */

// 查询一级目录
export const getCategoryList = (params: { name?: string }) => {
  return ttGet('/api/cti/1.0/category/list', { params })
}
// 查询二级目录
export const getTypeList = (params: { parentId: number; name?: string }) => {
  return ttGet('/api/cti/1.0/type/list', { params })
}
// 查询三级目录
export const getItemList = (params: { parentId: number; name?: string }) => {
  return ttGet('/api/cti/1.0/item/list', { params })
}
// 获取用户信息
export const getUserInfo = (): Promise<Response<TTUserInfo>> => {
  return ttGet('/api/cti/1.0/user/current', {})
}
// 关键词检索用户
export const searchUser = (keyword: string, ticketId?: number) => {
  return ttGet('/api/cti/1.0/search/user', {
    keyword: keyword,
    includeExternal: true,
    ticketId: ticketId || 0 // 后端根据ticketId所属rg判断是否在白名单内，是的话可以搜索到外部账号（目前仅在抄送场景使用）
  })
}
// 查询我参与的rg
export const getMyRg = (params?: { cn?: number; sn?: number }) => {
  return ttGet('/api/cti/1.0/rg/my', { params })
}
// 查询rg
export const getRgs = (params?: { name?: number }) => {
  return ttGet('/api/cti/1.0/rg/list', { params })
}
// 查询cti树形结构
export const getCategoryTree = (scope: string = 'ALL' /* 'ALL' | 'RG' */) => {
  return ttGet('/api/cti/1.0/category/tree', { scope })
}
// 查询rg下oncall user
export const getOncallUser = (rgId: string) => {
  return ttGet('/api/cti/1.0/oncall/user/detail', { rgId: rgId })
}
// 查询RG下user
export const getRgUser = (params: {
  rgId: number
  includeOncall?: boolean
  identify?: string
  cn?: number
  sn?: number
}) => {
  return ttGet('/api/cti/1.0/rg/user/list', params)
}
// 查询RG设置的展示字段
export const getRgReplyField = (params: { rgId: number; type: string }) => {
  return ttGet('/api/cti/1.0/rg/display/field', params)
}

// 获取关闭原因
export const getCloseReasonList = (params: {
  rgId: number,
  type: string,
  content?: string,
  pageNum?: number,
  pageSize?: number
}) => {
  return ttGet(`/api/cti/1.0/rg/display/field/page`, params);
}

// 根据用户返回cti
export const getUserCti = (assigned: string) => {
  return ttGet('/api/cti/1.0/rg/user/search/cti', { assigned: assigned })
}
// 根据itemId获取模板内容
export const getTemplateByItem = (itemId: number) => {
  return ttGet(`/api/cti/1.0/template/item/${itemId}`, {})
}
// 批量获取displayname
export const searchDisplayNameList = (
  misList: string[]
): Promise<Response<UserList>> => {
  return ttPost('/api/cti/1.0/search/user/list/mobile', {}, { misList })
}
// 根据关键字搜索CTI
export const searchCTIbyName = (name: string) => {
  return ttGet('/api/cti/1.0/type/item/search', { name: name })
}
// 根据itemId获取模板内容
export const getItemInfo = (itemId: number) => {
  return ttGet(`/api/cti/1.0/item/${itemId}/info`, {})
}
// 服务目录改造：获取当前用户适用的服务目录版本
// version  = 0 ，则是外部账号
export const getCtiVersion = () => {
  return ttGet('/api/cti/1.0/tree/version/get', {})
}
// 查询rg的默认设置
export const getRgSetting = (rgId: number | string) => {
  return ttGet('/api/cti/1.0/rg/setting/get', { rgId: rgId })
}
// 根据RG获取CTI树形
export const getCategoryByRg = (rgId: number) => {
  return ttGet(`/api/cti/1.0/rg/${rgId}/item/info`, {})
}

//#region ticket archive
export const getRgArchiveInfo = (
  rgId: number | string
): Promise<Response<RgArchiveInfo>> => {
  return ttGet('/api/cti/1.0/rg/archive/info', { rgId })
}

export const getArchiveInfo = (
  archiveId: number | string
): Promise<Response<ArchiveInfo>> => {
  return ttGet(`/api/cti/1.0/archive/${archiveId}`, {})
}

export const listArchiveChildren = (
  parentId: number | string
): Promise<Response<ArchiveChildren>> => {
  return ttGet('/api/cti/1.0/archive/list', { parentId })
}

export const searchArchive = (
  parentId: number | string,
  keyword: string
): Promise<Response<ArchiveSearchResult>> => {
  return ttGet('/api/cti/1.0/archive/search', { parentId, keyword })
}
//#endregion ticket archive

export const getTicketListNumber = (spaceId?: string) => {
  let p = {}
  if (spaceId?.length > 0) p = { spaceId: spaceId }
  return ttGet('/api/tt/1.0/ticket/number/map', p, {})
}

/** 获取自定义表单入口列表 */
export const getCustomFormList = (rgId: number) => {
  return ttGet(
    '/api/tt/1.0/rg/custom/form/list',
    { rgId: rgId, cn: 1, sn: 100 },
    {}
  )
}

//#region label api
export const listRgLabels = (
  rgId: string
): Promise<{ data?: { items: Label[] } }> => {
  return ttGet('/api/cti/1.0/rg/label/list', { rgId: rgId })
}

export const searchLabels = (
  keyword: string
): Promise<{ data?: { items: Label[] } }> => {
  return ttGet('/api/tt/1.0/label/search', { name: keyword })
}

export const addLabel = (name: string): Promise<{ name: string }> => {
  return ttPost('/api/tt/1.0/label/add', {}, { name: name })
}

export const labelIdByName = (
  ...names: string[]
): Promise<{ data?: { items: string[] } }> => {
  return ttPost(
    '/api/tt/1.0/label/list/exchange',
    {},
    { labels: names, mode: 'NAME_TO_ID' }
  )
}
//#endregion label api

//#region Space api
/** 根据域名空间名字换取 space 信息*/
export const getSpaceInfoFromDomain = (domain: string) => {
  return ttGet('/api/cti/1.0/get/space/by/domain', { domain: domain }, {})
}

// TODO: 这里接口没有处理分页
/** 根据域名空间名字换取 space id */
export const getTemplateListFromSpaceId = (
  spaceId: string,
  type: 'CUSTOM' | 'NORMAL',
  cn?: number,
  sn?: number
) => {
  return ttGet(
    '/api/cti/1.0/space/template/list',
    { spaceId: spaceId, type: type, cn: cn, sn: sn },
    {}
  )
}

/** 根据域名空间id 获取 tree */
export const getTreesFromSpaceId = (spaceId: string, states: string) => {
  return ttGet(
    '/api/cti/1.0/cti/tree',
    { spaceId: spaceId, states: states },
    {}
  )
}

/** 根据 spaceid 获取默认模板 */
export const getTemplateFromSapceId = (spaceId: string) => {
  return ttGet('/api/cti/1.0/space/template/default', { spaceId: spaceId }, {})
}

export const getTicketListNumberFromSpace = (spaceId?: string) => {
  let p = {}
  if (spaceId?.length > 0) p = { spaceId: spaceId }
  return ttGet('/api/tt/1.0/ticket/number/map/space', p, {})
}

//#endregion

/** 新的上传附件url接口 */
export const uploadAttachFilesNew = (
  ticketId: number,
  url: string,
  fileName: string,
  size: number,
  area: 'attach' | 'desc' | 'comment'
) => {
  let p = {
    ticketId: ticketId,
    url: url,
    fileName: fileName,
    size: size,
    area: area
  }
  return ttPost('/api/tt/1.0/file/mobile/upload', p, {})
}

//#region media upload
declare type UploadApi = (
  localId: string,
  uploadType: 'image' | 'video',
  ticketId: string,
  area: 'desc' | 'attach' | 'comment',
  isCreate?: boolean
) => Promise<UploadResponse>

const uploadAndroid: UploadApi = (
  localId,
  uploadType,
  ticketId,
  area,
  isCreate
) => {
  let sp = localId.split('%2')
  let len = sp?.length ?? 0
  let name = len > 1 ? sp[len - 1] : uploadType
  const parts = [
    {
      fieldName: 'file', // 一般为 file，由服务器决定
      fileName: name, // 上传文件名
      // mimeType: 'image/png', // 文件类型
      uri: localId // 文件 URI，支持以 knb-media:// 开头的链接
    }
  ]
  let data = {
    parts: parts
  }
  if (isCreate && area === 'desc') {
    return uploadCreateDescFiles(
      {
        area: area
      },
      data
    )
  } else {
    return uploadAttachFiles(
      {
        ticketId: ticketId,
        area: area
      },
      data
    )
  }
}

const uploadIOS: UploadApi = (
  localId,
  uploadType,
  ticketId,
  area,
  isCreate
) => {
  if (getKey('appName') === AppName.dx) {
    const isTest = getKey('env') === 'test'
    let prefixClientId = isTest ? 'cc7fabacff' : '9504f696cb'
    let clientValue = `${prefixClientId}_ssoid=${getKey('token')}`

    const baseUrl = isTest
      ? 'http://tt.cloud.test.sankuai.com/'
      : 'https://tt.sankuai.com/'
    const api =
      isCreate && area === 'desc'
        ? `api/tt/1.0/file/upload/desc?area=${area}`
        : `api/tt/1.0/file/upload?ticketId=${ticketId}&area=${area}`
    return new Promise((resolve, reject) => {
      KNB.use('dxmp.uploadFileWithHeaderAuthentication', {
        url: `${baseUrl}${api}`,
        // String 类型，必填，容器媒体协议或者文件路径
        localId,
        partName: 'file',
        headers: {
          'Content-Type': 'multipart/form-data', // 指定 multipart/form-data 表示上传文件
          // 'X-Login-Type':'SSO',
          Cookie: clientValue
        },
        success: ({ res }) => {
          try {
            resolve(JSON.parse(res) as UploadResponse)
          } catch (e) {
            reject(e)
          }
        },
        fail: reject
      })
    })
  } else {
    return uploadAndroid(localId, uploadType, ticketId, area, isCreate)
  }
}

export const uploadMedia: UploadApi = async (
  localId,
  uploadType,
  ticketId,
  area,
  isCreate = false
) => {
  if (
    getKey('appName') === AppName.bee ||
    getKey('appName') === AppName.sinan
  ) {
    return await uploadAndroid(localId, uploadType, ticketId, area, isCreate)
  }
  switch (Platform.OS) {
    case 'android':
      return await uploadAndroid(localId, uploadType, ticketId, area, isCreate)
    case 'ios':
      return await uploadIOS(localId, uploadType, ticketId, area, isCreate)
    default:
      return Promise.reject(new Error('Unsupported OS: ' + Platform.OS))
  }
}
//#endregion media upload

// Rg权限设置
export const getRgPermission = (rgId): Promise<Response<RgPermission>> => {
  return ttGet('/api/cti/1.0/element/permission', { rgId: rgId })
}

/**查找目录 */
export const findCategory = originCate => {
  return ttPost('/api/cti/1.0/find/newest/bind', {}, originCate)
}

/** RG满意度设置获取 */
export const getSatisfySetting = rgId => {
  return ttGet(`/api/cti/1.0/satisfaction/setting/${rgId}`, {})
}

/**非工作日 详情权限 */
export const getTicketDetailPermission = tickedId => {
  return ttGet(`/api/tt/1.0/permission/ticket/${tickedId}`, {})
}
/** RG常见问题 */
export const getFAQ = (rgId, enable, relationType, cn, sn) => {
  return ttGet('/api/cti/1.0/rg/faq', { rgId, enable, relationType, cn, sn })
}

/** RG公告 */
export const getBulletin = (rgId, enbale, relationType, cn, sn) => {
  return ttGet('/api/cti/1.0/rg/bulletin', {
    rgId,
    enbale,
    relationType,
    cn,
    sn
  })
}

/** 查询摩西机器人绑定设置 */
export const getRgRobot = rgId => {
  return ttGet(`/api/cti/1.0/rg/moses/${rgId}`, {})
}

/** 根据RG获取非工作时间不接单设置和时间状态 */
export const getNonWorkSetting = (rgId, includeTimeState) => {
  return ttGet('/api/tt/1.0/rg/nonworking/hour/setting/and/time/state', {
    rgId,
    includeTimeState
  })
}

/** 获取门店详情信息 https://km.sankuai.com/page/685789920 */
export const getShopDetailInfo = (shopId, poiType) => {
  return ttGet('/api/tt/1.0/poi/info', { shopId, poiType })
}

export const getGroupCcSetting = (rgId: number) => {
  return ttGet(`/api/tt/1.0/xm/setting/invite/cc/${rgId}`, {})
}
// 获取指定空间下有权限的目录（支持逐级加载）
export const getAuthSpaceCti = (
  params: {
    domain: string // 判断公共/私有空间时，内部用户后端优先取X-space-domain，外部用户用domain/spaceId
    isMainSpace?: boolean
  },
  CtiTreeQueryDTO: {
    categoryIds?: number[]
    typeIds?: number[]
    itemIds?: number[]
    createScene: boolean // 是：创建场景；否：流转场景
    categoryCreate?: boolean // 是否一级目录发起
    typeOrItemCreate?: boolean // 是否二三级目录发起
  }
) => {
  return ttPost('/api/cti/1.0/cti/tree/layer', params, CtiTreeQueryDTO)
}
// 目录搜索
export const searchCti = (params: {
  keyword: string
  sceneId: number // 1 —— 发起，对应原 cti/tree 接口 (默认值) ;2 —— 流转和过滤器筛选，对应原 category/tree 接口
}) => {
  return ttPost('/api/cti/1.0/cti/scene/query', {}, params)
}
/**
 * 公共服务-聊天面板相关接口
 *
 */

// 创建群
export const createGroup = (params: {
  objectId?: number
  name: string
  memberIds: string[]
}) => {
  return cPost('/api/im/1.0/group/create', {}, params)
}

// 添加群成员
export const addMember = (params: { groupId: number; memberIds: any }) => {
  return cPut('/api/im/1.0/group/member/add', {}, params)
}

// 获取大象群信息：创建状态、群成员、是否为外部群等
export const getGroupInfo = (objectId: number) => {
  return cGet('/api/im/1.0/group/info', { objectId: objectId })
}

// 获取群聊记录
export const getMessage = (params: {
  currentPageNum?: number
  pageSize?: number
  objectId: number
  groupId?: number
  msgId?: number
}) => {
  return cPost('/api/im/1.0/message/fetch', {}, params)
}

// 设置语言
export const setUserLanguage = (params: {
  misId?: string,
  locale: string,
  timeZone: string
}) => {
  return cPost('api/tt/1.0/preference/userSetting/set', {}, { ...params });
};

// 获取用户语言配置
// tt/1.0/preference/userSetting/set
export const getUserLanguage = () => {
  return cGet('/api/tt/1.0/preference/query', {})
}

export const getTimeZoneOptions = () => {
  return cGet('/tt/1.0/preference/timezone', {})
};