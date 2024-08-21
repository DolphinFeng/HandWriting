/* eslint-disable @typescript-eslint/indent */
import React from 'react'
import { inject, observer } from 'mobx-react'
import { SafeAreaView, View } from '@mrn/react-native'
import { AppStore } from '@src/store'
import { VertivalDevider } from '@src/components/VerticalDivider'
import { INavigation } from '@src/common/interfaces'
import { DetailStore } from '../../stores'
import { CancleSchedule } from '../../components/CancleSchedule'
import { CancleAttendSchedule } from '../../components/CancleAttendSchedule'
import { ShareSchedule } from '../../components/ShareSchedule'
import { styles } from './styles'
import { OperationStore } from './store'

interface IInjectProps {
  appStore?: AppStore
  detailStore?: DetailStore
}

@inject('appStore', 'detailStore')
@observer
export class OperationContainer extends React.Component<
  IInjectProps & { navigation: INavigation }
> {
  // eslint-disable-next-line react/destructuring-assignment
  store = new OperationStore(this.props.appStore, this.props.detailStore, this.props.navigation)

  btns = () => {
    const {
      schedule,
      isCyclicSchedule,
      enableCancleSchedule,
      enableCancleAttendSchedule
    } = this.store
    const {
      handleCancleSchedule,
      handleCancleCyclicSchedule,
      handleCancleAttendSchedule,
      handleCancleAttendCyclicSchedule,
      handleShareSchedule
    } = this.store
    const items = [
      {
        component: () => (
          <>
            <CancleSchedule
              key='schedule'
              isCyclic={isCyclicSchedule}
              onCancle={handleCancleSchedule}
              onCancleAll={handleCancleCyclicSchedule}
            />
            <VertivalDevider />
          </>
        ),
        enable: enableCancleSchedule
      },
      {
        component: () => (
          <>
            <CancleAttendSchedule
              key='attend'
              isCyclic={isCyclicSchedule}
              onCancle={handleCancleAttendSchedule}
              onCancleAll={handleCancleAttendCyclicSchedule}
            />
            <VertivalDevider />
          </>
        ),
        enable: enableCancleAttendSchedule
      },
      {
        component: () => (
          <ShareSchedule key='share' title={schedule.title} onShare={handleShareSchedule} />
        ),
        enable: true
      }
    ].filter(item => item.enable)

    return <View style={styles.view}>{items.map(item => item.component())}</View>
  }

  render() {
    return <SafeAreaView style={styles.container}>{this.btns()}</SafeAreaView>
  }
}
