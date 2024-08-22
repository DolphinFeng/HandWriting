import { i18nClient } from '@sailor/i18n-mrn'
import React, { Component } from 'react'
import { View, Text, TouchableOpacity, Platform, Image } from '@mrn/react-native'
import { MWSStyle } from '@src/common/styles/MWSCommonStyle'
import { cStyle } from '@tt/constants/TTStyle'
import HeaderRightBtn from '@src/components/NavRightButton'
import NavLeftBar from '@src/components/NavLeftBar'
import { CreateNewTTProvider } from './CreateNewTTContext'
import CreateNewTTChild from './CreateNewTTChild'
import { Icon, Dialog, Toast, Tip } from '@ss/mtd-react-native'
import { TTKeys } from '../../constants/TTKeys'
import { getUserInfo } from '../../constants/TTApi'
import { ttTrackPageAppear, ttTrackPageDisappear } from '../common/TTTracker'
import recommend from '@images/recommend.png'
import store from '../../redux/store'
import { updateSpaceDomain } from '@src/common/store/actions'

class CreateNewTT extends Component<any, any> {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('iscustom', false)
      ? i18nClient.t('components_home_03617e', { defaultValue: '发起问题' })
      : i18nClient.t('components_create_f6e88c', { defaultValue: '发起TT' }),
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
    headerRight: Platform.OS === 'ios' ? null : <View style={{ marginRight: 16 }} />,
    // headerRight: <HeaderRightBtn
    //   pageType={2}
    //   pageInfo={{
    //     brief: navigation.getParam('brief', '详情'),
    //     listLink: '',
    //     detailLink: `https://seer.sankuai.com/detail/${navigation.getParam(
    //       'id',
    //       0
    //     )}`,
    //     lxCopyKey: '',
    //     lxShareListKey: '',
    //     lxShareDetailKey: ''
    //   }}
    // />
  })

  private trackingId = TTKeys.Page.Create
  private pageKey = 'mmwsTtCreate'

  async componentDidMount() {
    ttTrackPageAppear(this.pageKey, this.trackingId, { source: 'inner' })
    const isFromHome = this.props.navigation.getParam('from') === 'home'
    console.log('createTTFromHOME:', isFromHome)
    if (isFromHome) {
      try {
        const res = await getUserInfo()
        console.log('createTTPrompt:', res, this.props)
        if (res && res.code === 200 && res.data) {
          const { guideType, spaceId, guideCreateLink } = res.data
          const regex = /\/([\w-]+)\/create/
          const match = guideCreateLink?.match(regex)
          const domain = match ? match[1] : 'ticket'
          if (guideType === 'soft') {
            this.createPrompt(spaceId, domain)
          } else if (guideType === 'force') {
            this.updateGlobalDomain(domain)
            this.props.navigation.replace('CreateNewTT', {
              spaceId,
            })
          }
        }
      } catch (e) {
        Toast.open(
          i18nClient.t('components_common_dc486e', { defaultValue: '获取用户信息失败' }) + e,
        )
      }
    }

    i18nClient.on('languageChanged', this.setTitle)
  }

  setTitle = () => {
    const title = this.props.navigation.getParam('iscustom', false)
      ? i18nClient.t('components_home_03617e', { defaultValue: '发起问题' })
      : i18nClient.t('components_create_f6e88c', { defaultValue: '发起TT' })
    this.props.navigation.setParams({ title })
    this.forceUpdate()
  }
  componentWillUnmount() {
    ttTrackPageDisappear(this.pageKey, this.trackingId, { source: 'inner' })
    i18nClient.off('languageChanged', this.setTitle)
  }
  updateGlobalDomain(domain: string) {
    store.dispatch(updateSpaceDomain(domain))
  }
  createPrompt(spaceId: number, domain: string) {
    Dialog.open({
      header: (
        <View
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View>
            <Image style={{ height: 76, width: 90 }} source={recommend} />
          </View>
          <View style={{ marginTop: 16, marginBottom: 8 }}>
            <Text style={cStyle.promptDialogTitle}>
              {i18nClient.t('components_create_0fd324', { defaultValue: '推荐使用' })}
            </Text>
          </View>
        </View>
      ),

      wrapperStyles: {
        width: 284,
      },
      body: (
        <View
          style={{
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Text style={cStyle.promptTitle}>
            {i18nClient.t('components_create_4868c9', {
              defaultValue: '根据你的组织架构缩小目录选择范围，更快找对目录，高效解决问题！',
            })}
          </Text>
        </View>
      ),

      cancelCallback: info => {
        // 选择“暂不使用”后，更新domain为ticket，清除缓存
        this.updateGlobalDomain('ticket')
        console.log(info)
      },
      confirmCallback: info => {
        this.updateGlobalDomain(domain)
        this.props.navigation.replace('CreateNewTT', {
          spaceId,
        })
      },
      modalProps: {
        containerStyles: {
          alignItems: 'center',
        },
      },
      renderOperationItem: (item, index) => {
        switch (index) {
          case 0:
            return (
              <Text style={[cStyle.dialogOperationText, cStyle.dialogCancelText]}>
                {i18nClient.t('components_create_fa1a1e', { defaultValue: '暂不使用' })}
              </Text>
            )

          case 1:
            return (
              <Text style={[cStyle.dialogOperationText, cStyle.dialogConfirmText]}>
                {i18nClient.t('components_create_4c9741', { defaultValue: '确定使用' })}
              </Text>
            )
        }
      },
    })
  }
  // 需要传递 screenProp
  render() {
    const catModel = this.props.navigation.getParam('extra') ?? this.props?.screenProps?.extra
    const customModel = this.props.navigation.getParam('extra2') ?? this.props?.screenProps?.extra2

    return (
      <CreateNewTTProvider>
        {this.props.screenProps?.isPad ? (
          <Tip>
            {i18nClient.t('components_home_4fdd87', {
              defaultValue: '应用页面适配iPad版中，如遇使用问题请联系TT产研-lizhuoyang02',
            })}
          </Tip>
        ) : null}
        <CreateNewTTChild
          navigation={this.props.navigation}
          extCatModel={catModel}
          extCustomModel={customModel}
        />
      </CreateNewTTProvider>
    )
  }
}

export default CreateNewTT
