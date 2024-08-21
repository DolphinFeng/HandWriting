import React, { Component } from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from '@mrn/react-native'

export const renderInsetSeprator = (
  insetLeft?: number,
  insetRight?: number,
  backgroundColor?: string,
  insetTop?: number,
  height?: number
) => {
  const style = {
    backgroundColor: backgroundColor ?? 'rgba(0,0,0,0.07)',
    // height: StyleSheet.hairlineWidth,
    height: height ?? 1,
    marginBottom: 0,
    marginLeft: insetLeft,
    marginRight: insetRight,
    marginTop: insetTop
  }

  return <View style={style} />
}

export const renderFullSeprator = () => {
  return renderInsetSeprator()
}

export const renderTTCustomSeprator = () => {
  return renderInsetSeprator(null, -16, null, 12)
}
