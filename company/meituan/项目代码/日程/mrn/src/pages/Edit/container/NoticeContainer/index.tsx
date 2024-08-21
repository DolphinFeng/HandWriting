import React from 'react'
import { observer } from 'mobx-react'
import { Text, View, TouchableHighlight } from '@mrn/react-native'
import { NavigationScreenProp, NavigationState, NavigationParams } from '@mrn/react-navigation'
//
import { Devider } from '@src/components/Devider'
import { IconFont } from '@src/components/IconFont'
import { NoticeText } from '@src/common/consts'
import { CommonFlexStyles, CommonTextStyles, ETransparentColor } from '@src/common/styles'
//
import { IEditStore } from '../../stores'
import styles from '../../style'

export interface INoticeContainerProps {
  store: IEditStore
  navigation: NavigationScreenProp<NavigationState, NavigationParams>
}

@observer
export class NoticeContainer extends React.Component<INoticeContainerProps> {
  public render(): React.ReactNode {
    return (
      <>
        {this.renderNotice()}
        <Devider left={48} />
      </>
    )
  }

  private handlePressNotice = () => {
    const { navigation, store } = this.props
    const { isAllDay, noticeRule, noticeRuleOfAllDay, setNoticeRule, setAllDayNoticeRule } = store

    navigation.navigate('NoticePicker', {
      isAllDay,
      rule: isAllDay ? noticeRuleOfAllDay : noticeRule,
      setNoticeRule: isAllDay ? setAllDayNoticeRule : setNoticeRule
    })
  }

  private renderNotice = () => {
    const { isAllDay, noticeRuleOfAllDay, noticeRule, room, isOrganizer } = this.props.store
    return (
      <TouchableHighlight
        style={styles.item}
        underlayColor={ETransparentColor.Black6}
        onPress={!room && isOrganizer ? this.handlePressNotice : () => {}}
      >
        <>
          <View style={CommonFlexStyles.flexStart}>
            <IconFont
              icon='dx-calbell'
              style={[styles.icon, !isOrganizer && styles.disabledText]}
            />
            <Text style={[CommonTextStyles.defaultText, !isOrganizer && styles.disabledText]}>
              {isAllDay ? NoticeText[noticeRuleOfAllDay] : NoticeText[noticeRule]}
            </Text>
          </View>
          {!room && isOrganizer && <IconFont icon='dx-calright_day_nav' style={styles.navIcon} />}
        </>
      </TouchableHighlight>
    )
  }
}
