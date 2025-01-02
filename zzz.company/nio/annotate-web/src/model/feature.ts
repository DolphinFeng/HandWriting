import {Cartesian3} from 'cesium';
import {NioGeoPoint} from './point.ts';

export enum NioGeometryType {
  NONE = 'NONE',
  POINT = 'POINT',
  LINE = 'LINE',
  POLYGON = 'POLYGON',
  POINTS = 'POINTS',
}

//记录一些内部使用的图层名字
export enum CommonLayerName {
  CROSS_CHECK_TAG = 'CROSS_CHECK_TAG', //路口质检标图层
}

//从1开始。0有些判断会误判
let featureId = 1;
export function generateFeatureId() {
  return featureId++;
}

export class NioGeometry {
  constructor(points: NioGeoPoint[], geometryType: NioGeometryType) {
    this.points = points;
    this.geometryType = geometryType;
  }

  geometryType: NioGeometryType = NioGeometryType.NONE;

  points: NioGeoPoint[] = [];

  getCartesianPoints() {
    let points: Cartesian3[] = [];
    for (let point of this.points) {
      points.push(Cartesian3.fromDegrees(point.lon, point.lat, point.h));
    }

    return points;
  }
}

export class NioFeature {
  constructor(option: {layerName: string; properties?: {}; geometry?: NioGeometry /*id?: number*/}) {
    if (option.properties) {
      this.properties = option.properties;
    }

    if (option.geometry) {
      this.geometry = option.geometry;
    }

    // if (option.id) {
    //   this.id = option.id;
    // }

    this.layerName = option.layerName;
  }

  static fromPoints(points: NioGeoPoint[], type: NioGeometryType = NioGeometryType.LINE) {
    let geometry = new NioGeometry(points, type);
    let feature = new NioFeature({
      layerName: 'default_layer',
      geometry: geometry,
    });

    return feature;
  }

  /**
   * 从geojson feature 创建
   * @param jsonFeature
   */
  static fromGeojson(
    layerName: string,
    geojsonFeature: {
      type: string;
      geometry: {
        type: string;
        coordinates: [];
      };
      properties: {};
    },
  ) {
    if (!geojsonFeature.geometry) {
      throw 'geometry null';
    }

    let points: NioGeoPoint[] = [];
    let geometryType: NioGeometryType = NioGeometryType.NONE;

    if (geojsonFeature.geometry.type == 'LineString') {
      geometryType = NioGeometryType.LINE;

      for (let jsonPoint of geojsonFeature.geometry.coordinates) {
        let point = new NioGeoPoint(jsonPoint[0], jsonPoint[1]);
        points.push(point);
      }
    } else if (geojsonFeature.geometry.type == 'Polygon') {
      geometryType = NioGeometryType.LINE;

      //@ts-ignore
      for (let jsonPoint of geojsonFeature.geometry.coordinates[0]) {
        if (jsonPoint) {
          let point = new NioGeoPoint(jsonPoint[0], jsonPoint[1]);
          points.push(point);
        }
      }
    } else if (geojsonFeature.geometry.type == 'Point') {
      geometryType = NioGeometryType.POINT;

      //@ts-ignore  兼容一下。后端返回的点格式不一致
      if (geojsonFeature.geometry.coordinates[0][0]) {
        //@ts-ignore
        let lon = geojsonFeature.geometry.coordinates[0][0];
        //@ts-ignore
        let lat = geojsonFeature.geometry.coordinates[1][0];
        //@ts-ignore
        let point = new NioGeoPoint(lon, lat);
        points.push(point);
      } else {
        //@ts-ignore
        let point = new NioGeoPoint(geojsonFeature.geometry.coordinates[0], geojsonFeature.geometry.coordinates[1]);
        points.push(point);
      }
    } else {
      throw 'fromJsonFeature type error';
    }

    let geometry = new NioGeometry(points, geometryType);
    let feature = new NioFeature({
      layerName: layerName,
      properties: geojsonFeature.properties,
      geometry: geometry,
    });

    return feature;
  }

  updatePoints(points: NioGeoPoint[]) {
    if (points.length == 0) {
      throw 'error: updatePoints, points is empty';
    }

    //有geometry的feature才允许更新点位置
    if (!this.geometry) {
      throw 'error: updatePoints, geometry is null';
    }

    //深拷贝
    this.geometry.points = JSON.parse(JSON.stringify(points));
  }

  /**
   * 更新字段
   * 暂时只考虑字段的更新，兼容字段添加，不考虑字段删除
   * @param properties
   */
  updateProperties(properties: {}) {
    //深拷贝
    let propertiesCopy = JSON.parse(JSON.stringify(properties));
    Object.assign(this.properties, propertiesCopy);
  }

  id: number = generateFeatureId();

  layerName: string = '';

  properties: {} = {};

  geometry: null | NioGeometry = null;
}

export class NioLayer {
  constructor(name: string) {
    this.name = name;
  }

  name: string;

  /**
   * id->feature
   * id是唯一标识
   */
  features: Map<number, NioFeature> = new Map();

  assertFeature(feature: NioFeature, exist: boolean) {
    if (!feature.id) {
      throw 'addFeature: feature.id undefined';
    }

    let curExist = this.features.has(feature.id);

    if (exist && !curExist) {
      throw `error: feature not exist, id: ${feature.id}`;
    } else if (!exist && curExist) {
      throw `error: feature already exist, id: ${feature.id}`;
    }
  }

  addNewFeature(option: {properties?: {}; points?: NioGeoPoint[]; geometryType?: NioGeometryType}) {
    let geometry: NioGeometry | undefined;
    if (option.points && option.geometryType) {
      geometry = new NioGeometry(option.points, option.geometryType);
    }

    let feature = new NioFeature({
      layerName: this.name,
      properties: option.properties,
      geometry: geometry,
    });

    this.features.set(feature.id, feature);

    return feature;
  }

  addFeature(feature: NioFeature) {
    this.assertFeature(feature, false);
    this.features.set(feature.id, feature);
  }

  getFeature(featureId: number) {
    return this.features.get(featureId);
  }

  getFeatures() {
    return this.features;
  }

  removeFeature(feature: NioFeature) {
    this.assertFeature(feature, true);
    this.features.delete(feature.id);
  }

  removeFeatureById(featureId: number) {
    this.features.delete(featureId);
  }

  removeAllFeature() {
    this.features.clear();
  }
}

export class Dataset {
  constructor(name: string) {
    this.name = name;
  }

  name: string;

  /**
   * 图层名称->图层
   * 图层名称是唯一标识
   */
  layers: Map<string, NioLayer> = new Map();

  getLayer(layerName: string) {
    let layer: NioLayer | undefined;
    if (this.layers.has(layerName)) {
      layer = this.layers.get(layerName);
    } else {
      layer = new NioLayer(layerName);
      this.layers.set(layerName, layer);
    }

    return layer;
  }
}

export class DataManager {
  constructor() {}

  dataset: Dataset = new Dataset('default');

  /**
   * 根据图层名获取图层。如果不存在则会创建
   * @param layerName
   * @returns
   */
  getLayer(layerName: string) {
    let layer: NioLayer | undefined = this.dataset.getLayer(layerName);

    if (!layer) {
      throw `layer not find, name: ${layerName}`;
    }

    return layer;
  }

  hasLayer(layerName: string) {
    let layer: NioLayer | undefined = this.dataset.getLayer(layerName);
    if (!layer) {
      return false;
    }

    return true;
  }

  addNewFeature(option: {layerName: string; properties?: {}; points?: NioGeoPoint[]; geometryType?: NioGeometryType}) {
    let layer = this.getLayer(option.layerName);
    let feature = layer.addNewFeature(option);
    return feature;
  }

  addFeature(feature: NioFeature) {
    let layer = this.getLayer(feature.layerName);
    layer.addFeature(feature);
  }

  updateFeature(layerName: string, featureId: number, property: {}) {
    let feature = dataManager.getFeature(layerName, featureId);
    if (feature) {
      feature.properties = JSON.parse(JSON.stringify(property));
    }
  }

  removeFeature(feature: NioFeature) {
    let layer = this.getLayer(feature.layerName);
    layer.removeFeature(feature);
  }

  removeFeatureById(layerName: string, featureId: any) {
    let layer = this.getLayer(layerName);
    let feature = this.getFeature(layerName, featureId);
    if (feature) {
      this.removeFeature(feature);
    }
  }

  getFeature(layerName: string, featureId: number) {
    let layer = this.getLayer(layerName);
    return layer.getFeature(featureId);
  }

  getFeatureById(featureId: number) {
    for (let [key, value] of this.dataset.layers) {
      let feature = value.getFeature(featureId);
      if (feature) {
        return feature;
      }
    }

    return null;
  }

  getFeatures(layerName: string) {
    let layer = this.getLayer(layerName);
    return layer.getFeatures().values();
  }

  removeAllFeature(layerName: string) {
    let layer = this.getLayer(layerName);
    layer.features.clear();
  }

  getLayerFeatureCount(layerName: string) {
    if (!this.hasLayer(layerName)) {
      return 0;
    }

    let layer = this.getLayer(layerName);
    return layer.features.size;
  }
}

export let dataManager = new DataManager();
