//枚举当前的点击事件类型。分两种  s (show)前缀的是导致面板显示的事件，是c (click)前缀事件的基础事件，必须先执行完毕
export const panelNames = {
  sCrossInfo: 'sCrossInfo',
  sCrossResume: 'sCrossResume',
  sCrossModelResume: 'sCrossModelResume',
  sCrossInferResume: 'sCrossInferResume',
  sCrossFusionResume: 'sCrossFusionResume',

  cCrossInfo: 'cCrossInfo',
  cCrossResume: 'cCrossResume',
  cCrossModelResume: 'cCrossModelResume',
  cCrossInferResume: 'cCrossInferResume',
  cCrossFusionResume: 'cCrossFusionResume',
};

export const actionParamMap = new Map();
actionParamMap.set(panelNames.sCrossInfo, []);
actionParamMap.set(panelNames.sCrossResume, []);
actionParamMap.set(panelNames.sCrossModelResume, []);
actionParamMap.set(panelNames.sCrossInferResume, []);
actionParamMap.set(panelNames.sCrossFusionResume, []);

export const actionFuncMap = new Map();
export function RegisterFunc(func) {
  actionFuncMap.set(func.name, func);
}
