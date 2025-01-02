import {poll} from '../../../worker/core.js';
import store from '../../../store/index.js';
import {getScreenPoint} from '../../../utils/compute.js';
import {PollTaskResult} from '../../../worker/taskResult.js';
import {Cartesian3} from 'cesium';
import {OddLane} from '../oddLane/OddLaneModel.js';
import {OddData} from '../oddData/OddDataModel.js';
import {DynamicInfo} from '../enum/EventType.js';
import {getTileLevel, NioMessage} from '../../../utils/utils.js';
import {oddLayer} from '../oddLayer.js';
import {createViewer} from '../../../cesium/initMap.js';
import OddStatus from '../enum/OddStatus.js';
import {modifiedWorkEvents} from '../../../system/EventBatchEdit.js';
import {
  getCurrentOddLayerSource,
  getCurrentLinkOddLayerSource,
  getCurrentSDLinkOddLayerSource,
} from '../../../system/odd/oddLayerVisible.js';
import {isEventTypeVisible} from '../../../views/map/layer/EventConditionPanel.ts';
import {isLayerNameLane, isLayerNameRoad, isLayerNameSDLink, isLinkType} from '../hoverOddLayer.js';

const apiDynamicURL = api.apiDynamicURL;
const apiDynamicMasterViewURL = api.apiDynamicMasterViewURL;
const issueServiceURL = api.issueServiceURL;
const loadingTaskQueue = [];
const viewer = createViewer();

function handleOddData(taskResult) {
  if (taskResult.code === PollTaskResult.SUCCESS) {
    let oddDataList = taskResult.data,
      pos,
      len;
    for (let i = 0; i < oddDataList.length; i++) {
      //加一个过滤，只加载当前显示的事件的类型。否则会造成选择错误
      let sources = getCurrentOddLayerSource();
      let linkSources = getCurrentLinkOddLayerSource();
      let sdLinkSources = getCurrentSDLinkOddLayerSource();

      if (
        (isLayerNameLane(oddDataList[i].layerName) && !sources.has(oddDataList[i].source)) ||
        (isLayerNameRoad(oddDataList[i].layerName) && !linkSources.has(oddDataList[i].source)) ||
        (isLayerNameSDLink(oddDataList[i].layerName) && !sdLinkSources.has(oddDataList[i].source))
      ) {
        continue;
      }

      if (!isEventTypeVisible(oddDataList[i].dynamic)) {
        continue;
      }

      if (oddDataList[i].isWork) {
        //作业库数据是异步加载的，此时有可能事件列表中已经编辑过了。如果查到了编辑值，则更新，否则添加。
        //事件列表只编辑status和dynamicInfo字段
        if (modifiedWorkEvents.has(oddDataList[i].eventId)) {
          let new_item = modifiedWorkEvents.get(oddDataList[i].eventId);
          oddDataList[i].status = new_item.status;
          oddDataList[i].dynamic = new_item.dynamicInfo;
        } else {
          let copy_item = {
            eventId: oddDataList[i].eventId,
            dynamicInfo: oddDataList[i].dynamic,
            lawSpdlmt: oddDataList[i].law,
            expSpdlmt: oddDataList[i].ex,
            provinceName: oddDataList[i].provinceName,
            cityName: oddDataList[i].cityName,
            tile: oddDataList[i].tile,
            featureId: oddDataList[i].featureId,
            startOffset: oddDataList[i].st,
            endOffset: oddDataList[i].end,
            mapVersion: oddDataList[i].ver,
            source: oddDataList[i].source,
            status: oddDataList[i].status,
            geometry: oddDataList[i].geometry,
            infoValueList: oddDataList[i].infoValueList,
          };

          modifiedWorkEvents.set(copy_item.eventId, copy_item);
        }
      }

      let laneId = oddDataList[i].featureId,
        eventId = oddDataList[i].eventId,
        isWork = oddDataList[i].isWork;
      //此处作业库会覆盖母库数据
      oddLayer.eventMap.set(eventId, isWork);
      //若odd失效，则只在eventMap中记录，不进行渲染，并删除现有的该OddData
      if (oddDataList[i].status === OddStatus.LOSE_EFFICACY) {
        oddLayer.removeLaneByEventId(laneId, eventId);
        continue;
      }
      pos = oddDataList[i].positions;
      len = pos.length;
      for (let j = 0; j < len; j++) {
        pos[j] = Cartesian3.fromDegrees(parseFloat(pos[j][0]), parseFloat(pos[j][1]), 0);
      }
      let lane = new OddLane(
        'ARROW_EVENT',
        laneId,
        '',
        '车道',
        new OddData(
          DynamicInfo[oddDataList[i].dynamic],
          oddDataList[i].law,
          oddDataList[i].ex,
          laneId,
          oddDataList[i].st,
          oddDataList[i].end,
          oddDataList[i].ver,
          oddDataList[i].status,
          oddDataList[i].source,
          eventId,
          oddDataList[i].geometry,
          oddDataList[i].positions,
          isWork,
          oddDataList[i].createTime,
          oddDataList[i].updateTime,
          undefined, //roadPriorityClass
          oddDataList[i].memo,
          oddDataList[i].siteMapId,
          oddDataList[i].layerName,
          null,
        ),
      );

      lane.oddDataList[0].path = oddDataList[i].path;
      lane.oddDataList[0].paths2e = oddDataList[i].paths2e;
      lane.oddDataList[0].infoValueList = parseInt(oddDataList[i].infoValueList);
      oddLayer.laneToEvent(lane);
    }
    viewer.scene.requestRender();
  } else {
    throw new Error('handleOddData错误:' + taskResult.data);
  }
}

function loadingSourceOdd(mapVersion, eventMap, lbLon, lbLat, rtLon, rtLat) {
  oddLayer.loading = true;
  poll
    .start('loadingSourceOdd', {
      apiDynamicURL: apiDynamicMasterViewURL,
      issueServiceURL: issueServiceURL,
      mapVersion: mapVersion,
      eventMap: eventMap,
      lbLon: lbLon,
      lbLat: lbLat,
      rtLon: rtLon,
      rtLat: rtLat,
    })
    .then((taskResult) => {
      handleOddData(taskResult);
    })
    .catch((err) => {
      NioMessage('error', 'ODD事件获取失败：' + err.message, 2000);
    })
    .finally(() => {
      oddLayer.loading = false;
      if (loadingTaskQueue.length > 0) {
        loadingTaskQueue[0]();
        loadingTaskQueue.shift();
      }
    });
}

function loadingWorkOdd(mapVersion, branchName) {
  oddLayer.loading = true;
  return poll
    .start('loadingWorkOdd', {
      apiDynamicURL: apiDynamicURL,
      mapVersion: mapVersion,
      branchName: branchName,
    })
    .then((taskResult) => {
      handleOddData(taskResult);
    })
    .catch((err) => {
      throw err;
    })
    .finally(() => {
      oddLayer.loading = false;
      if (loadingTaskQueue.length > 0) {
        loadingTaskQueue[0]();
        loadingTaskQueue.shift();
      }
    });
}

/**
 * 加载母库数据
 * @param forceLoad{boolean}
 */
export function loadingSourceOddHandler(forceLoad) {
  if (getTileLevel() <= 10 || (oddLayer.loading === true && forceLoad !== true) || oddLayer.show === false) {
    return;
  }
  const width = document.body.clientWidth,
    height = document.body.clientHeight;
  const eventMap = new Map();
  let lb = getScreenPoint(0, height),
    rt = getScreenPoint(width, 0);
  const lbLon = lb.longitude;
  const lbLat = lb.latitude;
  const rtLon = rt.longitude;
  const rtLat = rt.latitude;
  for (const [eventId, isWork] of oddLayer.eventMap.entries()) {
    eventMap.set(eventId, isWork);
  }

  if (oddLayer.loading === false) {
    loadingSourceOdd(store.state.version.curVersion, eventMap, lbLon, lbLat, rtLon, rtLat);
  } else {
    new Promise((resolve) => {
      loadingTaskQueue.push(resolve);
    }).then(() => {
      loadingSourceOdd(store.state.version.curVersion, eventMap, lbLon, lbLat, rtLon, rtLat);
    });
  }
}
/**
 * 加载作业库数据
 * @param branchName{string}
 */
export function loadingWorkOddHandler(branchName) {
  if (oddLayer.loading === false) {
    return loadingWorkOdd(store.state.version.curVersion, branchName);
  } else {
    return new Promise((resolve) => {
      loadingTaskQueue.push(resolve);
    }).then(() => {
      return loadingWorkOdd(store.state.version.curVersion, branchName);
    });
  }
}
