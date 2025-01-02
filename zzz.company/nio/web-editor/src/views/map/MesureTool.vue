<template>
  <tool-item icon="icon-_position-o" title="测量距离" color="#f07c09" :width="340" @click="MesureToolHandler">
    <template #icon>
      <div class="icon-center">
        <img src="/img/measure.png" alt="" />
      </div>
    </template>
  </tool-item>
</template>

<script setup>
import {useStore} from 'vuex';
import ToolItem from '../map/header/headerPanel/ToolItem.vue';
import {eventController} from '../../event/eventController.js';
import {createViewer} from '../../cesium/initMap.js';

import * as Cesium from 'cesium';

const store = useStore();
function MesureToolHandler() {
  click_draw_polyline();
}

function getLength(lon1, lat1, lon2, lat2) {
  // 将起点与终点位置信息从笛卡尔坐标形式转换为Cartographic形式
  let startCartographic = Cesium.Cartographic.fromDegrees(lon1, lat1);
  let endCartographic = Cesium.Cartographic.fromDegrees(lon2, lat2);
  // 初始化测地线
  let geodesic = new Cesium.EllipsoidGeodesic();
  // 设置测地线起点和终点，EllipsoidGeodesic中setEndPoints常与surfaceDistance搭配使用
  geodesic.setEndPoints(startCartographic, endCartographic);
  // 获取起点和终点之间的表面距离，单位为km，规定四舍五入保留两位小数
  // surfaceDistance返回number 单位为m，带小数
  // console.log((geodesic.surfaceDistance / 1000).toFixed(2))
  //return (geodesic.surfaceDistance / 1000).toFixed(2)
  return geodesic.surfaceDistance;
}

function getMidpoint(lon1, lat1, lon2, lat2) {
  let startPoint = Cesium.Cartographic.fromDegrees(lon1, lat1);
  let endPoint = Cesium.Cartographic.fromDegrees(lon2, lat2);
  let geodesic = new Cesium.EllipsoidGeodesic();
  geodesic.setEndPoints(startPoint, endPoint);
  let geoPoint = geodesic.interpolateUsingFraction(0.5);
  //console.log(Cesium.Ellipsoid.WGS84.cartographicToCartesian(geoPoint))
  return Cesium.Ellipsoid.WGS84.cartographicToCartesian(geoPoint);
}

// 保存所有点的数据
var polyline_point_arr = [];
// 临时线entity
var temporary_polyline_entity = null;

let temporary_points_entity = [];

// 保存临时标的位置
let tag_point_cartesian = null;

// 临时标的长度值
let tag_content = null;

// 临时标
var temporary_tag_entity = null;

var tag_entity = [];

var handler = null;

let total_length = 0.0;

// 开启绘制的方法
function click_draw_polyline() {
  eventController.stop('RIGHT_DOWN', 'DEFAULT');

  // 清除可能会用到的监听事件
  if (handler) {
    handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }

  let viewer = createViewer();

  handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  //鼠标左键--确定选中点
  handler.setInputAction((event) => {
    // 屏幕坐标转为世界坐标
    let cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(event.position), viewer.scene);
    let ellipsoid = viewer.scene.globe.ellipsoid;
    let cartographic = ellipsoid.cartesianToCartographic(cartesian);
    let lat = Cesium.Math.toDegrees(cartographic.latitude);
    let lon = Cesium.Math.toDegrees(cartographic.longitude);
    // 判断是否定义（是否可以获取到空间坐标）
    if (Cesium.defined(cartesian)) {
      // 将点添加进保存线的坐标的数组中，鼠标停止移动的时添加的点和，点击时候添加的点，坐标一样
      // 注意顺序不能错了，先经度后纬度
      polyline_point_arr.push(lon);
      polyline_point_arr.push(lat);
      // 判断是否开始绘制动态线，没有的话则开始绘制
      if (temporary_polyline_entity == null) {
        // 绘制动态线
        draw_dynamic_polyline();
      }

      let point_entity = addPoint(cartesian);
      temporary_points_entity.push(point_entity);
    }

    if (polyline_point_arr.length >= 6) {
      let pointLength = getLength(
        polyline_point_arr[polyline_point_arr.length - 6],
        polyline_point_arr[polyline_point_arr.length - 5],
        polyline_point_arr[polyline_point_arr.length - 4],
        polyline_point_arr[polyline_point_arr.length - 3],
      );
      let midPosition = getMidpoint(
        polyline_point_arr[polyline_point_arr.length - 6],
        polyline_point_arr[polyline_point_arr.length - 5],
        polyline_point_arr[polyline_point_arr.length - 4],
        polyline_point_arr[polyline_point_arr.length - 3],
      );

      total_length += pointLength;
      let pointLabel = addLabel(midPosition, total_length.toFixed(2));
      tag_entity.push(pointLabel);
    }

    //鼠标移动--实时绘制线
    handler.setInputAction((event) => {
      // 屏幕坐标转为世界坐标
      let cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(event.endPosition), viewer.scene);
      let ellipsoid = viewer.scene.globe.ellipsoid;
      let cartographic = ellipsoid.cartesianToCartographic(cartesian);
      let lon = Cesium.Math.toDegrees(cartographic.longitude); // 经度
      let lat = Cesium.Math.toDegrees(cartographic.latitude); // 纬度

      // 判断是否定义（是否可以获取到空间坐标）
      if (Cesium.defined(cartesian)) {
        // 判断是否已经开始绘制动态线，已经开始的话，则可以动态拾取鼠标移动的点，修改点的坐标
        if (temporary_polyline_entity) {
          // 只要元素点大于二，每次就删除二个点，因为实时动态的点是添加上去的
          if (polyline_point_arr.length > 2) {
            // 删除数组最后两个元素（鼠标移动添加进去的点）
            polyline_point_arr.pop();
            polyline_point_arr.pop();
          }
          // 将新的点添加进动态线的坐标的数组中，用于实时变化，注意：这里是先添加了一个点，然后再删除点，再添加，这样重复的
          // 注意顺序不能错了，先经度后纬度
          polyline_point_arr.push(lon);
          polyline_point_arr.push(lat);

          if (polyline_point_arr.length > 2) {
            tag_point_cartesian = getMidpoint(
              polyline_point_arr[polyline_point_arr.length - 4],
              polyline_point_arr[polyline_point_arr.length - 3],
              polyline_point_arr[polyline_point_arr.length - 2],
              polyline_point_arr[polyline_point_arr.length - 1],
            );
            let length = getLength(
              polyline_point_arr[polyline_point_arr.length - 4],
              polyline_point_arr[polyline_point_arr.length - 3],
              polyline_point_arr[polyline_point_arr.length - 2],
              polyline_point_arr[polyline_point_arr.length - 1],
            );

            tag_content = (total_length + length).toFixed(2);
            if (temporary_tag_entity == null) {
              draw_dynamic_tag();
            }
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  //鼠标右键--结束绘制
  handler.setInputAction((event) => {
    // 取消鼠标移动监听
    handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    // 清除动态绘制的线
    viewer.entities.remove(temporary_polyline_entity);
    // 删除保存的临时线的entity
    temporary_polyline_entity = null;

    viewer.entities.remove(temporary_tag_entity);
    temporary_tag_entity = null;

    for (let i = 0; i < tag_entity.length; i++) {
      viewer.entities.remove(tag_entity[i]);
    }

    for (let i = 0; i < temporary_points_entity.length; i++) {
      viewer.entities.remove(temporary_points_entity[i]);
    }

    temporary_points_entity = [];

    tag_entity = [];

    total_length = 0.0;

    // 清空线点数组，用于下次绘制
    polyline_point_arr = [];
    // 清除所有事件
    if (handler) {
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    eventController.start('RIGHT_DOWN', 'DEFAULT');
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
}

//绘制动态线
function draw_dynamic_polyline() {
  let viewer = createViewer();
  temporary_polyline_entity = viewer.entities.add({
    polyline: {
      // 这个方法上面有重点说明
      positions: new Cesium.CallbackProperty(() => {
        return new Cesium.Cartesian3.fromDegreesArray(polyline_point_arr);
      }, false),
      // 宽度
      width: 2,
      // 线的颜色
      material: Cesium.Color.DARKORANGE,
      // 是否显示
      show: true,
    },
  });
}

function addPoint(position) {
  let viewer = createViewer();
  // 本质上就是添加一个点的实体
  return viewer.entities.add({
    position: position,
    point: {
      color: Cesium.Color.ORANGE,
      pixelSize: 5,
      outlineWidth: 3,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 规定贴地
    },
  });
}

function addLabel(midPoint, labelLength) {
  let viewer = createViewer();
  return viewer.entities.add({
    name: '中点',
    position: midPoint,
    label: {
      text: labelLength + 'm',
      font: '20px sans-serif',
      fillColor: Cesium.Color.YELLOWGREEN,
      outlineWidth: 2,
      //backgroundColor: Cesium.Color.ORANGE,
      showBackground: true,
      style: Cesium.LabelStyle.FILL,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });
}

function draw_dynamic_tag() {
  let viewer = createViewer();
  temporary_tag_entity = viewer.entities.add({
    name: '中点',
    position: new Cesium.CallbackProperty(() => {
      return tag_point_cartesian;
    }, false),
    label: {
      text: new Cesium.CallbackProperty(() => {
        return tag_content + 'm';
      }, false),
      font: '20px sans-serif',
      fillColor: Cesium.Color.YELLOWGREEN,
      outlineWidth: 2,
      //backgroundColor: Cesium.Color.ORANGE,
      showBackground: true,
      style: Cesium.LabelStyle.FILL,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  });
}
</script>

<style scoped>
.icon-center {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 1.5px 0;
}
.icon-center img {
  width: 16px;
  height: 16px;
  object-fit: cover;
}
</style>
