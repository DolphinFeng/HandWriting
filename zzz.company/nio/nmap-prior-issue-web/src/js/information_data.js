// 情报上传表格
export let upload_data = [
  {colKey: 'id', title: '序号id', minWidth: 80, width: 80, align: 'center', fixed: 'left'},
  {colKey: 'fileName', title: '文件名', ellipsis: true, minWidth: 200, width: 200, align: 'center'},
  {colKey: 'createTime', title: '任务创建时间', minWidth: 185, width: 185, align: 'center'},
  {colKey: 'userName', title: '用户名', minWidth: 130, width: 130, align: 'center'},
  {colKey: 'description', title: '状态', minWidth: 300, width: 300, align: 'center'},
  {
    colKey: 'op', title: '操作', minWidth: 130, width: 130, align: 'center', fixed: 'right',
    cell: 'op'
  },
]

// 情报查询表单
export let upload_search = {
  userName: null,
  intelligenceId: null,
  intelligenceTaskId: null,
  uploadFrom: null,
  uploadTo: null,
  createFrom: null,
  createTo: null,
  province: null,
  city: null,
  productLineCode: null,
  status: null,
}

// 上传信息查询表格
export let tableColumn = [
  {prop: 'num', label: '序号', width: '80px', sortable: false},
  {prop: 'fileName', label: '情报来源', ellipsis: true, width: '200px', sortable: false},
  {prop: 'info_id', label: '情报id', width: '100px', sortable: false},
  {prop: 'id', label: '任务id', width: '100px', sortable: false},
  {prop: 'inf_created_at', label: '情报创建时间', width: '180px', sortable: 'custom'},
  {prop: 'user_name', label: '用户名', ellipsis: true, width: '160px', sortable: false},
  {prop: 'product_line_name', label: '流程名称', ellipsis: true, width: '180px', sortable: false},
  {prop: 'status_name', label: '情报阶段', ellipsis: true, width: '180px', sortable: false},
  {prop: 'created_at', label: '任务创建时间', width: '180px', sortable: 'custom'},
  {prop: 'province', label: '省份', width: '120px', sortable: false},
  {prop: 'city', label: '城市', width: '120px', sortable: false},
  {prop: 'description', label: '错误描述', ellipsis: true, width: '160px', sortable: false},
  {prop: 'geo', label: '坐标', ellipsis: true, width: '340px', sortable: false},
]

// 情报状态
export let statusOptions = [
  {code: 1, name: '开启任务'},
  {code: 2, name: '任务成功'},
  {code: 3, name: '任务失败'},
]

// 权限控制
export let uploadShow = {
  uploadUploadShow: false,
  uploadDownloadShow: false,
}

// 权限控制
export let infoShow = {
  infoSearchShow: false,
  infoResetShow: false,
}
