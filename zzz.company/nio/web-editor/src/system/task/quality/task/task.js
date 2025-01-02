import QualityModelTask from "./QualityModelTask.js";
import {reactive} from "vue";
import {saveQualityTagHandler} from "../tag/tag.js";
import {NioMessage, NioNotification} from "../../../../utils/utils.js";
import {submitQualityTaskHandler} from "../../taskList/finishTask.js";
import {taskData} from "../../taskList/taskList.js";
import QualityStatus from "../enum/QualityStatus.js";
import {qualityData} from "../quality.js";
import {aoPanelVisible, aoVideoPanelVisible} from "../../../trajectory/AoTrajectorylayer.js";

export const qualityTask = reactive(new QualityModelTask());

export function qualityUploadConfirm() {
    qualityTask.resolve?.();
}

export function qualityUploadCancel() {
    qualityTask.reject?.();
}

function uploadQuality(task) {
    qualityTask.loading = true;
    saveQualityTagHandler(task).then(() => {
        return submitQualityTaskHandler(task, {
            variables: {
                isOk: qualityTask.isPass ? '1' : '0'
            }
        });
    }).then(() => {
        NioMessage('success', '质检已提交');
    }).catch(err => {
        NioNotification('error', '质检提交失败', err.message);
    }).finally(() => {
        qualityTask.loading = false;
    });
}

function checkQualityStatusNormal(isPass) {

    let curTagList = taskData.runningTask.qualityTagList, flag = false;
    if (isPass === true) {
        flag = curTagList.some(qualityTask => qualityTask.status === QualityStatus.NORMAL);
        if (flag === true) {
            NioMessage('warning', '质检通过前请先清空质检标');
            return false;
        }
    } else if (isPass === false) {
        flag = curTagList.every(qualityTag => qualityTag.status !== QualityStatus.NORMAL);
        if (flag === true) {
            NioMessage('warning', '质检不通过请先添加质检标');
            return false;
        }
    }
    return true;
}

export function setQualityResult(isPass, task) {
    if (checkQualityStatusNormal(isPass)) {

        if(task.workKey === "step_user_ao_check" ){
            qualityData.contentConfirm = "质检通过后，该质检结果将发送到动态图层，并传递至AO团队，是否确认？";
            qualityData.contentCancel = "质检不通过，该质检标类型及描述传递至动态图层，并返回至AO团队，是否确认？";
        }
        else{
            qualityData.contentConfirm = "质检通过后，该任务的事件数据会自动发送至车端生效，是否确认？";
            qualityData.contentCancel = "质检不通过，该任务将打回至作业员进行质检返修，是否确认？";
        }

        new Promise((resolve, reject) => {
            Object.assign(qualityTask, {
                visible: true,
                isPass: isPass,
                resolve: resolve,
                reject: reject,
            });
        }).then(() => {
            uploadQuality(task);
        }).catch(() => {
            qualityTask.visible = false;
        }).finally(() =>{
            //关闭AO质检照片面板和轨迹
            aoPanelVisible.value = false;
            aoVideoPanelVisible.value = false;
        });
    }
}
