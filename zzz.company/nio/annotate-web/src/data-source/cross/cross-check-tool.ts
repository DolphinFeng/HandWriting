import {tasks} from './../../system/task-list.ts';
import {Tool, toolManager} from '../../system/tool.ts';
import {leftUpCallbacks, leftDownCallbacks, rightClickCallbacks} from '../../system/event.js';
import {createViewer} from '../../cesium/create-viewer.js';
import {Cartesian3, Ellipsoid, Cartographic, Math} from 'cesium';
import {billboardManager} from '../../system/billboard-manager.ts';
import {NioGeoPoint} from '../../model/point.ts';
import {decodeCesiumId} from '../../utils/utils.js';
import {crossCheckPanelData} from './cross-check-panel.ts';
import {popupInfo} from '../../store/popup.ts';

let viewer = createViewer();

export class AddBillboardTool implements Tool {
  constructor() {}

  active(): void {
    //@ts-ignore
    viewer.container.style.cursor = 'pointer';

    leftDownCallbacks.set('add-billboard-ld', (event) => {
      this.#leftDownPosition = event.position;
    });

    leftUpCallbacks.set('add-billboard-lu', (event) => {
      //如果鼠标抬起时位置变了，则有可能是拖动。此时不添加
      if (this.#leftDownPosition.x != event.position.x || this.#leftDownPosition.y != event.position.y) {
        this.#leftDownPosition = null;
        return;
      }

      this.#leftDownPosition = null;

      //返修时不能新增和删除
      if (tasks.currentTask && tasks.currentTask.taskParams.isRepairJob) {
        return;
      }

      //是新增，添加新标
      let cesiumPos = new Cartesian3();
      viewer.camera.pickEllipsoid(event.position, viewer.scene.globe.ellipsoid, cesiumPos);

      let cartographic = new Cartographic();
      Ellipsoid.WGS84.cartesianToCartographic(cesiumPos, cartographic);
      let defaultProperty = {
        qualityType: 2,
        qualityResult: 1,
        qualityDesc: '',
        isRepair: false, //是否返修
      };
      let feature = billboardManager.addBillboard({
        properties: defaultProperty,
        point: new NioGeoPoint(Math.toDegrees(cartographic.longitude), Math.toDegrees(cartographic.latitude)),
      });

      //弹出属性面板
      crossCheckPanelData.visible = true;
      crossCheckPanelData.featureId = feature.id;
      crossCheckPanelData.checkProperty = defaultProperty;

      //添加一个质检标后，默认切为default工具
      toolManager.setDefaultTool();
    });

    rightClickCallbacks.set('add-billboard-rc', (event) => {
      //返修时不能新增和删除
      if (tasks.currentTask && tasks.currentTask.taskParams.isRepairJob) {
        return;
      }

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

      popupInfo.pos = [event.position.x, event.position.y];
      popupInfo.visible = true;
      popupInfo.type = 'DELETE_CROSS_TAG';
      popupInfo.userData = parseInt(decodedId.id);
    });
  }

  deactive(): void {
    //@ts-ignore
    viewer.container.style.cursor = 'default';

    leftUpCallbacks.delete('add-billboard-lu');
    leftDownCallbacks.delete('add-billboard-ld');
    rightClickCallbacks.delete('add-billboard-rc');
  }

  getName(): string {
    return AddBillboardTool.name;
  }

  #leftDownPosition: any;

  static readonly name: string = 'add-billboard-tool';
}

//test code
// 拉tag的伪代码
/**
 * 1 任务开始，读取质检表数据，并调用dataManager.addNewFeature(layerName = "cross-check-tag")
 * 2 创建BillboardManager ，并调用BillboardManager的recreatePrimitiveFromNioLayer方法
 * 3 添加点击按下选中tag事件，创建BillboardDrag，并调用start()
 * 4 添加点击弹起事件，调用BillboardDrag的stop, 同时更新数据
 */

// const dragger = new BillboardDrag();
// leftDownCallbacks.set('dragger', (ev) => {
//   if (!tagSwitch) {
//     dragger.start(ev.position);
//   } else {
//     dragger.stop();
//   }

//   tagSwitch = !tagSwitch;
// });
