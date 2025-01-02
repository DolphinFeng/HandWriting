import axios from 'axios';
import OddTask from './OddTask.js';
import {NioMessage, NioNotification} from '../../../utils/utils.js';
import taskData from './taskData.js';
import TaskStage from './enum/TaskStage.js';
import WorkKeys from './enum/WorkKeys.js';
import preCache from '../../../js/preCache.js';
import {requestTaskWork} from './startTask.js';
import resetTask from './resetTask.js';
import store from '../../../store/index.js';

const nioTaskURL = window.api.nioTaskURL;
const nioStorageServiceURL = window.api.nioStorageServiceURL;

function checkTaskStateAndStart() {
  if (taskData.taskStage === TaskStage.FREE) {
    for (let i = 0; i < taskData.list.length; i++) {
      let task = taskData.list[i];
      if (task.statusCode === 3) {
        requestTaskWork(task);
        break;
      }
    }
  }
}

function preLoadCapture(imgList) {
  preCache.download(imgList);
}

function loadingTaskList(isRefresh) {
  taskData.loading = true;
  return axios
    .post(nioTaskURL + '/work/assigned/list', {
      assignee: store.state.userInfo.realName,
      pageNo: 1,
      pageSize: 200,
      containsInput: 1,
      orderBy: {
        property: 'statusCode',
        direction: 0,
      },
    })
    .then((res) => {
      if (res.data.code === 200) {
        if (isRefresh === true) {
          resetTask();
        }
        let data = res.data.data,
          result = data.result;
        let captureList = [];
        taskData.total = data.total;
        for (let i = 0; i < result.length; i++) {
          if (/*result[i]['lineName'] !== 'ODD事件制作' ||*/ !(result[i].workKey in WorkKeys)) {
            continue;
          }
          let taskInfo = result[i]['inputList'].reduce((prev, item) => ((prev[item.name] = item.value), prev), {});
          let errorScreenShot = taskInfo['error_screenshot']
            ? taskInfo['error_screenshot']
                .split(',')
                .map((item) => `${nioStorageServiceURL}/storage-service/file/download/${item}`)
            : [];

          taskData.list.push(
            new OddTask(
              result[i].taskId,
              taskInfo['error_type'],
              taskInfo['error_url'],
              taskInfo['error_desc'],
              taskInfo['map_version'],
              taskInfo['error_position'],
              errorScreenShot,
              result[i].workId,
              result[i].tagList,
              result[i].workKey,
              result[i].statusCode,
              result[i].typeCode,
              taskInfo['ao_event_id'],
              taskInfo['siteId'],
              taskInfo['verifyIssue'],
              result[i].lineName,
            ),
          );
          captureList.push(...errorScreenShot);
        }
        checkTaskStateAndStart();
        preLoadCapture(captureList);
      } else {
        throw new Error('loadingTaskList错误:' + res.data.msg);
      }
    })
    .catch((err) => {
      NioNotification('error', '任务列表异常', err.message);
      throw err;
    })
    .finally(() => {
      taskData.loading = false;
    });
}

function claimTask(assignee) {
  return axios
    .post(nioTaskURL + '/work/random/claim', {
      platform: 'odd',
      assignee: assignee,
    })
    .then((res) => {
      if (res.data.code === 200) {
        return res.data.data;
      } else {
        throw new Error('claimTask错误:' + res.data.msg);
      }
    });
}

export function lazyLoadTaskList() {
  if (taskData.pageNo * taskData.pageSize >= taskData.total) {
    return;
  }
  taskData.pageNo++;
  loadingTaskList().catch((err) => {
    taskData.pageNo--;
  });
}

export function refreshTaskList() {
  loadingTaskList(true).catch((err) => {});
}

export function claimTaskHandler() {
  taskData.loading = true;
  claimTask(store.state.userInfo.realName)
    .then((claimRes) => {
      refreshTaskList();
    })
    .catch((err) => {
      NioNotification('error', '任务领取失败', err.message);
    })
    .finally(() => {
      taskData.loading = false;
    });
}
