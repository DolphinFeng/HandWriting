import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { observable } from 'mobx'
import { View, Text, TouchableHighlight } from '@mrn/react-native'
import { NavBar } from '@onejs/mrn-components'
//
import { IPageProps } from '@src/common/interfaces'
import { NoticeTimeText } from '@src/common/consts'
import { EAllDayNoticeRule, ENoticeRule } from '@src/common/enums'
import { Layout } from '@src/components/Layout'
import { Devider } from '@src/components/Devider'
import { IconFont } from '@src/components/IconFont'
import { CommonTextStyles } from '@src/common/styles'
//
import styles from './style'

@observer
export default class NoticePage extends Component<IPageProps> {
  @observable
  selectedRule: ENoticeRule | EAllDayNoticeRule = (this.props.navigation.state as any).params?.rule

  render() {
    const { navigation } = this.props
    const { isAllDay, setNoticeRule } = (navigation.state as any).params

    const handlePressItem = (rule: ENoticeRule | EAllDayNoticeRule) => {
      this.selectedRule = rule
      setNoticeRule(rule)
      navigation.back()
    }

    const renderItem = (rule: ENoticeRule | EAllDayNoticeRule, devide: boolean = true) => (
      <>
        <TouchableHighlight onPress={() => handlePressItem(rule)}>
          <View style={styles.item}>
            <Text style={CommonTextStyles.defaultText}>{NoticeTimeText[rule]}</Text>
            {this.selectedRule === rule && (
              <IconFont icon='dx-calcheckmini' style={styles.checkIcon} />
            )}
          </View>
        </TouchableHighlight>
        {devide && <Devider left={16} />}
      </>
    )

    if (isAllDay) {
      return (
        <Layout>
          <NavBar title='提醒' onBack={() => this.props.navigation.back()} />
          <View style={styles.container}>
            <Devider height={8} />
            {renderItem(EAllDayNoticeRule.不提醒, false)}
            <Devider height={8} />
            {renderItem(EAllDayNoticeRule['当天9:00'])}
            {renderItem(EAllDayNoticeRule['1天前9:00'])}
            {renderItem(EAllDayNoticeRule['2天前9:00'])}
            {renderItem(EAllDayNoticeRule['1周前9:00'], false)}
            <Devider />
          </View>
        </Layout>
      )
    }

    return (
      <Layout>
        <NavBar title='提醒' onBack={() => this.props.navigation.back()} />
        <View style={styles.container}>
          <Devider height={8} />
          {renderItem(ENoticeRule.不提醒, false)}
          <Devider height={8} />
          {renderItem(ENoticeRule.日程开始时)}
          {renderItem(ENoticeRule['5分钟前'])}
          {renderItem(ENoticeRule['10分钟前'])}
          {renderItem(ENoticeRule['15分钟前'])}
          {renderItem(ENoticeRule['30分钟前'])}
          {renderItem(ENoticeRule['1小时前'])}
          {renderItem(ENoticeRule['1天前'], false)}
          <Devider />
        </View>
      </Layout>
    )
  }
}
