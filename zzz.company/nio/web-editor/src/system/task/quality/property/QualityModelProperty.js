import QualityType from "../enum/QualityType.js";
import QualityResult from "../enum/QualityResult.js";

export default class QualityModelProperty {
    /**@type {QualityTag}*/
    qualityTag;

    /**@type {number}*/
    type;

    /**@type {string}*/
    desc;

    /**@type {number}*/
    tagResult;

    constructor() {
        this.reset();
    }

    reset() {
        this.qualityTag = null;
        this.type = QualityType.OVER;
        this.desc = '';
        this.tagResult = QualityResult.WAIT_MODIFY;
    }
}

