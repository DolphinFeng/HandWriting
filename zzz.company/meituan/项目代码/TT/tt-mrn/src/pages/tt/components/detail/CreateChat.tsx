import { i18nClient } from '@sailor/i18n-mrn'
/**
 * 创建大象群
 */

import React, { Component } from 'react'
import { Text, View, Image, TouchableOpacity, Keyboard } from '@mrn/react-native'
import { dStyle } from '../../constants/TTStyle'
import { createGroup, getGroupCcSetting } from '../../constants/TTApi'
import KNB from '@mrn/mrn-knb'
import check from '@images/check.png'
import { TopViewManager, Toast, SlideModal } from '@ss/mtd-react-native'
interface IProps {
  ticketId: number
  reporter: string
  assigned: string
  cc: Array<string>
  userNameList: Record<string, any>
  name: string
  rgId: number
  onClose: () => void
}

interface IState {
  ccChecked: boolean
}
export class CreateChat extends Component<IProps, IState> {
  instance: TopViewManager

  constructor(props: IProps) {
    super(props)

    this.state = {
      ccChecked: false,
    }
  }

  componentDidMount() {
    this.getCcSetting()
  }

  getCcSetting() {
    getGroupCcSetting(this.props.rgId).then(res => {
      if (res?.code === 200 && res?.data) {
        this.setState({ ccChecked: res.data.inviteCc || false })
      }
    })
  }

  render() {
    return this.renderChatbody()
  }

  renderChatbody() {
    return (
      <View style={{ flex: 1, height: 400 }}>
        <View style={dStyle.satisfyWrapper}>
          <TouchableOpacity style={dStyle.cancel} onPress={() => this.props.onClose()}>
            <Text style={dStyle.FontRegul16}>
              {i18nClient.t('components_detail_625fb2', { defaultValue: '取消' })}
            </Text>
          </TouchableOpacity>
          <Text style={dStyle.FontBold16}>
            {i18nClient.t('components_detail_850d7a', { defaultValue: '创建大象群' })}
          </Text>
          <TouchableOpacity style={dStyle.createChat} onPress={() => this.onCreateChat()}>
            <Text style={dStyle.chatTxt}>
              {i18nClient.t('components_detail_d9ac92', { defaultValue: '创建' })}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={[dStyle.ticketDivider1, { marginBottom: 26 }]} />
        {this.renderCCPeople(
          true,
          i18nClient.t('components_detail_d4285a', { defaultValue: '发起人' }),

          this.getName([this.props.reporter]),
        )}
        {this.renderCCPeople(
          true,
          i18nClient.t('components_detail_4c8c9d', { defaultValue: '处理人' }),

          this.getName([this.props.assigned]),
        )}
        {this.props.cc
          ? this.renderCCPeople(
              this.state.ccChecked,
              i18nClient.t('components_detail_24969a', { defaultValue: '抄送人' }),

              this.getName(this.props.cc),
            )
          : null}
      </View>
    )
  }

  getName(misList: Array<string>) {
    const { userNameList } = this.props
    // console.log('cccc ' + JSON.stringify(userNameList))
    let nameList = misList.map((v, i) => {
      if (userNameList.hasOwnProperty(v)) {
        return userNameList[v].displayName
      } else {
        return v
      }
    })

    return nameList.join('、')
  }

  closeChat() {}

  renderCCPeople(checked, title, userList) {
    const cOpacity =
      title === i18nClient.t('components_detail_24969a', { defaultValue: '抄送人' })
        ? 1
        : checked
        ? 0.45
        : 1
    const bgColor =
      title === i18nClient.t('components_detail_24969a', { defaultValue: '抄送人' }) && !checked
        ? 'white'
        : '#FFC300'
    const borderWidth =
      title === i18nClient.t('components_detail_24969a', { defaultValue: '抄送人' }) ? 1 : 0
    const borderColor =
      title === i18nClient.t('components_detail_24969a', { defaultValue: '抄送人' }) && !checked
        ? 'rgba(0,0,0,0.24)'
        : 'white'
    return (
      <TouchableOpacity
        disabled={
          title === i18nClient.t('components_detail_24969a', { defaultValue: '抄送人' })
            ? false
            : checked
        }
        style={{ flexDirection: 'row', marginBottom: 20, marginHorizontal: 16 }}
        onPress={() => {
          this.setState({ ccChecked: !this.state.ccChecked })
        }}
      >
        <View
          style={[
            dStyle.circle,
            {
              borderColor: borderColor,
              borderWidth: borderWidth,
              backgroundColor: bgColor,
              opacity: cOpacity,
            },
          ]}
        >
          {checked ? (
            <Image source={check} style={{ height: 12, width: 12 }} opacity={cOpacity} />
          ) : null}
        </View>
        <View>
          <Text style={dStyle.font16By84}>{title}</Text>
          <Text style={[dStyle.FontRegul14, { marginRight: 32 }]}>{userList}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  onCreateChat() {
    const name = `${this.props.ticketId}：${this.props.name}`
    const members = [this.props.reporter]
      .concat(this.props.assigned)
      .filter(mem => mem !== 'tt.notAssigned')
    const ccMembers = this.state.ccChecked ? (this.props.cc || []).concat(members) : members
    const finalMembers = Array.from(new Set(ccMembers))
    createGroup({
      objectId: this.props.ticketId,
      memberIds: finalMembers,
      name: name,
    })
      .then(res => {
        if (res?.code === 200 && res?.data) {
          this.props.onClose()
          let groupId = res.data
          let dxUrl = `mtdaxiang://www.meituan.com/chat?gid=${groupId}`
          console.warn('dxurl ' + dxUrl)
          KNB.use('openScheme', {
            url: dxUrl,
            success: function () {
              console.warn('enter group success')
            },
            fail: function () {
              console.warn('enter group error')
            },
          })
        } else {
          Toast.open(i18nClient.t('components_detail_3d1d4e', { defaultValue: '创建大象群失败' }))
        }
      })
      .catch(e => {
        Toast.open(i18nClient.t('components_detail_3d1d4e', { defaultValue: '创建大象群失败' }), e)
      })
  }
}
