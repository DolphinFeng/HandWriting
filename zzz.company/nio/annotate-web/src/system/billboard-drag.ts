import { BillboardCollection, Cartesian3, Cartesian2, Billboard } from "cesium";
import { createViewer } from "../cesium/create-viewer.js";
import { mouseMoveCallbacks } from "../system/event.js";

let viewer = createViewer();

export class BillboardDrag {
  constructor() {}

  start(screenPosition: Cartesian2) {
    //说明已经开始了，直接返回
    if (this.dragger) {
      return;
    }

    this.billboardCollection = viewer.scene.primitives.add(
      new BillboardCollection()
    );
    if (!this.billboardCollection) {
      return;
    }

    let startPosition = new Cartesian3();
    viewer.camera.pickEllipsoid(
      screenPosition,
      viewer.scene.globe.ellipsoid,
      startPosition
    );
    this.dragger = this.billboardCollection.add(this.createDrag(startPosition));

    mouseMoveCallbacks.set(this.callbackName, (ev) => {
      let newPosition = new Cartesian3();
      viewer.camera.pickEllipsoid(
        ev.endPosition,
        viewer.scene.globe.ellipsoid,
        newPosition
      );
      if (this.dragger) {
        this.dragger.position = newPosition;
      }
    });
  }

  stop() {
    this.dragger = undefined;
    viewer.scene.primitives.remove(this.billboardCollection);
    this.billboardCollection = undefined;

    mouseMoveCallbacks.delete(this.callbackName);
  }

  createDrag(position: Cartesian3) {
    return {
      image: "/img/quality.png",
      show: true,
      position: position,
      width: 30,
      height: 30,
      pixelOffset: new Cartesian2(0, -15),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    };
  }

  billboardCollection: BillboardCollection | undefined;

  dragger: Billboard | undefined;

  callbackName = "mouse-move-billboard-drag";
}
