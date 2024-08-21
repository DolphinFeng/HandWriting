import {
  observable, action
} from 'mobx';
import {
  getUserInfo,
  getShareToMeList,
  getShareToOtherList,
  deleteShareToMe,
  saveShareToOther,
  cancelShareToOther,
  saveEditShareToOther,
  saveShareCheck,
  getMailStatus,
  setMailStatus
} from '@/services/apis';
import { SCHEDULE_THEME } from './const';
import { StorageService } from '@/services/storage';
import { PageDataService } from '@/services/pageData.js';
import { isArray } from 'lodash';
import { addResError } from '@/utils';
import { setMetric } from '@/utils/owl';
import { EMetricKey } from '@/utils/metrics';

const ME_INFO_KEY = 'meInfoKey';
const SHARE_TO_ME_KEY = 'showToMe';


/**
 * 日程来源数据
 */
export default class ScheduleSharePanelStore {
  // 分享给我的列表
  @observable meInfo = null;

  // 共享给我的列表
  @observable shareToMeList = [];

  // 共享给别人的列表
  @observable shareToOtherList = [];

  // 共享给别人的列表loading
  @observable shareOtherLoading = true;

  // 邮箱设置状态
  @observable mailStatus = 0; // 0表示用户目前状态是自动移除邮件 1表示用户目前状态是恢复接受邮件

  // 邮箱状态loading
  @observable mailStatusLoading = true;

  nUserSameAsLocal = false;

  initShareToMeList = [];

  constructor() {
    // 直接通过localStorage 初始化基本信息
    this.initInfoFromStorage();
  }

  initInfoFromStorage = () => {
    const meInfo = StorageService.getItem(ME_INFO_KEY);
    const shareToMeList = StorageService.getItem(SHARE_TO_ME_KEY);
    // 缓存和Node值一致则名字用户个人信息一致
    this.nUserSameAsLocal = meInfo?.mis && meInfo?.mis === PageDataService.get('userInfo')?.mis;
    if (this.nUserSameAsLocal && isArray(shareToMeList)) {
      // 保障未切换账号，再使用localStorage
      this.setData({
        meInfo,
        shareToMeList
      });
      this.initShareToMeList = shareToMeList;
      setMetric(EMetricKey.COMMON_LOCAL_STORAGE_SAVED, 1);
    } else {
      setMetric(EMetricKey.COMMON_LOCAL_STORAGE_SAVED, 0);
    }
  };

  sameShareListAsStorage = (newList: any[]) => {
    // 获取列表根据选择的人员来获取周视图
    const newCheckListStr = newList.filter(item => !!item.checked).map(item => item.userId).sort().join(',');
    const oldCheckListStr = this.initShareToMeList.filter(item => !!item.checked).map(item => item.userId).sort().join(',');
    // 有新的选择的共享人，代表不是默认配置
    setMetric(EMetricKey.COMMON_LOCAL_STORAGE_DEFAULT, newCheckListStr ? 1 : 0);
    return newCheckListStr === oldCheckListStr;
  };

  /**
   * 更新数据
   */
  @action.bound
  setData(data: any) {
    for (const key in data) {
      this[key] = data[key];
    }
  }

  /**
   * 获取我的信息
   */
  @action.bound
  async getUserInfo() {
    const data = window.userinfoPromise ? await window.userinfoPromise : await getUserInfo();
    window.userinfoPromise = null;
    const meInfo = { ...data, checked: true, scheduleTheme: SCHEDULE_THEME[0] };
    this.setData({ meInfo });
    StorageService.setItem(ME_INFO_KEY, meInfo);
    return data;
  }

  /**
   * 获取共享给我的列表
   */
  @action.bound
  async getShareToMeList(first?: boolean) {
    const data = window.toMePromise ? await window.toMePromise : await getShareToMeList();
    window.toMePromise = null;
    const shareToMeList = !Array.isArray(data)
      ? []
      : data.map((item, index) => {
        return {
          id: item.id,
          userId: item.userId, // 共享人用户ID
          userName: item.userName, // 共享人NAME
          userMis: item.userMis, // 共享人MIS
          userAvatar: item.userAvatar, // 共享人头像
          applicationData: item.applicationData, // 日程来源
          checked: item.checked, // 是否选择
          scheduleTheme: SCHEDULE_THEME[index + 1],
          enName: item.enName // 英文别名
        };
      });

    StorageService.setItem(SHARE_TO_ME_KEY, shareToMeList);
    this.setData({ shareToMeList });

    const nSameShare = first ? this.sameShareListAsStorage(shareToMeList) : false;
    return nSameShare;
  }

  /**
   * 获取共享给别人的列表
   */
  @action.bound
  async getShareToOtherList() {
    this.setData({ shareOtherLoading: true });
    const data = await getShareToOtherList();
    this.setData({
      shareOtherLoading: false,
      shareToOtherList: data.map((item) => {
        return {
          id: item.id,
          isEdit: false, // 是否编辑模式
          status: item.status, // 是否通过验证
          shareUserId: item.shareUserId,
          shareUserName: item.shareUserName, // 共享人NAME
          shareUserMis: item.shareUserMis, // 共享人MIS
          shareUserAvatar: item.shareUserAvatar, // 共享人头像
          applicationData: item.applicationData, // 日程来源
          applicationIdList: item.applicationIdList // 日程来源
        };
      })
    });
  }

  /**
   * 保存 - 我的共享日程给别人
   */
  @action.bound
  async saveShareToOther(id) {
    const shareToOtherItem = this.shareToOtherList.find(
      item => item.id === id
    );
    if (!shareToOtherItem.shareUserId) return 'noUser';
    if (shareToOtherItem.applicationIdList?.length === 0) return 'noSource';
    if (!shareToOtherItem.applicationData) {
      const data = await saveShareToOther({
        shareUserId: shareToOtherItem.shareUserId,
        applicationIdList: shareToOtherItem.applicationIdList
      });
      this.setData({
        shareToOtherList: this.shareToOtherList.map((item) => {
          if (item.id === id) {
            item = data;
          }
          return item;
        })
      });
    } else {
      await saveEditShareToOther(id, shareToOtherItem.applicationIdList);
      this.getShareToOtherList();
    }
    return true;
  }

  /**
   * 撤回邀请 - 我的共享日程给别人
   */
  // TO_BE_CONFIRMED(0,"待确认"),
  // CONFIRMED(1,"已确认"),
  // REJECTED(2,"已拒绝"),
  // WITHDRAWN(3,"已撤回");
  @action.bound
  cancelShareToOther = async (id: number) => {
    await cancelShareToOther(id);
  };

  /**
   * 删除别人共享给我的日程
   */
  @action.bound
  deleteShareToMe = async (id: number) => {
    await deleteShareToMe(id);
  };

  /**
   * 切换日程共享用户
   */
  @action.bound
  async changeShareUser(id: any) {
    if (id === 'self') {
      this.setData({
        meInfo: { ...this.meInfo, checked: !this.meInfo.checked }
      });
      addResError('changeSelectSelf', '切换选中自己', {
        id,
        checked: this.meInfo.checked
      });
    } else {
      await saveShareCheck(
        id,
        this.shareToMeList.find(item => item.id === id)?.checked
          ? 'hide'
          : 'show'
      );
      this.setData({
        shareToMeList: this.shareToMeList.map((item) => {
          if (item.id === id) {
            return { ...item, checked: !item.checked };
          }
          return item;
        })
      });
    }
  }

  /**
   * 获取当前登录用户邮件通知状态 0表示用户目前状态是自动移除邮件 1表示用户目前状态是恢复接受邮件
   */
  @action.bound
  getSettingMailStatus = async () => {
    try {
      this.setData({ mailStatusLoading: true });
      const res = await getMailStatus();
      this.setData({ mailStatusLoading: false, mailStatus: res });
    } finally {
      this.setData({ mailStatusLoading: false });
    }
  };

  /**
   * 邮件通知状态设置
   */
  @action.bound
  setSettingMailStatus = async (status: number) => {
    await setMailStatus({ status });
    this.setData({ mailStatus: status });
  };
}
