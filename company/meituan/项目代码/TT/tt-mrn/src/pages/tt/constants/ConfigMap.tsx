import { i18nClient } from '@sailor/i18n-mrn'
// TT 接口返回的内容，很多需要客户端再做映射
// 防止遗漏，直接从H5中 map.conf.ts里摘取map
// TODO 部分ICON/Image要替换成本地的
import theme from '@src/common/styles/MWSStyle'

// export const TicketStatus = [
//   i18nClient.t('constants_2839c8', { defaultValue: '未处理' }),
//   i18nClient.t('constants_5d459d', { defaultValue: '处理中' }),
//   i18nClient.t('constants_d7d257', { defaultValue: '已解决' }),
//   i18nClient.t('constants_9c5850', { defaultValue: '已关闭' }),
//   i18nClient.t('constants_72db77', { defaultValue: '重新打开' }),
//   i18nClient.t('constants_8d63ef', { defaultValue: '暂停' }),
// ]

export const TicketSla = ['S1', 'S2', 'S3', 'S4', 'S5']
export const TicketType = [
  { code: 'constants_9038cd', val: '服务故障' }, // { defaultValue: '服务故障' }),
  { code: 'constants_10b276', val: '事件' }, // { defaultValue: '事件' }),
  { code: 'constants_615ae1', val: '缺陷' }, // { defaultValue: '缺陷' }),
  { code: 'constants_e6cefb', val: '需求' }, //{ defaultValue: '需求' }),
  { code: 'constants_41e840', val: '问题咨询' }, // { defaultValue: '问题咨询' }),
  { code: 'constants_19444e', val: '建议' } // { defaultValue: '建议' }),
]

// export const CloseReason = [
//   { label: i18nClient.t('constants_d7d257', { defaultValue: '已解决' }), value: '1' },
//   { label: i18nClient.t('constants_aa4dd5', { defaultValue: '暂不解决' }), value: '2' },
//   { label: i18nClient.t('constants_dfb34c', { defaultValue: '和其他问题重复' }), value: '3' },
//   { label: i18nClient.t('constants_785b27', { defaultValue: '误报' }), value: '4' },
//   { label: i18nClient.t('constants_93a015', { defaultValue: '不能重现' }), value: '5' },
//   { label: i18nClient.t('constants_f71f82', { defaultValue: '转入其他系统处理' }), value: '6' },
// ]

// export const PendingReason = [
//   { label: i18nClient.t('constants_b12ad2', { defaultValue: '人力原因' }), value: '1' },
//   { label: i18nClient.t('constants_533c74', { defaultValue: '等待其他团队支持' }), value: '2' },
//   { label: i18nClient.t('constants_0d98c7', { defaultValue: '其他' }), value: '3' },
// ]

// export const NUMBER = [
//   i18nClient.t('constants_7941da', { defaultValue: '一' }),
//   i18nClient.t('constants_2d8be2', { defaultValue: '二' }),
//   i18nClient.t('constants_e662ff', { defaultValue: '三' }),
// ]
export const AllowedFileType = [
  'image/jpeg',
  'text/plain',
  'image/png',
  'application/vnd.ms-powerpoint',
  'application/vnd.ms-excel',
  'application/msword',
  'audio/mpeg',
  'audio/mp4',
  'video/mp4',
]

export const TicketStateMap = {
  处理中: {
    text_code: 'constants_a18f88', // { defaultValue: '开始处理' }),
    text: '开始处理',
    cb: 'doing',
    type: 'primary',
    icon: 'iconfont icon-bofang-',
    bid: 'b_onecloud_0rj3k1is_mc',
  },
  挂起中: {
    text_code: 'constants_b8c4eb', // { defaultValue: '暂停TT' }),
    text: '暂停TT',
    cb: 'pend',
    type: '',
    icon: 'iconfont icon-bofang-',
    bid: 'b_onecloud_tesduycf_mc',
  },
  暂停中: {
    text_code: 'constants_b8c4eb', // { defaultValue: '暂停TT' }),
    text: '暂停TT',
    cb: 'pause',
    type: '',
    icon: 'iconfont icon-bofang-',
    bid: 'b_onecloud_tesduycf_mc',
  },
  已解决: {
    text_code: 'constants_7be39b', // { defaultValue: '处理完成' }),
    text: '处理完成',
    cb: 'done',
    type: 'primary',
    icon: 'mtdicon mtdicon-check-thick',
    bid: 'b_onecloud_hiwkwk4w_mc',
  },
  已关闭: {
    text_code: 'components_detail_bb5f2d', // { defaultValue: '关闭TT' }),
    text: '关闭TT',
    cb: 'close',
    type: '',
    icon: 'iconfont icon-close-outlined-',
    bid: 'b_onecloud_84c7lxzm_mc',
  },
  重新打开: {
    text_code: 'components_detail_ee8f81', // { defaultValue: '重新处理' }),
    text: '重新处理',
    cb: 'retry',
    type: '',
    icon: 'iconfont icon-shuaxin-',
    bid: 'b_onecloud_pyohku5s_mc',
  },
  添加自定义状态: {
    text_code: 'add_custom_state', // { defaultValue: '重新处理' }),
    text: '添加自定义状态',
    cb: '', // 不知
    type: '', // 不知
    icon: '', // 不知
    bid: '', // 不知
  },
}
// export const LevelTips = {
//   S1: i18nClient.t('constants_718d46', {
//     defaultValue:
//       '指影响线上业务或在短时间内不解决会造成经济损失的问题，发起后会立即通知相关服务团队的所有人以及配置的协同处理团队值班员。超过问题响应时间会升级通知处理人的leader，循环向上',
//   }),
//   S2: i18nClient.t('constants_5cf420', {
//     defaultValue:
//       '严重事件，对部门有影响，默认15分钟之内必须响应，首次超时将会向当前处理人leader发送通知，再次超时将会向leader的leader发送通知',
//   }),
//   S3: i18nClient.t('constants_1df1ad', { defaultValue: '对部门有影响，默认需要在12小时之内响应' }),
//   S4: i18nClient.t('constants_0a9b48', {
//     defaultValue: '对个人有影响，默认需要在48小时内响应，不及时解决等级会上升',
//   }),
//   S5: i18nClient.t('constants_e2b68d', { defaultValue: '低级，不影响工作效率' }),
// }
// export const UserRole = {
//   NORMAL: i18nClient.t('constants_4062ba', { defaultValue: '普通成员' }),
//   RGADMIN: i18nClient.t('constants_b1dae9', { defaultValue: '管理员' }),
// }
// export const TimeTypes = {
//   MINUTE: i18nClient.t('constants_3a17b7', { defaultValue: '分钟' }),
//   HOUR: i18nClient.t('constants_2de0d4', { defaultValue: '小时' }),
//   DAY: i18nClient.t('constants_249aba', { defaultValue: '天' }),
//   WEEK: i18nClient.t('constants_a657f4', { defaultValue: '周' }),
// }
// export const TicketStateColor = {
//   已解决: 'green',
//   暂停中: 'tan',
//   挂起中: 'tan',
//   未处理: 'red',
//   重新打开: 'blue',
//   处理中: 'orange',
//   已关闭: 'gray',
// }

// export const TicketSlaIcon = {
//   S1: 'icon-feichangjinji1',
//   S2: 'icon-jinji',
//   S3: 'icon-gao',
//   S4: 'icon-zhong',
//   S5: 'icon-di',
// }
// export const StateCountMap = {
//   createdNumber: i18nClient.t('constants_6a93c0', { defaultValue: '发起量' }),
//   resolvedNumber: i18nClient.t('constants_8d8817', { defaultValue: '解决量' }),
//   closedNumber: i18nClient.t('constants_17b974', { defaultValue: '关闭量' }),
// }
// export const ResolveTimetMap = {
//   resolve: i18nClient.t('constants_9d2549', { defaultValue: '解决时长' }),
// }
// export const ResponseTimeMap = {
//   response: i18nClient.t('constants_fa4b56', { defaultValue: '响应时长' }),
// }
// export const SumRateMap = {
//   responseSuccessRate: i18nClient.t('constants_28fc3b', { defaultValue: '响应合格率' }),
//   resolveSuccessRate: i18nClient.t('constants_13e3ec', { defaultValue: '解决合格率' }),
// }
export const SLA = ['S1', 'S2', 'S3', 'S4', 'S5']
export const Sla2CN = {
  S1: 'constants_02d455',
  S2: 'constants_cb0ed5',
  S3: 'constants_4296d7',
  S4: 'constants_aed1df',
  S5: 'constants_19ac67'
}

export const CN2SLA = {
  非常紧急: 'S1',
  紧急: 'S2',
  高: 'S3',
  中: 'S4',
  低: 'S5',
}
// 没有使用displayName， 可忽略
export const SCORE = [
  { label: 'satisfied', displayName: 'constants_195b8a'}, // , { defaultValue: '满意' }) 
  { label: 'common', displayName: 'constants_2ab01e' }, // , { defaultValue: '一般' })
  {
    label: 'Dissatisfied',
    displayName: 'constants_894cca' // { defaultValue: '不满意' }
  }
]
// 同上
export const SOLVEDMAP = [
  { label: 'resolved', displayName: 'constants_d7d257' }, //{ defaultValue: '已解决' })
  {
    label: 'unresolved',
    displayName: 'constants_a9f78f' // { defaultValue: '未解决' }
  }
]

export const SCORE2CN = {
  satisfied: 'constants_195b8a', // { defaultValue: '满意' }),
  common: 'constants_2ab01e', // { defaultValue: '一般' }),
  Dissatisfied: 'constants_894cca' // { defaultValue: '不满意' }),
}
export const SOLVED2CN = {
  resolved: 'constants_d7d257', // { defaultValue: '已解决' }),
  unresolved: 'constants_a9f78f' // { defaultValue: '未解决' }),
}
export const ServiceMap = {
  category: 'constants_6eb43a', //  { defaultValue: '一级目录' }),
  type: 'constants_871cc8', // { defaultValue: '二级目录' }),
  item: 'constants_f6488e' // { defaultValue: '三级目录' }),
}
// export const onesIssueTypes = ['REQUIREMENT', 'DEVTASK', 'DEFECT']
// export const onesIssueMap = {
//   REQUIREMENT: i18nClient.t('constants_e6cefb', { defaultValue: '需求' }),
//   DEVTASK: i18nClient.t('constants_0e46d8', { defaultValue: '任务' }),
//   DEFECT: i18nClient.t('constants_615ae1', { defaultValue: '缺陷' }),
// }

// export const SLA_RULE_DESC = {
//   S1: i18nClient.t('constants_95a455', {
//     defaultValue:
//       '非常紧急：指影响线上业务或在短时间内不解决会造成经济损失的问题，发起后会立即通知相关服务团队的所有人以及配置的协同处理团队值班员。超过问题响应时间会升级通知处理人的leader，循环向上',
//   }),
//   S2: i18nClient.t('constants_b85e62', {
//     defaultValue:
//       '紧急：严重事件，对部门有影响，默认15分钟之内必须响应，首次超时将会向当前处理人leader发送通知，再次超时将会向leader的leader发送通知',
//   }),
// }
export const SLA_OUTER_COLOR = {
  S1: theme.red57,
  S2: theme.red57,
  S3: theme.yellow25,
  S4: theme.blueFE,
  S5: theme.grayA3,
}

export const SLA_STATE_COLOR = {
  S1: theme.red29,
  S2: theme.red29,
  S3: theme.yellowF00,
  S4: theme.blueF5,
  S5: theme.gray8F,
}

// export const STATE_ICON_MAP_M = {
//   已解决: 'icon-yichuli',
//   暂停中: 'icon-yizanting',
//   挂起中: 'icon-yizanting',
//   未处理: 'icon-weichuli',
//   重新打开: 'icon-weichuli',
//   处理中: 'icon-chulizhong',
//   已关闭: 'icon-yiguanbi',
// }

// export const LIST_PAGE_TILTE_MAP = {
//   mine: i18nClient.t('constants_b50f56', { defaultValue: '指派给我的' }),
//   favor: i18nClient.t('constants_6fb76e', { defaultValue: '抄送给我的' }),
//   createdBy: i18nClient.t('constants_6e871a', { defaultValue: '我发起的' }),
//   all: i18nClient.t('constants_62b518', { defaultValue: '全部TT' }),
//   rg: i18nClient.t('constants_f7a85e', { defaultValue: '按服务组(RG)查看' }),
//   cti: i18nClient.t('constants_d588f4', { defaultValue: '按服务目录(CTI)查看' }),
// }

// export const LIST_PAGE_TILTE_ARRAY = [
//   {
//     type: 'mine',
//     name: i18nClient.t('constants_b50f56', { defaultValue: '指派给我的' }),
//     icon: 'icon-geren-',
//   },
//   {
//     type: 'favor',
//     name: i18nClient.t('constants_6fb76e', { defaultValue: '抄送给我的' }),
//     icon: 'icon-visibility-on-',
//   },
//   {
//     type: 'createdBy',
//     name: i18nClient.t('constants_6e871a', { defaultValue: '我发起的' }),
//     icon: 'icon-export-',
//   },
//   {
//     type: 'rg',
//     name: i18nClient.t('constants_23ad81', { defaultValue: '我所在服务组（RG）' }),
//     icon: 'icon-avatar-group-o-',
//   },
//   {
//     type: 'all',
//     name: i18nClient.t('constants_62b518', { defaultValue: '全部TT' }),
//     icon: 'icon-all-o-',
//   },
// ]

// export const PERMISSION_TIP = i18nClient.t('constants_fa0637', {
//   defaultValue: '已设为保密，只允许创建人、发起人、处理人、抄送人查看和编辑',
// })

export const DEFAULT_AVATAR =
  '//s3plus.sankuai.com/v1/mss_4a5c70e8b289484393a22a82f4c3ed40/static-source/default-avatar.png'

export const DX_MESSAGE_TYPE = {
  text: {
    cn_name: 'constants_97f7b0', // { defaultValue: '文本消息' }),
    detail: true,
  },
  audio: {
    cn_name: 'constants_b2fbad', // { defaultValue: '语音消息' }),
    detail: false,
  },
  calendar: {
    cn_name: 'constants_199d63', // { defaultValue: '日历消息' }),
    detail: false,
  },
  emotion: {
    cn_name: 'constants_f8da8e', // { defaultValue: '表情消息' }),
    detail: true,
  },
  event: {
    cn_name: 'constants_989397', // { defaultValue: '事件消息' }),
    detail: false,
  },
  file: {
    cn_name: 'constants_b50723', // { defaultValue: '文件消息' }),
    detail: false,
  },
  gps: {
    cn_name: 'constants_08109f', // { defaultValue: '位置消息' }),
    detail: false,
  },
  image: {
    cn_name: 'constants_1babf2', // { defaultValue: '图片消息' }),
    detail: true,
  },
  link: {
    cn_name: 'constants_834a3b', // { defaultValue: '图文消息' }),
    detail: false,
  },
  multilink: {
    cn_name: 'constants_f15726', // { defaultValue: '多图文消息' }),
    detail: false,
  },
  vcard: {
    cn_name: 'constants_3112ff', // { defaultValue: '名片消息' }),
    detail: false,
  },
  video: {
    cn_name: 'constants_69a305', // { defaultValue: '视频消息' }),
    detail: false,
  },
  cancel: {
    cn_name: 'constants_129698', // { defaultValue: '撤回消息' }),
    detail: false,
  }
}

export const INIT_TICKET_INFO = {
  sourceId: 1,
  attachments: [],
  rgId: '',
  typeName: '',
  source: '',
  resolution: '',
  categoryName: '',
  remainingTime: 0.0,
  createdAt: null,
  itemName: '',
  attachment: [],
  customField24098: '',
  associatedProjects: [],
  id: 0,
  state: {
    category: '',
    description: '',
    name: '',
    value: '',
  },
  key: '',
  startAt: null,
  updatedAt: null,
  cc: [],
  customField20208: '',
  updatedBy: '',
  closedReason: '',
  org: '',
  expectTime: null,
  sla: '',
  permission: '',
  reporter: '',
  ticketType: '',
  priority: null,
  subtypeId: null,
  customField13850: '',
  closeAt: null,
  labels: [],
  itemId: '',
  workTimeIsOpen: null,
  nextStates: [],
  createdBy: '',
  actualWorkTime: null,
  name: null,
  rgName: '',
  progress: null,
  assigned: '',
  typeId: '',
  location: '',
  projectId: null,
  workflowId: null,
  categoryId: '',
  desc: '',
  customFieldContents: null,
  customFieldValues: null,
}
