// 任务类型管理查询表单
export let taskTypeSearch = {
  code: '',
  name: '',
  deleted: 0,
}

// 任务类型查询表格
export let taskTypeTableColumn = [
  {prop: 'code', label: '类型编码', width: '200px'},
  {prop: 'name', label: '类型名称', width: '200px'},
  {prop: 'procDefKey', label: '流程定义key', width: '200px'},
  {prop: 'manualCreateText', label: '是否支持手动创建任务', width: '200px'},
  {prop: 'deletedText', label: '是否删除', width: '100px'},
  {prop: 'motifyMessageText', label: '是否开启消息订阅', width: '100px'},
]

// 类型表单
export let formData = {
  code: '',
  name: '',
  procDefKey: '',
  manualCreate: '',
  deleted: '',
  formCode: '',
  notifyMessage: '',
}

export let deletedOptions = [
  {name: "否", code: 0},
  {name: "是", code: 1},
]

// 环境变量表格
export let taskTypeEnvColumn = [
  {prop: 'name', label: '变量名', width: 200},
  {prop: 'value', label: '变量值', width: 300},
  {prop: 'remark', label: '备注', width: 200},
  {prop: 'sequenceNum', label: '顺序号', width: 100},
]

// 环境变量表单
export let env_form = {
  id: '',
  code: '',
  name: '',
  value: '',
  remark: '',
  sequenceNum: '',
}
