import {CustomPolyline} from '../../../primitives/polyline.js';
import {OddData} from '../oddData/OddDataModel.js';
import {Cartographic} from 'cesium';
import {createViewer} from '../../../cesium/initMap.js';
import {getCurrentOddLayerSource} from '../oddLayerVisible.js';

/** odd线 */
export class OddLane extends CustomPolyline {
  /** @type{OddData[]} */
  //oddDataList = [];
  laneId;
  laneGroupId;
  laneSource;
  activeOddIdx = 0;

  activeEventId; //单选时，被选中的oddData的eventId
  selectedEventIds = []; //单选时，同时被选中的oddData的eventId。有多条重叠时，选中的会有多个值，但是认为只选中activeEventId

  static viewer = createViewer();
  static cartographic = new Cartographic();

  static eventId = 0;

  /**
   * @constructor
   * @param positions{Cartesian3[]} 线坐标
   * @param state 线颜色
   * @param laneId
   * @param laneGroupId
   * @param laneSource 道路来源
   * @param oddData {OddData}
   */
  constructor(
    //positions,
    state,
    laneId,
    laneGroupId,
    laneSource,
    oddData,
  ) {
    //需要对坐标height做处理，以避免与3DTile混合显示的问题，因此禁止通过获取positions的数据来做任何行为。真正的坐标保存在了oddData的geometry中
    for (let i = 0; i < oddData.positions.length; i++) {
      Cartographic.fromCartesian(oddData.positions[i], OddLane.viewer.scene.globe.ellipsoid, OddLane.cartographic);
      OddLane.cartographic.height = 0.01;
      oddData.positions[i] = Cartographic.toCartesian(OddLane.cartographic);
    }

    //如果没有eventId，临时给一个数字
    if (oddData.eventId === '') {
      oddData.eventId = '' + OddLane.eventId++;
    }

    super({
      allowPicking: true,
      //positions: positions,
      oddData: oddData,
      state: state,
      name: 'ODD',
    });
    this.laneGroupId = laneGroupId;
    this.laneId = laneId;
    this.laneSource = laneSource;
    this.addOddData(oddData);
  }

  /** @param tag{Symbol} */
  selectOddData(tag) {
    for (let i = 0; i < this.oddDataList.length; i++) {
      if (this.oddDataList[i].tag === tag) {
        return this.oddDataList[i];
      }
    }
    return null;
  }

  /** @type{OddData|OddData[]} */
  addOddData(oddData) {
    if (oddData instanceof Array) {
      oddData.forEach((item) => this.#ifExitDataAndReplace(item));
    } else if (oddData instanceof OddData) {
      this.#ifExitDataAndReplace(oddData);
    }
    //this.activeOddIdx = this.oddDataList.length - 1;
  }

  /** 已经存在的oddData则覆盖，否则添加 */
  #ifExitDataAndReplace(oddData) {
    if (oddData.eventId.length > 10) {
      for (let i = 0; i < this.oddDataList.length; i++) {
        if (oddData.eventId === this.oddDataList[i].eventId) {
          this.oddDataList.splice(i, 1);
          this.states.delete(oddData.eventId);
          break;
        }
      }
    }
    this.oddDataList.push(oddData);
    this.states.set(oddData.eventId, this.state);

    for (let j = 0; j < this._primitiveArray.length; j++) {
      if (this._primitiveArray[j].eventId === oddData.eventId) {
        this._primitiveArray[j].destroy();
        this._primitiveArray.splice(j, 1);
        break;
      }
    }

    let primitive = this.getPrimitive(oddData.positions, oddData.eventId);
    primitive._allowPicking = true;
    this._primitiveArray.push(primitive);
  }

  /**
   * 重写基类函数，控制显隐
   */
  isVisible() {
    //事件图层显隐时，后面改为了直接重新加载数据。所以此处不再判断
    return true;

    //根据source的值，来判断显示隐藏
    //let sources = getCurrentOddLayerSource();

    //let data_size = this.oddDataList.length;
    //for(let i = 0; i < data_size; i ++){
    //    let oddData = this.oddDataList[i];
    //    if(oddData.source != undefined && sources.has(oddData.source)){
    //        return true;
    //    }
    //}

    //return false;
  }

  /** @param tag{Symbol}
   *  @return{OddData}
   */
  remove(tag) {
    let popOddData = null;
    for (let i = 0; i < this.oddDataList.length; i++) {
      if (this.oddDataList[i].tag === tag) {
        for (let j = 0; j < this._primitiveArray.length; j++) {
          if (this._primitiveArray[j].eventId === this.oddDataList[i].eventId) {
            this._primitiveArray[j].destroy();
            this._primitiveArray.splice(j, 1);
            break;
          }
        }

        //更新activeEventId
        for (let m = 0; m < this.selectedEventIds.length; m++) {
          if (this.selectedEventIds[m] === this.oddDataList[i].eventId) {
            this.selectedEventIds.splice(m, 1);
            if (this.selectedEventIds.length > 0) {
              this.activeEventId = this.selectedEventIds[0];
            } else {
              this.activeEventId = '';
            }
            break;
          }
        }

        let needRefresh = false;
        if (this.activeEventId === this.oddDataList[i].eventId) {
          needRefresh = true;
        }

        popOddData = this.oddDataList.splice(i, 1)[0];
        if (needRefresh) {
          this.activeEventId = '';
          if (this.oddDataList.length !== 0) {
            this.activeEventId = this.oddDataList[0].eventId;
          }
        }

        //this.activeOddIdx = Math.min(i, this.oddDataList.length - 1);
        break;
      }
    }
    return popOddData;
  }

  removeOddDataByEventId(eventId) {
    let popOddData = null;
    for (let i = 0; i < this.oddDataList.length; i++) {
      if (this.oddDataList[i].eventId === eventId) {
        popOddData = this.oddDataList.splice(i, 1)[0];

        //更新activeEventId
        for (let m = 0; m < this.selectedEventIds.length; m++) {
          if (this.selectedEventIds[m] === this.oddDataList[i].eventId) {
            this.selectedEventIds.splice(m, 1);
            if (this.selectedEventIds.length > 0) {
              this.activeEventId = this.selectedEventIds[0];
            } else {
              this.activeEventId = '';
            }
          }
        }

        //if (this.oddDataList.length > 0) {
        //this.activeOddIdx = Math.min(i, this.oddDataList.length - 1);
        //}
        break;
      }
    }
    return popOddData;
  }

  /** @return{OddData[]} */
  removeAll(oddDataList) {
    let oldList = [];
    if (oddDataList instanceof Array && oddDataList.length > 0) {
      for (let i = 0; i < oddDataList.length; i++) {
        let oddData = this.remove(oddDataList[i].tag);
        if (oddData) {
          oldList.push(oddData);
        }
      }
    } else {
      oldList = [...this.oddDataList];
      this.oddDataList = [];
    }
    return oldList;
  }

  /**
   * @param oddData{OddData}
   * @return{OddData}
   */
  exChangeOddData(oddData) {
    let oddDataList = this.oddDataList,
      res;
    for (let i = oddDataList.length - 1; i >= 0; i--) {
      if (oddDataList[i].tag === oddData.tag) {
        res = oddDataList.splice(i, 1, oddData);
        //this.activeOddIdx = i;
        break;
      }
    }
    if (res === undefined) {
      throw new Error('交换事件失败，意料外的错误');
    }
    return res[0];
  }
}
