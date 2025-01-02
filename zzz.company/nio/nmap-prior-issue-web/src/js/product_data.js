// 产品信息表格
export let tableRuleColumn = [{prop: 'descName', label: '产品名', width: '220'}, {
  prop: 'descInfo', label: '产品描述', width: '220'
}, {prop: 'createTime', label: '创建时间', width: '240'}, {prop: 'updateTime', label: '更新时间', width: '240'},]
// 详情表格
export let detailForm = {
  productIdentity: '', descName: '', descInfo: '', createTime: '', updateTime: '',
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
