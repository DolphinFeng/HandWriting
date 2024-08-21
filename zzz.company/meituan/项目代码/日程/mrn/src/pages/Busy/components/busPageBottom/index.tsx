import React from 'react'
import { observer } from 'mobx-react'
import { Text, View } from '@mrn/react-native'
import { device } from '@onejs/mrn-utils'
// import { SafeAreaView } from '@mrn/react-navigation' 安卓穿透
import { TimeUtils } from '@src/utils/time'
import { CommonTextStyles } from '@src/common/styles'
import { Clickable } from '@src/components/Clickable'
import { IConflictUser } from '../../stores'

import styles from './style'

export interface IBusyPageBottom {
  startTime: number
  endTime: number
  conflictList?: IConflictUser[]
  submit?: () => void
  isGroup?: boolean
}

@observer
export class BusyPageBottom extends React.Component<IBusyPageBottom> {
  public render() {
    const { isGroup } = this.props
    const btnBuff = isGroup ? '创建日程' : '确定'

    return <>{this.renderGroup(btnBuff)}</>
  }

  private renderGroup = buf => {
    const { startTime, endTime, conflictList, submit } = this.props
    const { hasLiuhai } = device
    const paddingBottom: number = hasLiuhai ? 34 + 12 : 12
    const paddingTop = 12
    const height = hasLiuhai ? 64 + 34 : 64
    if (startTime < 0) {
      return (
        <View style={[styles.bottomContanier, { paddingBottom, height, paddingTop }]}>
          <Clickable style={styles.longPageBtn} onPress={submit}>
            <Text style={CommonTextStyles.btnPrimaryText}>{buf}</Text>
          </Clickable>
        </View>
      )
    }
    let timeBuf: string = TimeUtils.format(startTime, 'MM月dd日 周E HH:mm-')
    let endBuf = endTime > 0 ? TimeUtils.format(endTime, 'HH:mm') : ''
    // 结束时间24点兼容
    endBuf = endBuf === '00:00' ? '24:00' : endBuf
    timeBuf += endBuf
    let conflictBuf = ''
    if (conflictList && conflictList.length > 0) {
      conflictBuf = conflictList
        .slice(0, 2)
        .map(item => item.name)
        .join(',')
      conflictList.length > 2 && (conflictBuf += `等${conflictList.length}人`)
      conflictBuf += '日程冲突'
    }
    return (
      <View style={[styles.bottomContanier, { paddingBottom, height, paddingTop }]}>
        <View>
          <Text style={CommonTextStyles.boldText}>{timeBuf}</Text>
          {!!conflictBuf && (
            <Text style={[styles.conflictText, CommonTextStyles.remindText]}>{conflictBuf}</Text>
          )}
        </View>
        <Clickable style={styles.shortBtn} onPress={submit}>
          <Text style={CommonTextStyles.btnPrimaryText}>{buf}</Text>
        </Clickable>
      </View>
    )
  }
}
