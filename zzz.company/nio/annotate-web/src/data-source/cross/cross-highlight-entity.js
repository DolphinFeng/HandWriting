import {createViewer} from '../../cesium/create-viewer.js';
import {ENUToGeodetic} from '../../utils/coordinate-transform.js';
import axios from 'axios';
import {Cartesian3, PolylineGlowMaterialProperty, PolylineDashMaterialProperty, CallbackProperty, Color} from 'cesium';
import {NioMessage} from '../../utils/utils.js';
import {crossDesc} from './cross-material.ts';
import {routeInfosPanel} from './cross-info-panel.ts';

// 提取所有的 crossId
let panelCrossIds = [];

// 加载 panelCrossIds 数据
async function loadPanelCrossIds() {
  const allCrossIds = routeInfosPanel.map((item) => item.crossId);
  panelCrossIds = [...new Set(allCrossIds)];
  console.log('去重后的 crossId: ', panelCrossIds);
}

// 添加一个超时机制，确保不会阻塞后续代码执行
async function loadPanelCrossIdsWithTimeout(timeout = 1000) {
  return Promise.race([loadPanelCrossIds(), new Promise((resolve) => setTimeout(resolve, timeout))]);
}

loadPanelCrossIdsWithTimeout();

let temporary_polyline_entity = null;

//临时存一下，在clearCrossHighlightEntities里清除的时候调用
let crossHighlightEntities = [];
let crossHighlightEntitiesType = [];

let previousCrossId = null;

export async function createCrossHighlightEntities(crossId) {
  clearCrossHighlightEntities();
  // 如果 crossId 变了，就清空之前的直线
  if (previousCrossId !== null && previousCrossId !== crossId.id) {
    panelCrossIds = [];
  }
  // 确保 panelCrossIds 数据已加载
  if (panelCrossIds.length === 0) {
    await loadPanelCrossIdsWithTimeout();
  }

  previousCrossId = crossId.id;

  let viewer = createViewer();
  let features;
  let result = await axios.post(window.api.markPlatformUrl + '/pt/mark/searchById', {
    id: crossId.id,
  });
  result.data.data.forEach((item) => {
    features = JSON.parse(item.location);
  });

  if (result.data.data.length == 0 || features == undefined) {
    NioMessage('warning', '未查询到位置信息', 2000);
    return;
  }

  let lon = features.coordinates[0];
  let lat = features.coordinates[1];

  let coordinates = [];

  if (crossId.projectId == '10068') {
    // 路口画方形
    let leftTop = ENUToGeodetic(25, 25, 0, lon, lat, 0);
    let rightBottom = ENUToGeodetic(-25, -25, 0, lon, lat, 0);

    coordinates.push(Cartesian3.fromDegrees(leftTop.lon, leftTop.lat, 0.1));
    coordinates.push(Cartesian3.fromDegrees(leftTop.lon, rightBottom.lat, 0.1));
    coordinates.push(Cartesian3.fromDegrees(rightBottom.lon, rightBottom.lat, 0.1));
    coordinates.push(Cartesian3.fromDegrees(rightBottom.lon, leftTop.lat, 0.1));
    coordinates.push(Cartesian3.fromDegrees(leftTop.lon, leftTop.lat, 0.1));
    coordinates.push(Cartesian3.fromDegrees(leftTop.lon, rightBottom.lat, 0.1));
  } else if (crossId.projectId == '10069') {
    // 匝道画三角形
    let enuCoords = getEquilateralTriangleCoordinates(40);
    for (let coord of enuCoords) {
      let geoCoord = ENUToGeodetic(coord[0], coord[1], 0, lon, lat, 0);
      coordinates.push(Cartesian3.fromDegrees(geoCoord.lon, geoCoord.lat, 1));
    }
  } else if (crossId.projectId == '10108') {
    // 环岛画圆形
    let enuCoords = getCircleCoordinates(20, 100);
    for (let coord of enuCoords) {
      let geoCoord = ENUToGeodetic(coord[0], coord[1], 0, lon, lat, 0);
      coordinates.push(Cartesian3.fromDegrees(geoCoord.lon, geoCoord.lat, 1));
    }
    // 将 panelCrossIds 中的 crossId 与圆形相连
    for (let uniqueCrossId of panelCrossIds) {
      let uniqueResult = await axios.post(window.api.markPlatformUrl + '/pt/mark/searchById', {
        id: uniqueCrossId,
      });
      uniqueResult.data.data.forEach((item) => {
        let uniqueFeatures = JSON.parse(item.location);
        let uniqueLon = uniqueFeatures.coordinates[0];
        let uniqueLat = uniqueFeatures.coordinates[1];

        // 添加从圆形中心到 uniqueCrossId 的连线
        let lineCoordinates = [Cartesian3.fromDegrees(lon, lat, 1), Cartesian3.fromDegrees(uniqueLon, uniqueLat, 1)];

        draw_dynamic_polyline(viewer, lineCoordinates);

        crossHighlightEntities.push(temporary_polyline_entity);
      });
    }
  } else if (crossId.projectId == '10106') {
    // 主路画长方形
    let leftTop = ENUToGeodetic(50, 25, 0, lon, lat, 0);
    let rightBottom = ENUToGeodetic(-50, -25, 0, lon, lat, 0);

    coordinates.push(Cartesian3.fromDegrees(leftTop.lon, leftTop.lat, 0.1));
    coordinates.push(Cartesian3.fromDegrees(leftTop.lon, rightBottom.lat, 0.1));
    coordinates.push(Cartesian3.fromDegrees(rightBottom.lon, rightBottom.lat, 0.1));
    coordinates.push(Cartesian3.fromDegrees(rightBottom.lon, leftTop.lat, 0.1));
    coordinates.push(Cartesian3.fromDegrees(leftTop.lon, leftTop.lat, 0.1));
    coordinates.push(Cartesian3.fromDegrees(leftTop.lon, rightBottom.lat, 0.1));
  }

  let speed = 0.05;
  let res = new Color(1, 0, 0);

  let polyline = viewer.entities.add({
    polyline: {
      show: true,
      positions: coordinates, // 获取或设置指定 Cartesian3 数组的属性定义线条的位置。
      // 获取或设置指定用于绘制折线的材料的属性。
      material: new PolylineGlowMaterialProperty({
        glowPower: 0.5, //一个数字属性，指定发光强度，占总线宽的百分比。
        //color: Color.BLUE.withAlpha(.9)
        color: new CallbackProperty(() => {
          let newColor = res.red + speed;
          newColor = Math.min(Math.max(newColor, 0), 1);
          if (newColor === 1 || newColor === 0) {
            speed *= -1;
          }
          res.red = newColor;
          return res;
        }, false),
      }),
      width: 10,
      clampToGround: true,
    },
  });

  crossHighlightEntities.push(polyline);
  crossHighlightEntitiesType.push(crossId.projectId);
}

function draw_dynamic_polyline(viewer, polyline_point_arr) {
  temporary_polyline_entity = viewer.entities.add({
    polyline: {
      positions: polyline_point_arr,
      width: 1,
      material: new PolylineDashMaterialProperty({
        color: Color.RED,
        dashLength: 16.0,
        dashPattern: 255,
      }),
      show: true,
    },
  });
}

function getCircleCoordinates(radius, seg) {
  let angle = 360.0 / seg;
  let coords = [];

  // 将角度转换为弧度
  angle = angle * (Math.PI / 180);

  for (let i = 0; i < seg; i++) {
    // 计算圆上点的坐标
    let x = radius * Math.cos(angle * i);
    let y = radius * Math.sin(angle * i);
    coords.push([x, y]);
  }

  return coords;
}

function getEquilateralTriangleCoordinates(sideLength) {
  const height = (Math.sqrt(3) / 2) * sideLength;
  const halfSide = sideLength / 2;

  // 计算三角形的中心点
  const centerX = sideLength / 2;
  const centerY = height / 3;

  const coords = [
    [-centerX, -centerY], // 第一个顶点
    [centerX, -centerY], // 第二个顶点
    [0, 2 * centerY], // 第三个顶点
    [-centerX, -centerY], // 重复第一个顶点
    [centerX, -centerY], // 重复第二个顶点
  ];

  return coords;
}

export const showCrossHighlightEntities = function (show, type) {
  const viewer = createViewer();
  for (let i = 0; i < crossHighlightEntities.length; i++) {
    // '10068'">路口id
    // '10069'">匝道id
    // '10106'">主路id

    // debugger;

    // 只控制对应类型的显隐
    if (type == crossDesc.crossPoint) {
      if (crossHighlightEntitiesType[i] != '10068') {
        continue;
      }
    } else if (type == crossDesc.rampPoint) {
      if (crossHighlightEntitiesType[i] != '10069') {
        continue;
      }
    } else if (type == crossDesc.mainRoad) {
      if (crossHighlightEntitiesType[i] != '10106') {
        continue;
      }
    }

    crossHighlightEntities[i].show = show;
  }
};

//清除
export const clearCrossHighlightEntities = function () {
  // debugger;
  const viewer = createViewer();
  for (let i = 0; i < crossHighlightEntities.length; i++) {
    viewer.entities.remove(crossHighlightEntities[i]);
  }
  crossHighlightEntities = [];
  crossHighlightEntitiesType = [];
};
