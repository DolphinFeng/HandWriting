import { i18nClient } from '@sailor/i18n-mrn'
import React, { Component } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  StyleSheet,
  Image,
} from '@mrn/react-native'
import { MWSStyle } from '@src/common/styles/MWSCommonStyle'
import HeaderRightBtn from '@src/components/NavRightButton'
import { getKey } from '@src/common/helpers/api'
import server from '@images/server.png'
import qa from '@images/question.png'
import KNB from '@mrn/mrn-knb'
import { getBulletin, getFAQ, getRgRobot, getUserInfo } from '../../constants/TTApi'
import { checkNull } from '@src/common/helpers/HelperFunctions'
import MWSList from '@src/components/MWSList'
import { dStyle } from '../../constants/TTStyle'
import { Icon, Toast, Tip } from '@ss/mtd-react-native'
import right from '@assets/images/right-thick.png'
import ExpandableTextContainer from 'react-native-expandable-text'
import { getTTRglinkByEnv } from '../common/TTHelper'
import { AppName } from '@src/common/helpers/app'

interface IProps {
  navigation: any
  screenProps: any
}

interface IState {
  bulletContent: string
  expandable: boolean
  collapsed: boolean
}

const { width, height } = Dimensions.get('window')

const relationType = 'MOSES' // HELPDESK/MOSES
class RGHome extends Component<IProps, IState> {
  rgId: number
  flatListRef: MWSList
  robotKey: string
  mis: null
  moseDomain =
    getKey('env') === 'test'
      ? 'http://moses.nlp.test.sankuai.com/chat'
      : 'https://moses.meituan.com/chat'

  static navigationOptions = ({ navigation }) => ({
    title: i18nClient.t('components_home_972754', { defaultValue: 'TT提问' }),
    headerStyle: MWSStyle.headerStyle,
    headerTitleStyle: MWSStyle.headerTitleStyle,
    gesturesEnabled: true,
    headerLeft: Platform.OS === 'ios' ? null : <View style={{ marginLeft: 16 }} />,
    headerBackTitle: null,
    headerRight: (
      <HeaderRightBtn
        pageType={1}
        pageInfo={{
          name: 'TT',
          brief: navigation.getParam(
            'name',
            i18nClient.t('components_home_972754', { defaultValue: 'TT提问' }),
          ),
          listLink: getTTRglinkByEnv(navigation.getParam('rgId', 0)),
          detailLink: '',
          lxCopyKey: '',
          lxShareListKey: '',
          lxShareDetailKey: '',
        }}
      />
    ),
  })

  constructor(props) {
    super(props)

    this.state = {
      bulletContent: null,
      expandable: false,
      collapsed: true,
    }

    this.rgId = this.props.screenProps.id
    this.props.navigation.setParams({ rgId: this.rgId })
  }

  async componentDidMount() {
    getBulletin(this.rgId, true, relationType, 1, 10)
      .then(res => {
        if (res?.code === 200 && res?.data?.items?.length > 0) {
          const item0 = res.data.items[0]
          if (item0.enable === true && item0.content != null) {
            this.setState({ bulletContent: item0.content })
          }
        }
      })
      .catch(e => { })
    getRgRobot(this.rgId)
      .then(res => {
        if (res?.code === 200 && res?.data?.mosesId) {
          this.robotKey = res.data.mosesId
        }
      })
      .catch(e => { })
    getUserInfo()
      .then(res => {
        if (res?.code === 200 && res?.data) {
          this.mis = res?.data?.username
        }
      })
      .catch(e => { })
    i18nClient.on('languageChanged', this.changeTitle)
  }

  componentWillUnmount(){
    i18nClient.off('languageChanged', this.changeTitle)
  }

  changeTitle = () => {
    this.props.navigation.setParams({ title: i18nClient.t('components_home_972754', { defaultValue: 'TT提问' }) });
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.props.screenProps?.isPad ? (
          <Tip>
            {i18nClient.t('components_home_4fdd87', {
              defaultValue: '应用页面适配iPad版中，如遇使用问题请联系TT产研-lizhuoyang02',
            })}
          </Tip>
        ) : null}
        {this.renderBullet()}
        {this.renderQuestion()}
        {this.renderFooter()}
      </View>
    )
  }

  renderBullet() {
    if (this.state.bulletContent != null) {
      let rightPadding = this.state.expandable ? 24 : 16

      return (
        <TouchableOpacity
          style={[styles.bulletWrapper, { paddingRight: rightPadding }]}
          onPress={this.toggle}
        >
          <ExpandableTextContainer
            collapsed={this.state.collapsed}
            collapseNumberOfLines={2}
            onExpandableChange={this.textExpandableChange}
          >
            <Text style={styles.bulletTxt}>{this.state.bulletContent}</Text>
          </ExpandableTextContainer>
          {this.state.expandable ? (
            this.state.collapsed ? (
              <Icon type="down" style={styles.icon12} tintColor="#8F5300" />
            ) : (
              <Icon type="up" style={styles.icon12} tintColor="#8F5300" />
            )
          ) : null}
        </TouchableOpacity>
      )
    }
  }

  textExpandableChange = (expandable: boolean) => {
    this.setState({
      expandable: expandable,
    })
  }

  toggle = () => {
    if (this.state.expandable) {
      this.setState({
        collapsed: !this.state.collapsed,
      })
    }
  }

  renderQuestion() {
    return (
      <View style={styles.questWrapper}>
        {this.renderFAQHeader()}
        {this.renderFAQBody()}
      </View>
    )
  }

  renderFAQHeader() {
    return (
      <>
        <View
          style={{
            flexDirection: 'row',
            marginLeft: 16,
            height: 53,
            alignItems: 'center',
          }}
        >
          <Image source={qa} style={styles.icon} />
          <Text style={[{ marginLeft: 8 }, styles.footerTxt]}>
            {i18nClient.t('components_home_50d52d', { defaultValue: '常见问题' })}
          </Text>
        </View>
        <View style={dStyle.ticketDivider1} />
      </>
    )
  }

  renderFAQBody() {
    const list = (
      <MWSList
        key={'list'}
        renderItem={(item, index) => this.renderFAQItem(item)}
        keyExtractor={(item, index) => index.toString()}
        renderSeparator={() => this.renderSeperator()}
        onLoad={(pageSize: number, pageNo: number, refresh: boolean) =>
          this.newOnLoad(pageSize, pageNo)
        }
        showFooter={true}
        pageSize={10}
        // 列表分页
        needLoadByPage={true}
        clickLoad={true}
        ref={ref => {
          this.flatListRef = ref
        }}
      />
    )

    return list
  }

  renderSeperator() {
    return <View style={[dStyle.ticketDivider1, { marginLeft: 16 }]} />
  }

  async newOnLoad(pageSize: number, pageNo: number) {
    let res = await getFAQ(this.rgId, true, relationType, pageNo, pageSize)
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

  renderFAQItem(item) {
    return (
      <TouchableOpacity
        style={styles.faqContent}
        onPress={() => {
          KNB.openPage({ url: item?.content })
        }}
      >
        <Text style={styles.faqTxt}>{item?.title}</Text>
        <Image source={right} style={[styles.icon, { opacity: 0.38 }]} />
      </TouchableOpacity>
    )
  }

  renderFooter() {
    return (
      <View style={styles.footWrapper}>
        {this.renderMyCreated()}
        {this.renderToAsk()}
      </View>
    )
  }

  renderMyCreated() {
    return (
      <TouchableOpacity
        style={styles.footLeftBorder}
        onPress={() => {
          if (this.mis == null) {
            Toast.open(i18nClient.t('components_home_afa07e', { defaultValue: '用户id获取失败' }))
            return
          }
          const appName = getKey('appName')
          let urlPrefix
          switch (appName) {
            case AppName.starfire:
              urlPrefix = 'starfire://banma.meituan.com/mrn?'
              break
            case AppName.pangu:
              urlPrefix = 'moma://www.moma.com/mrn?'
              break
            case AppName.youxuanBD:
              urlPrefix = 'igrocerybd://www.grocery.com/mrn?'
              break
            case AppName.aboluo:
              urlPrefix = 'dpcrm://mrn?'
              break
            case AppName.tiangong:
              urlPrefix = 'welkin://mrn?'
              break
            case AppName.qishou:
              urlPrefix = 'idelivery://www.delivery.com/mrn?'
              break
            case AppName.dingxiang:
              urlPrefix = 'clove://www.clove.com/mrn?'
              break
            case AppName.youxuan:
              urlPrefix = 'gclove://www.gclove.com/mrn?'
              break
            case AppName.dx:
            case AppName.unknow:
            default:
              urlPrefix = 'mtdaxiang://www.meituan.com/mrn?'
              break
          }
          console.log('urlPrefix=', urlPrefix)
          KNB.openPage({
            url: urlPrefix + 'mrn_biz=bfe&mrn_entry=tt&mrn_component=tthomelist&pageType=createdBy',
          })
        }}
      >
        <Text style={styles.footerTxt}>
          {i18nClient.t('components_home_5ce065', { defaultValue: '我的历史提问' })}
        </Text>
      </TouchableOpacity>
    )
  }

  renderToAsk() {
    return (
      <TouchableOpacity
        style={styles.footRightBorder}
        onPress={() => {
          if (this.robotKey == null) {
            Toast.open(i18nClient.t('components_home_bd7dd1', { defaultValue: '机器人id获取失败' }))
            return
          }
          if (this.mis == null) {
            Toast.open(i18nClient.t('components_home_afa07e', { defaultValue: '用户id获取失败' }))
            return
          }

          let imUrl = `${this.moseDomain}?robotKey=${this.robotKey}&userId=${this.mis}`

          KNB.openPage({ url: imUrl })
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <Image source={server} style={styles.icon} />
          <Text style={styles.footerTxt}>
            {i18nClient.t('components_home_01c85e', { defaultValue: '我要提问' })}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }
}

export default RGHome

const styles = StyleSheet.create({
  bulletWrapper: {
    backgroundColor: '#FFFAE0',
    paddingLeft: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletTxt: {
    fontSize: 12,
    color: '#8F5300',
    lineHeight: 18,
    flexDirection: 'row',
  },

  questWrapper: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 8,
    marginTop: 8,
    flex: 1,
  },
  faqTxt: {
    fontSize: 16,
    color: 'rgba(0,0,0,0.84)',
    flex: 1,
  },
  faqContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginRight: 8,
    paddingVertical: 14,
    alignContent: 'center',
  },
  footWrapper: {
    marginLeft: 12,
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 35,
    alignItems: 'center',
  },
  footerTxt: {
    fontSize: 16,
    color: 'rgba(0,0,0,0.84)',
    fontFamily: 'PingFangSC-Medium',
    fontWeight: 'bold',
  },
  footLeftBorder: {
    flex: 1,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(5,5,5,0.08)',
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footRightBorder: {
    flex: 1,
    height: 40,
    backgroundColor: '#FFC300',
    borderRadius: 8,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    height: 20,
    width: 20,
  },
  icon12: {
    height: 12,
    width: 12,
  },
})
