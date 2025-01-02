import {reactive} from "vue";
import {Cartesian2} from "cesium";

/**
 * 矩形搜索范围
 */
const loadingFrame = reactive({
    show: false,
    left: 0,
    top: 0,
    width: 0,
    height: 0,
});

/**
 * 设置搜索框,返回搜索框中点
 * @param show{boolean}
 * @param stPos{Cartesian2}
 * @param edPos{Cartesian2}
 * @return{Cartesian2}
 */
function setLoadingFrame(show, stPos = null, edPos = null) {
    if (show) {
        const min = Math.min, max = Math.max;
        let x1 = min(stPos.x, edPos.x);
        let x2 = max(stPos.x, edPos.x);
        let y1 = min(stPos.y, edPos.y);
        let y2 = max(stPos.y, edPos.y);
        Object.assign(loadingFrame, {
            show: true,
            left: x1,
            top: y1,
            width: x2 - x1,
            height: y2 - y1,
        });
        return new Cartesian2((x1 + x2) / 2, (y1 + y2) / 2);
    } else {
        //预计加载线需要200ms
        setTimeout(() => {
            Object.assign(loadingFrame, {
                show: false,
                width: 0,
                height: 0,
            });
        }, 200);
    }
}

export {setLoadingFrame, loadingFrame}
