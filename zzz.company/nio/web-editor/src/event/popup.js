/**
 * 右键弹窗信息
 */
export class PopupData {
    visible;
    pos;
    type;
    meta;

    /**
     * @constructor
     * @param visible{Boolean, require}
     * @param pos{[Number]}
     * @param type{String}
     * @param meta{Object}
     */
    constructor(visible, pos = [0, 0], type = '', meta = {}) {
        this.visible = visible;
        this.pos = pos;
        this.type = type;
        this.meta = meta;
    }
}
