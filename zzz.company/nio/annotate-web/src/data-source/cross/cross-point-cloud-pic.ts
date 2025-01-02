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
import {createViewer} from '../../cesium/create-viewer.js';
import {ENUToGeodetic, UV2ENU} from '../../utils/coordinate-transform.js';

let pointCloudPicContainer: PrimitiveCollection = new PrimitiveCollection();
let viewer = createViewer();
viewer.scene.primitives.add(pointCloudPicContainer);

let loadingPicContainer: PrimitiveCollection | null = null;
let picImage: any = null;

let testCanvas: any = null;

function createPointPrimitive(position) {
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

//记录最后的状态
let finalImgUrl = '';

function splitImage(
  width: number,
  height: number,
  param: {
    width: number;
    height: number;
    refLon: number;
    refLat: number;
    refHeight: number;
    offsetX: number;
    offsetY: number;
    scaleX: number;
    scaleY: number;
    img: string;
  } | null,
) {
  if (param == null) {
    return;
  }

  const maxSize = 12000;
  if (width > maxSize && height > maxSize) {
  } else if (width > maxSize) {
    let halfWidth = Math.floor(width / 2);
    let halfHeight = Math.floor(height / 2);

    let enu = UV2ENU(halfWidth, halfHeight, param.offsetX, param.offsetY, param.scaleX, param.scaleY);
    let geodetic0 = ENUToGeodetic(enu.east, enu.north, 0.0, param.refLon, param.refLat, param.refHeight);

    let pos = Cartesian3.fromDegrees;
  } else if (height > maxSize) {
  }
}

function createImagePrimitive(
  left: number,
  top: number,
  imgWidth: number,
  imgHeight: number,
  imgUrl: string,
  param: {
    width: number;
    height: number;
    refLon: number;
    refLat: number;
    refHeight: number;
    offsetX: number;
    offsetY: number;
    scaleX: number;
    scaleY: number;
    img: string;
  } | null,
) {
  //picPositions.push({ lon: param.refLon, lat: param.refLat });
  let enu: any = [];
  if (param == null) {
    return null;
  }

  enu.push(UV2ENU(left, top, param.offsetX, param.offsetY, param.scaleX, param.scaleY));
  enu.push(UV2ENU(left, top + imgHeight, param.offsetX, param.offsetY, param.scaleX, param.scaleY));
  enu.push(UV2ENU(left + imgWidth, top + imgHeight, param.offsetX, param.offsetY, param.scaleX, param.scaleY));
  enu.push(UV2ENU(left + imgWidth, top, param.offsetX, param.offsetY, param.scaleX, param.scaleY));

  let geodetic0 = ENUToGeodetic(enu[0].east, enu[0].north, 0.0, param.refLon, param.refLat, param.refHeight);
  let geodetic1 = ENUToGeodetic(enu[1].east, enu[1].north, 0.0, param.refLon, param.refLat, param.refHeight);
  let geodetic2 = ENUToGeodetic(enu[2].east, enu[2].north, 0.0, param.refLon, param.refLat, param.refHeight);
  let geodetic3 = ENUToGeodetic(enu[3].east, enu[3].north, 0.0, param.refLon, param.refLat, param.refHeight);

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
  g_mats.push(material);

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

export function refreshPointCloudPicture(
  param: {
    width: number;
    height: number;
    refLon: number;
    refLat: number;
    refHeight: number;
    offsetX: number;
    offsetY: number;
    scaleX: number;
    scaleY: number;
    img: string;
  } | null,
  show,
) {
  pointCloudPicContainer.removeAll();

  if (loadingPicContainer) {
    loadingPicContainer.removeAll();
  }

  if (loadingTextEntity) {
    loadingTextEntity.show = false;
  }

  if (show == false) {
    finalImgUrl = '';
    return;
  }

  if (param == null) {
    return;
  }

  getOrCreateLoadingPic(param);

  finalImgUrl = param.img;

  picImage = new Image();
  picImage.src = param.img;

  picImage.onload = function () {
    if (loadingPicContainer) {
      loadingPicContainer.removeAll();
    }

    //picImage.onload为异步加载，在频繁的切换过程中，数据的下载速度不同导致加载队列乱序
    //所以此处需要判断加载完的数据是否为最后需要的数据，保证加载一致性
    if (finalImgUrl != param.img) {
      return;
    }

    if (loadingTextEntity) {
      loadingTextEntity.show = false;
    }

    let viewer = createViewer();
    pointCloudPicContainer.removeAll();

    let imgUrl = param.img;

    //test code
    //验证贴图位置是否准确
    if (0) {
      if (testCanvas == null) {
        testCanvas = document.createElement('canvas');
      }

      let testU = 100; //param.width - 200;
      let testV = 100; //param.height - 200;

      let size = 100;

      //实际测试点取像素中心，u和v应该加0.5个像素的偏移量。但是canvas的绘制，又反偏0.5个像素，所以此处不再添加偏移
      let enu = UV2ENU(testU, testV, param.offsetX, param.offsetY, param.scaleX, param.scaleY);
      let geodetic0 = ENUToGeodetic(enu.east, enu.north, 0.0, param.refLon, param.refLat, param.refHeight);

      let pos = Cartesian3.fromDegrees(geodetic0.lon, geodetic0.lat, 0);
      let testPointPrimitive = createPointPrimitive(pos);
      viewer.scene.primitives.add(testPointPrimitive);

      testCanvas.width = param.width;
      testCanvas.height = param.height;
      const context = testCanvas.getContext('2d');

      context.drawImage(picImage, 0, 0, param.width, param.height, 0, 0, param.width, param.height);

      context.lineWidth = '1';
      context.strokeStyle = 'green';

      context.beginPath();
      context.moveTo(testU - size, testV);
      context.lineTo(testU + size, testV);

      context.stroke();

      context.beginPath();
      context.moveTo(testU, testV - size);
      context.lineTo(testU, testV + size);
      context.stroke();

      imgUrl = testCanvas.toDataURL();
    }

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

    for (let mat of g_mats) {
      //必须加这一句，否则自定义的material会导致内存泄漏（默认参数的material不会有这个问题）
      mat && mat.destroy();
    }

    g_mats.splice(0, g_mats.length);
    //g_mat = g_mat && g_mat.destroy();

    //只有一个，不用进行图片拷贝
    if (cols == 1 && rows == 1) {
      let primitive = createImagePrimitive(0, 0, param.width, param.height, imgUrl, param);
      pointCloudPicContainer.add(primitive);
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

          context.drawImage(picImage, left, top, width, height, 0, 0, width, height);
          let primitive = createImagePrimitive(left, top, width, height, blockCanvas.toDataURL(), param);
          pointCloudPicContainer.add(primitive);
        }
      }
    }
  };
}

let loadingTextEntity: Entity | null = null;

function getPicLabel(lon: number, lat: number) {
  if (loadingTextEntity) {
    loadingTextEntity.show = true;
    //@ts-ignore
    loadingTextEntity.position = Cartesian3.fromDegrees(lon, lat, 5);
  } else {
    let viewer = createViewer();
    loadingTextEntity = viewer.entities.add({
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

//let g_mat: void | Material | null = null;
let g_mats: Material[] = [];

function getOrCreateLoadingPic(param: {
  width: number;
  height: number;
  refLon: number;
  refLat: number;
  refHeight: number;
  offsetX: number;
  offsetY: number;
  scaleX: number;
  scaleY: number;
  img: string;
}) {
  if (loadingPicContainer == null) {
    let viewer = createViewer();
    loadingPicContainer = new PrimitiveCollection();
    viewer.scene.primitives.add(loadingPicContainer);
  } else {
    loadingPicContainer.removeAll();
  }

  let centerEnu = UV2ENU(
    param.width * 0.5,
    param.height * 0.5,
    param.offsetX,
    param.offsetY,
    param.scaleX,
    param.scaleY,
  );
  let geodeticCenter = ENUToGeodetic(centerEnu.east, centerEnu.north, 0.0, param.refLon, param.refLat, param.refHeight);

  getPicLabel(geodeticCenter.lon, geodeticCenter.lat);

  let enu: any = [];
  enu.push(UV2ENU(0, 0, param.offsetX, param.offsetY, param.scaleX, param.scaleY));
  enu.push(UV2ENU(0, param.height, param.offsetX, param.offsetY, param.scaleX, param.scaleY));
  enu.push(UV2ENU(param.width, param.height, param.offsetX, param.offsetY, param.scaleX, param.scaleY));
  enu.push(UV2ENU(param.width, 0, param.offsetX, param.offsetY, param.scaleX, param.scaleY));

  let geodetic0 = ENUToGeodetic(enu[0].east, enu[0].north, 0.0, param.refLon, param.refLat, param.refHeight);
  let geodetic1 = ENUToGeodetic(enu[1].east, enu[1].north, 0.0, param.refLon, param.refLat, param.refHeight);
  let geodetic2 = ENUToGeodetic(enu[2].east, enu[2].north, 0.0, param.refLon, param.refLat, param.refHeight);
  let geodetic3 = ENUToGeodetic(enu[3].east, enu[3].north, 0.0, param.refLon, param.refLat, param.refHeight);

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

  loadingPicContainer.add(
    new Primitive({
      geometryInstances: new GeometryInstance({
        geometry: polygonGeometry,
      }),
      appearance: appearance,
    }),
  );
}
