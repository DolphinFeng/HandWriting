import { objToDict, getOptionLabel } from "@/utils";

export const diffSourceTableColumns = [
  { fixed: true, prop: "id", label: "变化源id", width: "120", align: "center" },
  {
    prop: "meshList",
    label: "图幅",
    width: "180",
    align: "center",
    "show-overflow-tooltip": true,
  },
  {
    prop: "batchId",
    label: "批次号",
    width: "260",
    align: "center",
    "show-overflow-tooltip": true,
  },
  {
    prop: "businessType",
    label: "业务类型",
    width: "160",
    align: "center",
    "show-overflow-tooltip": true,
  },
  {
    prop: "businessKey",
    label: "业务对象标识",
    width: "160",
    align: "center",
    "show-overflow-tooltip": true,
  },
  {
    prop: "checkStatus",
    label: "检查状态",
    width: "150",
    align: "center",
  },
  {
    prop: "mergeStatus",
    label: "最新融合状态",
    width: "150",
    align: "center",
  },
  {
    prop: "engineVersion",
    label: "推理算法版本",
    width: "150",
    align: "center",
  },
  { prop: "createTime", label: "创建时间", width: "180", align: "center" },
  { prop: "updateTime", label: "更新时间", width: "180", align: "center" },
];

export const businessTypeOptions = [
  {
    label: '路口',
    value: 'CROSS'
  },
  {
    label: '停车场',
    value: 'PN'
  },
  {
    label: '换电站',
    value: 'PSP'
  },
  {
    label: '匝道',
    value: 'RAMP'
  },
  {
    label: '地理围栏',
    value: 'FENCE'
  },
  {
    label: '换电站（AO）',
    value: 'PSP_AO'
  }
];
const dictOptionsBusinessType = objToDict(businessTypeOptions);
export const getBusinessTypeLabel = (value) => {
  return getOptionLabel(dictOptionsBusinessType, value);
}

export const checkStatusOptions = [
  {
    label: '初始化',
    value: 'INIT'
  },
  {
    label: '丢弃',
    value: 'IGNORED'
  },
  {
    label: '检查通过',
    value: 'CHECK_PASSED'
  },
  {
    label: '检查不通过',
    value: 'CHECK_FAILED'
  },
  {
    label: '检查中',
    value: 'CHECKING'
  }
];
const dictOptionsCheckStatus = objToDict(checkStatusOptions);
export const getCheckStatusLabel = (value) => {
  return getOptionLabel(dictOptionsCheckStatus, value);
}

export const mergeStatusOptions = [
  {
    label: '初始化',
    value: 'INIT'
  },
  {
    label: '融合执行中',
    value: 'PROCESSING'
  },
  {
    label: '融合成功',
    value: 'FINISHED'
  },
  {
    label: '融合失败',
    value: 'MERGE_FAILED'
  },
  {
    label: '批处理失败',
    value: 'BATCH_PROCESS_FAILED'
  },
  {
    label: '丢弃',
    value: 'IGNORED'
  }
];
const dictOptionsMergeStatus = objToDict(mergeStatusOptions);
export const getMergeStatusLabel = (value) => {
  return getOptionLabel(dictOptionsMergeStatus, value);
}

export const tmsResultStatusOptions = [
  {
    label: '未启动',
    value: 1
  },
  {
    label: '执行中',
    value: 2
  },
  {
    label: '执行失败',
    value: 3
  },
  {
    label: '已取消',
    value: 4
  },
  {
    label: '异常终止',
    value: 5
  },
  {
    label: '正常结束',
    value: 6
  },
  {
    label: '已归档',
    value: 7
  }
];
const dictTmsResultStatus = objToDict(tmsResultStatusOptions);
export const getTmsResultStatusLabel = (value) => {
  return getOptionLabel(dictTmsResultStatus, value);
}