import { Dialog, Toast } from '@ss/mtd-react-native'
import { trackClick } from '@src/components/CommonTracker'
import KNB from '@mrn/mrn-knb'
import { MWSKeys } from '@common/helpers/MWSWrapper'
import { publishAction, ActionType, subscription } from './subscribe'
import PubSub from './PubSub'
import { AppName, getAppPackageInfo } from './app'

//#region AbortController API Declaration
// available since react native 0.60.0
// see https://github.com/react-native-community/releases/blob/master/CHANGELOG.md#v0600

interface AbortEvent extends Event {
  type: 'abort'
}

declare class AbortSignal {
  constructor()
  readonly aborted: boolean
  onabort: (event: AbortEvent) => void
}

declare class AbortController {
  constructor()
  readonly signal: AbortSignal
  abort(): void
}

//#endregion

// 多个请求失败，只弹一个错误
let isDialogShowing = false
const intranetWhiteList = [
  'avatar',
  'raptor',
  'seer',
  'lion',
  'qiangxian',
  'octo',
  'msg'
]
// 此处要区分无网络、公网、接口api本身出错
export function JudgeNetForVpn(domain: string, error: object) {
  // 获取网络状态RN桥：iOS有坑无法正确判断是否联网，Android 使用正常
  // 为此抛弃桥的方式判断是否联网，使用fetch 公网域名识别是否联网
  _fetch('https://km.sankuai.com', { timeout: 5000 })
    .then(res => {
      // 有网络
      doWithNet(domain, error)
    })
    .catch(e => {
      // 无网络
      Toast.open('网络出错，请联网后重试')
    })
}

function doWithNet(domain: string, error: object) {
  try {
    let w = intranetWhiteList.indexOf(domain)
    if (w > -1) {
      // 业务仅内网访问
      let url =
        'https://s3plus.vip.sankuai.com/v1/mss_0701f23087724b1699a5aa3ca38f3c85/onestest/3168353/mws.portal'
      _fetch(url, { timeout: 3000 })
        .then(data => {
          Toast.open(`${error}`)
        })
        .catch(e => {
          tipDialog(domain)
        })
    } else {
      // 业务开放公网
      // Toast.open('error ' + `${error}`)
    }
  } catch (e) {
    Toast.open('异常 ' + e)
  }
}

/*
 * 在 fetch 基础上增加一个 timeout 参数（ms），方便设置超时时间
 */
function _fetch(input: RequestInfo, init?: RequestInit & { timeout?: number }) {
  const customSignal = init?.signal
  const timeout = Number(init?.timeout)
  if (!customSignal && timeout > 0) {
    const controller = new AbortController()
    let timeoutID = 0

    const timer = new Promise<Response>((_, reject) => {
      timeoutID = setTimeout(() => {
        reject(new TypeError('Network request timeout'))
        controller.abort()
      }, timeout)
    })

    const task = fetch(input, {
      ...(init || {}),
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutID))

    return Promise.race([timer, task])
  }

  return fetch(input, init)
}

export function tipDialog(domain) {
  if (isDialogShowing) {
    return
  }
  isDialogShowing = true
  getAppPackageInfo()
    .then(appName => {
      if (AppName.dx === appName) {
        showTipDialog({
          message:
            transformName(domain) +
            '仅限内网访问，是否开启VPN？\n连接VPN后，请下拉刷新此页面！'
        })
      } else {
        throw new Error('No VPN Support')
      }
    })
    .catch(_ => {
      showTipDialog({
        message:
          transformName(domain) +
          '仅限内网访问\n请打开大象 app，\n点击右上角 “+” 号选择 “一键 VPN” \n或在工作台搜索 “VPN” 连接内网',
        cancelLabel: null,
        cancelCallback: null,
        confirmLabel: '知道了',
        confirmCallback: null
      })
    })
}

function showTipDialog(options: any) {
  // 检查网络、连接VPN
  Dialog.open({
    modalProps: {
      maskOpacity: 0.1,
      maskClosable: true
    },
    cancelLabel: '取消',
    confirmLabel: '开启',
    cancelCallback: info => {
      isDialogShowing = false
    },
    confirmCallback: () => {
      isDialogShowing = false
      subscription(data => {
        console.log('todossssqqq', data)
        PubSub.publish('vpn', 'some data slash params')
      }, ActionType.APPEAR)
      jumpVpn()
      trackClick(
        MWSKeys.Event.openVPN,
        MWSKeys.Page.HomeList,
        MWSKeys.Product,
        null
      )
    },
    ...options
  })
}

function transformName(doman: string) {
  if (doman != null && doman.length > 1) {
    if (doman.includes('qiangxian')) {
      return '抢鲜'
    } else if (doman?.toLowerCase()?.includes('msg')) {
      return '消息中心'
    } else if (doman?.toLowerCase()?.includes('octo')) {
      return 'OCTO'
    } else {
      return doman.charAt(0).toUpperCase() + doman.slice(1)
    }
  } else {
    return doman
  }
}
function jumpVpn() {
  KNB.openPage({
    url: 'mtdaxiang://www.meituan.com/vpn?_knbopeninapp=1',
    query: {
      // _knbopeninapp: 1
    }
  })
}
