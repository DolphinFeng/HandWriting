// 套餐详情：规则列表
export let columnsChildren = [
  {prop: 'childNum', label: '序号', width: '50'},
  {prop: 'ruleCode', label: '规则编号', width: '150'},
  {prop: 'ruleDesc', label: '规则描述', width: '150'},
  {prop: 'errCode', label: '错误编码', width: '100'},
  {prop: 'errDesc', label: '错误描述', width: '150'},
]

// 变更历史：历史数据列表
export let columnsHistoryChildren = [
  {prop: 'historyNum', label: '序号', width: '80'},
  {prop: 'content', label: '变更内容', width: '300'},
  {prop: 'operator', label: '操作人', width: '140'},
  {prop: 'operateTime', label: '操作时间', width: '180'},
]

// 目标要素列表
export let targetsList = ['Road', 'Name', 'NameRelation', 'RoadAttribute', 'RoadNode', 'RoadConnectivity', 'CSH', 'HSRelation', 'JunctionArea', 'LaneMarking', 'LaneMarkingAttribute', 'Lane', 'LaneConnectivity', 'FeaturePoint', 'RoadMark', 'TrafficSign', 'SubTrafficSign', 'RestrictionGroup', 'RestrictionPoint', 'RestrictionLine', 'LineFacility', 'TrafficLight', 'StopLine', 'TrafficControl', 'ObjectRelation', 'Tile', 'Admin', 'SourceInfo', 'LaneAttribute', 'Lamp', 'Toll', 'SiteArea',]

// 重要等级列表
export let LevelsList = ['S', 'A', 'B', 'C',]

// 规则表格
export let tableRuleColumn = [
  // {prop: 'ruleDesc', label: '规则描述', width: '220'},
  {prop: 'ruleType', label: '规则类型', width: '120'},
  {prop: 'targetTable', label: '⽬标要素', width: '120'},
  {prop: 'targetField', label: '⽬标字段', width: '120'},
  {prop: 'errCode', label: '错误代码', width: '100'},
  {prop: 'errDesc', label: '错误描述', width: '300'},
  {prop: 'impLevel', label: '重要等级', width: '100'},
  // {prop: 'params', label: '规则参数', width: '200'},
  // {prop: 'runStatus', label: '执⾏状态id', width: '100'},
  // {prop: 'runStatusName', label: '执行状态', width: '100'},
  {prop: 'updateTime', label: '更新时间', width: '200'},
];

// 规则详情表格
export let detailForm = {
  id: "",
  ruleCode: "",
  ruleName: "",
  targetTable: "",
  targetField: "",
  refTable: "",
  refField: "",
  errCode: "",
  errDesc: "",
  impLevel: "",
  params: "",
  misInfo: "",
  runStatus: "",
  suite:"",
}

// 执行状态option
export let runStatusOption = [
  {value: 'open', label: '正常'},
  {value: 'close', label: '关闭'},
]

// 检查结果表格信息
export let columnsResults = [
  {prop: 'resultsNum', label: '序号', width: '80'},
  {prop: 'taskId', label: '任务号', width: '150'},
  {prop: 'uuid', label: 'uuid', width: '180'},
  {prop: 'step', label: 'step', width: '100'},
  {prop: 'checkId', label: '规则号', width: '180'},
  {prop: 'tableName', label: '检查表', width: '150'},
  {prop: 'impLevel', label: '重要等级', width: '120'},
  {prop: 'manualMisName', label: '编辑确认状态', width: '150'},
  {prop: 'checkStatus', label: '质检确认状态', width: '150'},
  {prop: 'misFlagName', label: '是否误报', width: '120'},
]

// 例外管理表格信息
export let columnsException = [
  {prop: 'exceptionNum', label: '序号', width: '80'},
  {prop: 'pkId', label: '主键ID', width: '150'},
  {prop: 'checkId', label: '规则号', width: '150'},
  {prop: 'errCode', label: '错误编码', width: '150'},
  {prop: 'taskId', label: '任务号', width: '150'},
  {prop: 'inserttime', label: '写入时间', width: '180'},
]

// status状态数据集
export let statusName = [
  {value: 0, label: '默认'},
  {value: 1, label: '需修改'},
  {value: 2, label: '误报'},
  {value: 3, label: '范围外'},
]
