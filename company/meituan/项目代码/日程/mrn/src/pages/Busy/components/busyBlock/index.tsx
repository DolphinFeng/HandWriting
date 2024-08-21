import React from 'react'
import { View } from '@mrn/react-native'
import busyStyleConst from '@src/common/styles/busy'
import styles from './style'

interface IPropsType {
  startQuota: number
  endQuota: number
  isBusy: boolean
}

const BusyBlock: React.FunctionComponent<IPropsType> = (props: IPropsType): JSX.Element => {
  const { startQuota, endQuota, isBusy } = props
  const top =
    busyStyleConst.hearderHeight +
    busyStyleConst.topStart +
    startQuota * busyStyleConst.oneQuotaHeight
  let height = busyStyleConst.oneHourHeight / 2
  let isEnd = false
  if (endQuota > startQuota) {
    height = (endQuota - startQuota) * busyStyleConst.oneQuotaHeight - 1
    isEnd = true
  }

  return (
    <View
      pointerEvents='none'
      style={[
        styles.busyBlockItem,
        !isEnd ? styles.noBorderBottom : {},
        isBusy ? styles.conflict : styles.unConfilict,
        { top, height }
      ]}
    />
  )
}

export default BusyBlock
