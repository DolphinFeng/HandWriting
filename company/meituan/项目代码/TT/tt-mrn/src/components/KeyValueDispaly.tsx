/**
 * 提供key value容器
 * value 可以自定义
 */
import React, { Component } from 'react'
import { Text, View, ViewStyle, TouchableHighlight } from '@mrn/react-native'
import theme from '@common/styles/MWSStyle'
import { createTipComponet } from '@src/pages/tt/components/create/CreateHelper'

interface IProps {
  label: string
  isRequired?: boolean
  paddingTop?: number
  paddingBottom?: number
  isLast?: boolean //  适配多条 kv， 默认false
  minHeight?: number

  tip?: string
  onPress?: () => void
}

const displayStyle = {
  flexDirection: 'row',
  alignItems: 'flex-start',
  marginHorizontal: theme.spacing16
} as ViewStyle

const keyStyle = {
  width: theme.width76 + 2, // ios 上不能显示到4个中文
  marginRight: theme.spacing20 - 2,
  fontSize: theme.size14,
  lineHeight: theme.height20,
  color: theme.gray60
}

const requiredMarkStyle = {
  color: '#f5483b',
  fontSize: theme.size14,
  lineHeight: theme.height20
} as ViewStyle

export class KeyValueDisplay extends Component<IProps, any> {
  _isLast = false

  static defaultProps = {
    tip: ''
  }

  constructor(props: IProps) {
    super(props)
    this._isLast = this.props.isLast ?? this._isLast
  }
  render() {
    const { paddingBottom, paddingTop, minHeight } = this.props
    return (
      <TouchableHighlight
        activeOpacity={theme.activeOpacity}
        onPress={this.props.onPress}
      >
        <View
          style={{
            paddingTop: paddingTop ?? 12,
            paddingBottom: paddingBottom ?? this._isLast ? 12 : 0,
            minHeight: minHeight ?? null,
            backgroundColor: theme.white
          }}
        >
          <View style={[displayStyle, {}]}>
            {Boolean(this.props.isRequired) && (
              <Text style={requiredMarkStyle}>* </Text>
            )}
            <Text style={keyStyle}>{this.props.label}</Text>
            {this.props.children}
          </View>
          {createTipComponet(this.props.tip, 16)}
        </View>
      </TouchableHighlight>
    )
  }
}
