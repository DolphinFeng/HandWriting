/** 预缓存下载器 */
class PreCache {
    _idx = 0;
    loader = [];
    get idx() {
        return this._idx;
    }
    set idx(value) {
        if (value >= this.loader.length) {
            this._idx = 0;
        } else {
            this._idx = value;
        }
    }
    constructor(loaderNum) {
        for (let i = 0; i < loaderNum; i++) {
            this.loader.push(document.createElement('img'));
        }
    }

    /**
     * 下载器
     * @param source 传入src数组或单个src
     * @param from 开始位置
     * @param to 结束位置
     */
    download(source, from = 0, to) {
        if (Array.isArray(source)) {
            to = to ? to : source.length;
            for (let i = from; i < to; i++) {
                this.loader[this.idx++].src = source[i];
            }
        } else {
            this.loader[this.idx++].src = source;
        }
    }
    get volume() {
        return this.loader.length;
    }
    set volume(value) {
        let sub = value - this.loader.length;
        if (sub < 0) {
            this.loader = this.loader.slice(0, sub);
        } else {
            for (let i = 0; i < sub; i++) {
                this.loader.push(document.createElement('img'));
            }
        }
    }
}

export default new PreCache(100);
