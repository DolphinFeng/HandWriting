import captureData from "./captureData.js";
import {taskData} from "../taskList.js";

export default function resetCaptureData() {
    Object.assign(captureData, {
        curImgIdx: 0,
        list: [],
        showViewer: false,
        visible: false,
    });
}

export function captureClickHandler(idx) {
    if (taskData.list[idx].errCaptures === captureData.list) {
        Object.assign(captureData, {
            curImgIdx: 0,
            visible: false,
            list: [],
        });
    } else {
        Object.assign(captureData, {
            curImgIdx: 0,
            visible: true,
            list: taskData.list[idx].errCaptures,
        });
    }
}
