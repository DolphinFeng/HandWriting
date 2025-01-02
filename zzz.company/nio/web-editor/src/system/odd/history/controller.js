import {oddLayer} from "../oddLayer.js";
import {isPaneModeEqual, PanelOpenType, setPanelMode} from "../eventPanel/oddPanelData.js";
import {hoverOddLayer} from "../hoverOddLayer.js";
import {modifiedWorkEvents} from "../../../system/EventBatchEdit.js"
import {updateEventListPanel} from "../../../system/odd/batch/eventList.js"
import { EventType } from "../enum/EventType.js";


const opRecordStrategy = {
    //撤销操作
    BACK: {
        CREATE: function (lanes, oddDataLists) {
            let changed_ids = new Set();
            for (let i = 0; i < lanes.length; i++) {
                let laneId = lanes[i].laneId;
                let lane = oddLayer.oddLanes.get(laneId);
                lane.remove(oddDataLists[i][0].tag);

                if(oddDataLists[i][0].isWork === true 
                  && modifiedWorkEvents.has(oddDataLists[i][0])){
                  let oddData = oddDataLists[i][0];
                  changed_ids.add(oddData.eventId);
                  modifiedWorkEvents.get(oddData.eventId).status = 2;
                }

                if (lane.oddDataList.length === 0) {
                    oddLayer.oddLanes.delete(laneId);
                    oddLayer.hoverEvent.delete(laneId);
                    oddLayer.dataSource.remove(lane);
                }
            }
            //撤销后条数发生了变化
            if (isPaneModeEqual(PanelOpenType.MODIFY_ONE, PanelOpenType.MODIFY_MULTI)) {
                oddLayer.changePanel();
            }
            oddLayer.viewer.scene.requestRender();
            updateEventListPanel(changed_ids);
        },
        MODIFY: function (lanes, oddDataLists) {
            //撤销修改操作，直接进入编辑模式，清空当前所有的hover状态的线
            hoverOddLayer.clearHoverLanes();
            oddLayer.clearHoverEvent();
            let changed_ids = new Set();
            
            for (let i = 0; i < lanes.length; i++) {
                let lane = oddLayer.oddLanes.get(lanes[i].laneId);
                for (let j = 0; j < oddDataLists[i].length; j++) {

                    if(oddDataLists[i][j].isWork === true 
                      && modifiedWorkEvents.has(oddDataLists[i][j].eventId)){
                      let oddData = oddDataLists[i][j];
                      changed_ids.add(oddData.eventId);
                      let current_item = modifiedWorkEvents.get(oddData.eventId); 
                      current_item.lawSpdlmt = oddData.lawSpeed;
                      current_item.expSpdlmt = oddData.exSpeed;
                      current_item.dynamicInfo = EventType[oddData.type];
                    }

                    //交换新旧oddData
                    oddDataLists[i][j] = lane.exChangeOddData(oddDataLists[i][j]);
                }
                oddLayer.addOneHoverEvent(lane);
            }
            oddLayer.changePanel();
            oddLayer.viewer.scene.requestRender();
            updateEventListPanel(changed_ids);
        },
        DELETE: function (lanes, oddDataLists) {
            //撤销删除，需要清空当前选中的hoverLane，以确保恢复编辑模式;为了保证用户能找到自己删除的odd，应该将当前hoverEvent清空
            hoverOddLayer.clearHoverLanes();
            oddLayer.clearHoverEvent();
            let changed_ids = new Set();
            for (let i = 0; i < lanes.length; i++) {
                let laneId = lanes[i].laneId;
                let lane = oddLayer.oddLanes.get(laneId);
                if (lane === undefined) {
                    lane = lanes[i];
                    oddLayer.oddLanes.set(laneId, lane);
                    lane.positions = lanes[i]._positions;
                    oddLayer.dataSource.add(lanes[i]);
                }
                lane.addOddData(oddDataLists[i]);

                for (let j = 0; j < oddDataLists[i].length; j++){
                  if(oddDataLists[i][j].isWork === true 
                    && modifiedWorkEvents.has(oddDataLists[i][j].eventId)){
                    
                    let oddData = oddDataLists[i][j];
                    changed_ids.add(oddData.eventId);
                    let current_item = modifiedWorkEvents.get(oddData.eventId); 
                    current_item.status = 1;
                  }
                }

                oddLayer.addOneHoverEvent(lane);
            }
            //oddLayer.changePanel();
            setPanelMode(PanelOpenType.CLOSE);
            oddLayer.viewer.scene.requestRender();
            updateEventListPanel(changed_ids);
        }
    },
    FORWARD: {
        CREATE: function (lanes, oddDataLists) {
            let changed_ids = new Set();
            let hoverLaneSize = hoverOddLayer.hoverLanes.size, hoverEventSize = oddLayer.hoverEvent.size;
            for (let i = 0; i < lanes.length; i++) {
                let laneId = lanes[i].laneId;
                //可能即将复原的odd已经被选中了，需要将其清除，因为马上就要转为odd了
                if (hoverOddLayer.hoverLanes.has(laneId)) {
                    hoverOddLayer.clearOneHoverLane(hoverOddLayer.hoverLanes.get(laneId));
                }
                //发现恢复创建的odd中有一条编辑模式的线
                if (lanes[i].state.type === 'ARROW_HOVER_EVENT') {
                    if (!oddLayer.hoverEvent.has(laneId)) {
                        oddLayer.hoverEvent.set(laneId, lanes[i]);
                    }
                }
                //若这条odd还没有创建过，创建一下视图，将oddData还原到原来的oddLane上
                let oddLane = oddLayer.oddLanes.get(laneId);
                if (oddLane === undefined) {
                    oddLane = lanes[i];
                    oddLayer.oddLanes.set(laneId, lanes[i]);
                    lanes[i].positions = lanes[i]._positions;
                    oddLayer.dataSource.add(lanes[i]);
                }
                oddLane.addOddData(oddDataLists[i][0]);

                if(oddDataLists[i][0].isWork === true
                  && modifiedWorkEvents.has(oddDataLists[i][0].eventId)){
                  let oddData = oddDataLists[i][0];
                  changed_ids.add(oddData.eventId);
                  modifiedWorkEvents.get(oddData.eventId).status = 1;
                }
            }
            if (hoverEventSize !== oddLayer.hoverEvent.size || isPaneModeEqual(PanelOpenType.MODIFY_ONE, PanelOpenType.MODIFY_MULTI)) {
                //可能含有编辑状态的odd，优先置为编辑模式
                oddLayer.changePanel();
            } else if (hoverLaneSize !== hoverOddLayer.hoverLanes.size && isPaneModeEqual(PanelOpenType.CREATE_MULTI)) {
                //有部分hoverLane因为生成了odd而数量减少了，需要更改面板上lanes的情况
                setPanelMode(PanelOpenType.CREATE_MULTI);
            }
            oddLayer.viewer.scene.requestRender();
            updateEventListPanel(changed_ids);
        },
        MODIFY: function (lanes, oddDataLists) {
            //与撤销操作逻辑相同
            return opRecordStrategy['BACK']['MODIFY'](lanes, oddDataLists);
        },
        DELETE: function (lanes, oddDataLists) {
            let lane;
            let changed_ids = new Set();
            if (lanes.length === 1) {
                lane = oddLayer.oddLanes.get(lanes[0].laneId);
                oddLayer.removeOneOddData(lane, oddDataLists[0][0].tag);

                if(oddDataLists[0][0].isWork === true
                  && modifiedWorkEvents.has(oddDataLists[0][0].eventId)){
                  let oddData = oddDataLists[0][0];
                  changed_ids.add(oddData.eventId);
                  modifiedWorkEvents.get(oddData.eventId).status = 2;
                }
            } else {
                let arr = [];
                for (let i = 0; i < lanes.length; i++) {
                    arr[i] = oddLayer.oddLanes.get(lanes[i].laneId);
                }
                oddLayer.removeAllOddData(arr, oddDataLists);

                for(let i = 0; i < oddDataLists.length; i ++){
                  for (let j = 0; j < oddDataLists[i].length; j++){
                    if(oddDataLists[i][j].isWork === true
                      && modifiedWorkEvents.has(oddDataLists[i][j].eventId)){
                      let oddData = oddDataLists[i][j];
                      changed_ids.add(oddData.eventId);
                      modifiedWorkEvents.get(oddData.eventId).status = 2;
                    }
                  }
                }
            }
            oddLayer.viewer.scene.requestRender();
            updateEventListPanel(changed_ids);
        }
    }
};

//处理撤销操作
export function handleOddOpBack(opRecord) {
    opRecordStrategy['BACK'][opRecord.type](opRecord.oddList, opRecord.oddDataLists);
}

//处理重做操作
export function handleOddOpForward(opRecord) {
    opRecordStrategy['FORWARD'][opRecord.type](opRecord.oddList, opRecord.oddDataLists);
}
