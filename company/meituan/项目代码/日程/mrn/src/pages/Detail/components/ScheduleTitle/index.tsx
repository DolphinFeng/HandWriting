import * as React from 'react'
import { Text, View } from '@mrn/react-native'
import { EApplicationsType } from '@src/common/enums'
import { Tag } from '@src/components/Tag'
import { styles } from './styles'

export interface IScheduleTitleProps {
  title: string
  appKey: string
}

const getTypeName = (type: string) => {
  switch (type) {
    case EApplicationsType.Exchange:
      return {
        name: '邮箱'
      }
    case EApplicationsType.IPU:
      return {
        name: '互联网+大学'
      }
    case EApplicationsType.Promotionapi:
      return {
        name: '晋升系统'
      }
    case EApplicationsType.Meeting:
    case EApplicationsType.Schedule:
      return {
        name: '日程' // 合并为日程
      }

    default:
      return {
        name: '日程'
      }
  }
}

export const ScheduleTitle = (props: IScheduleTitleProps) => {
  const { title, appKey } = props
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Tag text={getTypeName(appKey)?.name} />
    </View>
  )
}
