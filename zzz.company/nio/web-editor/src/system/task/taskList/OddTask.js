import {nioCamera, NioMessage, NioNotification} from '../../../utils/utils.js';
import {Cartesian3} from 'cesium';
import StatusCode from './enum/StatusCode.js';
import WorkKeys from './enum/WorkKeys.js';
import QualityStatus from '../quality/enum/QualityStatus.js';
import {loadingSourceOddHandler} from '../../odd/loading/loadingOddData.js';

const posMatch = /\s*(\d+\.?\d*)[\s,，:：]+(\d+\.?\d*)\s*/;
/** ODD任务 */
export default class OddTask {
  /** @type {string|null} 作业库名称*/
  oddBranchName = null;
  /** @type {QualityTag[]} 任务质检标列表 */
  qualityTagList = [];

  /**辅助数据，用于记录qualityTagList里未被删除的tag，在tag列表中使用。直接用qualityTagList，在tag列表刷新会有问题 */
  qualityValidTagList = [];
  /**
   * @constructor
   * @param taskId 任务Id
   * @param errType 任务类型
   * @param errUrl 任务源链接
   * @param errDesc 任务描述
   * @param mapVersion 地图版本
   * @param errPos 任务地点
   * @param errCaptures 任务截图地址列表
   * @param workId 作业Id
   * @param tagList{null|[]} 作业文字标签列表
   * @param workKey {'step_user_edit'|'step_user_check'} 标识作业或质检任务
   * @param statusCode 作业状态
   * @param typeCode 作业类型，用于区分issue_odd_event_making任务类型
   * @param event_id AO质检的event id
   * @param siteId issue任务参数
   * @param verifyIssue issue任务参数
   * @param lineName
   */
  constructor(
    taskId,
    errType,
    errUrl,
    errDesc,
    mapVersion,
    errPos,
    errCaptures,
    workId,
    tagList,
    workKey,
    statusCode,
    typeCode,
    event_id,
    siteId,
    verifyIssue,
    lineName,
  ) {
    this.taskId = taskId;
    this.errType = errType;
    this.errUrl = errUrl;
    this.errDesc = errDesc;
    this.mapVersion = mapVersion;
    this.errPos = errPos;
    this.errCaptures = errCaptures;
    this.workId = workId;
    this.tagList = tagList;
    this.typeCode = typeCode;
    this.event_id = event_id;
    this.siteId = siteId;
    this.verifyIssue = verifyIssue;
    this.lineName = lineName;
    if (!workKey in WorkKeys || !statusCode in StatusCode) {
      throw new Error(`作业值异常：workKey:${workKey}, statusCode:${statusCode}`);
    }
    this.workKey = workKey;
    this.statusCode = statusCode;
  }

  locate() {
    let coordinates = posMatch.exec(this.errPos);
    if (coordinates) {
      nioCamera.locatePosition({
        position: Cartesian3.fromDegrees(parseFloat(coordinates[1]), parseFloat(coordinates[2]), 500),
        animate: true,
        completed() {
          loadingSourceOddHandler(true);
        },
      });
    } else {
      NioNotification('warning', '定位坐标格式异常', this.errPos);
    }
  }

  addQualityTag(qualityTag) {
    this.qualityTagList.push(qualityTag);
    this.qualityValidTagList.push(qualityTag);
  }

  /**根据qualityTagList来更新qualityValidTagList */
  refreshValidTagList() {
    this.qualityValidTagList = [];
    let idx = 0;
    for (; idx < this.qualityTagList.length; idx++) {
      if (this.qualityTagList[idx].status !== 0) {
        this.qualityValidTagList.push(this.qualityTagList[idx]);
      }
    }
  }

  /** @param qualityTag{QualityTag} */
  removeQualityTag(qualityTag) {
    let idx = 0;
    for (; idx < this.qualityValidTagList.length; idx++) {
      if (this.qualityValidTagList[idx] === qualityTag) {
        this.qualityValidTagList.splice(idx, 1);
        break;
      }
    }

    if (qualityTag.id === null) {
      let idx = 0;
      for (; idx < this.qualityTagList.length; idx++) {
        if (this.qualityTagList[idx] === qualityTag) {
          this.qualityTagList.splice(idx, 1);
          return true;
        }
      }
    } else {
      qualityTag.status = QualityStatus.DELETE;
      return true;
    }
    return false;
  }
}
