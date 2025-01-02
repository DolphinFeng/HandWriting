/**
 * 质检标结果
 * @enum {number}
 */
const QualityResult = {
    /**
     * 待修改
     */
    WAIT_MODIFY: 1,
    /**
     * 已修改
     */
    MODIFIED: 2,
    /**
     * 无需修改
     */
    NO_NEED_MODIFY: 3
};
export default Object.freeze(QualityResult);
