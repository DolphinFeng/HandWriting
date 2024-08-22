import { i18nClient } from '@sailor/i18n-mrn'
import { TouchableOpacity, View, Text, StyleSheet, Dimensions, Image } from '@mrn/react-native'
import React, { PureComponent } from 'react'
import right from '@images/tt-right.png'
import { dStyle, TTCreateStyle } from '../../constants/TTStyle'
import star from '@images/star-five.png'
import { noop } from '@ss/mtd-react-native/lib/common/utils/fns'

interface IProps {
  onPress?: () => void
  title?: string
  isCustom?: boolean
}

interface IState {}

class CreateAssignHeader extends PureComponent<IProps, IState> {
  render() {
    const t = this.props.title ?? i18nClient.t('components_create_27957f', { defaultValue: '指派' })
    const isCustom = this.props.isCustom
    return (
      <TouchableOpacity
        style={TTCreateStyle.header}
        onPress={isCustom ? noop : this.props.onPress?.bind(this)}
        activeOpacity={isCustom ? 1 : 0.2}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <Image style={{ width: 12, height: 12 }} source={star} />
          <Text style={dStyle.FontBold16}>{`${t}`}</Text>
        </View>
        {isCustom ? null : <Image source={right} style={[dStyle.image24, { opacity: 0.24 }]} />}
      </TouchableOpacity>
    )
  }
}

export default CreateAssignHeader
