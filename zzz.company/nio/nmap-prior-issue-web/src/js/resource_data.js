// 资源表单
export let formData = {
  code: '',
  name: '',
  threshold: '',
  status: ''
}

// 资源列表表格
export let tableColumn = [
  {prop: 'code', label: '资源编码', width: 120},
  {prop: 'name', label: '资源名称', width: 120},
  {prop: 'threshold', label: '容量阈值', width: 120},
  {prop: 'capacity', label: '剩余容量', width: 120},
  {prop: 'statusText', label: '资源状态', width: 120},
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

// 资源状态
export let statusOptions = [
  {name: "正常", code: 0},
  {name: "熔断", code: 1},
]
