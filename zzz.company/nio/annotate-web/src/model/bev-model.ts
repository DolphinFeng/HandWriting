import {
  Cartesian3,
  PolygonHierarchy,
  EllipsoidSurfaceAppearance,
  Primitive,
  GeometryInstance,
  PolygonGeometry,
  Color,
  Material,
  MaterialAppearance,
  Cartesian2,
  PrimitiveCollection,
  PointPrimitiveCollection,
  PointPrimitive,
  NearFarScalar,
  Entity,
} from 'cesium';
import {createViewer} from '../cesium/create-viewer.js';
import {NioMessage} from '../utils/utils.js';

export class BevModel {
  constructor() {
    this.pointCloudPicContainer_ = new PrimitiveCollection();
    let viewer = createViewer();
    viewer.scene.primitives.add(this.pointCloudPicContainer_);
  }

  clear() {
    this.refresh(null, false);
  }

  refresh(
    param: {
      width: number;
      height: number;
      rangePoints: {lon: number; lat: number}[];
      img: string;
    } | null,
    show,
  ) {
    if (this.pointCloudPicContainer_) {
      this.pointCloudPicContainer_.removeAll();
    }

    if (this.loadingPicContainer_) {
      this.loadingPicContainer_.removeAll();
    }

    if (this.loadingTextEntity_) {
      this.loadingTextEntity_.show = false;
    }

    if (show == false) {
      this.finalImgUrl_ = '';
      return;
    }

    if (param == null) {
      return;
    }

    this.#getOrCreateLoadingPic(param.rangePoints);

    this.finalImgUrl_ = param.img;
    this.picImage_ = new Image();
    this.picImage_.src = param.img;

    this.picImage_.onerror = () => {
      NioMessage('error', '图片加载失败');

      if (this.loadingPicContainer_) {
        this.loadingPicContainer_.removeAll();
      }

      if (this.loadingTextEntity_) {
        this.loadingTextEntity_.show = false;
      }

      if (this.pointCloudPicContainer_) {
        this.pointCloudPicContainer_.removeAll();
      }

      for (let mat of this.lastMats_) {
        //必须加这一句，否则自定义的material会导致内存泄漏（默认参数的material不会有这个问题）
        mat && mat.destroy();
      }

      this.lastMats_.splice(0, this.lastMats_.length);
    };

    this.picImage_.onload = () => {
      if (this.loadingPicContainer_) {
        this.loadingPicContainer_.removeAll();
      }

      //picImage.onload为异步加载，在频繁的切换过程中，数据的下载速度不同导致加载队列乱序
      //所以此处需要判断加载完的数据是否为最后需要的数据，保证加载一致性
      if (this.finalImgUrl_ != param.img) {
        return;
      }

      if (this.loadingTextEntity_) {
        this.loadingTextEntity_.show = false;
      }

      let viewer = createViewer();
      if (this.pointCloudPicContainer_) {
        this.pointCloudPicContainer_.removeAll();
      }

      let imgUrl = param.img;

      //webGL贴图最大支持 16384，超过要进行分块处理
      const maxSize = 16384;
      let cols = Math.floor(param.width / maxSize);
      let rows = Math.floor(param.height / maxSize);

      let colBlockSize = param.width % maxSize;
      let rowBlockSize = param.height % maxSize;

      let haveColBlock = colBlockSize != 0;
      let haveRowBlock = rowBlockSize != 0;

      if (haveColBlock) {
        cols += 1;
      }
      if (haveRowBlock) {
        rows += 1;
      }

      for (let mat of this.lastMats_) {
        //必须加这一句，否则自定义的material会导致内存泄漏（默认参数的material不会有这个问题）
        mat && mat.destroy();
      }

      this.lastMats_.splice(0, this.lastMats_.length);
      //g_mat = g_mat && g_mat.destroy();

      //只有一个，不用进行图片拷贝
      if (cols == 1 && rows == 1) {
        let primitive = this.#createImagePrimitive(imgUrl, param, param.rangePoints);
        if (this.pointCloudPicContainer_) {
          this.pointCloudPicContainer_.add(primitive);
        }
      } else {
        for (let j = 0; j < rows; j++) {
          for (let i = 0; i < cols; i++) {
            let left = i * maxSize;
            let top = j * maxSize;
            let width = maxSize;
            let height = maxSize;

            if (i == cols - 1 && haveColBlock) {
              width = colBlockSize;
            }

            if (j == rows - 1 && haveRowBlock) {
              height = rowBlockSize;
            }

            let blockCanvas = document.createElement('canvas');
            blockCanvas.width = width;
            blockCanvas.height = height;

            const context = blockCanvas.getContext('2d');
            if (context == null) {
              return;
            }

            let lb: {lon: number; lat: number} = param.rangePoints[1];
            let rb: {lon: number; lat: number} = param.rangePoints[2];
            let rt: {lon: number; lat: number} = param.rangePoints[3];
            let lt: {lon: number; lat: number} = param.rangePoints[0];

            let pt1 = this.#pixel2Geo(left, top, lb, rb, rt, lt, param.width, param.height);
            let pt2 = this.#pixel2Geo(left, top + height, lb, rb, rt, lt, param.width, param.height);
            let pt3 = this.#pixel2Geo(left + width, top + height, lb, rb, rt, lt, param.width, param.height);
            let pt4 = this.#pixel2Geo(left + width, top, lb, rb, rt, lt, param.width, param.height);

            let subRangePoints: {lon: number; lat: number}[] = [];
            subRangePoints.push(pt1);
            subRangePoints.push(pt2);
            subRangePoints.push(pt3);
            subRangePoints.push(pt4);

            context.drawImage(this.picImage_, left, top, width, height, 0, 0, width, height);
            let primitive = this.#createImagePrimitive(blockCanvas.toDataURL(), param, subRangePoints);
            if (this.pointCloudPicContainer_) {
              this.pointCloudPicContainer_.add(primitive);
            }
          }
        }
      }
    };
  }

  /**
   * x,y 像素坐标，以左上为原点； lb,rb,rt,lt 经纬度坐标，以左下为原点； 计算插值后的经纬度坐标
   * @param x
   * @param y
   * @param lb
   * @param rb
   * @param rt
   * @param lt
   * @param width
   * @param height
   */
  #pixel2Geo(
    x: number,
    y: number,
    lb: {lon: number; lat: number},
    rb: {lon: number; lat: number},
    rt: {lon: number; lat: number},
    lt: {lon: number; lat: number},
    width: number,
    height: number,
  ) {
    //todo？ 像素精度是否需要加0.5
    let ratioX = x / width;
    let ratioY = y / height;

    //在四个边上取四个点，连成线段，然后求交
    let ptUp = this.#coordsInterpolate(lt, rt, ratioX);
    let ptDown = this.#coordsInterpolate(lb, rb, ratioX);

    let ptLeft = this.#coordsInterpolate(lb, lt, 1.0 - ratioY);
    let ptRight = this.#coordsInterpolate(rb, rt, 1.0 - ratioY);

    //求线段交点
    let cross = this.#intersect(ptUp, ptDown, ptLeft, ptRight);
    return cross;
  }

  //因为当前场景一定相交，不判断特殊情况，直接求值
  #intersect(
    startPos1: {lon: number; lat: number},
    endPos1: {lon: number; lat: number},
    startPos2: {lon: number; lat: number},
    endPos2: {lon: number; lat: number},
  ) {
    let x1 = startPos1.lon;
    let y1 = startPos1.lat;
    let x2 = endPos1.lon;
    let y2 = endPos1.lat;
    let x3 = startPos2.lon;
    let y3 = startPos2.lat;
    let x4 = endPos2.lon;
    let y4 = endPos2.lat;
    let b1 = (y2 - y1) * x1 + (x1 - x2) * y1;
    let b2 = (y4 - y3) * x3 + (x3 - x4) * y3;

    let d = (x2 - x1) * (y4 - y3) - (x4 - x3) * (y2 - y1);
    let d1 = b2 * (x2 - x1) - b1 * (x4 - x3);
    let d2 = b2 * (y2 - y1) - b1 * (y4 - y3);

    return {lon: d1 / d, lat: d2 / d};
  }

  #coordsInterpolate(startPos: {lon: number; lat: number}, endPos: {lon: number; lat: number}, ratio: number) {
    let xOffset = (endPos.lon - startPos.lon) * ratio;
    let yOffset = (endPos.lat - startPos.lat) * ratio;

    return {lon: startPos.lon + xOffset, lat: startPos.lat + yOffset};
  }

  #createPointPrimitive(position) {
    let pointCollection = new PointPrimitiveCollection();

    const _nearFarScalar = new NearFarScalar(1.5e2, 1, 1.5e3, 0.3);
    let pointPrimitive = new PointPrimitive();
    pointPrimitive.pixelSize = 4;
    pointPrimitive.color = Color.fromCssColorString('#fcbd20');
    pointPrimitive.position = position;
    pointPrimitive.outlineColor = Color.fromCssColorString('#cb8d00');
    pointPrimitive.outlineWidth = 2;
    pointPrimitive.disableDepthTestDistance = Number.POSITIVE_INFINITY;
    pointPrimitive.scaleByDistance = _nearFarScalar;

    pointCollection.add(pointPrimitive);

    return pointCollection;
  }

  #createImagePrimitive(
    imgUrl: string,
    param: {
      width: number;
      height: number;
      rangePoints: {lon: number; lat: number}[];
      img: string;
    } | null,
    realRangePoints: {lon: number; lat: number}[],
  ) {
    //picPositions.push({ lon: param.refLon, lat: param.refLat });
    let enu: any = [];
    if (param == null) {
      return null;
    }

    let geodetic0 = realRangePoints[0];
    let geodetic1 = realRangePoints[1];
    let geodetic2 = realRangePoints[2];
    let geodetic3 = realRangePoints[3];

    let coordinates: Cartesian3[] = [];
    coordinates.push(Cartesian3.fromDegrees(geodetic0.lon, geodetic0.lat, 0));
    coordinates.push(Cartesian3.fromDegrees(geodetic1.lon, geodetic1.lat, 0));
    coordinates.push(Cartesian3.fromDegrees(geodetic2.lon, geodetic2.lat, 0));
    coordinates.push(Cartesian3.fromDegrees(geodetic3.lon, geodetic3.lat, 0));

    let height = 0;
    let polygonHierarchy = new PolygonHierarchy(coordinates);

    let textureCoords: any = [];
    textureCoords.push(new Cartesian2(0.0, 1.0));
    textureCoords.push(new Cartesian2(0.0, 0.0));
    textureCoords.push(new Cartesian2(1.0, 0.0));
    textureCoords.push(new Cartesian2(1.0, 1.0));

    let textureHierarchy = new PolygonHierarchy(textureCoords);

    let polygonGeometry = new PolygonGeometry({
      polygonHierarchy: polygonHierarchy,
      height: height,
      textureCoordinates: textureHierarchy,
    });

    let material = new Material({
      fabric: {
        uniforms: {
          image: imgUrl,
        },
        source: `czm_material czm_getMaterial(czm_materialInput materialInput)
          {
          czm_material material = czm_getDefaultMaterial(materialInput);
          material.diffuse = texture2D(image_0, fract(materialInput.st)).rgb;
          material.alpha = 1.0; 
          if(material.diffuse.r < 0.000001 && material.diffuse.g < 0.000001 && material.diffuse.b < 0.000001
            || material.diffuse.r < 0.000001 && material.diffuse.g < 0.000001 && material.diffuse.b > 0.50196 && material.diffuse.b < 0.501961 ){
            material.alpha = 0.0; 
          }
          return material;
          }`,
      },
    });

    //g_mat = material;
    this.lastMats_.push(material);

    let appearance = new MaterialAppearance({
      flat: true,
      material: material,
    });

    let primitive = new Primitive({
      geometryInstances: new GeometryInstance({
        geometry: polygonGeometry,
      }),
      appearance: appearance,
    });

    return primitive;
  }

  #getPicLabel(lon: number, lat: number) {
    if (this.loadingTextEntity_) {
      this.loadingTextEntity_.show = true;
      //@ts-ignore
      this.loadingTextEntity_.position = Cartesian3.fromDegrees(lon, lat, 5);
    } else {
      let viewer = createViewer();
      this.loadingTextEntity_ = viewer.entities.add({
        position: Cartesian3.fromDegrees(lon, lat, 5),
        // 点
        point: {
          color: Color.RED, // 点位颜色
          pixelSize: 10, // 像素点大小
        },
        // 文字
        label: {
          // 文本。支持显式换行符“ \ n”
          text: '数据加载中...',
          // 字体样式，以CSS语法指定字体
          font: '20pt Source Han Sans CN',
          // 字体颜色
          fillColor: Color.RED,
          // 字体边框颜色
          outlineColor: Color.WHITE,
          // 字体边框尺寸
          outlineWidth: 10,
          // 应用于图像的统一比例。比例大于会1.0放大标签，而比例小于会1.0缩小标签。
          scale: 1.0,
          // 该属性指定标签在屏幕空间中距此标签原点的像素偏移量
          pixelOffset: new Cartesian2(10, 0),
          // 显示在距相机的距离处的属性，多少区间内是可以显示的
          //distanceDisplayCondition: new DistanceDisplayCondition(0, 1500),
          // 是否显示
          show: true,
        },
      });
    }
  }

  #getOrCreateLoadingPic(rangePoints: {lon: number; lat: number}[]) {
    if (this.loadingPicContainer_ == null) {
      let viewer = createViewer();
      this.loadingPicContainer_ = new PrimitiveCollection();
      viewer.scene.primitives.add(this.loadingPicContainer_);
    } else {
      this.loadingPicContainer_.removeAll();
    }

    let centerLon = 0.0;
    let centerLat = 0.0;
    for (let rangePt of rangePoints) {
      centerLat += rangePt.lat / rangePoints.length;
      centerLon += rangePt.lon / rangePoints.length;
    }

    this.#getPicLabel(centerLon, centerLat);

    let geodetic0 = rangePoints[0];
    let geodetic1 = rangePoints[1];
    let geodetic2 = rangePoints[2];
    let geodetic3 = rangePoints[3];

    let coordinates: any = [];
    coordinates.push(Cartesian3.fromDegrees(geodetic0.lon, geodetic0.lat, 0));
    coordinates.push(Cartesian3.fromDegrees(geodetic1.lon, geodetic1.lat, 0));
    coordinates.push(Cartesian3.fromDegrees(geodetic2.lon, geodetic2.lat, 0));
    coordinates.push(Cartesian3.fromDegrees(geodetic3.lon, geodetic3.lat, 0));

    let height = 1;
    let polygonHierarchy = new PolygonHierarchy(coordinates);

    let polygonGeometry = new PolygonGeometry({
      polygonHierarchy: polygonHierarchy,
      height: height,
    });

    let appearance = new EllipsoidSurfaceAppearance({
      aboveGround: false,
      material: Material.fromType('Color', {
        color: Color.fromCssColorString('#80808080'),
      }),
    });

    this.loadingPicContainer_.add(
      new Primitive({
        geometryInstances: new GeometryInstance({
          geometry: polygonGeometry,
        }),
        appearance: appearance,
      }),
    );
  }

  pointCloudPicContainer_: PrimitiveCollection | null;

  loadingPicContainer_: PrimitiveCollection | null = null;
  picImage_: any = null;

  testCanvas_: any = null;

  //记录最后的状态
  finalImgUrl_ = '';

  loadingTextEntity_: Entity | null = null;

  //let g_mat: void | Material | null = null;
  lastMats_: Material[] = [];
}
