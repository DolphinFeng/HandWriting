import { i18nClient } from '@sailor/i18n-mrn'
/**
 * SLA 状态变化
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
} from '@mrn/react-native'
import { dStyle } from '../../../constants/TTStyle'
import { TopViewManager, Toast, SlideModal } from '@ss/mtd-react-native'
import { ttSlideModalProp } from '../../common/TTHelper'
import SafeModalContainer from '@src/components/SafeModalContainer'

interface TitleEditProps {
  ticketId?: number
  title: string
  onCancel: () => void
  onFinish: (title) => void
}

interface IState {
  currentTitle: string
}
export class EditTitle extends Component<TitleEditProps, IState> {
  constructor(props: TitleEditProps) {
    super(props)
    this.state = {
      currentTitle: this.props.title,
    }
  }

  render() {
    return (
      <SafeModalContainer>
        {this.renderHeader()}
        <View style={dStyle.ticketDivider1} />
        {this.renderBody()}
      </SafeModalContainer>
    )
  }

  renderHeader() {
    const color = '#FF8800'
    return (
      <View style={dStyle.satisfyWrapper}>
        <TouchableOpacity style={dStyle.cancel} onPress={() => this.props.onCancel()}>
          <Text style={dStyle.FontRegul16}>
            {i18nClient.t('components_detail_edit_625fb2', { defaultValue: '取消' })}
          </Text>
        </TouchableOpacity>
        <Text style={dStyle.FontBold16}>
          {i18nClient.t('components_detail_edit_fd3400', { defaultValue: '编辑标题' })}
        </Text>
        <TouchableOpacity
          style={{ right: 0, position: 'absolute' }}
          onPress={() => this.props.onFinish(this.state.currentTitle)}
        >
          <Text style={[dStyle.finishTxt, { color: color }]}>
            {i18nClient.t('components_detail_edit_38cf16', { defaultValue: '确定' })}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  renderBody() {
    return (
      <View style={{ paddingHorizontal: 16, flex: 1 }}>
        <TextInput
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: 'rgba(0,0,0,0.84)',
            marginTop: 20,
          }}
          multiline={true}
          value={this.state.currentTitle}
          autoFocus={true}
          onChangeText={txt => this.setState({ currentTitle: txt })}
        />
      </View>
    )
  }

  handleFinish() {}
}

// 外部直接调用这个方法
export const openTitleEditorModal = (props: TitleEditProps) => {
  return SlideModal.open({
    useNativeDriver: true,
    visible: true,
    duration: 100,
    modalProps: ttSlideModalProp(props.onCancel),
    children: <EditTitle {...props} />,
  })
}
