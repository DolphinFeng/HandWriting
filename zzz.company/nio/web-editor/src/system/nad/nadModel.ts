
/*
* NAD tile 数据模型
*/
export interface NadTileMeta {
  id: number;
  ndsVersion: number;
  meshId: number;
  leftBottomX: number;
  leftBottomY: number;
  rightTopX: number;
  rightTopY: number;
  dynamicEventCnt: number;
}

