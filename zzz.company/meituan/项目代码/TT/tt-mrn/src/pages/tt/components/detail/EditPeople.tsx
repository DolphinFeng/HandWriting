/**
 * 处理人
 */

import React, { Component } from 'react'
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  Keyboard
} from '@mrn/react-native'
import { dStyle } from '../../constants/TTStyle'
import { TicketDetail, RootTree } from '../../constants/TTServiceModule'
import { updateTicket } from '../../constants/TTApi'
import down from '@images/down-white.png'
import { TopViewManager, Toast } from '@ss/mtd-react-native'
interface IProps {
  data: Array<RootTree>
}

interface IState {}
export class EditPeople extends Component<IProps, IState> {
  instance: TopViewManager

  constructor(props: IProps) {
    super(props)

    this.state = {}
  }

  componentDidMount() {}

  render() {
    return <View style={{ flexDirection: 'row' }} />
  }
}
