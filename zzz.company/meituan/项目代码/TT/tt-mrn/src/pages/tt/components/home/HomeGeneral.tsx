import React, { Component } from 'react'
import {
  View,
  Text,
  Dimensions,
  Image,
  TouchableHighlight,
  TouchableOpacity,
  Alert,
  Platform,
} from '@mrn/react-native'
import { MWSButton } from '@src/components/MWSButton'
import { dStyle, TTCreateStyle, TTHomeStyle, TTHomeListStyle } from '../../constants/TTStyle'
// import banner from '@images/ttBanner2.png'
import newbanner from '@images/banner-new.jpeg'
import add from '@images/tt-add.png'
import theme from '@src/common/styles/MWSStyle'
import { TTHomePageType, renderStatus, getTTHomePageList } from './HomeList'
import {
  getTicketListNumber,
  getTicketMyJoinList,
  getTicketByName,
} from '../../constants/TTApi'
import {
  TicketListNumberModel,
  TicketListItem,
  CCPersonModel,
} from '../../constants/TTServiceModule'
import { Toast, Tip } from '@ss/mtd-react-native'
import imgToDo from '@images/home_solve.png'
import imgAssign from '@images/home_assign.png'
import imgCC from '@images/home_send.png'
import imgCreate from '@images/home_initiate.png'
import imgMyJoin from '@images/home_circulation.png'
import { MWSSearchList } from '@src/components/MWSSearchList'
import MWSList from '@src/components/MWSList'
import MWSStyle from '@src/common/styles/MWSStyle'
import { formatDate2 } from '@src/common/helpers/FormatDate'
import { checkNull, reportOwlError } from '@src/common/helpers/HelperFunctions'
import { requestCurrentUser, ttLog } from '../common/TTHelper'
import { getToken, forceGetToken, getKey } from '@common/helpers/api'
import { PlatformType } from '@src/common/helpers/PlatfromHelper'
import { connectExternalUser, InjectedExternalUserProps } from '../../redux/connectors'
import { i18nClient, withTranslation } from '@sailor/i18n-mrn'

interface IProps {
  navigation: any
  isPad: boolean
}

interface IState {
  listNumberModel?: TicketListNumberModel
  isSearching: boolean
  searchKeyWord: string
}

const screenWidth = Dimensions.get('screen').width
class HomeGeneral extends Component<IProps & InjectedExternalUserProps, IState> {
  private pageSize = 20
  private currentUser: CCPersonModel = null
  private searchResultRef: MWSList = null

  _sub = null

  private _searchKeyword = ''
  pageList = [
    TTHomePageType.todo,
    TTHomePageType.assignMe,
    TTHomePageType.ccMe,
    TTHomePageType.created,
    TTHomePageType.myJoin,
  ]

  imgList = [imgToDo, imgAssign, imgCC, imgCreate, imgMyJoin]

  constructor(props) {
    super(props)

    this.state = {
      isSearching: false,
      searchKeyWord: '',
    }
  }

  async componentDidMount() {
    // setTimeout(() => {
    //   this.requestListNumber()
    // }, 0.3);

    // await getToken().catch(e => console.warn(e))
    ttLog('before requestListNumber')
    await this.requestListNumber()
    ttLog('after requestListNumber')

    this._sub = this.props.navigation?.addListener('didFocus', () => {
      this.requestListNumber()
    })

    // FIXME: 临时调试
    // setTimeout(() => {
    //   requestCurrentUser().then(res => {
    //     this.currentUser = res
    //   })
    // }, 1);

    // this.currentUser = await requestCurrentUser()
  }

  componentWillUnmount() {
    this._sub?.remove()
  }

  render() {
    return (
      <View style={{ backgroundColor: 'white', flex: 1 }}>
        {this.props.isPad ? (
          <Tip>
            {i18nClient.t('components_home_4fdd87', {
              defaultValue: '应用页面适配iPad版中，如遇使用问题请联系TT产研-lizhuoyang02',
            })}
          </Tip>
        ) : null}
        {this.renderSearch()}
        <View style={this.state.isSearching ? { display: 'none' } : { display: 'flex' }}>
          {this.renderImage()}
          {this.renderEntries()}
          {this.renderCreateButton()}
          {/* {this.renderTempButton()} */}
        </View>
        {this.renderSearchContent()}
      </View>
    )
  }

  // FIXME: 临时入口
  renderTempButton() {
    return (
      <MWSButton
        // wrapperStyles={[dStyle.flowBtn, { backgroundColor: '#FFC300', height: 48, width: screenWidth - 16 }]}
        wrapperStyles={{
          backgroundColor: '#FFC300',
          height: 48,
          width: 48,
          borderRadius: 24,
          marginHorizontal: 8,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 16,
        }}
        onPress={() => this.goToExt()}
      />
    )
  }

  renderImage = () => {
    return (
      <View style={{ alignItems: 'center' }}>
        <Image
          source={newbanner}
          style={{
            width: screenWidth - 16 * 2,
            height: 124,
            marginTop: 12 - 4,
            borderRadius: 8,
          }}
        />
        <Text
          style={{
            position: 'absolute',
            top: 50,
            left: 32,
            fontSize: 14,
            fontWeight: '500'
          }}
        >
          {i18nClient.t('banner_text', '欢迎使用TT')}
        </Text>
        <Text
          style={{
            position: 'absolute',
            top: 72,
            left: 32,
            fontSize: 12,
            color: '#999',
            width: '50%'
          }}
        >
          {i18nClient.t('banner_desc', '遇到问题都可以通过TT反馈')}
        </Text>
      </View>
    )
  }

  renderEntries = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginHorizontal: 16,
          marginTop: 10,
        }}
      >
        {getTTHomePageList(this.props.isExternalUser).map((item, index) =>
          this.renderEntryItem(item, index),
        )}
      </View>
    )
  }

  renderEntryItem = (type: TTHomePageType, index: number) => {
    const left = index % 2 === 1 ? 8 : 0
    const top = index !== 0 && index !== 1 ? 8 : 0

    const imgW = 20
    return (
      <TouchableHighlight
        key={type}
        activeOpacity={theme.activeOpacity}
        onPress={() => this.handleItemClick(type)}
        style={{
          borderRadius: 6,
          width: (screenWidth - 16 - 16 - 8) / 2,
          height: 48,
          marginLeft: left,
          marginTop: top,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            paddingLeft: 12,
            borderRadius: 6,
            backgroundColor: theme.grayFA,
          }}
        >
          <Image source={this.imgList[index]} style={{ width: imgW, height: imgW }} />

          <Text style={TTHomeStyle.itemTitle}>{this.getNameFromPageType(type)}</Text>
          <Text style={TTHomeStyle.itemCount}>{this.getCountFromPageType(type)}</Text>
        </View>
      </TouchableHighlight>
    )
  }

  renderCreateButton = () => {
    return (
      <TouchableHighlight
        activeOpacity={theme.activeOpacity}
        style={{
          height: 48,
          width: screenWidth - 16 * 2,
          borderRadius: 8,
          marginHorizontal: 16,
          marginTop: 16,
        }}
        onPress={this.handleCreateClick}
      >
        {this.renderCreateContent()}
      </TouchableHighlight>
    )
  }

  renderCreateContent = () => {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFC300',
          borderRadius: 8,
        }}
      >
        <Image
          source={add}
          style={{
            width: theme.width20,
            height: theme.height20,
            opacity: 0.84,
          }}
        />

        <Text
          style={[
            TTCreateStyle.valueStyle,
            {
              marginLeft: 7,
              fontWeight: 'bold',
              fontFamily: 'PingFangSC-Medium',
            },
          ]}
        >
          {i18nClient.t('components_create_f6e88c', { defaultValue: '发起TT' })}
        </Text>
      </View>
    )
  }

  renderSearch() {
    return (
      <MWSSearchList
        placeHolderTxt={i18nClient.t('page_home_search_tt')}
        marginTop={13}
        styles={{
          color: theme.yellow800,
        }}
        handleSearchOnFocus={() => {
          console.log('ssss')
          this.setState({ isSearching: true })
        }}
        handleSearch={keyWord => {
          console.log('外面收到' + keyWord)
          // this.setState({searchKeyWord: keyWord}, () => {
          //   this.searchResultRef?._onRefresh()
          // })
          this._searchKeyword = keyWord
          this.searchResultRef?._onRefresh(true)
        }}
        handleCancelSearch={() => {
          this._searchKeyword = ''
          this.searchResultRef?.clearData()

          this.setState({ isSearching: false })
        }}
        handleClearChange={keyWord => {
          console.log('clear' + keyWord)
          // 清空搜索内容
          if (keyWord === '') {
            this._searchKeyword = keyWord
            this.searchResultRef?.clearData()
            // this.setState({searchKeyWord: keyWord})
          }
          //
        }}
      />
    )
  }

  renderSearchContent() {
    const { searchKeyWord, isSearching } = this.state
    console.log('se ' + searchKeyWord)
    return (
      <View style={isSearching ? { display: 'flex', flex: 1 } : { display: 'none' }}>
        {this.renderSearchResultList()}
      </View>
    )
  }

  renderSearchResultList() {
    return (
      <MWSList
        key={'list2'}
        ref={r => {
          this.searchResultRef = r
        }}
        renderItem={(item, index) => this.renderListItem(item)}
        keyExtractor={(item, index) => index.toString()}
        onLoad={(pageSize: number, pageNo: number, refresh: boolean) =>
          this.newOnLoad(pageSize, pageNo, refresh)
        }
        showFooter={false}
        pageSize={this.pageSize}
        // 列表分页
        needLoadByPage={false}
        startPageNo={1}
      />
    )
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
            {renderStatus(item.sla, item.stateDisplayName)}
            <Text style={TTHomeListStyle.itemTime}>{formatDate2(item.updatedAt)}</Text>
          </View>
        </TouchableOpacity>
        <View style={MWSStyle.divider1} />
      </View>
    )
  }

  async newOnLoad(pageSize: number, pageNo: number, refresh: boolean) {
    let needFilter = false

    needFilter = false

    let res

    // 只有在 ’我流转的‘ 列表里而且没有筛选的时候，使用 myJoin 接口

    // const options = this.getRequestOptions()
    // console.log('options', options);
    if (this._searchKeyword?.length > 0) {
      res = await getTicketByName(this._searchKeyword, pageNo, pageSize)

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
    } else {
      return new Promise<any[]>((resolve, reject) => {
        resolve([])
      })
    }
  }

  // getRequestOptions () {

  //   const needSearch = this.state.isSearching && this.state.searchKeyWord?.length > 0

  //   // TODO: 观察是否适合代办的场景
  //   return Object.assign(
  //     {},
  //     needSearch ? { name: this.state.searchKeyWord } : {}
  //   )
  // }

  goToDetail(item: TicketListItem) {
    console.log('goto detail')

    this.props.navigation.push('Detail', {
      ticketId: item.id,
    })
  }

  // FIXME: temp use
  goToExt() {
    console.log('goto 小象首页')

    this.props.navigation.push('HomeExternal')
  }

  pageTabList = this.pageList.map((item, index) => {
    return {
      value: item,
      label: this.getNameFromPageType(item),
    }
  })

  async requestListNumber() {
    if (Platform.OS === 'ios') {
      await forceGetToken()
    }
    // ttLog('requestListNumber')
    const r = await getTicketListNumber()
    // ttLog('after requestListNumber')

    if (r?.code === 200 && r?.data != null) {
      this.setState({ listNumberModel: r.data })
    } else if (!r) {
      Toast.open(i18nClient.t('components_home_a783b5', { defaultValue: 'TT首页请求出错' }))
    } else {
      Toast.open(
        r?.message ?? i18nClient.t('components_home_a783b5', { defaultValue: 'TT首页请求出错' }),
      )
      reportOwlError('tt requestListNumber error ' + r?.message)
    }
  }

  getNameFromPageType(t: TTHomePageType) {
    const m: any = this.state?.listNumberModel
    switch (t) {
      case TTHomePageType.todo:
        return i18nClient.t('page_home_todo_title')
      case TTHomePageType.assignMe:
        return i18nClient.t('page_home_assign_title')
      case TTHomePageType.ccMe:
        return i18nClient.t('page_home_cc_title')
      case TTHomePageType.created:
        return i18nClient.t('page_home_init_title')
      case TTHomePageType.myJoin:
        return i18nClient.t('page_home_transfer_title')
    }
  }

  getCountFromPageType(t: TTHomePageType) {
    const m: any = this.state?.listNumberModel
    switch (t) {
      case TTHomePageType.todo:
        return m != null ? `(${m?.unresolved})` : ''
      case TTHomePageType.assignMe:
        return m != null ? `(${m?.assigned})` : ''
      case TTHomePageType.ccMe:
        return m != null ? `(${m?.cc})` : ''
      case TTHomePageType.created:
        return m != null ? `(${m?.reporter})` : ''
      case TTHomePageType.myJoin:
        return m != null ? `(${m?.join})` : ''
    }
  }

  handleCreateClick = () => {
    this.props.navigation.push('CreateNewTT', {
      from: 'home',
    })
  }

  handleItemClick = (pageType: TTHomePageType) => {
    console.log('click', pageType)

    this.props.navigation.push('HomeList', {
      pagetype: pageType,
      currentUser: this.currentUser,
    })
  }
}

export default withTranslation('', {
	withRef: true
})(HomeGeneral);

