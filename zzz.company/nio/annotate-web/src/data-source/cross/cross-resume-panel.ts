import {renderPrimitiveManager} from './../../model/render-primitive.ts';
import {NioFeature} from '../../model/feature.ts';
import {NioGeoPoint} from '../../model/point.ts';
import {reactive, ref} from 'vue';
import axios from 'axios';
import preCache from '../../system/pre-cache.js';
import {CROSS_RESUME_TYPE} from './cross-material.ts';
import {nioCamera, NioMessage} from '../../utils/utils.js';
import {createViewer} from '../../cesium/create-viewer.js';

import {trajPicLines, setPointActive, refreshTrajectoryLines} from './cross-traj-line.ts';
import {Cartesian3, Math, HeadingPitchRange} from 'cesium';
import {crossInfoPanel, routeInfosPanel} from './cross-info-panel.ts';
import {refreshPointCloudPicture} from './cross-point-cloud-pic.ts';
import {refreshCrossRouteLines} from './cross-route-line.ts';
import {annotationMap} from './cross-anno-data.ts';
import {annotationPanelData, getCrossLabelType} from './cross-annotation-panel.ts';
import {videoPanelVisible, videoData} from '../../views/video-panel.ts';
import {actionParamMap, panelNames, RegisterFunc} from '../../system/view-restore.ts';
import {watch} from 'vue';

export const cameraPos = ref(0);
export const crossResumeVisible = ref(false);
export const currentInfoIndex = ref(-1);

watch(crossResumeVisible, (newVal) => {
  if (newVal === false) {
    actionParamMap.set(panelNames.sCrossResume, []);
    actionParamMap.set(panelNames.cCrossResume, []);
  }
});

interface CrossResumeRecord {
  id: number;
  time: string;
  type: CROSS_RESUME_TYPE;
  desc: string;
  text: string;
  uuidList: {
    show: boolean;
    id: string;
    featureId: number;
    loading: boolean;
  }[];
}

export const crossResumePanel = reactive<{
  left: number;
  top: number;
  list: CrossResumeRecord[];
  loading: boolean;
  currentRouteId: number | null;
}>({
  left: -1,
  top: -1,
  list: [],
  loading: false,
  currentRouteId: null,
});

export const isTrajChecked = ref(false);
export const isPcGrayPicChecked = ref(false);
export const isPcRgbPicChecked = ref(false);

function refreshAnnotationPanel() {
  if (annotationMap.annotation.has(currentInfoIndex.value)) {
    annotationPanelData.visible = true;
    annotationPanelData.labelValue = annotationMap.annotation.get(currentInfoIndex.value);
    annotationPanelData.labelType = getCrossLabelType(annotationPanelData.labelValue);
  } else {
    annotationPanelData.visible = false;
  }
}

RegisterFunc(clickSnapShot);
export async function clickSnapShot(id) {
  actionParamMap.set(panelNames.sCrossResume, [[clickSnapShot.name, [id]]]);

  currentInfoIndex.value = id;
  isPcGrayPicChecked.value = false;
  isPcRgbPicChecked.value = false;
  refreshPointCloudPicture(null, false);
  await refreshResumePanel(id);
}

export function createActionParamCrossResume() {
  if (isTrajChecked.value == true && trajIndex.value != -1) {
    actionParamMap
      .get(panelNames.cCrossResume)
      .push([showTrajectory.name, [crossResumePanel.list[trajIndex.value].id, trajIndex.value]]);
  }

  if (isPcGrayPicChecked.value == true && pcGrayPicIndex.value != -1) {
    actionParamMap
      .get(panelNames.cCrossResume)
      .push([showPointCloudGrayPic.name, [crossResumePanel.list[pcGrayPicIndex.value].id, pcGrayPicIndex.value]]);
  }

  if (isPcRgbPicChecked.value == true && pcRgbPicIndex.value != -1) {
    actionParamMap
      .get(panelNames.cCrossResume)
      .push([showPointCloudRGBPic.name, [crossResumePanel.list[pcRgbPicIndex.value].id, pcRgbPicIndex.value]]);
  }

  for (let item of crossResumePanel.list) {
    for (let i = 0; i < item.uuidList.length; i++) {
      let subItem = item.uuidList[i];
      if (subItem.show) {
        actionParamMap.get(panelNames.cCrossResume).push([showMaterialTrajectory.name, [item.id, subItem.id, i]]);
      }
    }
  }
}

export async function openNextRoute() {
  if (!crossInfoPanel.visible) {
    return;
  }

  if (routeInfosPanel.length == 0) {
    return;
  }

  if (currentInfoIndex.value == -1) {
    currentInfoIndex.value = routeInfosPanel[0].routeId;
    refreshCrossRouteLines(routeInfosPanel, currentInfoIndex.value);
    refreshAnnotationPanel();
    if (await refreshResumePanel(currentInfoIndex.value)) {
      openLatestPCD();
    }
  } else {
    let findIndex = -1;
    for (let i = 0; i < routeInfosPanel.length; i++) {
      if (routeInfosPanel[i].routeId == currentInfoIndex.value) {
        findIndex = i;
        break;
      }
    }

    if (findIndex != -1 && findIndex + 1 < routeInfosPanel.length) {
      currentInfoIndex.value = routeInfosPanel[findIndex + 1].routeId;
      refreshCrossRouteLines(routeInfosPanel, currentInfoIndex.value);
      refreshAnnotationPanel();
      if (await refreshResumePanel(currentInfoIndex.value)) {
        openLatestPCD();
      }
    }
  }
}

export async function openPrevRoute() {
  if (!crossInfoPanel.visible) {
    return;
  }

  if (routeInfosPanel.length == 0) {
    return;
  }

  if (currentInfoIndex.value == -1) {
    currentInfoIndex.value = routeInfosPanel[routeInfosPanel.length - 1].routeId;
    refreshCrossRouteLines(routeInfosPanel, currentInfoIndex.value);
    refreshAnnotationPanel();
    if (await refreshResumePanel(currentInfoIndex.value)) {
      openLatestPCD();
    }
  } else {
    let findIndex = -1;
    for (let i = 0; i < routeInfosPanel.length; i++) {
      if (routeInfosPanel[i].routeId == currentInfoIndex.value) {
        findIndex = i;
        break;
      }
    }

    if (findIndex != -1 && findIndex - 1 >= 0) {
      currentInfoIndex.value = routeInfosPanel[findIndex - 1].routeId;
      refreshCrossRouteLines(routeInfosPanel, currentInfoIndex.value);
      refreshAnnotationPanel();
      if (await refreshResumePanel(currentInfoIndex.value)) {
        openLatestPCD();
      }
    }
  }
}

function openLatestPCD() {
  if (crossResumeVisible.value == false) {
    return;
  }

  //查找最新的pcd
  let latestIndex: any = null;
  for (let i = 0; i < crossResumePanel.list.length; i++) {
    if (crossResumePanel.list[i].type == CROSS_RESUME_TYPE.MAPPING) {
      latestIndex = i;
      break;
    }
  }

  if (latestIndex) {
    showPointCloudGrayPic(crossResumePanel.list[latestIndex].id, latestIndex, true);
  } else {
    showPointCloudGrayPic(-1, -1, undefined);
  }
}

RegisterFunc(showPointCloudRGBPic);
export async function showPointCloudRGBPic(id, index) {
  //先清空
  refreshPointCloudPicture(null, false);

  if (pcRgbPicIndex.value == index) {
    isPcRgbPicChecked.value = !isPcRgbPicChecked.value;
  } else {
    isPcRgbPicChecked.value = true;
  }
  if (isPcRgbPicChecked.value == true) {
    isPcGrayPicChecked.value = false;
  }
  pcRgbPicIndex.value = index;

  try {
    //@ts-ignore
    let response = await axios.post(window.api.markPlatformUrl + '/pt/mark/getResource', {
      id: id,
    });

    if (response.data.code != 200) {
      throw 'failed';
    }

    let param: any = {};
    param.width = response.data.data.posInfo.width;
    param.height = response.data.data.posInfo.height;
    param.offsetX = response.data.data.posInfo.offsetX;
    param.offsetY = response.data.data.posInfo.offsetY;
    param.scaleX = response.data.data.posInfo.scaleX;
    param.scaleY = response.data.data.posInfo.scaleY;
    param.refLon = response.data.data.posInfo.refLon;
    param.refLat = response.data.data.posInfo.refLat;
    param.refHeight = response.data.data.posInfo.refHeight;
    param.img = response.data.data.visionUrl;

    if (param.img == '') {
      NioMessage('success', '没有点云数据');
      isPcRgbPicChecked.value = false;
      return;
    }

    refreshPointCloudPicture(param, isPcRgbPicChecked.value);
  } catch (error) {
    console.log(error);
    NioMessage('error', error);
  }
}

RegisterFunc(showTrajectory);
export function showTrajectory(id, index) {
  if (trajIndex.value == index) {
    isTrajChecked.value = !isTrajChecked.value;
  } else {
    isTrajChecked.value = true;
  }

  trajIndex.value = index;
  // isTrajChecked.value = !isTrajChecked.value;
  refreshTrajectoryLines(id, isTrajChecked.value);
}

RegisterFunc(showMaterialTrajectory);
export async function showMaterialTrajectory(itemId: number, subItemId: string, index: number) {
  let item: {show: boolean; id: string; featureId: number; loading: boolean} | undefined;
  for (let record of crossResumePanel.list) {
    if (record.id == itemId) {
      for (let subRecord of record.uuidList) {
        if (subRecord.id == subItemId) {
          item = subRecord;
          break;
        }
      }
    }
  }

  if (!item) {
    return;
  }
  if (item.loading) {
    return;
  }

  item.show = !item.show;
  if (item.show) {
    item.loading = true;
    try {
      //@ts-ignore
      let response = await axios.post(window.api.markPlatformUrl + '/pt/mark/getCollectResource', {
        id: item.id,
      });

      if (response.data.code != 200) {
        NioMessage('error', 'getCollectResource失败', 2000);
        return false;
      }

      if (response.data.data && response.data.data.path) {
        let pts: [] = response.data.data.path;
        let feature: NioFeature = NioFeature.fromPoints(
          pts.map((item) => {
            return new NioGeoPoint(parseFloat(item[0]), parseFloat(item[1]));
          }),
        );

        renderPrimitiveManager.addArrowLinePrimitive(feature);
        item.featureId = feature.id;
      } else {
        //item.show = false;  会闪，加个延时
        setTimeout(() => {
          if (item) item.show = false;
        }, 1000);
        NioMessage('warning', '当前轨迹数据为空，请切换其他轨迹');
      }
    } catch (error) {
      NioMessage('error', error, 2000);
    } finally {
      item.loading = false;
    }
  } else {
    renderPrimitiveManager.removePrimitive(item.featureId);
  }
}

export function clearMaterialTraj() {
  for (let item of crossResumePanel.list) {
    for (let uuid of item.uuidList) {
      renderPrimitiveManager.removePrimitive(uuid.featureId);
    }
  }

  crossResumePanel.list = [];
}

let materialVideoId = '';

RegisterFunc(showMaterialVideo);
export async function showMaterialVideo(id: string, index: number) {
  try {
    videoData.loading = true;
    videoData.curIdx = 0;
    videoData.total = 0;
    videoData.video = [{url: ''}];
    materialVideoId = id;
    videoPanelVisible.value = true;
    //@ts-ignore
    let response = await axios.post(window.api.markPlatformUrl + '/pt/mark/getCollectResource', {
      id: id,
    });

    if (response.data.code != 200) {
      NioMessage('error', 'getCollectResource失败', 2000);
      return false;
    }

    if (!response.data.data) {
      NioMessage('warning', '当前视频数据为空，请切换其他轨迹');
      return false;
    }

    //加一个验证，判断当前加载完毕的id是不是最新点击要加载的id。防止上面接口响应时间不同造成的播放顺序问题
    if (id != materialVideoId) {
      return;
    }

    let videoUrl: string = response.data.data.videoUrl;
    videoData.curIdx = 0;
    videoData.total = 1;
    videoData.video = [{url: videoUrl}];

    //添加动态效果
    if (response.data.data.path) {
      let pts: [] = response.data.data.path;
      let feature: NioFeature = NioFeature.fromPoints(
        pts.map((item) => {
          return new NioGeoPoint(parseFloat(item[0]), parseFloat(item[1]));
        }),
      );
      renderPrimitiveManager.setAnimatedLinePrimitive(feature);
    }
  } catch (error) {
    console.log(error);
    NioMessage('error', error);
  } finally {
    videoData.loading = false;
  }
}

export function switchLastestTraj() {
  if (crossResumeVisible.value == false) {
    return;
  }
  for (let i = 0; i < crossResumePanel.list.length; i++) {
    if (crossResumePanel.list[i].type == CROSS_RESUME_TYPE.MAPPING) {
      showTrajectory(crossResumePanel.list[i].id, i);
      break;
    }
  }
}

export function switchLatestGrayPcd() {
  if (crossResumeVisible.value == false) {
    return;
  }
  //查找最新的pcd
  for (let i = 0; i < crossResumePanel.list.length; i++) {
    if (crossResumePanel.list[i].type == CROSS_RESUME_TYPE.MAPPING) {
      showPointCloudGrayPic(crossResumePanel.list[i].id, i, undefined);
      break;
    }
  }
}

export function switchLatestRGBPcd() {
  if (crossResumeVisible.value == false) {
    return;
  }
  for (let i = 0; i < crossResumePanel.list.length; i++) {
    if (crossResumePanel.list[i].type == CROSS_RESUME_TYPE.MAPPING) {
      showPointCloudRGBPic(crossResumePanel.list[i].id, i);
      break;
    }
  }
}

export let pcGrayPicIndex = ref(-1);
export let trajIndex = ref(-1);
export let pcRgbPicIndex = ref(-1);

let idBak = -1;

RegisterFunc(showPointCloudGrayPic);
export async function showPointCloudGrayPic(id, index, forceShow: boolean | undefined) {
  idBak = id;
  console.log('idBak: ', idBak);

  //先清空
  refreshPointCloudPicture(null, false);

  if (id == -1) {
    return;
  }

  if (pcGrayPicIndex.value == index) {
    isPcGrayPicChecked.value = !isPcGrayPicChecked.value;
  } else {
    isPcGrayPicChecked.value = true;
  }

  if (forceShow != undefined) {
    isPcGrayPicChecked.value = forceShow;
  }

  if (isPcGrayPicChecked.value == true) {
    isPcRgbPicChecked.value = false;
  }

  pcGrayPicIndex.value = index;

  try {
    //@ts-ignore
    let response = await axios.post(window.api.markPlatformUrl + '/pt/mark/getResource', {
      id: id,
    });

    if (response.data.code != 200) {
      throw 'failed';
    }

    let param: any = {};
    param.width = response.data.data.posInfo.width;
    param.height = response.data.data.posInfo.height;
    param.offsetX = response.data.data.posInfo.offsetX;
    param.offsetY = response.data.data.posInfo.offsetY;
    param.scaleX = response.data.data.posInfo.scaleX;
    param.scaleY = response.data.data.posInfo.scaleY;
    param.refLon = response.data.data.posInfo.refLon;
    param.refLat = response.data.data.posInfo.refLat;
    param.refHeight = response.data.data.posInfo.refHeight;
    param.img = response.data.data.lidarUrl;

    if (param.img == '') {
      NioMessage('success', '没有点云数据');
      isPcGrayPicChecked.value = false;
      return;
    }

    if (id == idBak) {
      console.log('id: ', id);
      refreshPointCloudPicture(null, false);
      refreshPointCloudPicture(param, isPcGrayPicChecked.value);
    }
  } catch (error) {
    console.log(error);
    NioMessage('error', error);
  }
}

export async function refreshResumePanel(id: number) {
  //履历更新了，轨迹要清空
  refreshTrajectoryLines(null, false);
  isTrajChecked.value = false;

  clearMaterialTraj();

  crossResumeVisible.value = true;
  crossResumePanel.loading = true;
  crossResumePanel.list.splice(0);
  try {
    //@ts-ignore
    let response = await axios.post(window.api.markPlatformUrl + '/pt/mark/getMarkPathSnapshot', {
      routeId: id,
    });

    //结束时，如果不是当前id，直接返回。
    //这句很关键，否则切换快的时候会造成履历与信息面板不同步
    if (id != currentInfoIndex.value) {
      return false;
    }

    if (response.data.code != 200) {
      NioMessage('error', '履历加载失败', 2000);
      return false;
    }

    crossResumePanel.list = response.data.data.map((record) => {
      let type = record.type as CROSS_RESUME_TYPE;
      let uuidList = [];
      if (record.uuidList) {
        uuidList = record.uuidList.map((item) => {
          return {
            show: false,
            id: item,
            featureId: 0,
          };
        });
      }

      return {
        id: record.snapshotId,
        time: record.createTime,
        type: type,
        desc: record.resultText ? record.resultText : '',
        text: record.info,
        uuidList: uuidList,
      };
    });
  } catch (error) {
    console.error(error);
  } finally {
    crossResumePanel.loading = false;
  }

  return true;
}

function locationHandler1(pos) {
  //图标定位
  nioCamera.locatePosition({
    position: pos,
    duration: 0,
    animate: true,
    before() {},
    completed() {},
  });
}

function cameraLookAt(center: Cartesian3) {
  //const center = Cesium.Cartesian3.fromDegrees(-72.0, 40.0);
  const heading = Math.toRadians(50.0);
  const pitch = Math.toRadians(-20.0);
  const range = 5000.0;

  let viewer = createViewer();
  viewer.camera.lookAt(center, new HeadingPitchRange(heading, pitch, range));
}

let currentPicIndex = 0;
export const picPositions = [];

export function locateNextPicture() {
  if (picPositions.length == 0) {
    return;
  }

  if (currentPicIndex >= picPositions.length) {
    currentPicIndex = 0;
  }

  let pos: any = picPositions[currentPicIndex];
  currentPicIndex++;
  locationHandler1(Cartesian3.fromDegrees(pos.lon, pos.lat, 800));
  //cameraLookAt(Cartesian3.fromDegrees(pos.lon, pos.lat));
}

export const crossTrajPicPanelVisible = ref(false);

/**
 * 轨迹列表
 */
export const crossTrajPicPanel = reactive({
  loading: false, //是否正在加载
  cur: undefined, //当前轨迹
  list: [
    // {type: '路测资料', time: '2022-09-27', id: ''},
  ],
});

/**
 * 将图片置为空状态，显示空面板
 */
export const imgNull = ref(false);

/**
 *轨迹点列表
 */
export const trajPointData = reactive({
  curIdx: 0,
  imgPath: '',
  position: [],
  time: '',
  total: 0,
});

export let currentTrajPicLineIndex: number = -1;

export function addTrajPicIdxHandler(increment) {
  if (crossTrajPicPanelVisible.value == false) {
    return;
  }

  let trajPicLine = trajPicLines[currentTrajPicLineIndex];
  let curIdx = trajPointData.curIdx,
    newIdx = curIdx + increment,
    total = trajPicLine.points.length;
  if (curIdx === total - 1 && increment > 0) {
    newIdx = increment - 1;
  } else if (curIdx === 0 && increment < 0) {
    newIdx = total + increment;
  } else {
    if (newIdx > total - 1) {
      newIdx = total - 1;
    } else if (newIdx < 0) {
      newIdx = 0;
    }
  }

  trajPointData.curIdx = newIdx;
  doActiveTrajPic(currentTrajPicLineIndex, newIdx);
}

export function refreshTrajPicPanel(i, curPtIndex) {
  currentTrajPicLineIndex = i;
  crossTrajPicPanelVisible.value = true;
  let trajPicLine = trajPicLines[i];

  //默认url不是空。空的不要加进来
  trajPointData.curIdx = curPtIndex;
  //trajPointData.imgPath = currentTrajPicLine.points[curPtIndex].url;
  trajPointData.total = trajPicLine.points.length;

  //cacheImg(i, curPtIndex);
  doActiveTrajPic(i, curPtIndex);
}

/**
 * 浏览器图片预缓存工厂
 */
export const cacheImg = function (i, newIdx) {
  let trajPicLine = trajPicLines[i];
  let list = trajPicLine.points;
  let sIdx = newIdx >= 5 ? newIdx - 5 : newIdx,
    eIdx = newIdx < list.length - 5 ? newIdx + 5 : list.length - 1;
  for (let i = sIdx; i < eIdx; i++) {
    for (let j = 0; j < list[i].url.length; j++) {
      //@ts-ignore
      preCache.download(list[i].url[j]);
    }
  }
};

let bakI: number | undefined;
let bakCurPtIndex: number | undefined;
export function doActiveTrajPic(i, curPtIndex) {
  if (i == undefined || curPtIndex == undefined) {
    i = bakI;
    curPtIndex = bakCurPtIndex;
  }

  let trajPicLine = trajPicLines[i];
  setPointActive(trajPicLine.points[curPtIndex].index);
  cacheImg(i, curPtIndex);

  let imageUrl = trajPicLine.points[curPtIndex].url[cameraPos.value];
  trajPointData.imgPath = imageUrl;

  //trajPointData.position = trajectoryLayer.trajPointList[newIdx].position;
  trajPointData.time = trajPicLine.points[curPtIndex].time;

  //用于保存一下上次加载的信息
  bakI = i;
  bakCurPtIndex = curPtIndex;
}
