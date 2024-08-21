import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { View } from '@mrn/react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
//
import { IPageProps } from '@src/common/interfaces'
import { Layout } from '@src/components/Layout'
//
import { NavHeader } from './container/NavHeader'
import { TitleContainer } from './container/TitleContainer'
import { TimePickerContainer } from './container/TimePickerContainer'
import { RoomContainer } from './container/RoomContainer'
import { AttendeeContainer } from './container/AttendeeContainer'
import { NoticeContainer } from './container/NoticeContainer'
import { RecurrentContainer } from './container/RecurrentContainer'
import { Memo } from './components/Memo'
//
import { EditStore, IEditStore } from './stores'
import styles from './style'

@observer
export default class Edit extends Component<IPageProps> {
  private store: IEditStore = new EditStore()

  componentDidMount() {
    const { navigation, screenProps } = this.props
    const { params } = navigation.state as any
    this.store.init({
      ...params,
      ...screenProps
    })
  }

  render() {
    const { navigation } = this.props

    return (
      <Layout>
        <NavHeader store={this.store} navigation={navigation} />
        <KeyboardAwareScrollView
          extraScrollHeight={40}
          enableOnAndroid
          enableAutomaticScroll
          enableResetScrollToCoords
          keyboardOpeningTime={100}
          keyboardDismissMode='on-drag'
          keyboardShouldPersistTaps='handled'
        >
          <View style={styles.formContainer}>
            <TitleContainer store={this.store} />
            <TimePickerContainer store={this.store} />
            <RoomContainer store={this.store} />
            <AttendeeContainer store={this.store} navigation={navigation} />
            <NoticeContainer store={this.store} navigation={navigation} />
            <RecurrentContainer store={this.store} navigation={navigation} />
            <Memo
              memo={this.store.memo}
              setMemo={this.store.setMemo}
              disabled={!this.store.isOrganizer}
            />
          </View>
        </KeyboardAwareScrollView>
      </Layout>
    )
  }
}
