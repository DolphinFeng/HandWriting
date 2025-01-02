import {getSelectOptions} from '../utils/antd';

/**
 * @see  https://nio.feishu.cn/wiki/O0WUwFToXisMfrk6wyaclFvmn8c
 */

/**
 * 路口列表的查询参数
 */
export interface CrossListQuery {
  sitePid?: string;
  adminCodes?: string[];
  cityCode?: number;
  tiles?: number[];
  pvRanks?: number[];
  siteTags?: string[];
  types?: number[];
  pageNo?: number;
  pageSize?: number;
}

/**
 * 场景内Node信息表
 */
export interface CrossNode {
  nodeId: number;
  geometry: string;
  mainNode: boolean;
}

/**
 * 场景关联Road信息
 */
export interface CrossRoad {
  roadId: number;
  geometry: string;
  roadType: number;
}

/**
 * 路口列表的返回结果
 */
export interface CrossInList {
  // 永久编号
  sitePid: string;
  // 位置坐标
  location: string;
  // 图幅号
  tile: number;
  // 行政区划编码(区县级）
  adminCode: number;
  // 场景类型
  type: number;
  // 描述名称
  descName: string;
  // 轨迹热度等级
  pvRank: PV_RANK;
  // 场景标签
  tags: string;
  nodes: CrossNode[];
  roads: CrossNode[];
  // 更新时间
  updateTime: string;
  // 路径数量
  routingNum: number;
}

export enum SITE_TAG {
  URBAN = 'URBAN',
  MULTI_NODE = 'MULTI_NODE',
  U_TURN = 'U_TURN',
  LIGHT = 'LIGHT',
  R_TURN = 'R_TURN',
}

//此处加中文描述
export const SITE_TAG_DESC: {[key in SITE_TAG]: string} = {
  [SITE_TAG.URBAN]: '城区',
  [SITE_TAG.MULTI_NODE]: '多挂接点',
  [SITE_TAG.U_TURN]: '包含掉头口道路',
  [SITE_TAG.LIGHT]: '有红绿灯',
  [SITE_TAG.R_TURN]: '有右转专用道路',
};

export const SITE_TAGS = Object.entries(SITE_TAG_DESC);
export const SITE_TAG_OPTIONS = getSelectOptions(SITE_TAGS);

export enum PV_RANK {
  RANK0 = 0,
  RANK1 = 1,
  RANK2 = 2,
  RANK3 = 3,
  RANK4 = 4,
  RANK5 = 5,
  RANK6 = 6,
  RANK7 = 7,
}

//此处加中文描述
export const PV_RANK_DESC: {[key in PV_RANK]: string} = {
  [PV_RANK.RANK0]: '没有轨迹经过或者没轨迹数据',
  [PV_RANK.RANK1]: '个位数量级轨迹',
  [PV_RANK.RANK2]: '十位数量级轨迹',
  [PV_RANK.RANK3]: '百级轨迹',
  [PV_RANK.RANK4]: '千级轨迹',
  [PV_RANK.RANK5]: '万级轨迹',
  [PV_RANK.RANK6]: '十万级轨迹',
  [PV_RANK.RANK7]: '百万级及以上',
};

export const PV_RANKS = Object.entries(PV_RANK_DESC);
export const PV_RANK_OPTIONS = getSelectOptions(PV_RANKS);