import {billBoardAnimate, destroyBillboards, initBillboards} from "./billboard/billboard.js";
import qualityData from "./qualityData.js";
import {changeQualityProperty} from "./property/property.js";

function resetQualityData() {
    qualityData.billboardModel.reset();
    qualityData.taskModel.reset();
    qualityData.propertyModel.reset();
}

export function clearQualityData() {
    billBoardAnimate.stop();
    destroyBillboards();
    initBillboards();
    resetQualityData();
    changeQualityProperty(null);
}

export function initQuality() {
    initBillboards();
}

export function destroyQuality() {
    clearQualityData();
    destroyBillboards();
}
