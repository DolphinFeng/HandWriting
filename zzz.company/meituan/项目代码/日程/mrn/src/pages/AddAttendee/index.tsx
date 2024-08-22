import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { View, Text, TouchableWithoutFeedback, FlatList } from '@mrn/react-native'
//
import { IAttendee, IPageProps } from '@src/common/interfaces'
import { ESolidColor } from '@src/common/styles'
import { Layout } from '@src/components/Layout'
import { Avatar } from '@src/components/Avatar'
import { Devider } from '@src/components/Devider'
import { IconFont } from '@src/components/IconFont'
//
import { AddAttendeeStore, IAddAttendeeStore } from './stores'
import { NavHeader } from './NavHeader'
import styles from './style'

const ITEM_HEIGHT = 60

@observer
export default class AddAttendee extends Component<IPageProps> {
  private store: IAddAttendeeStore = new AddAttendeeStore()

  private AvatarFlatListRef: React.RefObject<FlatList<IAttendee>> = React.createRef()

  public componentDidMount() {
    const { navigation } = this.props
    const { attendees, onlyGroupMember, organizer, chatId } = (navigation.state as any).params
    this.store.init(attendees, onlyGroupMember, organizer, chatId)
    this.initGroupMembers()
  }

  public initGroupMembers = async () => {
    await this.store.getAllGroupMembers()
    this.AvatarListScrollToEnd()
  }

  public AvatarListScrollToEnd = () => {
    setTimeout(() => {
      this.AvatarFlatListRef && this.AvatarFlatListRef.current.scrollToEnd({ animated: true })
    }, 0)
  }

  public handlePressAllCheck = () => {
    const {
      allChecked,
      groupMembers,
      selectedAttendeeEmpids,
      setAllChecked,
      setSelectPersons
    } = this.store

    if (allChecked) {
      setSelectPersons([])
    } else {
      setSelectPersons(
        groupMembers.filter((i: IAttendee) => !selectedAttendeeEmpids.includes(i.empId))
      )
      this.AvatarListScrollToEnd()
    }
    setAllChecked(!allChecked)
  }

  public handlePressCheckBoxItem = (attendee: IAttendee) => {
    const {
      selectPersonsEmpids,
      selectedAttendeeEmpids,
      deleteSelectPerson,
      addSelectPerson
    } = this.store

    if (!selectedAttendeeEmpids.includes(attendee.empId)) {
      const index = selectPersonsEmpids.findIndex(empid => empid === attendee.empId)
      if (index > -1) {
        deleteSelectPerson(index)
      } else {
        addSelectPerson(attendee)
        this.AvatarListScrollToEnd()
      }
    }
  }

  public handlePressSearch = () => {
    const { navigation } = this.props
    const { onlyGroupMember, groupMembers } = this.store
    navigation.navigate('SearchAttendee', {
      allMembers: onlyGroupMember ? groupMembers : [],
      addSearchAttendee: this.addSearchAttendee
    })
  }

  public addSearchAttendee = (attendee: IAttendee) => {
    const { selectPersonsEmpids, selectedAttendeeEmpids, addSelectPerson } = this.store
    if (
      !selectedAttendeeEmpids.includes(attendee.empId) &&
      !selectPersonsEmpids.includes(attendee.empId)
    ) {
      addSelectPerson(attendee)
    }
  }

  public renderIcon = (checked: boolean, disabled: boolean) => {
    switch (true) {
      case disabled && checked:
        return <IconFont icon='dx-calchecked' style={styles.acceptDisableIcon} />
      case disabled:
        return <View style={styles.disabledCheckBox} />
      case checked:
        return <IconFont icon='dx-calchecked' style={styles.acceptIcon} />
      default:
        return <IconFont icon='dx-calcheckbox' style={styles.checkBox} />
    }
  }

  public renderCheckboxAllChecked = () => {
    const { groupMembers, allChecked } = this.store
    if (groupMembers.length > 500) {
      return (
        <View style={styles.allChecked}>
          {this.renderIcon(allChecked, true)}
          <Text style={styles.allCheckText}>全选（超过500人的群暂不支持）</Text>
        </View>
      )
    }
    return (
      <TouchableWithoutFeedback onPress={this.handlePressAllCheck}>
        <View style={styles.allChecked}>
          {this.renderIcon(allChecked, false)}
          <Text style={styles.allCheckText}>{`全选（共${groupMembers.length}人）`}</Text>
        </View>
      </TouchableWithoutFeedback>
    )
  }

  public renderSelectMore = () => {
    const { onlyGroupMember, selectAttendees } = this.store
    if (!onlyGroupMember) {
      return (
        <>
          <Devider left={16} style={{ backgroundColor: ESolidColor.GrayF5 }} />
          <TouchableWithoutFeedback onPress={() => selectAttendees()}>
            <View style={styles.moreAttendeeContainer}>
              <Text>选择更多参与人</Text>
              <IconFont icon='dx-calright_day_nav' style={styles.navIcon} />
            </View>
          </TouchableWithoutFeedback>
        </>
      )
    }
    return <View />
  }

  public renderGroupMember = () => (
    <View style={{ backgroundColor: ESolidColor.White }}>
      <Devider height={8} style={{ backgroundColor: ESolidColor.GrayF5 }} />
      <Text style={styles.groupText}>群成员</Text>
      <Devider left={16} style={{ backgroundColor: ESolidColor.GrayF5 }} />
    </View>
  )

  render() {
    const { navigation } = this.props
    const { groupMembers, selectPersons, selectedAttendeeEmpids, handlePressAvatar } = this.store

    return (
      <Layout>
        <NavHeader store={this.store} navigation={navigation} />
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <FlatList
              showsHorizontalScrollIndicator={false}
              horizontal
              style={styles.flatListContainer}
              ref={this.AvatarFlatListRef}
              data={selectPersons}
              renderItem={({ item }) => (
                <TouchableWithoutFeedback
                  key={item.empId}
                  onPress={() => {
                    handlePressAvatar(item.empId)
                  }}
                >
                  <View style={styles.avatarContainer}>
                    <Avatar img={item.avatar} />
                  </View>
                </TouchableWithoutFeedback>
              )}
              ListFooterComponent={
                selectPersons.length > 0 && <View style={styles.avatarListFooter} />
              }
            />
            <TouchableWithoutFeedback onPress={this.handlePressSearch}>
              <View
                style={[
                  styles.searchContainer,
                  selectPersons.length === 0 && styles.searchContainerMargin
                ]}
              >
                <IconFont icon='dx-calsearch' style={styles.searchIcon} />
                <Text style={styles.search}>搜索</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
          <FlatList
            stickyHeaderIndices={[1]}
            data={[{} as any, {}, {}, ...groupMembers]}
            renderItem={({ item, index }) => {
              switch (index) {
                case 0:
                  return this.renderSelectMore()
                case 1:
                  return this.renderGroupMember()
                case 2:
                  return this.renderCheckboxAllChecked()
                default:
                  return (
                    <TouchableWithoutFeedback onPress={() => this.handlePressCheckBoxItem(item)}>
                      <View style={styles.item} key={item.empId}>
                        {this.renderIcon(
                          selectPersons.map(i => i.empId).includes(item.empId) ||
                            selectedAttendeeEmpids.includes(item.empId),
                          selectedAttendeeEmpids.includes(item.empId)
                        )}
                        <Avatar img={item.avatar} />
                        <Text style={styles.name}>{item.name}</Text>
                      </View>
                    </TouchableWithoutFeedback>
                  )
              }
            }}
            ListFooterComponent={<View style={styles.listFooter} />}
            getItemLayout={(_, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index
            })}
          />
        </View>
      </Layout>
    )
  }
}
