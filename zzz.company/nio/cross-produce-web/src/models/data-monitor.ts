export interface ProjectProgressListQuery {
  /** @description 批次编号列表 */
  batchIdList?: number[];
  /** @description 产线类型 */
  bizType?: number;
  /** @description 城市编码列表，例如：3101 */
  cityCodeList?: string[];
  /** @description 城市分类 */
  cityLevel?: number;
  /** @description 城市名列表 */
  cityNameList?: string[];
  /** @description 结束时间 */
  endTime?: string;
  flushCache?: boolean;
  /** @description 环节名称 */
  processKey?: string;
  /** @description 项目编号 */
  projectId?: number;
  /** @description 开始时间 */
  startTime?: string;
}

export interface GetCityCrossNumQuery {
  /** @description 批次编号列表 */
  batchIdList?: number[];
  /** @description 产线类型 */
  bizType?: number;
  /** @description 城市编码列表，例如：3101 */
  cityCodeList?: string[];
  /** @description 城市分类 */
  cityLevel?: number;
  /** @description 城市名列表 */
  cityNameList?: string[];
  /** @description 结束时间 */
  endTime?: string;
  flushCache?: boolean;
  /** @description 环节名称 */
  processKey?: string;
  /** @description 项目编号 */
  projectId?: number;
  /** @description 开始时间 */
  startTime?: string;
}

export interface GetCrossNumByCityLevel {
  /** @description 批次编号列表 */
  batchIdList?: number[];
  /** @description 产线类型 */
  bizType?: number;
  /** @description 城市编码列表，例如：3101 */
  cityCodeList?: string[];
  /** @description 城市分类 */
  cityLevel?: number;
  /** @description 城市名列表 */
  cityNameList?: string[];
  /** @description 结束时间 */
  endTime?: string;
  flushCache?: boolean;
  /** @description 环节名称 */
  processKey?: string;
  /** @description 项目编号 */
  projectId?: number;
  /** @description 开始时间 */
  startTime?: string;
}

/**
 * 数据监控
 */
export interface ProjectProgressInList {
  /**
   * Format: int64
   * @description 批次路口数
   */
  batchCrossNum?: number;
  /**
   * Format: int64
   * @description 已采集路口数
   */
  collectCrossNum?: number;
  /**
   * Format: int64
   * @description 生产路口数
   */
  crossNum?: number;
  /** @description 日期 */
  date?: string;
  /**
   * Format: int64
   * @description 失败路口数
   */
  failureCrossNum?: number;
  /**
   * Format: int64
   * @description 失败任务数
   */
  failureTaskNum?: number;
  /** @description 生产环节 */
  processKey?: string;
  /** @description 生产环节显示名 */
  processName?: string;
  /**
   * Format: int64
   * @description 执行中任务数
   */
  runningTaskNum?: number;
  /**
   * Format: int64
   * @description 交付路口数
   */
  successCrossNum?: number;
  /**
   * Format: int64
   * @description 成功任务数
   */
  successTaskNum?: number;
  /**
   * Format: int64
   * @description 任务数
   */
  taskNum?: number;
  /**
   * Format: int64
   * @description 采集路口数
   */
  validCrossNum?: number;
  /**
   * Format: int64
   * @description 有效任务数
   */
  validTaskNum?: number;
}

export interface ProgressDailyTask {
  /**
   * Format: int64
   * @description 累计失败任务数
   */
  addedFailureTaskNum?: number;
  /**
   * Format: int64
   * @description 累计成功任务数
   */
  addedSuccessTaskNum?: number;
  /**
   * Format: int64
   * @description 累计任务数
   */
  addedTaskNum?: number;
  /** Format: int64 */
  crossNum?: number;
  /** @description 日期 */
  date?: string;
  /**
   * Format: int64
   * @description 失败任务数
   */
  failureTaskNum?: number;
  /**
   * Format: int64
   * @description 执行中任务数
   */
  runningTaskNum?: number;
  /**
   * Format: int64
   * @description 成功任务数
   */
  successTaskNum?: number;
  /**
   * Format: int64
   * @description 任务数
   */
  taskNum?: number;
  /**
   * Format: int64
   * @description 有效任务数
   */
}

export interface GetCityCrossNumList {
  /**
   * Format: int64
   * @description 检查通过路口数
   */
  checkCrossNum?: number;
  /** @description 城市编码 */
  cityCode?: string;
  /** @description 城市等级 */
  cityLevel?: string;
  /** @description 城市名 */
  cityName?: string;
  /**
   * Format: int32
   * @description 城市序号
   */
  cityOrder?: number;
  /**
   * Format: int64
   * @description 下发采集路口数
   */
  collectCrossNum?: number;
  /**
   * Format: int64
   * @description 资料回流路口数
   */
  collectedCrossNum?: number;
  /**
   * Format: int64
   * @description 创建路口数
   */
  createCrossNum?: number;
  /**
   * Format: int64
   * @description 推理路口数
   */
  inferenceCrossNum?: number;
  /**
   * Format: int64
   * @description 融合成功路口数
   */
  mergeCrossNum?: number;
  /**
   * Format: int64
   * @description 模型建图路口数
   */
  modelCrossNum?: number;
  /**
   * Format: int64
   * @description 点云建图路口数
   */
  perceptionCrossNum?: number;
}

export interface GetCityNumListByProcess {
  /**
   * Format: int64
   * @description 批次路口数
   */
  batchCrossNum?: number;
  /**
   * Format: int64
   * @description 已采集路口数
   */
  collectCrossNum?: number;
  /**
   * Format: int64
   * @description 生产路口数
   */
  crossNum?: number;
  /** @description 日期 */
  date?: string;
  /**
   * Format: int64
   * @description 失败路口数
   */
  failureCrossNum?: number;
  /**
   * Format: int64
   * @description 失败任务数
   */
  failureTaskNum?: number;
  /**
   * Format: int64
   * @description 无效路口数
   */
  invalidCrossNum?: number;
  /**
   * Format: int64
   * @description 无效任务数
   */
  invalidTaskNum?: number;
  /** @description 生产环节 */
  processKey?: string;
  /** @description 生产环节显示名 */
  processName?: string;
  /**
   * Format: int64
   * @description 执行中任务数
   */
  runningTaskNum?: number;
  /**
   * Format: int64
   * @description 交付路口数
   */
  successCrossNum?: number;
  /**
   * Format: int64
   * @description 成功任务数
   */
  successTaskNum?: number;
  /**
   * Format: int64
   * @description 任务数
   */
  taskNum?: number;
  /**
   * Format: int64
   * @description 有效路口数
   */
  validCrossNum?: number;
  /**
   * Format: int64
   * @description 有效任务数
   */
  validTaskNum?: number;
}
