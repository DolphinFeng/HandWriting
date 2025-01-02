import {reactive, ref, watch} from 'vue';
import {oddLayer} from '../oddLayer.js';
import {hoverOddLayer, oddDatalayerName, isLinkType, isLayerNameSDLink} from '../hoverOddLayer.js';
import {taskData, WorkKeys} from '../../../system/task/taskList/taskList.js';
import {DynamicInfo} from '../../../system/odd/enum/EventType.js';
import {getFunctionTypeFromRoadPriority} from '../../../system/odd/enum/AdFunctionType.js';

//打开面板的类型
export const PanelOpenType = {
  CLOSE: 'CLOSE', //关闭状态
  CREATE_MULTI: 'CREATE_MULTI', //多条创建模式
  MODIFY_ONE: 'MODIFY_ONE', //单条创建模式
  MODIFY_MULTI: 'MODIFY_MULTI', //多条编辑模式
};

//事件参数面板
export const oddPanelData = reactive({
  adFunctionType: 1, //1:高速城快NOP+, 2:城区NAD

  curEventIdx: 0, //当前事件索引
  curOddSize: 1, //单条编辑模式下一条lane的odd数量
  eventId: '46cf8d8536c7-1664076144.384014', //事件Id
  type: '法规限速',
  lawLimitSpeed: 0, //法规限速
  exLimitSpeed: 0, //经验限速
  infoValueList: 1,
  featureId: '2394304930190999044', //要素ID
  stPos: 0,
  edPos: 0,
  laneGroups: 0, //lane组数
  lanes: 0, //lane数
  panelOpenType: PanelOpenType.CLOSE,
  source: 1, //事件来源

  layerName: oddDatalayerName.Lane,

  //issue专用字段
  memo: null,
  siteMapId: null,
});

watch(
  () => oddPanelData.curEventIdx,
  (newIdx) => {
    let oddLane = [...oddLayer.hoverEvent.values()][0];
    let oddData = null;

    if (oddLane.selectedEventIds.length === 0) {
      //说明是透过事件生成新事件的情况
      oddData = oddLane.oddDataList[newIdx];
    } else {
      let eventId = oddLane.selectedEventIds[newIdx];
      for (let i = 0; i < oddLane.oddDataList.length; i++) {
        if (oddLane.oddDataList[i].eventId === eventId) {
          oddData = oddLane.oddDataList[i];
        }
      }
    }

    //const oddList = oddLane.oddDataList;
    setOddData({
      type: oddData.type,
      lawLimitSpeed: oddData.lawSpeed,
      exLimitSpeed: oddData.exSpeed,
      infoValueList: oddData.infoValueList ? oddData.infoValueList : 1, //默认值设为1
      eventId: oddData.eventId,
      featureId: oddData.laneId,
      source: oddData.source,
      stPos: oddData.stOffset,
      edPos: oddData.edOffset,

      memo: oddData.memo,
      siteMapId: oddData.siteMapId,
    });

    //同时更新事件的渲染状态
    oddLane.activeEventId = oddData.eventId;
    oddLane.setStyle('ARROW_EVENT');
    oddLane.setStyle('ARROW_HOVER_EVENT', oddData.eventId);
  },
);

//设置事件数据
function setOddData(option) {
  Object.assign(oddPanelData, option);
}

//打开属性面板，创建odd事件
export const createEvent = function () {
  //判断，如果是SdLink
  let firstItemLayerName = '';
  for (let item of hoverOddLayer.hoverLanes.values()) {
    for (let subItem of item.oddDataList) {
      firstItemLayerName = subItem.layerName;
      break;
    }
    break;
  }

  let isSdLink = false;
  if (firstItemLayerName == oddDatalayerName.SDLink) {
    isSdLink = true;
  }

  if (isSdLink) {
    oddLayer.show = true;
    oddLayer.createOneEventSdLink();
  } else {
    if (hoverOddLayer.hoverLanes.size === 1) {
      //单选lane,直接创建事件并打开单条事件修改模式的面板
      oddLayer.show = true;
      oddLayer.createOneEventLane();
    } else {
      //多选lane生成多条事件
      setPanelMode(PanelOpenType.CREATE_MULTI);
    }
  }
};

//面板切换任务策略
const strategy = {
  CLOSE: function () {
    oddLayer.clearHoverEvent();
  },
  CREATE_MULTI: function () {
    //表示首次切换到多行创建模式,对面板初始化赋值
    if (!isPaneModeEqual(PanelOpenType.CREATE_MULTI)) {
      let type = DynamicInfo[2];
      if (taskData.runningTask.typeCode === 'ao_event_making') {
        type = DynamicInfo[1];
      }
      setOddData({
        type: type,
        lawLimitSpeed: 0,
        exLimitSpeed: 0,
        infoValueList: 1,
      });
    }

    //只根据一条来判断面板页面
    let eventType = DynamicInfo[512];
    if (hoverOddLayer.hoverLanes.size > 0) {
      let odd_data = hoverOddLayer.hoverLanes.entries().next().value[1].oddDataList[0];
      let roadPriorityClass = odd_data.roadPriorityClass;
      eventType = odd_data.type;
      if (isLinkType(odd_data.layerName)) {
        oddPanelData.adFunctionType = 1;
      } else if (isLayerNameSDLink(odd_data.layerName)) {
        oddPanelData.adFunctionType = 2;
      } else {
        oddPanelData.adFunctionType = getFunctionTypeFromRoadPriority(roadPriorityClass, eventType);
      }
    }

    setOddData({
      type: eventType,
      laneGroups: hoverOddLayer.hoverLaneGroup.size,
      lanes: hoverOddLayer.hoverLanes.size,
    });
  },
  MODIFY_ONE: function () {
    //只要切换到了单条编辑模式，就要重置面板参数。单条编辑模式要求必须在config内携带oddDataIdx,否则默认为最新一条oddData
    let oddLane = [...oddLayer.hoverEvent.values()][0];
    oddPanelData.curEventIdx = oddLane.oddDataList.length - 1;
    for (let i = 0; i < oddLane.selectedEventIds.length; i++) {
      if (oddLane.selectedEventIds[i] === oddLane.activeEventId) {
        oddPanelData.curEventIdx = i;
      }
    }

    let roadPriorityClass = oddLane.oddDataList[oddPanelData.curEventIdx].roadPriorityClass;
    let eventType = oddLane.oddDataList[oddPanelData.curEventIdx].type;
    if (isLinkType(oddLane.oddDataList[oddPanelData.curEventIdx].layerName)) {
      oddPanelData.adFunctionType = 1;
    } else {
      oddPanelData.adFunctionType = getFunctionTypeFromRoadPriority(roadPriorityClass, eventType);
    }

    let oddData = null;
    for (let i = 0; i < oddLane.oddDataList.length; i++) {
      if (oddLane.oddDataList[i].eventId === oddLane.activeEventId) {
        oddData = oddLane.oddDataList[i];
        break;
      }
    }

    setOddData({
      //curOddSize: oddLane.oddDataList.length,
      curOddSize: oddLane.selectedEventIds.length,
      type: oddData.type,
      lawLimitSpeed: oddData.lawSpeed,
      exLimitSpeed: oddData.exSpeed,
      infoValueList: oddData.infoValueList ? oddData.infoValueList : 1,
      eventId: oddData.eventId,
      featureId: oddData.laneId,
      source: oddData.source,
      stPos: oddData.stOffset,
      edPos: oddData.edOffset,

      memo: oddData.memo,
      siteMapId: oddData.siteMapId,
    });
  },
  MODIFY_MULTI: function () {
    //如果当前是首次进入多条编辑模式或config携带了要求更新面板的update字段，需要重置面板，为其赋值hoverEvent的第一条odd数据
    let lanes = [...oddLayer.hoverEvent.values()];

    if (hoverOddLayer.hoverLanes.size > 0) {
      let odd_data = hoverOddLayer.hoverLanes.entries().next().value[1].oddDataList[0];
      let roadPriorityClass = odd_data.roadPriorityClass;
      let eventType = odd_data.type;
      oddPanelData.adFunctionType = getFunctionTypeFromRoadPriority(roadPriorityClass, eventType);
    }

    setOddData({
      type: lanes[0].oddDataList[0].type,
      lawLimitSpeed: lanes[0].oddDataList[0].lawSpeed,
      exLimitSpeed: lanes[0].oddDataList[0].exSpeed,
      infoValueList: lanes[0].oddDataList[0].infoValueList ? lanes[0].oddDataList[0].infoValueList : 1,
      lanes: lanes.reduce((prev, item) => prev + item.oddDataList.length, 0),
    });
  },
};

//切换面板模式
export function setPanelMode(mode) {
  if (typeof strategy[mode] === 'function') {
    strategy[mode]();
  }
  oddPanelData.panelOpenType = mode;
}

export function isPaneModeEqual(...mode) {
  for (let i = 0; i < mode.length; i++) {
    if (oddPanelData.panelOpenType === mode[i]) {
      return true;
    }
  }
  return false;
}

//是否允许修改。
//规则： ao_event_making任务，只允许修改source为4的事件。其他任务，只允许修改source不是4的事件
export function canEdit() {
  if (taskData.runningTask === null) {
    return false;
  }

  if (taskData.runningTask.typeCode === 'ao_event_making') {
    if (oddPanelData.type !== DynamicInfo[1] || oddPanelData.source !== 4) {
      NioMessage('warning', '只可修改本任务来源的数据');
      return false;
    }
  } else if (taskData.runningTask.typeCode === 'ao_speed_limit_making') {
    //ao_speedlimit_making只可修改source为1的数据
    if (oddPanelData.source !== 1) {
      NioMessage('warning', '只可修改本任务来源的数据');
      return false;
    }
  } else if (taskData.runningTask.workKey === WorkKeys.step_user_check) {
    NioMessage('warning', '质检任务，无法修改数据');
    return false;
  } else {
    if (oddPanelData.type === DynamicInfo[1] || oddPanelData.source === 4) {
      NioMessage('warning', '只可修改本任务来源的数据');
      return false;
    }
  }

  return true;
}
