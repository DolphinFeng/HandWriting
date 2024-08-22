/**
 * 自定义单选
 * 自定义多选
 */

import React, { Component } from 'react'
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  TextInput,
  Keyboard
} from '@mrn/react-native'
import { dStyle } from '../../constants/TTStyle'
import {
  TopViewManager,
  Toast,
  SlideModal,
  ActionSheet
} from '@ss/mtd-react-native'
import { BottomCancelBtn } from '@src/components/BottomCancelBtn'

interface SingleSelectProps {
  options: Array<{ label: string; value: number }>
  onCancel: () => void
  onFinish: (option) => void
}
// 自定义单选，外部直接调用这个方法
export const openSingleSelectModal = (props: SingleSelectProps) => {
  const instance = ActionSheet.open({
    options: props.options,
    maxShowNum: 10, //最多显示10个，超出部分滚动
    modalProps: {
      maskClosable: true,
      containerStyles: {
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10
      },
      onClose: data => props.onCancel
    },
    footer: <BottomCancelBtn handlePress={() => instance.close()} />,
    confirmCallback: item => {
      props.onFinish(item)
    },
    cancelCallback: () => { }
  })
  return instance
}
