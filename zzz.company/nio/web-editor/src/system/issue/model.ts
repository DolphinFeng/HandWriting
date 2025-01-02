type WKTPoint = string;

interface EventInfo {
  endOffset: number;
  eventId: string;
  eventIndex: number;
  laneId: number;
  startOffset: number;
}

/**
 * issue 数据模型
 */
export interface IssueMeta {
  adcVersion: string;
  createTime: string;
  endCoord: WKTPoint;
  endLaneId: number;
  endTs: number;
  eventIds: string;
  eventInfoList: EventInfo[];
  id: number;
  issueMetaUuid: string;
  issueNotifyType: number;
  issueStatus: string;
  issueType: string;
  issueUuid: string;
  meshId: number;
  ndsVsn: number;
  severity: number;
  startCoord: WKTPoint;
  startLaneId: number;
  startTs: string;
  triggerTs: string;
  vid: string;
}
