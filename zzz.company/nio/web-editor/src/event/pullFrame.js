import {Cartesian2, ScreenSpaceEventHandler} from 'cesium';
import {createViewer} from '../cesium/initMap.js';
import {LayerEvent} from './index.js';
import {getTileLevel, nioCamera, NioMessage} from '../utils/utils.js';
import {reactive} from 'vue';
import {oddLayer} from '../system/odd/oddLayer.js';
import store from '../store/index.js';
import {trajectoryLayer} from '../system/trajectory/trajectoryLayer.js';
import {hoverOddLayer} from '../system/odd/hoverOddLayer.js';
import {issueLayer} from '../system/issue/layer.ts';
import {KEY_FLAGs} from '../event/keyboard.js';

export const pullFrame = reactive({
  show: false,
  borderColor: '',
  borderStyle: '',
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  scaleX: 1,
  scaleY: 1,
});

class PullFrameEvent {
  layerEvent = null;
  stPos = new Cartesian2();
  viewer = createViewer();
  curKey = '';
  way = ''; //左键、右键
  /**
   * 拉框
   */

  constructor() {
    this.layerEvent = new LayerEvent();
    //ALT拉框
    this.layerEvent.add('LEFT_DOWN', this.ALTLeftDown, 'ALT');
    this.layerEvent.add('MOUSE_MOVE', this.MouseMove, 'ALT');
    this.layerEvent.add('LEFT_UP', this.MouseUp, 'ALT');
    //SHIFT拉框
    this.layerEvent.add('LEFT_DOWN', this.SHIFTLeftDown, 'SHIFT');
    this.layerEvent.add('LEFT_UP', this.MouseUp, 'SHIFT');
    this.layerEvent.add('MOUSE_MOVE', this.MouseMove, 'SHIFT');
    this.layerEvent.add('RIGHT_DOWN', this.SHIFTRightDown, 'SHIFT');
    this.layerEvent.add('RIGHT_UP', this.MouseUp, 'SHIFT');
    //CTRL拉框
    this.layerEvent.add('LEFT_DOWN', this.CTRLLeftDown, 'CTRL');
    this.layerEvent.add('LEFT_UP', this.MouseUp, 'CTRL');
    this.layerEvent.add('MOUSE_MOVE', this.MouseMove, 'CTRL');
    this.layerEvent.add('RIGHT_DOWN', this.CTRLRightDown, 'CTRL');
    this.layerEvent.add('RIGHT_UP', this.MouseUp, 'CTRL');

    //按'a'键拉框
    this.layerEvent.add('LEFT_DOWN', this.KeyALeftDown);
    this.layerEvent.add('MOUSE_MOVE', this.MouseMove);

    this.layerEvent.add('LEFT_UP', this.MouseUp);
    this.layerEvent.add('RIGHT_UP', this.MouseUp);
  }
  start() {
    this.layerEvent.start('LEFT_DOWN', 'ALT');
    this.layerEvent.start('LEFT_DOWN', 'SHIFT');
    this.layerEvent.start('LEFT_DOWN', 'CTRL');
    this.layerEvent.start('RIGHT_DOWN', 'SHIFT');
    this.layerEvent.start('RIGHT_DOWN', 'CTRL');
    this.layerEvent.start('LEFT_DOWN');
  }
  resetPullFrame() {
    Object.assign(pullFrame, {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      scaleX: 1,
      scaleY: 1,
    });
    pullFrame.show = false;
  }

  //ctrl、alt、shift公用逻辑
  mouseDown(key, way, position, color, borderStyle) {
    console.log('nioCamera.lockCamera');
    nioCamera.lockCamera();
    this.curKey = key;
    this.way = way;
    this.stPos = position;
    pullFrame.left = this.stPos.x;
    pullFrame.top = this.stPos.y;
    pullFrame.borderColor = color;
    pullFrame.borderStyle = borderStyle;
    if (way === 'LEFT') {
      this.layerEvent.start('LEFT_UP');
      this.layerEvent.start('LEFT_UP', key);
    } else if (way === 'RIGHT') {
      this.layerEvent.start('RIGHT_UP');
      this.layerEvent.start('RIGHT_UP', key);
    }
    this.layerEvent.start('MOUSE_MOVE', key);
  }

  ALTLeftDown = (ev) => {
    this.mouseDown('ALT', 'LEFT', ev.position, '#67c23a', 'solid');
  };
  SHIFTLeftDown = (ev) => {
    if (store.state.sceneMode === '2D') {
      this.mouseDown('SHIFT', 'LEFT', ev.position, '#409eff', 'solid');
    }
  };
  SHIFTRightDown = (ev) => {
    if (store.state.sceneMode === '2D') {
      this.mouseDown('SHIFT', 'RIGHT', ev.position, '#409eff', 'dashed');
    }
  };

  KeyALeftDown = (ev) => {
    if (KEY_FLAGs['a']) {
      nioCamera.lockCamera();
      this.curKey = 'KEY_A';
      this.way = 'LEFT';
      this.stPos = ev.position;
      pullFrame.left = this.stPos.x;
      pullFrame.top = this.stPos.y;
      pullFrame.borderColor = '#409eff';
      pullFrame.borderStyle = 'solid';
      this.layerEvent.start('LEFT_UP');
      this.layerEvent.start('MOUSE_MOVE');
    } else {
      this.layerEvent.stop('LEFT_UP');
      this.layerEvent.stop('MOUSE_MOVE');
    }
  };

  CTRLLeftDown = (ev) => {
    if (store.state.sceneMode === '2D') {
      this.mouseDown('CTRL', 'LEFT', ev.position, '#f56c6c', 'solid');
    }
  };
  CTRLRightDown = (ev) => {
    if (store.state.sceneMode === '2D') {
      this.mouseDown('CTRL', 'RIGHT', ev.position, '#f56c6c', 'dashed');
    }
  };

  MouseMove = (ev) => {
    pullFrame.show = true;
    let width = ev.endPosition.x - this.stPos.x,
      height = ev.endPosition.y - this.stPos.y;
    //控制拉框翻转
    if (width < 0) {
      pullFrame.scaleX = -1;
      width *= -1;
    } else {
      pullFrame.scaleX = 1;
    }
    if (height < 0) {
      pullFrame.scaleY = -1;
      height *= -1;
    } else {
      pullFrame.scaleY = 1;
    }
    pullFrame.width = width;
    pullFrame.height = height;
  };
  MouseUp = (ev) => {
    //a键按下的时候，不解锁。a键弹起才解锁
    if (!KEY_FLAGs['a']) {
      nioCamera.unLockCamera();
    }
    this.layerEvent.stop('MOUSE_MOVE', this.curKey);
    this.layerEvent.stop('LEFT_UP', this.curKey);
    this.layerEvent.stop('RIGHT_UP', this.curKey);
    this.layerEvent.stop('LEFT_UP');
    this.layerEvent.stop('RIGHT_UP');
    this.layerEvent.stop('MOUSE_MOVE');

    //鼠标抬起后根据案件执行事件
    mouseStrategy(this.curKey, this.way, this.stPos, ev.position, !pullFrame.show);
    this.resetPullFrame();
  };
}

/**
 * 鼠标弹起按键策略
 * @type {(function(*, *, *): void)|*}
 */
const mouseStrategy = (function () {
  const strategy = {
    ALT: function (stPos, edPos, way) {
      console.log('alt');
      if (getTileLevel() >= 11) {
        trajectoryLayer.request(stPos, edPos);
      } else {
        NioMessage('warning', '请放大tile缩放级别', 2000);
      }
    },
    SHIFT: function (stPos, edPos, way, isClick) {
      if (isClick) {
        hoverOddLayer.shiftOneEvent(edPos);
      } else if (getTileLevel() >= 15) {
        if (KEY_FLAGs['Alt']) {
          if (store.state.issue.show_by_id['issue_start_end_point']) {
            issueLayer.debounceShiftEvent(stPos, edPos, way);
          }
        } else {
          hoverOddLayer.shiftEvent(stPos, edPos, way).finally();
        }
      } else {
        NioMessage('warning', 'tile缩放应大于15', 2000);
      }
    },
    KEY_A: function (stPos, edPos, way, isClick) {
      if (isClick) {
        hoverOddLayer.keyAShiftOneEvent(edPos);
      } else if (getTileLevel() >= 15) {
        hoverOddLayer.shiftEvent(stPos, edPos, way).finally();
      } else {
        NioMessage('warning', 'tile缩放应大于15', 2000);
      }
    },
    CTRL: function (stPos, edPos, way, isClick) {
      if (isClick) {
        oddLayer.ctrlOneEvent(edPos);
      } else if (getTileLevel() >= 15) {
        oddLayer.ctrlEvent(stPos, edPos, way);
      } else {
        NioMessage('warning', 'tile缩放应大于15', 2000);
      }
    },
  };
  return function (key, way, stPos, edPos, isClick) {
    if (key in strategy) {
      strategy[key](stPos, edPos, way, isClick);
    }
  };
})();

const pullFrameEvent = new PullFrameEvent();
export {pullFrameEvent};
