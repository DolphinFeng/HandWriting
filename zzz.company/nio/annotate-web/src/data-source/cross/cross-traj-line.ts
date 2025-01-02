import {
  Cartesian3,
  Cartographic,
  Primitive,
  GeometryInstance,
  Color,
  Material,
  PrimitiveCollection,
  PolylineGeometry,
  PolylineMaterialAppearance,
  ColorGeometryInstanceAttribute,
  PointPrimitiveCollection,
  PointPrimitive,
  NearFarScalar,
} from 'cesium';
import {createViewer} from '../../cesium/create-viewer.js';
import {ENUToGeodetic, GetPtEnu} from '../../utils/coordinate-transform.js';
import {NioMessage, encodeCesiumId} from '../../utils/utils.js';
import axios from 'axios';
import {simplifyWithRDP} from '../../utils/simplify.js';
import store from '../../store/store.js';

let activePointPrimitive = null;
let trajectoryLinesContainer: PrimitiveCollection | null = null;
let trajectoryPointsContainer: PointPrimitiveCollection | null = null;

export function clearTrajectoryLines() {
  if (trajectoryLinesContainer) {
    trajectoryLinesContainer.removeAll();
  }

  if (trajectoryPointsContainer) {
    trajectoryPointsContainer.removeAll();
  }
}

const picPointPixelSize = 10;
const picPointOutlineWidth = 2;

/**
 * 设置不活跃点样式
 * @param point
 */
function setInActiveStyle(point) {
  if (point) {
    point.pixelSize = picPointPixelSize;
    point.outlineWidth = picPointOutlineWidth;
    point.color = Color.fromCssColorString('#1f4ff4');
    point.outlineColor = Color.fromCssColorString('#04138f');
  }
}

/**
 * 设置活跃点样式
 * @param point
 */
function setActiveStyle(point) {
  if (point) {
    point.pixelSize = picPointPixelSize;
    point.color = Color.fromCssColorString('#e935db');
    point.outlineWidth = picPointOutlineWidth;
    point.outlineColor = Color.fromCssColorString('#e935db');
  }
}

export function setPointActive(idx) {
  let viewer = createViewer();
  if (!trajectoryPointsContainer) {
    return;
  }

  if (activePointPrimitive) {
    setInActiveStyle(activePointPrimitive);
  }

  //@ts-ignore
  activePointPrimitive = trajectoryPointsContainer._pointPrimitives[idx];
  setActiveStyle(activePointPrimitive);

  if (activePointPrimitive) {
    //@ts-ignore
    let cartographic = Cartographic.fromCartesian(activePointPrimitive.position);

    cartographic.height = viewer.camera.positionCartographic.height;
    viewer.camera.setView({
      destination: Cartographic.toCartesian(cartographic),
    });
  }
}

export class TrajPicPoint {
  url: string[]; //0 前；1 左；2 右
  time: string = '';
  position: Cartesian3;
  index: number;

  constructor(url, position, index) {
    this.url = url;
    this.position = position;
    this.index = index;
  }
}

export class TrajPicLine {
  points: TrajPicPoint[];

  constructor() {
    this.points = [];
  }
}

export let trajPicLines: TrajPicLine[] = [];

export async function refreshTrajectoryLines(id, show) {
  if (trajectoryLinesContainer == null) {
    trajectoryLinesContainer = new PrimitiveCollection();
    trajectoryPointsContainer = new PointPrimitiveCollection();
    let viewer = createViewer();
    viewer.scene.primitives.add(trajectoryLinesContainer);
    viewer.scene.primitives.add(trajectoryPointsContainer);
  } else {
    trajectoryLinesContainer.removeAll();
    if (trajectoryPointsContainer) trajectoryPointsContainer.removeAll();
  }

  if (show == false) {
    return;
  }

  try {
    //@ts-ignore
    let response = await axios.post(window.api.markPlatformUrl + '/pt/mark/getResource', {
      id: id,
    });

    trajPicLines = [];

    //let lines = response.data.data.trajectory;
    let lines = response.data.data.clipList;
    let ptIndex = 0;

    if (lines.length == 0) {
      NioMessage('success', '没有轨迹数据', 2000);
    }

    const _nearFarScalar = new NearFarScalar(1.5e2, 1, 1.5e3, 0.3);
    for (let j = 0; j < lines.length; j++) {
      let line = lines[j];
      let positions: Cartesian3[] = [];

      let trajPicLine = new TrajPicLine();

      // line是每条轨迹（每一个大对象）
      if (line.trajectory == null) {
        NioMessage('warning', '此轨迹图片无数据', 2000);
        return;
      }
      let pose = line.trajectory.slice(13, line.trajectory.length - 1);
      let poseArr = pose.split(',');

      for (let i = 0; i < poseArr.length; i++) {
        let resPt = {
          lon: parseFloat(poseArr[i].trim().split(' ')[0]),
          lat: parseFloat(poseArr[i].trim().split(' ')[1]),
          height: parseFloat(poseArr[i].trim().split(' ')[2]),
        };

        let imageFw = '',
          imageFl = '',
          imageFr = '';

        let pos: any;
        if (store.state.sceneMode === '3D') {
          pos = Cartesian3.fromDegrees(resPt.lon, resPt.lat, resPt.height);
        } else if (store.state.sceneMode === '2D') {
          pos = Cartesian3.fromDegrees(resPt.lon, resPt.lat, 0.08);
        }

        for (let imageItem of line.imageList) {
          if (imageItem.index == ptIndex) {
            if (imageItem.imageName == 'fw') {
              imageFw = imageItem.imageUrl;
            }
            if (imageItem.imageName == 'fl') {
              imageFl = imageItem.imageUrl;
            }
            if (imageItem.imageName == 'fr') {
              imageFr = imageItem.imageUrl;
            }
          }
        }
        let imageUrls = [imageFw, imageFl, imageFr];

        if (imageUrls[0] + imageUrls[1] + imageUrls[2] !== '') {
          trajPicLine.points.push(new TrajPicPoint(imageUrls, pos, ptIndex));
        }

        if (positions.length > 0) {
          //添加一个中间点，使箭头可以绘制在中间
          let middlePoint = new Cartesian3();
          Cartesian3.midpoint(positions[positions.length - 1], pos, middlePoint);
          positions.push(middlePoint);
        }
        positions.push(pos);
        ptIndex++;
      }

      if (trajPicLine.points.length > 0) {
        trajPicLines.push(trajPicLine);
      }

      let color = Color.fromCssColorString('#75fbedff');
      //抽稀
      positions = simplifyWithRDP(positions, 0.5);
      //为了每段都有箭头，两个点画一次
      for (let i = 1; i < positions.length; i++) {
        let pos: Cartesian3[] = [];
        pos.push(positions[i - 1]);
        pos.push(positions[i]);

        let geometryInstances = new GeometryInstance({
          geometry: new PolylineGeometry({
            positions: pos,
            width: 12,
            vertexFormat: PolylineMaterialAppearance.VERTEX_FORMAT,
          }),
          attributes: {
            color: ColorGeometryInstanceAttribute.fromColor(Color.WHITE),
          },
        });

        let appearance = new PolylineMaterialAppearance({
          material: Material.fromType('PolylineArrow', {
            color: color,
          }),
        });

        let polyLinePrimitive = new Primitive({
          geometryInstances: geometryInstances,
          appearance: appearance,
          asynchronous: true, //交给webWorker创建
          allowPicking: false,
        });

        trajectoryLinesContainer.add(polyLinePrimitive);
      }
    }

    for (let j = 0; j < trajPicLines.length; j++) {
      let trajPicLine = trajPicLines[j];
      for (let i = 0; i < trajPicLine.points.length; i++) {
        let trajPicPoint = trajPicLine.points[i];

        let tag = j + '#' + i;
        let cesiumId = encodeCesiumId('trajPoint', tag);

        let pointPrimitive = new PointPrimitive();
        pointPrimitive.id = cesiumId;
        pointPrimitive.pixelSize = picPointPixelSize;
        pointPrimitive.color = Color.fromCssColorString('#1f4ff4');
        pointPrimitive.position = trajPicPoint.position;
        pointPrimitive.outlineColor = Color.fromCssColorString('#04138f');
        pointPrimitive.outlineWidth = picPointOutlineWidth;
        pointPrimitive.disableDepthTestDistance = Number.POSITIVE_INFINITY;
        pointPrimitive.scaleByDistance = _nearFarScalar;

        if (trajectoryPointsContainer) trajectoryPointsContainer.add(pointPrimitive);
      }
    }
  } catch (error) {
    console.log(error);
    NioMessage('error', error, 2000);
  }
}
