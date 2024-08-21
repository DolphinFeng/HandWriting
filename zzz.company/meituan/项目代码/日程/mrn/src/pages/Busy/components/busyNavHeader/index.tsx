import React from 'react'
import { observer } from 'mobx-react'
import { Text, View } from '@mrn/react-native'
import { NavigationScreenProp, NavigationState, NavigationParams } from '@mrn/react-navigation'
import { NavBar } from '@onejs/mrn-components'
import { ONE_DAY } from '@onejs/mrn'
import { TimeUtils } from '@src/utils/time'
import { IconFont } from '@src/components/IconFont'
import styles from './style'

export interface IBusyNavHeader {
  date: number
  setDate: (number) => void
  backCurrentDay: () => void
  editable: boolean
  navigation: NavigationScreenProp<NavigationState, NavigationParams>
  isInGroup?: boolean
  isShowBack?: boolean
}

@observer
export class BusyNavHeader extends React.Component<IBusyNavHeader> {
  public render() {
    const {
      navigation,
      date,
      setDate,
      editable,
      backCurrentDay,
      isInGroup,
      isShowBack
    } = this.props
    const dateBuff = TimeUtils.format(date, 'MM月dd日 周E')

    const handleCancel = () => {
      navigation.back()
    }

    const pref = () => {
      setDate(date - ONE_DAY)
    }

    const next = () => {
      setDate(date + ONE_DAY)
    }

    const renderTitle = (editable: boolean) => (
      <View style={styles.busyTitle}>
        {editable && <IconFont onPress={pref} icon='dx-calleft_day_nav' style={styles.nextIco} />}
        <Text style={styles.title}>{dateBuff}</Text>
        {editable && <IconFont onPress={next} icon='dx-calright_day_nav' style={styles.nextIco} />}
      </View>
    )

    const renderToggleBack = () => {
      if (isShowBack) {
        if (isInGroup) {
          return <IconFont icon='dx-caltoday' onPress={backCurrentDay} style={styles.nextIco} />
        } else {
          return (
            <Text style={styles.text} onPress={backCurrentDay}>
              起始天
            </Text>
          )
        }
      }
      return null
    }

    return (
      <NavBar.Custom
        navStyles={styles.nav}
        titleElement={renderTitle(editable)}
        cornerRightElement={renderToggleBack()}
        cornerLeftElement={
          <IconFont icon='dx-calclose_nav' onPress={handleCancel} style={styles.nextIco} />
        }
      />
    )
  }
}
