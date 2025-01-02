import {modifiedWorkEvents} from "../../../system/EventBatchEdit.js"
import {DynamicInfo, EventType} from "../enum/EventType.js"
import { updateEventListPanel } from "../batch/eventList.js";
import { OpType } from "../enum/OpType.js";
import {OddData} from "../oddData/OddDataModel.js"

/** 单条操作记录 */
export class OddOpRecord {
  type;
  oddList;
  /** @type{OddData[]} */
  oddDataLists;

  constructor(type, oddList, oddDataList) {
    this.type = type;
    this.oddList = oddList;
    this.oddDataLists = oddDataList;

    if(type === OpType.DELETE){
      for(let i = 0; i < oddDataList.length; i ++){
        let sub_item = oddDataList[i];
        let changed_ids = new Set();

        for(let j = 0; j < sub_item.length; j ++){
          if(sub_item[j].isWork === true){
            if(modifiedWorkEvents.has(sub_item[j].eventId)){
              modifiedWorkEvents.get(sub_item[j].eventId).status = 2;
              changed_ids.add(sub_item[j].eventId);
            }
          }
        }
        updateEventListPanel(changed_ids);
      }
    }
    else if(type === OpType.MODIFY){
      for(let i = 0; i < oddList.length; i ++){
        let sub_item = oddList[i].oddDataList;
        let changed_ids = new Set();

        for(let j = 0; j < sub_item.length; j ++){
          if(sub_item[j].isWork === true  
            && modifiedWorkEvents.has(sub_item[j].eventId)){
            modifiedWorkEvents.get(sub_item[j].eventId).dynamicInfo = EventType[sub_item[j].type];
            changed_ids.add(sub_item[j].eventId);
          }
        }

        updateEventListPanel(changed_ids);
      }
    }
  }
}