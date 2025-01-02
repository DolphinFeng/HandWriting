import {reactive} from 'vue';
import axios from 'axios';
import {NioMessage} from '../utils/utils';
import {tasks, Task, submitTask} from '../system/task-list.ts';

// @ts-ignore
const caseAnalysisURL = window.api.caseAnalysisURL;

export const taskIssueDisDlgPanelData = reactive<{
  visible: boolean;
  title: string;
  loading: boolean;
  crossId: string;
  fusionTaskId: string;
  issuePairs: {
    parentIssueTypeOption: {label: string; value: string}[];
    childIssueTypeOption: {label: string; value: string}[];
    parentType: string;
    childType: string;
  }[];
  onOk: () => Promise<void>;
  onCancel: () => void;
}>({
  visible: false,
  title: '问题分发',
  crossId: '',
  fusionTaskId: '',
  issuePairs: [],
  loading: false,
  onOk: async () => {
    taskIssueDisDlgPanelData.loading = true;
    if (await submitTask(null)) {
      taskIssueDisDlgPanelData.visible = false;
      taskIssueDisDlgPanelData.issuePairs = [];
      taskIssueDisDlgPanelData.crossId = '';
      taskIssueDisDlgPanelData.fusionTaskId = '';
    }
    taskIssueDisDlgPanelData.loading = false;
  },
  onCancel: () => {
    taskIssueDisDlgPanelData.visible = false;
  },
});

export const submitIssueTask = async (task: Task, param: any) => {
  if (!tasks.currentTask || tasks.currentTask != task) {
    NioMessage('error', '当前任务判断失败，无法提交任务');
    return false;
  }

  let triageList: {parentCategoryCode: string; categoryCode: string}[] = [];
  for (let item of taskIssueDisDlgPanelData.issuePairs) {
    triageList.push({
      parentCategoryCode: item.parentType,
      categoryCode: item.childType,
    });
  }

  let propertyList: {
    name: string;
    value: string;
  }[] = [];

  propertyList.push({
    name: 'sitePid',
    value: taskIssueDisDlgPanelData.crossId,
  });

  propertyList.push({
    name: 'mergeTaskKey',
    value: taskIssueDisDlgPanelData.fusionTaskId,
  });

  try {
    let res = await axios.post(caseAnalysisURL + '/cas/case-triage/create', {
      caseId: tasks.currentTask.taskParams.caseId,
      propertyList: propertyList,
      triageList: triageList,
    });

    if (res.data.code != 200) {
      throw '/cas/case-triage/create failed: ' + res.data.msg;
    }

    return true;
  } catch (error) {
    NioMessage('error', error);
    return false;
  }
};

export let issueTypeOptions: {
  parentCode: string;
  parentName: string;
  childOptions: {
    code: string;
    name: string;
  }[];
}[] = [];

export async function loadIssueType() {
  try {
    let res = await axios.get(caseAnalysisURL + '/cas/issue-category/tree/cross');

    if (res.data.code != 200) {
      throw '/cas/issue-category/tree/cross failed: ' + res.data.msg;
    }

    issueTypeOptions.splice(0);
    taskIssueDisDlgPanelData.issuePairs = [];

    for (let item of res.data.data) {
      let childOptions: {
        code: string;
        name: string;
      }[] = [];
      for (let subItem of item.children) {
        childOptions.push({
          name: subItem.name,
          code: subItem.code,
        });
      }

      issueTypeOptions.push({
        parentCode: item.code,
        parentName: item.name,
        childOptions: childOptions,
      });
    }

    let parentOptions: any = [];
    for (let item of issueTypeOptions) {
      parentOptions.push({label: item.parentName, value: item.parentCode});
    }

    taskIssueDisDlgPanelData.issuePairs.push({
      parentIssueTypeOption: parentOptions,
      childIssueTypeOption: issueTypeOptions[0].childOptions.map((item) => {
        return {
          label: item.name,
          value: item.code,
        };
      }),
      parentType: issueTypeOptions[0].parentCode,
      childType: issueTypeOptions[0].childOptions[0].code,
    });
  } catch (error) {
    NioMessage('error', error);
  }
}
