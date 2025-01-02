// 运行状态
export let runOptions = [
  {value: 'ALL', label: '全部'},
  {value: 'SUCCESS', label: '成功'},
  {value: 'RUNNING', label: '运⾏中'},
  {value: 'FAILURE', label: '失败'},

  {value: 'CREATED', label: '已创建'},
  {value: 'SUBMITTED', label: '已提交'},
  {value: 'STOPPED', label: '终止'},
]

// 资料平台表格
export let tableColumn = [
  // {prop: 'dataType', label: '数据类型id', width: 140},
  // {prop: 'dataTypeName', label: '数据类型', width: 140},
  // {prop: 'taskParam', label: '任务参数', width: 200, ellipsis: true,},
  // {prop: 'taskStatus', label: '执行状态id', width: 100},
  {prop: 'taskStatusName', label: '执行状态', width: 100},
  {prop: 'subtaskNum', label: '子任务数', width: 100},
  {prop: 'createTime', label: '创建时间', width: 200},
  {prop: 'finishTime', label: '结束时间', width: 200},
]

// 子任务列表
export let columnsChildren = [
  // {prop: 'subtaskId', label: '子任务编号', width: 140},
  // {prop: 'subtaskNo', label: '子任务序号', width: 140},
  // {prop: 'params', label: '执行参数', width: 200, ellipsis: true,},
  // {prop: 'subtaskStatus', label: '执行状态id', width: 100},
  {prop: 'subtaskStatusName', label: '执行状态', width: 100},
  {prop: 'createTime', label: '创建时间', width: 200},
  {prop: 'finishTime', label: '结束时间', width: 200},
]

// 父任务信息
export let fatherForm = {
  taskId: '',
  taskTypeName: '',
  taskStatusName: '',
  createTime: '',
  finishTime: '',
  taskParams: '',
}
