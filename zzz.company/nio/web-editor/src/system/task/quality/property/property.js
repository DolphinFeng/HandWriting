import QualityTag from "../tag/QualityTag.js";
import QualityModelProperty from "./QualityModelProperty.js";
import QualityType from "../enum/QualityType.js";
import QualityResult from "../enum/QualityResult.js";
import {markRaw, reactive} from "vue";

export const qualityProperty = reactive(new QualityModelProperty());

export function changeQualityProperty(qualityTag) {
    if (qualityTag instanceof QualityTag) {
        qualityProperty.qualityTag = markRaw(qualityTag);
        qualityProperty.type = qualityTag.type;
        qualityProperty.desc = qualityTag.desc;
        qualityProperty.tagResult = qualityTag.result;
    } else {
        qualityProperty.reset();
    }
}

export function saveQualityProperty() {
    if (qualityProperty.qualityTag instanceof QualityTag) {
        Object.assign(qualityProperty.qualityTag, {
            type: qualityProperty.type,
            desc: qualityProperty.desc,
            result: qualityProperty.tagResult,
        });
    }
}
