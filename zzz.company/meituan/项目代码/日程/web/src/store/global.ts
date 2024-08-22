/*
 * @Description: 全局store
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-06-03 20:14:07
 * @LastEditors: chenbaiyu
 * @LastEditTime: 2023-02-20 19:10:46
 * @FilePath: /scheduleweb/src/store/global.ts
 */
import { observable, action } from 'mobx';
import { getBookRules } from '@/services/newRooms';
import MessageStore from '@/utils/messageStore';
import dxJSSDK from '@/utils/dxJSSDK';
import { EPerformancePosition } from '@/consts';

export const messageStore = new MessageStore();

interface IUserInfo {
  email: string; // 用户邮箱
  empId: string; // 用户邮箱
  mis: string; // 用户邮箱
  name: string; // 用户邮箱
}

export default class GlobalStore {
  @observable currentUser: IUserInfo = {
    email: '',
    empId: '',
    mis: '',
    name: ''
  };

  @observable bookRules = {
    minSpan: 15, // 会议最短分钟数
    maxSpan: 4 * 60, // 会议最长分钟数
    dayBookLimit: 8 // 可提前预订参数
  };

  /** 规则接口是否成功返回 */
  @observable bookRulesRequestDone = false;

  /** 特殊会议室带的提示文案 */
  @observable specialRoomsTips;
  /** 预定时特殊大厦下会议室带的提示文案 */
  @observable buildingBookTips = '';

  /** 培训会议大厦提示文案 */
  @observable trainRoomsTips: string;

  // 上一次打开的页面
  // 在页面unmount的时候记录
  // weekly edit rooms
  @observable lastPageId = '';

  // 是否展示独立弹开按钮
  @observable showPopBtn = true;

  // 是否展示分享按钮
  @observable showShare = false;

  // 用于判断缓存的初始化数据与获取到的是否一致，如果一致直接使用缓存数据发起的请求；如果不一致，重新发起请求校正数据
  @observable allInitSame = true;

  // 用于页面性能上报
  nPageReport = false;

  constructor() {
    window.Owl
      && window.Owl.addPoint({
        position: EPerformancePosition.GLOBAL_STORE_INIT,
        timeStamp: Date.now()
      });
    this.getShowPopup();
    this.getShowShare();
  }

  getShowPopup = async () => {
    const res = await dxJSSDK.showPopUp();
    this.setShowPopBtn(res);
  };

  getShowShare = async () => {
    const res = await dxJSSDK.showShare();
    this.setShowShare(res);
  };

  @action setAllInitSame = (value: boolean) => {
    this.allInitSame = value;
  };

  @action setShowPopBtn = (res) => {
    this.showPopBtn = res;
  };

  @action setShowShare = (res) => {
    this.showShare = res;
  };
  /**
   * action
   */
  @action.bound
  setData(data) {
    for (const key in data) {
      this[key] = data[key];
    }
  }

  /**
   * 获取当前登录用户的会议室配置
   */
  @action
  getBookRules = async (buildingId?: number) => {
    this.bookRulesRequestDone = false;
    try {
      const res = await getBookRules({ buildingId });
      if (res) {
        this.bookRulesRequestDone = true;
        this.bookRules = {
          minSpan: res.minSpan ? res.minSpan : 15,
          maxSpan: res.maxSpan ? res.maxSpan : 300,
          dayBookLimit: res.dayBookLimit ? res.dayBookLimit : 8
        };
        this.specialRoomsTips = res.specialRoomsTips;
        this.buildingBookTips = res.buildingBookTips;
        this.trainRoomsTips = res.trainRoomsTips;
      }
    } catch {
      this.bookRulesRequestDone = false;
    }
  };

  reportPage = (position: number) => {
    if (!this.nPageReport) {
      window.Owl
        && window.Owl.addPoint({
          position,
          timeStamp: Date.now()
        });
      this.nPageReport = true;
    }
  };

  @action.bound
  handleRoomsFeedback = () => {
    window.open('https://tt.sankuai.com/ticket/create?cid=17&tid=4955&iid=23681');
  };
}
