/* eslint-disable react/no-children-prop */
import React from 'react'
import { View, Text, TouchableHighlight, NativeModules } from '@mrn/react-native'
import { CommonFlexStyles, CommonTextStyles } from '@src/common/styles'
import { IConflictItem } from '@src/pages/Busy/util'
import { IconFont } from '../IconFont'
import { Avatar } from '../Avatar'
import styles from './style'

const { UIManager } = NativeModules
interface IBusyAttendeeItemProps {
  attendee: IConflictItem
  width: number
  index: number
  nConflict: boolean
  setPopInfos?: (centerX: number, empId: string, index: number) => void // 设置PopOver的中心点和成员ID
}

export default class BusyAttendeeItem extends React.PureComponent<IBusyAttendeeItemProps> {
  itemClick = e => {
    const {
      setPopInfos,
      index,
      attendee: { empId }
    } = this.props
    // UIManager.
    UIManager.measure(e.target, (x, y, width: number, height, left: number, top) => {
      // console.log('x:' + x)
      // console.log('y:' + y)
      // console.log('width:' + width)
      // console.log('height:' + height)
      // console.log('left:' + left)
      // console.log('top:' + top)
      console.log(x, y, height, top)
      // console.log(Math.floor(left + width / 2))
      setPopInfos && setPopInfos(Math.floor(left + width / 2), empId, index)
    })
  }

  render() {
    const { attendee, width, nConflict } = this.props
    return (
      <TouchableHighlight
        underlayColor='#FFF'
        style={[styles.busyItemContanier, { width }]}
        onPress={this.itemClick}
      >
        <View style={[styles.infoContanier, CommonFlexStyles.flexColumn]}>
          <View style={styles.contentAll}>
            <View style={styles.busyAvatarContanier}>
              <Avatar img={attendee.avatar} width={36} />
            </View>
            {nConflict && <IconFont icon='dx-calwarning_calendar' style={styles.conflictIcon} />}
          </View>
          <Text numberOfLines={1} style={[styles.busyName, CommonTextStyles.nameText]}>
            {attendee.name}
          </Text>
        </View>
      </TouchableHighlight>
    )
  }
}
