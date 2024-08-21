import MRNUtils from '@mrn/mrn-utils'
import KNB from '@mrn/mrn-knb'
import { forceGetAppName, forceGetUserMis } from '@src/common/helpers/api'

const chanelName = 'onecloud'

enum TrackerType {
  appear = 'appear',
  disappear = 'disappear',
  click = 'click'
}

// TODO: 确认 pageKey 的作用，考虑也放到 keys namesapce 里去
export async function trackPageDisappear(
  pageKey: string,
  cid: string,
  product: string,
  val: any
) {
  console.log(chanelName, pageKey, cid)
  let extraVal = await prepareExtraVal(TrackerType.disappear, product, val)
  if (extraVal.mmws_mis) {
    track(chanelName, pageKey, cid, extraVal)
  }
}

function track(chanelName: string, pageKey: string, cid: string, val: any) {
  if (MRNUtils.lxTrackPD) {
    MRNUtils.lxTrackPD(chanelName, pageKey, cid, val)
  } else if (MRNUtils.lxTrackMPTDisappear) {
    MRNUtils.lxTrackMPTDisappear(chanelName, pageKey, val)
  }
}

export async function trackPageAppear(
  pageKey: string,
  cid: string,
  product: string,
  val: any
) {
  let extraVal = await prepareExtraVal(TrackerType.appear, product, val)
  if (extraVal.mmws_mis) {
    MRNUtils.lxTrackMPT(chanelName, pageKey, cid, extraVal)
  }
}

export async function trackClick(
  bid: string,
  cid: string,
  product: string,
  val: any
) {
  let extraVal = await prepareExtraVal(TrackerType.click, product, val)
  if (extraVal.mmws_mis) {
    MRNUtils.lxTrackMGEClickEvent(chanelName, bid, cid, extraVal)
  }
}

function getNetworkStatus(): Promise<string> {
  return new Promise(function (fulfilled, rejected) {
    KNB.getNetworkType({
      success: function (ret) {
        const networkType = ret.networkType as string // '2g','3g','4g','wifi','none'(无网)，'unknown'

        console.log('getNetworkStatus', networkType)
        fulfilled(networkType)
      },
      error: function () {
        console.log('knb getNetworkStatus error')
        rejected()
      }
    })
  })
}

// TODO: 确认这里是否需要特别处理
async function prepareExtraVal(
  type: TrackerType,
  product: string,
  val: any
): Promise<any> {
  let _val = val ? val : {}
  let _product = product ? { mmws_product: product } : {}
  let _app = { mmws_app: await forceGetAppName() }
  let _mis = { mmws_mis: await forceGetUserMis() }

  let extraVal = Object.assign(
    {},
    { channel_classify: 'mmws' },
    _product,
    _val,
    _app,
    _mis
  )
  console.log(type, 'tracking ', extraVal)
  return extraVal
}
