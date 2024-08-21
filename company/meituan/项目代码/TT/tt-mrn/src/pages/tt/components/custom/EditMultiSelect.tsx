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
  ScrollView,
} from '@mrn/react-native'
import { dStyle } from '../../constants/TTStyle'
import { TopViewManager, Toast, SlideModal, Checkbox } from '@ss/mtd-react-native'
import check from '@images/ttCheck.png'

interface MultiSelectProps {
  title: string
  options: Array<{ label: string; value: number }>
  selectedOptionIndex: Array<string>
  onCancel: () => void
  handleConfirmClick: (values: Array<string>) => void
  // handleOptionChanged: (value) => void
}

interface IState {
  tempSelectedIndex: number[]
}
const { width, height } = Dimensions.get('screen')
export class EditMultiSelect extends Component<MultiSelectProps, IState> {
  constructor(props: MultiSelectProps) {
    super(props)
    this.state = {
      tempSelectedIndex: [],
    }
  }

  render() {
    return (
      <View>
        {this.renderHeader()}
        <View style={dStyle.ticketDivider1} />
        {this.renderBody()}
      </View>
    )
  }

  renderHeader() {
    return (
      <View style={dStyle.satisfyWrapper}>
        <TouchableOpacity style={dStyle.cancel} onPress={() => this.props.onCancel()}>
          <Text style={dStyle.FontRegul16}>
            {i18nClient.t('components_custom_625fb2', { defaultValue: '取消' })}
          </Text>
        </TouchableOpacity>
        <Text style={dStyle.FontBold16}>
          {i18nClient.getFormatText('components_custom_7062fe', `选择${this.props.title ?? ''}`, {
            slot0: this.props.title ?? ''
          })}
        </Text>
        <TouchableOpacity
          style={{ right: 0, position: 'absolute' }}
          onPress={() => {
            const selected = this.props.options
              .filter(item => this.state.tempSelectedIndex.includes(item.value))
              .map(item => item.label)
            this.props.handleConfirmClick(selected)
          }}
        >
          <Text style={[dStyle.finishTxt, { color: '#FF8800' }]}>
            {i18nClient.t('components_custom_38cf16', { defaultValue: '确定' })}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  renderBody() {
    return (
      <View style={{ maxHeight: (height * 3) / 4 }}>
        <ScrollView overScrollMode="never" style={{ paddingLeft: 16, paddingVertical: 20 }}>
          <Checkbox
            iconPosition="right"
            checkedValues={this.props.selectedOptionIndex}
            onChange={(indexList: any) => {
              console.log('check value ' + JSON.stringify(indexList))
              this.setState({ tempSelectedIndex: indexList })
            }}
          >
            {this.props.options.map((item, index) => {
              return (
                <Checkbox.Item
                  label={item.label}
                  trueValue={item.value}
                  hasLine
                  key={index}
                  renderIcon={(checked, disabled) => this.renderCheckIcon(checked)}
                />
              )
            })}
          </Checkbox>
        </ScrollView>
      </View>
    )
  }

  renderCheckIcon(checked: boolean) {
    const w = 20
    return checked ? (
      <View
        style={{
          width: w,
          height: w,
          borderRadius: w / 2,
          backgroundColor: '#FFC300',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image source={check} />
      </View>
    ) : (
      <View
        style={{
          width: w,
          height: w,
          borderColor: 'rgba(0, 0, 0, 0.24)',
          borderWidth: 1,
          borderRadius: w / 2,
        }}
      />
    )
  }
}

// 外部直接调用这个方法
export const openMultiSelectModal = (props: MultiSelectProps) => {
  return SlideModal.open({
    useNativeDriver: true,
    visible: true,
    duration: 100,
    // modalProps: ttSlideModalProp(props.onCancel),
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
    children: <EditMultiSelect {...props} />,
  })
}
