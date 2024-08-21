import React from 'react'
import { observer } from 'mobx-react'
import { View, Text } from '@mrn/react-native'
import { Switch } from '@ss/mtd-react-native'
//
import { Devider } from '@src/components/Devider'
import { IconFont } from '@src/components/IconFont'
import { EAllDayStatus } from '@src/common/enums'
import { CommonFlexStyles, CommonTextStyles } from '@src/common/styles'
//
import { Input } from '../../components/Input'
import { IEditStore } from '../../stores'
import styles from '../../style'

export interface ITitleContainerProps {
  store: IEditStore
}

@observer
export class TitleContainer extends React.Component<ITitleContainerProps> {
  public render(): React.ReactNode {
    return (
      <>
        {this.renderTitle()}
        <Devider left={16} />
        {this.renderIsAllDay()}
        <Devider left={48} />
      </>
    )
  }

  private renderTitle = (): React.ReactNode => {
    const { store } = this.props
    const { title, setTitle, isOrganizer } = store
    return (
      <View style={styles.item}>
        <Input
          name='标题'
          value={title}
          onChangeText={setTitle}
          style={[styles.title, !isOrganizer && styles.disabledText]}
          editable={isOrganizer}
        />
      </View>
    )
  }

  private renderIsAllDay = (): React.ReactNode => {
    const { store } = this.props
    const { isAllDay, setIsAllDay, isOrganizer } = store
    const handleChange = (value: boolean) => {
      setIsAllDay(value ? EAllDayStatus.ALL_DAY : EAllDayStatus.NO_ALL_DAY)
    }

    return (
      <View style={[CommonFlexStyles.flexDefault, styles.item]}>
        <View style={CommonFlexStyles.flexStart}>
          <IconFont icon='dx-caltime' style={[styles.icon, !isOrganizer && styles.disabledText]} />
          <Text style={[CommonTextStyles.defaultText, !isOrganizer && styles.disabledText]}>
            全天
          </Text>
        </View>
        <Switch
          disabled={!isOrganizer}
          onChange={handleChange}
          value={isAllDay === EAllDayStatus.ALL_DAY}
        />
      </View>
    )
  }
}
