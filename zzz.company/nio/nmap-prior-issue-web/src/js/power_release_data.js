// 产品信息表格
export let tableRuleColumn = [
  {prop: 'baseMapVersion', label: '底图版本', width: '220'}, 
  {prop: 'productIdentity', label: '产品名', width: '220'}, 
  {prop: 'descNameList', label: '换电站名称', width: '220'},
  {prop: 'prod', label: 'prod', width: '150'},
  {prop: 'stg', label: 'stg', width: '150'},
  {prop: 'edgeCheckFailed', label: '接边失败', width: '220'},
  {prop: 'releaseTime', label: '换电站发版时间', width: '260'},
  {prop: 'baseMapReleaseTime', label: '底图发版时间', width: '240'},
  {prop: 'productTag', label: '发版tag', width: '240'}
]

// 详情表格
export let powerEditionDetailForm = {
  productIdentity: '', releaseTime: '', productTag: ''
}

// 产品详情表格
export let columnsDetailChildren = [
    {prop: 'detailNum', label: '序号', width: '80'},
  {prop: 'identityName', label: '分支id', width: '140'},
  {prop: 'parentBranch', label: '母分支', width: '140'},
  {prop: 'type', label: '类型', width: '150'},
  {prop: 'createTime', label: '创建时间', width: '240'},
  {prop: 'dataVersion', label: '创建dataVersion', width: '140'},
]

// 文件信息表格
export let tableDocumentColumn = [// {prop: 'productIdentity', label: '产品Id', width: '220'},
  {prop: 'partitionName', label: '文件名', width: '120'}, {
    prop: 'size', label: '文件大小(mb)', width: '120'
  }, {prop: 'dataVersion', label: '数据版本', width: '100'}, {
    prop: 'partitionFormat', label: '格式', width: '100'
  }, {prop: 'md5', label: 'md5', width: '280'},]

// 分⽀类型
export let branchOptions = [{value: 'PARTIAL_BRANCH', label: 'PARTIAL_BRANCH'}, {
  value: 'BRANCH', label: 'BRANCH'
}, {value: 'TAG', label: 'TAG'},]
