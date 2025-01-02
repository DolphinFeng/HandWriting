import {ref, reactive} from 'vue';
import TaskStage from './enum/TaskStage.js';

class TaskData {
  constructor() {
    this.taskStage = TaskStage.FREE;

    /** @type{OddTask} */
    this.runningTask = null;

    this.loading = false;

    /** @type{OddTask[]} */
    this.list = [];
    this.pageNo = 1;
    this.pageSize = 200;
    this.total = 0;
  }
}

/** 获取当前任务的source类型 */
function getRunningTaskSource() {
  if (taskData.runningTask !== null && taskData.runningTask.statusCode === 3) {
    if (
      taskData.runningTask.typeCode !== undefined &&
      taskData.runningTask.typeCode !== null &&
      taskData.runningTask.typeCode === 'issue_odd_event_making'
    ) {
      return 3;
    } else if (
      taskData.runningTask.typeCode !== undefined &&
      taskData.runningTask.typeCode !== null &&
      taskData.runningTask.typeCode === 'ao_event_making'
    ) {
      return 4;
    } else if (
      taskData.runningTask.typeCode !== undefined &&
      taskData.runningTask.typeCode !== null &&
      taskData.runningTask.typeCode === 'ao_event_check'
    ) {
      return 5;
    } else if (
      taskData.runningTask.typeCode !== undefined &&
      taskData.runningTask.typeCode !== null &&
      taskData.runningTask.typeCode === 'odd_mining_making'
    ) {
      return 6;
    } else if (
      taskData.runningTask.typeCode !== undefined &&
      taskData.runningTask.typeCode !== null &&
      taskData.runningTask.typeCode === 'nio_map_permit_ramp'
    ) {
      return 7;
    } else {
      return 1;
    }
  }

  //没有进行中的任务，对应放行浏览模式，也就是5
  return 5;
}

/** @type {TaskData} */
const taskData = reactive(new TaskData());
const taskPanelVisible = ref(false);
export default taskData;
export {getRunningTaskSource, taskPanelVisible};
