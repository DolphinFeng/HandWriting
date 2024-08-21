export const ERROR_CODE = [
  // 未知异常（默认）
  { code: '', message: '未知异常', icon: 'dx-callock' },
  { code: 'REQUEST_TIMEOUT', message: '请求超时，请稍后再试' },
  { code: 'REQUEST_DISCONNECT', message: '网络异常，请稍后再试' },
  // 确认异常
  { code: 'INVALID_SCHEDULE', message: '该日程已被取消', icon: 'dx-calcancelcalendar' }, // 该日程已失效
  { code: 'PERMISSION_REJECT', message: '非日程参与人无法查看日程详情', icon: 'dx-callock' }, // 权限不匹配，拒绝操作
  { code: 'NOT_EXIST_SCHEDULE', message: '该日程不存在' },
  { code: 'INVALID_PARAMETER', message: '输入参数不合法' },
  { code: 'CURRENT_USER_NOT_SHARER', message: '当前用户不是日程组织者的共享人' }
]
