import React, { Component } from 'react'
import { View, Text, TouchableOpacity, Image } from '@mrn/react-native'
import { KeyValueDisplay } from '@src/components/KeyValueDispaly'
import right from '@images/tt-right.png'
import { dStyle, TTCreateStyle } from '../../constants/TTStyle'

interface IProps {
  label?: string
  value?: string
  onPress?: () => void
  renderValue?: () => JSX.Element
  showArrow?: boolean
  enablePress?: boolean

  paddingTop?: number
  paddingBottom?: number

  tip?: string
  isRequired?: boolean
}

class CreateKeyValueRow extends Component<IProps> {
  static defaultProps = {
    showArrow: true,
    enablePress: true,
    tip: ''
  }

  constructor(props) {
    super(props)
  }

  componentDidMount() { }

  render() {
    const { label } = this.props

    let onPressFunc = null
    if (this.props.enablePress) {
      onPressFunc = this.props.onPress?.bind(this)
    }

    return (
      <View>
        <KeyValueDisplay
          label={label}
          minHeight={48}
          isLast={true}
          paddingBottom={this.props.paddingBottom}
          paddingTop={this.props.paddingTop}
          tip={this.props.tip}
          onPress={onPressFunc}
          isRequired={this.props.isRequired}
        >
          {this.renderAction()}
        </KeyValueDisplay>
      </View>
    )
  }

  renderAction = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flex: 1
        }}
      >
        {this.renderValue()}
        {this.props.showArrow ? (
          <Image source={right} style={[dStyle.image24, { opacity: 0.24 }]} />
        ) : null}
      </View>
    )
  }

  renderValue = () => {
    const { value, renderValue } = this.props

    if (renderValue != null) return renderValue()

    return <Text style={TTCreateStyle.valueStyle}>{value ?? ''}</Text>
  }
}

export default CreateKeyValueRow
