import React from 'react'
import { AppRegistry } from '@mrn/react-native'
import App, { PageDetail } from '@components/App'
import {
  RootStack,
  DetailRootStack,
  HomeListStack,
  HomeExternalStack,
  CreateNewTTFromUrl,
  HomeSpaceStack,
  RGStack
} from './routers'
import store from './redux/store'
import { TTKeys } from '@src/pages/tt/constants/TTKeys'
import HomeList from './components/home/HomeList'
import HomeExternal from './components/home/HomeExternal'
import queryString from 'query-string'
import { ExtCatModel } from './components/create/CreateAssignSection'
import { ExtCustomModel } from './components/create/CreateNewTTChild'
import HomeSpace from './components/home/HomeSpace'
import { updateSpaceDomain } from '../../common/store/actions'
import { owl } from '@mrn/mrn-owl'
import { initOwl } from '@src/common/helpers/HelperFunctions'
import { i18nClient,I18nextProvider, I18nClient } from '@sailor/i18n-mrn'
import resources from '@src/assets/locales/resources'

initOwl('rn_bfe_tt')
i18nClient.init({
  lng: 'zh',
  resources,
  interpolation: {
    escapeValue: false // react 不需要这个
  },
  react: {
    useSuspense: false
  }
})

// 列表
// props : 用户埋点的trackingId和pageKey；screen是注册的页面
let AppContainer = App
class TTApp extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <I18nextProvider i18n={i18nClient}>
        <AppContainer
          product={TTKeys.Product}
          trackingId={TTKeys.Page.Home}
          pageKey={'mmwsTtHome'}
          screen={RootStack}
          store={store}
        />
      </I18nextProvider>
    )
  }
}

class TTHomeExternal extends React.Component {
  id: any

  constructor(props) {
    super(props)
    // let originalUrl = 'http://tt.cloud.test.sankuai.com/ticket/helpdesk/5973'
    // 阿波罗跳转链接
    // let originalUrl = 'https://tt.sankuai.com/ticket/helpdesk/5805'
    let originalUrl = props.hasOwnProperty('originURL')
      ? props.originURL
      : 'originalurl'

    let url = decodeURIComponent(originalUrl)

    if (url.includes('ticket/helpdesk')) {
      let regexp = /([0-9]+)/g
      let spl = url.match(regexp)
      this.id = 0
      try {
        this.id = Number(spl[0])
        console.log('id ' + this.id)
      } catch (e) {
        console.warn(e)
      }
    }
  }

  render() {
    return (
      <PageDetail
        screen={HomeExternalStack}
        product={TTKeys.Product}
        trackingId={TTKeys.Page.HomeExternal}
        pageKey={'mmwsTtHomeExternal'}
        store={store}
        id={this.id}
      />
    )
  }
}

class TTHomeList extends React.Component {
  _extra: any // {pageType:todo}
  _queries: any
  constructor(props) {
    super(props)
    let type = props.hasOwnProperty('pageType') ? props.pageType : null

    let originalUrl = props.hasOwnProperty('originURL') ? props.originURL : null

    // originalUrl = 'http://tt.cloud.test.sankuai.com/ticket/list?filter=todo'
    // originalUrl = 'http://tt.cloud.test.sankuai.com/ticket/list?filter=mine'
    // originalUrl = 'http://tt.cloud.test.sankuai.com/ticket/list?filter=favor'
    // originalUrl = 'http://tt.cloud.test.sankuai.com/ticket/list?filter=createdBy'
    // originalUrl = 'http://tt.cloud.test.sankuai.com/ticket/list?filter=joinBy'
    // originalUrl = 'http://tt.cloud.test.sankuai.com/ticket/list?filter=all'

    if (originalUrl != null) {
      let url = decodeURIComponent(originalUrl)
      try {
        const params = url.split('?')[1]
        this._queries = {}
        this._queries = queryString.parse(params)
        console.warn('tt home  ', this._queries)
        if (this._queries.filter != null) {
          if (this._queries.filter === 'all') {
            type = 'todo'
          } else {
            type = this._queries.filter
          }
        }
      } catch (error) {}
    }

    this._extra = { pageType: type }
  }

  render() {
    return (
      <PageDetail
        screen={HomeListStack}
        product={TTKeys.Product}
        trackingId={TTKeys.Page.HomeListFromDX}
        pageKey={'mmwsTtHomeList'}
        extra={this._extra}
        store={store}
      />
    )
  }
}

// props : 用户埋点的trackingId和pageKey；screen是注册的页面；id打开详情需要的id,如coeId、flowId
// 其中id需要从url中获取，具体匹配规则需依赖各业务场景
class Detail extends React.Component {
  id: any
  queries: any
  constructor(props) {
    super(props)
    let originalUrl = 'originalurl'
    if (props.hasOwnProperty('originURL')) {
      originalUrl = props.originURL
    } else if (props?.data) {
      // 蜜蜂接入TT 兼容逻辑
      const data = JSON.parse(props.data)
      if (data?.originURL) {
        originalUrl = data.originURL
      }
    }
    let url = decodeURIComponent(originalUrl)
    // url = 'http://tt.cloud.test.sankuai.com/ticket/detail?id=42642184'
    // url = 'http://tt.cloud.test.sankuai.com/ticket/detail?id=42642055'
    // url = 'http://tt.cloud.test.sankuai.com/ticket/list?id=3213786&filter=createdBy'
    // url = 'https://tt.sankuai.com/ticket/detail?id=6906413'
    // url = 'https://tt.sankuai.com/ticket/list?filter=createdBy&id=7499840&unsatisfy=true'
    // V6.2 满意度优化，详情链接中增加unsatisfy=true参数，标记进入详情并打开满意度面板
    // url = 'http://tt.cloud.test.sankuai.com/ticket/detail?id=40000259'
    // url = 'http://tt.cloud.test.sankuai.com/ticket/detail?id=40002135' // 重新打开tt处理

    let regexp = /(.*)id=([0-9]+)(.*)/
    let spl = url.match(regexp)
    this.id = 0
    this.queries = {}
    try {
      const params = url.split('?')[1]
      this.queries = queryString.parse(params)
      console.log('qqq ', this.queries)
      if (this.queries?.id > 0) {
        this.id = this.queries.id
        console.log('id ' + this.id)
      }
    } catch (e) {
      console.warn(e)
    }
  }

  render() {
    return (
      <PageDetail
        screen={DetailRootStack}
        product={TTKeys.Product}
        trackingId={TTKeys.Page.DetailFromDX}
        pageKey={'mmwsTtDetail'}
        id={this.id}
        extra={this.queries}
        store={store}
      />
    )
  }
}

class TTCreateFromUrl extends React.Component {
  extCatModel: ExtCatModel
  extCustomModel: ExtCustomModel

  constructor(props) {
    super(props)
    // let originalUrl = 'http://tt.cloud.test.sankuai.com/ticket/create?cid=1301&tid=3687&iid=10798'
    // let originalUrl = 'http://tt.cloud.test.sankuai.com/ticket/custom/create/3549/5973'

    // let originalUrl = 'https://tt.sankuai.com/ticket/custom/create/422/2640'
    // let originalUrl = 'https://tt.sankuai.com/ticket/custom/create/318/3735'   // 不存在
    // let originalUrl = 'https://tt.sankuai.com/ticket/create?cid=112&tid=2195&iid=9338'

    // let originalUrl = 'http://tt.cloud.test.sankuai.com/ticket/custom/create/3423/18824'
    // let originalUrl = 'https://tt.sankuai.com/ticket/create?category=999%E5%B8%AE%E5%8A%A9%E5%8F%B0&type=365%E7%BE%A4%E9%97%AE%E9%A2%98%E5%8F%8D%E9%A6%88&item=365%E7%BE%A4%E9%97%AE%E9%A2%98%E5%8F%8D%E9%A6%88-%E5%B7%A5%E5%8D%95%E9%93%BE%E6%8E%A5'
    // let originalUrl = 'http://tt.cloud.test.sankuai.com/ticket/create?category=到家交易系统平台&type=商品中心&item=1111'

    // let originalUrl = 'http://tt.cloud.test.sankuai.com/ticket/custom/create/3778/18621'
    // let originalUrl = 'http://tt.cloud.test.sankuai.com/ticket/custom/create/7940/26009'
    /** 空间相关 */
    // let originalUrl = 'https://tt.sankuai.com/public/create?cid=18&tid=2500&iid=11267'  // 可以修改目录
    // let originalUrl = 'https://tt.sankuai.com/public/create?cid=87&tid=1885&iid=7818'  // 不能修改目录
    // let originalUrl = 'http://tt.cloud.test.sankuai.com/aaa/create?cid=12&tid=713&iid=11616'  // 不能修改目录
    // let originalUrl = 'http://tt.cloud.test.sankuai.com/public/create?cid=12&tid=713&iid=11616'  // 可以修改

    // let originalUrl = 'https://tt.sankuai.com/qishou-app/create'
    // let originalUrl = 'https://tt.sankuai.com/kl-consult/create'
    // let originalUrl = 'https://tt.sankuai.com/kl-consult/create?cid=13&tid=362&iid=1035'

    // let originalUrl = 'http://tt.cloud.test.sankuai.com/ticket/custom/create/4859/22542' //自定义表单目录，自定义切普通
    // let originalUrl = 'http://tt.cloud.test.sankuai.com/ticket/custom/create/15645/26009' // 获取目录问题
    // let originalUrl = 'http://tt.cloud.test.sankuai.com/ticket/create'
    // let originalUrl = 'http://tt.cloud.test.sankuai.com/ticket/create?cid=20&tid=293&iid=14106&source=moses&associatedField=xxx'
    // let originalUrl = 'http://tt.cloud.test.sankuai.com/ticket/create?cid=3387&tid=6050&iid=13924&source=moses&associatedField=xxx'
    // let originalUrl = 'https://tt.cloud.test.sankuai.com/ticket/custom/create/422/2640?source=moses&associatedField=xxx'
    // let originalUrl = 'http://tt.cloud.test.sankuai.com/helpdesk/create?source=moses&associatedField=%7B%22sessionId%22%3A%220f7e56c0-e8fd-11eb-8bd8-83a7b5d924a9%22%7D'

    let originalUrl = 'originalurl'
    if (props.hasOwnProperty('originURL')) {
      originalUrl = props.originURL
    } else if (props?.data) {
      // 蜜蜂接入TT 兼容逻辑
      const data = JSON.parse(props.data)
      if (data?.originURL) {
        originalUrl = data.originURL
      }
    }
    console.log('登录 url：', originalUrl)
    // originalUrl = 'http://tt.cloud.test.sankuai.com/ticket/custom/create/11294/7'
    let url = decodeURIComponent(originalUrl)
    if (url.includes('/create')) {
      const params = url.split('?')[1]
      const queries = queryString.parse(params)
      if (url.includes('ticket/custom/create')) {
        console.log('自定义表单发起')

        let regexp = /(.*)create\/([0-9]+)\//
        let spl = url.match(regexp)

        if (!spl) {
          return
        }
        // 表单ID
        let result
        try {
          console.log(Number(spl[2]))
          result = Number(spl[2])
        } catch (e) {
          console.log(e)
        }

        if (result > 0) {
          let m = new ExtCustomModel()
          m.formId = result

          this.extCustomModel = Object.assign(queries, m)
          console.log('extCustomModel extCustomModel', this.extCustomModel)
        }
      } else if (url.includes('?')) {
        const reg = /\/[^\s]*\/create/g
        const matchSpace = reg.test(url)
        if (matchSpace && !url.includes('/ticket/create')) {
          console.log('parse space url')
          this.parseSpaceUrl(url, queries)
        } else {
          if (params?.includes('cid')) {
            this.parseNewUrl(url, params)
          } else if (params?.includes('category')) {
            this.parseOldUrl(params)
          } else if (params?.includes('source')) {
            // 公共空间 + 存在source字段
            this.parseSpaceUrl(url, queries)
          }
        }
      } else {
        // e.g. https://tt.sankuai.com/qishou-app/create
        this.parseSpaceUrl(url, queries)
      }
      console.log('extCatModel === ', this.extCatModel)
      console.log('extCustomModel ===', this.extCustomModel)
    }
  }

  parseSpaceUrl(url, queries?) {
    let m = new ExtCatModel()

    const regex = /(.*)(.sankuai.com\/)(.*)(\/create)(.*)/
    let spl = url.match(regex)
    console.log('space create ', spl)

    m.domain = spl[3]
    store.dispatch(updateSpaceDomain(m.domain))

    this.extCatModel = Object.assign(queries, m)
  }

  parseNewUrl(url, params) {
    const queries = queryString.parse(params)

    const list = [queries.cid, queries.tid, queries.iid].map(i =>
      parseInt(i as string, 10)
    )

    if (queries && list.every(i => i > 0)) {
      let m = new ExtCatModel()

      m.cid = list[0]
      m.tid = list[1]
      m.iid = list[2]

      // 空间发起，排除 ticket/create 形式的链接处理，否则容易把 ticket 当成空间
      if (
        url?.includes('/create?cid') &&
        !url?.includes('/ticket/create?cid')
      ) {
        const regex = /(.*)(.sankuai.com\/)(.*)(\/create\?cid)(.*)/
        let spl = url.match(regex)

        console.log('space list', spl)

        if (spl && spl[3]) {
          m.domain = spl[3]
          store.dispatch(updateSpaceDomain(m.domain))
        }
      } else {
        // 补充一下公共空间发起也更新domain的逻辑
        store.dispatch(updateSpaceDomain('ticket'))
      }

      this.extCatModel = Object.assign(queries, m)
    }
  }

  parseOldUrl(params) {
    const queries = queryString.parse(params)

    const list = [queries.category, queries.type, queries.item].map(
      i => i as string
    )

    console.log('cat id from old url', list)

    if (queries && list.every(i => i != null)) {
      let m = new ExtCatModel()

      m.category = list[0]
      m.type = list[1]
      m.item = list[2]

      this.extCatModel = m
    }
  }

  render() {
    return (
      <PageDetail
        screen={CreateNewTTFromUrl}
        product={TTKeys.Product}
        trackingId={TTKeys.Page.CreateFromUrl}
        pageKey={'mmwsTtCreateFromUrl`'}
        store={store}
        extra={this.extCatModel}
        extra2={this.extCustomModel}
      />
    )
  }
}

class TTSpaceHomeFromUrl extends React.Component {
  // extCatModel: ExtCatModel
  // extCustomModel: ExtCustomModel

  spaceName: string
  displayType: 'home' | 'list'

  constructor(props) {
    super(props)

    // let originalUrl = 'http://tt.cloud.test.sankuai.com/public'
    // let originalUrl = 'http://tt.cloud.test.sankuai.com/public/custom/form/list'

    // let originalUrl = 'http://tt.cloud.test.sankuai.com/aaa'   // 自带部分目录

    // let originalUrl = 'http://tt.sankuai.com/qishou-app'  // 正常
    // let originalUrl = 'http://tt.sankuai.com/qishou-app/'  // regex有问题

    let originalUrl = props.hasOwnProperty('originURL')
      ? props.originURL
      : 'originalurl'

    let url = decodeURIComponent(originalUrl)

    try {
      if (url.includes('custom/form/list')) {
        const regex = /(.*)(.sankuai.com\/)(\w+)(\/custom\/form\/list)/
        let spl = url.match(regex)

        console.log('space list ', spl[0], spl[1], spl[2], spl[3])
        this.spaceName = spl[3]
        this.displayType = 'list'
      } else {
        console.log('else111', url)

        const regex = /(.*)(.sankuai.com\/)(.*)/
        let spl = url.match(regex)

        console.log('space home ', spl)

        this.spaceName = spl[3]
        this.displayType = 'home'
      }
    } catch (error) {
      console.log('error111222', url, error)

      this.displayType = 'home'
      this.spaceName = 'public'
    }
  }

  render() {
    return (
      <PageDetail
        screen={HomeSpaceStack}
        product={TTKeys.Product}
        trackingId={TTKeys.Page.Space}
        pageKey={'mmwsTtSpace`'}
        store={store}
        extra={this.spaceName}
        extra2={this.displayType}
      />
    )
  }
}

class RG extends React.Component {
  rgId: any
  queries: any
  constructor(props) {
    super(props)
    let originalUrl = props.hasOwnProperty('originURL')
      ? props.originURL
      : 'originalurl'

    let url = decodeURIComponent(originalUrl)

    // url = 'http://1930-cfxik-sl-tt.cloud.test.sankuai.com/ticket/moses-helper?rgId=19955'

    let regexp = /(.*)rgId=([0-9]+)(.*)/
    let spl = url.match(regexp)
    this.rgId = 0
    this.queries = {}
    try {
      const params = url.split('?')[1]
      this.queries = queryString.parse(params)
      console.log('qqq ', this.queries)
      if (this.queries?.rgId > 0) {
        this.rgId = this.queries.rgId
        console.log('rgId ' + this.rgId)
      }
    } catch (e) {
      console.warn(e)
    }
  }

  render() {
    return (
      <PageDetail
        screen={RGStack}
        product={TTKeys.Product}
        trackingId={TTKeys.Page.RG}
        pageKey={'mmwsTTRG'}
        id={this.rgId}
        extra={this.queries}
        store={store}
      />
    )
  }
}

AppRegistry.registerComponent('tthome', () => TTApp)
AppRegistry.registerComponent('tthelpdesk', () => TTHomeExternal)
AppRegistry.registerComponent('tthomelist', () => TTHomeList)
AppRegistry.registerComponent('ttdetail', () => Detail)
AppRegistry.registerComponent('ttcreate', () => TTCreateFromUrl)
AppRegistry.registerComponent('ttspacehome', () => TTSpaceHomeFromUrl)
AppRegistry.registerComponent('ttRG', () => RG)

// module注册顺序： index.tsx -> App.tsx -> routers.tsx
