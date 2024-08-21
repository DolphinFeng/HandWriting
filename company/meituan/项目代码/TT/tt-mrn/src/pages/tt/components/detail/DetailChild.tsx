import { i18nClient } from '@sailor/i18n-mrn'
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
import { Icon, Toast, Loading } from '@ss/mtd-react-native'
import {
  getRgArchiveInfo,
  getRgPermission,
  getTicketDetail,
  labelIdByName,
  updateTicket,
} from '../../constants/TTApi'
import { TicketDetail, Label } from '../../constants/TTServiceModule'
import { dStyle } from '@tt/constants/TTStyle'
import { SLAstate } from './SLAstate'
import { TicketTab } from './TicketTab'
import { TTWorkFlow } from './TTWorkflow'
import HeaderRightBtn from '@src/components/NavRightButton'
import NavLeftBar from '@src/components/NavLeftBar'
import { openLabelEditorModal } from '../common/LabelEditorModal'
import { getKey } from '@src/common/helpers/api'

import { TTDetailProvider, TTDetailContext } from './DetailContext'
import { getTTlinkByEnv } from '../common/TTHelper'

interface IProps {
  navigation: any
  ticketId: number
  screenProps: any
}

interface IState {
  // ticketDetail: TicketDetail
  rgId: number
}

class DetailChild extends Component<IProps, IState> {
  static contextType = TTDetailContext
  context!: React.ContextType<typeof TTDetailContext>

  ticketTabRef: any

  constructor(props) {
    super(props)

    this.state = {
      rgId: 0,
    }
  }

  componentDidMount() {
    let ext = this.props?.screenProps?.extra
    ext && this.context?.handleShowSatisfy(ext.unsatisfy || ext.common || ext.unresolved)
    this.onRefresh(true)
  }

  onRefresh = showLoading => {
    if (this.props.ticketId === 0) {
      Toast.open(i18nClient.t('components_detail_a869c3', { defaultValue: 'id不存在' }))
      return
    }
    let loading = null
    if (showLoading) {
      loading = Loading.open()
    } else {
      this.context.emitOnRefresh()
    }
    const { handleTicketDetail } = this.context
    getTicketDetail(this.props.ticketId)
      .then(resp => {
        if (resp?.code === 200 && resp?.data) {
          let data = resp.data as TicketDetail
          this.setState({ rgId: Number(data.rgId) || 0 })
          handleTicketDetail(data)
          // this.setState({ticketDetail : data})
          this.props.navigation.setParams({ name: data.name })
          // this.fetchLabels(data.labels)
          this.fetchRgPermission(data.rgId)
          this.fetchRgArchiveInfo(data.rgId)
        } else {
          Toast.open(
            i18nClient.t('components_detail_007559', {
              defaultValue: '获取TT详情失败，请检查是否有访问权限',
            }),
          )
        }
      })
      .catch(e => {
        console.log('获取TT详情失败')
      })
      .finally(() => {
        loading && loading.close()
      })
  }

  async fetchRgPermission(rgId: string) {
    if (!rgId) return
    try {
      const resp = await getRgPermission(rgId)
      if (resp?.code === 200 && resp?.data) {
        this.context.handleRgPermission(resp.data)
      }
    } catch (e) {}
  }

  async fetchRgArchiveInfo(rgId: number | string) {
    if (!rgId) return
    try {
      const resp = await getRgArchiveInfo(rgId)
      if (resp?.code === 200 && resp?.data) {
        // console.log('rg archive info', resp.data)
        this.context.handleRgArchiveInfo(resp.data)
      } else {
        console.debug('fetch rg archive info failed', resp?.message)
      }
    } catch (e) {
      console.debug('fetch rg archive info failed', e)
    }
  }

  componentDidUpdate() {}

  render() {
    console.log('1-detail  child--------------')
    const { ticketDetail } = this.context
    const { ticketId } = this.props
    // loading、下拉刷新
    // 网络异常处理
    if (ticketDetail === null) {
      return <View style={{ flex: 1, backgroundColor: 'white' }} />
    }
    // 详情页context 设置了初始值INIT_TICKET_INFO，然而子组件componentDidMount做了网络请求操作，所以延迟展示子组件
    return (
      <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
        {ticketDetail.sla ? (
          <SLAstate rgId={this.state.rgId} />
        ) : (
          <View style={dStyle.SLAOutWrapper} />
        )}

        <ScrollView
          overScrollMode="never"
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={() => this.onRefresh(false)} />
          }
        >
          <TicketTab
            ticketId={ticketId}
            ref={f => {
              this.ticketTabRef = f
            }}
          />
        </ScrollView>
        <View style={[dStyle.ticketDivider1]} />
        {ticketDetail.reporter ? (
          <TTWorkFlow
            navigation={this.props.navigation}
            ticketId={ticketId}
            callbackAssign={(newAssign, needInvite) => {
              this.setState({ rgId: Number(newAssign?.rgId) || 0 })
              this.ticketTabRef?.updateAssign(newAssign, needInvite)
            }}
          />
        ) : null}
      </SafeAreaView>
    )
  }

  renderBody() {}
}

export default DetailChild
