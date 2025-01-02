import {
  Material,
  Primitive,
  ColorGeometryInstanceAttribute,
  PrimitiveCollection,
  PolylineMaterialAppearance,
  PolylineGeometry,
  Color,
  Cartesian2,
  Cartesian3,
  GeometryInstance,
  PointPrimitiveCollection,
  Matrix4,
  ImageBasedLighting,
  PointCloudShading,
  Resource,
  Model,
  Cesium3DTileStyle,
} from 'cesium';
import {createViewer} from '../cesium/create-viewer.js';
import {NioFeature, NioGeometryType} from './feature.ts';
import {simplifyWithRDP} from '../utils/simplify.js';
import {refreshLineWidth} from '../system/tool.ts';

export interface RenderStyle {
  color?: string;
  width?: number;
}

export class RenderPrimitiveManager {
  constructor() {
    let viewer = createViewer();
    this.#primitiveCollection_ = new PrimitiveCollection();
    viewer.scene.primitives.add(this.#primitiveCollection_);

    this.#pointCollection_ = viewer.scene.primitives.add(new PointPrimitiveCollection());

    this.#primitiveMap_ = new Map();
    this.#pointsIdSet_ = new Set();
  }

  addCommonPrimitive(feature: NioFeature, style: RenderStyle = {}) {
    let geometry = feature.geometry;
    if (!geometry) {
      return;
    }

    let width = 1.0;
    let color = '#00ff00';
    if (style.color) {
      color = style.color;
    }
    if (style.width) {
      width = style.width;
    }

    let primitive: any = null;
    let colorIn = Color.fromCssColorString(color);

    if (geometry.geometryType == NioGeometryType.LINE || geometry.geometryType == NioGeometryType.POLYGON) {
      let positions: any = [];
      for (let pt of geometry.points) {
        let pos: any = Cartesian3.fromDegrees(pt.lon, pt.lat, 0.06);
        positions.push(pos);
      }

      primitive = new Primitive({
        geometryInstances: new GeometryInstance({
          geometry: new PolylineGeometry({
            positions: positions,
            width: width,
            vertexFormat: PolylineMaterialAppearance.VERTEX_FORMAT,
          }),
          id: this,
        }),
        appearance: new PolylineMaterialAppearance({
          material: Material.fromType('Color', {
            color: colorIn,
          }),
        }),
        releaseGeometryInstances: true,
        asynchronous: true,
      });

      if (primitive) {
        //primitive.eventId = eventId;
        //return primitive;

        primitive.featureId = feature.id;

        this.#primitiveCollection_.add(primitive);
        if (this.#primitiveMap_.has(feature.id)) {
          //重复添加，抛出异常
          throw 'addArrowLinePrimitive fail: id duplicated!';
        }
        this.#primitiveMap_.set(feature.id, primitive);
      }
    } else if (geometry.geometryType == NioGeometryType.POINT) {
      let pt = geometry.points[0];
      let primitive = this.#pointCollection_.add({
        position: Cartesian3.fromDegrees(pt.lon, pt.lat, 0.06),
        color: Color.RED,
        pixelSize: 8.0,
      });

      //@ts-ignore
      primitive.featureId = feature.id;

      this.#pointsIdSet_.add(feature.id);
      this.#primitiveMap_.set(feature.id, primitive);
    }
  }

  addComponentPrimitive(
    featureId: number,
    featureCollection: {
      type: string;
      features: {
        geometry: {};
        type: string;
        properties: {};
      }[];
    },
    color: string,
  ) {
    let resource = new Resource({
      url: '',
    });

    const mainOptions = {
      cull: false, // The model is already culled by 3D Tiles
      releaseGltfJson: true, // Models are unique and will not benefit from caching so save memory
      opaquePass: 4 /*Pass.CESIUM_3D_TILE*/, // Draw opaque portions of the model during the 3D Tiles pass
      modelMatrix: Matrix4.IDENTITY,
      upAxis: 1,
      forwardAxis: 0,
      incrementallyLoadTextures: false,
      customShader: undefined,
      content: /*content*/ undefined,
      colorBlendMode: 0,
      colorBlendAmount: 0.5,
      lightColor: undefined,
      imageBasedLighting: new ImageBasedLighting(),
      featureIdLabel: 'featureId_0',
      instanceFeatureIdLabel: 'instanceFeatureId_0',
      pointCloudShading: new PointCloudShading(),
      clippingPlanes: undefined,
      backFaceCulling: true,
      shadows: 0,
      showCreditsOnScreen: false,
      splitDirection: 0,
      enableDebugWireframe: false,
      debugWireframe: false,
      projectTo2D: false,
      enableShowOutline: true,
      showOutline: true,
      outlineColor: new Color(0, 0, 0, 1),
      geoJson: featureCollection,
      resource: resource,
    };

    //@ts-ignore
    const model = Model.fromGeoJson2(mainOptions);

    let tileStyle = new Cesium3DTileStyle({
      //color: 'color(' + color + ')',
      color: {
        //如果geojson里存在color字段，则按照color字段的值显示颜色，没有color字段，则显示函数另外传入的color值
        //geojson里color的写法为:  "color": "rgb(0, 255, 0)" 或者 "color": "#ff0000"
        conditions: [
          ["${feature['color']} !== undefined", "color(${feature['color']})"],
          ['true', "color('" + color + "')"],
        ],
      },
      geometryWidth: 100,
    });

    model.style = tileStyle;
    //@ts-ignore
    model.style.geometryWidth = 1.0;
    //@ts-ignore
    model.applyGeometryWidth(model.style);

    this.#primitiveCollection_.add(model);
    //let viewer = createViewer();
    //viewer.scene.primitives.add(model);

    if (this.#primitiveMap_.has(featureId)) {
      //重复添加，抛出异常
      throw 'addArrowLinePrimitive fail: id duplicated!';
    }
    this.#primitiveMap_.set(featureId, model);

    refreshLineWidth();
  }

  updateGeometryWidth(geometryWidth: number) {
    const length = this.#primitiveCollection_.length;
    for (let i = 0; i < length; ++i) {
      const p = this.#primitiveCollection_.get(i);
      if (p instanceof Model) {
        //@ts-ignore
        p.style.geometryWidth = geometryWidth;
        //@ts-ignore
        p.applyGeometryWidth(p.style);
      }
    }
  }

  clearAnimatedLinePrimitive() {
    this.#primitiveCollection_.remove(this.#animatedLine_);
    this.#animatedLine_ = undefined;
  }

  setAnimatedLinePrimitive(feature: NioFeature) {
    let geometry = feature.geometry;
    if (!geometry) {
      return;
    }

    let width = 5.0;
    let color = '#00ff00';

    let positions: any = [];
    for (let pt of geometry.points) {
      let pos: any = Cartesian3.fromDegrees(pt.lon, pt.lat, 0.08);
      positions.push(pos);
    }

    //抽稀
    positions = simplifyWithRDP(positions, 0.5);

    this.#animatedLine_ && this.#primitiveCollection_.remove(this.#animatedLine_);

    this.#animatedLine_ = new Primitive({
      geometryInstances: new GeometryInstance({
        geometry: new PolylineGeometry({
          positions: positions,
          width: width,
          vertexFormat: PolylineMaterialAppearance.VERTEX_FORMAT,
        }),
        id: this,
      }),
      appearance: new PolylineMaterialAppearance({
        material: Material.fromType(Material.FadeType, {
          repeat: false,
          fadeInColor: Color.fromCssColorString('#00ff00').withAlpha(1.0),
          fadeOutColor: Color.fromCssColorString('#8f4b2e').withAlpha(0.1),
          time: new Cartesian2(100.0, 1.0),
          maximumDistance: 0.75 / 2.5,
          fadeDirection: {
            x: true,
            y: false,
          },
        }),
      }),

      releaseGeometryInstances: true,
      asynchronous: true,
    });

    this.#primitiveCollection_.add(this.#animatedLine_);
    //let primitive = this.#animatedLine_;

    let step = 0.01;
    //0.01-0.5
    let timex = 0;

    let render = () => {
      timex += step;
      if (timex >= 1) {
        timex = 0; // 控制在0.0到1.0之间
      }

      if (this.#animatedLine_) {
        this.#animatedLine_.appearance.material.uniforms.time.x = timex;
        requestAnimationFrame(render);
      }
    };

    requestAnimationFrame(render);
  }

  addArrowLinePrimitive(feature: NioFeature) {
    let pp = feature.geometry?.points;
    if (!pp) {
      throw 'feature positions empty';
    }

    let positions: any = [];
    for (let pt of pp) {
      let pos: any = Cartesian3.fromDegrees(pt.lon, pt.lat, 0.05);
      positions.push(pos);
    }

    //进行抽稀。点太近会导致箭头显示不全
    positions = simplifyWithRDP(positions, 0.5);

    let width = 10;
    let color: any = null;
    color = Color.fromCssColorString('#75fbed');

    let lines = new PrimitiveCollection();

    let appearance = new PolylineMaterialAppearance({
      material: Material.fromType('PolylineArrow', {
        color: color,
      }),
    });

    //为了每段都有箭头，两个点画一次
    for (let i = 1; i < positions.length; i++) {
      let pos: any = [];
      pos.push(positions[i - 1]);
      pos.push(positions[i]);

      let geometryInstances = new GeometryInstance({
        geometry: new PolylineGeometry({
          positions: pos,
          width: width,
          vertexFormat: PolylineMaterialAppearance.VERTEX_FORMAT,
        }),
        attributes: {
          color: ColorGeometryInstanceAttribute.fromColor(Color.WHITE),
        },
      });

      let primitive = new Primitive({
        geometryInstances: geometryInstances,
        appearance: appearance,
        asynchronous: true, //交给webWorker创建
        allowPicking: false,
      });

      lines.add(primitive);
    }

    this.#primitiveCollection_.add(lines);
    if (this.#primitiveMap_.has(feature.id)) {
      //重复添加，抛出异常
      throw 'addArrowLinePrimitive fail: id duplicated!';
    }
    this.#primitiveMap_.set(feature.id, lines);
  }

  setVisible(featureId: any, show: boolean = true) {
    let primitive = this.#primitiveMap_.get(featureId);
    if (!primitive) {
      return;
    }

    primitive.show = show;
  }

  removePrimitive(featureId: any) {
    if (featureId <= 0) {
      //非法id
      return;
    }

    if (!this.#primitiveMap_.has(featureId)) {
      //throw 'removePrimitive failed';
      return;
    }

    let primitive = this.#primitiveMap_.get(featureId);

    if (this.#pointsIdSet_.has(featureId)) {
      this.#pointCollection_.remove(primitive);
    } else {
      this.#primitiveCollection_.remove(primitive);
    }

    this.#pointsIdSet_.delete(featureId);
    this.#primitiveMap_.delete(featureId);
  }

  removeAll() {
    this.#primitiveCollection_.removeAll();
    this.#primitiveMap_.clear();
    this.#pointsIdSet_.clear();
    this.#pointCollection_.removeAll();
    this.#animatedLine_ = undefined;
  }

  #primitiveCollection_: PrimitiveCollection;
  #primitiveMap_: Map<any, any>;
  #pointCollection_: PointPrimitiveCollection;
  #pointsIdSet_: Set<any>; //记录是不是点

  #animatedLine_: Primitive | undefined; //动态线。只有一个
}

export const renderPrimitiveManager = new RenderPrimitiveManager();
//export let renderPrimitiveManager = null;
