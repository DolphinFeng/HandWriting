import { i18nClient } from '@sailor/i18n-mrn'
/**
 * SLA 状态变化
 */

import React, { Component, Fragment } from 'react'
import { Text, View, Image, TouchableOpacity, Keyboard, ScrollView } from '@mrn/react-native'
import { dStyle } from '../../constants/TTStyle'
import { TicketDetail } from '../../constants/TTServiceModule'
import { updateTicket } from '../../constants/TTApi'
import { TopViewManager, Toast, Tab } from '@ss/mtd-react-native'
import { DetailTab } from './DetailTab'
import { RecordTab } from './RecordTab'
import { ChatTab } from './ChatTab'
import { AboutTab } from './AboutTab'
import { TicketTitle } from './TicketTitle'
import { TTDetailContext } from './DetailContext'
import { ttTrackDetailClick, TTKeys } from '../../constants/TTKeys'

interface IProps {
  // data: TicketDetail
  ticketId: number
}

interface IState {
  // stateData: TicketDetail
  pageType: 'desc' | 'chat' | 'record' | 'about'
}
export class TicketTab extends Component<IProps, IState> {
  static contextType = TTDetailContext
  context!: React.ContextType<typeof TTDetailContext>

  descRef: any

  constructor(props: IProps, context) {
    super(props, context)

    this.state = {
      // stateData: this.props.data,
      pageType: 'desc',
    }
  }

  componentDidMount() {}

  render() {
    const { pageType } = this.state
    console.log('2-detail ticketTab page ------------- ' + pageType)
    return (
      <ScrollView overScrollMode="never" style={{ flex: 1 }}>
        <TicketTitle />
        <Tab
          suteTabUnderLineWidth={true}
          isBalanced={false}
          activeUnderlineStyle={dStyle.ActivieUnderline}
          activeTextStyle={dStyle.FontBold16}
          textStyle={dStyle.FontRegul16}
          value={this.state.pageType}
          scrollable={true}
          options={[
            {
              value: 'desc',
              label: i18nClient.t('components_detail_3bdd08', { defaultValue: '描述' }),
            },
            {
              value: 'chat',
              label: i18nClient.t('components_detail_92bd50', { defaultValue: '大象记录' }),
            },
            {
              value: 'record',
              label: i18nClient.t('components_detail_795af9', { defaultValue: '处理记录' }),
            },
            {
              value: 'about',
              label: i18nClient.t('components_detail_4d9234', { defaultValue: '相关内容' }),
            },
          ]}
          onChange={data => {
            console.log('data', data)
            this.handleTabChange(data.value)
          }}
        />

        <View style={[dStyle.ticketDivider1, { marginHorizontal: 16 }]} />
        {pageType === 'desc' ? this.renderDetail() : null}
        {pageType === 'chat' ? this.renderDxLog() : null}
        {pageType === 'record' ? this.renderRecord() : null}
        {pageType === 'about' ? this.renderAbout() : null}
      </ScrollView>
    )
  }

  handleTabChange = value => {
    this.setState({ pageType: value })
  }

  renderDetail() {
    const { ticketDetail } = this.context
    return ticketDetail.id ? (
      <DetailTab
        ticketId={this.props.ticketId}
        ref={f => {
          this.descRef = f
        }}
      />
    ) : null
  }

  renderDxLog() {
    ttTrackDetailClick(TTKeys.DetailClick.chatTab)
    return <ChatTab ticketId={this.props.ticketId} />
  }

  renderRecord() {
    ttTrackDetailClick(TTKeys.DetailClick.recordTab)
    return <RecordTab ticketId={this.props.ticketId} />
  }

  renderAbout() {
    ttTrackDetailClick(TTKeys.DetailClick.aboutTab)
    return <AboutTab ticketId={this.props.ticketId} />
  }

  // handleDescChange = (info) => {
  //   updateTicket(this.props.ticketId, {desc: info.desc}).then(res => {
  //     if (res?.code === 200 && res?.data) {
  //       this.setState({stateData: res.data})
  //     }
  //   })

  // }

  updateAssign(serviceCategory, needInvite) {
    this.descRef?.handleUpdateAssign(serviceCategory, needInvite)
  }
  // updateSatisfy(satisfyInfo) {
  //   this.descRef.handleUpdatesatisfy(satisfyInfo)
  // }
}
