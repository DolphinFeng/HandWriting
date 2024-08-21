import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { View, Text, TouchableWithoutFeedback } from '@mrn/react-native'
import { Scrollpicker } from '@ss/mtd-react-native'
import { NavBar } from '@onejs/mrn-components'
//
import { IPageProps } from '@src/common/interfaces'
import { Layout } from '@src/components/Layout'
import { Devider } from '@src/components/Devider'
import { EFreq } from '@src/common/enums'
import { CommonFlexStyles, CommonTextStyles, ESolidColor } from '@src/common/styles'
import { RecurrentFreq } from '@src/common/consts'
import { getRecurrenceRuleText } from '@src/utils/text'
import { getNumberOption } from '@src/utils/option'
//
import { CustomRecurrenceStore, ICustomRecurrenceStore } from './stores'
import styles from './style'

const freqOption = [EFreq.DAILY, EFreq.WEEKLY, EFreq.MONTHLY].map((i: EFreq) => ({
  value: i,
  label: RecurrentFreq[i]
}))

const option31 = getNumberOption(1, 31)
const option12 = getNumberOption(1, 12)

const tipText = '当月如果指定日期不存在，将会跳过此日程'

@observer
export default class RecurrencePage extends Component<IPageProps> {
  private store: ICustomRecurrenceStore = new CustomRecurrenceStore()

  componentDidMount() {
    const { navigation } = this.props
    const { startTime, recurrenceRule, setRecurrenceRule } = (navigation.state as any).params
    this.store.init(recurrenceRule, startTime)
    setRecurrenceRule(this.store.rule)
  }

  public changeRule = () => {
    const { navigation } = this.props
    const { setRecurrenceRule } = (navigation.state as any).params
    setRecurrenceRule(this.store.rule)
  }

  public renderWeekPicker = () => {
    const { weekdayOption, handlePressWeekday } = this.store

    return (
      <View style={CommonFlexStyles.flexDefault}>
        {weekdayOption.map((item, index: number) => {
          const { label, checked } = item
          return (
            <TouchableWithoutFeedback
              key={index}
              onPress={() => {
                handlePressWeekday(index)
                this.changeRule()
              }}
            >
              <View style={[styles.weekButtonWrapper, checked && styles.selectBg]}>
                <Text style={[CommonTextStyles.middleText, checked && styles.selectText]}>
                  {label[1]}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          )
        })}
      </View>
    )
  }

  public renderMonthPicker = () => {
    const { byMonthDay, setByMonthDay } = this.store

    return (
      <View style={styles.monthPickerContainer}>
        {option31.map(({ label, value }, index: number) => (
          <TouchableWithoutFeedback
            key={index}
            onPress={() => {
              setByMonthDay([value])
              this.changeRule()
            }}
          >
            <View
              style={[
                styles.monthButtonWrapper,
                byMonthDay[0] === Number(value) && styles.selectBg,
                (1 + index) % 7 === 0 && styles.rightButtonWrapper
              ]}
            >
              <Text
                style={[
                  CommonTextStyles.middleText,
                  byMonthDay[0] === Number(value) && styles.selectText
                ]}
              >
                {label}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        ))}
      </View>
    )
  }

  render() {
    const { freq, interval, rule, showTip, setFreq, setInterval } = this.store

    return (
      <Layout>
        <NavBar title='自定义重复' onBack={() => this.props.navigation.back()} />
        <View style={styles.container}>
          <Text style={styles.text}>{getRecurrenceRuleText(rule)}</Text>
          <Devider />
          <View style={styles.scrollPickerWrapper}>
            <Scrollpicker
              value={[interval, freq]}
              list={[freq === EFreq.DAILY ? option31 : option12, freqOption]}
              onChange={value => {
                setFreq(value[1] as EFreq)
                setInterval(value[0] as number)
                this.changeRule()
              }}
              style={styles.scrollPicker}
            />
          </View>
          <Devider />
          {freq === EFreq.WEEKLY && (
            <View>
              <Text style={styles.text}>星期</Text>
              {this.renderWeekPicker()}
            </View>
          )}
          {freq === EFreq.MONTHLY && (
            <View>
              <Text style={styles.text}>日期</Text>
              {this.renderMonthPicker()}
              {showTip && <Text style={{ color: ESolidColor.Red }}>{tipText}</Text>}
            </View>
          )}
        </View>
      </Layout>
    )
  }
}
