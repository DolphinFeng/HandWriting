import React from 'react'
import { ActionSheet } from '@ss/mtd-react-native'
import { noop } from '@onejs/mrn-utils'
import { View, Text } from '@mrn/react-native'
import { styles } from './styles'

enum ECancleType {
  Cancle = 'cancle',
  CancelAll = 'cancleAll'
}

interface ICancleAttendScheduleProps {
  isCyclic: boolean
  onCancle(): void
  onCancleAll(): void
}

export const CancleAttendSchedule: React.FC<ICancleAttendScheduleProps> = props => {
  // 普通日程

  const handleCancleAttendSchedule = () => {
    ActionSheet.open({
      title: '确定要取消参与该日程吗？',
      footer: (
        <View style={[styles.cancleItem, styles.itemFooter]}>
          <Text style={styles.itemText}>取消</Text>
        </View>
      ),
      options: [
        {
          label: '确定',
          value: 'cancle'
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

  const handleCancleAttendCyclicSchedule = () => {
    ActionSheet.open({
      title: '该日程为循环日程',
      footer: (
        <View style={[styles.cancleItem, styles.itemFooter]}>
          <Text style={styles.itemText}>取消</Text>
        </View>
      ),
      options: [
        {
          label: '仅取消参与该日程',
          value: ECancleType.Cancle
        },
        {
          label: '取消参与所有日程',
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
      handleCancleAttendCyclicSchedule()
    } else {
      handleCancleAttendSchedule()
    }
  }

  return (
    <Text style={styles.btn} onPress={handlePress}>
      取消参与
    </Text>
  )
}
