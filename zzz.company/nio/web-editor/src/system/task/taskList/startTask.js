import taskData from './taskData.js';
import axios from 'axios';
import {NioMessage, NioNotification} from '../../../utils/utils.js';
import TaskStage from './enum/TaskStage.js';
import {PanelOpenType, setPanelMode} from '../../odd/eventPanel/oddPanelData.js';
import {hoverOddLayer} from '../../odd/hoverOddLayer.js';
import {requestQualityTagHandler} from '../quality/quality.js';
import {oddLayer} from '../../odd/oddLayer.js';
import {
  setOddLayerSourceVisible,
  setLinkOddLayerSourceVisible,
  setSDLinkOddLayerSourceVisible,
} from '../../odd/oddLayerVisible';
import {loadingWorkOddHandler, loadingSourceOddHandler} from '../../odd/loading/loadingOddData.js';
import store from '../../../store/index.js';
import {getRunningTaskSource} from '../taskList/taskList.js';
import {aoCheckTrajectoryLayer} from '../../trajectory/AoTrajectorylayer.js';

const nioTaskURL = window.api.nioTaskURL;
const taskStrategy = {
  step_user_edit: TaskStage.WORKING,
  step_user_check: TaskStage.QUALITY_CHECK,
  step_user_ao_check: TaskStage.QUALITY_CHECK,
};

function startTask(task, change_visible = true) {
  taskData.runningTask = task;
  taskData.taskStage = taskStrategy[task.workKey];
  task.statusCode = 3;
  //任务排序，进行中的任务置顶
  for (let i = 0; i < taskData.list.length; i++) {
    if (taskData.list[i] === task) {
      taskData.list.splice(i, 1);
      taskData.list.unshift(task);
      break;
    }
  }
  store.commit('version/changeVersion', task.mapVersion);

  if (change_visible) {
    //oddLayer数据已经加载完毕，判断一下source类型，强制显示
    let source = getRunningTaskSource();
    //let source = oddLayer.getSource();
    setOddLayerSourceVisible(source);
    setLinkOddLayerSourceVisible(source);
    setSDLinkOddLayerSourceVisible(source);
  }

  //强制刷一下
  loadingSourceOddHandler(true);

  task.locate();

  //需要调用show，触发startOddEvent或者stopOddEvent
  oddLayer.show = true;
}

function preStartClearHandler() {
  setPanelMode(PanelOpenType.CLOSE);
  hoverOddLayer.clearHoverLanes();
}

function requestStartTask(task) {
  return axios.post(`${nioTaskURL}/work/start/${task.workId}`).then((res) => {
    if (res.data.code === 200) {
    } else {
      throw new Error(res.data.msg);
    }
  });
}

/** click点击请求开始任务 */
export function requestStartTaskHandler(task) {
  if (taskData.taskStage !== TaskStage.FREE) {
    NioMessage('warning', '请先完成当前任务再开始新任务');
    return;
  }
  requestStartTask(task)
    .then(() => {
      requestTaskWork(task);
    })
    .catch((err) => {
      NioNotification('error', '任务启动失败', err.message);
    });
}

/** 请求作业库、质检数据 */
export function requestTaskWork(task, do_not_show_toast, change_visible = true) {
  if (task.workKey === 'step_user_ao_check') {
    requestOddBranchName(task)
      .then(() => {
        aoCheckTrajectoryLayer.loadMaterial(task);
      })
      .then(() => {
        NioMessage('success', 'AO质检开始任务：' + task.taskId);
        preStartClearHandler();
        startTask(task, change_visible);
      })
      .catch((err) => {
        NioNotification('error', 'AO质检查询失败', err.message);
      });
  } else {
    requestOddBranchName(task)
      .then(() => {
        return Promise.all([requestQualityTagHandler(task), loadingWorkOddHandler(task.oddBranchName)]);
      })
      .then(() => {
        if (do_not_show_toast == undefined) {
          NioMessage('success', '开始任务：' + task.taskId);
        }

        preStartClearHandler();
        startTask(task, change_visible);
      })
      .catch((err) => {
        NioNotification('error', '作业库查询失败', err.message);
      });
  }
}

export function requestOddBranchName(task) {
  if (task.oddBranchName !== null) {
    return Promise.resolve(task.oddBranchName);
  } else {
    return axios
      .post(`${nioTaskURL}/work/detail/${task.workId}`)
      .then((res) => {
        if (res.data.code === 200) {
          let data = res.data.data;
          if (!Array.isArray(data.variables)) {
            throw new Error('作业库查询异常variables:null');
          }
          let flag = data.variables.some((variable) => {
            if (variable.name === 'oddBranchName') {
              task.oddBranchName = variable.value;
              return true;
            }
          });
          if (!flag) {
            throw new Error('参数缺少作业库名称');
          }
          return task.oddBranchName;
        } else {
          throw new Error('requestOddBranchName错误:' + res.data.msg);
        }
      })
      .catch((err) => {
        NioMessage('error', err + '');
      });
  }
}
