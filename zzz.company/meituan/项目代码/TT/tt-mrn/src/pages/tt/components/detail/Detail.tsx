import { i18nClient, withTranslation } from '@sailor/i18n-mrn'
import React, { Component } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  SafeAreaView,
} from '@mrn/react-native'
import { MWSStyle } from '@src/common/styles/MWSCommonStyle'
import { Icon, Tip } from '@ss/mtd-react-native'
import { getTicketDetail, labelIdByName, updateTicket } from '../../constants/TTApi'
import { TicketDetail, Label } from '../../constants/TTServiceModule'
import { dStyle } from '@tt/constants/TTStyle'
import { SLAstate } from './SLAstate'
import { TicketTab } from './TicketTab'
import { TTWorkFlow } from './TTWorkflow'
import HeaderRightBtn from '@src/components/NavRightButton'
import NavLeftBar from '@src/components/NavLeftBar'
import { openLabelEditorModal } from '../common/LabelEditorModal'
import { INIT_TICKET_INFO } from '../../constants/ConfigMap'
import { TTDetailProvider } from './DetailContext'
import { getTTlinkByEnv, isXiaoXiang } from '../common/TTHelper'
import DetailChild from './DetailChild'
import { ttTrackPageAppear, ttTrackPageDisappear } from '../common/TTTracker'
import { TTKeys } from '../../constants/TTKeys'

interface IProps {
  navigation: any // 列表路由进来
  screenProps: any // 消息流路由进来
}

class Detail extends Component<IProps, any> {
  ticketId: number = 0
  ticketTabRef: any

  // static navigationOptions = ({ navigation }) => ({
  //   title: isXiaoXiang()
  //     ? i18nClient.t('components_detail_f26225', { defaultValue: '详情' })
  //     : i18nClient.t('components_detail_ab47e6', { defaultValue: 'TT详情' }),
  //   headerStyle: MWSStyle.headerStyle,
  //   headerTitleStyle: MWSStyle.headerTitleStyle,
  //   gesturesEnabled: true,
  //   headerLeft: (
  //     <TouchableOpacity
  //       onPress={() => {
  //         console.log('1111mmmmm')

  //         const { state, goBack } = navigation
  //         // TODO: 判断处理过以后才去刷新
  //         state.params?.refresh && state.params?.refresh()

  //         if (state.params?.goBackKey != null) {
  //           goBack(state.params?.goBackKey)
  //         } else {
  //           navigation.back()
  //         }
  //       }}
  //     >
  //       <Icon type="left" style={{ height: 20, width: 20, marginLeft: 12 }} />
  //     </TouchableOpacity>
  //   ),

  //   headerBackTitle: null,
  //   headerRight: (
  //     <HeaderRightBtn
  //       pageType={2}
  //       pageInfo={{
  //         name: 'TT',
  //         brief: navigation.getParam(
  //           'name',
  //           i18nClient.t('components_detail_ab47e6', { defaultValue: 'TT详情' }),
  //         ),
  //         listLink: '',
  //         detailLink: getTTlinkByEnv(navigation.state?.params?.ticketId ?? 0),
  //         lxCopyKey: '',
  //         lxShareListKey: '',
  //         lxShareDetailKey: '',
  //       }}
  //       navigation={navigation}
  //     />
  //   ),
  // })

  constructor(props) {
    super(props)

    this.ticketId = this.props.navigation.getParam('ticketId', 0)
    if (this.ticketId === 0) {
      this.ticketId = this.props.screenProps.id
      this.props.navigation.setParams({ ticketId: this.ticketId })
    }
  }

  setTitle = () => {
    const title = isXiaoXiang()
        ? i18nClient.t('components_detail_f26225', { defaultValue: '详情' })
        : i18nClient.t('components_detail_ab47e6', { defaultValue: 'TT详情' })
    this.props.navigation.setParams({ title })
  }

  componentDidMount() {
    ttTrackPageAppear('ttDetail', TTKeys.Page.Detail, { source: 'inner' })
    i18nClient.on('languageChanged', this.setTitle)
  }

  componentWillUnmount() {
    ttTrackPageDisappear('ttDetail', TTKeys.Page.Detail, { source: 'inner' })
    i18nClient.off('languageChanged', this.setTitle)
  }

  render() {
    if (this.ticketId === 0) {
      return null
    }
    console.log('0-detail ticketId----- ' + this.ticketId)
    return (
      <TTDetailProvider>
        {this.props.screenProps?.isPad ? (
          <Tip>
            {i18nClient.t('components_home_4fdd87', {
              defaultValue: '应用页面适配iPad版中，如遇使用问题请联系TT产研-lizhuoyang02',
            })}
          </Tip>
        ) : null}
        <DetailChild
          navigation={this.props.navigation}
          ticketId={this.ticketId}
          screenProps={this.props.screenProps}
        />
      </TTDetailProvider>
    )
  }
}




// export default Detail
export default withTranslation('', {
	withRef: true
})(Detail);

// const DetailWrapper = withTranslation('', {
//   withRef: true
// })(Detail);

// // 把静态方法复制到包装组件上
// DetailWrapper.navigationOptions = Detail.navigationOptions;

// export default DetailWrapper;
