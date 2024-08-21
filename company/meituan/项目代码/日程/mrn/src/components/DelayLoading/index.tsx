import React, { useState } from 'react'
import { ActivityIndicator } from '@mrn/react-native'
import { Loading } from '@ss/mtd-react-native'

export interface IDelayLoadingProps {
  visible: boolean
  delay: number // 毫秒
}

export const DelayLoading: React.FC<IDelayLoadingProps> = ({ visible, delay }) => {
  const [delayVisible, setDelayVisible] = useState(false)
  setTimeout(() => {
    setDelayVisible(true)
  }, delay)

  if (!visible) {
    return null
  }

  return (
    <Loading visible={visible && delayVisible}>
      <ActivityIndicator color='white' size='small' />
    </Loading>
  )
}
