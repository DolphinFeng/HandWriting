import React, { Component } from 'react'
import { View, Text, TouchableOpacity, Image } from '@mrn/react-native'
import { TTCreateStyle } from '../../constants/TTStyle'
import {
  CustomCreateModel,
  CustomFieldModel,
  CustomFieldSystemType
} from '../../constants/TTServiceModule'

export const createTipComponet = (
  tip: string,
  marginLeft?: number,
  marginBottom?: number
) => {
  return tip.length > 0 ? (
    <Text
      style={[
        TTCreateStyle.tip,
        { marginLeft: marginLeft ?? 0, marginBottom: marginBottom ?? 0 }
      ]}
    >
      {`${tip}`}
    </Text>
  ) : null
}

export const handleTip = (needHide: boolean, item: CustomFieldModel) => {
  if (needHide === false && item?.instruction?.length > 0) {
    return item.instruction
  }

  return ''
}

export const handleDefaultValue = (
  needHide: boolean,
  item: CustomFieldModel
) => {
  // 不管是否隐藏，都返回默认值
  if (item?.defaultValue?.length > 0) {
    return item.defaultValue
  }

  return ''
}

export const handleId = (needHide: boolean, item: CustomFieldModel) => {
  if (needHide === false && item?.id && item?.id > 0) {
    return item.id
  }

  return 0
}

export const handleFindItem = (
  list: CustomFieldModel[],
  filterType: CustomFieldSystemType
) => {
  return list?.find(item => item.identify === filterType)
}

export const getFieldMeta = (
  isCustom: boolean,
  list: CustomFieldModel[],
  filterType: CustomFieldSystemType
) => {
  let needHide = false
  let tip = ''
  let defaultValue = ''
  let id = 0
  let isRequired = false

  if (isCustom === true) {
    const item = handleFindItem(list, filterType)
    if (item === undefined || item?.isHidden) {
      needHide = true
    }

    tip = handleTip(needHide, item)
    defaultValue = handleDefaultValue(needHide, item)
    id = handleId(needHide, item)
    isRequired = item?.isRequired
  }

  return { needHide, tip, defaultValue, id, isRequired }
}
