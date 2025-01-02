import {createViewer} from '../cesium/create-viewer.js';
import {
  CallbackProperty,
  Cartesian2,
  Cartesian3,
  Cartographic,
  Color,
  ConstantPositionProperty,
  ConstantProperty,
  Math as CMath,
} from 'cesium';
import {debounce, saveUserPos} from './compute.js';
import {Observer} from '../system/observer.js';

let nioCamera = null;

class LocateHandler {
  constructor(nioCamera) {
    this.viewer = createViewer();
    this.entity = this.viewer.entities.add({
      position: new Cartesian3(),
      point: {
        pixelSize: 8,
        outlineWidth: 1.5,
        outlineColor: Color.WHITE,
        color: Color.RED,
        show: false,
      },
    });
    this.center = this.viewer.entities.add({
      position: new Cartesian3(),
      point: {
        pixelSize: 2,
        outlineWidth: 1,
        outlineColor: Color.WHITE,
        color: Color.fromCssColorString('#484848'),
        show: false,
      },
    });
    this.nioCamera = nioCamera;
  }
  //设置定位点提示特效
  setPosition(cartesian3) {
    //设置点坐标
    const pngPos = Cartographic.fromCartesian(cartesian3);
    pngPos.height = 0.02;
    this.entity.position = new ConstantPositionProperty(Cartographic.toCartesian(pngPos));
    pngPos.height = 0.03;
    this.center.position = new ConstantPositionProperty(Cartographic.toCartesian(pngPos));
    this.entity.point.show = new ConstantProperty(true);
    this.center.point.show = new ConstantProperty(true);
    //闪烁动画
    let speed = 0.06,
      result = new Color(1, 0, 0);
    this.entity.point.color = new CallbackProperty(() => {
      let newColor = result.blue + speed;
      newColor = Math.min(Math.max(newColor, 0), 1);
      if (newColor === 1 || newColor === 0) {
        speed *= -1;
      }
      result.blue = newColor;
      result.green = newColor;
      return result;
    }, false);
  }
  //停止定位特效,需要开启防抖
  stopPosition = debounce(() => {
    this.stopPositionImmediately();
  }, 10 * 1000);
  //停止定位特效
  stopPositionImmediately() {
    this.entity.point.color = new ConstantProperty(new Color(1, 0, 0));
    this.entity.point.show = new ConstantProperty(false);
    this.center.point.show = new ConstantProperty(false);
  }
  //定位结束回调
  locateCompleted(callback) {
    callback?.();
    this.nioCamera.unLockCamera();
    this.stopPosition();
    saveUserPos();
    Observer.fire('tileScale', {
      distance: Cartesian3.distance(
        this.viewer.camera.pickEllipsoid(
          new Cartesian2(document.body.clientWidth / 2, document.body.clientHeight / 2),
          this.viewer.scene.globe.ellipsoid,
        ),
        this.viewer.camera.position,
      ),
    });
  }
  //开始定位
  locatePosition(locateOption) {
    locateOption.before?.();
    if (locateOption.animate === true) {
      this.setPosition(locateOption.position);
    }
    this.nioCamera.lockCamera();
    // this.viewer.camera.flyTo({
    //   destination: locateOption.position,
    //   orientation: {
    //     heading: CMath.toRadians(0),
    //     pitch: CMath.toRadians(-90),
    //     roll: 0,
    //   },
    //   duration: locateOption.duration ?? 2,
    //   // pitchAdjustHeight: 50,
    //   complete: () => {
    //     this.locateCompleted(locateOption.completed);
    //   },
    // });

    this.viewer.camera.setView({
      destination: locateOption.position,
    });
    this.locateCompleted(locateOption.completed);
  }
}

/**
 * 相机操控对象
 */
export class NioCamera {
  #lock;
  #locateHandler = new LocateHandler(this);

  get lock() {
    return this.#lock;
  }

  set lock(value) {
    this.#lock = value;
    this.#setLock(!value);
  }

  #setLock(value) {
    this.viewer.scene.screenSpaceCameraController.enableZoom = value;
    this.viewer.scene.screenSpaceCameraController.enableRotate = value;
    this.viewer.scene.screenSpaceCameraController.enableTranslate = value;
    this.viewer.scene.screenSpaceCameraController.enableLook = value;
  }

  constructor() {
    if (nioCamera) {
      return nioCamera;
    }
    nioCamera = this;
    this.viewer = createViewer();
  }

  lockCamera() {
    this.lock = true;
  }

  unLockCamera() {
    this.lock = false;
  }

  /**
   * 定位
   * @param locateOption {{position: Cartesian3, duration: number|undefined, before: function|undefined, completed: function|undefined, animate: boolean}}
   */
  locatePosition(locateOption) {
    this.#locateHandler.locatePosition(locateOption);
  }

  //停止定位
  stopLocatePosition() {
    this.#locateHandler.stopPositionImmediately();
  }
}
