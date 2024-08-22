import React, { Component } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle
} from '@mrn/react-native'

interface IProps {
  defaultBgStyle: StyleProp<ViewStyle>
  defaultTextStyle: StyleProp<ViewStyle>
  selectedBgStyle: StyleProp<ViewStyle>
  selectedTextStyle: StyleProp<ViewStyle>

  selected: boolean
  index: number
  onPress?: (index: number) => void

  label: string
}

interface IState {}

class SelectItem extends Component<IProps> {
  constructor(props) {
    super(props)
  }

  componentDidMount() {}

  render() {
    return this.renderDefault()
  }

  renderDefault() {
    const {
      selected,
      onPress,
      defaultBgStyle,
      defaultTextStyle,
      selectedBgStyle,
      selectedTextStyle,
      label
    } = this.props

    const bgStyle = selected ? selectedBgStyle : defaultBgStyle
    const textStyle = selected ? selectedTextStyle : defaultTextStyle

    return (
      <TouchableOpacity
        style={bgStyle}
        key={this.props.index}
        // disabled={disabled}
        // activeOpacity={0.3}
        // underlayColor="transparent"
        activeOpacity={1} // 关闭blink
        onPress={() => onPress && onPress(this.props.index)}
      >
        <Text style={textStyle}>{label}</Text>
      </TouchableOpacity>
    )
  }

  renderSelectd() {}
}

export default SelectItem
