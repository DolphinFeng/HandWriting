import { NioGeoPoint, NioPoint } from "./point.ts";
import { NioFeature, NioGeometryType, dataManager } from "./feature.ts";

export interface DataCmd {
  do(): void;
  undo(): void;
  redo(): void;
}

export class AddFeatureCmd implements DataCmd {
  constructor(option: {
    layerName: string;
    properties?: {};
    points?: NioGeoPoint[];
    geometryType?: NioGeometryType;
  }) {
    this.params = option;
  }

  do() {
    if (!this.params) {
      throw "AddFeatureCmd params undefined";
    }

    let featrue = dataManager.addNewFeature(this.params);
  }

  undo() {
    if (this.oldFeatures.length == 0) {
      throw "error: oldFeatures empty!";
    }

    for (let feature of this.oldFeatures) {
      dataManager.removeFeature(feature);
    }
  }

  redo() {
    if (this.oldFeatures.length == 0) {
      throw "error: oldFeatures empty!";
    }

    for (let feature of this.oldFeatures) {
      dataManager.addFeature(feature);
    }

    //this.do();
  }

  oldFeatures: Array<NioFeature> = [];

  params:
    | {
        layerName: string;
        properties?: {};
        points?: NioGeoPoint[];
        geometryType?: NioGeometryType;
      }
    | undefined;
}

export class ModifyFeatureCmd implements DataCmd {
  constructor(option: {
    feature: NioFeature;
    points?: NioGeoPoint[];
    properties?: {};
  }) {
    //必须要修改一项
    if (
      (!option.points || option.points.length == 0) &&
      (!option.properties || Object.keys(option.properties).length == 0)
    ) {
      throw "error: modify feature, params is empty";
    }

    if (option.points && option.points.length > 0) {
      if (!option.feature.geometry) {
        throw "error: modify feature: update points, but geometry is null";
      }

      //深拷贝
      this.newPoints = JSON.parse(JSON.stringify(option.points));
      this.oldPoints = JSON.parse(
        JSON.stringify(option.feature.geometry.points)
      );
    }

    if (option.properties) {
      //深拷贝
      this.newProperties = JSON.parse(JSON.stringify(option.properties));

      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { b: 4, c: 5, d: 6 };

      //深拷贝
      let properties2 = JSON.parse(JSON.stringify(option.properties));

      //只从feature里取option.properties里有的字段，作为原值
      this.oldProperties = {
        ...properties2,
        ...Object.keys(properties2).reduce((acc, key) => {
          if (option.feature.properties.hasOwnProperty(key)) {
            acc[key] = option.feature.properties[key];
          }
          return acc;
        }, {}),
      };
    }

    this.feature = option.feature;
  }

  //必须都是值拷贝
  newPoints: NioGeoPoint[] = [];
  newProperties: {} = {};
  oldPoints: NioGeoPoint[] = [];
  oldProperties: {} = {};

  feature: NioFeature;

  do() {
    if (this.newPoints.length > 0 && this.oldPoints.length > 0) {
      this.feature.updatePoints(this.newPoints);
    }

    if (
      Object.keys(this.newProperties).length > 0 &&
      Object.keys(this.oldProperties).length > 0
    ) {
      this.feature.updateProperties(this.newProperties);
    }
  }

  undo() {
    if (this.newPoints.length > 0 && this.oldPoints.length > 0) {
      this.feature.updatePoints(this.oldPoints);
    }

    if (
      Object.keys(this.newProperties).length > 0 &&
      Object.keys(this.oldProperties).length > 0
    ) {
      this.feature.updateProperties(this.oldProperties);
    }
  }

  redo() {
    this.do();
  }
}

export class DeleteFeatureCmd implements DataCmd {
  constructor(feature: NioFeature) {
    this.feature = feature;
  }

  do() {
    dataManager.removeFeature(this.feature);
  }

  undo() {
    dataManager.addFeature(this.feature);
  }

  redo() {
    this.do();
  }

  feature: NioFeature;
}
