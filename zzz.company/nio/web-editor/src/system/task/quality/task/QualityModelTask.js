/** 质检任务 */
export default class QualityModelTask {
    /** @type {boolean} */
    visible;

    /** @type {boolean} */
    loading;

    /** @type {boolean} */
    isPass;

    isPreSuccess;

    resolve;

    reject;
    constructor() {
        this.reset();
    }

    reset() {
        this.visible = false;
        this.loading = false;
        this.isPass = false;
        this.resolve = null;
        this.reject = null;
    }

}
