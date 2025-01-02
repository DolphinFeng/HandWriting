import {Cartesian2, Cartesian3} from 'cesium';
import axios from 'axios';
import {NioGeoPoint, NioPoint} from '../../model/point.ts';
import {NioMessage} from '../../utils/utils.js';
import {reactive} from 'vue';
import {CrossRouteInfo} from './cross-material.ts';
import {refreshCrossRouteLines} from './cross-route-line.js';
import {ref} from 'vue';
import {annotationMap} from './cross-anno-data.ts';
import {actionParamMap, panelNames, RegisterFunc} from '../../system/view-restore.ts';
import {watch} from 'vue';

export const infoLoading = ref(false);

export const crossInfoPanel = reactive({
  visible: false,
  left: -1,
  top: -1,
  crossId: {id: '100', projectId: '10068', typeName: 'crossPoint'},
  modelSnapshotNum: 0,
  inferenceSnapshotNum: 0,
  fusionSnapshotNum: 0,
});

watch(crossInfoPanel, (newVal) => {
  if (newVal.visible === false) {
    actionParamMap.set(panelNames.sCrossInfo, []);
    actionParamMap.set(panelNames.cCrossInfo, []);

    actionParamMap.set(panelNames.sCrossResume, []);
    actionParamMap.set(panelNames.cCrossResume, []);

    actionParamMap.set(panelNames.sCrossModelResume, []);
    actionParamMap.set(panelNames.cCrossModelResume, []);

    actionParamMap.set(panelNames.sCrossInferResume, []);
    actionParamMap.set(panelNames.cCrossInferResume, []);

    actionParamMap.set(panelNames.sCrossFusionResume, []);
    actionParamMap.set(panelNames.cCrossFusionResume, []);
  }
});

export const routeInfosPanel = reactive<CrossRouteInfo[]>([]);

export function clearRouteInfosPanel() {
  routeInfosPanel.splice(0, routeInfosPanel.length);
}

/**
 * @param {[x, y]} v 原始向量
 * @param {number} rad 旋转弧度
 * @return {[x, y]} 旋转后的新向量
 */
function rotate(x: number, y: number, rad: number) {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  //const [x, y] = v;

  return new NioPoint(x * c + y * -s, x * s + y * c);
}

function Deg2Rad(deg) {
  return (deg / 180.0) * Math.PI;
}

function drawRoundRect(ctx, x, y, w, h, r) {
  if (w < 2 * r) {
    r = w / 2;
  }
  if (h < 2 * r) {
    r = h / 2;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.fill();
  ctx.closePath();
}

export let crossPanelCallback: Array<(param: any) => {}> = [];

RegisterFunc(openCrossInfoPanel);
/**
 * 打开路口信息面板，面板的统一控制接口
 * @param crossId 路口id
 */
export function openCrossInfoPanel(crossId) {
  actionParamMap.set(panelNames.sCrossInfo, [[openCrossInfoPanel.name, [crossId]]]);

  for (let callback of crossPanelCallback) {
    callback(crossId);
  }
}

export async function loadCrossSummaryInfo(crossId) {
  try {
    //@ts-ignore
    let response = await axios.post(window.api.markPlatformUrl + '/pt/mark/getCrossSummaryInfoByCrossId', {
      crossId: crossId.id,
      projectId: crossId.projectId,
    });
    if (response.data.code != 200) {
      NioMessage('error', response.data.message);
      return;
    }

    crossInfoPanel.fusionSnapshotNum = response.data.data.fusionSnapshotNum ? response.data.data.fusionSnapshotNum : 0;
    crossInfoPanel.inferenceSnapshotNum = response.data.data.inferenceSnapshotNum
      ? response.data.data.inferenceSnapshotNum
      : 0;
    crossInfoPanel.modelSnapshotNum = response.data.data.modelSnapshotNum ? response.data.data.modelSnapshotNum : 0;
  } catch (error) {
    console.error(error);
    NioMessage('error', error);
  }
}

export async function loadRouteInfosPanel(crossId) {
  routeInfosPanel.splice(0, routeInfosPanel.length);
  try {
    //@ts-ignore
    let response = await axios.post(window.api.markPlatformUrl + '/pt/mark/getPathListByCrossId', {
      crossId: crossId,
    });

    if (response.data.code != 200) {
      NioMessage('error', '履历加载失败', 2000);
      return;
    }

    for (let record of response.data.data) {
      let crossRouteInfo = record as CrossRouteInfo;
      crossRouteInfo.points = [];
      let geojson = crossRouteInfo.routeLine;
      let feature = JSON.parse(geojson);

      let points: any = [];
      for (let coordinate of feature.coordinates) {
        points.push(new NioGeoPoint(coordinate[0], coordinate[1]));
      }

      crossRouteInfo.points = points;
      crossRouteInfo.annotated = false;
      crossRouteInfo.annotation = '';
      routeInfosPanel.push(crossRouteInfo);
    }

    if (annotationMap.crossId == crossId) {
      //深拷贝
      annotationMap.routeInfosPanelBak = JSON.parse(JSON.stringify(routeInfosPanel));
    }

    refreshCrossRouteLines(routeInfosPanel, undefined);
  } catch (error) {
    console.error(error);
  }
}

export function drawCrossThumbnail(
  index: number,
  crossRouteInfo: CrossRouteInfo,
  canvasElementId: string,
  canvasWidth: number,
  canvasHeight: number,
  borderRadius: number,
) {
  let pts = crossRouteInfo.points;
  if (pts.length == 0) {
    return;
  }

  //先统计范围
  let left = pts[0].lon;
  let right = pts[0].lon;

  let top = pts[0].lat;
  let bottom = pts[0].lat;

  for (let i = 0; i < pts.length; i++) {
    if (pts[i].lon < left) {
      left = pts[i].lon;
    }

    if (pts[i].lon > right) {
      right = pts[i].lon;
    }

    if (pts[i].lat > top) {
      top = pts[i].lat;
    }

    if (pts[i].lat < bottom) {
      bottom = pts[i].lat;
    }
  }

  let realWidth = right - left;
  let realHeight = top - bottom;

  const canvas = document.getElementById(canvasElementId) as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  if (ctx == null) {
    return;
  }

  if (canvasWidth && canvasHeight) {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  }

  canvasWidth = canvas.width;
  canvasHeight = canvas.height;

  ctx.fillStyle = 'black';
  //ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  drawRoundRect(ctx, 0, 0, canvasWidth, canvasHeight, borderRadius);

  //绘制序号
  if (index != undefined) {
    ctx.beginPath();
    ctx.fillStyle = 'yellow'; // 设置填充画笔颜色为红色，即字体颜色
    ctx.font = '16px serif'; // 设置字体大小
    ctx.fillText(index + 1 + '', 10, 20); // 绘制 "实心" 文字
    ctx.closePath();
  }

  //坐标转换
  //绘制范围离边框的距离比例
  let marginPercent = 0.8;

  let scale = 1.0;
  //计算是按照横向还是纵向计算比例范围
  if (canvasWidth / canvasHeight > realWidth / realHeight) {
    scale = realHeight / (canvasHeight * marginPercent);
  } else {
    scale = realWidth / (canvasWidth * marginPercent);
  }

  let realCenterX = (left + right) * 0.5;
  let realCenterY = (top + bottom) * 0.5;

  let pixelCenterX = canvasWidth * 0.5;
  let pixelCenterY = canvasHeight * 0.5;

  ctx.strokeStyle = '#F2A440';
  ctx.beginPath();

  let pixelPts: NioPoint[] = [];

  for (let i = 0; i < pts.length; i++) {
    let pt = pts[i];
    let u = (pt.lon - realCenterX) / scale + pixelCenterX;
    let v = pixelCenterY - (pt.lat - realCenterY) / scale;

    pixelPts.push(new NioPoint(u, v));

    if (i == 0) {
      ctx.moveTo(u, v);
    } else {
      ctx.lineTo(u, v);
    }
  }

  ctx.stroke();
  ctx.fillStyle = '#F2A440';

  let distanceCur = 0.0;

  //绘制箭头
  let arrowWidth = 10;
  for (let i = 1; i < pixelPts.length; i++) {
    let pre = pixelPts[i - 1];
    let cur = pixelPts[i];

    //防止箭头过密
    let distance = (cur.x - pre.x) * (cur.x - pre.x) + (cur.y - pre.y) * (cur.y - pre.y);
    distanceCur += distance;
    if (distanceCur < 200) {
      continue;
    }

    distanceCur = 0.0;

    ctx.beginPath();
    ctx.moveTo(cur.x, cur.y);

    let x = cur.x - pre.x;
    let y = cur.y - pre.y;

    let aux1 = new Cartesian2(x, y);
    let nor = new Cartesian2();
    Cartesian2.normalize(aux1, nor);

    let rotated1 = rotate(nor.x, nor.y, Deg2Rad(160));
    let rotated2 = rotate(nor.x, nor.y, Deg2Rad(200));

    //如果点的距离小于arrowWidth，则使用点的距离
    let dis = Cartesian2.distance(aux1, new Cartesian2(0, 0));
    if (dis > arrowWidth) {
      dis = arrowWidth;
    }

    let res1 = new NioPoint(cur.x + rotated1.x * dis, cur.y + rotated1.y * dis);
    let res2 = new NioPoint(cur.x + rotated2.x * dis, cur.y + rotated2.y * dis);

    ctx.lineTo(res1.x, res1.y);
    ctx.lineTo(res2.x, res2.y);

    ctx.fill();
    ctx.closePath();
  }
}
