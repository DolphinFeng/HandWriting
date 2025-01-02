import axios from "axios";
import {generateWKT} from "../../../../utils/wkt/generateWKT.js";
import QualityTag from "./QualityTag.js";
import {parseWKT} from "../../../../utils/wkt/parseWKT.js";
import {Cartesian3} from "cesium";
import QualityStatus from "../enum/QualityStatus.js";

const apiDynamicURL = window.api.apiDynamicURL;

function queryQualityTag(task) {
    return axios.post(apiDynamicURL + '/dynamic-map/qalog/branch/fetch', {
        branchName: task.oddBranchName,
    }).then(res => {
        if (res.data.code === 200) {
            let data = res.data.data;
            task.qualityTagList = data.map(item => {
                let position = parseWKT.read(item.geometry);
                return new QualityTag(
                    Cartesian3.fromDegrees(position[0], position[1], position[2]),
                    item['qaUser'],
                    item['branchName'],
                    item['logType'],
                    item['logDesc'],
                    item['opResult'],
                    QualityStatus.NORMAL,
                    item['id'],
                );
            });
            task.refreshValidTagList();
        } else {
            throw new Error("queryQualityTag错误:" + res.data.msg);
        }
    });
}

/**
 * @param task{OddTask}
 */
function modifyQualityTag(task) {
    const data = task.qualityTagList.map(item => ({
        id: item.id,
        opResult: item.result,
        opUser: item.user,
    }));
    return axios.post(apiDynamicURL + '/dynamic-map/qalog/branch/update-op-result', data).then(res => {
        if (res.data.code === 200) {

        } else {
            throw new Error("modifyQualityTag错误:" + res.data.msg);
        }
    });
}

/** @param task{OddTask} */
function saveQualityTag(task) {
    let data = task.qualityTagList.map(item => ({
        id: item.id ?? undefined,
        branchName: task.oddBranchName,
        logType: item.type,
        logDesc: item.desc,
        geometry: generateWKT.write('point', item.position),
        logSource: 1,
        qaUser: item.user,
        opResult: item.result,
        qaStatus: item.status,
    }));
    return axios.post(apiDynamicURL + '/dynamic-map/qalog/branch/save', data).then(res => {
        if (res.data.code === 200) {

        } else {
            throw new Error("saveQualityTag错误:" + res.data.msg);
        }
    });
}

/** @param task{OddTask} */
export function requestQualityTagHandler(task) {
    return queryQualityTag(task).then(() => {
    });
}

export function modifyQualityTagHandler(task) {
    return modifyQualityTag(task);
}

export function saveQualityTagHandler(task) {
    return saveQualityTag(task);
}
