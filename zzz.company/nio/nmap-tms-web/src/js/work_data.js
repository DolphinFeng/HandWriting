// 作业管理查询表单
export let work_search = {
  taskId: '',
  taskType: '',
  taskOwner: '',
  workName: '',
  workStatus: '',
  assignee: '',
  workCreateTimeFrom: '',
  workCreateTimeTo: '',
  workStartTimeFrom: '',
  workStartTimeTo: '',
  workCompleteTimeFrom: '',
  workCompleteTimeTo: '',
  workTagKey: '',
}

// 任务信息查询表格
export let workTableColumn = [
  {prop: 'workNum', label: '序号', width: '80px', sortable: false},
  {prop: 'taskId', label: '任务号', width: '100px', sortable: 'custom'},
  {prop: 'taskName', label: '任务名称', width: '160px', sortable: 'custom'},
  {prop: 'lineName', label: '任务类型', width: '120px', sortable: 'custom'},
  {prop: 'workName', label: '作业名称', width: '120px', sortable: 'custom'},
  {prop: 'statusText', label: '作业状态', width: '120px', sortable: 'custom'},
  {prop: 'assignee', label: '作业员id', width: '120px', sortable: 'custom'},
  {prop: 'workTag', label: '作业标签', width: '160px', sortable: 'custom'},
  {prop: 'workCreateTime', label: '创建时间', width: '150px', sortable: 'custom'},
  {prop: 'workStartTime', label: '开始时间', width: '150px', sortable: 'custom'},
  {prop: 'workCompleteTime', label: '完成时间', width: '150px', sortable: 'custom'},
]

// 作业状态
export let workStatusOptions = [
  {name: "未分配", code: 1},
  {name: "已分配", code: 2},
  {name: "作业中", code: 3},
  {name: "已完成", code: 4},
  {name: "已取消", code: 5},
]

// 作业标签
export let workTagOptions = [
  {name: "返修", code: "返修"}
]

// 权限控制
export let workShow = {
  workSearchShow: false,
  workMultipleAssignShow: false,
}
