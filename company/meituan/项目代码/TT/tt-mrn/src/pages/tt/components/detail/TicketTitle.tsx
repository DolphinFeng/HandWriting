/**
 * SLA 状态变化
 */

import React, { Component, Fragment } from 'react'
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  Keyboard
} from '@mrn/react-native'
import { dStyle } from '../../constants/TTStyle'
import { TicketDetail } from '../../constants/TTServiceModule'
import { updateTicket } from '../../constants/TTApi'
import { TopViewManager, Toast } from '@ss/mtd-react-native'
import edit from '@images/edit-o.png'
import { openTitleEditorModal } from './edit/EditTitle'
import { TTDetailContext } from './DetailContext'
import { ttTrackDetailClick, TTKeys } from '../../constants/TTKeys'
interface IProps {
  // data: TicketDetail
  // ticketId: number
  // callback: ({name, desc}) => void
}

interface IState {
  //  currentName: string
}
export class TicketTitle extends Component<IProps, IState> {
  static contextType = TTDetailContext
  context!: React.ContextType<typeof TTDetailContext>

  instance: TopViewManager

  constructor(props: IProps, context) {
    super(props, context)
    this.state = {
      // currentName: this.context.ticketDetail.name
    }
  }

  render() {
    const { name } = this.context.ticketDetail
    const showEditButton =
      name && this.context.ticketOperate?.detailOperate?.name === 'editable'

    return (
      <View style={dStyle.DescWrapper}>
        <Text style={dStyle.DescFont24}>{name}</Text>
        {showEditButton ? (
          <TouchableOpacity style={dStyle.Edit} onPress={this.onEdit}>
            <Image source={edit} style={dStyle.editIcon} />
          </TouchableOpacity>
        ) : null}
      </View>
    )
  }

  onEdit = () => {
    const { ticketDetail, handleTicketDetail } = this.context
    const instance = openTitleEditorModal({
      ticketId: ticketDetail.id,
      title: ticketDetail.name,
      onCancel: () => {
        instance.close()
      },
      onFinish: newTitle => {
        instance.close()
        updateTicket(ticketDetail.id, { name: newTitle })
          .then(res => {
            if (res?.code === 200) {
              // this.setState({currentName: newTitle})
              handleTicketDetail({ ...ticketDetail, name: newTitle })
            }
          })
          .catch(e => {})
        ttTrackDetailClick(TTKeys.DetailClick.editTitle)
      }
    })
  }
}
