import {getSelectOptions} from '../utils/antd';

/**
 * 数据管理相关
 */
export interface DataManageListQuery {
  aipTaskId?: string;
  /** @description 算法版本 */
  algVsn?: string;
  annotationStatus?: string;
  /**
   * Format: int64
   * @description 批次编号
   */
  batchId?: number;
  batchIdList?: number[];
  /** @description 批次IDs，多个用英文逗号分割 */
  batchIds?: string;
  batchMappingTaskIdList?: number[];
  /** @description 刷库任务编号,多个用英文逗号分割 */
  batchMappingTaskIds?: string;
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
  /** @description 城市编号列表 */
  cityCodeList?: string[];
  /** @description 城市名称列表 */
  cityNameList?: string[];
  /** @description 路口编号 */
  crossId?: string;
  crossIdList?: string[];
  /** @description 路口编号,多个用英文逗号分割 */
  crossIds?: string;
  datasetClip?: string;
  datasetName?: string;
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
   * @description 流水号
   */
  mappingResultId?: number;
  /** @description 数据类型 */
  mappingResultType?: string;
  mappingResultTypeList?: string[];
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

/**
 * 数据管理相关
 */
export interface DataManageInList {
  /** @description 算法版本 */
  algVsn?: string;
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
  mappingTaskType?: number;
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
  status?: MAPPING_RESULT_STATUS;
}

/**
 * 数据管理-创建点云建图
 */
export interface CreateMapByPointCloudPayload {
  batchId: number;
  crossId: string;
  materialIds: number[];
  projectId: number;
  taskName: string;
}

/**
 * 数据管理-创建模型建图任务
 */
export interface CreateMapByModelPayload {
  mappingResultId: number;
  taskDesc: string;
  taskName: string;
}
/**
 * 数据管理-模型建图-数据标注
 */
export interface DataDelivery {
  algVsn?: string;
  /** Format: int64 */
  batchId?: number;
  /** @description 城市编号 */
  cityCodes?: string[];
  /** @description 路口场景 */
  crossTags?: number[];
  /** @description 道路等级 */
  crossTypes?: number[];
  /**
   * Format: date-time
   * @description 创建时间查询的截止时间
   */
  endCreateTime?: string;
  orderBy?: string;
  /** Format: int32 */
  pageNo?: number;
  /** Format: int32 */
  pageSize?: number;
  /**
   * Format: int32
   * @description 建图完成路径占比起始
   */
  routeSuccessPerBegin?: number;
  /**
   * Format: int32
   * @description 建图完成路径占比终止
   */
  routeSuccessPerEnd?: number;
  /**
   * Format: int32
   * @description 路口路径总数起始
   */
  routeTotalCountBegin?: number;
  /**
   * Format: int32
   * @description 路口路径总数终止
   */
  routeTotalCountEnd?: number;
  /**
   * Format: date-time
   * @description 创建时间查询的开始时间
   */
  startCreateTime?: string;
  /** Format: int32 */
  tag?: number;
}

//创建送标
export interface createBatchAnnotation {
  algVsn?: string;
  /** Format: int64 */
  batchId?: number;
  /** @description 城市编号 */
  cityCodes?: string[];
  /** @description 路口场景 */
  crossTags?: number[];
  /** @description 道路等级 */
  crossTypes?: number[];
  /**
   * Format: date-time
   * @description 创建时间查询的截止时间
   */
  endCreateTime?: string;
  /** @description 送标数据源ID */
  labelingTaskId?: string;
  orderBy?: string;
  /** Format: int32 */
  pageNo?: number;
  /** Format: int32 */
  pageSize?: number;
  /**
   * Format: int32
   * @description 建图完成路径占比起始
   */
  routeSuccessPerBegin?: number;
  /**
   * Format: int32
   * @description 建图完成路径占比终止
   */
  routeSuccessPerEnd?: number;
  /**
   * Format: int32
   * @description 路口路径总数起始
   */
  routeTotalCountBegin?: number;
  /**
   * Format: int32
   * @description 路口路径总数终止
   */
  routeTotalCountEnd?: number;
  /**
   * Format: date-time
   * @description 创建时间查询的开始时间
   */
  startCreateTime?: string;
  /** Format: int32 */
  tag?: number;
  /** @description 任务描述 */
  taskDesc?: string;
  userName?: string;
}

export enum MAPPING_RESULT_STATUS {
  NEW = 'NEW',
  INVALID = 'INVALID',
  USED = 'USED',
}

//此处加中文描述
export const MAPPING_RESULT_STATUS_DESC: {[key in MAPPING_RESULT_STATUS]: string} = {
  [MAPPING_RESULT_STATUS.NEW]: '未使用',
  [MAPPING_RESULT_STATUS.INVALID]: '无效的',
  [MAPPING_RESULT_STATUS.USED]: '已使用',
};

/**
 * 批次管理-更新批次
 */
export interface UpdateBatchPayload {
  batchId: number;
  batchName: string;
  batchDesc: string;
  processList: string;
  configParamList: any[];
  businessType: number;
  batchMode: number;
}

export const MAPPING_RESULT_STATUSES = Object.entries(MAPPING_RESULT_STATUS_DESC);
export const MAPPING_RESULT_STATUS_OPTIONS = getSelectOptions(MAPPING_RESULT_STATUSES);
