import {LayerEvent} from './index.js';
import {Cesium3DTileFeature, defined} from 'cesium';
import {OddLane} from '../system/odd/oddLane/OddLaneModel.js';
import {PopupData} from './popup.js';
import {popupInfoBox} from './infoBox.js';
import {saveUserPos} from '../utils/compute.js';
import {wheelCallback} from './mouse.js';
import {createViewer} from '../cesium/initMap.js';
import store from '../store/index.js';
import {hoverOddLayer} from '../system/odd/hoverOddLayer.js';
import {isPaneModeEqual, PanelOpenType, setPanelMode} from '../system/odd/eventPanel/oddPanelData.js';
import {
  changeQualityProperty,
  QualityTag,
  qualityTagClickHandler,
  qualityTagRightClickHandler,
} from '../system/task/quality/quality.js';
import {leftClickHandler, rightClickHandler} from '../system/odd/event/eventHandler.js';
import {pick as _pick, debounce} from 'lodash-es';
import {ALLOW_ROAD} from '../../src/system/layer/tileLayer/LaneGroupLayer.js';
import {KEY_FLAGs} from '../event/keyboard.js';

//全局事件控制器
export const eventController = (function eventInit() {
  const event = new LayerEvent();
  const viewer = createViewer();
  event.add('RIGHT_DOWN', (ev) => {
    //可能存在叠加图层，所以需要鼠标穿透来选择ODD
    let picks = viewer.scene.drillPick(ev.position, 10, 10);
    let flag = true;
    //若右键点中了激活状态的odd，则触发生成事件选项
    for (let i = 0; i < picks.length; i++) {
      if (defined(picks[i])) {
        let target = picks[i].id;
        if (target instanceof OddLane) {
          rightClickHandler(target.getState(picks[i].primitive.eventId).type, ev.position);
          flag = false;
          break;
        } else if (target instanceof QualityTag) {
          qualityTagRightClickHandler([ev.position.x, ev.position.y], target);
          flag = false;
          break;
        }
      }
    }
    if (flag) {
      store.commit('setPopup', new PopupData(true, [ev.position.x, ev.position.y], 'COPY_POS'));
    }
  });
  event.add('LEFT_DOWN', (ev) => {
    store.commit('setPopup', new PopupData(false));
  });
  event.add('LEFT_CLICK', (ev) => {
    popupInfoBox.close();

    //按下'a'键点击时，在PullFrameEvent事件里响应
    if (!KEY_FLAGs['a']) {
      let picks = viewer.scene.drillPick(ev.position, 10, 10);
      for (let i = 0; i < picks.length; i++) {
        let target = picks[i];
        if (defined(picks[i])) {
          if (target.id instanceof QualityTag) {
            setPanelMode(PanelOpenType.CLOSE);
            qualityTagClickHandler(target.id);
            break;
          } else if (target.id instanceof OddLane) {
            //单选有选中多条事件的可能，统一记录。selectedOddDataIds只可能属于同一个OddLane
            let selectedOddDataIds = new Map();

            for (let m = 0; m < picks.length; m++) {
              if (defined(picks[m]) && picks[m].id instanceof OddLane) {
                if (!selectedOddDataIds.has(picks[m].id)) {
                  selectedOddDataIds.set(picks[m].id, []);
                }

                selectedOddDataIds.get(picks[m].id).push(picks[m].primitive.eventId);
              }
            }

            changeQualityProperty(null);
            leftClickHandler(target.id, target.primitive.eventId, selectedOddDataIds.get(target.id));

            //注意这个break。影响到了选择优先级
            break;
          } else if (target instanceof Cesium3DTileFeature) {
            hoverOddLayer.laneClickHandler(target);
            break;
          }
        }
      }
    }
  });
  event.add(
    'RIGHT_DOWN',
    (ev) => {
      const picks = viewer.scene.drillPick(ev.position, 10, 10);

      //动态图层优先弹窗
      let firstDynamicPick = null;
      let first3DTilePick = null;
      let firstIssueProperties = null;
      let firstPosition = null;
      //console.log('picks', picks);
      //若点击了车道,显示车道信息的弹窗
      for (let i = 0; i < picks.length; i++) {
        let pick = picks[i];
        if (defined(pick) && pick instanceof Cesium3DTileFeature) {
          //有这两个字段说明是动态图层
          if (pick.getProperty('dynamic_info') !== undefined && pick.getProperty('event_id') !== undefined) {
            firstDynamicPick = pick;
            firstPosition = ev.position;
            break;
          } else {
            first3DTilePick = pick;
            firstPosition = ev.position;
          }
        } else if (pick.primitive.properties !== undefined) {
          firstIssueProperties = pick.primitive.properties;
          firstPosition = ev.position;
        }
        //if (pick.primitive.queryParameters === ALLOW_ROAD) return;
      }

      //动态图层优先弹窗
      if (firstDynamicPick !== null) {
        popupInfoBox.open(firstDynamicPick, firstPosition);
      } else if (first3DTilePick !== null) {
        popupInfoBox.open(first3DTilePick, firstPosition);
      } else if (firstIssueProperties !== null) {
        popupInfoBox.openIssue(firstIssueProperties, firstPosition);
      }
    },
    'ALT',
  );
  event.add('WHEEL', function () {
    saveUserPos();
    wheelCallback();
  });
  return {
    start(type, modifier) {
      event.start(type, modifier);
    },
    stop(type, modifier) {
      event.stop(type, modifier);
    },
    startAll() {
      event.startAll();
    },
    stopAll() {
      event.stopAll();
    },
  };
})();
