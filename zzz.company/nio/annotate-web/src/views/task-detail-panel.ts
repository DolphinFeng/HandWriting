import {reactive, ref} from 'vue';
import {Task} from '../system/task-list.ts';
import axios from 'axios';
import {NioMessage} from '../utils/utils.js';

// @ts-ignore
const caseAnalysisURL = window.api.caseAnalysisURL;

export interface TaskTransferResumeRecord {
  createTime: string;
  text: string;
  desc: string;
}

export const taskDetailPanel = reactive<{
  visible: boolean;
  loading: boolean;
  descriptions: {
    summary: string;
    items: {
      key: string;
      value: string;
    }[];
  }[];
  transferResume: TaskTransferResumeRecord[];
}>({
  visible: false,
  loading: false,
  descriptions: [],
  transferResume: [],
});

export async function refreshAnalysisDetailPanel(task: Task) {
  //履历更新了，轨迹要清空
  taskDetailPanel.visible = true;
  taskDetailPanel.loading = true;
  taskDetailPanel.descriptions.splice(0);
  taskDetailPanel.transferResume.splice(0);

  try {
    //@ts-ignore
    let response = await axios.get(caseAnalysisURL + '/cas/case-triage/detail?triageId=' + task.taskParams.triageId);

    if (response.data.code != 200) {
      NioMessage('error', response.data.msg, 2000);
      return false;
    }

    let issueCase = response.data.data.issueCase;

    let issueInfoItems: {key: string; value: string}[] = [];
    issueInfoItems.push({key: 'issue_id', value: issueCase.id});
    issueInfoItems.push({key: 'issue来源', value: issueCase.sourceText});
    issueInfoItems.push({key: '问题场景', value: issueCase.sceneText});
    issueInfoItems.push({key: 'issue内容', value: issueCase.detail});
    issueInfoItems.push({key: 'issue描述', value: issueCase.description});

    taskDetailPanel.descriptions.push({
      summary: 'issue基本信息',
      items: issueInfoItems,
    });

    let referInfoItems: {key: string; value: string}[] = [];
    for (let item of issueCase.produceTraceList) {
      referInfoItems.push({key: item.stepName, value: item.dataIdentifier});
    }

    taskDetailPanel.descriptions.push({
      summary: '参考信息',
      items: referInfoItems,
    });

    let distributeInfoItems: {key: string; value: string}[] = [];
    distributeInfoItems.push({key: '父问题', value: response.data.data.parentCategoryName});
    distributeInfoItems.push({key: '子问题', value: response.data.data.categoryName});
    distributeInfoItems.push({key: '时间', value: response.data.data.issueCase.createTime});
    //distributeInfoItems.push({key: '操作人', value: ''});

    taskDetailPanel.descriptions.push({
      summary: '分发信息',
      items: distributeInfoItems,
    });

    for (let item of response.data.data.analyseList) {
      let text: string = '负责人 = ' + item.owner + ', 模块 = ' + item.stepName;
      if (item.nextStepName) {
        text += ', 流转任务至 ' + item.nextStepName;
      }
      taskDetailPanel.transferResume.push({
        createTime: item.createTime,
        text: text,
        desc: item.comment,
      });
    }
  } catch (error) {
    console.error(error);
  } finally {
    taskDetailPanel.loading = false;
  }

  return true;
}

export async function refreshDistrubiteDetailPanel(task: Task) {
  //履历更新了，轨迹要清空
  taskDetailPanel.visible = true;
  taskDetailPanel.loading = true;
  taskDetailPanel.descriptions.splice(0);
  taskDetailPanel.transferResume.splice(0);

  try {
    //@ts-ignore
    let response = await axios.get(caseAnalysisURL + '/cas/issue-case/detail?caseId=' + task.taskParams.caseId);

    if (response.data.code != 200) {
      NioMessage('error', response.data.msg, 2000);
      return false;
    }

    let issueCase = response.data.data;

    let issueInfoItems: {key: string; value: string}[] = [];
    issueInfoItems.push({key: 'issue_id', value: issueCase.id});
    issueInfoItems.push({key: 'issue来源', value: issueCase.sourceText});
    issueInfoItems.push({key: '问题场景', value: issueCase.sceneText});
    issueInfoItems.push({key: 'issue内容', value: issueCase.detail});
    issueInfoItems.push({key: 'issue描述', value: issueCase.description});

    taskDetailPanel.descriptions.push({
      summary: 'issue基本信息',
      items: issueInfoItems,
    });
  } catch (error) {
    console.error(error);
  } finally {
    taskDetailPanel.loading = false;
  }

  return true;
}
