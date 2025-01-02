import { List, NewList } from './list-node.js';

/**
 * 全局观察者，用于解耦
 * @type {(function())|*}
 */
export const Observer = (function () {
  const __message = {};
  return {
    /**
     * 注册观察者
     * @param type{String}
     * @param fn{Function}
     */
    register(type, fn) {
      if (__message[type] === undefined) {
        let list = NewList();
        list.pushFront(fn);
        __message[type] = list;
      } else {
        __message[type].pushBack(fn);
      }
    },
    /**
     * 事件广播
     * @param type{String}
     * @param args{undefined|Object}
     */
    fire(type, args) {
      if (!__message[type]) {
        return;
      }
      args = args || {};
      let cur = __message[type].front;
      while (cur !== null) {
        cur.val.call(this, args);
        cur = cur.next;
      }
    },
    /**
     * 取消观察者
     * @param type{String}
     * @param fn{Function}
     */
    remove(type, fn) {
      if (__message[type] instanceof List) {
        let cur = __message[type].back;
        while (cur !== null) {
          if (cur.val === fn) {
            __message[type].remove(cur);
            break;
          }
          cur = cur.prev;
        }
      }
    },
  };
})();
