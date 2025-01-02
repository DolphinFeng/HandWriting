import {createViewer} from "../cesium/initMap.js";
import {KeyboardEventModifier, ScreenSpaceEventHandler, ScreenSpaceEventType} from "cesium";

const viewer = createViewer();
export class LayerEvent {
    _handler = null;
    _events = new Map();
    constructor() {
        this._handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    }

    /**
     * 注册事件
     * @param type{String}
     * @param callback
     * @param modifier{String}
     */
    add(type, callback, modifier = 'DEFAULT') {
        if (!(type in ScreenSpaceEventType) || (modifier !== 'DEFAULT' && !(modifier in KeyboardEventModifier))) {
            throw new Error('事件类型异常');
        }
        if (!this._events.has(type)) {
            this._events.set(type, new Map());
        }
        this._events.get(type).set(modifier, callback);
    }
    stop(type, modifier) {
        if (!(type in ScreenSpaceEventType)) {
            throw new Error('事件类型异常');
        }
        this._handler.removeInputAction(ScreenSpaceEventType[type], KeyboardEventModifier[modifier]);
    }
    stopAll() {
        for (let type of this._events.keys()) {
            for (let modifier of this._events.get(type).keys()) {
                this.stop(type, modifier);
            }
        }
    }
    start(type, modifier) {
        if (!(type in ScreenSpaceEventType)) {
            throw new Error('事件类型异常');
        }
        this._handler.setInputAction(this._events.get(type).get(modifier ?? 'DEFAULT'), ScreenSpaceEventType[type], KeyboardEventModifier[modifier]);
    }
    startAll() {
        for (let type of this._events.keys()) {
            for (let modifier of this._events.get(type).keys()) {
                this.start(type, modifier);
            }
        }
    }
    destroy() {
        if (!this._handler.isDestroyed()) {
            this._events.clear();
            this._handler.destroyed();
            this._events = null;
            this._handler = null;
        }
    }
}
