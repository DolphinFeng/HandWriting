import { i18nClient } from '@sailor/i18n-mrn'
import { connect } from 'react-redux';
import React, { Component } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Clipboard,
  Platform,
} from '@mrn/react-native'
import { Toast, ActionSheet, SlideModal, Radio, Icon, Loading, MTDProvider } from '@ss/mtd-react-native'
import close from '@images/close.png'
import ellipsis from '@images/ellipsis.png'
import KNB from '@mrn/mrn-knb'
import MRNUtils from '@mrn/mrn-utils'
import { getKey } from '@common/helpers/api'
// FIXME: 这里用了 avatar 的 key， 需要调整
import { trackShareClick } from '../common/helpers/AvatarTracker'
import { isXiaoXiang } from '@src/pages/tt/components/common/TTHelper'
import { AppName } from '@src/common/helpers/app'
import { BottomCancelBtn } from './BottomCancelBtn'
import { dStyle } from '../pages/tt/constants/TTStyle'
import { setUserLanguage, getUserLanguage } from '../pages/tt/constants/TTApi'
import { Dimensions } from 'react-native';
import { dispatchSetTimeZone } from '../pages/tt/redux/thunks'; 
import { setTimeZone } from '../pages/tt/redux/actions'; 

const { width: screenWidth } = Dimensions.get('window');
// import { getKey } from 'src/common/api'

interface PageInfo {
  name?: string // 新增 分享后大象消息流显示效果 系统+ 内容 + 点击查看， name用于显示系统信息，如TT
  brief: string // 显示内容
  listLink: string
  detailLink: string
  lxCopyKey: string
  lxShareListKey: string
  lxShareDetailKey: string
  linkParamsCallback?: () => any
}

interface PropsValue {
  pageType: number
  pageInfo: PageInfo
  navigation?: any
}

// TODO: 这里逻辑有点复杂，待重构
class HeaderRightBtn extends Component<PropsValue> {

  constructor(props: PropsValue) {
    super(props)
    this.state = {
      slideModal: false,
      checkedLanguage: 'zh',
      checkedTimeZone: 'Asia/Shanghai',
      timeZoneMapping: {
        'Asia/Shanghai': 'GMT+08:00',
        'Asia/Riyadh': 'GMT+03:00'
      },
      theme: {
        mtdBrandPrimary: '#FF7700',
      }
    }
  }

  componentDidMount() {
    this.init()
  }

  async init() {
    try {
      const res = await getUserLanguage();
      const { locale, timeZone } = res.data || {};
  
      const defaultLocale = 'zh';
      const defaultTimeZone = 'GMT+08:00';
  
      const languageMapping = {
        'zh': 'zh',
        'zh-HK': 'zh-HK',
        'en': 'en'
      };
  
      const timeZoneMapping = {
        'GMT+08:00': 'Asia/Shanghai',
        'GMT+03:00': 'Asia/Riyadh'
      };
  
      const checkedLanguage = languageMapping[locale] || defaultLocale;
      const checkedTimeZone = timeZoneMapping[timeZone] || timeZoneMapping[defaultTimeZone];
  
      this.setState({ checkedLanguage, checkedTimeZone });
    } catch (error) {
      console.error('获取用户语言设置失败: ', error);
    }
  }

  


  async handleLanguageChange() {
    const { checkedLanguage, checkedTimeZone, timeZoneMapping } = this.state;
    // const { changeLanguage } = this.props;
    try {
      await setUserLanguage({
        locale: checkedLanguage,
        timeZone: timeZoneMapping[checkedTimeZone],
      });
      
      // 更新 Redux 中的时区状态
      this.props.dispatchSetTimeZone(timeZoneMapping[checkedTimeZone]);

      i18nClient.changeLanguage(checkedLanguage, (err, t) => {
        if (err) {
          Toast.open(i18nClient.t('change_language_and_time_zone_switching_failed', { defaultValue: '语言和时区切换失败' }));
          return;
        }
        Toast.open(i18nClient.t('change_language_and_time_zone_switching_successful', { defaultValue: '语言和时区切换成功' }));
        // changeLanguage(checkedLanguage);
        // Loading.open()
      });
      this.close();
    } catch (error) {
      console.error('Change user language setting failed: ', error);
    }
  }

  open = () => {
    this.setState({
      slideModal: true
    })
  }

  close = () => {
    this.setState({
      slideModal: false
    })
  }

  doShare() {
    const { pageType, pageInfo } = this.props
    const { brief, listLink, detailLink, name, linkParamsCallback } = pageInfo

    let relink = pageType === 1 ? listLink : detailLink
    if (linkParamsCallback) {
      let linkParams = linkParamsCallback()
      if (linkParams) {
        relink = relink + '?'
        Object.getOwnPropertyNames(linkParams).forEach(key => {
          relink = relink + key + '=' + linkParams[key]
        })
      }
    }

    let options
    const appName = getKey('appName')
    if (appName === AppName.dx) {
      options = [
        { label: i18nClient.t('base_components_c31f48', { defaultValue: '分享' }), value: '1' },
        { label: i18nClient.t('base_components_879058', { defaultValue: '复制链接' }), value: '2' },
        { label: i18nClient.t('language_and_time_zone', { defaultValue: '语言和时区' }), value: '5' },
      ]

      if (detailLink && detailLink.indexOf('detail') !== -1) {
        options.unshift({
          label: i18nClient.t('base_components_5a1367', { defaultValue: '返回首页' }),
          value: '4',
        })
      }
    } else {
      options = [
        { label: i18nClient.t('base_components_879058', { defaultValue: '复制链接' }), value: '2' },
        { label: i18nClient.t('language_and_time_zone', { defaultValue: '语言和时区' }), value: '5' },
      ]
    }

    const instance = ActionSheet.open({
      options: options,
      modalProps: {
        maskClosable: true
      },
      footer: <BottomCancelBtn handlePress={() => instance.close()}/>,
      confirmCallback: item => {
        this.doAction(item, relink, brief, name)
      },
      cancelCallback: () => {
        console.log('cancel')
      }
    })
  }

  doAction(item, shareLink, brief, name?) {
    console.warn('actions', item, shareLink, brief, name)
    const { pageType } = this.props
    const { lxCopyKey, lxShareListKey, lxShareDetailKey } = this.props.pageInfo

    switch (item.value) {
      case '1':
        pageType === 1 ? trackShareClick(lxShareListKey) : trackShareClick(lxShareDetailKey)
        KNB.use('dxmp.sendTemplateMessage', {
          msgBody: {
            templateName: name ?? brief,
            contentTitle: brief,
            link: shareLink,
            linkName: i18nClient.t('base_components_08d976', { defaultValue: '点击查看' }),
          },
          extend: {},
          success: function (res) {
            console.log('send msg success' + res)
          },
          fail: function (err) {
            console.log('send msg err' + err)
          },
        })
        break
      case '2':
        trackShareClick(lxCopyKey)
        Clipboard.setString(shareLink)
        Toast.open(i18nClient.t('base_components_20a495', { defaultValue: '复制成功' }))
        break
      case '3':
        MRNUtils.close() // 大象KNB iOS再不支持关闭容器，所以使用MRN
        break
      case '4':
        this.props.navigation?.navigate('Home')
        break
      case '5':
        this.open()
        break
      default:
        console.warn('this is empty')
        break
    }
  }

  doClose() {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      MRNUtils.close() // 大象KNB iOS再不支持关闭容器，所以使用MRN
    } else {
      KNB.use('MRN.closePage', {
        params: {},
        success: function (data) {
          console.warn(data)
        },
        fail: function (error) {
          console.error(error)
        },
      })
    }
  }

  render() {
    return (
      <View style={styles.outline}>
        <TouchableOpacity onPress={() => this.doShare()}>
          <Image source={ellipsis} style={styles.iconMore} />
        </TouchableOpacity>
        <View style={styles.line} />
        <TouchableOpacity onPress={() => this.doClose()}>
          <Image source={close} style={styles.iconClose} />
        </TouchableOpacity>
        {/* 语言切换配置 */}
        <SlideModal
          visible={this.state.slideModal}
          useNativeDriver={true}
          key={this.state.slideModal}
          title={i18nClient.t('language_and_time_zone', { defaultValue: '语言和时区' })}
          leftLabel={i18nClient.t('components_create_625fb2', { defaultValue: '取消' })}
          rightLabel={i18nClient.t('components_common_38cf16', { defaultValue: '确定' })}
          leftCallback={() => {
            this.close()
            console.log('cancel')
          }}
          rightCallback={() => {
            this.close()
            this.handleLanguageChange();
            console.log('confirm')
          }}
          wrapperStyles={{
            borderTopLeftRadius: 12,  // 上左角圆角
            borderTopRightRadius: 12, // 上右角圆角
          }}
          headerStyles={{
            rightOperatorStyles: {
              color: '#FF7700' // 设置右侧按钮的颜色为橙色
            }
          }}          
        >
          <View
            style={[
              styles.contentBody,
              { backgroundColor: '#fff', height: Dimensions.get('window').height * 0.8 }
            ]}
          >
            <MTDProvider theme={this.state.theme}>
              <Text style={styles.contentBodyText}>
                  <View>
                    <View>
                      <Text style={styles.blockTitle}>{i18nClient.t('change_language', { defaultValue: '语言' })}</Text>
                    </View>
                    <View style={dStyle.ticketDivider1} />
                    <View style={styles.content}>
                      <Radio
                        checkedValue={this.state.checkedLanguage}
                        onChange={value => {
                          this.setState({
                            checkedLanguage: value
                          })
                        }}
                        iconPosition="right"
                      >
                        <Radio.Item label="中文简体" hasLine value={'zh'} onChange={val => console.log('中文' + val)}/>
                        <Radio.Item label="中文繁體" hasLine value={'zh-HK'} />
                        <Radio.Item label="English" value={'en'} />
                      </Radio>
                    </View>
                  </View>
                  <View>
                    <View>
                      <Text style={styles.blockTitle}>{i18nClient.t('change_time_zone', { defaultValue: '时区' })}</Text>
                    </View>
                    <View style={dStyle.ticketDivider1} />
                    <View style={styles.content}>
                      <Radio
                        checkedValue={this.state.checkedTimeZone}
                        onChange={value => {
                          this.setState({
                            checkedTimeZone: value
                          })
                        }}
                        iconPosition="right"
                      >
                        <Radio.Item label={i18nClient.t('change_asiashanghai', { defaultValue: '亚洲/上海' })} hasLine value={'Asia/Shanghai'} onChange={val => console.log('亚洲/上海' + val)}/>
                        <Radio.Item label={i18nClient.t('lia_de', { defaultValue: '亚洲/利雅得' })} value={'Asia/Riyadh'} />
                      </Radio>
                    </View>
                  </View>
              </Text>
            </MTDProvider>
          </View>
        </SlideModal>
      </View>
    )
  }
}

const mapDispatchToProps = (dispatch) => ({
  dispatchSetTimeZone: (timeZone) => dispatch(setTimeZone(timeZone)),
});


export default connect(null, mapDispatchToProps)(HeaderRightBtn);



const styles = StyleSheet.create({
  outline: {
    flexDirection: 'row',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,0.06)',
    width: 88,
    height: 32,
    borderRadius: 20,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    alignItems: 'center',
    marginRight: 16,
    // marginTop: 6
  },
  line: {
    borderWidth: 0.5,
    height: 18,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  iconMore: {
    width: 20,
    height: 20,
  },
  iconClose: {
    width: 20,
    height: 20,
  },
  contentBody: {
    backgroundColor: '#F7F7F7',
    borderRadius: 4,
    padding: 16,
    borderTopLeftRadius: 50,  // 上左角圆角
    borderTopRightRadius: 50, // 上右角圆角
  },
  contentBodyText: {
    fontSize: 16,
    color: '#999999',
    width: '100%'
  },
  content: {
    backgroundColor: '#fff',
    paddingVertical: 6,
    width: Dimensions.get('screen').width - 20
  },
  blockTitle: {
    paddingTop: 12,
    paddingBottom: 6,
    fontFamily: 'PingFang SC',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 22,
    letterSpacing: 0,
    color: '#A3A3A3',
  },
})
