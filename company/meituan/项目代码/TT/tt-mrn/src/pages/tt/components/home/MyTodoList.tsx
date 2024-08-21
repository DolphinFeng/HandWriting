import { i18nClient } from '@sailor/i18n-mrn'
import React, { Component } from 'react'
import { View, Text, TouchableOpacity, Dimensions } from '@mrn/react-native'
import { isIPhoneWithNotch } from '@src/common/styles/NavigationStyle'
import MWSList from '@src/components/MWSList'
import { MWSStyle } from '@src/common/styles/MWSCommonStyle'
import { checkNull } from '@src/common/helpers/HelperFunctions'
import {
  getTicketList,
  ttPost,
  getTicketMyJoinList,
  getTicketListNumber,
} from '../../constants/TTApi'
import {
  TicketListItem,
  TicketListNumberModel,
  CCPersonModel,
} from '../../constants/TTServiceModule'
import { dStyle, TTHomeListStyle, convertHex } from '../../constants/TTStyle'
import { Sla2CN, SLA_STATE_COLOR, SLA_OUTER_COLOR, SLA } from '../../constants/ConfigMap'
import { formatDate2 } from '@src/common/helpers/FormatDate'
import theme from '@src/common/styles/MWSStyle'
import FilterHeader from '@src/common/helpers/filterPanel/FilterHeader'
import SlideOpenWrapper from '@src/components/SlideOpenWrapper'
import HomeFilter, { TTHomeFilterModel } from './HomeFilter'
import { Tab } from '@ss/mtd-react-native'
import { connect } from 'react-redux'
import { Toast } from '@ss/mtd-react-native'
import store from '../../redux/store'
import { requestCurrentUser } from '../common/TTHelper'
import { MWSSearchList } from '@src/components/MWSSearchList'
import HeaderRightBtn from '@src/components/NavRightButton'
import NavLeftBar from '@src/components/NavLeftBar'
import { getKey } from '@src/common/helpers/api'
import { renderInsetSeprator } from '@src/components/BaseComponents'
import { Icon } from '@ss/mtd-react-native'

const testHomeListLink = 'http://tt.cloud.test.sankuai.com/ticket/list?filter'
const onlineHomeListLink = 'https://tt.sankuai.com/ticket/list?filter'

enum TTHomePageType {
  todo,
  assignMe,
  ccMe,
  created,
  myJoin,
}

interface IProps {
  navigation: any
}

interface IState {
  pageType: TTHomePageType
  fitlerDroppedDown: boolean
  listNumberModel?: TicketListNumberModel
  isSearching: boolean
  searchKeyWord: string
}

const { width, height } = Dimensions.get('window')

class MyTodoList extends Component<IProps, IState> {
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

  _spaceId: string = null

  static navigationOptions = ({ navigation }) => ({
    title: i18nClient.t('components_home_e102a8', { defaultValue: '待我处理' }),
    headerStyle: MWSStyle.headerStyle,
    headerTitleStyle: MWSStyle.headerTitleStyle,
    gesturesEnabled: true,
    headerLeft: (
      <TouchableOpacity
        onPress={() => {
          navigation.goBack()
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
          brief: navigation.getParam(
            'name',
            i18nClient.t('components_home_c8c2de', { defaultValue: 'TT列表' }),
          ),
          listLink: getKey('env') === 'test' ? testHomeListLink : onlineHomeListLink,
          detailLink: '',
          lxCopyKey: '',
          lxShareListKey: '',
          lxShareDetailKey: '',
        }}
      />
    ),
  })

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
    labels: [],
  }

  constructor(props) {
    super(props)

    this.state = {
      pageType: TTHomePageType.todo,
      fitlerDroppedDown: false,
      listNumberModel: null,
      isSearching: false,
      searchKeyWord: '',
    }

    this.currentUser = this.props.navigation.getParam('currentUser')
    this._spaceId = this.props.navigation.getParam('spaceId')
  }

  async componentDidMount() {
    await this.requestUser()
  }

  async requestUser() {
    this.currentUser = await requestCurrentUser().catch(e => console.log('获取currentUser出错'))

    console.log('here', this.currentUser)
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {this.renderList()}
        {isIPhoneWithNotch() ? <View style={{ height: 20 }} /> : null}
      </View>
    )
  }

  renderList() {
    const { isSearching } = this.state

    return (
      <View style={{ display: 'flex', flex: 1, marginTop: 4 }}>
        <MWSList
          key={'list'}
          renderItem={(item, index) => this.renderListItem(item)}
          keyExtractor={(item, index) => index.toString()}
          onLoad={(pageSize: number, pageNo: number, refresh: boolean) =>
            this.newOnLoad(pageSize, pageNo, refresh)
          }
          showFooter={true}
          showsVerticalScrollIndicator={false}
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

  async newOnLoad(pageSize: number, pageNo: number, refresh: boolean) {
    let filters = this.localFilterModel
    console.log('newonload filters', filters)

    // let list = await fetchLoganList()
    // console.log('ajfjafj', list)

    // const data = list.data as HomeListResultModel

    const pageType = this.state.pageType

    let needFilter = false

    if (filters?.selectedStatusList?.length > 0 || filters?.selectedSLAList?.length > 0) {
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
        <TouchableOpacity
          style={TTHomeListStyle.rowItem}
          onPress={() => {
            this.goToDetail(item)
          }}
        >
          <Text style={TTHomeListStyle.itemTitle}>{item?.name}</Text>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 6,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              <Text
                style={[{ backgroundColor: SLA_STATE_COLOR[item.sla] }, TTHomeListStyle.stateStyle]}
              >
                {i18nClient.t(Sla2CN[item.sla])}
              </Text>
              <Text
                style={[
                  TTHomeListStyle.stateStyle,
                  {
                    color: theme.gray60,
                    borderColor: theme.gray24,
                    marginLeft: 6,
                    borderWidth: 0.5,
                  },
                ]}
              >
                {item.stateDisplayName}
              </Text>
            </View>
            <Text style={TTHomeListStyle.itemTime}>{formatDate2(item.updatedAt)}</Text>
          </View>
        </TouchableOpacity>
        {renderInsetSeprator(16, null, theme.grayF5)}
      </View>
    )
  }

  renderSLA(sla: string) {
    return (
      <View style={[dStyle.SLAInnerWrapper, { backgroundColor: SLA_STATE_COLOR[sla] }]}>
        <Text style={dStyle.SLAFont14}>{i18nClient.t(Sla2CN[sla])}</Text>
      </View>
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
          alignItems: 'stretch',
        }}
      >
        <HomeFilter selectedFilters={this.localFilterModel} />
      </View>
    )
  }

  _onRefresh() {
    this.listRef?._onRefresh()
  }

  async getRequestOptions(t: TTHomePageType, f: TTHomeFilterModel) {
    const typeOptions = await this.getRequestOptionFromPageType(t)
    console.log('nnn', JSON.stringify(typeOptions))

    // TODO: 观察是否适合代办的场景

    let dic = typeOptions

    console.log('nnn new', JSON.stringify(dic))

    return dic
  }

  async getRequestOptionFromPageType(t: TTHomePageType) {
    let user = this.currentUser
    if (checkNull(user) || checkNull(user?.username)) {
      user = await requestCurrentUser().catch(e => console.log('获取出错'))
    }

    const mis = user?.username ?? ''

    console.log('current', this.currentUser)

    if (this._spaceId) {
      return Object.assign({}, this.defaultRequestOptions, {
        assigned: mis,
        state: [
          '未处理',
          '处理中',
          '重新打开',
          '暂停中',
          '挂起中',
        ], // 用于接口查询不翻译
        spaceIds: [this._spaceId],
      })
    }

    return Object.assign({}, this.defaultRequestOptions, {
      assigned: mis,
      state: [
        '未处理',
        '处理中',
        '重新打开',
        '暂停中',
        '挂起中',
      ], // 用于接口查询不翻译
    })
  }

  goToDetail(item: TicketListItem) {
    console.log('goto detail')

    this.props.navigation.navigate('Detail', {
      ticketId: item.id,
    })
  }
}

export default MyTodoList
