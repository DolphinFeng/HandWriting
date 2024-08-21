import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { action, observable } from 'mobx'
import { View, Text, TouchableHighlight } from '@mrn/react-native'
import { NavBar } from '@onejs/mrn-components'
//
import { getRecurrenceRuleText } from '@src/utils/text'
import { IRecurrenceRule } from '@src/apis/Edit/interface'
import { IPageProps } from '@src/common/interfaces'
import { Layout } from '@src/components/Layout'
import { Devider } from '@src/components/Devider'
import { IconFont } from '@src/components/IconFont'
import { ERecurrenceType } from '@src/common/enums'
import { RecurrenceTypeText } from '@src/common/consts'
import { CommonTextStyles } from '@src/common/styles'
//
import styles from './style'

@observer
export default class RecurrencePage extends Component<IPageProps> {
  @observable selectedType: ERecurrenceType = (this.props.navigation.state as any).params
    ?.recurrenceType

  @observable customRecurrenceRule: IRecurrenceRule = (this.props.navigation.state as any).params
    ?.recurrenceRule

  @action public setCustomRecurrenceRule = (rule: IRecurrenceRule) => {
    this.customRecurrenceRule = rule

    const { navigation } = this.props
    const { setRecurrenceRule } = (navigation.state as any).params
    setRecurrenceRule(rule)
  }

  render() {
    const { navigation } = this.props
    const { startTime, setRecurrenceType } = (navigation.state as any).params

    const handlePressItem = (type: ERecurrenceType) => {
      this.selectedType = type
      setRecurrenceType(type)
      if (type === ERecurrenceType.CUSTOMIZED) {
        navigation.navigate('CustomRecurrence', {
          startTime,
          recurrenceRule: this.customRecurrenceRule,
          setRecurrenceRule: this.setCustomRecurrenceRule
        })
      } else {
        navigation.back()
      }
    }

    const renderItem = (type: ERecurrenceType, devide: boolean = true) => (
      <>
        <TouchableHighlight onPress={() => handlePressItem(type)}>
          <View style={styles.item}>
            <Text style={CommonTextStyles.defaultText}>{RecurrenceTypeText[type]}</Text>
            {this.selectedType === type && (
              <IconFont icon='dx-calcheckmini' style={styles.checkIcon} />
            )}
          </View>
        </TouchableHighlight>
        {devide && <Devider left={16} />}
      </>
    )

    return (
      <Layout>
        <NavBar title='重复' onBack={() => this.props.navigation.back()} />
        <View style={styles.container}>
          <Devider height={8} />
          {renderItem(ERecurrenceType.NONE, false)}
          <Devider height={8} />
          {renderItem(ERecurrenceType.EVERY_DAY)}
          {renderItem(ERecurrenceType.WEEKLY)}
          {renderItem(ERecurrenceType.PER_MONTH, false)}
          <Devider height={8} />
          {renderItem(ERecurrenceType.CUSTOMIZED, false)}
          <Devider />
        </View>
        <Text style={styles.text}>{getRecurrenceRuleText(this.customRecurrenceRule)}</Text>
      </Layout>
    )
  }
}
