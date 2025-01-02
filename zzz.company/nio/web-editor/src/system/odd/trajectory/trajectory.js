import {markRaw, reactive} from 'vue';
import {createEvent, PanelOpenType, setPanelMode} from '../eventPanel/oddPanelData.js';
import {oddLayer} from '../oddLayer.js';
import {hoverOddLayer} from '../hoverOddLayer.js';
import {poll} from '../../../worker/core.js';
import {nioCamera, NioMessage, NioNotification} from '../../../utils/utils.js';
import store from '../../../store/index.js';
import {PollTaskResult} from '../../../worker/taskResult.js';
import {OddLane} from '../oddLane/OddLaneModel.js';
import {Cartesian3, Rectangle, Math as CMath} from 'cesium';
import {OddData} from '../oddData/OddDataModel.js';
import {createViewer} from '../../../cesium/initMap.js';
import {taskData} from '../../task/taskList/taskList.js';

const apiRouteURL = window.api.apiRouteURL;
const viewer = createViewer();

class TrajectoryLane {
  /**
   * @constructor
   * @param oddLaneList{OddLane[]}
   * @param pathLen
   * @param groupLen
   */
  constructor(oddLaneList, pathLen, groupLen) {
    this.oddLaneList = markRaw(oddLaneList);
    this.pathLen = pathLen;
    this.groupLen = groupLen;
  }
}

export const trajectoryData = reactive({
  visible: false,
  loading: false,
  stPos: '',
  edPos: '',
  distance: 3,
  /** @type{TrajectoryLane[]} */
  list: markRaw([]),
});

function preClearHandler() {
  hoverOddLayer.clearHoverLanes();
  oddLayer.clearHoverEvent();
  setPanelMode(PanelOpenType.CLOSE);
}

function handleTaskResult(routePath, curVersion) {
  trajectoryData.list = [];
  let pos,
    pathLen = 0,
    groupLen = 0,
    groupMap = new Map();
  let oddLaneList = routePath.map((lane) => {
    pathLen += lane.len;
    if (!groupMap.has(lane.group)) {
      groupMap.set(lane.group, true);
      groupLen++;
    }
    for (let i = 0; i < lane.positions.length; i++) {
      pos = lane.positions[i];
      lane.positions[i] = Cartesian3.fromDegrees(pos[0], pos[1], 0);
    }

    let source = 1;
    if (taskData.runningTask.typeCode !== undefined && taskData.runningTask.typeCode !== null) {
      if (taskData.runningTask.typeCode === 'issue_odd_event_making') {
        source = 3;
      } else if (taskData.runningTask.typeCode === 'ao_event_making') {
        source = 4;
      } else if (taskData.runningTask.typeCode === 'odd_mining_making') {
        source = 6;
      } else if (taskData.runningTask.typeCode === 'nio_map_permit_ramp') {
        source = 7;
      }
    }

    return new OddLane(
      'ARROW_HOVER_LANE',
      lane.laneId,
      lane.group,
      '车道',
      new OddData(
        '经验限速',
        0,
        0,
        lane.laneId,
        0,
        lane.len,
        curVersion,
        0,
        source,
        '',
        lane.wkt,
        lane.positions,
        true,
        null,
        null,
        null,
        null,
      ),
    );
  });
  trajectoryData.list[0] = new TrajectoryLane(oddLaneList, ~~(pathLen / 1000), groupLen);
}

function handleTaskBox(bbox) {
  let rectangle = new Rectangle(
    CMath.toRadians(bbox[0]),
    CMath.toRadians(bbox[1]),
    CMath.toRadians(bbox[2]),
    CMath.toRadians(bbox[3]),
  );
  return viewer.camera.getRectangleCameraCoordinates(rectangle);
}

function createOddLaneByTraj(trajectory) {
  for (let i = 0; i < trajectory.oddLaneList.length; i++) {
    trajectory.oddLaneList[i].setStyle('ARROW_HOVER_LANE', true);
    hoverOddLayer.addHoverLane(trajectory.oddLaneList[i]);
  }
}

function showTrajectory(idx) {
  preClearHandler();
  trajectoryData.visible = true;
  createOddLaneByTraj(trajectoryData.list[idx]);
}

function loadingTraj() {
  trajectoryData.loading = true;
  preClearHandler();
  poll
    .start('loadingTrajectory', {
      apiRouteURL: apiRouteURL,
      curVersion: store.state.version.curVersion,
      stPos: trajectoryData.stPos,
      edPos: trajectoryData.edPos,
      distance: trajectoryData.distance,
    })
    .then((taskResult) => {
      if (taskResult.code === PollTaskResult.SUCCESS) {
        handleTaskResult(taskResult.data.routePath);
        nioCamera.locatePosition({
          position: handleTaskBox(taskResult.data.box),
          animate: true,
          completed() {
            showTrajectory(0);
          },
        });
      } else {
        throw new Error('loadingTraj错误:' + taskResult.data);
      }
    })
    .catch((err) => {
      NioNotification('error', '路径生成失败', err.message);
    })
    .finally(() => {
      trajectoryData.loading = false;
    });
}

export function generateTrajOddHandler() {
  createOddLaneByTraj(trajectoryData.list[0]);
  createEvent();
}

export function changeTrajectoryIdxHandler(idx) {
  showTrajectory(idx);
}

export function loadingTrajHandler() {
  if (trajectoryData.loading === true) {
    return;
  }
  loadingTraj();
}

export function resetTrajForm() {
  preClearHandler();
  Object.assign(trajectoryData, {
    stPos: '',
    edPos: '',
    loading: false,
    visible: false,
    list: markRaw([]),
  });
}
