import React from 'react'
import { View, Text } from '@mrn/react-native'
import styles from './style'

export enum EMaskType {
  MaxCount,
  LoadingError,
  Loading,
  None
}

interface IBlockItem {
  maskType: EMaskType
}

export const MaskItem = (props: IBlockItem) => {
  const { maskType } = props
  if (maskType === EMaskType.None) return null
  return (
    <View style={styles.mask}>
      {maskType === EMaskType.MaxCount && (
        <>
          <Text style={styles.errorText}>仅支持 50 人以内日程忙闲预览</Text>
          <Text style={styles.errorText}>建议您优先关注关键成员</Text>
        </>
      )}
      {maskType === EMaskType.Loading && (
        <>
          <Text style={styles.errorText}>加载中...</Text>
        </>
      )}
      {maskType === EMaskType.LoadingError && (
        <Text style={styles.errorText}>加载失败，请关闭应用重试</Text>
      )}
    </View>
  )
}
