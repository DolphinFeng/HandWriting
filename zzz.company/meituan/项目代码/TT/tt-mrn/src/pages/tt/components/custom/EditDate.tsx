import { i18nClient } from '@sailor/i18n-mrn'
import { datePickerDefaultProps } from '@ss/mtd-react-native'
// 自定义日期

import React, { Component } from 'react'
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  TextInput,
  Keyboard,
} from '@mrn/react-native'
import { dStyle } from '../../constants/TTStyle'
import { TopViewManager, Toast, SlideModal, Button, Datepicker } from '@ss/mtd-react-native'
import { modalMarginTop, ttSlideModalProp } from '../common/TTHelper'
import close from '@images/close.png'

interface EditDateProps {
  initDate: Date
  title: string
  onCancel: () => void
  handleConfirmClick: (txt) => void
}

interface IState {
  currentDate: Date
}
const { width, height } = Dimensions.get('screen')
export class EditDate extends Component<EditDateProps, IState> {
  datePickerRef: Datepicker = null
  constructor(props: EditDateProps) {
    super(props)
    this.state = {
      currentDate: this.props.initDate,
    }
  }

  render() {
    let h = modalMarginTop
    return (
      <View style={{ height: 400 }}>
        {this.renderHeader()}
        <View style={dStyle.ticketDivider1} />
        {this.renderBody()}
      </View>
    )
  }

  renderHeader() {
    const color = '#FF8800'
    return (
      <View style={dStyle.satisfyWrapper}>
        <TouchableOpacity style={dStyle.cancel} onPress={() => this.props.onCancel()}>
          <Text style={dStyle.FontRegul16}>
            {i18nClient.t('components_custom_625fb2', { defaultValue: '取消' })}
          </Text>
        </TouchableOpacity>
        <Text style={dStyle.FontBold16}>
          {i18nClient.getFormatText('components_custom_7062fe',`选择${this.props.title ?? '时间'}`, {
            slot0: this.props.title ?? '时间'
          })}
        </Text>
        <TouchableOpacity
          style={{ right: 0, position: 'absolute' }}
          onPress={() => {
            console.log(this.datePickerRef.getSelectedDate())
            this.props.handleConfirmClick(this.datePickerRef.getSelectedDate())
          }}
        >
          <Text style={[dStyle.finishTxt, { color: color }]}>
            {i18nClient.t('components_custom_38cf16', { defaultValue: '确定' })}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  renderBody() {
    return (
      <Datepicker
        ref={_c => {
          this.datePickerRef = _c
        }}
        mode="datetime"
        formatMonth={this.getMonth}
        formatDay={this.getDays}
        locale={this.getDatePickerLocale()}
        proportion={[1, 1, 1, 1, 1]}
        date={this.props.initDate ?? new Date()}
      />
    )
  }

  getDays = (day: number) => {
    if ([1, 2, 3, 21, 22, 23, 31].indexOf(day) >= 0) {
      return i18nClient.t(`tt_mrn_calendar_app_day${day}`, `${day}日`)
    }
    return i18nClient.getFormatText('tt_mrn_calendar_app_days_format', `${day}日`, { day })
  }

  getDatePickerLocale() {
    return {
      ...datePickerDefaultProps.locale,
      year: '',
      hour: '',
      minute: ''
    }
  }

  getMonth(month: number) {
    const monthsCache = [
      i18nClient.t('tt_mrn_calendar_app_month_1th', '1月'),
      i18nClient.t('tt_mrn_calendar_app_month_2th', '2月'),
      i18nClient.t('tt_mrn_calendar_app_month_3th', '3月'),
      i18nClient.t('tt_mrn_calendar_app_month_4th', '4月'),
      i18nClient.t('tt_mrn_calendar_app_month_5th', '5月'),
      i18nClient.t('tt_mrn_calendar_app_month_6th', '6月'),
      i18nClient.t('tt_mrn_calendar_app_month_7th', '7月'),
      i18nClient.t('tt_mrn_calendar_app_month_8th', '8月'),
      i18nClient.t('tt_mrn_calendar_app_month_9th', '9月'),
      i18nClient.t('tt_mrn_calendar_app_month_10th', '10月'),
      i18nClient.t('tt_mrn_calendar_app_month_11th', '11月'),
      i18nClient.t('tt_mrn_calendar_app_month_12th', '12月')
    ]
    return monthsCache[month]
  }

}

// 外部直接调用这个方法
export const openDateEditorModal = (props: EditDateProps) => {
  return SlideModal.open({
    useNativeDriver: true,
    visible: true,
    duration: 100,
    modalProps: {
      maskClosable: true,
      onPressClose: props.onCancel, // 用户点击半透明 mask
      keyboardBehavior: null, // modal 默认开启 keyboardavoding, 这里先关闭，只对 ios 起作用
      containerStyles: {
        // 默认有个白色的底色
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
      },
    },
    children: <EditDate {...props} />,
  })
}
