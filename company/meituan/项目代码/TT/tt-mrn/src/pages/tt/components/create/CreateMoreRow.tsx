import { i18nClient } from '@sailor/i18n-mrn'
import { TouchableOpacity, View, Text, StyleSheet, Dimensions, Image } from '@mrn/react-native'
import React, { PureComponent } from 'react'
import up from '@images/tt-up.png'
import down from '@images/tt-down.png'

import { dStyle, TTCreateStyle } from '../../constants/TTStyle'

interface IProps {
  showList: boolean
  onPress?: (show: boolean) => void
}

interface IState {
  showList: boolean
}

class CreateMoreRow extends PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props)

    this.state = {
      showList: this.props.showList,
    }
  }

  render() {
    const img = this.state.showList ? up : down
    return (
      <TouchableOpacity style={TTCreateStyle.header} onPress={() => this.handleClick()}>
        <Text style={dStyle.FontBold16}>
          {i18nClient.t('components_create_0ec9ea', { defaultValue: '更多' })}
        </Text>
        <Image source={img} style={[dStyle.image24, { opacity: 0.24 }]} />
      </TouchableOpacity>
    )
  }

  handleClick() {
    const newShow = !this.state.showList
    this.setState({ showList: newShow })
    this.props.onPress && this.props.onPress(newShow)
  }
}

export default CreateMoreRow
