import React from 'react'
import { Provider } from 'react-redux'
import KNB from '@mrn/mrn-knb'
import { Platform, StatusBar } from '@mrn/react-native'
import MRNUtils from '@mrn/mrn-utils'
import PlatformHelper, {
  PlatformType
} from './../common/helpers/PlatfromHelper'
import {
  trackPageDisappear,
  trackPageAppear
} from '@src/components/CommonTracker'
import { MTDProvider } from '@ss/mtd-react-native'

interface LProps {
  product: string
  trackingId: string
  pageKey: string
  screen: any
  store: any
  extra?: any
}
interface DProps {
  screen: any
  product: string
  trackingId: string
  pageKey: string
  id?: number
  type?: string
  extra?: any
  extra2?: any
  store: any
}

let platformType: PlatformType
const checkDevice = () => {
  return PlatformHelper.isFromIpad()
}
export default class App extends React.Component<LProps> {
  state = { startTime: Date.parse(new Date().toString()) }

  async componentDidMount() {
    // getTokenAfterEnv().catch((e) => { console.warn(e) })

    let val = 'workbench'
    trackPageAppear(
      this.props.pageKey,
      this.props.trackingId,
      this.props.product,
      {
        source_type: val
      }
    )

    // fetchUserInfo()
    KNB.setStatusBarStyle({
      style: 0
    })
    if (Platform.OS === 'ios') {
      this.subscription()
    } else {
      // Android 状态栏
      StatusBar.setBackgroundColor('white')
      StatusBar.setBarStyle('dark-content') // 白底黑字
    }

    // await this.checkPlatform()
  }

  async checkPlatform() {
    let helper = PlatformHelper.getInstance()
    platformType = await helper.getCurrentPlatform()
    // console.warn('current type ' + platformType)
  }

  subscription() {
    KNB.subscribe({
      action: 'appear',
      handle: function (data) {
        KNB.setStatusBarStyle({
          style: 0
        })
      }
      // success: null,
      // fail: null
    })
  }

  unsubscription() {
    KNB.unsubscribe({
      subId: '',
      action: 'appear'
      // success: null,
      // fail: null
    })
  }

  componentWillUnmount() {
    let duration = Date.parse(new Date().toString()) - this.state.startTime
    let source = 'workbench'
    let val = { source: source, duration: duration }

    trackPageDisappear(
      this.props.pageKey,
      this.props.trackingId,
      this.props.product,
      {
        source_type: val
      }
    )

    if (Platform.OS === 'ios') {
      this.unsubscription()
    }
  }

  render() {
    let Rs = this.props.screen
    const isPad = checkDevice()
    return (
      <Provider store={this.props.store} key={Math.random()}>
        <MTDProvider>
            <Rs screenProps={{ extra: this.props.extra, isPad: isPad }} />
        </MTDProvider>
      </Provider>
    )
  }
}

export class PageDetail extends React.Component<DProps> {
  constructor(props) {
    super(props)
  }

  state = { startTime: Date.parse(new Date().toString()) }
  componentDidMount() {
    let val = 'link'
    trackPageAppear(
      this.props.pageKey,
      this.props.trackingId,
      this.props.product,
      { source: val }
    )
    KNB.setStatusBarStyle({
      style: 0
    })
    if (Platform.OS === 'ios') {
      this.subscription()
    } else {
      // Android 状态栏
      StatusBar.setBackgroundColor('white')
      StatusBar.setBarStyle('dark-content') // 白底黑字
    }
  }

  subscription() {
    KNB.subscribe({
      action: 'appear',
      handle: function (data) {
        KNB.setStatusBarStyle({
          style: 0
        })
      }
      // success: null,
      // fail: null
    })
  }

  unsubscription() {
    KNB.unsubscribe({
      subId: '',
      action: 'appear'
      // success: null,
      // fail: null
    })
  }

  componentWillUnmount() {
    let duration = Date.parse(new Date().toString()) - this.state.startTime
    let source = 'link'
    let val = { source: source, duration: duration }
    trackPageDisappear(
      this.props.pageKey,
      this.props.trackingId,
      this.props.product,
      {
        source: val
      }
    )

    if (Platform.OS === 'ios') {
      this.unsubscription()
    }
  }

  render() {
    let Ds = this.props.screen
    const isPad = checkDevice()
    return (
      <Provider store={this.props.store} key={Math.random()}>
        <MTDProvider>
        <Ds
            screenProps={{
              id: this.props.id,
              type: this.props.type,
              extra: this.props.extra,
              extra2: this.props.extra2,
              isPad: isPad
            }}
          />
        </MTDProvider>
      </Provider>
    )
  }
}
