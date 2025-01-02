/** odd单条事件数据 */
import {copyObj} from '../../../../src/utils/utils.js';

export class OddData {
  /** @type {Symbol} 用于标识唯一oddData */
  tag;

  /**
   * @constructor
   * @param type 事件类型
   * @param lawSpeed 法规限速
   * @param exSpeed 经验限速
   * @param laneId 道路id
   * @param stOffset 起始位置
   * @param edOffset 结束位置
   * @param curVersion 版本
   * @param status 事件状态
   * @param source 事件来源(可选)
   * @param eventId 事件id(可选)
   * @param geometry 事件几何数据
   * @param isWork 标识是否是作业库数据
   * @param createTime 创建时间（后端记录）
   * @param updateTime 更新时间（后端记录）
   * @param roadPriorityClass 记录事件对应的道路等级
   *
   * @param memo issue任务事件专有的字段
   * @param siteMapId issue任务事件专有的字段
   */
  constructor(
    type,
    lawSpeed,
    exSpeed,
    laneId,
    stOffset,
    edOffset,
    curVersion,
    status,
    source,
    eventId,
    geometry,
    positions,
    isWork,
    createTime,
    updateTime,
    roadPriorityClass,
    memo,
    siteMapId,
    layerName,
    properties, //用于sdlink，判断前后继是否连续
  ) {
    this.type = type;
    this.lawSpeed = lawSpeed;
    this.exSpeed = exSpeed;
    this.laneId = laneId;
    this.stOffset = stOffset;
    this.edOffset = edOffset;
    this.curVersion = curVersion;
    this.status = status;
    this.source = source;
    this.eventId = eventId;
    this.geometry = geometry;
    this.tag = Symbol('oddData');
    this.isWork = isWork;
    this.createTime = createTime;
    this.updateTime = updateTime;
    this.positions = positions;
    this.roadPriorityClass = roadPriorityClass;
    this.memo = memo;
    this.siteMapId = siteMapId;
    this.layerName = layerName;
    this.properties = properties;
  }

  /** @return {OddData} 返回一份拷贝data */
  copy() {
    let oddData = new OddData(
      this.type,
      this.lawSpeed,
      this.exSpeed,
      this.laneId,
      this.stOffset,
      this.edOffset,
      this.curVersion,
      this.status,
      this.source,
      this.eventId,
      this.geometry,
      copyObj(this.positions), //深拷贝
      this.isWork,
      this.createTime,
      this.updateTime,
      this.roadPriorityClass,
      this.memo,
      this.siteMapId,
      this.layerName,
      this.properties,
    );

    if (this.path) {
      oddData.path = this.path;
      oddData.paths2e = this.paths2e;
      oddData.infoValueList = this.infoValueList;
    }

    //拷贝需要保证oddData的标识符全局唯一,以区分真正不同的事件
    oddData.tag = this.tag;
    return oddData;
  }
}
