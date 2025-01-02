import {Cartographic, HeadingPitchRange, Math as CMath, Matrix4} from 'cesium';

export class AroundPoint {
    constructor(viewer, position, height) {
        this._viewer = viewer;
        this._position = position;
        this._height = height;
    }

    _bindEvent() {
        this._viewer.clock.onTick.addEventListener(this._aroundPoint, this);
    }

    _unbindEvent() {
        this._viewer.camera.lookAtTransform(Matrix4.IDENTITY);
        this._viewer.clock.onTick.removeEventListener(this._aroundPoint, this);
    }

    start(amount) {
        this._amount = amount;
        this._viewer.clock.shouldAnimate = true;
        this._unbindEvent();
        this._bindEvent();
        return this;
    }

    stop() {
        this._unbindEvent();
        return this;
    }

    // 绕点旋转函数
    _aroundPoint() {
        let heading = this._viewer.camera.heading;
        let pitch = this._viewer.camera.pitch;

        if (CMath.toDegrees(pitch) >= -45) {
            this.stop();
            return;
        }
        pitch += CMath.toRadians(this._amount);
        if (pitch >= Math.PI / 2 || pitch <= -Math.PI / 2) {
            pitch = 0;
        }

        this._viewer.camera.lookAt(
            this._position,
            new HeadingPitchRange(
                heading,
                pitch,
                this._height,
            )
        );
    }
}
