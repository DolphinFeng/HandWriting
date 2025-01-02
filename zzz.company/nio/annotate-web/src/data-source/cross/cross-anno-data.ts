import {CrossRouteInfo} from './cross-material.ts';
/**
 * 路口作业数据实体：打标数据和质检数据
 */

enum CROSS_QUALITY_TYPE {
  TOO_MUCH = 1,
  WRONG = 2,
  TOO_LITTLE = 3,
}

export const CROSS_QUALITY_TYPE_DESC: {[key in CROSS_QUALITY_TYPE]: string} = {
  [CROSS_QUALITY_TYPE.TOO_MUCH]: '多',
  [CROSS_QUALITY_TYPE.WRONG]: '错',
  [CROSS_QUALITY_TYPE.TOO_LITTLE]: '漏',
};

enum CROSS_QUALITY_RESULT {
  NEED_MODIFY = 1,
  MODIFIED = 2,
  NO_NEED_MODIFY = 3,
}

export const CROSS_QUALITY_RESULT_DESC: {
  [key in CROSS_QUALITY_RESULT]: string;
} = {
  [CROSS_QUALITY_RESULT.NEED_MODIFY]: '待修改',
  [CROSS_QUALITY_RESULT.MODIFIED]: '已修改',
  [CROSS_QUALITY_RESULT.NO_NEED_MODIFY]: '无需修改',
};

enum CROSS_QUALITY_STATUS {
  DELETED = 1,
  NORMAL = 2,
}

export const CROSS_QUALITY_STATUS_DESC: {
  [key in CROSS_QUALITY_STATUS]: string;
} = {
  [CROSS_QUALITY_STATUS.DELETED]: '已删除',
  [CROSS_QUALITY_STATUS.NORMAL]: '正常',
};

export const annotationMap: {
  annotation: Map<number, number>;
  crossId?: string;
  routeInfosPanelBak: CrossRouteInfo[];
} = {
  annotation: new Map(),
  crossId: '',
  routeInfosPanelBak: [],
};
