import {qualityProperty} from "./property/property.js";
import {qualityTask} from "./task/task.js";
import {qualityBillboard} from "./billboard/billboard.js";

const qualityData = {
    billboardModel: qualityBillboard,
    taskModel: qualityTask,
    propertyModel: qualityProperty,
    contentConfirm: "质检通过后，该任务的事件数据会自动发送至车端生效，是否确认？",
    contentCancel: "质检不通过，该任务将打回至作业员进行质检返修，是否确认？",
}
export default qualityData;
