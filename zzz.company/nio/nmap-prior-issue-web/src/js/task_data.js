// 任务管理查询表单
export let task_search = {
  id: '',
  type: '',
  name: '',
  priority: '',
  status: '',
  owner: '',
  createTimeFrom: '',
  createTimeTo: '',
  startTimeFrom: '',
  startTimeTo: '',
  finishTimeFrom: '',
  finishTimeTo: '',
  parentId: ''
}

// 任务信息查询表格
export let taskTableColumn = [
  { prop: 'pmsNum', label: '序号', width: '80px', sortable: false },
  { prop: 'id', label: '任务号', width: '90px', sortable: 'custom' },
  { prop: 'parentId', label: '父任务号', width: '120px', sortable: 'custom' },
  { prop: 'name', label: '任务名称', width: '260px', sortable: 'custom' },
  { prop: 'typeName', label: '任务类型', width: '200px', sortable: 'custom' },
  { prop: 'statusText', label: '任务状态', width: '120px', sortable: 'custom' },
  { prop: 'priority', label: '优先级', width: '90px', sortable: 'custom' },
  { prop: 'owner', label: '创建人', width: '120px', sortable: 'custom' },
  { prop: 'createTime', label: '创建时间', width: '180px', sortable: 'custom' },
  { prop: 'startTime', label: '启动时间', width: '180px', sortable: 'custom' },
  { prop: 'finishTime', label: '结束时间', width: '180px', sortable: 'custom' },
]

// 优先级数据集
export let priorityOptions = [
  { name: "很低", code: 1 },
  { name: "低", code: 2 },
  { name: "正常", code: 3 },
  { name: "高", code: 4 },
  { name: "很高", code: 5 },
]

// 任务状态数据集
export let statusOptions = [
  { name: "未启动", code: 1 },
  { name: "执行中", code: 2 },
  { name: "执行失败", code: 3 },
  { name: "已取消", code: 4 },
  { name: "异常终止", code: 5 },
  { name: "正常结束", code: 6 }
]

// 编辑表单
export let updateForm = {
  id: '',
  name: '',
  priority: '',
}

// 创建任务表单
export let createForm = {
  id: '',
  name: '',
  type: '',
  priority: '',
  owner: '',
  remark: '',
  input: {},
}

// 权限控制
export let taskShow = {
  pmsSearchShow: false,
  pmsCreateShow: false,
  pmsCancelShow: false,
  pmsMultipleEditShow: false,
  pmsMultipleAssignShow: false,
  pmsHistoryShow: false,
  pmsSingleEditShow: false,
  pmsSingleAssignShow: false,
  pmsStartShow: false,
}

// 参数信息表格
export let variablesTableColumn = [
  { prop: 'name', label: '变量名', width: '50px' },
  { prop: 'value', label: '变量值', width: '200px' },
  { prop: 'remark', label: '备注', width: '50px' },
]

// 历史信息表格
export let msgTableColumn = [
  { prop: 'activityId', label: '任务环节id', width: '223px' },
  { prop: 'activityName', label: '任务环节名称', width: '160px' },
  { prop: 'activityType', label: '环节类型', width: '160px' },
  { prop: 'assignee', label: '操作人', width: '130px' },
  { prop: 'startTime', label: '任务开始时间', width: '160px' },
  { prop: 'endTime', label: '任务结束时间', width: '160px' },
  { prop: 'durationInMillis', label: '耗时(毫秒)', width: '120px' },
]

// 调用信息表格
export let invokeTableColumn = [
  { prop: 'requestTime', label: '请求时间', width: '100px' },
  { prop: 'responseTime', label: '响应时间', width: '100px' },
  { prop: 'responseContent', label: '响应内容', width: '200px' },
]

// 异常信息表格
export let jobTableColumn = [
  { prop: 'activityId', label: '异常节点', width: '150px' },
  { prop: 'createTime', label: '创建时间', width: '150px' },
  { prop: 'exceptionMessage', label: '异常信息', width: '300px' },
]
