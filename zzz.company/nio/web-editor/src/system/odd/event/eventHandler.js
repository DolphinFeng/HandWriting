import {hoverOddLayer} from "../hoverOddLayer.js";
import {isPaneModeEqual, PanelOpenType, setPanelMode} from "../eventPanel/oddPanelData.js";
import {oddLayer} from "../oddLayer.js";
import store from "../../../store/index.js";
import {PopupData} from "../../../event/popup.js";

/** 左键点击车道的策略集合 */
const clickLaneStrategy = {
    //点击了hoverLane，仅保留这一条，其余的hoverLane删除
    'ARROW_HOVER_LANE': function (oddLane, eventId, eventIds) {
        if (hoverOddLayer.hoverLanes.size === 1) {
            hoverOddLayer.clearOneHoverLane(oddLane);
        } else {
            for (let hoverLane of hoverOddLayer.hoverLanes.values()) {
                if (oddLane !== hoverLane) {
                    hoverOddLayer.clearOneHoverLane(hoverLane);
                }
            }
            if (isPaneModeEqual(PanelOpenType.CREATE_MULTI)) {
                setPanelMode(PanelOpenType.CLOSE);
            }
        }
        this.viewer.scene.requestRender();
    },
    //事件线,单选odd是切换odd而非增选
    'ARROW_EVENT': function (oddLane, eventId, eventIds) {
        this.clearHoverEvent();
        //点击事件线，会认为放弃了创建模式
        if (hoverOddLayer.hoverLanes.size > 0) {
            hoverOddLayer.clearHoverLanes();
        }
        this.addOneHoverEvent(oddLane, eventId, eventIds);
        setPanelMode(PanelOpenType.MODIFY_ONE);
    },
    //事件选中线
    'ARROW_HOVER_EVENT': function (oddLane, eventId, eventIds) {
        if (oddLayer.hoverEvent.size > 1) {
            for (let hoverEvent of oddLayer.hoverEvent.values()) {
                if (hoverEvent !== oddLane) {
                    this.clearOneHoverEvent(hoverEvent);
                }
            }
            setPanelMode(PanelOpenType.MODIFY_ONE)
        }
    }
};

/** 右键点击车道的弹窗策略集合 */
const rightClickLaneStrategy = {
    'ARROW_HOVER_LANE': function (position) {
        store.commit('setPopup', new PopupData(true, [position.x, position.y], 'INIT_EVENT'));
    },
    'ARROW_HOVER_EVENT': function (position) {
        store.commit('setPopup', new PopupData(true, [position.x, position.y], 'DELETE', {
            mode: oddLayer.hoverEvent.size === 1 ? 'ONE' : 'MULTI',
        }));
    }
};

export function leftClickHandler(oddLane, eventId, eventIds) {
    if (oddLane.getState(eventId).type in clickLaneStrategy) {
        return clickLaneStrategy[oddLane.getState(eventId).type].bind(oddLayer)(oddLane, eventId, eventIds);
    }
}

export function rightClickHandler(oddLaneStateType, position) {
    if (oddLaneStateType in rightClickLaneStrategy) {
        return rightClickLaneStrategy[oddLaneStateType](position);
    }
}
