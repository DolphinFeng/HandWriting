import {loadingSourceOddHandler} from '../../../system/odd/loading/loadingOddData.js';
import {clearOddData} from '../../../system/odd/saveOdd/saveOdd.js';
import {clearQualityData} from '../../../system/task/quality/refreshQualityData.js';
import {Observer} from '../../../js/observer.js';
import {OddTask, taskData} from '../../../system/task/taskList/taskList.js';
import {requestTaskWork} from '../../../system/task/taskList/startTask.js';
import {oddLayer} from '../../../system/odd/oddLayer.js';

export function reloadOddData(store) {
  //切换事件图层时，需要重新加载数据，否则影响压盖选择
  //清空所有odd缓存
  clearOddData();
  //清空质检标
  clearQualityData();
  //加载新的odd
  loadingSourceOddHandler(true);
  //加载新当前版本作业库
  console.log(taskData);
  if (
    taskData.runningTask instanceof OddTask &&
    taskData.runningTask.mapVersion === store.state.version.curVersion.toString()
  ) {
    requestTaskWork(taskData.runningTask, true, false);
  }
  //刷新批次列表  ??
  Observer.fire('batchUpdate', {});

  //触发OddLayer的set show 函数，startOddEvent或者stopOddEvent
  oddLayer.show = true;
}
