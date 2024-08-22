import { i18nClient } from '@sailor/i18n-mrn'
/**
 * SLA 状态变化
 */

import React, { Component } from 'react'
import { Text, View, Image, TouchableOpacity, ScrollView } from '@mrn/react-native'
import { dStyle } from '../../constants/TTStyle'
import { Sla2CN, SLA, SLA_OUTER_COLOR, SLA_STATE_COLOR } from '../../constants/ConfigMap'
import { TicketDetail } from '../../constants/TTServiceModule'
import {
  updateTicket,
  getTicketTime,
  getTicketDetailPermission,
  getNonWorkSetting,
  getSlaConfig,
} from '../../constants/TTApi'
import down from '@images/down-white.png'
import { ActionSheet } from '@ss/mtd-react-native/lib/ActionSheet'
import { TopViewManager, Toast, Dialog } from '@ss/mtd-react-native'
import { formatDate, formatDateWithoutCentury } from '@src/common/helpers/FormatDate'
import { TTDetailContext } from './DetailContext'
import { TTKeys, ttTrackDetailClick } from '../../constants/TTKeys'
import HTMLDisplay from '../comment/HTMLDisplay'
import { BottomCancelBtn } from '@src/components/BottomCancelBtn'
import { connect } from 'react-redux'

interface IProps {
  // propData: TicketDetail
  // onUpdateSLA:(newData) => void
  rgId: number
}

interface IState {
  //  stateData: TicketDetail
  //  slaDesc: string
}
// const NON_WORK_BTN_TIP = i18nClient.t('components_detail_6b3bdc', {
//   defaultValue: '当前为非工作时间，请您耐心等待，马上就会有人来帮您处理哦～',
// })


export class SLAstate extends Component<IProps, IState> {
  static contextType = TTDetailContext
  context!: React.ContextType<typeof TTDetailContext>
  instance: TopViewManager
  slaOptions = SLA.map((level, index) => {
    return { label: i18nClient.t(Sla2CN[level]), value: `S${index + 1}` }
  })
  upgradeReasonRequire: boolean = false
  slaChangeReason: string = ''
  dialogInstance = null
  currentRgId: number = 0

  constructor(props: IProps, context) {
    super(props, context)
    this.state = {
      // stateData: this.context, // 兄弟组件callback之后，通知本组件更新
      // slaDesc: ''
    }
  }

  componentDidUpdate() {
    if (this.props.rgId && this.props.rgId !== this.currentRgId) {
      this.currentRgId = this.props.rgId
      this.fetchRgSlaOptions()
      this.slaChangeReason = ''
    }
  }
  componentDidMount() {
    // sla - 0  主动获取 用于初始显示
    const { ticketDetail, handleSLATime, ticketOperate, handleTicketOperate } = this.context
    getTicketTime(ticketDetail.id)
      .then(res => {
        if (res?.code === 200 && res?.data) {
          handleSLATime(res.data)
        }
      })
      .catch(e => {
        console.log('sla - 0', e)
      })

    getTicketDetailPermission(ticketDetail.id)
      .then(res => {
        if (res?.code === 200 && res?.data?.detailOperate) {
          handleTicketOperate(res?.data)
          const showNonWorkDialog =
            res?.data?.detailOperate?.nonWorkingWarn === 'visible' &&
            res?.data?.isWorkHour === false
          if (showNonWorkDialog) {
            console.log('nonwork fetch setting')
            this.fetchNonWorkSetting()
          }
        }
      })
      .catch(e => {
        console.log('ticket - operate', e)
      })
  }
  fetchRgSlaOptions() {
    getSlaConfig(this.props.rgId)
      .then(res => {
        if (res && res.code === 200 && res.data) {
          const slaSettings = res.data.items
          this.slaOptions = slaSettings
            .sort((a, b) => a.name.localeCompare(b.name))
            .filter(item => item.displayWhenLauch)
            .map(item => ({
              value: item.name,
              label: i18nClient.t(Sla2CN[item.name]),
              instruction: item.description,
            }))
          this.upgradeReasonRequire = res.data.upgradeReasonRequire || false
        }
      })
      .catch(e => {
        console.log(e)
      })
  }

  fetchNonWorkSetting() {
    const NON_WORK_GLOBAL_TIP_DEFAULT = i18nClient.t('components_detail_2e586d', {
      defaultValue: '您好，您的问题已收到，我们将在工作时间立刻为您处理，请您耐心等待～',
    })
    getNonWorkSetting(this.context.ticketDetail.rgId, true)
      .then(res => {
        console.log('nonwork setting ', res.data)
        if (res?.code && res?.code === 200 && res?.data?.active === true) {
          this.nonWorkDialog(res?.data?.hint ?? NON_WORK_GLOBAL_TIP_DEFAULT)
        }
      })
      .catch(e => { })
  }

  nonWorkDialog(msg) {
    Dialog.alert({
      title: i18nClient.t('components_detail_84a76a', { defaultValue: '发起成功' }),
      body: (
        <ScrollView overScrollMode="never" style={{ marginTop: 8, maxHeight: 100 }}>
          <HTMLDisplay html={msg} />
        </ScrollView>
      ),

      confirmLabel: i18nClient.t('components_home_38cf16', { defaultValue: '确定' }),
      modalProps: {
        maskClosable: true,
      },
    })
  }

  render() {
    const { ticketDetail, ticketOperate } = this.context
    const slaDesc = this.getSlaDesc()
    const slaOperator = ticketOperate?.detailOperate?.sla === 'editable'
    return (
      <View style={[dStyle.SLAOutWrapper, { backgroundColor: SLA_OUTER_COLOR[ticketDetail?.sla] }]}>
        <TouchableOpacity
          style={[dStyle.SLAInnerWrapper, { backgroundColor: SLA_STATE_COLOR[ticketDetail?.sla] }]}
          disabled={!slaOperator}
          onPress={() => this.slaActionSheet()}
        >
          <Text style={dStyle.SLAFont14}>{i18nClient.t(Sla2CN[ticketDetail?.sla])}</Text>
          {slaOperator ? <Image source={down} style={{ height: 24, width: 24 }} /> : null}
        </TouchableOpacity>
        <Text style={[dStyle.SLAFont14, { flex: 1 }]}>{ticketDetail?.state?.displayName ?? ''}</Text>
        {<Text style={{ fontSize: 10, color: 'white', lineHeight: 20 }}>{slaDesc}</Text>}
      </View>
    )
  }

  slaActionSheet() {
    console.log('this.slaOptions', this.slaOptions)
    this.instance = ActionSheet.open({
      title: i18nClient.t('components_detail_8dfbf0', { defaultValue: '选择等级' }),
      options: this.slaOptions,
      modalProps: {
        maskClosable: true,
        onClose: data => this.instance.close(),
        containerStyles: {
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
        },
      },
      footer: <BottomCancelBtn handlePress={() => this.instance.close()} />,
      confirmCallback: item => {
        console.log('item ', item)
        this.openSLA(item)
      },
      cancelCallback: () => { },
    })
  }

  openSLA(item) {
    if (item?.value === 'S1') {
      // 非常紧急，提醒抄送leader
      Dialog.open({
        header: i18nClient.t('components_detail_02d455', { defaultValue: '非常紧急' }),
        message: i18nClient.t('components_detail_ae92f2', {
          defaultValue:
            '非常紧急代表短时间内不解决会对公司造成经济损失和负面影响的问题。选择非常紧急的同时会抄送您的上级，请您谨慎选择非常紧急。',
        }),

        modalProps: {
          maskOpacity: 0.1,
          maskClosable: true,
        },
        confirmLabel: i18nClient.t('components_home_38cf16', { defaultValue: '确定' }),
        confirmCallback: info => {
          if (this.upgradeReasonRequire) {
            this.changeSlaRequireReason(item)
          } else {
            this.updateSLA(item)
          }
        },
        cancelLabel: i18nClient.t('components_detail_625fb2', { defaultValue: '取消' }),
      })
    } else {
      if (this.upgradeReasonRequire) {
        this.changeSlaRequireReason(item)
      } else {
        this.updateSLA(item)
      }
    }
  }
  changeSlaRequireReason(item) {
    this.dialogInstance = Dialog.prompt({
      header: i18nClient.t('components_detail_7a97c9', { defaultValue: 'TT工单SLA等级变更' }),
      modalProps: {
        maskOpacity: 0.1,
        maskClosable: true,
      },
      inputChange: data => {
        this.slaChangeReason = data
      },
      operationList: [
        {
          label: i18nClient.t('components_detail_625fb2', { defaultValue: '取消' }),
          type: 'cancel',
        },
        {
          label: i18nClient.t('components_detail_939d53', { defaultValue: '提交' }),
          type: 'confirm',
          noAutoClose: true,
          callback: () => {
            // 必填校验
            if (!this.slaChangeReason || /^\s*$/.test(this.slaChangeReason)) {
              // 为空或者只有空格换行也不行
              Toast.open(
                i18nClient.t('components_detail_4a8c75', { defaultValue: '变更原因必填！' }),
              )
            } else {
              this.updateSLA(item)
            }
          },
        },
      ],

      placeholder: i18nClient.t('components_detail_d6f324', { defaultValue: '该原因必填' }),
    })
  }

  updateSLA(item) {
    const { ticketDetail, handleTicketDetail } = this.context
    updateTicket(this.context.ticketDetail.id, {
      sla: item.value,
      slaChangeReason: this.slaChangeReason,
    })
      .then(resp => {
        if (resp?.code === 200) {
          // this.props.onUpdateSLA(resp.data)
          handleTicketDetail({ ...ticketDetail, sla: item.value })
          this.slaChangeReason = ''
          this.dialogInstance?.close()
        } else {
          Toast.open(
            resp?.data?.errorMsg ??
            i18nClient.t('components_detail_4447fc', { defaultValue: '更新SLA等级失败' }),
          )
        }
      })
      .catch(e => { })
    ttTrackDetailClick(TTKeys.DetailClick.slaLevel)
  }

  transferSLA() {
    let slaArr = []
    Object.values(Sla2CN).forEach((item, index) => {
      slaArr.push({ label: i18nClient.t(item), value: `S${index + 1}` })
    })
    return slaArr
  }

  getSlaDesc() {
    const { slaTime, ticketDetail } = this.context
    if (slaTime === null) {
      return ''
    }
    const { responseExpiration, resolveExpiration } = slaTime
    const { name } = ticketDetail.state
    console.log('formatDate(resolveExpiration)', formatDate(resolveExpiration));
    if (name === '已解决') {
      ticketDetail.state.displayName = i18nClient.t('components_detail_d7d257', { defaultValue: '已解决' })
    } else if (name === '已关闭') {
      ticketDetail.state.displayName = i18nClient.t('components_detail_9c5850', { defaultValue: '已关闭' })
    }
    console.log('ticketDetail.state', ticketDetail?.state);
    if (this.context.ticketOperate?.isWorkHour) {
      switch (name) {
        case '未处理':
          ticketDetail.state.displayName = i18nClient.t('components_detail_2839c8', { defaultValue: '未处理' })
          return i18nClient.getFormatText('components_detail_7a10b1', `请在${formatDateWithoutCentury(formatDate(resolveExpiration))}前响应`, {
            slot0: formatDateWithoutCentury(formatDate(resolveExpiration)),
          })
        case '处理中':
          ticketDetail.state.displayName = i18nClient.t('components_detail_5d459d', { defaultValue: '处理中' })
        case '暂停中':
          ticketDetail.state.displayName = i18nClient.t('components_detail_741acc', { defaultValue: '暂停中' })
        case '挂起中':
          ticketDetail.state.displayName = i18nClient.t('components_home_72aede', { defaultValue: '挂起中' })
        case '重新打开':
          ticketDetail.state.displayName = i18nClient.t('components_detail_72db77', { defaultValue: '重新打开' })
          return i18nClient.getFormatText('components_detail_45c832', `请在${formatDateWithoutCentury(formatDate(resolveExpiration))}前处理`, {
            slot0: formatDateWithoutCentury(formatDate(resolveExpiration))
          })
        default: // 已解决、已关闭
          return ''
      }
    } else {
      return i18nClient.t('components_detail_6bef85', {
        defaultValue: '当前为非工作时间，请您耐心等待',
      })
    }
  }
}

// const mapStateToProps = (state) => ({
//   timeZone: state.timeZone.timeZone,
// });

// export default connect(mapStateToProps)(SLAstate);