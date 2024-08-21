import * as React from 'react'
import { action, observable } from 'mobx'
import { observer } from 'mobx-react'
import { Layout } from '@src/components/Layout'
import { NavBar } from '@onejs/mrn-components'
import { ScrollView, View } from '@mrn/react-native'
import { openVcard } from '@onejs/mrn-utils/src/openPage'
import { IAttendee, IPageProps } from '@src/common/interfaces'
import { Devider } from '@src/components/Devider'
import { IOrganizer } from '../Detail/interfaces'
import { AttendeeItem } from './components/AttendeeItem'
import { styles } from './styles'

interface IAttendeeListParams {
  organizer: IOrganizer
  attendees: IAttendee[]
}

@observer
export default class AttendeeList extends React.PureComponent<IPageProps> {
  @observable params: IAttendeeListParams = {} as IAttendeeListParams

  constructor(props) {
    super(props)
    const { organizer, attendees } = this.getPramas()
    this.setParams({
      organizer,
      attendees
    })
  }

  @action
  setParams = (params: IAttendeeListParams) => {
    this.params = params
  }

  getPramas = (): IAttendeeListParams => {
    // !Warn APP入口处统一参数来源
    const { navigation, screenProps = {} } = this.props
    const { params = {} } = navigation.state as any
    return {
      ...screenProps,
      ...params
    }
  }

  render() {
    const { navigation } = this.props
    const { organizer, attendees } = this.params
    const items = [organizer, ...attendees]
    return (
      <Layout>
        <NavBar title='参与人列表' onBack={() => navigation.back()} />
        <ScrollView style={styles.container}>
          {items.map((attendee, index) => (
            <View key={attendee.empId} style={styles.item}>
              <AttendeeItem
                attendee={attendee}
                isOrganizer={attendee.empId === organizer.empId}
                onPress={(xmUid: string) => {
                  openVcard('real', Number(xmUid))
                }}
              />
              {index !== items.length - 1 && <Devider left={16} />}
            </View>
          ))}
        </ScrollView>
      </Layout>
    )
  }
}
