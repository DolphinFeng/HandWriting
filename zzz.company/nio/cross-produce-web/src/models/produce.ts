import {JSONString} from '.';
import {getSelectOptions} from '../utils/antd';

/**
 * 采集任务状态
 */
export enum COLLECT_TASK_STATUS {
  CREATED = 'CREATED',
  NOT_MATCH = 'NOT_MATCH',
  MATCHED = 'MATCHED',
  COLLECTING = 'COLLECTING',
  FINISHED = 'FINISHED',
}

export const COLLECT_TASK_STATUS_DESCRIPTIONS: {[key in COLLECT_TASK_STATUS]: string} = {
  [COLLECT_TASK_STATUS.CREATED]: '已创建',
  [COLLECT_TASK_STATUS.NOT_MATCH]: '匹配失败',
  [COLLECT_TASK_STATUS.MATCHED]: '已匹配',
  [COLLECT_TASK_STATUS.COLLECTING]: '采集中',
  [COLLECT_TASK_STATUS.FINISHED]: '采集完成',
};

export enum TASK_STATUS {
  READY = 0,
  WORKING = 1,
  UNUSED = 3,
  DELETED = 2,
}

export const TASK_STATUS_DESCRIPTIONS: {[key in TASK_STATUS]: string} = {
  [TASK_STATUS.READY]: 'READY',
  [TASK_STATUS.WORKING]: 'WORKING',
  [TASK_STATUS.UNUSED]: 'UNUSED',
  [TASK_STATUS.DELETED]: 'DELETED',
};


export const COLLECT_TASK_STATUSES = Object.entries(COLLECT_TASK_STATUS_DESCRIPTIONS);
export const COLLECT_TASK_STATUS_OPTIONS = getSelectOptions(COLLECT_TASK_STATUSES);

/**
 * 采集数据类型
 */

export interface CollectTaskQuery {
  /**
   * Format: int64
   * @description 批次编号
   */
  batchId?: number;
  /**
   * Format: int32
   * @description 产线模式
   */
  batchMode?: number;
  /**
   * Format: int32
   * @description 产线类型
   */
  businessType?: number;
  /** @description 城市名称列表 */
  cityNameList?: string[];
  /** @description 路口编号 */
  crossId?: string;
  crossIdList?: string[];
  /**
   * Format: date-time
   * @description 创建时间查询的开始时间
   */
  endTime?: string;
  orderBy?: string;
  /** Format: int32 */
  pageNo?: number;
  /** Format: int32 */
  pageSize?: number;
  /**
   * Format: int64
   * @description 项目编号
   */
  projectId?: number;
  /**
   * Format: date-time
   * @description 创建时间查询的开始时间
   */
  startTime?: string;
  /** @description 采集状态 */
  status?: string;
  statusList?: string[];
}

/**
 * 采集任务
 */
export interface CollectTaskInList {
  /**
   * Format: int64
   * @description 批次编号
   */
  batchId?: number;
  /**
   * Format: int32
   * @description 产线模式
   */
  batchMode?: number;
  /** @description 批次名 */
  batchName?: string;
  /**
   * Format: int32
   * @description 产线类型
   */
  businessType?: number;
  /** Format: int64 */
  collectBatchId?: number;
  /**
   * Format: int32
   * @description 采集资料数
   */
  collectMaterialNum?: number;
  /**
   * Format: int32
   * @description 采集路径数,排序字段名：collect_route_num
   */
  collectRouteNum?: number;
  /**
   * Format: int32
   * @description 采集任务数，排序字段名:collect_task_num
   */
  collectTaskNum?: number;
  /** @description 采集平台跳转链接 */
  collectUrl?: string;
  /**
   * Format: int32
   * @description 有数据路径数,排序字段名：collected_route_num
   */
  collectedRouteNum?: number;
  /**
   * Format: int32
   * @description 有数据任务数,排序字段名：collected_task_num
   */
  collectedTaskNum?: number;
  /**
   * Format: date-time
   * @description 任务最早创建时间,排序字段名：create_time
   */
  createTime?: string;
  /** @description 路口编号 */
  crossId?: string;
  /**
   * Format: int32
   * @description 路口类型
   */
  crossType?: number;
  /** @description 路口类型描述 */
  crossTypeDesc?: string;
  /** @description 路口详情链接 */
  detailUrl?: string;
  /**
   * Format: int32
   * @description 有完整数据路径数,排序字段名：entire_route_num
   */
  entireRouteNum?: number;
  /**
   * Format: int32
   * @description 有完整数据任务数,排序字段名：entire_task_num
   */
  entireTaskNum?: number;
  /**
   * Format: int32
   * @description 已结束路径数,排序字段名：finished_route_num
   */
  finishedRouteNum?: number;
  /**
   * Format: int32
   * @description 已结束任务数,排序字段名：finished_task_num
   */
  finishedTaskNum?: number;
  /**
   * Format: int32
   * @description 分叉口数量
   */
  furcationCount?: number;
  /**
   * Format: int64
   * @description 批次路口流水号
   */
  id?: number;
  /**
   * Format: int64
   * @description 项目编号
   */
  projectId?: number;
  /** @description 项目名称 */
  projectName?: string;
  /** @description 执行状态 */
  status?: string;
  /**
   * Format: date-time
   * @description 资料最后回传时间,排序字段名：update_time
   */
  updateTime?: string;
  /**
   * Format: int32
   * @description 筛选资料数
   */
  vectorTrjCount?: number;
}

/**
 * 批次列表
 */
export interface OverWriteBatchQuery {
  businessType?: any;
  batchId?: number;
  batchMappingTaskId?: string;
  batchName?: string;
  endCreateTime?: number;
  orderBy?: string;
  pageNo?: number;
  pageSize?: number;
  projectId?: number;
  startCreateTime?: number;
  status?: string;
}

/**
 * 创建刷库批次参数
 */

export interface CreateOverWriteBatchParams {
  /**
   * Format: int64
   * @description 批次编号
   */
  batchId?: number;
  batchIds?: string;
  /** @description 刷库任务类型 */
  batchMappingTaskType?: string;
  crossId?: string;
  /**
   * Format: date-time
   * @description 筛选待刷数据的截止时间
   */
  endCreateTime?: string;
  /** @description 上一个历史算法版本 */
  lastAlgVsn?: string;
  /**
   * Format: int64
   * @description 项目编号
   */
  projectId?: number;
  sourceMappingResultType?: string;
  /**
   * Format: date-time
   * @description 筛选待刷数据的起始时间
   */
  startCreateTime?: string;
  /** @description 任务描述 */
  taskDesc?: string;
  /** @description 任务名称 */
  taskName?: string;
  userName?: string;
}

/**
 * 资料采集
 */
export interface OverWriteTaskQuery {
  businessType?: any;
  /**
   * Format: int64
   * @description 批次编号
   */
  batchId?: number;
  /** @description 刷库任务编号 */
  batchMappingTaskId?: string;
  /**
   * Format: int64
   * @description 批次名称
   */
  batchName?: number;
  /** @description 路口编号 */
  crossId?: string;
  /** @description 路口任务编号 */
  crossTaskId?: string;
  /** @description 路口任务状态 */
  crossTaskStatus?: string;
  /**
   * Format: date-time
   * @description 创建时间查询的截止时间
   */
  endCreateTime?: string;
  orderBy?: string;
  /** Format: int32 */
  pageSize?: number;
  /**
   * Format: int64
   * @description 项目编号
   */
  projectId?: number;
  /**
   * Format: int32
   * @description 路径总数
   */
  routeTotalCount?: number;
  /**
   * Format: date-time
   * @description 创建时间查询的开始时间
   */
  startCreateTime?: string;
  /** Format: int32 */
  pageNo?: number;
  /** @description 执行状态 */
  status?: string;
}

/**
 * 数据管理-任务类型
 */
export enum TASK_TYPE {
  /** 点云建图 */
  PERCEPTION = 'PERCEPTION',
  /** 点云质检 */
  PERCEPTION_VERIFY = 'PERCEPTION_VERIFY',
  /** 模型建图 */
  MODEL = 'MODEL',
  /** 数据标注 */
  ANNOTATION = 'ANNOTATION',
  /** 推理 */
  INFERENCE = 'INFERENCE',
  /** 批量刷库 */
  BATCH_MODEL_INFERENCE = 'BATCH_MODEL_INFERENCE',
  /** 数据检查 */
  CHECK = 'CHECK',
  /**数据融合 */
  MERGE = 'MERGE',
}

/** 生产任务信息 */
export interface produceTaskDataQuery {
  /** @description 项目编号 */
  batchId?: number;
  branchName?: string;
  /** @description 路口编号 */
  crossId?: string;
  /** @description 变化源编号 */
  diffSourceId?: string;
  /** @description 创建时间查询的截止时间 */
  endTime?: string;
  /** @description 建图成果编号 */
  mappingResultId?: number;
  orderBy?: string;
  pageNo?: number;
  pageSize?: number;
  /** @description 任务类型 */
  produceTaskType?: string;
  productName?: string;
  startIndex?: number;
  /** @description 创建时间查询的开始时间 */
  startTime?: string;
  /** @description 执行状态 */
  status?: string;
  upperDataVersion?: number;
}
/**
 * 生产任务Query参数
 */
export interface ProduceTaskQuery {
  aipTaskId?: string;
  /** @description 算法版本 */
  algVsn?: string;
  /**
   * Format: int64
   * @description 批次编号
   */
  batchId?: number;
  batchIdList?: number[];
  /**
   * Format: int32
   * @description 产线模式
   */
  batchMode?: number;
  /** @description 批次名称 */
  batchName?: string;
  /**
   * Format: int32
   * @description 产线类型
   */
  businessType?: number;
  /** @description 城市名称列表 */
  cityNameList?: string[];
  /** @description 路口编号 */
  crossId?: string;
  crossIdList?: string[];
  /**
   * Format: date-time
   * @description 创建时间查询的截止时间
   */
  endCreateTime?: string;
  /** Format: date-time */
  endEndTime?: string;
  /** Format: int64 */
  flowId?: number;
  /**
   * Format: int64
   * @description 任务编号
   */
  mappingTaskId?: number;
  mappingTaskIdList?: number[];
  /** @description 任务名称 */
  mappingTaskName?: string;
  /** @description 任务类型 */
  mappingTaskType?: string;
  mappingTaskTypeList?: string[];
  orderBy?: string;
  /** Format: int32 */
  pageNo?: number;
  /** Format: int32 */
  pageSize?: number;
  /**
   * Format: int64
   * @description 项目编号
   */
  projectId?: number;
  /** @description 项目名称 */
  projectName?: string;
  /** Format: int32 */
  retryTimesLimit?: number;
  sourceType?: string;
  /**
   * Format: date-time
   * @description 创建时间查询的开始时间
   */
  startCreateTime?: string;
  /** @description 执行状态 */
  status?: string;
  statusList?: string[];
  terminated?: string;
}

export enum PRODUCE_TASK_STATUS {
  //已提交
  SUBMIT = 'SUBMIT',
  //运行中
  RUNNING = 'RUNNING',
  //数据集转存中
  DS_STAGING = 'DS_STAGING',
  //成功
  SUCCESS = 'SUCCESS',
  //失败
  FAILURE = 'FAILURE',
  //已取消
  CANCELED = 'CANCELED',
}

export const PRODUCE_TASK_STATUS_DESCRIPTIONS: {[key in PRODUCE_TASK_STATUS]: string} = {
  [PRODUCE_TASK_STATUS.SUBMIT]: '已提交',
  [PRODUCE_TASK_STATUS.RUNNING]: '运行中',
  [PRODUCE_TASK_STATUS.DS_STAGING]: '数据集转存中',
  [PRODUCE_TASK_STATUS.SUCCESS]: '成功',
  [PRODUCE_TASK_STATUS.FAILURE]: '失败',
  [PRODUCE_TASK_STATUS.CANCELED]: '已取消',
};

export const PRODUCE_TASK_STATUSES = Object.entries(PRODUCE_TASK_STATUS_DESCRIPTIONS);
export const PRODUCE_TASK_STATUS_OPTIONS = getSelectOptions(PRODUCE_TASK_STATUSES);

export interface produceTaskDataInList {
  /**
   * Format: int64
   * @description 批次编号
   */
  batchId?: number;
  /** @description 批次名 */
  batchName?: string;
  /**
   * Format: date-time
   * @description 创建时间
   */
  createTime?: string;
  /** @description 路口编号 */
  crossId?: string;
  /**
   * Format: int32
   * @description 路口类型
   */
  crossType?: number;
  /** @description 路口类型描述 */
  crossTypeDesc?: string;
  /** @description 路口详情链接 */
  detailUrl?: string;
  /** @description 变化源编号 */
  diffSourceId?: string;
  /**
   * Format: int64
   * @description 生产任务类型
   */
  mappingResultId?: number;
  /** @description 任务执行信息 */
  msg?: string;
  /**
   * Format: int64
   * @description 生产任务编号
   */
  produceTaskId?: number;
  /** @description 生产任务类型 */
  produceTaskType?: string;
  /**
   * Format: int64
   * @description 项目编号
   */
  projectId?: number;
  /** @description 项目名称 */
  projectName?: string;
  /** @description 结果存储信息 */
  resultStoreInfo?: string;
  /** @description 执行状态 */
  status?: string;
  /** @description tms任务编号 */
  tmsTaskId?: string;
  /** @description tms任务链接 */
  tmsTaskUrl?: string;
  /**
   * Format: date-time
   * @description 更新时间
   */
  updateTime?: string;
}

/**
 * 生产任务
 */
export interface ProduceTaskInList {
  /** @description 算法版本 */
  algVsn?: string;
  aipTaskUrl?: string;
  /**
   * Format: int64
   * @description 批次编号
   */
  batchId?: number;
  /**
   * Format: date-time
   * @description 任务创建时间
   */
  createTime?: string;
  /** @description 路口编号 */
  crossId?: string;
  /**
   * Format: int32
   * @description 路口类型
   */
  crossType?: number;
  /** @description 数据集clipId */
  datasetClip?: string;
  /** @description 数据集名称 */
  datasetName?: string;
  /**
   * Format: int64
   * @description 流水号
   */
  mappingResultId?: number;
  /**
   * Format: int64
   * @description 任务编号
   */
  mappingTaskId?: number;
  /**
   * Format: int64
   * @description 任务类型
   */
  mappingTaskType?: TASK_TYPE;
  /**
   * Format: int64
   * @description 项目编号
   */
  projectId?: number;
  /** @description 项目名称 */
  projectName?: string;
  /** @description 存储信息 */
  resultStoreInfo?: string;
  /** @description 状态 */
  status: PRODUCE_TASK_STATUS;

  dataVisualUrl?: string;

  bizType: string; 

  siteId: string;

  locationWkt?: string;

  adminCode?: string;

  mesh?: string;

  related?: string;

  kind?: string;

  descName?: string;

  regionWkt?: string;

  cityName?: string;
}

/**
 * 刷库批次的列表
 */
export enum OVERWRITE_BATCH_TASK_STATUS {
  SUBMIT = 'SUBMIT',
  RUNNING = 'RUNNING',
  FINISHED = 'FINISHED',
}

export const OVERWRITE_BATCH_TASK_STATUS_DESCRIPTIONS: {[key in OVERWRITE_BATCH_TASK_STATUS]: string} = {
  [OVERWRITE_BATCH_TASK_STATUS.SUBMIT]: '已提交',
  [OVERWRITE_BATCH_TASK_STATUS.RUNNING]: '运行中',
  [OVERWRITE_BATCH_TASK_STATUS.FINISHED]: '已完成',
};

export const OVERWRITE_BATCH_TASK_STATUSES = Object.entries(OVERWRITE_BATCH_TASK_STATUS_DESCRIPTIONS);
export const OVERWRITE_BATCH_TASK_STATUS_OPTIONS = getSelectOptions(OVERWRITE_BATCH_TASK_STATUSES);

/**
 * 融合任务状态
 */
export enum MERGE_TASK_STATUS {
  //已创建
  CREATED = 'CREATED',
  //已筛选
  SELECTED = 'SELECTED',
  //运行中
  RUNNING = 'RUNNING',
  //已完成
  FINISHED = 'FINISHED',
  //异常
  EXCEPTION = 'EXCEPTION',
  //失败
  FAILURE = 'FAILURE',
  //已取消
  CANCELED = 'CANCELED',
}

export const MERGE_TASK_STATUS_DESCRIPTIONS: {[key in MERGE_TASK_STATUS]: string} = {
  [MERGE_TASK_STATUS.CREATED]: '已创建',
  [MERGE_TASK_STATUS.SELECTED]: '已筛选',
  [MERGE_TASK_STATUS.RUNNING]: '运行中',
  [MERGE_TASK_STATUS.FINISHED]: '已完成',
  [MERGE_TASK_STATUS.EXCEPTION]: '异常',
  [MERGE_TASK_STATUS.FAILURE]: '失败',
  [MERGE_TASK_STATUS.CANCELED]: '已取消',
};

export const MERGE_TASK_STATUSES = Object.entries(MERGE_TASK_STATUS_DESCRIPTIONS);
export const MERGE_TASK_STATUS_OPTIONS = getSelectOptions(MERGE_TASK_STATUSES);

/**
 * 融合任务明细状态
 */
export enum MERGE_TASK_CROSS_STATUS {
  //已筛选
  READY = 'READY',
  //已创建
  CREATED = 'CREATED',
  //融合成功
  SUCCESS = 'SUCCESS',
  //融合失败
  FAILURE = 'FAILURE',
}

export const MERGE_TASK_CROSS_STATUS_DESCRIPTIONS: {[key in MERGE_TASK_CROSS_STATUS]: string} = {
  [MERGE_TASK_CROSS_STATUS.READY]: '已筛选',
  [MERGE_TASK_CROSS_STATUS.CREATED]: '已创建',
  [MERGE_TASK_CROSS_STATUS.SUCCESS]: '融合成功',
  [MERGE_TASK_CROSS_STATUS.FAILURE]: '融合失败',
};

export const MERGE_TASK_CROSS_STATUSES = Object.entries(MERGE_TASK_CROSS_STATUS_DESCRIPTIONS);
export const MERGE_TASK_CROSS_STATUS_OPTIONS = getSelectOptions(MERGE_TASK_CROSS_STATUSES);

/**
 * 打分任务执行状态
 */
export enum EVAL_TASK_STATUS {
  //已创建
  CREATED = 'CREATED',
  //运行中
  RUNNING = 'RUNNING',
  //已完成
  FINISHED = 'FINISHED',
  //已入库
  STORED = 'STORED',
  //异常
  EXCEPTION = 'EXCEPTION',
  //失败
  FAILURE = 'FAILURE',
  //已取消
  CANCELED = 'CANCELED',
}

export const EVAL_TASK_STATUS_DESCRIPTIONS: { [key in EVAL_TASK_STATUS]: string } = {
  [EVAL_TASK_STATUS.CREATED]: '已创建',
  [EVAL_TASK_STATUS.RUNNING]: '运行中',
  [EVAL_TASK_STATUS.FINISHED]: '已完成',
  [EVAL_TASK_STATUS.STORED]: '已入库',
  [EVAL_TASK_STATUS.EXCEPTION]: '异常',
  [EVAL_TASK_STATUS.FAILURE]: '失败',
  [EVAL_TASK_STATUS.CANCELED]: '已取消',
};

export const EVAL_TASK_STATUSES = Object.entries(EVAL_TASK_STATUS_DESCRIPTIONS);
export const EVAL_TASK_STATUS_OPTIONS = getSelectOptions(EVAL_TASK_STATUSES);

/**
 * 刷库任务列表状态
 */
export enum OVERWRITE_TASK_STATUS {
  SUBMIT = 'SUBMIT',
  RUNNING = 'RUNNING',
  DS_STAGING = 'DS_STAGING',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  CANCELED = 'CANCELED',
  EXCEPTION = 'EXCEPTION',
}

export const OVERWRITE_TASK_STATUS_DESCRIPTIONS: {[key in OVERWRITE_TASK_STATUS]: string} = {
  [OVERWRITE_TASK_STATUS.SUBMIT]: '已提交',
  [OVERWRITE_TASK_STATUS.RUNNING]: '运行中',
  [OVERWRITE_TASK_STATUS.DS_STAGING]: '数据集待转存',
  [OVERWRITE_TASK_STATUS.SUCCESS]: '成功',
  [OVERWRITE_TASK_STATUS.FAILURE]: '失败',
  [OVERWRITE_TASK_STATUS.CANCELED]: '已取消',
  [OVERWRITE_TASK_STATUS.EXCEPTION]: '异常',
};

export const OVERWRITE_TASK_STATUSES = Object.entries(OVERWRITE_TASK_STATUS_DESCRIPTIONS);
export const OVERWRITE_TASK_STATUS_OPTIONS = getSelectOptions(OVERWRITE_TASK_STATUSES);

/**
 * 重写库任务
 */
export interface OverWriteTaskInList {
  aipTaskUrl: string;
  batchId: number;
  batchMappingTaskId: number;
  batchName: string;
  crossId: string;
  crossTaskId: number;
  crossTaskStatus: string;
  crossType: string;
  projectName: string;
  routeCollectedCount: number;
  routeTotalCount: number;
  startTime: number;
  status: OVERWRITE_TASK_STATUS;
}

export type OverWriteBatchInList = OverWriteTaskInList & {
  status: OVERWRITE_BATCH_TASK_STATUS;
};

/**
 * 资料详情查询
 */
export interface DataDetailQuery {
  changeBusiness?: number;
  /**
   * Format: int64
   * @description 批次编号
   */
  batchId?: number;
  /**
   * Format: int64
   * @description 采集任务编号
   */
  collectTaskId?: number;
  /** @description 路口编号 */
  crossId?: string;
  /**
   * Format: date-time
   * @description 创建时间查询的开始时间
   */
  endTime?: string;
  eventGroupId?: string;
  /**
   * Format: int64
   * @description 资料编号
   */
  materialId?: number;
  materialIdList?: number[];
  orderBy?: string;
  /** Format: int32 */
  pageNo?: number;
  /** Format: int32 */
  pageSize?: number;
  /**
   * Format: int64
   * @description 项目编号
   */
  projectId?: number;
  /**
   * Format: int64
   * @description 路径编号
   */
  routeId?: number;
  sectionList?: number[];
  /**
   * Format: date-time
   * @description 创建时间查询的开始时间
   */
  startTime?: string;
  /** @description 采集状态 */
  status?: string;
  statusList?: string[];
}

/**
 * 资料详情
 */
export interface DataDetailInList {
  /**
   * Format: int64
   * @description 批次编号
   */
  batchId?: number;
  /** @description 批次名 */
  batchName?: string;
  /**
   * Format: int64
   * @description 采集任务编号
   */
  collectTaskId?: number;
  /** @description 路口编号 */
  crossId?: string;
  /** @description 资料会话编号 */
  eventGroupId?: string;
  /**
   * Format: int64
   * @description 资料编号
   */
  materialId?: number;
  /**
   * Format: int64
   * @description 项目编号
   */
  projectId?: number;
  /** @description 项目名称 */
  projectName?: string;
  recordIdx?: string;
  /**
   * Format: int64
   * @description 路径编号
   */
  routeId?: number;
  /**
   * Format: int32
   * @description 数据分段
   */
  section?: number;
  /** @description 资料使用状态 */
  status?: string;
  /**
   * Format: date-time
   * @description 更新时间
   */
  updateTime?: string;
  /** @description uuid */
  uuid?: string;
}

export interface CollectMaterialQueryInList {
  /** @description 批次编号，批量时提供 */
  batchIds?: string;
  /**
   * Format: int32
   * @description 产线类型
   */
  businessType?: number;
  /** @description 建图实体编号，批量时提供 */
  crossIds?: string;
  /**
   * @description 旧资料是否废弃
   * @example false
   */
  dropOldMaterial?: boolean;
};

/**
 * 批量融合任务查询实体类
 */
export interface MergeTaskInList {
  businessType?: any;
  /**
   * Format: int64
   * @description 批次编号
   */
  batchId?: number;
  /** @description 产品库分支名称 */
  branchName?: string;
  cityList?: string[];
  /** @description 城市名称 */
  cityName?: string;
  /** @description 路口编号 */
  crossId?: string;
  orderBy?: string;
  /** Format: int32 */
  pageNo?: number;
  /** Format: int32 */
  pageSize?: number;
  /** @description 产品库名称 */
  productName?: string;
  /** @description 融合状态 */
  status?: string;
  /** Format: int32 */
  subtaskId?: number;
  /** @description 融合子任务名称 */
  subtaskName?: string;
  /** @description 融合任务名称 */
  taskName?: string;
}

/**
 * 批量融合任务实体类
 */
export interface MergeTaskOutList {
  /** @description base融合任务 */
  baseTask?: string;
  /**
   * Format: int32
   * @description base版本准出但新版本未准出的路径数量<=
   */
  baseValidRouteNum?: number;
  /**
   * Format: double
   * @description base版本准出但新版本未准出路径数量占比<=
   */
  baseValidRouteRate?: number;
  /** @description 批次编号列表字符串，英文逗号分隔 */
  batchList?: string;
  /** @description 产品库分支 */
  branchName?: string;
  /**
   * Format: int32
   * @description 产线类型
   */
  businessType?: number;
  /** @description 城市名称列表字符串，英文逗号分隔 */
  cityList?: string;
  /** Format: date-time */
  createTime?: string;
  /**
   * Format: int32
   * @description 路口总量
   */
  crossNum?: number;
  crossStatistics?: string;
  /** @description 路口类型编号列表字符串，英文逗号分隔 */
  crossTypeList?: string;
  /** @description 路口类型路口量 */
  crossTypeStatistics?: string;
  /**
   * Format: int32
   * @description 新版本准出但base版本未准出的路径数量>=
   */
  curValidRouteNum?: number;
  /**
   * Format: double
   * @description 新版本准出但base版本未准出的路径数数量占比>=
   */
  curValidRouteRate?: number;
  /** @description 数据规格 */
  dataSpec?: string;
  /** @description 推理打分算法版本 */
  evalAlgVsn?: string;
  /** @description 调度方式 */
  execMode?: string;
  /** @description 推理算法版本 */
  inferAlgVsn?: string;
  /** @description 推理算法版本量 */
  inferAlgVsnStatistics?: string;
  /** @description 融合版本 */
  mergeTaskType?: string;
  operator?: string;
  /** @description 产品库名称 */
  productName?: string;
  /** @description 融合状态 */
  status?: string;
  /** @description 融合子任务描述 */
  subtaskDesc?: string;
  /**
   * Format: int32
   * @description 融合任务ID
   */
  subtaskId?: number;
  /** @description 融合子任务名称 */
  subtaskName?: string;
  /** @description 融合任务名称 */
  taskName?: string;
  /** @description 融合流程配置 */
  tmsConfig?: string;
  tmsTaskId?: string;
  /** Format: date-time */
  updateTime?: string;
  /**
   * @description 是否启用推理排序
   * @example false
   */
  useCompare?: boolean;

  compareSelectType?: string;

  batchMappingTaskIds?: string;
}

/**
 * 批量融合路口任务明细实体类
 */
export interface MergeTaskCrossOutList {
  /** @description base融合任务 */
  baseTask?: string;
  /**
   * Format: int32
   * @description base版本准出但新版本未准出的路径数量<=
   */
  baseValidRouteNum?: number;
  /**
   * Format: double
   * @description base版本准出但新版本未准出路径数量占比<=
   */
  baseValidRouteRate?: number;
  /** @description 批次编号列表字符串，英文逗号分隔 */
  batchList?: string;
  /** @description 产品库分支 */
  branchName?: string;
  /** @description 城市名称列表字符串，英文逗号分隔 */
  cityList?: string;
  /** Format: date-time */
  createTime?: string;
  /**
   * Format: int32
   * @description 路口总量
   */
  crossNum?: number;
  crossStatistics?: string;
  /** @description 路口类型编号列表字符串，英文逗号分隔 */
  crossTypeList?: string;
  /**
   * Format: int32
   * @description 新版本准出但base版本未准出的路径数量>=
   */
  curValidRouteNum?: number;
  /**
   * Format: double
   * @description 新版本准出但base版本未准出的路径数数量占比>=
   */
  curValidRouteRate?: number;
  /** @description 数据规格 */
  dataSpec?: string;
  /** @description 推理打分算法版本 */
  evalAlgVsn?: string;
  /** @description 调度方式 */
  execMode?: string;
  /** @description 推理算法版本 */
  inferAlgVsn?: string;
  /** @description 融合版本 */
  mergeTaskType?: string;
  operator?: string;
  /** @description 产品库名称 */
  productName?: string;
  /** @description 融合状态 */
  status?: string;
  /** @description 融合子任务描述 */
  subtaskDesc?: string;
  /**
   * Format: int32
   * @description 融合任务ID
   */
  subtaskId?: number;
  /** @description 融合子任务名称 */
  subtaskName?: string;
  /**
   * @description 是否同步至PG
   * @example false
   */
  syncPg?: boolean;
  /** @description 融合任务名称 */
  taskName?: string;
  tmsTaskId?: string;
  /** Format: date-time */
  updateTime?: string;
  /**
   * @description 是否启用推理排序
   * @example false
   */
  useCompare?: boolean;

  compareSelectType?: string;

  batchMappingTaskIds?: string;
}

/**
 * 创建融合任务实体类
 */
export interface CreateMergeTaskInList {
  /** @description base融合任务 */
  baseTask?: string;

  crossIdList?: string;

  /**
   * Format: int32
   * @description base版本准出但新版本未准出的路径数量<=
   */
  baseValidRouteNum?: number;
  /**
   * Format: double
   * @description base版本准出但新版本未准出路径数量占比<=
   */
  baseValidRouteRate?: number;
  /** @description 批次编号列表字符串，英文逗号分隔 */
  batchList?: string;
  /** @description 城市名称列表字符串，英文逗号分隔 */
  cityList?: string;
  /** Format: date-time */
  createTime?: string;
  /**
   * Format: int32
   * @description 路口总量
   */
  crossNum?: number;
  crossStatistics?: string;
  /** @description 路口类型编号列表字符串，英文逗号分隔 */
  crossTypeList?: string;
  /**
   * Format: int32
   * @description 新版本准出但base版本未准出的路径数量>=
   */
  curValidRouteNum?: number;
  /**
   * Format: double
   * @description 新版本准出但base版本未准出的路径数数量占比>=
   */
  curValidRouteRate?: number;
  /** @description 推理打分算法版本 */
  evalAlgVsn?: string;
  /** @description 推理算法版本 */
  inferAlgVsn?: string;
  operator?: string;
  /** @description 融合状态 */
  status?: string;
  /** @description 融合子任务描述 */
  subtaskDesc?: string;
  /**
   * Format: int32
   * @description 融合任务ID
   */
  subtaskId?: number;
  /** @description 融合子任务名称 */
  subtaskName?: string;
  /** @description 融合任务名称 */
  taskName?: string;
  /** @description 融合流程配置 */
  tmsConfig?: string;
  tmsTaskId?: string;
  /** Format: date-time */
  updateTime?: string;
  /**
   * @description 是否启用推理排序
   * @example false
   */
  useCompare?: boolean;

  projectIdList? : string;

  compareSelectType?: string;

  batchMappingTaskIds?: string;
}

//"融合任务名称实体类":
export interface TaskNameList {
  /** Format: date-time */
  createTime?: string;
  subtaskNameList?: {
    /** @description 融合子任务名称 */
    subtaskName?: string;
  }[];
  /** @description 融合任务名称 */
  taskName?: string;
}
