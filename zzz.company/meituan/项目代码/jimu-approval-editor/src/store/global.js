import { observable, action } from 'mobx';

export default class GlobalStore {
  constructor(root) {
    this.root = root;
  }

  @observable currentUser = {
    name: '',
    avatar: ''
  };

  @observable userInfo = {};

  @observable uacPermissionInfo = [];

  @observable curMenu = '';

  @observable menu = {
    selectedMenuKey: '',
    expandedMenuKeys: []
  };

  @observable currentPd = null;

  @observable flowRef;

  /**
   * action
   */
  @action.bound
  setData(data) {
    for (const key in data) {
      this[key] = data[key];
    }
  }

  @action.bound
  setUser(userInfo) {
    this.userInfo = userInfo;
  }

  changeUser = (opt) => {
    this.currentUser.name = opt.name;
    this.currentUser.avatar = opt.avatar;
    this.userInfo = opt;
  };

  setFlowRef = (ref) => {
    this.flowRef = ref;
  };

  setMenu = (newMenu) => {
    this.setData({
      menu: newMenu
    });
  };

  setCurrentPd = (pd) => {
    this.setData({
      currentPd: pd
    });
  };
}
