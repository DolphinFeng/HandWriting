import { i18nClient } from '@sailor/i18n-mrn'
/**
 * 相关内容Tab
 */

import React, { Component, Fragment } from 'react'
import { Text, View, Image, TouchableOpacity, Keyboard } from '@mrn/react-native'
import { dStyle } from '../../constants/TTStyle'
import { TicketDetail } from '../../constants/TTServiceModule'
import { getConnectPage, getOptionRecord } from '../../constants/TTApi'
import { TopViewManager, Toast, Tab } from '@ss/mtd-react-native'
import { openLink } from '@src/common/helpers/OpenLink'
import { getTTlinkByEnv } from '../common/TTHelper'
import { MWSEmpty } from '@src/components/MWSEmpty'
interface IProps {
  ticketId: number
}

interface IState {
  associateData: Array<any>
}
export class AboutTab extends Component<IProps, IState> {
  instance: TopViewManager

  private _TT = []
  private _COE = []
  private _ONES = []

  constructor(props: IProps) {
    super(props)
    this.state = {
      associateData: null,
    }
  }

  componentDidMount() {
    getConnectPage(this.props.ticketId)
      .then(res => {
        if (res?.code === 200) {
          this.setState({ associateData: res?.data?.items ?? [] })
        } else {
          this.setState({ associateData: [] })
        }
      })
      .catch(err => {
        this.setState({ associateData: [] })
        console.log('getConnectPage ' + err)
      })
  }

  render() {
    const { associateData } = this.state
    if (associateData === null) {
      return null
    }
    this.reorganizateData()
    // todo 空状态遵循mtdui
    return associateData.length > 0 ? (
      <Fragment>
        {this.renderItem('TT')}
        {this.renderItem('COE')}
        {this.renderItem('ONES')}
      </Fragment>
    ) : (
      <MWSEmpty />
    )
  }
  // 对接口返回重组后展示
  reorganizateData() {
    const { associateData } = this.state

    associateData.map((item, index) => {
      switch (item.linkType) {
        case 'TT':
          this._TT.push(item)
          break
        case 'COE':
          this._COE.push(item)
          break
        case 'ONES':
          this._ONES.push(item)
          break
      }
    })
  }

  renderItem(type: 'TT' | 'COE' | 'ONES') {
    let data = this._TT
    if (type === 'COE') {
      data = this._COE
    } else if (type === 'ONES') {
      data = this._ONES
    }
    if (data && data.length === 0) {
      return
    }
    return (
      <Fragment>
        <View style={{ marginHorizontal: 16, marginVertical: 12 }}>
          <Text style={dStyle.FontBold14}>
            {i18nClient.getFormatText('components_detail_acffc0', `相关${type}`, { type: type })}
          </Text>
          {data.map((item, index) => {
            return (
              <Text
                key={index}
                style={[dStyle.aboutTxt, { marginTop: index === 0 ? 8 : 10 }]}
                onPress={() => {
                  let url = item.content
                  if (type === 'TT') {
                    url = getTTlinkByEnv(item.destination)
                  }
                  openLink(url)
                }}
              >
                {item.content}
              </Text>
            )
          })}
        </View>
        <View style={[dStyle.ticketDivider1, { marginLeft: 16 }]} />
      </Fragment>
    )
  }
}
