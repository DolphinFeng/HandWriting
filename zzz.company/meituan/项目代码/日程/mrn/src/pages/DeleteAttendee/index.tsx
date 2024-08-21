import React, { Component } from 'react'
import { action, observable } from 'mobx'
import { observer } from 'mobx-react'
import { View, Text, ScrollView } from '@mrn/react-native'
import { Checkbox } from '@ss/mtd-react-native'
//
import { IAttendee, IPageProps } from '@src/common/interfaces'
import { Layout } from '@src/components/Layout'
import { Avatar } from '@src/components/Avatar'
import { Devider } from '@src/components/Devider'
import { IconFont } from '@src/components/IconFont'
//
import { NavHeader } from './NavHeader'
import styles from './style'

@observer
export default class DeleteAttendee extends Component<IPageProps> {
  @observable
  public selectPersons: string[] = []

  @action
  public setSelectPersons(empIds: string[]) {
    this.selectPersons = empIds
  }

  render() {
    const { navigation } = this.props
    const {
      organizer,
      attendees,
      setAttendees,
      isOrganizer,
      initialAttendees = []
    } = (navigation.state as any).params

    const initialAttendeeEmpids = initialAttendees.map((i: IAttendee) => i.empId)

    const handleCheckBoxChange = (empIds: string[]) => {
      this.setSelectPersons(empIds)
    }

    const handleConfirm = () => {
      const newAttendees = []
      attendees.forEach(attendee => {
        if (!this.selectPersons.includes(attendee.empId)) {
          newAttendees.push(attendee)
        }
      })
      setAttendees(newAttendees)
      navigation.back()
    }

    const renderIcon = (checked: boolean, disabled: boolean) => {
      switch (true) {
        case checked:
          return <IconFont icon='dx-calchecked' style={styles.acceptIcon} />
        case disabled:
          return <View style={styles.disabledCheckBox} />
        default:
          return <IconFont icon='dx-calcheckbox' style={styles.checkBox} />
      }
    }

    return (
      <Layout>
        <NavHeader
          navigation={navigation}
          selectPersons={this.selectPersons}
          handleConfirm={handleConfirm}
        />
        <ScrollView style={styles.container}>
          <Checkbox onChange={handleCheckBoxChange}>
            {attendees.map((i: IAttendee) => (
              <Checkbox.Item
                key={i.empId}
                label={i.name}
                trueValue={i.empId}
                disabled={
                  organizer.empId === i.empId ||
                  (!isOrganizer && initialAttendeeEmpids.includes(i.empId))
                }
                renderContent={(checked: boolean, disable: boolean, index?: number) => (
                  <>
                    <View style={styles.item}>
                      {renderIcon(checked, disable)}
                      <Avatar img={i.avatar} />
                      <Text style={styles.name}>{i.name}</Text>
                      {organizer.empId === i.empId && (
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>创建者</Text>
                        </View>
                      )}
                    </View>
                    {index !== attendees.length - 1 && <Devider left={16} />}
                  </>
                )}
              />
            ))}
          </Checkbox>
        </ScrollView>
      </Layout>
    )
  }
}
