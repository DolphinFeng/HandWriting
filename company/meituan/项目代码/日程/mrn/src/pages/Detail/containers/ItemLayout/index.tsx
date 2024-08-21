import React from 'react'
import { View } from '@mrn/react-native'
import { Devider } from '@src/components/Devider'
import { IconFont } from '@src/components/IconFont'
import { styles } from './styles'

interface IItemLayoutProps {
  icon: string
  content: JSX.Element
  show?: boolean
  useDivider?: boolean
}

export const ItemLayout: React.FC<IItemLayoutProps> = ({
  icon,
  content,
  show = true,
  useDivider = true
}) => {
  if (show) {
    return (
      <View style={styles.container}>
        <View style={styles.iconBox}>
          {icon ? (
            <IconFont icon={icon} style={styles.icon} />
          ) : (
            <IconFont icon='dx-calremarks' style={[styles.icon, styles.iconLess]} />
          )}
        </View>
        <View style={styles.contentBox}>
          {useDivider && <Devider />}
          <View style={styles.mainContent}>{content}</View>
        </View>
      </View>
    )
  }

  return null
}
