/** ODD事件状态 */
const OddStatus = {
    /**
     * 默认
     * @type{number}
     */
    DEFAULT: 0,
    EFFECTIVE: 1, //有效
    LOSE_EFFICACY: 2, //失效（已删除）
};

export default Object.freeze(OddStatus);
