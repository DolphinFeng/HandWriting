import { i18nClient } from '@sailor/i18n-mrn'
/**
 * 自定义单行文本
 * 自定义多行文本
 */

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
  StyleSheet,
} from '@mrn/react-native'
import { dStyle } from '../../constants/TTStyle'
import { TopViewManager, Toast, SlideModal } from '@ss/mtd-react-native'
import { modalMarginTop, ttSlideModalProp } from '../common/TTHelper'
import theme from '@src/common/styles/MWSStyle'
import { renderInsetSeprator } from '@src/components/BaseComponents'

interface TextEditProps {
  title: string
  initTxt: string
  tip: string
  multiple?: boolean // 默认单行
  onCancel: () => void
  onFinish: (txt) => void
}

interface IState {
  currentTxt: string
}
const { width, height } = Dimensions.get('screen')
export class EditText extends Component<TextEditProps, IState> {
  constructor(props: TextEditProps) {
    super(props)
    this.state = {
      currentTxt: this.props.initTxt,
    }
  }

  render() {
    let h = modalMarginTop
    return (
      <View style={{ height: height - h }}>
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
          {i18nClient.getFormatText('components_custom_cbc88b', `编辑${this.props.title}`, {
            slot0: this.props.title
          })}
        </Text>
        <TouchableOpacity
          style={{ right: 0, position: 'absolute' }}
          onPress={() => this.props.onFinish(this.state.currentTxt)}
        >
          <Text style={[dStyle.finishTxt, { color: color }]}>
            {i18nClient.t('components_custom_38cf16', { defaultValue: '确定' })}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  renderBody() {
    const tip = this.props.tip
    return (
      <View style={{ flex: 1 }}>
        <TextInput
          style={[styles.descNormal, { marginVertical: 16, marginHorizontal: 16 }]}
          placeholder={i18nClient.t('components_custom_a11cc7', { defaultValue: '请输入内容' })}
          multiline={this.props.multiple ?? false}
          value={this.state.currentTxt}
          autoFocus={true}
          onChangeText={txt => this.setState({ currentTxt: txt })}
        />

        {renderInsetSeprator(16, 0, '#F2F2F2')}
        {tip?.length > 0 ? (
          <Text style={[styles.tip, { marginTop: 2, marginHorizontal: 16 }]}>{`${tip}`}</Text>
        ) : null}
      </View>
    )
  }
}

// 外部直接调用这个方法
export const openTextEditorModal = (props: TextEditProps) => {
  return SlideModal.open({
    useNativeDriver: true,
    visible: true,
    duration: 100,
    modalProps: ttSlideModalProp(props.onCancel),
    children: <EditText {...props} />,
  })
}

const styles = StyleSheet.create({
  // title: {
  //   color: theme.gray60,
  //   fontSize: theme.size14,
  //   lineHeight: theme.height22,
  // },
  // descPlaceholder: {
  //   color: theme.gray36,
  //   fontSize: theme.size16,
  //   lineHeight: theme.height22,
  // },
  descNormal: {
    color: theme.gray84,
    fontSize: theme.size16,
    lineHeight: theme.height22,
  },
  tip: {
    color: theme.gray38,
    fontSize: theme.size12,
    lineHeight: theme.height20,
  },
})
