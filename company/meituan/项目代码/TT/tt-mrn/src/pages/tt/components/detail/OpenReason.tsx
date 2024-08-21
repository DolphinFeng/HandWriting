import { i18nClient } from '@sailor/i18n-mrn'
/**
 * 重新打开增加原因
 */

import React, { Component } from 'react'
import { Text, View, Image, TouchableOpacity, Keyboard, Dimensions } from '@mrn/react-native'
import { dStyle } from '../../constants/TTStyle'
import { TicketDetail } from '../../constants/TTServiceModule'
import { updateTicket, addScore } from '../../constants/TTApi'
import { TopViewManager, Toast, Input, Button, SlideModal } from '@ss/mtd-react-native'
import { lengthOf } from '../common/TTHelper'
import SafeModalContainer from '@src/components/SafeModalContainer'
interface IProps {
  ticketId: number
  onCancel: () => void
  onSubmitSuccess: (info) => void
}

interface IState {
  suggest: string
}

const { width, height } = Dimensions.get('screen')
const MAX_SUGGEST_LENGTH = 300
export class OpenReason extends Component<IProps, IState> {
  instance: TopViewManager
  isSuggestInputValid: boolean = true

  constructor(props: IProps) {
    super(props)

    this.state = {
      suggest: '',
    }
  }

  componentDidMount() {}
  render() {
    return <>{this.renderSatisfyBody()}</>
  }

  renderSatisfyBody() {
    return (
      <SafeModalContainer>
        <View style={dStyle.satisfyWrapper}>
          <TouchableOpacity style={dStyle.cancel} onPress={() => this.props.onCancel()}>
            <Text style={dStyle.FontRegul16}>
              {i18nClient.t('components_detail_625fb2', { defaultValue: '取消' })}
            </Text>
          </TouchableOpacity>
          <Text style={dStyle.FontBold16}>
            {i18nClient.t('components_detail_ee8f81', { defaultValue: '重新处理' })}
          </Text>
        </View>
        <View style={[dStyle.ticketDivider1, { marginBottom: 12 }]} />
        <Text style={[dStyle.Font14by84, { marginLeft: 16 }]}>
          {i18nClient.t('components_detail_0fc9b0', { defaultValue: '重新处理的原因：' })}
        </Text>
        <View style={{ height: 100, marginTop: 8, marginHorizontal: 16 }}>
          <Input
            styles={{
              textInput: dStyle.inputTxt,
            }}
            value={this.state.suggest}
            onChange={this.handleNewInputChange}
            multiline
            autoFocus={true}
            maxLength={500}
            placeholder={i18nClient.t('components_detail_411270', {
              defaultValue: '请输入重新处理的原因，最多可输入300字符',
            })}
            clearButtonMode={false}
          />
        </View>

        {this.renderCommitButton()}
      </SafeModalContainer>
    )
  }

  handleNewInputChange = (txt: string) => {
    const length = lengthOf(txt)
    this.isSuggestInputValid = length > 0 && length <= MAX_SUGGEST_LENGTH
    this.setState({ suggest: txt })
  }

  renderCommitButton() {
    const commitEnable = true
    const txtColor = commitEnable ? 'rgba(0,0,0,0.84)' : 'rgba(0,0,0,0.36)'
    const btnColor = commitEnable ? '#FFC300' : '#FFE9A3'
    return (
      <View style={{ marginVertical: 16, alignItems: 'center' }}>
        <Button
          type="primary"
          disabled={!commitEnable}
          style={[dStyle.satisfyBtn, { backgroundColor: btnColor }]}
          styles={{
            tapBackgroundColor: {
              primary: '#FFC300',
            },
          }}
          onPress={() => {
            if (this.isSuggestInputValid) {
              this.props.onSubmitSuccess(this.state.suggest)
            } else {
              Toast.open(
                i18nClient.t('components_detail_1aaeb2', {
                  defaultValue: '建议长度不应超过300个字符或150个汉字',
                }),
              )
            }
          }}
        >
          <Text style={{ color: txtColor }}>
            {i18nClient.t('components_home_38cf16', { defaultValue: '确定' })}
          </Text>
        </Button>
      </View>
    )
  }
}
