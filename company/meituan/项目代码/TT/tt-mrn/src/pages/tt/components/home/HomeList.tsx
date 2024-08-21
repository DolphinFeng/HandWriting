import React, { Component } from 'react'
import {
  View,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  Dimensions,
  Platform
} from '@mrn/react-native'
import { isIPhoneWithNotch } from '@src/common/styles/NavigationStyle'
import MWSList from '@src/components/MWSList'
import { MWSStyle } from '@src/common/styles/MWSCommonStyle'
import { checkNull } from '@src/common/helpers/HelperFunctions'
import {
  getTicketList,
  ttPost,
  getTicketMyJoinList,
  getTicketListNumber
} from '../../constants/TTApi'
import {
  TicketListItem,
  TicketListNumberModel,
  CCPersonModel
} from '../../constants/TTServiceModule'
import { dStyle, TTHomeListStyle, convertHex } from '../../constants/TTStyle'
import {
  Sla2CN,
  SLA_STATE_COLOR,
  SLA_OUTER_COLOR,
  SLA
} from '../../constants/ConfigMap'
import { formatDate2 } from '@src/common/helpers/FormatDate'
import theme from '@src/common/styles/MWSStyle'
import FilterHeader from '@src/common/helpers/filterPanel/FilterHeader'
import SlideOpenWrapper from '@src/components/SlideOpenWrapper'
import HomeFilter, { TTHomeFilterModel, TicketStatusList } from './HomeFilter'
import { Tab, Icon, Tip } from '@ss/mtd-react-native'
import { connect } from 'react-redux'
import { Toast } from '@ss/mtd-react-native'
import store, { RootState } from '../../redux/store'
import { requestCurrentUser } from '../common/TTHelper'
import { MWSSearchList } from '@src/components/MWSSearchList'
import HeaderRightBtn from '@src/components/NavRightButton'
import NavLeftBar from '@src/components/NavLeftBar'
import { getKey, forceGetToken } from '@src/common/helpers/api'
import { renderInsetSeprator } from '@src/components/BaseComponents'
import TTFilterHeader from './TTFilterHeader'
import { TTKeys } from '../../constants/TTKeys'
import { ttTrackPageAppear, ttTrackPageDisappear } from '../common/TTTracker'
import { i18nClient, withTranslation } from '@sailor/i18n-mrn'

const testHomeListLink = 'http://tt.cloud.test.sankuai.com/ticket/list?filter'
const onlineHomeListLink = 'https://tt.sankuai.com/ticket/list?filter'

export enum TTHomePageType {
  todo = 'todo',
  assignMe = 'mine',
  ccMe = 'favor',
  created = 'createdBy',
  myJoin = 'joinBy',
  faqi = 'faqi'
}

const fullTTHomePageList = [
  TTHomePageType.todo,
  TTHomePageType.assignMe,
  TTHomePageType.ccMe,
  TTHomePageType.created,
  TTHomePageType.myJoin
]

const externalUserTTHomePageList = [
  TTHomePageType.created,
  TTHomePageType.assignMe
]

export function getTTHomePageList(isExternalUser: boolean) {
  return isExternalUser ? externalUserTTHomePageList : fullTTHomePageList
}

interface IProps {
  navigation: any
  screenProps: any
  isExternalUser: boolean
}

interface IState {
  pageType: TTHomePageType
  fitlerDroppedDown: boolean
  listNumberModel?: TicketListNumberModel
  isSearching: boolean
  searchKeyWord: string,
  title: string,
}

const { width, height } = Dimensions.get('window')

class HomeList extends Component<IProps, IState> {
  private listRef = null
  private pageSize = 20
  private filterPanelDroppedDown: boolean = false
  // private listNumberModel: TicketListNumberModel = null

  filterWrapper: SlideOpenWrapper = null

  // redux更新 filter 后，存放在这里，用于所有地方处理 filter
  localFilterModel = null

  currentUser: CCPersonModel = null
  filterRef = null
  _tab: Tab = null

  defaultRequestOptions = {
    state: [],
    name: '',
    sla: [],
    ticketType: [],
    assigned: '',
    createdBy: '',

    createdAtStart: '',
    createdAtEnd: '',
    ctiNameList: [],
    rgIds: [],
    cc: [],
    labels: []
  }

  constructor(props) {
    super(props)

    // FIXME: 进来的时候，需要当前tab项在可见范围
    let pageType = TTHomePageType.todo
    if (this.props.navigation.getParam('pagetype')) {
      pageType = this.props.navigation.getParam('pagetype')
    } else if (this.props.screenProps?.extra?.pageType) {
      pageType = this.props.screenProps.extra.pageType
    }

    console.log('pagetype ', pageType)

    this.state = {
      pageType: pageType,
      fitlerDroppedDown: false,
      listNumberModel: null,
      isSearching: false,
      searchKeyWord: ''
    }

    this.currentUser = this.props.navigation.getParam('currentUser')

    this.setupFilter()
  }

  _sub = null

  private trackingId = TTKeys.Page.HomeList
  private pageKey = 'mmwsTtHomelist'

  async componentDidMount() {
    ttTrackPageAppear(this.pageKey, this.trackingId, { source: 'inner' })

    if (Platform.OS === 'ios') {
      await forceGetToken()
    }
    this.requestListNumber()

    await this.requestUser()

    if (
      this.state.pageType !== TTHomePageType.todo &&
      this.state.pageType !== TTHomePageType.assignMe
    ) {
      const index = this.pageList.indexOf(this.state.pageType)

      setTimeout(() => {
        this._tab?.scrollTo(index)
      }, 400)
    }

    this._sub = this.props.navigation?.addListener('didFocus', () => {
      this.requestListNumber()
    })

    this.props.navigation.setParams({ title: i18nClient.t('components_home_543a6f', { defaultValue: '我的TT' }) });
  }

  UNSAFE_componentWillReceiveProps(nextProps: IProps) {
    const pages = getTTHomePageList(nextProps.isExternalUser)
    if (pages.indexOf(this.state.pageType) < 0) {
      this.setState({ pageType: pages[0] })
    }
  }

  componentWillUnmount() {
    ttTrackPageDisappear(this.pageKey, this.trackingId, { source: 'inner' })
    this._sub?.remove()
  }

  async requestUser() {
    this.currentUser = await requestCurrentUser().catch(e =>
      console.log('获取currentUser出错')
    )

    console.log('here', this.currentUser)
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log(
      'did update',
      (this.props as any).currentFilterModel,
      (this.props as any).filterCount,
      (this.props as any).isFilterConfirm
    )

    // console.log('pre cur', prevProps.currentFilterModel, (this.props as any).currentFilterModel);

    const isConfirm = (this.props as any).isFilterConfirm as boolean

    // TODO: Model 是怎么比较的？
    if (
      prevProps.currentFilterModel !== (this.props as any).currentFilterModel
    ) {
      console.log('call handleFilterAction')

      this.localFilterModel = (this.props as any)
        .currentFilterModel as TTHomeFilterModel

      this.handleFilterAction(
        this.localFilterModel,
        (this.props as any).isFilterConfirm as boolean,
        (this.props as any).isReset as boolean
      )
    }
  }

  setupFilter() {
    const filterPanel = this.getFilterPanelView()
    const filterDropDownCallback = (dropDown: boolean): void => {
      this.setState({ fitlerDroppedDown: dropDown })
    }
    this.filterWrapper = new SlideOpenWrapper(
      filterPanel,
      filterDropDownCallback
    )
  }

  requestListNumber = async () => {
    const r = await getTicketListNumber()

    if (r?.code === 200 && r?.data != null) {
      this.setState({ listNumberModel: r.data })
    } else {
      Toast.open(r?.message ?? '请求出错')
    }
  }

  render() {
    // return <Text>3333</Text>
    const pages = getTTHomePageList(this.props.isExternalUser)
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {this.props.screenProps?.isPad ? (i18nClient.t('components_home_4fdd87', {
          defaultValue: '应用页面适配iPad版中，如遇使用问题请联系TT产研-lizhuoyang02',
        })) : null}
        {this.renderHeader(pages)}
        {this.renderSearch()}
        {this.renderList()}
        {this.renderSearchContent()}
        {isIPhoneWithNotch() ? <View style={{ height: 20 }} /> : null}
      </View>
    )
  }

  renderHeader(pages: TTHomePageType[]) {
    const { isSearching } = this.state

    return (
      <View style={isSearching ? { display: 'none' } : { display: 'flex' }}>
        <View style={[MWSStyle.header]} collapsable={false}>
          {/* {this.state.fitlerDroppedDown ? this.renderFilterHeader() : this.renderSort()} */}
          {this.renderTabs(pages)}
          {this.renderFilter2()}
        </View>
        {/* <View style={MWSStyle.divider1} /> */}
      </View>
    )
  }

  pageList = [
    TTHomePageType.todo,
    TTHomePageType.assignMe,
    TTHomePageType.ccMe,
    TTHomePageType.created,
    TTHomePageType.myJoin
  ]

  renderTabs(pages: TTHomePageType[]) {
    const pageTabList = pages.map((item, index) => {
      return {
        value: item,
        label: this.getNameFromPageType(item)
      }
    })

    return (
      <View style={{ width: width - 16 - 70 }}>
        <Tab
          // suteTabUnderLineWidth={true}
          isBalanced={false}
          scrollable={true}
          tabType={'default'}
          activeUnderlineStyle={{ width: 0 }}
          activeTextStyle={{
            fontSize: theme.size18,
            fontWeight: '500',
            color: theme.gray84
          }}
          textStyle={{
            fontSize: theme.size14,
            color: theme.gray60
          }}
          value={this.state.pageType}
          options={pageTabList}
          onChange={data => {
            console.log('data', data)
            this.handleTabChange(data.value as TTHomePageType)
          }}
          styles={{
            container: {
              height: 40
            },
            item: {
              paddingHorizontal: 0,
              paddingRight: 20
            },
            line: {
              height: 0
            }
          }}
          ref={c => {
            this._tab = c
          }}
        />
      </View>
    )
  }

  renderFilter2() {
    const count = (this.props as any).filterCount ?? 0

    return (
      <TTFilterHeader
        filterCount={count}
        filterPanelDroppedDown={this.filterPanelDroppedDown}
        onFilterPress={() => this.openCloseFilterPanel()}
        showText={true}
        ref={ref => {
          this.filterRef = ref
        }}
      />
    )
  }

  renderSearch() {
    return (
      <MWSSearchList
        placeHolderTxt={i18nClient.t('components_home_e5f71f', { defaultValue: '搜索' })}
        marginTop={7}
        marginBottom={0}
        styles={{
          color: theme.yellow800
        }}
        handleSearchOnFocus={() => {
          console.log('ssss')
          this.setState({ isSearching: true })
        }}
        handleSearch={keyWord => {
          console.log('keyword ' + keyWord)
          this.setState({ searchKeyWord: keyWord })
        }}
        handleCancelSearch={() => {
          this.setState({ isSearching: false, searchKeyWord: '' })
        }}
        handleClearChange={keyWord => {
          console.log('clear' + keyWord)
          // 清空搜索内容
          if (keyWord === '') {
            this.setState({ searchKeyWord: keyWord })
          }
        }}
      />
    )
  }

  renderList() {
    const { isSearching } = this.state

    return (
      <View
        style={
          isSearching
            ? { display: 'none' }
            : { display: 'flex', flex: 1, marginTop: 4 }
        }
      >
        <MWSList
          key={'list'}
          renderItem={(item, index) => this.renderListItem(item)}
          keyExtractor={(item, index) => index.toString()}
          onLoad={(pageSize: number, pageNo: number, refresh: boolean) =>
            this.newOnLoad(pageSize, pageNo, refresh)
          }
          showsVerticalScrollIndicator={false}
          showFooter={true}
          pageSize={this.pageSize}
          // 列表分页
          needLoadByPage={true}
          startPageNo={1}
          ref={ref => {
            this.listRef = ref
          }}
        />
      </View>
    )
  }

  renderSearchContent() {
    const { searchKeyWord, isSearching } = this.state
    console.log('se ' + searchKeyWord)
    return (
      <View
        style={isSearching ? { display: 'flex', flex: 1 } : { display: 'none' }}
      >
        {searchKeyWord !== '' ? this.renderSearchResultList() : null}
      </View>
    )
  }

  renderSearchResultList() {
    return (
      <MWSList
        key={'list2'}
        renderItem={(item, index) => this.renderListItem(item)}
        keyExtractor={(item, index) => index.toString()}
        onLoad={(pageSize: number, pageNo: number, refresh: boolean) =>
          this.newOnLoad(pageSize, pageNo, refresh)
        }
        showFooter={true}
        pageSize={this.pageSize}
        // 列表分页
        needLoadByPage={true}
        startPageNo={1}
      />
    )
  }

  async newOnLoad(pageSize: number, pageNo: number, refresh: boolean) {
    let filters = this.localFilterModel
    console.log('newonload filters', filters)

    if (checkNull(filters)) {
      this.localFilterModel = getTTInitFilters(this.state.pageType)
      filters = this.localFilterModel
    }

    // let list = await fetchLoganList()
    // console.log('ajfjafj', list)

    // const data = list.data as HomeListResultModel

    const pageType = this.state.pageType

    let needFilter = false

    if (
      filters?.selectedStatusList?.length > 0 ||
      filters?.selectedSLAList?.length > 0
    ) {
      needFilter = true
    }

    let res

    // 只有在 ’我流转的‘ 列表里而且没有筛选的时候，使用 myJoin 接口
    if (pageType === TTHomePageType.myJoin && needFilter === false) {
      console.log('getTicketMyJoinList ')

      res = await getTicketMyJoinList(pageNo, pageSize)
    } else {
      const options = await this.getRequestOptions(this.state.pageType, filters)
      console.log('options', JSON.stringify(options))

      res = await getTicketList(pageNo, pageSize, options as any)
    }

    const items: Array<any> = res?.data?.items

    if (checkNull(items)) {
      return new Promise<any[]>((resolve, reject) => {
        resolve([])
      })
    }

    console.log('items here', items)

    return new Promise<any[]>((resolve, reject) => {
      resolve(items)
    })
  }

  renderListItem(item: TicketListItem) {
    if (item === null || item === undefined) {
      return null
    }
    return (
      <View>
        <TouchableHighlight
          activeOpacity={theme.activeOpacity}
          onPress={() => this.goToDetail(item)}
        >
          <View style={[TTHomeListStyle.rowItem, { backgroundColor: 'white' }]}>
            <Text style={TTHomeListStyle.itemTitle}>{item?.name}</Text>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 6,
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              {renderStatus(item.sla, item.stateDisplayName)}
              <Text style={TTHomeListStyle.itemTime}>
                {formatDate2(item.createdAt)}
              </Text>
            </View>
          </View>
        </TouchableHighlight>
        {renderInsetSeprator(16, null, theme.grayF5)}
      </View>
    )
  }

  renderSLA(sla: string) {
    return (
      <View
        style={[
          dStyle.SLAInnerWrapper,
          { backgroundColor: SLA_STATE_COLOR[sla] }
        ]}
      >
        <Text style={dStyle.SLAFont14}>{i18nClient.t(Sla2CN[sla])}</Text>
      </View>
    )
  }

  renderDot() {
    // TODO: 黑点不太一样
    return (
      <>
        <Text
          style={{ marginHorizontal: 6, color: convertHex('#666666', 0.8) }}
        >
          {'•'}
        </Text>
      </>
    )
  }

  openCloseFilterPanel() {
    this.filterWrapper.updateChildView(this.getFilterPanelView())
    this.filterWrapper.openClose()

    console.log('111')
  }

  getFilterPanelView() {
    return (
      <View
        style={{
          width: width,
          backgroundColor: '#fff',
          alignItems: 'stretch'
        }}
      >
        <HomeFilter selectedFilters={this.localFilterModel} />
      </View>
    )
  }

  handleTabChange(type: TTHomePageType) {
    console.log('changed', type)

    this.localFilterModel = getTTInitFilters(type)

    this.setState({ pageType: type }, () => {
      this.listRef?._onRefresh()
    })
  }

  handleFilterAction(
    model: TTHomeFilterModel,
    isFilterConfirm: boolean,
    isReset?: boolean
  ) {
    console.log('received model', model)

    // 只有点确定的时候才会需要关闭筛选，再进行刷新
    if (isFilterConfirm === true) {
      console.log('handleFilterAction isFilterConfirm')

      this.filterWrapper.close()

      this._onRefresh()
    } else {
      if (isReset != null && isReset === true) {
        console.log('from filter reset')

        this._onRefresh()
      }
    }
  }

  _onRefresh() {
    console.log('refresh list')

    this.listRef?._onRefresh()
  }

  getNameFromPageType(t: TTHomePageType) {
    const m: any = this.state?.listNumberModel
    switch (t) {
      case TTHomePageType.todo:
        return i18nClient.t('components_home_e102a8', { defaultValue: '待我处理' }) + (m != null ? ` (${m?.unresolved})` : '')
      case TTHomePageType.assignMe:
        return i18nClient.t('components_home_170ac7', { defaultValue: '指派我的' }) + (m != null ? ` (${m?.assigned})` : '')
      case TTHomePageType.ccMe:
        return i18nClient.t('components_home_e2e017', { defaultValue: '抄送我的' }) + (m != null ? ` (${m?.cc})` : '')
      case TTHomePageType.created:
        return i18nClient.t('components_home_6e871a', { defaultValue: '我发起的' }) + (m != null ? ` (${m?.reporter})` : '')
      case TTHomePageType.myJoin:
        return i18nClient.t('components_home_b3d4f0', { defaultValue: '我流转的' }) + (m != null ? ` (${m?.join})` : '')
    }
  }

  async getRequestOptions(t: TTHomePageType, f: TTHomeFilterModel) {
    // 最终以筛选项为准
    let statusList =
      f?.selectedStatusList?.length > 0
        ? f?.selectedStatusList
          .filter(i => i !== 3)
          .map(value => TicketStatusList[value]?.value)
        : []
    // TODOTODO：如何传递参数，当前获取的是i18n 的key
    console.log('status list 1111', statusList)

    // 暂停 对应 暂停中 和 挂起中
    if (f?.selectedStatusList?.includes(3)) {
      statusList = statusList.concat(['暂停中', '挂起中'])
    }

    console.log('status list 2222 ', statusList)

    const levelList =
      f?.selectedSLAList?.length > 0
        ? f?.selectedSLAList?.map(value => SLA[value])
        : []

    const needSearch =
      this.state.isSearching && this.state.searchKeyWord?.length > 0

    const typeOptions = await this.getRequestOptionFromPageType(t)
    console.log('nnn', JSON.stringify(typeOptions))

    // TODO: 观察是否适合代办的场景

    let dic = Object.assign({}, typeOptions, {
      state: statusList,
      sla: levelList
    })

    if (needSearch) dic.name = this.state.searchKeyWord

    console.log('nnn new', JSON.stringify(dic))

    return dic

    // if (t !== TTHomePageType.todo) {
    //   return Object.assign({},
    //     this.getRequestOptionFromPageType(t),
    //     { state: f?.selectedStatusList ?? [], sla: f?.selectedSLAList ?? [] }
    //   )
    // } else {
    //   if (f?.selectedStatusList?.length > 0) {
    //     return Object.assign({},
    //       { assigned: mis },
    //       { state: f?.selectedStatusList ?? [], sla: f?.selectedSLAList ?? [] }
    //     )
    //   } else {

    //   }
    // }
  }

  async getRequestOptionFromPageType(t: TTHomePageType) {
    let user = this.currentUser
    if (checkNull(this.currentUser)) {
      user = await requestCurrentUser().catch(e => console.log('获取出错'))
    }

    const mis = user?.username ?? ''

    console.log('current', this.currentUser)

    switch (t) {
      case TTHomePageType.todo:
        return Object.assign({}, this.defaultRequestOptions, {
          assigned: mis,
          state: ['未处理', '处理中', '重新打开', '暂停中', '挂起中']
        })
      case TTHomePageType.assignMe:
        return Object.assign({}, this.defaultRequestOptions, { assigned: mis })
      case TTHomePageType.ccMe:
        return Object.assign({}, this.defaultRequestOptions, { cc: [mis] })
      case TTHomePageType.created:
        return Object.assign({}, this.defaultRequestOptions, { createdBy: mis })
      case TTHomePageType.myJoin:
        return Object.assign({}, this.defaultRequestOptions)
    }
  }

  goToDetail(item: TicketListItem) {
    console.log('goto detail')

    this.props.navigation.push('Detail', {
      ticketId: item.id,
      refresh: () => this._onRefresh()
    })
  }
}


const HomeListWithTranslation = withTranslation('', {
	withRef: true
})(HomeList);

class HomeListOrigin  extends Component<IProps, IState> {

  constructor(props) {
    super(props)

    // FIXME: 进来的时候，需要当前tab项在可见范围
    let pageType = TTHomePageType.todo
    if (this.props.navigation.getParam('pagetype')) {
      pageType = this.props.navigation.getParam('pagetype')
    } else if (this.props.screenProps?.extra?.pageType) {
      pageType = this.props.screenProps.extra.pageType
    }

    console.log('pagetype ', pageType)

    this.state = {
      pageType: pageType,
      fitlerDroppedDown: false,
      listNumberModel: null,
      isSearching: false,
      searchKeyWord: '',
      title: i18nClient.t('components_home_543a6f', { defaultValue: '我的TT' }),
    }

    this.currentUser = this.props.navigation.getParam('currentUser')

    this.setupFilter()
  }

  componentDidMount() {
    i18nClient.on('languageChanged', this.setTitle)
    // this.setTitle()
  }
  componentWillUnmount() {
    i18nClient.off('languageChanged', this.setTitle)
  }

  setTitle = () => {
    const title = i18nClient.t('components_home_543a6f', { defaultValue: '我的TT' })
    this.props.navigation.setParams({ title })
  }

  getFilterPanelView() {
    return (
      <View
        style={{
          width: width,
          backgroundColor: '#fff',
          alignItems: 'stretch'
        }}
      >
        <HomeFilter selectedFilters={this.localFilterModel} />
      </View>
    )
  }

  setupFilter() {
    const filterPanel = this.getFilterPanelView()
    const filterDropDownCallback = (dropDown: boolean): void => {
      this.setState({ fitlerDroppedDown: dropDown })
    }
    this.filterWrapper = new SlideOpenWrapper(
      filterPanel,
      filterDropDownCallback
    )
  }

  static navigationOptions = ({ navigation }) => {
    return ({
      title: i18nClient.t('components_home_543a6f', { defaultValue: '我的TT' }),
      headerStyle: MWSStyle.headerStyle,
      headerTitleStyle: MWSStyle.headerTitleStyle,
      gesturesEnabled: true,
      headerLeft: (
        <TouchableOpacity
          onPress={() => {
            navigation.back()
          }}
        >
          <Icon type="left" style={{ height: 20, width: 20, marginLeft: 12 }} />
        </TouchableOpacity>
      ),
  
      headerBackTitle: null,
      headerRight: (
        <HeaderRightBtn
          pageType={1}
          pageInfo={{
            name: 'TT',
            brief: navigation.getParam('name', 'TT列表'),
            listLink:
              getKey('env') === 'test' ? testHomeListLink : onlineHomeListLink,
            detailLink: '',
            lxCopyKey: '',
            lxShareListKey: '',
            lxShareDetailKey: ''
          }}
        />
      )
    })
  }

  render(){
    const { navigation , screenProps, isExternalUser, currentFilterModel, filterCount, isFilterConfirm } = this.props;
    return <HomeListWithTranslation 
      navigation={navigation} screenProps={screenProps} isExternalUser={isExternalUser} currentFilterModel={currentFilterModel} filterCount={filterCount} isFilterConfirm={isFilterConfirm}></HomeListWithTranslation>
  }
}


const mapStateToProps = (state: RootState) => ({
  currentFilterModel: state.ttHomeReducer.filterSelection,
  filterCount: state.ttHomeReducer.filterCount,
  isFilterConfirm: state.ttHomeReducer.confirm,
  isReset: state.ttHomeReducer.reset,
  isExternalUser: state.userInfo?.external,
  timeZone: state.timeZone.timeZone,
})

// const translatedHomeList = withTranslation('', {
// 	withRef: true
// })(HomeList);

// const connectedHomeList = connect(mapStateToProps)(translatedHomeList)

// export default connectedHomeList;

export default connect(mapStateToProps)(HomeListOrigin as any)

// const connectedHomeList = connect(mapStateToProps)(HomeList);

// const translatedHomeList = withTranslation('', {
//     withRef: true
// })(connectedHomeList);

// export default translatedHomeList;


function getTTInitFilters(pageType: TTHomePageType) {
  let model = new TTHomeFilterModel()

  if (pageType === TTHomePageType.todo) {
    model.selectedStatusList = [0, 3, 4, 5]
  }

  return model
}

export function renderStatus(sla: string, stateText: string) {
  return (
    <View style={{ flexDirection: 'row' }}>
      <View
        style={[
          TTHomeListStyle.stateBg,
          { backgroundColor: SLA_STATE_COLOR[sla] }
        ]}
      >
        <Text style={TTHomeListStyle.stateText}>{i18nClient.t(Sla2CN[sla])}</Text>
      </View>
      <View
        style={[
          TTHomeListStyle.stateBg,
          { borderColor: theme.gray24, marginLeft: 6, borderWidth: 0.5 }
        ]}
      >
        <Text style={[TTHomeListStyle.stateText, { color: theme.gray60 }]}>
          {stateText}
        </Text>
      </View>
    </View>
  )
}
