import resetCaptureData from "./capture/captureController.js";
import taskData from "./taskData.js";
import TaskStage from "./enum/TaskStage.js";

function resetTaskListData() {
    Object.assign(taskData, {
        taskStage: TaskStage.FREE,
        runningTask: null,
        loading: false,
        list: [],
        pageNo: 1,
        pageSize: 10,
        total: 0,
    });
}

export default function resetTask() {
    resetTaskListData();
    resetCaptureData();
}
