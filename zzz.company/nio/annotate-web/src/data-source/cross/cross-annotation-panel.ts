import {reactive} from 'vue';
import {crossResumePanel} from './cross-resume-panel.ts';
import {annotationMap} from './cross-anno-data.ts';
import {routeInfosPanel} from './cross-info-panel.ts';

export const annotationTypeLabel = [
  {
    value: 1,
    label: '有效',
  },
  {
    value: 2,
    label: '补采',
  },
  {
    value: 3,
    label: '无效',
  },
];

//有效
export const validLabel = {
  点云清楚有效: 101,
  视觉清楚有效: 102,
  现场无车道线有效: 103,
  现场磨损有效: 104,
  现场新旧线有效: 106,
};

//补采
export const repairLabel = {
  '视觉&点云不清晰': 201,
  补采长度: 202,
  补采重影: 203,
  缺失有洞: 204,
  缺失与高架平行的辅路: 205,
  缺失同平面的平行路辅路: 206,
};

//无效
export const invalidLabel = {
  无效: 301,
};

export const annotationPanelData = reactive<any>({
  visible: false,
  labelType: 1,
  labelValue: validLabel.点云清楚有效,
});

export function getCrossLabelType(labelValue) {
  if (Object.values(validLabel).includes(labelValue)) {
    return 1;
  } else if (Object.values(repairLabel).includes(labelValue)) {
    return 2;
  } else if (Object.values(invalidLabel).includes(labelValue)) {
    return 3;
  }

  return undefined;
}

export function getCrossLabelTypeDesc(labelValue) {
  for (const [key, value] of Object.entries(validLabel)) {
    if (value == labelValue) {
      return value + ':' + key;
    }
  }

  for (const [key, value] of Object.entries(repairLabel)) {
    if (value == labelValue) {
      return value + ':' + key;
    }
  }

  for (const [key, value] of Object.entries(invalidLabel)) {
    if (value == labelValue) {
      return value + ':' + key;
    }
  }

  return '';
}

export function closeAnnotationPanel() {
  annotationPanelData.visible = false;
  crossResumePanel.currentRouteId = null;
}

export function saveCrossAnnotationData() {
  if (crossResumePanel.currentRouteId) {
    annotationMap.annotation.set(crossResumePanel.currentRouteId, annotationPanelData.labelValue);

    //更新面板状态
    for (let routeInfoPanel of routeInfosPanel) {
      if (routeInfoPanel.routeId == crossResumePanel.currentRouteId) {
        routeInfoPanel.annotated = true;
        routeInfoPanel.annotation = getCrossLabelTypeDesc(annotationPanelData.labelValue);
      }
    }
  }
}
