import {poll} from '../../worker/core.js';
import store from '../../store/index.js';
import {getScreenPoint} from '../../utils/compute.js';
import {PollTaskResult} from '../../worker/taskResult.js';
import {getTileLevel, NioMessage} from '../../utils/utils.js';
import {createViewer} from '../../cesium/initMap.js';
import {nadTileLayer} from './nadTileLayer.js';


// @ts-ignore
const {nadTileServiceURL} = api;

const loadingTaskQueue: any[] = [];
const viewer = createViewer();

function handleNadTileData(taskResult) {
  if (taskResult.code === PollTaskResult.SUCCESS) {
    nadTileLayer.loadData(taskResult.data.data ?? []);
  } else {
    throw new Error('handle nad tile Data错误:' + taskResult.data.toString());
  }
}

async function loadingNadTileFunc(payload: any, nadTileMap: any) {
  try {
    nadTileLayer.loading = true;
    let _nadTileServiceURL = nadTileServiceURL;

    const taskResult = await poll.start('loadingSourceNadTile', {
      nadTileServiceURL: _nadTileServiceURL,
      payload: payload,
      nadTileMap: nadTileMap,
    });

    handleNadTileData(taskResult);
  } catch (error) {
    NioMessage('error', 'NAD tile 获取失败：' + error.message, 2000);
  } finally {
    nadTileLayer.loading = false;
    if (loadingTaskQueue.length > 0) {
      loadingTaskQueue[0]();
      loadingTaskQueue.shift();
    }
  }
}

/**
 * 加载 nadTile 数据
 * @param forceLoad{boolean}
 */
export const loadingNadTileHandler = async (forceLoad: boolean) => {
  if (getTileLevel() <= 8 || (nadTileLayer.loading === true && forceLoad !== true) || nadTileLayer.show === false) {
    return;
  }

  const width = document.body.clientWidth,
    height = document.body.clientHeight;
  const nadTileMap = nadTileLayer.nadTile_id_map;
  let lb = getScreenPoint(0, height),
    rt = getScreenPoint(width, 0);
  const leftBottomX = lb.longitude;
  const leftBottomY = lb.latitude;
  const rightTopX = rt.longitude;
  const rightTopY = rt.latitude;

  let ndsVersion = store.state.version.curVersion.toString();
  let level = 13;

  let hasEvent = 3;

  //过滤是否有事件
  if(nadTileLayer.showNoHaveEvents === false && nadTileLayer.showHaveEvents === true){
    hasEvent = 1;
  }

  if(nadTileLayer.showNoHaveEvents === true && nadTileLayer.showHaveEvents === false){
    hasEvent = 2;
  }

  const payload = {
    ndsVersion,
    level,
    hasEvent,
    leftBottomX,
    leftBottomY,
    rightTopX,
    rightTopY,
  };

  if (nadTileLayer.loading === false) {
    loadingNadTileFunc(payload, nadTileMap);
  } else {
    new Promise((resolve) => {
      loadingTaskQueue.push(resolve);
    }).then(() => {
      loadingNadTileFunc(payload, nadTileMap);
    });
  }
};
