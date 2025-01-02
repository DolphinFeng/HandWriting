// 问题列表：表格
export let classify_table = [
  {colKey: 'row-select', type: 'multiple', width: 50, align: 'center', fixed: 'left'},
  {colKey: 'id', title: '问题ID', ellipsis: true, minWidth: 80, width: 80, align: 'center', fixed: 'left'},
  {colKey: 'source_name', title: '来源平台', ellipsis: true, minWidth: 180, width: 180, align: 'center'},
  {colKey: 'mesh', title: '图幅号', ellipsis: true, minWidth: 120, width: 120, align: 'center'},
  {colKey: 'tag_auto_name', title: '问题分类', ellipsis: true, minWidth: 180, width: 180, align: 'center'},
  {colKey: 'insert_time', title: '创建时间', ellipsis: true, minWidth: 190, width: 190, align: 'center'},
]

// 问题分类
export let tag_auto_options = [
  {value: '0', label: '未知'},
  {value: '1001', label: 'change_type超值域'},
  {value: '1002', label: 'layer_type超值域'},
  {value: '1003', label: 'feature_id值为0or空'},
  {value: '1004', label: 'geometry异常'},
  {value: '1005', label: 'start_point异常'},
  {value: '1006', label: 'end_point异常'},
  {value: '1007', label: 'change_geometry_before异常'},
  {value: '1008', label: 'change_attribute_after异常'},
  {value: '1009', label: 'change_attribute_before异常'},
  {value: '1010', label: '非空字段为0or空'},
  {value: '100X', label: '变化源入库算法失败'},
  {value: '2001', label: 'id未匹配成功'},
  {value: '2002', label: '距离未匹配成功'},
  {value: '2003', label: '坐标无效'},
  {value: '2004', label: '位置变化，属性相同'},
  {value: '2005', label: '限速值超出值域'},
  {value: '200X', label: '匹配算法失败'},
  {value: '3001', label: '变化源距离小于9米'},
  {value: '3002', label: '规格超出值域'},
  {value: '3003', label: '变化源关联道路错误'},
  {value: '3004', label: '类型与颜色位数不匹配'},
  {value: '300X', label: '自动融合算法失败'},
  {value: '4001', label: '自动检查未通过'},
  {value: '400X', label: '产品发布失败'},
  {value: '5001', label: 'layer不存在'},
  {value: '5002', label: 'feature不存在'},
  {value: '5004', label: '批车道级限速时冗余'},
]

//问题严重度
export let severity_options = [
  {value: 1, label: 'A级'},
  {value: 2, label: 'B级'},
  {value: 3, label: 'C级'},
]

// 问题优先级
export let priority_options = [
  {value: 1, label: '高'},
  {value: 2, label: '中'},
  {value: 3, label: '低'},
]
