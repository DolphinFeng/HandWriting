import { createViewer } from '../cesium/create-viewer.js';
import {
  PolylineGlowMaterialProperty,
  Color,
  CallbackProperty,
  Cartesian3,
  ColorMaterialProperty,
} from 'cesium';
import { nioCamera } from '../utils/utils.js';

const viewer = createViewer();

//临时存一下，在clearAllTempEntities里清除的时候调用
let allEntities = [];

//创建临时高亮线条
export const createHighlightLineEntity = function (coordinates) {
  let linePosition = [];
  for (let j = 0; j < coordinates.length; j++) {
    var point = Cartesian3.fromDegrees(
      coordinates[j][0],
      coordinates[j][1],
      5.0
    );
    linePosition.push(point);
  }

  if (linePosition.length === 0) {
    return;
  }

  let loc_pos = Cartesian3.fromDegrees(
    coordinates[0][0],
    coordinates[0][1],
    500
  );

  let speed = 0.05,
    result = new Color(0, 1, 0);
  var polyline = viewer.entities.add({
    polyline: {
      show: true,
      positions: linePosition, // 获取或设置指定 Cartesian3 数组的属性定义线条的位置。
      // 获取或设置指定用于绘制折线的材料的属性。
      material: new PolylineGlowMaterialProperty({
        glowPower: 0.5, //一个数字属性，指定发光强度，占总线宽的百分比。
        //color: Color.BLUE.withAlpha(.9)
        color: new CallbackProperty(() => {
          let newColor = result.blue + speed;
          newColor = Math.min(Math.max(newColor, 0), 1);
          if (newColor === 1 || newColor === 0) {
            speed *= -1;
          }
          result.blue = newColor;
          result.green = newColor;
          return result;
        }, false),
      }),
      width: 10,
      clampToGround: true,
    },
  });

  allEntities.push(polyline);

  nioCamera.locatePosition({
    position: loc_pos,
    duration: 2,
    animate: true,
    before() {},
    completed() {
      //loadingSourceOddHandler(true);
      //loadingNadTileHandler(true);
    },
  });
};

//清除
export const clearAllTempEntities = function () {
  for (let i = 0; i < allEntities.length; i++) {
    viewer.entities.remove(allEntities[i]);
  }

  allEntities = [];
};
