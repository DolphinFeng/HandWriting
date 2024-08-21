import React, { Component } from 'react'
import { Text, TouchableOpacity, Dimensions } from '@mrn/react-native'
import { i18nClient } from '@sailor/i18n-mrn'

export const BottomCancelBtn = (props) => {
  const { handlePress } = props
  const style = {
    height: 60,
    // lineHeight: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginTop: 10
  }

  return (
    <TouchableOpacity style={style} onPress={handlePress}>
      <Text style={{fontSize: 16}}>{i18nClient.t('base_components_625fb2', { defaultValue: '取消' })}</Text>
    </TouchableOpacity>
  )
}
