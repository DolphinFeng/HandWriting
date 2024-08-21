import React, { Component } from 'react'
import {
  Text,
  View,
  TouchableOpacity,
  GestureResponderEvent
} from '@mrn/react-native'
import { MWSStyle } from '../common/styles/MWSCommonStyle'

interface IProps {
  onPress?: (event: GestureResponderEvent) => void
  btnText?: string
  txtStyle?: any
  wrapperStyles?: any
  child?: JSX.Element
}

export const defaultBtnWrapperStyle = {
  width: 68,
  height: 24,
  borderRadius: 4,
  borderWidth: 1,
  borderColor: '#005ADE',
  justifyContent: 'center',
  alignItems: 'center'
}
export const defaultTxtStyle = MWSStyle.font12BlueRegular

export class MWSButton extends Component<IProps, any> {
  constructor(props: IProps) {
    super(props)
  }
  render() {
    const { wrapperStyles } = this.props
    return (
      <TouchableOpacity
        style={wrapperStyles ? wrapperStyles : defaultBtnWrapperStyle}
        onPress={e => this.props.onPress && this.props.onPress(e)}
      >
        {this.renderChild()}
      </TouchableOpacity>
    )
  }

  renderChild = () => {
    const { child, btnText, txtStyle } = this.props

    if (child != null) return child

    return (
      <Text style={txtStyle ? txtStyle : defaultTxtStyle}>{btnText ?? ''}</Text>
    )
  }
}
