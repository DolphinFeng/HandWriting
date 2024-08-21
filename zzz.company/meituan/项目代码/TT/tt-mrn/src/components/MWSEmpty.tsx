import { i18nClient } from '@sailor/i18n-mrn'
import React, { Component } from 'react'
import { Text, View, Image, Dimensions } from '@mrn/react-native'
import style from '@src/common/styles/MWSStyle'
import empty from '@images/empty.png'

interface IProps {
  emptyTxt?: string
}

const { width, height } = Dimensions.get('window')

export class MWSEmpty extends Component<IProps, any> {
  constructor(props: IProps) {
    super(props)
  }
  render() {
    return (
      <View
        style={{
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: height / 4,
        }}
      >
        <Image source={empty} style={style.emptyIcon} />
        <Text style={style.emptyContent}>
          {this.props.emptyTxt ??
            i18nClient.t('base_components_4726ff', { defaultValue: '暂无内容' })}
        </Text>
      </View>
    )
  }
}
