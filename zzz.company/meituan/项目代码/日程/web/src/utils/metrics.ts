export enum EMetricKey {
  COMMON_LOCAL_STORAGE_SAVED = 'commonLocalStorageSaved', // 全局配置localStorage有缓存比例
  ALL_COMMON_LOCAL_STORAGE_SAME = 'allCommonLocalStorageSame', // 全局配置localStorage有效
  COMMON_LOCAL_STORAGE_DEFAULT = 'commonLocalStorageDefault', // 全局默认配置占比
  HAS_EXCHANGE = 'hasExchange', // 包含邮箱日程
  NO_EXCHANGE_REQUEST_TIME = 'noExchangeRequestTime' // 未勾选邮箱请求时间
}
