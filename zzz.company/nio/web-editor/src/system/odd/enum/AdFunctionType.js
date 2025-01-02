import {EventTypeNop, EventTypeNad} from '../../odd/enum/EventType.js';

export const AdFunctionType = {
  'NOP+': 1,
  NAD: 2,
};

export const AdFunctionTypeReverse = {
  1: 'NOP+',
  2: 'NAD',
};

export const AdFunctionTypeLabel = [
  {
    value: 1,
    label: '高速城快NOP+',
  },

  {
    value: 2,
    label: '城区NAD',
  },
];

export function getFunctionTypeFromRoadPriority(roadPriorityClass, eventType) {
  if (roadPriorityClass == undefined && eventType !== undefined) {
    if (EventTypeNop[eventType] !== undefined) {
      return 1;
    } else if (EventTypeNad[eventType] !== undefined) {
      return 2;
    }
  }

  if (roadPriorityClass === '高速' || roadPriorityClass === '城市快速路' || roadPriorityClass === '都市高速') {
    return 1;
  }

  if (EventTypeNop[eventType] !== undefined) {
    return 1;
  } else if (EventTypeNad[eventType] !== undefined) {
    return 2;
  }

  return 2;
}
