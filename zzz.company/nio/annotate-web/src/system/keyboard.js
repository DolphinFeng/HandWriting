import {crossCheckPanelData} from '../data-source/cross/cross-check-panel.ts';
import {
  addTrajPicIdxHandler,
  openNextRoute,
  openPrevRoute,
  switchLastestTraj,
  switchLatestGrayPcd,
  switchLatestRGBPcd,
} from '../data-source/cross/cross-resume-panel.ts';

document.addEventListener('keydown', function (ev) {
  //KEY_FLAGs[ev.key] = true;

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
        // let record, type;
        // if (ev.shiftKey) {
        //   //重做
        //   record = opHistory.forward();
        //   type = 'opForward';
        // } else {
        //   //撤销
        //   record = opHistory.back();
        //   type = 'opBack';
        // }
        // if (record) {
        //   handleOpHistory(type, record);
        // }
        break;
      // case 'x':
      //   //打印当前操作记录栈
      //   printInfo();
      //   break;
    }
  }

  //输入控件，不响应快捷键
  if (ev.target.tagName != 'INPUT' && ev.target.tagName != 'TEXTAREA') {
    //轨迹资料播放
    switch (ev.key.toLowerCase()) {
      case '1':
        switchLastestTraj();
        break;
      case '2':
        switchLatestGrayPcd();
        break;
      case '3':
        switchLatestRGBPcd();
        break;
      case 'w':
        openPrevRoute();
        break;
      case 's':
        openNextRoute();
        break;
      case 'arrowright':
        addTrajPicIdxHandler(1);
        break;
      case 'arrowleft':
        addTrajPicIdxHandler(-1);
        break;
      case 'escape':
        crossCheckPanelData.visible = false;
        break;
      default:
        break;
    }
  }
});
