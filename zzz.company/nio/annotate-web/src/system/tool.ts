import {
  mouseMoveCallbacks,
  cesiumObjClickCallbacks,
  rightClickCallbacks,
  leftDownCallbacks,
  wheelCallbacks,
  altRightClickCallbacks,
  leftUpCallbacks,
} from './event.js';
import throttle from 'lodash/throttle.js';
import {createViewer} from '../cesium/create-viewer.js';
import {openCrossInfoPanel} from '../data-source/cross/cross-info-panel.ts';
import {refreshTrajPicPanel} from '../data-source/cross/cross-resume-panel.ts';
import {Cartesian2, Cartesian3, Cesium3DTileFeature, PointPrimitiveCollection, ModelFeature} from 'cesium';
import {popupInfo} from '../store/popup.ts';
import {Observer} from '../system/observer.js';
import {getTileLevel} from '../utils/utils.js';
import {openInfoBox} from '../store/info-box.js';
import {decodeCesiumId} from '../utils/utils.js';
import {ref} from 'vue';
import {tasks} from './task-list.ts';
import {BillboardDrag} from './billboard-drag.ts';
import {crossCheckPanelData} from '../data-source/cross/cross-check-panel.ts';
import {CommonLayerName, dataManager} from '../model/feature.ts';
import {billboardManager} from './billboard-manager.ts';
import {getHdSpec} from './tileset-manager.js';
import {loadCrossTileHandler} from '../data-source/cross/cross-material.ts';
import {RenderPrimitiveManager} from '../model/render-primitive.ts';

export const currentToolName = ref('default');

export interface Tool {
  active(): void;

  deactive(): void;

  getName(): string;
}

//组合工具。
export class GroupTool implements Tool {
  constructor(tools: Tool[], name: string) {
    this.#name = name;
    this.tools = tools;
  }

  active(): void {
    for (let tool of this.tools) {
      tool.active();
    }
  }

  deactive(): void {
    for (let tool of this.tools) {
      tool.deactive();
    }
  }

  getName(): string {
    return this.#name;
  }

  #name: string;

  tools: Tool[] = [];
}

export function refreshLineWidth() {
  let viewer = createViewer();
  let width = document.body.clientWidth,
    height = document.body.clientHeight;
  let pos = viewer.camera.pickEllipsoid(new Cartesian2(width / 2, height / 2), viewer.scene.globe.ellipsoid);
  //3d模式下可能会出现pos为undefined的情况
  if (!pos) {
    return;
  }
  let pos2 = viewer.camera.position;
  let distance = Cartesian3.distance(pos, pos2);
  Observer.fire('tileScale', {
    distance: distance,
    tile: getTileLevel(),
  });
}

//wheel时间时会立即调用wheelCallback，调用时camera的位置是缩放前的。
//在相机移动结束后加个回调，此时的相机位置才是准确的
//此回调相应频率低，不会对性能造成明显影响
let viewer = createViewer();
viewer.scene.camera.moveEnd.addEventListener(() => {
  refreshLineWidth();
  loadCrossTileHandler(false);
});

class DefaultTool implements Tool {
  constructor() {}

  active() {
    mouseMoveCallbacks.set(
      'default-mouse-move',
      throttle((ev) => {
        let viewer = createViewer();
        let pick = viewer.scene.pick(ev.endPosition, 10, 10);
        //@ts-ignore
        viewer.container.style.cursor = pick ? 'pointer' : 'default';
      }, 200),
    );

    /**
     * 注册：点击路口回调
     */
    cesiumObjClickCallbacks.set('default-click-cross-point', async (decodedId) => {
      if (decodedId.typeName != 'crossPoint' && decodedId.typeName != 'rampPoint') {
        return;
      }
      openCrossInfoPanel(decodedId);
    });

    /**
     * 注册：点击轨迹点回调
     */
    cesiumObjClickCallbacks.set('default-click-traj-point', (decodedId) => {
      if (decodedId.typeName != 'trajPoint') {
        return;
      }

      let tag = decodedId.id;
      let tags = tag.split('#');
      refreshTrajPicPanel(parseInt(tags[0]), parseInt(tags[1]));
    });

    rightClickCallbacks.set('default-open-pop-menu', (event) => {
      let viewer = createViewer();
      let picks = viewer.scene.drillPick(event.position, 1, 10, 10);
      if (picks.length != 0 && picks[0].id) {
        let decodedId = decodeCesiumId(picks[0].id);
        if (decodedId && decodedId.typeName == 'billboard') {
          //返修时不能新增和删除
          if (!(tasks.currentTask && tasks.currentTask.taskParams.isRepairJob)) {
            popupInfo.pos = [event.position.x, event.position.y];
            popupInfo.visible = true;
            popupInfo.type = 'DELETE_CROSS_TAG';
            popupInfo.userData = parseInt(decodedId.id);
            return;
          }
        }
      }

      //其他情况拷贝位置
      popupInfo.pos = [event.position.x, event.position.y];
      popupInfo.visible = true;
      popupInfo.type = 'COPY_POS';
    });

    leftDownCallbacks.set('default-close-pop-menu', (event) => {
      popupInfo.visible = false;
    });

    wheelCallbacks.set('default-common-wheel', (event) => {
      refreshLineWidth();
    });

    altRightClickCallbacks.set('default-3dtile-click', (event) => {
      let viewer = createViewer();
      let picks = viewer.scene.drillPick(event.position, 8, 10, 10);
      if (picks.length == 0) {
        return;
      }

      let obj = {};
      let title = '属性';
      let firstPosition = event.position;

      //动态图层优先弹窗
      let feature: any = undefined;
      //console.log('picks', picks);
      //若点击了车道,显示车道信息的弹窗
      for (let pick of picks) {
        if (pick && pick instanceof Cesium3DTileFeature) {
          feature = pick;

          let keys = feature.getPropertyIds();
          for (let i = 0; i < keys.length; i++) {
            obj[keys[i]] = feature.getProperty(keys[i]);
          }

          let type = feature.getProperty('type');

          if (type == 'l') {
            title = '车道属性';
          } else if (type == 'lb') {
            title = '车道线属性';
          } else if (type == 'r') {
            title = '道路属性';
          } else {
            title = getHdSpec(type) + '属性';
          }

          break;
        } else if (pick && pick instanceof ModelFeature) {
          feature = pick;
          let keys = feature.getPropertyIds();
          for (let i = 0; i < keys.length; i++) {
            obj[keys[i]] = feature.getProperty(keys[i]);
          }

          break;
        } else if (
          pick &&
          (pick.id instanceof RenderPrimitiveManager || pick.collection instanceof PointPrimitiveCollection)
        ) {
          feature = pick;

          //@ts-ignore
          let nioFeature = dataManager.getFeatureById(feature.primitive.featureId);
          //@ts-ignore
          if (nioFeature?.properties) {
            //@ts-ignore
            obj = nioFeature.properties;
          }
          break;
        }
      }

      if (!feature) {
        return;
      }

      openInfoBox(obj, title, firstPosition);
    });
  }

  deactive() {
    mouseMoveCallbacks.delete('default-mouse-move');
    cesiumObjClickCallbacks.delete('default-click-cross-point');
    cesiumObjClickCallbacks.delete('default-click-traj-point');
    rightClickCallbacks.delete('default-open-pop-menu');
    leftDownCallbacks.delete('default-close-pop-menu');
    wheelCallbacks.delete('default-common-wheel');
    altRightClickCallbacks.delete('default-3dtile-click');
  }

  getName() {
    return 'default-tool';
  }
}

export class MoveBillboardTool implements Tool {
  constructor() {}

  active(): void {
    cesiumObjClickCallbacks.set('move-billboard-coc', async (decodedId) => {
      if (decodedId.typeName != 'billboard') {
        return;
      }

      //弹出标签面板
      let featureId = parseInt(decodedId.id);
      let feature = dataManager.getFeature(CommonLayerName.CROSS_CHECK_TAG, featureId);
      if (!feature) {
        return;
      }

      //单纯选中，弹出属性面板
      crossCheckPanelData.visible = true;
      crossCheckPanelData.featureId = feature.id;
      crossCheckPanelData.checkProperty = JSON.parse(JSON.stringify(feature.properties));
    });

    leftDownCallbacks.set('move-billboard-ld', (event) => {
      this.#billboardDrag.stop();
      this.#selectedFeatureId = undefined;
      let viewer = createViewer();
      let picks = viewer.scene.drillPick(event.position, 1, 10, 10);
      if (picks.length == 0 || !picks[0].id) {
        return;
      }

      let decodedId = decodeCesiumId(picks[0].id);
      if (!decodedId) {
        return;
      }

      if (decodedId.typeName != 'billboard') {
        return;
      }

      this.#selectedFeatureId = parseInt(decodedId.id);
      this.#clickMoved = false;

      //禁止底图拖动
      viewer.scene.screenSpaceCameraController.enableRotate = false;
    });

    leftUpCallbacks.set('move-billboard-lu', (event) => {
      let viewer = createViewer();
      this.#billboardDrag.stop();

      if (this.#selectedFeatureId) {
        if (this.#clickMoved) {
          //是拖动，更新位置
          let cesiumPos = new Cartesian3();
          viewer.camera.pickEllipsoid(event.position, viewer.scene.globe.ellipsoid, cesiumPos);
          billboardManager.updateBillboardPosition(this.#selectedFeatureId, cesiumPos);
        }
      }

      this.#clickMoved = false;
      this.#selectedFeatureId = undefined;

      //解禁
      viewer.scene.screenSpaceCameraController.enableRotate = true;
    });

    mouseMoveCallbacks.set('move-billboard-mm', (event) => {
      //返修时不能新增和删除
      if (tasks.currentTask && tasks.currentTask.taskParams.isRepairJob) {
        return;
      }

      if (this.#selectedFeatureId) {
        this.#billboardDrag.start(event.startPosition);
        this.#clickMoved = true;
      }
    });
  }

  deactive(): void {
    cesiumObjClickCallbacks.delete('move-billboard-coc');
    leftDownCallbacks.delete('move-billboard-ld');
    leftUpCallbacks.delete('move-billboard-lu');
    mouseMoveCallbacks.delete('move-billboard-mm');

    //关闭属性面板
    crossCheckPanelData.featureId = -1;
  }

  getName(): string {
    return MoveBillboardTool.name;
  }

  //记录是否被选中并且拖动
  #clickMoved: Boolean = false;

  #billboardDrag: BillboardDrag = new BillboardDrag();

  #selectedFeatureId: number | undefined;

  static readonly name: string = 'move-billboard-tool';
}

class ToolManager {
  constructor() {}

  currentTool: Tool | undefined;

  setTool(tool: Tool) {
    if (this.currentTool) {
      this.currentTool.deactive();
    }

    currentToolName.value = tool.getName();
    tool.active();
    this.currentTool = tool;
  }

  setDefaultTool() {
    this.setTool(new GroupTool([new DefaultTool(), new MoveBillboardTool()], 'default'));
  }
}

export const toolManager = new ToolManager();
