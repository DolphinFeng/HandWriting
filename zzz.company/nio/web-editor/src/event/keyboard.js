import {handleOddOpBack, handleOddOpForward, opHistory} from '../system/odd/history/history.js';
import {panelVisible, trajectoryLayer, trajPointData} from '../system/trajectory/trajectoryLayer.js';
import {setHdMapVisibleHandler} from '../system/layer/tileLayer/tileLayerController.js';
import {oddLayer} from '../system/odd/oddLayer.js';
import {hoverOddLayer} from '../system/odd/hoverOddLayer.js';
import {isPaneModeEqual, PanelOpenType, setPanelMode} from '../system/odd/eventPanel/oddPanelData.js';
import {handleSaveOdd} from '../system/odd/saveOdd/saveOdd.js';
import store from '../store/index.js';
import {qualityData, changeQualityProperty} from '../system/task/quality/quality.js';
import {printInfo} from './printInfo.js';
import {nioCamera} from '../utils/utils.js';

/** 用来判断那个键被按下了 */
export const KEY_FLAGs = {};

function printOddInfo() {
  console.log(
    'hLanes：',
    hoverOddLayer.hoverLanes.size,
    '。hoverLaneGroup：',
    hoverOddLayer.hoverLaneGroup.size,
    '。hEvent：',
    oddLayer.hoverEvent.size,
    '。oddLanes：',
    oddLayer.oddLanes.size,
  );
}
let timer = null;

document.addEventListener('keydown', function (ev) {
  KEY_FLAGs[ev.key] = true;

  if (ev.shiftKey) {
    //控制图层显隐性
    switch (ev.key.toLowerCase()) {
      case 'q':
        setHdMapVisibleHandler('车道线');
        break;
      case 'w':
        setHdMapVisibleHandler('车道');
        break;
      case 'e':
        setHdMapVisibleHandler('道路');
        break;
      case 'r':
        setHdMapVisibleHandler('动态图层');
        break;
      case 't':
        //oddLayer.show = !oddLayer.show;
        break;
      case 'g':
        store.state.mapShow = !store.state.mapShow;
        store.commit('switchMapShow', store.state.mapShow);
        break;
      default:
    }
  }
  //撤销重做
  if (ev.ctrlKey) {
    switch (ev.key.toLowerCase()) {
      case 'z':
        let record, type;
        if (ev.shiftKey) {
          //重做
          record = opHistory.forward();
          type = 'opForward';
        } else {
          //撤销
          record = opHistory.back();
          type = 'opBack';
        }
        if (record) {
          handleOpHistory(type, record);
        }
        break;
      case 'x':
        //打印当前操作记录栈
        printInfo();
        break;
      case 'c':
        //开始or停止循环打印当前hoverLane和hoverEvent信息
        if (timer) {
          clearInterval(timer);
          timer = null;
        } else {
          timer = setInterval(() => {
            printOddInfo();
          }, 1000);
        }
        break;
      case 's':
        ev.preventDefault();
        handleSaveOdd();
        break;
    }
  }
  //轨迹资料播放
  switch (ev.key) {
    case 'ArrowRight':
      if (panelVisible.value) {
        trajectoryLayer.addIdxHandler(ev.shiftKey ? 10 : 1);
      }
      return;
    case 'ArrowLeft':
      if (panelVisible.value) {
        trajectoryLayer.addIdxHandler(ev.shiftKey ? -10 : -1);
      }
      return;
    case 'Escape':
      isPaneModeEqual(PanelOpenType.CLOSE) || setPanelMode(PanelOpenType.CLOSE);
      qualityData.propertyModel.qualityTag && changeQualityProperty(null);
      break;
  }
});

document.body.addEventListener(
  'keyup',
  function (e) {
    KEY_FLAGs[e.key] = false;
    if (e.key === 'a') {
      nioCamera.unLockCamera();
    }
  },
  false,
);

//处理撤销、重做操作
const handleOpHistory = function (type, record) {
  if (type === 'opBack') {
    handleOddOpBack(record);
  } else if (type === 'opForward') {
    handleOddOpForward(record);
  }
  //添加一个闪烁效果，提示用户
  let dom = document.querySelector(`#${type}`);
  dom.style.cssText = 'transition-duration: 0s;background-color: #285de7;';
  setTimeout(() => {
    dom.style.cssText = 'transition-duration: 0s;';
    setTimeout(() => {
      dom.style.cssText = '';
    }, 50);
  }, 180);
};
