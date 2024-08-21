/**
 * 参与者反馈类型
 * 全部
 * 未响应
 * 接受
 * 暂定
 *拒绝
 */
export enum EFeedbackType {
  All = -1,
  Default = 0,
  Accept = 1,
  Tentative = 2,
  Refuse = 3,
  Conflict = 4 // 用于冲突展示，和其它类型是不同的集合
}
