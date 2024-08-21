import React, { Component } from 'react'
import { action, observable, toJS } from 'mobx'
import { observer } from 'mobx-react'
import { View, Text, TouchableWithoutFeedback, TextInput, FlatList } from '@mrn/react-native'
//
import { EditApi } from '@src/apis'
import { IAttendee, IPageProps } from '@src/common/interfaces'
import { ESolidColor, ETransparentColor } from '@src/common/styles'
import { IAccount } from '@src/apis/Edit/interface'
import { Avatar } from '@src/components/Avatar'
import { Layout } from '@src/components/Layout'
import { IconFont } from '@src/components/IconFont'
//
import styles from './style'

@observer
export default class SearchAttendee extends Component<IPageProps> {
  @observable public inputValue: string

  @observable public accountList: IAccount[] = []

  private inputRef: React.RefObject<TextInput> = React.createRef()

  @action public handleInputChange = async (text: string) => {
    const { navigation } = this.props
    const { allMembers } = (navigation.state as any).params
    this.inputValue = text
    console.log(toJS(allMembers))
    // 如果传入搜索集，则用搜索集来搜索
    if (allMembers && allMembers.length > 0) {
      this.accountList = allMembers.filter(
        item => item?.name.includes(text) || item?.mis.includes(text.toLowerCase())
      )
      console.log(toJS(this.accountList))
    } else {
      const accounts = await EditApi.searchAccount(text)
      this.accountList = accounts
    }
  }

  public componentDidMount() {
    setTimeout(() => {
      this.inputRef?.current.focus()
    }, 500)
  }

  public handlePressCancel = () => {
    const { navigation } = this.props
    navigation.back()
  }

  public handlePressAvatar = (attendee: IAttendee) => {
    const { navigation } = this.props
    const { addSearchAttendee } = (navigation.state as any).params
    addSearchAttendee(attendee)
    navigation.back()
  }

  public getText = (text: string) => {
    const index = text.indexOf(this.inputValue.toLocaleLowerCase())
    if (index > -1) {
      return (
        <>
          {text.slice(0, index)}
          <Text style={{ color: ESolidColor.Orange }}>{this.inputValue.toLocaleLowerCase()}</Text>
          {text.slice(index + this.inputValue.length)}
        </>
      )
    }
    return text
  }

  render() {
    return (
      <Layout>
        <View style={styles.headerContainer}>
          <View style={styles.textInputContainer}>
            <IconFont icon='dx-calsearch' style={styles.searchIcon} />
            <TextInput
              placeholder='搜索'
              value={this.inputValue}
              onChangeText={this.handleInputChange}
              ref={this.inputRef}
              clearButtonMode='while-editing'
              style={styles.textInput}
              placeholderTextColor={ETransparentColor.Black24}
            />
          </View>
          <Text onPress={this.handlePressCancel} style={styles.cancelText}>
            取消
          </Text>
        </View>
        <FlatList
          style={styles.accountList}
          data={this.accountList}
          keyboardDismissMode='on-drag'
          keyboardShouldPersistTaps='handled'
          ListEmptyComponent={
            this.inputValue && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>无结果</Text>
              </View>
            )
          }
          renderItem={({ item }) => (
            <TouchableWithoutFeedback key={item.empId} onPress={() => this.handlePressAvatar(item)}>
              <View style={styles.item}>
                <Avatar img={item.avatar} />
                <Text style={styles.itemText} numberOfLines={1}>
                  {this.getText(item.name)}/{this.getText(item.mis)}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          )}
          ListFooterComponent={<View style={styles.listFooter} />}
        />
      </Layout>
    )
  }
}
