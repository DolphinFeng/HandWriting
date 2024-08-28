import { observable, action } from 'mobx';
import {
  fetchDataService,
  postActionService,
  postFormService
} from '@/services/common';

export default class GlobalStore {
  constructor(root) {
    this.root = root;
  }

  @observable data = {};

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
  setUrlData(url, data) {
    this.data[url] = data;
  }

  /**
   * params: {
   *  url: string,
   *  params: {}
   * }
   */
  fetchData = async (url, params) => {
    const data = await fetchDataService(url, params);
    this.setUrlData(url, data);
  };

  /**
   * params: {
   *  url: string,
   *  params: {}
   * }
   */
  postAction(url, params) {
    // post
    postActionService(url, params);
  }

  /**
   * params: {
   *  url: string,
   *  params: {}
   * }
   */
  postForm(url, params) {
    //
    postFormService(url, params);
  }
}
