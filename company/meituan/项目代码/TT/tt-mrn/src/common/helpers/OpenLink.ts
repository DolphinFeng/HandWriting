import { Platform } from '@mrn/react-native'
import MRNUtils from '@mrn/mrn-utils'
import KNB from '@mrn/mrn-knb'
export function openLink(link: string) {
  console.warn('open ' + link)
  // TODO mws mobile处理scheme
  if (link && link.indexOf('mtdaxiang://www.meituan.com') > -1) {
    KNB.use('openScheme', {
      url: link,
      success: function () {
        console.warn('openScheme success')
      },
      fail: function () {
        console.warn('openScheme error')
      }
    })
    return
  }
  //   if (Platform.OS === 'ios') {
  //     MRNUtils.openUrl(link)
  //   } else {
  KNB.openPage({
    url: link,
    query: {
      _knbopeninapp: 1
    }
  })
  //   }
}
