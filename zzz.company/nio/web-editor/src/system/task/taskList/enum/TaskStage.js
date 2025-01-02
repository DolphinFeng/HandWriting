/**
 * 当前任务阶段
 * @enum {string}
 * @constant
 */
const TaskStage = {
    //空闲状态
    FREE: 'step_user_free',
    //作业中
    WORKING: 'step_user_edit',
    //质检中
    QUALITY_CHECK: 'step_user_check',
};
export default Object.freeze(TaskStage);
