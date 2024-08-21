import Client from '@xm/dxopen-client';
import { addModuleClick } from '@/services/lxService';
import {
  isTest,
  isInMeeting,
  isWebDaxiang,
  isPCDaxiang,
  isRightSideDaxiang,
  getChatType,
  EChatType
} from './environment';
import { cprVersion } from '.';

let appId;

const chatType = getChatType();

if (isInMeeting) {
  // 会议室中打开
  appId = isTest ? '101475' : '101383';
  // 在会议室微应用打开埋点
  addModuleClick('b_oa_c6aeig12_mc');
} else if (chatType === EChatType.GROUPCHAT) {
  // 群日程
  appId = isTest ? '101762' : '102051';
} else if (chatType === EChatType.CHAT) {
  // 单聊 查看日程
  appId = isTest ? '101764' : '102052';
} else {
  // 日程中打开
  appId = isTest ? '101631' : '101927'; // 根据插件实际ID填写 // 测试 101631 // 本地 101671
  // 在日程微应用及其它打开埋点
  addModuleClick('b_oa_ysla7rsf_mc');
}
let client;
try {
  client = (isPCDaxiang || isWebDaxiang) && !isRightSideDaxiang
    ? new Client({
      id: appId // 申请的应用 id
    })
    : null;
} catch (e) {
  console.error(e);
}

// 大象环境中才可以使用JSSDK
export const dxClient = client;

/**
 * 方法聚合
 */
export default {
  pageReload() {
    window.location.reload();
    // if ((isPCDaxiang || isWebDaxiang) && !isRightSideDaxiang) {
    //   dxClient.request({
    //     type: 'reload',
    //     params: {
    //       url: window.location.href
    //     },
    //     callback: (_, { rescode }) => {
    //       if (rescode === 404 || rescode === 401 || rescode === 403) {
    //         window.location.reload();
    //       }
    //     }
    //   });
    // } else {
    //   window.location.reload();
    // }
  },
  openDxVcard(xmUid, x, y) {
    try {
      // 暂时不处理浏览器访问兼容，因为容器迁移该能力还不可用
      dxClient.request({
        type: 'vCard',
        params: {
          uid: xmUid,
          position: { left: x, top: y } // 一般根据点击事件获取
        },
        callback: (err, { rescode, data }) => {
          // vCard关闭时触发，可以作为更新时机使用
          console.log(err, rescode, data);
        }
      });
    } catch (error) {
      console.log('[openDxVcard failed]');
    }
  },
  // 跳转会话
  openComment(xmUid, type) {
    try {
      if (isRightSideDaxiang) {
        // 大象侧边栏模式
        if (type === 'groupchat') {
          window.open(`mtdaxiang://www.meituan.com/chat?gid=${xmUid}`);
        } else {
          window.open(`mtdaxiang://www.meituan.com/chat?uid=${xmUid}`);
        }
      } else if (isPCDaxiang || isWebDaxiang) {
        // PC大象/ web大象打开
        dxClient.request({
          type: 'navigate',
          params: {
            type: type || 'chat', // chat groupchat pubchat
            uid: xmUid
          },
          callback: () => {}
        });
      } else {
        // 其他模式，例如web日程
        // eslint-disable-next-line no-lonely-if
        if (type === 'groupchat') {
          window.open(`https://x.sankuai.com/bridge/chat?gid=${xmUid}`);
        } else {
          window.open(`https://x.sankuai.com/bridge/chat?uid=${xmUid}`);
        }
      }
    } catch (error) {
      console.log('[openComment failed]');
    }
  },
  showPopUp() {
    return new Promise((resolve) => {
      // 在会议室微应用中不显示popUp
      // 不在pc大象中不显示popUp
      //  没有isPopUp方法，代表低版本方法或者大象 不显示popUp
      if (
        isInMeeting
        || !isPCDaxiang
        || isRightSideDaxiang
        || !dxClient.isPopUp
        || chatType === EChatType.GROUPCHAT
        || chatType === EChatType.CHAT
      ) {
        resolve(false);
      }
      // 支持大于6.1.100的版本
      const supportVesion = '6.1.100';
      dxClient.request({
        type: 'getDXInfo',
        callback: (_, { data }) => {
          // 6.1.0之上版本才显示
          if (
            !data
            || !data.version
            || !cprVersion(supportVesion, data.version)
          ) {
            resolve(false);
          } else {
            // 未弹开的情况不显示popUp
            dxClient
              .isPopUp()
              .then((result) => {
                resolve(!result);
              })
              .catch(() => {
                // 出现其它异常，可能是包的兼容性问题，降级不显示PopUp
                resolve(false);
              });
          }
        }
      });
    });
  },
  showShare() {
    return new Promise((resolve) => {
      // web端(浏览器、大象web)不展示分享
      if (!isPCDaxiang || isRightSideDaxiang) {
        resolve(false);
      }
      // 支持6.4.0及以上的版本, 灰度发布写成6.3.100
      const supportVesion = '6.3.99';
      dxClient.request({
        type: 'getDXInfo',
        callback: (_, { data }) => {
          console.log('dxVersion: ', data?.version, supportVesion);
          if (
            !data
            || !data.version
            || !cprVersion(supportVesion, data.version)
          ) {
            resolve(false);
          } else {
            resolve(true);
          }
        }
      });
    });
  },
  // 选人选群面板, 区分会话类型
  showSelectPerson() {
    return new Promise((resolve) => {
      dxClient.request({
        type: 'forwardSelectMode',
        disableTextInput: true,
        params: {
          filterType: ['chat', 'groupchat']
        },
        callback: (_, { rescode, data }) => {
          if (rescode === 0) {
            console.log(rescode, data);
            resolve(data);
          } else {
            resolve(null);
          }
        }
      });
    });
  },
  popUp() {
    return new Promise((resolve) => {
      dxClient.request({
        type: 'popUp',
        params: {},
        callback: (err, { rescode, data }) => {
          if (rescode === 0) {
            console.log(err, rescode, data);
            resolve(rescode);
          } else {
            resolve(false);
          }
        }
      });
    });
  },
  close() {
    try {
      dxClient.request({
        type: 'close',
        callback: (err, res) => {
          console.log(err, res);
        }
      });
    } catch (error) {
      console.log('[close groupPage failed]');
    }
  }
};
