/*
 * @Description: 统一消息提醒
 * @Author: zhaojingchao <zhaojingchao@meituan.com>
 * @Date: 2020-07-05 22:00:35
 * @LastEditors: zhaojingchao
 * @LastEditTime: 2020-10-20 16:13:57
 * @FilePath: /scheduleweb/src/utils/messageStore.ts
 */
import { observable, action } from 'mobx';
import { message } from '@ss/mtd-react';

const TIME_INTERVAL = 2000;
const TIME_SHOW_INTERVAL = 2000;

export default class MessageStore {
  static success = (content: string): void => {
    message.success({
      message: content,
      duration: TIME_SHOW_INTERVAL
    });
  };

  static error = (content: string): void => {
    message.error({
      message: content,
      duration: TIME_SHOW_INTERVAL
    });
  };

  static warning = (content: string): void => {
    message.warning({
      message: content,
      duration: TIME_SHOW_INTERVAL
    });
  };

  /**
   * 自定义成功弹窗
   * @param {string | ReactNode} content
   */
  static customSuccess = (content: any): any => {
    return message.success({
      message: content,
      duration: TIME_SHOW_INTERVAL
    });
  };

  @observable
  content = '';

  @observable
  private lastTime = 0;

  @action
  success = (content = ''): void => {
    if (!this.checkUpdateToast(content)) {
      return;
    }
    MessageStore.success(content);
  };

  @action
  customSuccess = (content: any): any => {
    if (!this.checkUpdateToast(content)) {
      return;
    }
    // eslint-disable-next-line consistent-return
    return MessageStore.customSuccess(content);
  };

  @action
  error = (content = ''): void => {
    if (!this.checkUpdateToast(content)) {
      return;
    }
    MessageStore.error(content);
  };

  @action
  warning = (content = ''): void => {
    if (!this.checkUpdateToast(content)) {
      return;
    }
    MessageStore.warning(content);
  };

  @action
  setContent = (content = ''): void => {
    this.content = content;
  };

  @action
  private setLastTime = (time: number): void => {
    this.lastTime = time;
  };

  /**
   * @name checkUpdateToast
   * @description 检查新传递进的content是否需要toast
   * 条件：
   *  1.不相同的content肯定需要toast，并更新content与lastTime记录
   *  2.相同的content需要判断时间间隔
   */
  private checkUpdateToast = (content: string): boolean => {
    const hasContentUpdate: boolean = this.content !== content;
    const current: number = new Date().getTime();
    const hasOverTime: boolean = current - this.lastTime > TIME_INTERVAL;
    if (hasContentUpdate || hasOverTime) {
      this.setContent(content);
      this.setLastTime(current);
      return true;
    }
    return false;
  };
}
