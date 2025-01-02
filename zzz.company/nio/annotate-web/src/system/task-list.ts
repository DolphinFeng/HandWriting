import {reactive} from 'vue';
import axios from 'axios';
import store from '../store/store.js';
import {NioMessage, nioCamera} from '../utils/utils.js';
import {NioGeoPoint} from '../model/point.ts';
import {Cartesian3} from 'cesium';
import {openCrossInfoPanel, crossInfoPanel, routeInfosPanel} from '../data-source/cross/cross-info-panel.ts';
import {crossCheckPanelData} from './../data-source/cross/cross-check-panel.ts';
import {annotationMap} from '../data-source/cross/cross-anno-data.js';
import {closeAnnotationPanel, getCrossLabelTypeDesc} from '../data-source/cross/cross-annotation-panel.ts';
import {dataManager, CommonLayerName, NioGeometryType} from '../model/feature.ts';
import {billboardManager} from './billboard-manager.ts';
import {CrossCheckProperty} from '../data-source/cross/cross-check-panel.ts';
import {omit} from 'lodash';
import {toolManager} from './tool.ts';
import {parseWKT} from '../utils/parse-wkt.js';
import {submitIssueTask} from '../views/task-issue-distribute-dlg-panel.ts';
import {submitIssueConfirm, submitIssueTransfer} from '../views/task-issue-dlg-panel.ts';
import {getScreenPoint} from '../utils/compute.js';
import {poll} from '../worker/core.js';

// @ts-ignore
const nioTaskURL = window.api.nioTaskURL;

export enum TaskType {
  CLOUD_MAPPING_CHECK = 'cloud_mapping_check_v2',
  ISSUE_ANALYSIS = 'case_analyse', //问题核实
  ISSUE_DISTRIBUTE = 'case_triage', //问题分发
}

export enum StatusCode {
  NONE = 2,
  STARTED = 3,
  COMPLETED = 4,
}

export interface Task {
  taskType: TaskType;
  taskStep: string;
  taskName: string;
  taskId: number;
  workId: number;
  workName: string;
  taskDesc: string;
  taskParams: any;
  detail: string[];
  statusCode: StatusCode;
  position?: NioGeoPoint;
  crossId?: string;
  onLocate?: (task: Task) => void;
  onStart?: (task: Task) => Promise<boolean>; //开始任务时，要执行的回调函数
  onSubmit?: (task: Task, param: any) => Promise<boolean>; //提交任务时，要执行的回调函数
  crossIdObj?: any;
}

export interface Tasks {
  data: Task[];
  currentTask: null | Task;
  loading: boolean;
}

export const tasks: Tasks = reactive({
  data: [],
  currentTask: null,
  loading: false,
});

function resetTaskListData() {
  Object.assign(tasks, {
    data: [],
    currentTask: null,
  });
}

function sortTask(task: Task) {
  if (tasks.currentTask) {
    NioMessage('error', '请先提交当前任务');
    return;
  }

  tasks.currentTask = task;
  task.statusCode = StatusCode.STARTED;
  //任务排序，进行中的任务置顶
  for (let i = 0; i < tasks.data.length; i++) {
    if (tasks.data[i] === task) {
      tasks.data.splice(i, 1);
      tasks.data.unshift(task);
      break;
    }
  }
}

/**
 * tms领取任务
 * @param assignee
 * @returns
 */
export async function claimTask() {
  tasks.loading = true;
  let assignee = store.state.userInfo.realName;
  //@ts-ignore
  let res = await axios.post(nioTaskURL + '/work/random/claim', {
    platform: 'odd',
    assignee: assignee,
  });

  if (res.data.code != 200) {
    NioMessage('error', 'claimTask错误:' + res.data.msg);
    tasks.loading = false;
    return;
  }

  await refreshTaskList();
  tasks.loading = false;
}

async function checkTaskStateAndStart() {
  if (!tasks.currentTask) {
    for (let i = 0; i < tasks.data.length; i++) {
      let task = tasks.data[i];
      if (task.statusCode == StatusCode.STARTED) {
        await startTask(task);
      }
    }
  }
}

export async function locateTask(task: Task) {
  if (task.onLocate) {
    await task.onLocate(task);
  } else if (task.position) {
    nioCamera.locatePosition({
      position: Cartesian3.fromDegrees(task.position.lon, task.position.lat, 500),
      duration: 1,
      animate: true,
      before() {},
      completed() {},
    });
  }
}

//开始任务的统一入口
export async function startTask(task: Task) {
  tasks.loading = true;
  if (task.onStart && (await task.onStart(task))) {
    sortTask(task);
  }
  tasks.loading = false;
}

//提交任务的统一入口
export async function submitTask(param: any) {
  let task = tasks.currentTask;
  if (!task) {
    NioMessage('warning', '提交失败，当前任务为空');
    return false;
  }

  tasks.loading = true;

  if (task.onSubmit && (await task.onSubmit(task, param))) {
    tasks.currentTask = null;
    await claimTask();

    //提交任务后，自动开始下一个任务
    if (tasks.data.length == 0) {
      NioMessage('success', '当前任务已全部完成，请等待新的任务生成', 2000);
    } else {
      await startTask(tasks.data[0]);
    }

    tasks.loading = false;
    return true;
  }

  tasks.loading = false;
  toolManager.setDefaultTool();
  return false;
}

const onLocateTask = async (task: Task) => {
  if (!task.crossId) {
    return;
  }

  let features;
  //@ts-ignore
  let result = await axios.post(window.api.markPlatformUrl + '/pt/mark/searchById', {
    id: task.crossId,
  });

  result.data.data.forEach((item) => {
    features = JSON.parse(item.location);
  });

  if (result.data.data.length == 0 || features == undefined) {
    NioMessage('warning', '未查询到位置信息', 2000);
    return;
  }

  let lon = features.coordinates[0];
  let lat = features.coordinates[1];

  //@ts-ignore
  const rangeResult = await axios.post(window.api.markPlatformUrl + '/pt/mark/getCrossByRange', {
    leftTopX: lon - 0.00318312662,
    rightBottomY: lat - 0.00130094108,
    rightBottomX: lon + 0.00318312662,
    leftTopY: lat + 0.00130094108,
  });

  for (let item of rangeResult.data.data) {
    if (item.crossId == task.crossId) {
      task.crossIdObj.projectId = item.projectId;
    }
  }

  nioCamera.locatePosition({
    position: Cartesian3.fromDegrees(lon, lat, 500),
    duration: 1,
    animate: true,
    before() {},
    completed() {},
  });
};

const onStartCloudMappingAnnotate = async (task: Task) => {
  await locateTask(task);

  annotationMap.annotation.clear();
  for (let routeInfo of routeInfosPanel) {
    routeInfo.annotated = false;
    routeInfo.annotation = '';
  }

  //标注任务开始的时候，要在结果集中记录一下crossId，用于区分提交任务时弹框数据
  annotationMap.crossId = task.crossId;
  annotationMap.routeInfosPanelBak.splice(0);

  try {
    //如果任务状态是已经开始，则不再调用
    if (task.statusCode == StatusCode.NONE) {
      //@ts-ignore
      let response = await axios.post('/pt/proc/beginWork', {
        type: task.taskStep == 'step_tag' ? 1 : 2,
        mappingId: task.taskParams.mappingId,
        workId: task.workId,
        taskId: task.taskId,
        operator: store.state.userInfo.realName,
        isRepair: task.taskParams.isRepairJob,
      });

      if (response.data.code != 200) {
        NioMessage('error', response.data.message);
        return false;
      }
    }

    //如果是返修任务，需要加载标注和质检标
    if (task.taskParams.isRepairJob) {
      const promise1 = queryAnnotate(task.taskId, task.workId, task.taskParams.isRepairJob);
      const promise2 = queryCheckLabel(task.taskId, task.workId, task.taskParams.isRepairJob);
      await Promise.all([promise1, promise2]);
    }
  } catch (error) {
    console.error(error);
    return false;
  }

  openCrossInfoPanel(task.crossIdObj);
  return true;
};

const onSubmitCloudMappingAnnotate = async (task: Task, params: any) => {
  //数据保存到后端
  try {
    let routes = Array.from(annotationMap.annotation, ([key, value]) => {
      return {
        routeId: key,
        markResult: value,
      };
    });

    if (!tasks.currentTask || tasks.currentTask != task) {
      NioMessage('error', '当前任务判断失败，无法提交任务');
      return false;
    }

    let assignee = store.state.userInfo.realName;

    let checks: any = [];
    let isRepair = task.taskParams.isRepairJob;

    if (isRepair) {
      //提交质检标数据
      let layer = dataManager.getLayer(CommonLayerName.CROSS_CHECK_TAG);

      checks = Array.from(layer.features, ([key, value]) => {
        let res: any = {
          ...value.properties,
          x: value.geometry?.points[0].lon,
          y: value.geometry?.points[0].lat,
        };

        res = omit(res, ['isRepair']);

        //属性里没有id，说明是新增。设id为0
        if (!('id' in res)) {
          res.id = 0;
        }

        return res;
      });

      for (let check of checks) {
        if (check.qualityResult == 1) {
          NioMessage('error', '请修改质检标结果');
          return false;
        }
      }
    }

    //@ts-ignore
    let response = await axios.post('/pt/proc/completeWork', {
      mappingId: tasks.currentTask.taskParams.mappingId,
      workId: tasks.currentTask.workId,
      taskId: tasks.currentTask.taskId,
      operator: assignee,
      junctionId: tasks.currentTask.crossId,
      routes: routes,
      isRepair: isRepair,
      check: checks,
    });

    if (response.data.code != 200) {
      NioMessage('error', response.data.message);
      return false;
    }
  } catch (error) {
    console.log(error);
    NioMessage('error', error);
    return false;
  }

  annotationMap.annotation.clear();
  dataManager.removeAllFeature(CommonLayerName.CROSS_CHECK_TAG);
  billboardManager.removeAllBillboard();

  crossInfoPanel.visible = false;
  closeAnnotationPanel();

  crossCheckPanelData.visible = false;
  return true;
};

//查询标注
async function queryAnnotate(taskId: number, workId: number, isRepair: number) {
  annotationMap.annotation.clear();

  try {
    //@ts-ignore
    let response = await axios.post(window.api.markPlatformUrl + '/pt/proc/queryMarkInfo', {
      workId: workId,
      taskId: taskId,
      isRepair: isRepair,
    });

    if (response.data.code != 200) {
      NioMessage('error', response.data.message);
      return false;
    }

    for (let label of response.data.data.routes) {
      annotationMap.annotation.set(label.routeId, label.markResult);
    }

    //更新面板标注状态
    for (let routeInfoPanel of routeInfosPanel) {
      if (annotationMap.annotation.has(routeInfoPanel.routeId)) {
        let anno = annotationMap.annotation.get(routeInfoPanel.routeId);
        routeInfoPanel.annotated = true;
        routeInfoPanel.annotation = getCrossLabelTypeDesc(anno);
      } else {
        routeInfoPanel.annotated = false;
        routeInfoPanel.annotation = '';
      }
    }
  } catch (error) {
    NioMessage('error', error);
    console.error(error);
    return false;
  }

  return true;
}

//查询质检标
async function queryCheckLabel(taskId: number, workId: number, isRepair: number) {
  dataManager.removeAllFeature(CommonLayerName.CROSS_CHECK_TAG);
  try {
    //@ts-ignore
    let response = await axios.post(window.api.markPlatformUrl + '/pt/label/queryLabel', {
      workId: workId,
      taskId: taskId,
      isRepair: isRepair,
    });

    if (response.data.code != 200) {
      NioMessage('error', response.data.message);
      return false;
    }

    for (let label of response.data.data) {
      if (isRepair) {
        label.qualityResult = 1;
      }
      let option = {
        layerName: CommonLayerName.CROSS_CHECK_TAG,
        properties: label as CrossCheckProperty,
        points: [new NioGeoPoint(label.x, label.y)],
        geometryType: NioGeometryType.POINT,
      };

      dataManager.addNewFeature(option);
    }

    billboardManager.recreatePrimitiveFromNioLayer();
  } catch (error) {
    console.error(error);
    return false;
  }

  return true;
}

const onStartCloudMappingCheck = async (task: Task) => {
  await locateTask(task);

  annotationMap.annotation.clear();
  for (let routeInfo of routeInfosPanel) {
    routeInfo.annotated = false;
    routeInfo.annotation = '';
  }

  if (task.taskParams.isRepairJob != 0) {
    NioMessage('error', '任务类型错误：isRepairJob不等于0');
    return;
  }

  try {
    //如果任务状态是已经开始，则不再调用
    if (task.statusCode == StatusCode.NONE) {
      //@ts-ignore
      let response = await axios.post('/pt/proc/beginWork', {
        type: task.taskStep == 'step_tag' ? 1 : 2,
        mappingId: task.taskParams.mappingId,
        workId: task.workId,
        taskId: task.taskId,
        operator: store.state.userInfo.realName,
        isRepair: 0,
      });

      if (response.data.code != 200) {
        NioMessage('error', response.data.message);
        return false;
      }
    }
  } catch (error) {
    console.error(error);
    return false;
  }

  //加载质检标数据
  const promise1 = queryAnnotate(task.taskId, task.workId, 0);
  const promise2 = queryCheckLabel(task.taskId, task.workId, 0);
  await Promise.all([promise1, promise2]);

  openCrossInfoPanel(task.crossIdObj);
  return true;
};

const onSubmitCloudMappingCheck = async (task: Task, params: any) => {
  if (!tasks.currentTask || tasks.currentTask != task) {
    NioMessage('error', '当前任务判断失败，无法提交任务');
    return false;
  }

  if (task.taskParams.isRepairJob != 0) {
    NioMessage('error', '任务类型错误：isRepairJob不等于0');
    return;
  }

  let approval = 0;
  let labelParams: any = [];
  let isRepair = task.taskParams.isRepairJob;
  let assignee = store.state.userInfo.realName;
  if (params == 'allowed') {
    approval = 1;
  } else {
    approval = 0;

    //提交质检标数据
    let layer = dataManager.getLayer(CommonLayerName.CROSS_CHECK_TAG);

    labelParams = Array.from(layer.features, ([key, value]) => {
      let res: any = {
        ...value.properties,
        x: value.geometry?.points[0].lon,
        y: value.geometry?.points[0].lat,
      };

      res = omit(res, ['isRepair']);

      //属性里没有id，说明是新增。设id为0
      if (!('id' in res)) {
        res.id = 0;
      }

      return res;
    });
  }

  if (tasks.currentTask) {
    try {
      //@ts-ignore
      let response = await axios.post('/pt/label/completeVerifyWorkAll', {
        workId: tasks.currentTask.workId,
        taskId: tasks.currentTask.taskId,
        operator: assignee,
        approval: approval,
        labelParams: labelParams,
      });

      if (response.data.code != 200) {
        NioMessage('error', response.data.message);
        return false;
      }
    } catch (error) {
      console.log(error);
      NioMessage('error', error);
      return false;
    }

    dataManager.removeAllFeature(CommonLayerName.CROSS_CHECK_TAG);
    billboardManager.removeAllBillboard();
  }

  crossInfoPanel.visible = false;
  closeAnnotationPanel();
  crossCheckPanelData.visible = false;

  return true;
};

async function requestTmsStartTask(task) {
  if (tasks.currentTask) {
    NioMessage('error', '请先提交当前任务');
    return false;
  }

  //已经开始了，就不再请求
  if (task.statusCode == StatusCode.STARTED) {
    return true;
  }

  try {
    let res = await axios.post(`${nioTaskURL}/work/start/${task.workId}`).then((res) => {
      if (res.data.code === 200) {
      } else {
        throw new Error(res.data.msg);
      }
    });
    return true;
  } catch (error) {
    NioMessage('error', error, 2000);
    return false;
  }
}

async function requestTmsCompleteTask(task, data) {
  try {
    let res = await axios.post(`${nioTaskURL}/work/complete/${task.workId}`, data);
    await new Promise((resolve) => setTimeout(resolve, 1500)); //等后端同步
  } catch (error) {
    throw new Error('submitTask错误:' + error);
  }
}

export async function refreshTaskList() {
  resetTaskListData();
  tasks.loading = true;

  //@ts-ignore
  let res = await axios.post(nioTaskURL + '/work/assigned/list', {
    assignee: store.state.userInfo.realName,
    pageNo: 1,
    pageSize: 200,
    containsInput: 1,
    orderBy: {
      property: 'statusCode',
      direction: 0,
    },
  });

  if (res.data.code === 200) {
    let data = res.data.data,
      result = data.result;

    for (let i = 0; i < result.length; i++) {
      if (result[i].typeCode == TaskType.CLOUD_MAPPING_CHECK) {
        let taskInfo = result[i]['inputList'].reduce((prev, item) => ((prev[item.name] = item.value), prev), {});

        let crossId = taskInfo.junctionId;
        let detail: string[] = [];

        //是否是返修任务
        let isRepairJob = 0;

        let onStartTask;
        let onSubmitTask;
        if (result[i].workKey == 'step_tag') {
          if (result[i].tagList == '返修') {
            isRepairJob = 1;
          }

          onStartTask = onStartCloudMappingAnnotate;
          onSubmitTask = onSubmitCloudMappingAnnotate;
        } /*if(result[i].workKey == '"step_tag_adjusting"')*/ else {
          onStartTask = onStartCloudMappingCheck;
          onSubmitTask = onSubmitCloudMappingCheck;
        }

        detail.push(result[i].lineName);
        detail.push(`路口ID: ${crossId}`);
        detail.push(`生产批次: ${taskInfo.batch}`);
        detail.push(`备注: ${result[i].taskRemark}`);

        tasks.data.push({
          taskType: result[i].typeCode as TaskType,
          taskStep: result[i].workKey,
          taskName: result[i].taskName,
          taskId: result[i].taskId,
          workId: result[i].workId,
          workName: result[i].workName,
          taskDesc: '',
          detail: detail,
          taskParams: {
            mappingId: taskInfo.postHandleTaskId,
            isRepairJob: isRepairJob,
          },
          statusCode: result[i].statusCode as StatusCode,
          crossId: crossId,
          onStart: onStartTask,
          onSubmit: onSubmitTask,
          onLocate: onLocateTask,
          crossIdObj: {
            id: crossId,
            projectId: undefined,
          },
        });
      } else if (result[i].typeCode == TaskType.ISSUE_DISTRIBUTE) {
        let taskInfo = result[i]['inputList'].reduce((prev, item) => ((prev[item.name] = item.value), prev), {});

        let detail: string[] = [];
        detail.push('问题分发');
        detail.push(`任务名称：${result[i].taskName}`);
        detail.push(`备注: ${result[i].taskRemark}`);

        const onLocate = () => {
          try {
            let pos = parseWKT.read(taskInfo.location);
            nioCamera.locatePosition({
              position: Cartesian3.fromDegrees(pos[0], pos[1], 500),
              duration: 1,
              animate: true,
              before() {},
              completed() {},
            });
          } catch (error) {
            NioMessage('warning', error, 2000);
          }
        };

        tasks.data.push({
          taskType: result[i].typeCode as TaskType,
          taskStep: result[i].workKey,
          taskName: result[i].taskName,
          taskId: result[i].taskId,
          workId: result[i].workId,
          workName: result[i].workName,
          taskDesc: '',
          taskParams: {
            triageId: taskInfo.triage_id,
            isRepairJob: false,
            caseId: taskInfo.case_id,
          },
          detail: detail,
          statusCode: result[i].statusCode as StatusCode,
          onStart: async (task: Task) => {
            onLocate();
            return await requestTmsStartTask(task);
          },
          onSubmit: async (task: Task, param: any) => {
            let res = await submitIssueTask(task, param);
            if (res) {
              await requestTmsCompleteTask(task, {});
            }

            return true;
          },
          onLocate: onLocate,
        });
      } else if (result[i].typeCode == TaskType.ISSUE_ANALYSIS) {
        let taskInfo = result[i]['inputList'].reduce((prev, item) => ((prev[item.name] = item.value), prev), {});

        let detail: string[] = [];
        detail.push('问题分析');
        detail.push(`任务名称：${result[i].taskName}`);
        detail.push(`备注: ${result[i].taskRemark}`);

        const onLocate = () => {
          try {
            let pos = parseWKT.read(taskInfo.location);
            nioCamera.locatePosition({
              position: Cartesian3.fromDegrees(pos[0], pos[1], 500),
              duration: 1,
              animate: true,
              before() {},
              completed() {},
            });
          } catch (error) {
            NioMessage('warning', error, 2000);
          }
        };

        tasks.data.push({
          taskType: result[i].typeCode as TaskType,
          taskStep: result[i].workKey,
          taskName: result[i].taskName,
          taskId: result[i].taskId,
          workId: result[i].workId,
          workName: result[i].workName,
          taskDesc: '',
          taskParams: {
            isRepairJob: false,
            triageId: taskInfo.triage_id,
            analyseId: taskInfo.analyse_id,
            sceneCode: taskInfo.scene_code,
            stepCode: taskInfo.step_code,
          },
          detail: detail,
          statusCode: result[i].statusCode as StatusCode,
          onStart: async (task: Task) => {
            onLocate();
            await requestTmsStartTask(task);
            return true;
          },
          onSubmit: async (task: Task, param: any) => {
            let res = false;
            if (param == 1 /*TaskIssueDlgType.PASS*/) {
              res = await submitIssueConfirm(task, param);
            } else if (param == 2 /*TaskIssueDlgType.TRANSFER*/) {
              res = await submitIssueTransfer(task, param);
            }

            if (res) {
              await requestTmsCompleteTask(task, {});
            }

            return res;
          },
          onLocate: onLocate,
        });
      }
    }

    await checkTaskStateAndStart();
  } else {
    tasks.loading = false;
    NioMessage('error', 'loadingTaskList错误:' + res.data.msg, 2000);
    throw new Error('loadingTaskList错误:' + res.data.msg);
  }

  tasks.loading = false;
}
