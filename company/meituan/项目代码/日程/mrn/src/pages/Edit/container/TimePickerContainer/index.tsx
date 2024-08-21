/* eslint-disable @typescript-eslint/member-ordering*/
import React from 'react'
import { observer } from 'mobx-react'
import { action, observable } from 'mobx'
import { View, Text, TouchableWithoutFeedback, Keyboard } from '@mrn/react-native'
import { Datepicker, SlideModal, TopViewManager } from '@ss/mtd-react-native'
//
import { ONE_HOUR, ONE_WEEK, TimeUtils } from '@src/utils/time'
import { CommonTextStyles } from '@src/common/styles'
import { Devider } from '@src/components/Devider'
import { IconFont } from '@src/components/IconFont'
//
import { IEditStore } from '../../stores'
import styles from './style'

export interface ITimePickerContainerProps {
  store: IEditStore
}

const modalAttr = {
  title: '',
  leftLabel: '取消',
  rightLabel: '确认'
}

@observer
export class TimePickerContainer extends React.Component<ITimePickerContainerProps> {
  @observable
  public slideModalInstance: TopViewManager = null

  private startTimePickerRef: React.RefObject<Datepicker> = React.createRef()
  private endTimePickerRef: React.RefObject<Datepicker> = React.createRef()

  public formatDay = (day: number, date?: any) => {
    if (TimeUtils.format(date, 'YYYY-MM-dd') === TimeUtils.format(Date.now(), 'YYYY-MM-dd')) {
      return '今天'
    }
    return `${day}日`
  }
  public render(): React.ReactNode {
    const { store } = this.props
    const { isAllDay, startTime, endTime, startDay, endDay, endAfterStart, isOrganizer } = store

    return (
      <>
        <View style={[styles.item, styles.time]}>
          <TouchableWithoutFeedback onPress={isOrganizer ? this.handlePressStart : () => {}}>
            <View style={styles.timePicker}>
              <Text style={[CommonTextStyles.tipsText, !isOrganizer && styles.disabledText]}>
                开始
              </Text>
              <Text style={[CommonTextStyles.middleText, !isOrganizer && styles.disabledText]}>
                {isAllDay
                  ? TimeUtils.format(startDay, 'yy年')
                  : TimeUtils.format(startTime, 'yy年MM月dd日 周E')}
              </Text>
              <Text style={[CommonTextStyles.boldText, !isOrganizer && styles.disabledText]}>
                {isAllDay
                  ? TimeUtils.format(startDay, 'MM月dd日 周E')
                  : TimeUtils.format(startTime, 'HH:mm')}
              </Text>
            </View>
          </TouchableWithoutFeedback>
          <IconFont icon='dx-caltime_arrow' style={styles.arrowIcon} />
          <TouchableWithoutFeedback onPress={isOrganizer ? this.handlePressEnd : () => {}}>
            <View style={styles.timePicker}>
              <Text style={[CommonTextStyles.tipsText, !isOrganizer && styles.disabledText]}>
                结束
              </Text>
              <Text
                style={[
                  CommonTextStyles.middleText,
                  !endAfterStart && styles.errorText,
                  !isOrganizer && styles.disabledText
                ]}
              >
                {isAllDay
                  ? TimeUtils.format(endDay, 'yy年', true)
                  : TimeUtils.format(endTime, 'yy年MM月dd日 周E', true)}
              </Text>
              <Text
                style={[
                  CommonTextStyles.boldText,
                  !endAfterStart && styles.errorText,
                  !isOrganizer && styles.disabledText
                ]}
              >
                {isAllDay
                  ? TimeUtils.format(endDay, 'MM月dd日 周E', true)
                  : TimeUtils.format(endTime, 'HH:mm', true)}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>

        <Devider height={8} />
      </>
    )
  }

  @action
  private setSlideModalInstance = (instance: TopViewManager) => {
    this.slideModalInstance = instance
  }

  private handlePressStart = () => {
    setTimeout(() => {
      Keyboard.dismiss()
    }, 0)
    if (this.slideModalInstance) {
      return
    }
    const { store } = this.props
    const { isAllDay, startTime, startDay, setStartTime } = store

    this.setSlideModalInstance(
      SlideModal.open({
        ...modalAttr,
        children: (
          <View>
            <Datepicker
              ref={this.startTimePickerRef}
              mode={isAllDay ? 'date' : 'datetime'}
              formatDay={!isAllDay && this.formatDay}
              proportion={isAllDay ? [1, 1, 1] : [2, 1, 1]}
              maxDate={new Date(TimeUtils.getNextYear(undefined, 2))}
              date={isAllDay ? new Date(startDay) : new Date(startTime)}
              minuteStep={15}
            />
          </View>
        ),
        leftCallback: () => {
          this.closeModal()
        },
        rightCallback: () => {
          if (this.startTimePickerRef) {
            setStartTime(this.startTimePickerRef.current.getSelectedDate().getTime())
          }
          this.closeModal()
        }
      })
    )
  }

  private handlePressEnd = () => {
    setTimeout(() => {
      Keyboard.dismiss()
    }, 0)
    if (this.slideModalInstance) {
      return
    }
    const { store } = this.props
    const { isAllDay, endTime, endDay, setEndTime, setHasChangeEndTime } = store
    this.setSlideModalInstance(
      SlideModal.open({
        ...modalAttr,
        children: (
          <View>
            <Datepicker
              ref={this.endTimePickerRef}
              mode={isAllDay ? 'date' : 'daytime'}
              formatDay={!isAllDay && this.formatDay}
              proportion={isAllDay ? [1, 1, 1] : [2, 1, 1]}
              maxDate={new Date(TimeUtils.getNextYear(undefined, 2))}
              date={isAllDay ? new Date(endDay - ONE_HOUR) : new Date(endTime)}
              minuteStep={15}
            />
          </View>
        ),
        leftCallback: () => {
          this.closeModal()
        },
        rightCallback: () => {
          if (this.endTimePickerRef) {
            setEndTime(this.endTimePickerRef.current.getSelectedDate().getTime())
            setHasChangeEndTime(true)
          }
          this.closeModal()
        }
      })
    )
  }

  private closeModal = () => {
    if (this.slideModalInstance) {
      this.slideModalInstance.close()
    }
    this.setSlideModalInstance(null)
  }
}
