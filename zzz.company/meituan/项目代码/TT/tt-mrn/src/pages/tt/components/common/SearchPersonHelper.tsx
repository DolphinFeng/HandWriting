import { TouchableOpacity, View, Text, StyleSheet } from '@mrn/react-native'
import React, { Component } from 'react'
import theme from '@src/common/styles/MWSStyle'

const color1 = theme.gray87
const color2 = theme.yellow800

export function renderSearchResultName(name: string, keyword: string) {
  const list = splitStringFromKeyword(name, keyword)

  const p1 = (
    <Text
      style={[PersonHelperStyle.name, { color: color1 }]}
    >{`${list[0]}`}</Text>
  )

  const p2 = (
    <Text
      style={[PersonHelperStyle.name, { color: color2 }]}
    >{`${list[1]}`}</Text>
  )

  const p3 = (
    <Text
      style={[PersonHelperStyle.name, { color: color1 }]}
    >{`${list[2]}`}</Text>
  )

  return (
    <View style={{ flexDirection: 'row', marginLeft: 12 }}>
      {p1}
      {p2}
      {p3}
    </View>
  )
}

export const splitStringFromKeyword = (str: string, keyword: string) => {
  const firstIndex = str.indexOf(keyword)

  const s1 = str.substring(0, firstIndex)
  const s2 = keyword
  const s3 = str.substring(firstIndex + keyword.length, str.length)

  return [s1, s2, s3]
}

const PersonHelperStyle = StyleSheet.create({
  name: {
    fontSize: theme.size17,
    lineHeight: theme.height24,
    color: theme.gray87
  }
})
