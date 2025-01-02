// 创建任务表单
export let createForm = {
  descName: '',
  createReleaseTemplate: '',
  skipStages: '',
  preReleaseVersion:'',
  productIdentity:'',
  branchName:''
};

export let publishForm = {
  releaseVersion: '',
  parentReleaseVersion: '',
  baseLineVersion: '',
  ndsVersion: '',
  releaseTemplate: '',
  releaseStatus: '',
  owner: '',
  descName: '',
  createStartTs: null,
  createEndTs: null,
  completeStartTs: null,
  completeEndTs: null,
};

export let version = [
  // {
  //   parentReleaseVersion: '',
  //   inheritanceTemplate: '',
  // },
];

//发布版本状态
export let releaseStatusOptions = [
  { name: "成功", code: 'SUCCESS' },
  { name: "进行中", code: 'IN_PROGRESS' },
  { name: "检查不通过", code: 'CHECK_FAILED' },
  { name: "编译失败", code: 'COMPILE_FAILED' },
  { name: "执行失败", code: 'FAILED' },
  { name: "取消", code: 'CANCELLED' }
]

//发布版本类型
export let releaseTemplateOptions = [
  { name: "快修快发", code: 'hotfix_release' },
  { name: "大版发布", code: 'cs_release' },
  { name: "大版发布（老平台）", code: 'cs_release_legacy' },
  { name: "换电站发布（老平台）", code: 'cs_psp_release' },
  { name: "停车场发布（老平台）", code: 'cs_pn_release' },
  { name: "停车场发布", code: 'cs_pn_merge_release' },
  { name: "换电站发布", code: 'cs_psp_merge_release' }
]