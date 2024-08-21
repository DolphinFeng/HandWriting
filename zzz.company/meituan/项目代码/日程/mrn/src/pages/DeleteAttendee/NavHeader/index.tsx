import React from 'react'
import { observer } from 'mobx-react'
import { Text } from '@mrn/react-native'
import { NavigationScreenProp, NavigationState, NavigationParams } from '@mrn/react-navigation'
import { NavBar } from '@onejs/mrn-components'
import { IconFont } from '@src/components/IconFont'
import styles from './style'

export interface INavHeaderProps {
  navigation: NavigationScreenProp<NavigationState, NavigationParams>
  selectPersons: string[]
  handleConfirm: () => void
}

@observer
export class NavHeader extends React.Component<INavHeaderProps> {
  public render() {
    const { navigation, selectPersons, handleConfirm } = this.props

    return (
      <NavBar.Custom
        navStyles={styles.nav}
        titleElement={<Text style={styles.title}>移除参与人</Text>}
        cornerRightElement={
          selectPersons.length === 0 ? (
            <Text style={styles.disabledText} onPress={handleConfirm}>
              确定
            </Text>
          ) : (
            <Text style={styles.text} onPress={handleConfirm}>
              {`确定(${selectPersons.length})`}
            </Text>
          )
        }
        cornerLeftElement={
          <IconFont
            icon='dx-calleft_day_nav'
            style={styles.backIcon}
            onPress={() => navigation.back()}
          />
        }
      />
    )
  }
}
