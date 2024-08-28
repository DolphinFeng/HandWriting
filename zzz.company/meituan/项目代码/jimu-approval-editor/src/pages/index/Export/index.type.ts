enum BillState {
  ALL = 'ALL',
  DRAFT = 'DRAFT',
  PROCESSING = 'PROCESSING',
  REJECTED = 'REJECTED',
  REFUSED = 'REFUSED',
  UNKNOWN = 'UNKNOWN',
  PROCESSED = 'PROCESSED'
}

const BillStateText = {
  [BillState.DRAFT]: '已撤回',
  [BillState.PROCESSING]: '审批中',
  [BillState.REJECTED]: '已驳回',
  [BillState.PROCESSED]: '审批完成',
  [BillState.ALL]: '全部'
};

enum ExportState {
  CREATING = 'CREATING',
  UPLOADED = 'UPLOADED',
  DELETED = 'DELETED',
  FAILED = 'FAILED'
}

export { BillState, BillStateText, ExportState };
