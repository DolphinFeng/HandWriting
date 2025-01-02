// 版本管理表格
export let tableColumn = [
  {prop: 'exceptionNum', label: '序号', width: '80'},
  {prop: 'productIdentity', label: '产品名称', width: '180'},
  {prop: 'releaseVersion', label: '版本号', width: '220'},
  {prop: 'tag', label: 'tag', width: '160'},
  {prop: 'checkStatus', label: '检查状态', width: '150'},
  {prop: 'compileStatus', label: '编译状态', width: '150'},
  {prop: 'referenceStr', label: '版本适配', width: '240'},
  {prop: 'createTime', label: '创建时间', width: '190'},
]

//检查状态
export let checkStatusOptions = [
  {value: 'UNCHECKED', label: '检查未完成'},
  {value: 'CHECK_PASS', label: '检查通过'},
  {value: 'CHECK_FAILED', label: '检查未通过'},
]

// 编译状态
export let compileStatusOptions = [
  {value: 'NOT_COMPILED', label: '编译未完成'},
  {value: 'SUCCESS', label: '编译通过'},
  {value: 'FAILED', label: '编译未通过'},
]

// 众包数据类型数据
export let specificationCsOptions = [
  {code: 'NAD2.09', name: 'NAD2.09'},
  {code: 'NAD2.08', name: 'NAD2.08'},
  {code: 'NAD2.07', name: 'NAD2.07'},
  {code: 'NAD2.06', name: 'NAD2.06'},
  {code: 'NAD2.05', name: 'NAD2.05'},
  {code: 'NAD2.04', name: 'NAD2.04'}
]
