import {reactive} from 'vue';
import moment from 'moment';
import {Task, submitTask, tasks} from '../system/task-list.ts';
import {NioMessage} from '../utils/utils.js';
import axios from 'axios';

// @ts-ignore
const caseAnalysisURL = window.api.caseAnalysisURL;

export enum TaskIssueDlgType {
  PASS = 1, //通过
  TRANSFER = 2, //流转
}

let timer: string | null = null;
const curTimer = moment().startOf().subtract(1, 'days').format('YYYYMMDD');
if (localStorage.getItem('timer')) {
  timer = localStorage.getItem('timer');
} else {
  timer = curTimer;
  localStorage.setItem('timer', timer);
}

export const taskIssueDlgPanelData = reactive<{
  visible: boolean;
  title: string;
  type: TaskIssueDlgType;
  time: string | null;
  issueClass: string;
  issueClassOption: {value: string; label: string}[];
  issueEdition: string;
  taskTransferOption: {code: string; name: string}[];
  transferTo: string;
  detail: string;
  loading: boolean;
  onOk: () => Promise<void>;
  onCancel: () => void;
}>({
  visible: false,
  title: '',
  type: TaskIssueDlgType.PASS,
  time: timer,
  issueClass: '',
  issueClassOption: [
    {value: '1', label: '1'},
    {value: '2', label: '2'},
  ],
  issueEdition: '',
  taskTransferOption: [],
  transferTo: '',
  detail: '',
  loading: false,
  onOk: async () => {
    taskIssueDlgPanelData.loading = true;
    if (await submitTask(taskIssueDlgPanelData.type)) {
      taskIssueDlgPanelData.visible = false;
    }
    taskIssueDlgPanelData.loading = false;
  },
  onCancel: () => {
    taskIssueDlgPanelData.visible = false;
  },
});

export async function getIssueClassOption() {
  if (!tasks.currentTask) {
    NioMessage('error', '没有进行中的任务');
    return false;
  }

  let sceneCode = tasks.currentTask.taskParams.sceneCode;
  let stepCode = tasks.currentTask.taskParams.stepCode;

  taskIssueDlgPanelData.loading = true;

  try {
    let res = await axios.get(caseAnalysisURL + '/cas/issue/list/' + sceneCode + '/' + stepCode);

    if (res.data.code != 200) {
      throw '/cas/issue/list/ failed: ' + res.data.msg;
    }

    taskIssueDlgPanelData.issueClassOption = [];
    for (let item of res.data.data) {
      taskIssueDlgPanelData.issueClassOption.push({value: item.id, label: item.description});
    }

    taskIssueDlgPanelData.loading = false;
    return true;
  } catch (error) {
    NioMessage('error', error);
    taskIssueDlgPanelData.loading = false;
    return false;
  }
}

export async function getIssueStepOption() {
  if (!tasks.currentTask) {
    NioMessage('error', '没有进行中的任务');
    return false;
  }

  taskIssueDlgPanelData.loading = true;

  try {
    let sceneCode = tasks.currentTask.taskParams.sceneCode;
    if (!sceneCode) {
      throw 'sceneCode is empty';
    }

    let res = await axios.get(caseAnalysisURL + '/cas/code/step?sceneCode=' + sceneCode);
    if (res.data.code != 200) {
      throw '/cas/code/step?sceneCode=' + sceneCode + ' failed: ' + res.data.msg;
    }

    taskIssueDlgPanelData.taskTransferOption = [];
    for (let item of res.data.data) {
      taskIssueDlgPanelData.taskTransferOption.push({code: item.code, name: item.name});
    }

    taskIssueDlgPanelData.loading = false;
    return true;
  } catch (error) {
    NioMessage('error', error);
    taskIssueDlgPanelData.loading = false;
    return false;
  }
}

export const submitIssueConfirm = async (task: Task, param: any) => {
  if (!tasks.currentTask || tasks.currentTask != task) {
    NioMessage('error', '当前任务判断失败，无法提交任务');
    return false;
  }

  if (taskIssueDlgPanelData.issueClass == '') {
    NioMessage('warning', '请输入或选择问题分类');
    return false;
  }

  let id: any = null;
  //查找是已有还是新增
  for (let des of taskIssueDlgPanelData.issueClassOption) {
    if (des.label === taskIssueDlgPanelData.issueClass) {
      id = des.value;
      break;
    }
  }

  try {
    let res = await axios.post(caseAnalysisURL + '/cas/case-analyse/link-issue', {
      analyseId: tasks.currentTask.taskParams.analyseId,
      comment: taskIssueDlgPanelData.detail,
      issue: {
        id: id,
        description: taskIssueDlgPanelData.issueClass,
        currentVersion: taskIssueDlgPanelData.issueEdition,
      },
    });

    if (res.data.code != 200) {
      throw '/cas/case-analyse/link-issue failed: ' + res.data.msg;
    }
    return true;
  } catch (error) {
    NioMessage('error', error);
    return false;
  } finally {
    taskIssueDlgPanelData.detail = '';
    taskIssueDlgPanelData.issueClass = '';
    taskIssueDlgPanelData.transferTo = '';
    taskIssueDlgPanelData.issueEdition = '';
  }
};

export const submitIssueTransfer = async (task: Task, param: any) => {
  if (!tasks.currentTask || tasks.currentTask != task) {
    NioMessage('error', '当前任务判断失败，无法提交任务');
    return false;
  }

  try {
    let res = await axios.post(caseAnalysisURL + '/cas/case-analyse/redirect', {
      analyseId: tasks.currentTask.taskParams.analyseId,
      comment: taskIssueDlgPanelData.detail,
      redirectTo: taskIssueDlgPanelData.transferTo,
    });

    if (res.data.code != 200) {
      throw '/cas/case-analyse/redirect failed: ' + res.data.msg;
    }
    return true;
  } catch (error) {
    NioMessage('error', error);
    return false;
  } finally {
    taskIssueDlgPanelData.detail = '';
    taskIssueDlgPanelData.issueClass = '';
    taskIssueDlgPanelData.transferTo = '';
    taskIssueDlgPanelData.issueEdition = '';
  }
};
