import { i18nClient } from '@sailor/i18n-mrn'
/**
 * 大象记录Tab
 */

import React, { Component, Fragment } from 'react'
import { Text, View, TouchableOpacity, Dimensions, ImageBackground } from '@mrn/react-native'
import KNB from '@mrn/mrn-knb'
import { dStyle } from '../../constants/TTStyle'
import {
  DX_MESSAGE_TYPE,
} from '../../constants/ConfigMap'
import { TicketDetail } from '../../constants/TTServiceModule'
import { searchDisplayNameList, getMessage } from '../../constants/TTApi'
import { TopViewManager, Toast, Tab } from '@ss/mtd-react-native'
import MWSList from '@src/components/MWSList'
import avatar from '@images/default-avator.png'
import { formatDateSeconds } from '@src/common/helpers/FormatDate'
import { connectExternalUser, InjectedExternalUserProps } from '../../redux/connectors'
interface IProps {
  ticketId: number
}
// todo 用户头像、名称等信息可以存store
interface IState {
  avatars: Record<string, { avatar; displayName }>
}

const { width } = Dimensions.get('screen')
class _ChatTab extends Component<IProps & InjectedExternalUserProps, IState> {
  instance: TopViewManager
  flatListRef: MWSList
  oldGroupId: number = 0
  msgId: number = 0
  allIn: boolean = false
  constructor(props) {
    super(props)

    this.state = {
      avatars: {},
    }
  }

  componentDidMount() {}

  render() {
    const list = (
      <MWSList
        key={'list'}
        renderItem={(item, index) => this.renderItem(item)}
        keyExtractor={(item, index) => index.toString()}
        renderSeparator={() => this.renderSeperator()}
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
    if (item?.msgType === 'separator') return null
    const isExternalUser = this.props.isExternalUser
    const { avatars } = this.state
    const source = isExternalUser
      ? null
      : avatars[item?.userInfo?.userId]
      ? { uri: avatars[item?.userInfo?.userId]?.avatar }
      : avatar
    const displayName = avatars[item?.userInfo?.userId]
      ? avatars[item?.userInfo?.userId]?.displayName
      : ''
    const name = isExternalUser
      ? displayName || item?.userInfo?.userId
      : displayName
      ? `${displayName}/${item?.userInfo?.userId}`
      : item?.userInfo?.userId

    return (
      <View style={{ marginVertical: 12, marginHorizontal: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
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
                overflow: 'hidden',
              }}
            />

            <Text style={dStyle.Font14by84}>{name}</Text>
          </View>
          <Text>{formatDateSeconds(item?.sendTime, 'noYear')}</Text>
        </View>
        {this.renderBody(item)}
      </View>
    )
  }

  renderBody(item) {
    switch (item.msgType) {
      case 'text':
        return <Text style={[dStyle.FontRegul14, { marginLeft: 32 }]}>{item?.msgBody?.text}</Text>

      case 'image':
        return (
          <TouchableOpacity onPress={() => this.handlePressImage(item)}>
            <ImageBackground
              source={{ uri: item?.msgBody?.original }}
              style={{
                marginLeft: 32,
                width: width - 64,
                height: 50,
                overflow: 'hidden',
              }}
            />
          </TouchableOpacity>
        )

      case 'emotion':
        return (
          <Text>
            {i18nClient.getFormatText('components_detail_5c500d', `表情：${item?.msgBody?.name}`,{
              slot0: item?.msgBody?.name
            })}
          </Text>
        )
      default:
        return (
          <Text style={[dStyle.FontRegul14, { marginLeft: 32 }]}>{`[${
            i18nClient.t(DX_MESSAGE_TYPE[item.msgType]?.cn_name) || '其他消息'
          }]`}</Text>
        )
    }
  }

  private handlePressImage(item) {
    // console.log('press', item)
    if (!item?.msgBody?.original) {
      return
    }
    KNB.previewImage({
      current: item.msgBody.original,
      urls: this.flatListRef
        ?.getData()
        ?.filter(item => item?.msgType === 'image' && item?.msgBody?.original)
        ?.map(item => item.msgBody.original),
    })
  }

  renderSeperator() {
    return <View style={[dStyle.ticketDivider1, { marginLeft: 48 }]} />
  }

  async newOnLoad(pageSize, pageNo, refresh) {
    let resp = await getMessage({
      currentPageNum: pageNo,
      pageSize: pageSize,
      objectId: this.props.ticketId,
      groupId: this.oldGroupId,
      msgId: this.msgId,
    })
    try {
      if (resp?.code === 200) {
        const data = resp.data
        this.oldGroupId = data?.groupId
        this.msgId = data?.msgId
        this.allIn = data?.allIn
        this.fetchUserAvatar(data?.list)
        return new Promise<any[]>((resolve, reject) => {
          resolve(data?.list)
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

  async fetchUserAvatar(items: Array<any>) {
    const { avatars } = this.state
    const misSet = new Set<string>()
    items &&
      items.forEach(record => {
        if (record?.userInfo?.userId && !avatars.hasOwnProperty(record?.userInfo?.userId)) {
          misSet.add(record.userInfo.userId)
        }
      })
    if (misSet.size > 0) {
      try {
        const resp = await searchDisplayNameList(Array.from(misSet))
        if (resp && resp.code === 200 && resp.data) {
          this.setState({
            avatars: {
              ...this.state.avatars,
              ...Object.entries(resp.data).reduce((ret, [key, { avatar, displayName }]) => {
                ret[key] = { avatar, displayName }
                return ret
              }, {}),
            },
          })
        }
      } catch (e) {
        console.log('获取头像 error')
      }
    }
  }
}

export const ChatTab = connectExternalUser(_ChatTab)
