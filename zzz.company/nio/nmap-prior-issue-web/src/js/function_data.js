// 资源表单
export let formData = {
  code: '',
  name: '',
  url: '',
  method: '',
  contentType: '',
  body: '',
  timeout: ''
}

// 资源列表表格
export let tableColumn = [
  {prop: 'code', label: '接口编码', width: 50},
  {prop: 'name', label: '接口名称', width: 50},
  {prop: 'url', label: '接口地址', width: 200},
  {prop: 'method', label: '请求方法', width: 50},
  {prop: 'contentType', label: '请求内容类型', width: 50},
  {prop: 'timeout', label: '超时时间', width: 50},
]

// 资源详情表单
export let detailForm = {
  id: '',
  code: '',//资源编码
  name: '',//资源名称
  threshold: '',//容量阈值
  capacity: '',//剩余容量
  status: '',//资源状态码
  statusText: '',//资源状态
  runningCount: '',
  runningExecutionList: [],
  waitingCount: '',
  waitingExecutionList: []
}

// 等待中表格
export let columnsWait = [
  {colKey: 'executionId', title: '执行id', minWidth: 140, width: 140, align: 'center', ellipsis: true,},
  {colKey: 'taskId', title: '任务id', minWidth: 120, width: 120, align: 'center', ellipsis: true,},
  {colKey: 'priority', title: '优先级', minWidth: 80, width: 80, align: 'center', ellipsis: true,},
  {colKey: 'createTime', title: '创建时间', minWidth: 160, width: 160, align: 'center', ellipsis: true,},
]

export let methodOptions = [
  {label: "GET", value: "GET"},
  {label: "POST", value: "POST"},
]

export let contentTypeOptions = [
  {label: "FORM", value: "FORM"},
  {label: "JSON", value: "JSON"},
]
