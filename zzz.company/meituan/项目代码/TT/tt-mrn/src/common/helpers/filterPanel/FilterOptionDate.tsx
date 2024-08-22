import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions
} from '@mrn/react-native'
import React, { Component } from 'react'
import { formatDate3, formatDate4, formatDate6 } from '../FormatDate'

export class FilterDateModel {
  startDate?: Date
  endDate?: Date
}

interface IProps {
  /** 头部显示文字 */
  pikcerHeaderIndicator: string
  /** 选中的时间model */
  selectedDateModel?: FilterDateModel
  /** 起始时间 点击 */
  onStartDatePress: () => void
  /** 结束时间 点击 */
  onEndDatePress: () => void
  /** 日期显示形式
   *  date: 年-月-日
   *  default: 月-日-时-分
   *  后续可以再补充其他形式
   */
  displayDateType?: 'date' | 'default'
}

interface IState {}

class FilterOptionDate extends Component<IProps, IState> {
  render() {
    return (
      <View style={styles.sectionTop}>
        <Text style={styles.indicatorText}>
          {this.props.pikcerHeaderIndicator}
        </Text>
        <View style={styles.dateView}>
          {this.renderDateStartButton(true)}
          <View
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.38)',
              width: 10,
              height: 1
            }}
          />
          {this.renderDateStartButton(false)}
        </View>
      </View>
    )
  }

  renderDateStartButton(start: boolean) {
    let text: string
    const selectedDateModel = this.props.selectedDateModel

    const date = start
      ? selectedDateModel?.startDate
      : selectedDateModel?.endDate

    if (start) {
      text = this.getTimeTxt(date) ?? '起始时间'
    } else {
      text = this.getTimeTxt(date) ?? '结束时间'
    }

    return (
      <TouchableOpacity
        style={styles.timeButton}
        onPress={
          start ? this.props.onStartDatePress : this.props.onEndDatePress
        }
      >
        <Text
          style={date != null ? styles.timeTextSelect : styles.timeTextHint}
        >
          {text}
        </Text>
      </TouchableOpacity>
    )
  }

  getTimeTxt(date) {
    const { displayDateType } = this.props
    return displayDateType != null && displayDateType === 'date'
      ? formatDate6(date)
      : formatDate4(date)
  }
}

export default FilterOptionDate

const buttonWidth = (Dimensions.get('window').width - 35 - 16 * 2) / 2

const styles = StyleSheet.create({
  sectionTop: {
    marginTop: 20
  },
  top: {
    marginTop: 8
  },
  indicatorText: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.6)'
  },
  timeButton: {
    // flex: 1,
    width: buttonWidth,
    height: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  timeTextHint: {
    color: 'rgba(0, 0, 0, 0.24)',
    fontSize: 14
  },
  timeTextSelect: {
    color: 'black'
  },
  dateView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    alignItems: 'center'
  }
})
