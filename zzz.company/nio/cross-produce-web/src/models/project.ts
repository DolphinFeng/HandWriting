import {TimeStamp} from '.';
import {components} from './openapi';

/**
 * 列表中的 Project
 */
export interface ProjectInList {
  createTime: TimeStamp;
  operator: string;
  projectDesc: string;
  projectId: number;
  projectName: string;
  status: ProjectStatus;
  updateTime: TimeStamp;
}

/**
 * 问郭杰
 */
export enum ProjectStatus {}
export enum BatchStatus {}

export interface ConfigParamList {
  /**
   * Format: int64
   * @description 参数编号
   */
  id?: number;
  /** @description 操作员 */
  operator?: string;
  /** @description 参数描述 */
  paramDesc?: string;
  /** @description 参数名称 */
  paramName?: string;
  /** @description 参数类型 */
  paramType?: string;
  /** @description 参数值 */
  paramValue?: string;
  /**
   * Format: date-time
   * @description 更新时间
   */
  updateTime?: string;
  /** @description 参数值类型 */
  valueType?: string;
}

export interface BatchInList {
  /** @description 批次描述 */
  batchDesc?: string;
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
  configParam?: string;
  /** @description 批次配置参数列表 */
  configParamList?: components['schemas']['配置参数类'][];
  /**
   * Format: date-time
   * @description 创建时间
   */
  createTime?: string;
  /**
   * Format: int32
   * @description 路口数量
   */
  crossNum?: number;
  /** @description 操作员 */
  operator?: string;
  /** @description 批次环节列表 */
  processList?: string;
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
   * @description 更新时间
   */
  updateTime?: string;
}

export interface PublicConfig {
  /**
   * Format: int64
   * @description 参数编号
   */
  id?: number;
  /** @description 操作员 */
  operator?: string;
  /** @description 参数描述 */
  paramDesc?: string;
  /** @description 参数名称 */
  paramName: string;
  /** @description 参数类型 */
  paramType?: string;
  /** @description 参数值 */
  paramValue?: string;
  /**
   * Format: date-time
   * @description 更新时间
   */
  updateTime?: string;
  /** @description 参数值类型 */
  valueType?: string;
}
