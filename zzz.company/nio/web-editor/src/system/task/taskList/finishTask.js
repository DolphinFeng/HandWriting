import axios from "axios";
import {refreshTaskList} from "./loadingTaskList.js";
import {clearQualityData} from "../quality/quality.js";
import {clearOddData} from "../../odd/saveOdd/saveOdd.js";
import {loadingSourceOddHandler} from "../../odd/loading/loadingOddData.js";
import taskData from "./taskData.js";
import store from "../../../store/index.js";
import {closeEventListPanel} from "../../../system/odd/batch/eventList.js";
import { modifiedWorkEvents } from "../../EventBatchEdit.js";

const nioTaskURL = window.api.nioTaskURL;

function submitTask(task, data) {

    closeEventListPanel();
    modifiedWorkEvents.clear();
    
    return axios.post(`${nioTaskURL}/work/complete/${task.workId}`, data).then(res => {
        if (res.data.code === 200) {

          return new Promise(function(resolve){
            //质检通过后，入母库数据需要时间，所以等候一下
            setTimeout(() => {
              clearOddData();
              clearQualityData();
              refreshTaskList();
              loadingSourceOddHandler(true);
              resolve();
            }, 1500)
          });

        } else {
            throw new Error("submitTask错误:" + res.data.msg);
        }
    });
}

export function submitWorkTaskHandler(task) {
    return submitTask(task, {});
}

export function submitQualityTaskHandler(task, data) {
    return submitTask(task, data);
}

export function checkTaskVersionMatch() {
    return taskData.runningTask?.mapVersion.toString() === store.state.version.curVersion.toString();
}
