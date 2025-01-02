import {reactive, ref} from 'vue';
import {dataManager, CommonLayerName} from '../../model/feature.ts';

export const crossQualityType = [
  {name: '多', value: 1},
  {name: '错', value: 2},
  {name: '漏', value: 3},
];

export const crossQualityResult = [
  {name: '待修改', value: 1},
  {name: '已修改', value: 2},
  {name: '无需修改', value: 3},
];

export interface CrossCheckProperty {
  qualityType: number;
  qualityResult: number; //结果
  qualityDesc: string;
  isRepair: boolean; //是否返修

  workId?: number; // 作业ID
  taskId?: number; // 任务ID
  operator?: string;
  x?: number;
  y?: number;
}

export const crossCheckPanelData = reactive<{
  visible: Boolean;
  featureId: number;
  checkProperty: CrossCheckProperty;
}>({
  visible: false,
  featureId: -1,
  checkProperty: {
    qualityType: 1,
    qualityResult: 1,
    qualityDesc: '',
    isRepair: false,
  },
});

export function saveCrossCheckRecord() {
  dataManager.updateFeature(
    CommonLayerName.CROSS_CHECK_TAG,
    crossCheckPanelData.featureId,
    crossCheckPanelData.checkProperty,
  );
}
