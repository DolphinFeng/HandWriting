import React from 'react'
import { observer } from 'mobx-react'
import { Text, View, Keyboard } from '@mrn/react-native'
import { NavigationScreenProp, NavigationState, NavigationParams } from '@mrn/react-navigation'
import { NavBar, toast } from '@onejs/mrn-components'
import { ActionSheet } from '@ss/mtd-react-native'
//
import { EEditType, EPushType, ERecurrenceType } from '@src/common/enums'
import { ESolidColor } from '@src/common/styles'
//
import { IEditStore } from '../../stores'
import styles from './style'

export interface INavHeaderProps {
  store: IEditStore
  navigation: NavigationScreenProp<NavigationState, NavigationParams>
}

const defaultModalProps = {
  modalProps: { maskOpacity: 0.2 },
  containerStyle: { backgroundColor: ESolidColor.White },
  renderItem: (item: any) => (
    <Text style={styles.confirmText} key={item.label}>
      {item.label}
    </Text>
  ),
  footer: (
    <View style={styles.footerView}>
      <Text style={styles.footerText}>取消</Text>
    </View>
  )
}

@observer
export class NavHeader extends React.Component<INavHeaderProps> {
  public renderActionSheetHeader = (text: string = '') => (
    <View style={styles.tip}>
      <Text style={styles.tipText}>{text}</Text>
    </View>
  )

  public notice = async (callback: any) => {
    const { store } = this.props
    const {
      isOrganizer,
      attendees,
      noChangeSchedule,
      endTime,
      setPushType,
      noChangeAttendee
    } = store
    const noChangeAttendees = noChangeAttendee()

    if (
      noChangeSchedule() || // 日程内容未变更
      endTime < Date.now() || // 变更后的结束时间是过去时间
      (noChangeAttendees && isOrganizer && attendees.length === 1) // 未发生参与人变化，且编辑者是唯一参与人
    ) {
      await callback()
      return
    }

    if (isOrganizer && noChangeAttendees) {
      ActionSheet.open({
        ...defaultModalProps,
        options: [{ label: '通知' }, { label: '不通知' }],
        header: this.renderActionSheetHeader('此次日程变更是否通知参与者？'),
        confirmCallback: async (_, index) => {
          index === 0 && setPushType(EPushType.ALL_PUSH)
          await callback()
        }
      })
    } else {
      ActionSheet.open({
        ...defaultModalProps,
        options: [{ label: '通知所有参与者' }, { label: '通知变更的参与者' }],
        header: this.renderActionSheetHeader('此次日程变更通知哪些人？'),
        confirmCallback: async (_, index) => {
          setPushType(index === 0 ? EPushType.ALL_PUSH : EPushType.ATTENDEE_PUSH)
          await callback()
        }
      })
    }
  }

  public handleConfirm = async () => {
    Keyboard.dismiss()
    const { store } = this.props
    const {
      scheduleId,
      detail,
      recurrenceRule,
      recurrenceType,
      deadline,
      canSchedule,
      createSchedule,
      noChangeRecurrenceRule
    } = store

    let newScheduleId: string
    switch (true) {
      // 判断是否可以创建/编辑日程
      case !canSchedule():
        break
      // 新建：直接创建
      case !scheduleId:
        newScheduleId = await createSchedule(EEditType.CREATE_NEW)
        this.handleToast(newScheduleId)
        break
      // 编辑：非循环日程直接保存
      case detail && (!detail.recurrenceType || detail.recurrenceType === ERecurrenceType.NONE):
        await this.notice(async () => {
          newScheduleId = await createSchedule(EEditType.EDIT)
          this.handleToast(newScheduleId)
        })
        break
      // 编辑：循环日程修改了【重复】或【截止】
      case detail.recurrenceType !== recurrenceType ||
        !noChangeRecurrenceRule(recurrenceRule, detail.recurrenceRule) ||
        detail.deadline !== deadline:
        ActionSheet.open({
          ...defaultModalProps,
          options: [{ label: '确定' }],
          header: this.renderActionSheetHeader(
            '该日程为循环日程，本次编辑将应用到所有日程中，确定保存吗?'
          ),
          confirmCallback: async () => {
            await this.notice(async () => {
              newScheduleId = await createSchedule(EEditType.EDIT_RECURRENT)
              this.handleToast(newScheduleId)
            })
          }
        })
        break
      // 编辑：循环日程未修改【重复】和【截止】
      default:
        ActionSheet.open({
          ...defaultModalProps,
          options: [{ label: '仅修改该日程' }, { label: '修改所有日程' }],
          header: this.renderActionSheetHeader('该日程为循环日程'),
          confirmCallback: async (_, index) => {
            await this.notice(async () => {
              newScheduleId = await createSchedule(
                index === 0 ? EEditType.EDIT : EEditType.EDIT_RECURRENT
              )
              this.handleToast(newScheduleId)
            })
          }
        })
        break
    }
  }

  public handleToast = (newScheduleId: string) => {
    const { navigation, store } = this.props
    const { refresh = () => {} } = (navigation.state as any).params || {}
    const { scheduleId, appKey } = store

    if (newScheduleId) {
      toast.open(scheduleId ? '保存成功' : '创建成功')
      navigation.back()
      refresh(newScheduleId, appKey)
    }
  }

  public handleCancel = () => {
    Keyboard.dismiss()
    const { navigation, store } = this.props
    const { noChangeSchedule } = store
    if (noChangeSchedule()) {
      navigation.back()
    } else {
      ActionSheet.open({
        ...defaultModalProps,
        options: [{ label: '确定' }],
        header: this.renderActionSheetHeader('本次编辑还未保存，确定退出吗'),
        confirmCallback: () => {
          navigation.back()
        }
      })
    }
  }

  public render() {
    const { store } = this.props
    const { scheduleId } = store
    return (
      <NavBar.Custom
        navStyles={styles.nav}
        titleElement={<Text style={styles.title}>{scheduleId ? '编辑日程' : '创建日程'}</Text>}
        cornerRightElement={
          <Text style={styles.text} onPress={this.handleConfirm}>
            完成
          </Text>
        }
        cornerLeftElement={
          <Text style={styles.text} onPress={this.handleCancel}>
            取消
          </Text>
        }
      />
    )
  }
}
