import React from 'react'
import { observer } from 'mobx-react'
import { action, observable } from 'mobx'
import { NavigationScreenProp, NavigationState, NavigationParams } from '@mrn/react-navigation'
import { View, Text, TouchableHighlight, Keyboard } from '@mrn/react-native'
import { Datepicker, SlideModal, TopViewManager } from '@ss/mtd-react-native'
//
import { Devider } from '@src/components/Devider'
import { IconFont } from '@src/components/IconFont'
import { TimeUtils } from '@src/utils/time'
import { ERecurrenceType } from '@src/common/enums'
import { CommonTextStyles, ETransparentColor } from '@src/common/styles'
import { RecurrenceTypeText } from '@src/common/consts'
import { getRecurrenceRuleText } from '@src/utils/text'
//
import { IEditStore } from '../../stores'
import styles from '../../style'

export interface IRecurrentContainerProps {
  store: IEditStore
  navigation: NavigationScreenProp<NavigationState, NavigationParams>
}

@observer
export class RecurrentContainer extends React.Component<IRecurrentContainerProps> {
  @observable public slideModalInstance: TopViewManager = null

  private deadlinePickerRef: React.RefObject<Datepicker> = React.createRef()

  @action
  private handlePressDeadLine = () => {
    setTimeout(() => {
      Keyboard.dismiss()
    }, 0)

    if (this.slideModalInstance) {
      return
    }

    const { store } = this.props
    const { startTime, startDay, isAllDay, deadline, setDeadline } = store
    this.setSlideModalInstance(
      SlideModal.open({
        title: '',
        leftLabel: '取消',
        rightLabel: '确认',
        children: (
          <View>
            <Datepicker
              ref={this.deadlinePickerRef}
              mode='date'
              minDate={new Date(isAllDay ? startDay : startTime)}
              maxDate={new Date(TimeUtils.getNextYear(undefined, 2))}
              date={new Date(deadline)}
            />
          </View>
        ),
        leftCallback: () => {
          this.closeModal()
        },
        rightCallback: () => {
          if (this.deadlinePickerRef) {
            setDeadline(this.deadlinePickerRef.current.getSelectedDate().getTime())
          }
          this.closeModal()
        }
      })
    )
  }

  @action
  private setSlideModalInstance = (instance: TopViewManager) => {
    this.slideModalInstance = instance
  }

  public render(): React.ReactNode {
    return (
      <>
        {this.renderRecurrence()}
        <Devider left={48} />
        {this.renderDeadLine()}
        <Devider height={8} />
      </>
    )
  }

  private closeModal = () => {
    if (this.slideModalInstance) {
      this.slideModalInstance.close()
    }
    this.setSlideModalInstance(null)
  }

  private handlePressRecurrence = () => {
    const { navigation, store } = this.props
    const {
      startTime,
      startDay,
      isAllDay,
      recurrenceType,
      recurrenceRule,
      setRecurrenceType,
      setRecurrenceRule
    } = store

    navigation.navigate('RecurrencePicker', {
      startTime: isAllDay ? startDay : startTime,
      recurrenceType,
      recurrenceRule,
      setRecurrenceType,
      setRecurrenceRule
    })
  }

  private renderRecurrence = () => {
    const { store } = this.props
    const { recurrenceType, recurrenceRule, isOrganizer } = store

    return (
      <TouchableHighlight
        underlayColor={ETransparentColor.Black6}
        onPress={isOrganizer ? this.handlePressRecurrence : () => {}}
      >
        <View style={styles.item}>
          <IconFont icon='dx-calcycle' style={[styles.icon, !isOrganizer && styles.disabledText]} />
          <View style={styles.content}>
            <Text style={[CommonTextStyles.defaultText, !isOrganizer && styles.disabledText]}>
              {recurrenceType === ERecurrenceType.CUSTOMIZED && recurrenceRule
                ? getRecurrenceRuleText(recurrenceRule)
                : RecurrenceTypeText[recurrenceType]}
            </Text>
          </View>
          {isOrganizer && <IconFont icon='dx-calright_day_nav' style={styles.navIcon} />}
        </View>
      </TouchableHighlight>
    )
  }

  private renderDeadLine = () => {
    const { store } = this.props
    const { recurrenceType, deadline, isOrganizer } = store
    if (recurrenceType !== ERecurrenceType.NONE) {
      return (
        <TouchableHighlight
          style={[styles.item, styles.deadline]}
          underlayColor={ETransparentColor.Black6}
          onPress={isOrganizer ? this.handlePressDeadLine : () => {}}
        >
          <>
            <Text style={[CommonTextStyles.defaultText, !isOrganizer && styles.disabledText]}>
              {TimeUtils.format(deadline, 'YYYY年MM月dd日截止')}
            </Text>
            {isOrganizer && <IconFont icon='dx-calright_day_nav' style={styles.navIcon} />}
          </>
        </TouchableHighlight>
      )
    }
    return null
  }
}
