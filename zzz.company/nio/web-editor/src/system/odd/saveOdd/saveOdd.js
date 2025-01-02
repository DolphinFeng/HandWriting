import {reactive, ref} from 'vue';
import {opHistory} from '../history/history.js';
import {oddLayer} from '../oddLayer.js';
import {NioMessage, NioNotification} from '../../../utils/utils.js';
import {popupInfoBox} from '../../../event/infoBox.js';
import {PanelOpenType, setPanelMode} from '../eventPanel/oddPanelData.js';
import {EventType} from '../enum/EventType.js';
import axios from 'axios';
import store from '../../../store/index.js';
import {hoverOddLayer} from '../hoverOddLayer.js';
import {submitWorkTaskHandler, taskData} from '../../task/taskList/taskList.js';
import TaskStage from '../../task/taskList/enum/TaskStage.js';
import OddStatus from '../enum/OddStatus.js';
import {getUuid32} from '../../../utils/compute.js';
import {modifyQualityTagHandler} from '../../task/quality/tag/tag.js';

const saveOddData = reactive({
  loading: false,
  visible: false,
  create: 0,
  modify: 0,
  delete: 0,
});
const apiDynamicURL = window.api.apiDynamicURL;

const createOdd = new Map();
const modifyOdd = new Map();
const removeOdd = new Map();

//操作历史处理策略，用于处理操作栈内的记录
const strategy = {
  CREATE: function (oddData) {
    createOdd.set(oddData.tag, oddData);
  },
  MODIFY: function (oddData) {
    if (oddData.eventId.length > 10) {
      //只有远程的修改才叫删除，本地的仅仅是创建
      modifyOdd.set(oddData.tag, oddData);
    }
  },
  DELETE: function (oddData) {
    if (oddData.eventId.length < 10) {
      //eventId长度小于10表示删除的非远程odd事件
      createOdd.delete(oddData.tag);
    } else {
      removeOdd.set(oddData.tag, oddData);
    }
    modifyOdd.delete(oddData.tag);
  },
};

function handleOpRecord(type, oddData) {
  return strategy[type](oddData);
}

//栈内odd数据筛选
function handleSaveOdd() {
  if (taskData.taskStage !== TaskStage.WORKING) {
    return;
  }
  let opList = opHistory.list,
    opType,
    oddData;
  popupInfoBox.close();
  setPanelMode(PanelOpenType.CLOSE);
  clearPanel();
  //第一轮处理：按类型将oddData分类
  for (let i = 0; i < opList.length; i++) {
    opType = opList[i].type;
    //打平数组
    let oddDataLists = opList[i].oddDataLists.reduce((prev, cur) => {
      return prev.concat(cur);
    }, []);
    for (let j = 0; j < oddDataLists.length; j++) {
      oddData = oddDataLists[j];
      handleOpRecord(opType, oddData);
    }
  }
  //第二轮处理：更新createOddData和modifyOddData为最新的数据
  for (let oddData of createOdd.values()) {
    let lane = oddLayer.oddLanes.get(oddData.laneId);

    //按道理不会出现这种情况。但是在作业中出现了。先这么改
    //删除回退这块的逻辑不清晰，结构不合理，后面需要重构
    if (lane === undefined || lane === null) {
      continue;
    }

    let lastOddData = lane.selectOddData(oddData.tag);
    if (lastOddData === null) {
      throw new Error('最新的oddData为空，不符合代码逻辑');
    }
    createOdd.set(oddData.tag, lastOddData);
  }
  for (let oddData of modifyOdd.values()) {
    let lane = oddLayer.oddLanes.get(oddData.laneId);
    let lastOddData = lane.selectOddData(oddData.tag);
    if (lastOddData === null) {
      throw new Error('最新的oddData为空，不符合代码逻辑');
    }
    modifyOdd.set(oddData.tag, lastOddData);
  }
  //显示处理结果
  Object.assign(saveOddData, {
    visible: true,
    create: createOdd.size,
    modify: modifyOdd.size,
    delete: removeOdd.size,
  });
}

export function uploadOddTaskHandler() {
  saveOddData.loading = true;
  uploadOddData()
    .then(() => {
      return modifyQualityTagHandler(taskData.runningTask);
    })
    .then(() => {
      return submitWorkTaskHandler(taskData.runningTask);
    })
    .then(() => {
      NioMessage('success', '任务提交成功');
    })
    .catch((err) => {
      NioNotification('error', '任务提交失败', err.message);
    })
    .finally(() => {
      saveOddData.loading = false;
      closeSavePanel();
    });
}

function uploadOddData() {
  const createList = [],
    modifyList = [],
    deleteList = [];
  for (let oddData of createOdd.values()) {
    if (oddData.type === 'lane_types_cs替换' && (oddData.infoValueList > 20 || oddData.infoValueList < 1)) {
      return Promise.reject(new Error('lane_types_cs替换, 取值范围为1到20, 请修改后提交'));
    }

    createList.push({
      dynamicInfo: EventType[oddData.type],
      lawSpdlmt: oddData.type === '法规限速' ? parseFloat(oddData.lawSpeed) : 0,
      expSpdlmt: oddData.type === '经验限速' ? parseFloat(oddData.exSpeed) : 0,
      infoValueList: oddData.type === 'lane_types_cs替换' ? oddData.infoValueList + '' : undefined,
      layerName: oddData.layerName,
      featureId: oddData.laneId,
      startOffset: oddData.stOffset,
      endOffset: oddData.edOffset,
      geometry: oddData.geometry,
      status: OddStatus.EFFECTIVE,
      source: oddData.source,
      memo: oddData.memo === undefined ? '' : oddData.memo,
      siteMapId: oddData.siteMapId === undefined ? '' : oddData.siteMapId,
      confidence: 100,
      path: oddData.path,
      paths2e: oddData.paths2e,
    });
  }
  for (let oddData of modifyOdd.values()) {
    if (oddData.type === 'lane_types_cs替换' && (oddData.infoValueList > 20 || oddData.infoValueList < 1)) {
      return Promise.reject(new Error('lane_types_cs替换, 取值范围为1到20, 请修改后提交'));
    }

    modifyList.push({
      eventId: oddData.eventId,
      dynamicInfo: EventType[oddData.type],
      lawSpdlmt: oddData.type === '法规限速' ? parseFloat(oddData.lawSpeed) : 0,
      expSpdlmt: oddData.type === '经验限速' ? parseFloat(oddData.exSpeed) : 0,
      infoValueList: oddData.type === 'lane_types_cs替换' ? oddData.infoValueList + '' : undefined,
      layerName: oddData.layerName,
      featureId: oddData.laneId,
      startOffset: oddData.stOffset,
      endOffset: oddData.edOffset,
      geometry: oddData.geometry,
      source: oddData.source,
      memo: oddData.memo === undefined ? '' : oddData.memo,
      siteMapId: oddData.siteMapId === undefined ? '' : oddData.siteMapId,
      confidence: 100,
      status: OddStatus.EFFECTIVE,
      createTime: oddData.createTime,
      initialVersion: oddData.curVersion,
      path: oddData.path,
      paths2e: oddData.paths2e,
    });
  }
  for (let oddData of removeOdd.values()) {
    if (oddData.type === 'lane_types_cs替换' && (oddData.infoValueList > 20 || oddData.infoValueList < 1)) {
      return Promise.reject(new Error('lane_types_cs替换, 取值范围为1到20, 请修改后提交'));
    }

    deleteList.push({
      eventId: oddData.eventId,
      dynamicInfo: EventType[oddData.type],
      lawSpdlmt: oddData.type === '法规限速' ? parseFloat(oddData.lawSpeed) : 0,
      expSpdlmt: oddData.type === '经验限速' ? parseFloat(oddData.exSpeed) : 0,
      infoValueList: oddData.type === 'lane_types_cs替换' ? oddData.infoValueList + '' : undefined,
      layerName: oddData.layerName,
      featureId: oddData.laneId,
      startOffset: oddData.stOffset,
      endOffset: oddData.edOffset,
      geometry: oddData.geometry,
      status: OddStatus.LOSE_EFFICACY,
      source: oddData.source,
      memo: oddData.memo === undefined ? '' : oddData.memo,
      siteMapId: oddData.siteMapId === undefined ? '' : oddData.siteMapId,
      confidence: 100,
      createTime: oddData.createTime,
      initialVersion: oddData.curVersion,
      path: oddData.path,
      paths2e: oddData.paths2e,
    });
  }

  return axios
    .post(apiDynamicURL + '/dynamic-map/event/branch/commit', {
      mapVersion: store.state.version.curVersion.toString(),
      commitId: getUuid32(),
      branchName: taskData.runningTask.oddBranchName,
      create: createList,
      modify: modifyList,
      remove: deleteList,
    })
    .then((res) => {
      if (res.data.code === 200) {
      } else {
        throw new Error('事件保存失败：' + res.data.msg);
      }
    });
}

function clearOddData() {
  setPanelMode(PanelOpenType.CLOSE);
  opHistory.clear();
  oddLayer.clearAll();
  hoverOddLayer.clearHoverLanes();
  clearPanel();
}

function clearPanel() {
  createOdd.clear();
  modifyOdd.clear();
  removeOdd.clear();
}

export const closeSavePanel = function () {
  saveOddData.visible = false;
};

export {handleSaveOdd, saveOddData, clearOddData, clearPanel};
