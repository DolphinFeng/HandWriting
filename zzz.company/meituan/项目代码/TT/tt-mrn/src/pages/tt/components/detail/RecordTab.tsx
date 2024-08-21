/**
 * 处理记录Tab
 */

import React, { Component, Fragment } from 'react'
import { Text, View, Image, ImageBackground, Keyboard } from '@mrn/react-native'
import { dStyle } from '../../constants/TTStyle'
import { TicketDetail } from '../../constants/TTServiceModule'
import {
  updateTicket,
  getOptionRecord,
  searchDisplayNameList
} from '../../constants/TTApi'
import { TopViewManager, Toast, Tab } from '@ss/mtd-react-native'
import MWSList from '@src/components/MWSList'
import avatar from '@images/default-avator.png'
import { formatDateSeconds } from '@src/common/helpers/FormatDate'
import HTMLDisplay from '../comment/HTMLDisplay'
import {
  connectExternalUser,
  InjectedExternalUserProps
} from '../../redux/connectors'
import store, { RootState } from '../../redux/store'
import { connect } from 'react-redux'
interface IProps {
  ticketId: number
}

interface IState {
  avatars: Record<string, string>
}
class _RecordTab extends Component<IProps & InjectedExternalUserProps, IState> {
  instance: TopViewManager
  flatListRef: any

  constructor(props) {
    super(props)

    this.state = {
      avatars: {}
    }
  }

  componentDidMount() {}

  render() {
    const list = (
      <MWSList
        key={'list'}
        renderItem={(item, index) => this.renderItem(item)}
        keyExtractor={(item, index) => index.toString()}
        // renderSeparator={() => this.renderSeperator()}
        onLoad={(pageSize: number, pageNo: number, refresh: boolean) =>
          this.newOnLoad(pageSize, pageNo, refresh)
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

  renderItem(item) {
    if (item?.isCuttingLine && item?.isCuttingLine === true) {
      return this.renderOnlineItem(item)
    } else {
      return this.renderNormalItem(item)
    }
  }

  renderNormalItem(item) {
    const isExternalUser = this.props.isExternalUser
    const { avatars } = this.state
    // transfer_v1_v2 机器人
    // const source = avatars[item?.actor]? { uri: avatars[item.actor] } : avatar
    // const name = item?.displayName ? `${item?.displayName}/${item?.actor}` : item?.actor
    const source = isExternalUser
      ? null
      : item?.actor?.avatar
      ? { uri: item.actor.avatar }
      : avatar
    const name = isExternalUser
      ? (item?.actor?.i18nDisplayName ? item?.actor?.i18nDisplayName : item?.actor?.displayName)
      : item?.actor?.i18nDisplayName
      ? `${item?.actor?.i18nDisplayName}/${item?.actor?.mis}`
      : (item?.actor?.displayName ? `${item?.actor?.displayName}/${item?.actor?.mis}` : item?.actor?.mis)
    return (
      <>
        {this.renderSeperator()}
        <View style={{ marginVertical: 12, marginHorizontal: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ImageBackground
                source={source}
                defaultSource={require('@images/default-avator.png')}
                style={{
                  height: 24,
                  width: 24,
                  marginRight: 8,
                  borderRadius: 12,
                  overflow: 'hidden'
                }}
              />
              <Text style={dStyle.Font14by84}>{name}</Text>
            </View>
            <Text>{formatDateSeconds(item?.actTime, 'noYear')}</Text>
          </View>
          {/* <Text style={[dStyle.FontRegul14, {marginLeft: 32}]}>{item?.message}</Text> */}
          {item?.message ? (
            <HTMLDisplay
              html={`<div style="padding-left: 32">${item.message}</div>`}
            />
          ) : null}
        </View>
      </>
    )
  }

  renderOnlineItem(item) {
    return (
      <>
        {this.renderDashLine()}
        <View style={{ marginVertical: 12, marginHorizontal: 16 }}>
          {item?.message ? (
            <HTMLDisplay
              html={`<div style="padding-left: 32">${item.message}</div>`}
            />
          ) : null}
        </View>
      </>
    )
  }

  renderSeperator() {
    return <View style={[dStyle.ticketDivider1, { marginLeft: 48 }]} />
  }

  renderDashLine() {
    return <View style={dStyle.dashLine} />
  }

  async newOnLoad(pageSize, pageNo, refresh) {
    let resp = await getOptionRecord(this.props.ticketId, {
      cn: pageNo,
      sn: pageSize
    })
    try {
      if (resp?.code === 200) {
        const data = resp.data
        const items = data.items
        // this.fetchUserAvatar(data.items)
        return new Promise<any[]>((resolve, reject) => {
          resolve(items)
        })
      } else {
        return new Promise<any[]>((resolve, reject) => {
          resolve([])
        })
      }
    } catch (error) {
      return new Promise<any[]>((resolve, reject) => {
        resolve([])
      })
    }
  }

  async fetchUserAvatar(records: Array<any>) {
    const { avatars } = this.state
    const misSet = new Set<string>()
    records &&
      records.forEach(record => {
        if (!avatars.hasOwnProperty(record.actor)) {
          misSet.add(record.actor)
        }
      })
    if (misSet.size > 0) {
      try {
        const resp = await searchDisplayNameList(Array.from(misSet))
        if (resp && resp.code === 200 && resp.data) {
          this.setState({
            avatars: {
              ...this.state.avatars,
              ...Object.entries(resp.data).reduce((ret, [key, { avatar }]) => {
                ret[key] = avatar
                return ret
              }, {})
            }
          })
        }
      } catch (e) {
        console.log('获取头像 error')
      }
    }
  }
}

// export const RecordTab = connectExternalUser(_RecordTab)
const mapStateToProps = (state) => ({
  timeZone: state.timeZone.timeZone, // 将时区数据映射到组件的 props 中
});

export const RecordTab = connectExternalUser(connect(mapStateToProps)(_RecordTab));
