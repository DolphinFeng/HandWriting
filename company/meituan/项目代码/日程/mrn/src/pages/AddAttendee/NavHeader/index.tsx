import React from 'react'
import { action, observable } from 'mobx'
import { observer } from 'mobx-react'
import { Text } from '@mrn/react-native'
import { NavigationScreenProp, NavigationState, NavigationParams } from '@mrn/react-navigation'
import { NavBar } from '@onejs/mrn-components'
import { Dialog, TopViewManager } from '@ss/mtd-react-native'
import { IAddAttendeeStore } from '../stores'
import styles from './style'

export interface INavHeaderProps {
  navigation: NavigationScreenProp<NavigationState, NavigationParams>
  store: IAddAttendeeStore
}

@observer
export class NavHeader extends React.Component<INavHeaderProps> {
  @observable
  public dialogInstance: TopViewManager = null

  @action
  private setDialogInstance = (instance: TopViewManager) => {
    this.dialogInstance = instance
  }

  public handleConfirm = () => {
    const { navigation, store } = this.props
    const { attendees, setAttendees } = (navigation.state as any).params
    const { onlyGroupMember, selectPersons, organizer, canSelect } = store

    if (canSelect) {
      if (onlyGroupMember) {
        setAttendees([organizer, ...selectPersons])
      } else {
        selectPersons.length > 0 && setAttendees([...attendees, ...selectPersons])
      }
      navigation.back()
    } else {
      !this.dialogInstance &&
        this.setDialogInstance(
          Dialog.alert({
            header: '参与人不可超过500人',
            confirmLabel: '确定',
            confirmCallback: () => this.setDialogInstance(null)
          })
        )
    }
  }

  public render() {
    const { navigation, store } = this.props
    const { onlyGroupMember, selectPersons, selectedAttendees } = store

    return (
      <NavBar.Custom
        navStyles={styles.nav}
        titleElement={
          <Text style={styles.title}>{onlyGroupMember ? '选择成员' : '添加参与人'}</Text>
        }
        cornerRightElement={
          selectPersons.length === 0 && !onlyGroupMember ? (
            <Text style={styles.disabledText} onPress={this.handleConfirm}>
              确定
            </Text>
          ) : (
            <Text style={styles.confirmText} onPress={this.handleConfirm}>
              {`确定(${
                onlyGroupMember
                  ? selectPersons.length + selectedAttendees.length
                  : selectPersons.length
              })`}
            </Text>
          )
        }
        cornerLeftElement={
          <Text style={styles.cancelText} onPress={() => navigation.back()}>
            取消
          </Text>
        }
      />
    )
  }
}
