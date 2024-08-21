import { i18nClient } from '@sailor/i18n-mrn'
import React, { Component } from 'react'
import {
  View,
  Text,
  Dimensions,
  Image,
  TouchableOpacity,
  TouchableHighlight,
  StyleSheet,
  ViewStyle,
  Platform,
} from '@mrn/react-native'
import { MWSButton } from '@src/components/MWSButton'
import { TTHomeListStyle, TTHomeStyle } from '../../constants/TTStyle'
// import banner from '@images/ttBanner.png'
import newbanner from '@images/banner-new.jpeg'
import theme from '@src/common/styles/MWSStyle'
import { TTHomePageType, renderStatus } from './HomeList'
import { getTicketByName, getCustomFormList, getTicketListNumber } from '../../constants/TTApi'
import {
  TicketListNumberModel,
  TicketListItem,
  CCPersonModel,
  CustomListItemModel,
} from '../../constants/TTServiceModule'
import { MWSSearchList } from '@src/components/MWSSearchList'
import MWSList from '@src/components/MWSList'
import { formatDate2 } from '@src/common/helpers/FormatDate'
import { checkNull } from '@src/common/helpers/HelperFunctions'
import { requestCurrentUser, ttLog } from '../common/TTHelper'
import { getToken, forceGetToken } from '@common/helpers/api'
import rightArrow from '@images/right-thick-yellow.png'
import { renderInsetSeprator } from '@src/components/BaseComponents'
import { isIPhoneWithNotch } from '@src/common/styles/NavigationStyle'
import { Tip, Toast } from '@ss/mtd-react-native'
import { MWSStyle } from '@src/common/styles/MWSCommonStyle'
import HeaderRightBtn from '@src/components/NavRightButton'
import imgToDo from '@images/home_solve.png'
import imgAssign from '@images/home_assign.png'
import imgCC from '@images/home_send.png'
import imgCreate from '@images/home_initiate.png'
import imgMyJoin from '@images/home_circulation.png'

interface IProps {
  navigation: any
  screenProps: any
}

interface IState {
  listNumberModel?: TicketListNumberModel
  isSearching: boolean
  searchKeyWord: string
}

const screenWidth = Dimensions.get('screen').width
class HomeExternal extends Component<IProps, IState> {
  _rgId = 0
  private pageSize = 20
  private currentUser: CCPersonModel = null
  private searchResultRef: MWSList = null

  private _searchKeyword = ''

  pageList = [
    TTHomePageType.created,
    TTHomePageType.todo,
    // TTHomePageType.assignMe,
    // TTHomePageType.ccMe,
    // TTHomePageType.myJoin
  ]

  imgList = [
    imgCreate,
    imgToDo,
    // imgAssign,
    // imgCC,
    // imgMyJoin
  ]

  constructor(props) {
    super(props)

    this.state = {
      isSearching: false,
      searchKeyWord: '',
    }
    this._rgId = this.props.screenProps?.id ?? 0
    console.log('ccc' + this._rgId)
  }

  async componentDidMount() {
    // setTimeout(() => {
    //   this.requestListNumber()
    // }, 0.3);
    if (Platform.OS === 'ios') {
      await forceGetToken()
    }

    await this.requestListNumber()

    // await getToken().catch(e => console.warn(e))
    ttLog('before requestListNumber')

    // FIXME: 临时调试
    // setTimeout(() => {
    //   requestCurrentUser().then(res => {
    //     this.currentUser = res
    //   })
    // }, 1);

    this.currentUser = await requestCurrentUser()
    this.props.navigation.setParams({ title: i18nClient.t('components_home_4cd514', { defaultValue: '问题反馈' }) });
  }

  async requestListNumber() {
    if (Platform.OS === 'ios') {
      await forceGetToken()
    }
    // ttLog('requestListNumber')
    const r = await getTicketListNumber()
    // ttLog('after requestListNumber')

    if (r?.code === 200 && r?.data != null) {
      this.setState({ listNumberModel: r.data })
    } else {
      Toast.open(r?.message ?? i18nClient.t('components_home_a2168d', { defaultValue: '请求出错' }))
    }
  }

  render() {
    return (
      <View style={{ backgroundColor: 'white', flex: 1 }}>
        {/* {this.renderSearch()} */}
        {this.props.screenProps?.isPad ? (
          <Tip>
            {i18nClient.t('components_home_4fdd87', {
              defaultValue: '应用页面适配iPad版中，如遇使用问题请联系TT产研-lizhuoyang02',
            })}
          </Tip>
        ) : null}
        <View style={this.state.isSearching ? { display: 'none' } : { display: 'flex', flex: 1 }}>
          {this.renderImage()}
          {this.renderEntries()}
          {this.renderListHeader()}
          {renderInsetSeprator(16, 0, null, 8)}
          {this.renderEntryList()}
          {isIPhoneWithNotch() ? <View style={{ height: 20 }} /> : null}
        </View>
        {this.renderSearchContent()}
      </View>
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
        {this.renderEntryItem(0)}
        {this.renderEntryItem(1)}
      </View>
    )
  }

  renderEntryItem = (index: number) => {
    const left = index % 2 === 1 ? 8 : 0
    const top = index !== 0 && index !== 1 ? 8 : 0

    const type = this.pageList[index]

    const imgW = 20
    return (
      <TouchableHighlight
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

  renderListHeader = () => {
    const imgW = 20
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginHorizontal: 16,
          marginTop: 22,
        }}
      >
        <Text style={styles.headerTitle}>
          {i18nClient.t('components_home_03617e', { defaultValue: '发起问题' })}
        </Text>
        {/* <TouchableOpacity
           style={{ flexDirection: 'row', alignItems: 'center' }}
           onPress={() => this.goToMyCreatedList()}
          >
           <Text style={styles.buttonText}>{'查看我发起的'}</Text>
           <Image source={rightArrow} style={{ marginLeft: 0, width: imgW, height: imgW }} />
          </TouchableOpacity> */}
      </View>
    )
  }

  renderEntryList = () => {
    return (
      <MWSList
        key={'list33'}
        renderItem={(item, index) => this.renderListItem(item)}
        keyExtractor={(item, index) => index.toString()}
        onLoad={(pageSize: number, pageNo: number, refresh: boolean) =>
          this.newOnLoadEntryList(pageSize, pageNo, refresh)
        }
        showFooter={false}
        pageSize={this.pageSize}
        // 列表分页
        needLoadByPage={false}
        startPageNo={0}
        showsVerticalScrollIndicator={false}
        // ref={ref => {
        //   this.alarmFlatListRef = ref
        // }}
      />
    )
  }

  renderSearch() {
    return (
      <MWSSearchList
        placeHolderTxt={i18nClient.t('components_home_7f60a7', { defaultValue: '搜索TT' })}
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

  renderListItem(item: CustomListItemModel) {
    const tip = item.instruction
    return (
      <>
        <TouchableOpacity
          style={{ marginVertical: 14, marginHorizontal: 16 }}
          onPress={() => this.goToCreate(item)}
        >
          <Text style={styles.headerTitle}>{`${item.name ?? ''}`}</Text>
          {tip?.length > 0 ? <Text style={styles.tipText}>{`${tip}`}</Text> : null}
        </TouchableOpacity>
        {renderInsetSeprator(16)}
      </>
    )
  }

  // renderListItem (item: TicketListItem) {
  //   if (item === null || item === undefined) {
  //     return null
  //   }
  //   return (
  //     <View>
  //       <TouchableOpacity
  //         style={TTHomeListStyle.rowItem}
  //         onPress={() => {
  //           this.goToDetail(item)
  //         }}
  //       >
  //         <Text style={TTHomeListStyle.itemTitle}>{item?.name}</Text>
  //         <View style={{ flexDirection: 'row', marginTop: 6, alignItems: 'center', justifyContent: 'space-between' }}>
  //           {renderStatus(item.sla, item.state)}
  //           <Text style={TTHomeListStyle.itemTime}>{formatDate2(item.updatedAt)}</Text>
  //         </View>
  //       </TouchableOpacity>
  //       <View style={MWSStyle.divider1} />
  //     </View>
  //   )
  // }

  async newOnLoadEntryList(pageSize: number, pageNo: number, refresh: boolean) {
    // 只有在 ’我流转的‘ 列表里而且没有筛选的时候，使用 myJoin 接口

    // const options = this.getRequestOptions()
    // console.log('options', options);
    // FIXME: temp use
    const res = await getCustomFormList(this._rgId)
    // const res = await getCustomFormList(18683)

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

  // FIXME: 确实是否需要调整接口
  async newOnLoad(pageSize: number, pageNo: number, refresh: boolean) {
    // 只有在 ’我流转的‘ 列表里而且没有筛选的时候，使用 myJoin 接口

    // const options = this.getRequestOptions()
    // console.log('options', options);
    if (this._searchKeyword?.length > 0) {
      const res = await getTicketByName(this._searchKeyword, pageNo, pageSize)
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

  getNameFromPageType(t: TTHomePageType) {

    const m: any = this.state?.listNumberModel
    switch (t) {
      case TTHomePageType.todo:
        return i18nClient.t('components_home_e102a8', { defaultValue: '待我处理' })
      case TTHomePageType.assignMe:
        return i18nClient.t('components_home_170ac7', { defaultValue: '指派我的' })
      case TTHomePageType.ccMe:
        return i18nClient.t('components_home_e2e017', { defaultValue: '抄送我的' })
      case TTHomePageType.created:
        return i18nClient.t('components_home_6e871a', { defaultValue: '我发起的' })
      case TTHomePageType.myJoin:
        return i18nClient.t('components_home_b3d4f0', { defaultValue: '我流转的' })
    }
  }

  getCountFromPageType(t: TTHomePageType) {
    const m: any = this.state?.listNumberModel
    switch (t) {
      case TTHomePageType.todo:
        return m?.unresolved > 0 ? `(${m?.unresolved})` : ''
      case TTHomePageType.assignMe:
        return m != null ? `(${m?.assigned})` : ''
      case TTHomePageType.ccMe:
        return m != null ? `(${m?.cc})` : ''
      case TTHomePageType.created:
        return m?.reporter > 0 ? `(${m?.reporter})` : ''
      case TTHomePageType.myJoin:
        return m != null ? `(${m?.join})` : ''
    }
  }

  goToDetail(item: TicketListItem) {
    console.log('goto detail')

    this.props.navigation.push('Detail', {
      ticketId: item.id,
    })
  }

  goToCreate(item: CustomListItemModel) {
    console.log('goto create', item)

    this.props.navigation.push('CreateNewTT', {
      formid: item.id,
      rgid: item.rgId,
      // 'formid': 3526,
      // 'rgid': 18621,
      iscustom: true,
    })
  }

  goToMyCreatedList() {
    console.log('goto my created list')

    this.props.navigation.push('MyCreatedList')
  }

  goToMyTodoList() {
    console.log('goto my todo list')

    this.props.navigation.push('MyTodoList')
  }

  handleCreateClick = () => {
    console.log('click')
    this.props.navigation.push('CreateNewTT')
  }

  handleItemClick = (pageType: TTHomePageType) => {
    console.log('click', pageType)

    if (pageType === TTHomePageType.created) {
      this.goToMyCreatedList()
    } else if (pageType === TTHomePageType.todo) {
      this.goToMyTodoList()
    }
  }

  static navigationOptions = ({ navigation }) => ({
    title: i18nClient.t('components_home_4cd514', { defaultValue: '问题反馈' }),
    headerStyle: MWSStyle.headerStyle,
    headerTitleStyle: MWSStyle.headerTitleStyle,
    gesturesEnabled: true,
    headerLeft: null,
    headerBackTitle: null,
    headerRight: (
      <HeaderRightBtn
        pageType={1}
        pageInfo={{
          name: 'TT',
          brief: navigation.getParam('brief', 'TT'),
          listLink: '',
          detailLink: '',
          lxCopyKey: '',
          lxShareListKey: '',
          lxShareDetailKey: '',
        }}
      />
    ),
  })
}

export default HomeExternal

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: theme.size16,
    ...theme.fontBold,
    color: theme.gray84,
    lineHeight: theme.size24,
  } as ViewStyle,
  buttonText: {
    fontSize: theme.size14,
    color: theme.yellow800,
    lineHeight: theme.height20,
  },
  tipText: {
    fontSize: theme.size12,
    lineHeight: theme.height18,
    color: theme.gray60,
    marginTop: 6,
  },
})
