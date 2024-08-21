/* eslint-disable react/no-children-prop */
import React from 'react'
import { View } from '@mrn/react-native'
import { WaterMark } from '@xm/mrn-components/lib'
import { Provider as MRNProvider, MTDProvider } from '@ss/mtd-react-native'
import styles from './style'

interface ILayoutProps {
  //
}

export const Layout: React.FC<ILayoutProps> = ({ children }) => (
  <MRNProvider>
    <MTDProvider>
      <View style={styles.container}>
        <WaterMark style={styles.watermark} children={null} />
        {children}
      </View>
    </MTDProvider>
  </MRNProvider>
)
