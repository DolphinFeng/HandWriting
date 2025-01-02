import {reactive} from 'vue';

import { EventTypeNop, EventTypeNad, DynamicInfo } from '../../../system/odd/enum/EventType.js';



const eventTypeNopOption = Object.keys(EventTypeNop).reduce((obj, key) => {
  obj[key] = localStorage.getItem('event-' + key) === 'true' || !localStorage.getItem('event-' + key);
  return obj;
}, {});

const eventTypeNadOption = Object.keys(EventTypeNad).reduce((obj, key) => {
  obj[key] = localStorage.getItem('event-' + key) === 'true' || !localStorage.getItem('event-' + key);
  return obj;
}, {});

export const eventConPaneldata = reactive<{
  visible: boolean, 
  nopOption: any,
  nadOption: any,
}>({
  visible: false,
  nopOption: eventTypeNopOption,
  nadOption: eventTypeNadOption,
});

//获取可以显示的事件类型的值
export function isEventTypeVisible(eventType: string){

  let evDesc = DynamicInfo[eventType];
  if(eventConPaneldata.nopOption[evDesc]){
    return true;
  }

  if(eventConPaneldata.nadOption[evDesc]){
    return true;
  }

  return false;
}
