import {NioFeature, NioGeometryType} from '../model/feature.ts';
import {BillboardCollection, Cartesian3, Cartesian2, Billboard, Cartographic, Ellipsoid, Math} from 'cesium';
import {createViewer} from '../cesium/create-viewer.js';
import {encodeCesiumId} from '../utils/utils.js';
import {dataManager, CommonLayerName} from '../model/feature.ts';
import {NioGeoPoint} from '../model/point.ts';

let viewer = createViewer();

export class BillboardManager {
  constructor(layerName: string) {
    this.billboardLayerName = layerName;
    this.billboardCollection = viewer.scene.primitives.add(new BillboardCollection());
  }

  /**
   * 数据同步，dataManager里的this.billboardLayerName图层的数据，同步更新到cesium容器
   */
  recreatePrimitiveFromNioLayer() {
    this.billboardCollection.removeAll();
    this.primitiviFeatureMap.clear();

    let layer = dataManager.getLayer(this.billboardLayerName);

    for (let feature of layer.features.values()) {
      if (!feature.geometry) {
        continue;
      }

      let newBillboard = this.billboardCollection.add(this.#createCesiumBillboard(feature));
      this.primitiviFeatureMap.set(feature.id, newBillboard);
    }
  }

  /**
   * 添加数据，同步添加dataManager和cesium容器
   * @param option
   */
  addBillboard(option: {properties?: {}; point: NioGeoPoint}) {
    option.point.h = BillboardManager.fixedHeight;
    let billboard = dataManager.addNewFeature({
      layerName: this.billboardLayerName,
      properties: JSON.parse(JSON.stringify(option.properties)), //properties深拷贝
      points: [option.point],
      geometryType: NioGeometryType.POINT,
    });

    let newBillboard = this.billboardCollection.add(this.#createCesiumBillboard(billboard));
    this.primitiviFeatureMap.set(billboard.id, newBillboard);

    return billboard;
  }

  /**
   * 删除数据，同步删除dataManager和cesium容器
   * @param option
   */
  removeBillboard(featureId: number) {
    dataManager.getLayer(this.billboardLayerName).removeFeatureById(featureId);

    let primitive = this.primitiviFeatureMap.get(featureId);
    if (primitive) {
      this.billboardCollection.remove(primitive);
      this.primitiviFeatureMap.delete(featureId);
    }
  }

  /**
   * 同步清空
   */
  removeAllBillboard() {
    this.billboardCollection.removeAll();
    this.primitiviFeatureMap.clear();
    dataManager.getLayer(this.billboardLayerName).removeAllFeature();
  }

  /**
   * 同步更新
   * @param featureId
   * @param position
   */
  updateBillboardPosition(featureId: number, position: Cartesian3) {
    let cartographic = new Cartographic();
    Ellipsoid.WGS84.cartesianToCartographic(position, cartographic);

    let feature = dataManager.getLayer(this.billboardLayerName).getFeature(featureId as number);
    if (!feature || !feature.geometry) {
      return;
    }

    feature.geometry.points = [
      new NioGeoPoint(
        Math.toDegrees(cartographic.longitude),
        Math.toDegrees(cartographic.latitude),
        BillboardManager.fixedHeight,
      ),
    ];
    let primitive = this.primitiviFeatureMap.get(featureId);
    if (primitive) {
      primitive.position = position;
    }
  }

  #createCesiumBillboard(feature: NioFeature) {
    let cesiumId = encodeCesiumId('billboard', feature.id);
    let position = feature.geometry?.getCartesianPoints()[0];

    return {
      id: cesiumId,
      image: '/img/quality.png',
      show: true,
      position: position ?? Cartesian3.fromDegrees(0, 0, 0),
      width: 30,
      height: 30,
      pixelOffset: new Cartesian2(0, -15),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    };
  }

  billboardLayerName: string;

  billboardCollection: BillboardCollection;

  //默认高度0.2
  static fixedHeight = 0.2;

  primitiviFeatureMap: Map<number, Billboard> = new Map();
}

export const billboardManager = new BillboardManager(CommonLayerName.CROSS_CHECK_TAG);
