<template>
  <div class="geofence" :style="{height: height}">
    <div class="toolbar">
      <el-radio-group v-model="curEditAim" class="aim-tab" @change="onEditAimChange">
        <el-radio-button label="polygon" v-if="editForAims.includes(EditAimType.Polygon)">围栏</el-radio-button>
        <el-radio-button label="pathline" v-if="editForAims.includes(EditAimType.PathLine)">匝道</el-radio-button>
      </el-radio-group>
      <el-button-group class="ml-4">
        <el-tooltip placement="top" content="撤销">
          <el-button :icon="RefreshLeft" :disabled="undoDescList.length === 0" @click="toolbar.undo()"></el-button>
        </el-tooltip>
        <el-tooltip placement="top" content="恢复">
          <el-button :icon="RefreshRight" :disabled="redoDescList.length === 0" @click="toolbar.redo()"></el-button>
        </el-tooltip>
        <el-tooltip placement="top" content="回到站心">
          <el-button :icon="Aim" :disabled="locationPointString === ''" @click="toolbar.toCenter(locationPointString)"></el-button>
        </el-tooltip>        
        <el-tooltip placement="top" content="删除选择点，或删除最后一个放置的点（Delete）">
          <el-button :icon="Delete" :disabled="pointNum === 0" @click="toolbar.deletePoint()"></el-button>
        </el-tooltip>
        <el-tooltip placement="top" content="将当前多个点形成闭合区域（右键）" v-if="curEditAim === 'polygon'">
          <el-button :icon="Notification" :disabled="pointNum <= 2" @click="toolbar.makePolygon()"></el-button>
        </el-tooltip>
        <el-tooltip placement="top" content="复制目标的WKT字符串">
          <el-button :icon="CopyDocument" :disabled="aimPolygonStatus !== AimEditStatus.SUCCESS" @click="toolbar.copyWKTString()"></el-button>
        </el-tooltip>  
      </el-button-group>
      <el-tooltip placement="top" :content="statusContent">
        <el-button :icon="getStatusIcon(aimPolygonStatus)" class="check-status" :type="getStatusButtonType(aimPolygonStatus)"></el-button>
      </el-tooltip> 
    </div>
    <div id="cesium-container"></div>
  </div>  
</template>

<script setup lang="ts">
import { nioMap } from "./initMap";
import { nextTick, onMounted, onUnmounted, ref, markRaw, watch } from 'vue';
import { defined, ScreenSpaceEventHandler, ScreenSpaceEventType, Cartesian3, Entity, Viewer, JulianDate, ConstantPositionProperty } from "cesium";
import { ElMessage } from "element-plus";
import { EditAimType, MapController, PathLineCollect, RelaGeofence, RelaGeofenceStore } from "./MapController";
import { CommandHistory, OperateType } from "./commands";
import { Notification, Aim, CopyDocument, RefreshRight, RefreshLeft, EditPen, Check, Delete, WarnTriangleFilled } from "@element-plus/icons-vue";
import { convertToLatLng } from "./commons";
import { ToolbarController } from "./ToolbarController";

interface Props {
  editForAims: EditAimType[];
  locationPointString: string;
  relaGeofences: RelaGeofence[];
  height: number | string;
  wtkStrPolygon: string | undefined | null;
  wtkStrPathLine: string | undefined | null;
}

const props = withDefaults(defineProps<Props>(), {
  editForAims: () => ["polygon"] as EditAimType[], // "polygon", "pathline"
  locationPointString: '',
  relaGeofences: () => [] as RelaGeofence[],
  height: '100vh',
  wtkStrPolygon: null,
  wtkStrPathLine: null
});

interface Lng_Lat {
  lat: number;
  lng: number;
}

enum AimEditStatus {
  NOT_EXIST,
  SUCCESS,
  NOT_COMPLETE,
  ERROR
}

const emit = defineEmits();

let viewer: Viewer | null = null; //地图viewer
let handler: ScreenSpaceEventHandler | null = null; //地图事件处理

let commandHistory = new CommandHistory();  //操作历史
let mapCtrl: MapController | null = null; //地图控制
let toolbar = null; //操作

let center: Lng_Lat | null = null;
let centerPoint: Entity | null = null;
let relaGeofences: RelaGeofenceStore[] = [];
let curEditAim = ref('' as EditAimType);  //当前编辑状态
let pointNum = ref(0);  //点的数量
let aimPolygonStatus = ref(AimEditStatus.NOT_EXIST);
let statusContent = ref('请创建一个地理围栏');
let polygonWKTString = ref(''); //当前wkt字符串
let pathLineWKTString = ref(''); //当前wkt字符串
let undoDescList = ref([]);
let redoDescList = ref([]);

//站心更改
watch(() => props.locationPointString, (newValue, ) => {
  if (centerPoint === null || !centerPoint.point) {
    return;
  }
  center = convertToLatLng(newValue);
  if (!center) {
    return;
  }
  centerPoint.position = new ConstantPositionProperty(Cartesian3.fromDegrees(center.lng, center.lat, 0.0));
  mapCtrl.render();
});

watch(() => props.relaGeofences, (newValue, ) => {
  if (!newValue || !newValue.map) {
    return;
  }
  mapCtrl.clearRelaGeoFences(relaGeofences);
  mapCtrl.drawRelaGeofences(newValue);
  mapCtrl.render();
});

function onEditAimChange(editAim) {
  mapCtrl.setCurEditAim(editAim);
}

function getStatusIcon(status: AimEditStatus) {
  if (status === AimEditStatus.SUCCESS) {
    return Check;
  } else if (status === AimEditStatus.ERROR) {
    return WarnTriangleFilled;
  } else {
    return EditPen;
  }
}
function getStatusButtonType(status: AimEditStatus) : ("" | "success" | "warning" | "primary" | "danger") {
  if (status === AimEditStatus.SUCCESS) {
    return 'primary';
  } else if (status === AimEditStatus.ERROR) {
    return 'danger';
  } else {
    return '';
  }
}
function setEditStatusContent(status: AimEditStatus, errorMsg?: string) {
  aimPolygonStatus.value = status;
  if (status === AimEditStatus.SUCCESS) {
    statusContent.value = '已创建合法地理围栏';
  } else if (status === AimEditStatus.ERROR) {
    statusContent.value = errorMsg;
  } else if (status === AimEditStatus.NOT_COMPLETE) {
    statusContent.value = errorMsg;
  } else {
    statusContent.value = '请创建一个地理围栏';
  }
}

function handlerAimPolygonChange(aimPolygon: Entity | undefined) {
  if (aimPolygon !== undefined) {
    const result = mapCtrl.checkPolygonVaild(aimPolygon);
    if (!result.isSuccess) {
      polygonWKTString.value = '';
      setEditStatusContent(AimEditStatus.ERROR, result.errMsg);
    } else {
      polygonWKTString.value = mapCtrl.getAimPolygonWkt();
      if (props.editForAims.includes(EditAimType.PathLine) && pathLineWKTString.value === '') {
        setEditStatusContent(AimEditStatus.NOT_COMPLETE, '匝道还未成功绘制');
      } else {
        setEditStatusContent(AimEditStatus.SUCCESS);
      }
    }      
  } else {
    polygonWKTString.value = '';
    setEditStatusContent(AimEditStatus.NOT_EXIST);
  }

  emit('wktPolygonChange', polygonWKTString.value);
}

function handlerAimPathLineChange(aimLines: Entity[] | undefined) {
  if (aimLines !== undefined) {
    const result = mapCtrl.checkPathLineVaild(aimLines);
    if (!result.isSuccess) {
      pathLineWKTString.value = '';
      setEditStatusContent(AimEditStatus.ERROR, result.errMsg);
    } else {
      pathLineWKTString.value = mapCtrl.getAimPathLineWkt();
      if (props.editForAims.includes(EditAimType.Polygon) && polygonWKTString.value === '') {
        setEditStatusContent(AimEditStatus.NOT_COMPLETE, '围栏区域还未成功绘制');
      } else {
        setEditStatusContent(AimEditStatus.SUCCESS);
      }
    }
    pathLineWKTString.value = mapCtrl.getAimPathLineWkt();
  } else {
    pathLineWKTString.value = '';
    setEditStatusContent(AimEditStatus.NOT_EXIST);
  }
  emit('wktPathLineChange', pathLineWKTString.value);
}

function main() {
  if (!viewer || viewer.isDestroyed()) {
    return;
  }

  mapCtrl = markRaw(new MapController(viewer));
  toolbar = markRaw(new ToolbarController(commandHistory, mapCtrl));

  if (props.editForAims.length > 0) {
    curEditAim.value = props.editForAims[0];
    mapCtrl.setCurEditAim(curEditAim.value);
  }

  //绘制站心
  centerPoint = mapCtrl.drawCenterPoint(Cartesian3.fromDegrees(center.lng, center.lat, 0.0));

  //形成或取消多边形区域事件处理
  mapCtrl.addChangeAimPolygonEvent(handlerAimPolygonChange);
  //形成或取消路径线事件处理
  mapCtrl.addChangeAimPathLineEvent(handlerAimPathLineChange);

  mapCtrl.addChangePointsEvent((optType: string) => {
    pointNum.value = mapCtrl.getPoints().length;
  });

  //将wkt绘制到地图上
  if (props.wtkStrPolygon !== null && props.wtkStrPolygon != ''){
    mapCtrl.WKTToViewer(props.wtkStrPolygon);
  }
  if (props.wtkStrPathLine !== null && props.wtkStrPathLine != ''){
    mapCtrl.WKTToViewer(props.wtkStrPathLine);
  }

  //绘制周围多边形和站心
  relaGeofences = mapCtrl.drawRelaGeofences(props.relaGeofences);

  commandHistory.addCommandRunEvent((optType: OperateType) => {
    undoDescList.value = commandHistory.getUndoStackDescs();
    redoDescList.value = commandHistory.getRedoStackDescs();
  });

  //添加用户操作处理
  handleUserOperation();
}

const handlerUserKeyup = (event) => {
  if (toolbar === null) {
    return;
  }
  const keyName = event.key;
  if (keyName === 'Delete') { //删除按钮
    toolbar.deletePoint();
  } else if (keyName === 'Escape') {
    toolbar.unselected();
  }
}

//添加用户操作处理
function handleUserOperation() {
  handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
  //左键点击
  handler.setInputAction((click: any) => {
    //移动时取消点击影响
    if (mapCtrl.mouseHoldEntity || viewer === null) {
      return;
    }

    if (mapCtrl.userOptions.bCanChoosePoint) {
      //选择一个点
      const pickedObject = viewer?.scene.pick(click.position);
      if (defined(pickedObject) && defined(pickedObject.id) && pickedObject.id.point) {
        mapCtrl.selectedEntity = pickedObject.id;
        mapCtrl.resetPointsStyle(); //重新设置选择样式
        mapCtrl.render();
        return;
      }
    }
    
    //放置点
    let cartesian = mapCtrl.getPick(click.position)
    if (defined(cartesian)) {
      toolbar.addPoint(cartesian);
    }
  }, ScreenSpaceEventType.LEFT_CLICK);

  //左键按下
  handler.setInputAction((click: any) => {
    //选择要拖动的点
    const pickedObject = viewer?.scene.pick(click.position);
    if (defined(pickedObject) && defined(pickedObject.id) && pickedObject.id.point) {
      if (!mapCtrl.findPoint(pickedObject.id.id)) {
        return;
      }
      mapCtrl.mouseHoldEntity = pickedObject.id;
      mapCtrl.moveBeforeCartesian = mapCtrl.getPositionByPoint(mapCtrl.mouseHoldEntity);
      mapCtrl.disableMapMove();//禁止地图移动
    }
  }, ScreenSpaceEventType.LEFT_DOWN);

  //鼠标移动
  handler.setInputAction((movement: any) => {
    //是否有要拖动的目标
    if (mapCtrl.mouseHoldEntity) {
      let cartesian = mapCtrl.getPick(movement.endPosition);
      if (!defined(cartesian)) {
        return;
      }
      mapCtrl.movePoint(mapCtrl.mouseHoldEntity, cartesian);
      mapCtrl.render();
    } else {
      //如果没有拖动，则可示意用户点可选择
      const pickedObject = viewer?.scene.pick(movement.endPosition);
      if (defined(pickedObject) && defined(pickedObject.id) && pickedObject.id.point) {
        if (!mapCtrl.mouseInPoint) {  //减少重复重置所有点的样式
          mapCtrl.resetPointsStyle(pickedObject.id, 'Hover');
          mapCtrl.mouseInPoint = true;
        }
      } else if (mapCtrl.mouseInPoint) { //说明已经没有hover状态的点了，重制点样式
        mapCtrl.mouseInPoint = false;
        mapCtrl.resetPointsStyle();
      }
    }
  }, ScreenSpaceEventType.MOUSE_MOVE);

  //左键抬起
  handler.setInputAction(() => {
    //拖动完成，因为有mouseInPoint，所有不需要重置样式
    if (mapCtrl.mouseHoldEntity) {
      mapCtrl.disableMapMove(false);
      
      //执行移动命令，主要为了保存移动前后数据，以便撤销
      toolbar.movePoint(mapCtrl.getPositionByPoint(mapCtrl.mouseHoldEntity));

      mapCtrl.mouseHoldEntity = null; // 释放点
    }
  }, ScreenSpaceEventType.LEFT_UP);

  //右键按下
  handler.setInputAction(() => {
    //根据点的次序，绘制多边形区域
    if (mapCtrl.getPoints().length >= 3) {
      toolbar.makePolygon();
    }
  }, ScreenSpaceEventType.RIGHT_CLICK);

  //处理键盘事件
  document.addEventListener('keyup', handlerUserKeyup);
}

onMounted(() => {
  center = convertToLatLng(props.locationPointString);
  if (!center) {
    ElMessage.error({
      message: '中心经纬度格式错误',
    });
    return;
  }
  
  viewer = nioMap.createViewer("cesium-container", Cartesian3.fromDegrees(center.lng, center.lat, 500.0));

  nextTick(main);

  onUnmounted(() => {
    mapCtrl = null;
    toolbar = null;
    commandHistory = null;

    if (handler) {
      handler.destroy();
      handler = null;
    }
    if (viewer) {
      viewer.destroy();
      viewer = null;
    }
    nioMap.destroy();

    document.removeEventListener('keyup', handlerUserKeyup);
  });
});

</script>
<style scoped>
.aim-tab{
  margin-right: 10px;
  display: inline-block;
  vertical-align: middle;
}
.check-status{
  float: right;
}
.geofence{
  width: 100%;
  display: flex;
  flex-direction: column;
}
.geofence .toolbar{
  width: 100%;
  min-height: 50px;
}
</style>
<style>
/* 一定是全局的，控制canvas高度。不控制，内存暴涨，canvas的height暴增 */
#cesium-container{
  flex-grow: 1;
  overflow-y: auto; 
}
</style>