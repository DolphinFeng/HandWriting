import React from 'react'
import { ActionSheet } from '@ss/mtd-react-native'
import { View, Text } from '@mrn/react-native'
import { debug, noop } from '@onejs/mrn-utils'
import { styles } from './styles'

enum ECancleType {
  Cancle = 'cancle',
  CancelAll = 'cancleAll'
}

interface ICancleScheduleProps {
  isCyclic: boolean
  onCancle(): void
  onCancleAll(): void
}

export const CancleSchedule: React.FC<ICancleScheduleProps> = props => {
  // 取消日程 普通日程 ｜ 会议 ｜ 循环x2
  // 普通日程
  const handleCancleSchedule = () => {
    ActionSheet.open({
      title: '确定要取消该日程吗？',
      footer: (
        <View style={[styles.cancleItem, styles.itemFooter]}>
          <Text style={styles.itemText}>暂不取消</Text>
        </View>
      ),
      options: [
        {
          label: '取消日程',
          value: ECancleType.Cancle
        }
      ],
      modalProps: {
        maskOpacity: 0.4
      },
      renderItem: item => {
        const { label } = item

        return (
          <View style={styles.item} key={label}>
            <Text style={[styles.itemText, styles.highlight]}>{label}</Text>
          </View>
        )
      },
      confirmCallback: () => {
        const { onCancle = noop } = props
        onCancle()
      }
    })
  }

  const handleCancleCyclicSchedule = () => {
    ActionSheet.open({
      title: '该日程为循环日程',
      footer: (
        <View style={[styles.cancleItem, styles.itemFooter]}>
          <Text style={styles.itemText}>暂不取消</Text>
        </View>
      ),
      options: [
        {
          label: '仅取消该日程',
          value: ECancleType.Cancle
        },
        {
          label: '取消所有日程',
          value: ECancleType.CancelAll
        }
      ],
      modalProps: {
        maskOpacity: 0.4
      },
      renderItem: item => {
        const { label } = item

        return (
          <View style={styles.item} key={label}>
            <Text style={[styles.itemText, styles.highlight]}>{label}</Text>
          </View>
        )
      },
      confirmCallback: item => {
        debug('取消日程', item)
        const { value } = item as any
        const { onCancle = noop, onCancleAll = noop } = props
        if (value === ECancleType.Cancle) {
          onCancle()
        } else if (value === ECancleType.CancelAll) {
          onCancleAll()
        }
      }
    })
  }

  const handlePress = () => {
    const { isCyclic } = props
    if (isCyclic) {
      handleCancleCyclicSchedule()
    } else {
      handleCancleSchedule()
    }
  }

  return (
    <Text style={styles.btn} onPress={handlePress}>
      取消日程
    </Text>
  )
}
