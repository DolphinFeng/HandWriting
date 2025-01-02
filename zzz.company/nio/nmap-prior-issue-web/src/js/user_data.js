//人员默认表格
export let personas_table = [
  {colKey: 'row-select', type: 'multiple', width: 50, align: 'center', fixed: 'left'},
  {colKey: 'id', title: '用户编码', ellipsis: true, minWidth: 110, width: 110, align: 'center',},
  {colKey: 'realName', title: '姓名', ellipsis: true, minWidth: 180, width: 180, align: 'center'},
  {colKey: 'roleNameStr', title: '角色', ellipsis: true, minWidth: 180, width: 180, align: 'center'},
  {colKey: 'userName', title: '账号', ellipsis: true, minWidth: 170, width: 170, align: 'center'},
  {colKey: 'level', title: '水平', minWidth: 90, width: 90, align: 'center'},
  {colKey: 'supplier', title: '供应商', ellipsis: true, minWidth: 190, width: 190, align: 'center'},
  {colKey: 'skillCodeName', title: '技能', ellipsis: true, minWidth: 350, width: 350, align: 'center'},
  {colKey: 'entryTime', title: '入职时间', ellipsis: true, minWidth: 160, width: 160, align: 'center'},
  {colKey: 'userStatus', title: '在职状态', minWidth: 110, width: 110, align: 'center'},
  {colKey: 'numberStatusName', title: '账号状态', minWidth: 110, width: 110, align: 'center'},
  {
    colKey: 'op', title: '操作', minWidth: 120, width: 120, align: 'center', fixed: 'right',
    cell: 'op'
  },
];

//单条修改
export let personasForm = {
  id: '',
  realName: '',
  roleIds: [],
  skillCode: '',
  level: '',
  userStatus: '',
  numberStatus: '',
  supplier: '',
  userName: '',
  entryTime: '',
  skill_list: [],
  email: ''
};

//多条修改
export let multipleForm = {
  idStr: '',
  roleIds: [],
  skillCode: '',
  level: '',
  userStatus: '',
  numberStatus: '',
  supplier: '',
};

// 水平
export let levelOptions = [
  {code: 1, name: '1'},
  {code: 2, name: '2'},
  {code: 3, name: '3'},
];

// 供应商前端假数据
export let supplierOptions = [
  {code: '供应商1', name: '供应商1'},
  {code: '供应商2', name: '供应商2'},
  {code: '供应商3', name: '供应商3'},
];

// 菜单类型数据
export let typeOptions = [
  {code: 0, name: '菜单'},
  {code: 1, name: '列表'},
  {code: 2, name: '按钮'},
]

// 菜单类型数据
export let numberStatusOptions = [
  {code: 0, name: '正常'},
  {code: 1, name: '禁用'},
]

//角色管理表格
// export let role_table = [
//   {colKey: 'id', title: '角色ID', ellipsis: true, minWidth: 110, width: 110, align: 'center',},
//   {colKey: 'name', title: '角色名称', ellipsis: true, minWidth: 130, width: 130, align: 'center'},
//   {colKey: 'createTime', title: '创建时间', minWidth: 160, width: 160, align: 'center'},
//   {colKey: 'updateTime', title: '更新时间', minWidth: 160, width: 160, align: 'center'},
//   {
//     colKey: 'op', title: '操作', minWidth: 180, width: 180, align: 'center', fixed: 'right',
//     cell: 'op'
//   },
// ];
export const role_table = [
  {label: "角色ID", prop: "id", width: "180",},
  {label: "角色名称", prop: "name", width: "",},
  {label: "创建时间", prop: "createTime", width: "",},
  {label: "更新时间", prop: "updateTime", width: "",},
]
//角色管理表格
export let menu_table = [
  {colKey: 'code', title: '权限编码', ellipsis: true, minWidth: 130, width: 130, align: 'center'},
  {colKey: 'id', title: '权限ID', ellipsis: true, minWidth: 100, width: 100, align: 'center'},
  {colKey: 'menuName', title: '菜单名称', ellipsis: true, minWidth: 170, width: 170, align: 'center'},
  {colKey: 'typeName', title: '菜单类型', minWidth: 100, width: 100, align: 'center'},
  {colKey: 'createBy', title: '创建人', ellipsis: true, minWidth: 170, width: 170, align: 'center'},
  {
    colKey: 'op', title: '操作', minWidth: 180, width: 180, align: 'center', fixed: 'right',
    cell: 'op'
  },
];
